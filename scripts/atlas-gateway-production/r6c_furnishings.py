#!/usr/bin/env python3
"""ART-DIR-02 R6C — actual Poly Haven CC0 plants and modular bookcases,
two distinct botanical families and planters, banners, no atrium rebuild.
"""
import bpy,math,json,hashlib,sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def opt(k):
    if k not in args:raise RuntimeError("Missing "+k)
    return Path(args[args.index(k)+1]).resolve()
OUT=opt("--out");OUT.mkdir(parents=True,exist_ok=True)
ASSETS=opt("--assets")
SOURCE=Path(bpy.data.filepath)
if SOURCE.name!="atlas-art-dir02-gallery-finishings-r5.blend":
    raise RuntimeError("R6C source must be the genuine qualified R5 blend")
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for data in iter(lambda:f.read(1024*1024),b""):h.update(data)
    return h.hexdigest()
manifest=json.loads((ASSETS/"r6c-source-assets.json").read_text())
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise RuntimeError("R5 HERO missing")
camera=(list(hero.location),list(hero.rotation_euler),hero.data.lens)
names=("Curricolo","Esplora","Percorsi","Esperienze")
def portals():
    return {n:(list(bpy.data.objects["Portale • "+n].location),
               list(bpy.data.objects["Portale • "+n].rotation_euler),
               list(bpy.data.objects["Portale • "+n].scale)) for n in names}
roots_before=portals()
scene=bpy.context.scene
def mat(name,color,metal,rough,glow=None,power=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,1)
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    if glow:
        e=bs.inputs.get("Emission Color") or bs.inputs.get("Emission")
        if e:e.default_value=(*glow,1)
        s=bs.inputs.get("Emission Strength")
        if s:s.default_value=power
    return m
bronze=mat("ATLAS R6C • satin champagne planter bronze",(.41,.31,.19),.7,.35)
cloth=mat("ATLAS R6C • deep indigo banner fabric",(.012,.028,.070),.08,.72)
gold=mat("ATLAS R6C • warm satin emblem",(.73,.50,.19),.55,.28)
dark=mat("ATLAS R6C • bronze shelving recess",(.026,.038,.052),.26,.62)
def assign(obj,material):
    obj.data=obj.data.copy();obj.data.materials.clear();obj.data.materials.append(material)

# Import publisher-authored meshes, then instance sources instead of duplicating
# geometry. Apply decimation once to source objects, not to each placed instance.
target_triangles={"pachira_aquatica_01":23000,
                  "potted_plant_02":18000,
                  "wooden_display_shelves_01":6000}
collections={}
asset_evidence={}
for ident,cap in target_triangles.items():
    info=manifest["assets"].get(ident)
    if not info:raise RuntimeError("Missing qualified official source "+ident)
    filename=Path(info["file"])
    if not filename.is_file() or sha(filename)!=info["sha256"]:
        raise RuntimeError("Publisher model source hash mismatch "+ident)
    for d in info["dependencies"]:
        file=Path(d["path"])
        if not file.exists() or sha(file)!=d["sha256"]:
            raise RuntimeError("Publisher model dependency hash mismatch "+ident)
    old=set(bpy.data.objects.keys())
    bpy.ops.import_scene.gltf(filepath=str(filename))
    imported=[ob for ob in bpy.data.objects if ob.name not in old]
    meshes=[o for o in imported if o.type=="MESH"]
    if not meshes:raise RuntimeError("Asset import has no actual mesh "+ident)
    def tris(o):return sum(max(0,len(p.vertices)-2) for p in o.data.polygons)
    original=sum(tris(o) for o in meshes)
    if original<=0:raise RuntimeError("Model contains no surface triangles "+ident)
    ratio=min(1.0,cap/original)
    if ratio<.98:
        bpy.ops.object.select_all(action="DESELECT")
        for o in meshes:
            if not len(o.data.polygons):continue
            o.data=o.data.copy()
            try:
                bpy.context.view_layer.objects.active=o;o.select_set(True)
                m=o.modifiers.new("ATLAS R6C • web-facing lightweight LOD","DECIMATE")
                m.ratio=ratio
                bpy.ops.object.modifier_apply(modifier=m.name)
                o.select_set(False)
            except Exception as exc:
                raise RuntimeError("Cannot safely decimate official "+ident+": "+str(exc)[:200])
    reduced=sum(tris(o) for o in meshes)
    if reduced>cap*1.25:
        raise RuntimeError("LOD exceeds useful triangle cap "+ident+": "+str(reduced))
    collection=bpy.data.collections.new("ATLAS R6C • CC0 source "+ident)
    for o in imported:
        collection.objects.link(o)
        for oldcol in tuple(o.users_collection):
            if oldcol!=collection:oldcol.objects.unlink(o)
    bpy.context.view_layer.update()
    box=[o.matrix_world@Vector(c) for o in meshes for c in o.bound_box]
    low=Vector((min(v.x for v in box),min(v.y for v in box),min(v.z for v in box)))
    high=Vector((max(v.x for v in box),max(v.y for v in box),max(v.z for v in box)))
    size=high-low
    if min(size.x,size.y,size.z)<=.00001:
        raise RuntimeError("Official model bounding box invalid "+ident)
    collection.instance_offset=((low.x+high.x)/2,(low.y+high.y)/2,low.z)
    collections[ident]=(collection,size)
    asset_evidence[ident]={
        "source":info["source_page"],"license":info["license"],
        "source_sha256":info["sha256"],"source_triangles":original,
        "LOD_triangles":reduced,"source_dimensions_bu":list(size),
        "dependency_count":len(info["dependencies"])}
def instance(label,ident,x,y,z,height,rotation=0):
    collection,sz=collections[ident]
    o=bpy.data.objects.new("ATLAS R6C • "+label,None)
    scene.collection.objects.link(o)
    o.instance_type="COLLECTION";o.instance_collection=collection
    factor=height/sz.z
    o.scale=(factor,factor,factor)
    o.location=(x,y,z)
    o.rotation_euler.z=rotation
    return o.name
def planter(label,x,y,z,rx,ry,h):
    # Economical elegant custom shape adapting the CC0 plants; the flora
    # itself is professionally sourced. One reusable 48-segment planter mesh.
    verts=[];faces=[];count=48
    for height,f in ((0.,.87),(h,.99)):
        for j in range(count):
            a=math.tau*j/count
            verts.append((rx*f*math.cos(a),ry*f*math.sin(a),height))
    for j in range(count):
        jj=(j+1)%count;faces.append((j,jj,count+jj,count+j))
    faces.append(tuple(range(count,count*2)))
    mesh=bpy.data.meshes.new("ATLAS R6C • planter geometry "+label)
    mesh.from_pydata(verts,[],faces);mesh.update()
    mesh.materials.append(bronze)
    o=bpy.data.objects.new("ATLAS R6C • satin metal planter "+label,mesh)
    scene.collection.objects.link(o);o.location=(x,y,z)
    bevel=o.modifiers.new("ATLAS R6C • polished edge","BEVEL")
    bevel.width=.045;bevel.segments=3
    o.modifiers.new("ATLAS R6C • weighted normals","WEIGHTED_NORMAL")
    return o.name

# Preserve the R4/R5 source meshes but hide ALL previous reuses; genuinely new
# botanical families are strictly separated instead of upscaling succulents.
hidden=[]
for ob in list(scene.objects):
    if ob.name.startswith(("ATLAS R4 • prefabricated CC0 plant",
                           "ATLAS R5 • upper gallery reused CC0 plant",
                           "ARCH04 • raised botanical planter",
                           "ARCH04 • planter brushed bronze edge")):
        ob.hide_render=True;hidden.append(ob.name)
if len(hidden)<8:raise RuntimeError("R5 botanical fixtures not found")
placed={"tall_tree":[],"ground_shrub":[],"bookcase":[],"upper_gallery":[]}
vases=[]
for sign in (-1,1):
    x=sign*9.12;y=-1.65
    vases.append(planter("tall "+str(sign),x,y,-.02,.54,.53,1.02))
    placed["tall_tree"].append(instance("CC0 indoor tree "+str(sign),"pachira_aquatica_01",
                                        x,y,1.02,1.95,.13*sign))
    # Big foreground planter may be partially cropped like the ART-DIR image.
    xx=sign*7.65;yy=-6.1
    vases.append(planter("low "+str(sign),xx,yy,-.02,1.45,.90,.48))
    placed["ground_shrub"].append(instance("CC0 decorative shrub "+str(sign),"potted_plant_02",
                                          xx,yy,.45,.83,.43*sign))
    # Original upper small greenery also receives the genuinely smaller
    # botanical family, with only a restrained instance size.
    placed["upper_gallery"].append(instance("small potted plant upper "+str(sign),
                                           "potted_plant_02",sign*7.65,9.03,5.38,.56,.23*sign))
    # Import ONE genuine CC0 shelving module and place two instances per side.
    for level,z in enumerate((2.78,5.49)):
        placed["bookcase"].append(instance("CC0 modular shelving "+str(sign)+" "+str(level),
                                           "wooden_display_shelves_01",
                                           sign*4.72,11.25,z,1.73,.055*sign))

# Refinish genuine banner geometries; no extra billboard or floating text.
banners=[]
for o in scene.objects:
    if o.name.startswith("ARCH04 • restrained side exhibition banner") and o.type=="MESH":
        assign(o,cloth);banners.append(o.name)
if len(banners)!=2:raise RuntimeError("Two authentic architectural banners missing")
for sign in (-1,1):
    text=bpy.data.curves.new("ATLAS R6C • A emblem in banner "+str(sign),"FONT")
    text.body="A";text.align_x="CENTER";text.align_y="CENTER"
    text.size=.58;text.extrude=.003
    text.materials.append(gold)
    ob=bpy.data.objects.new("ATLAS R6C • satin A on banner "+str(sign),text)
    scene.collection.objects.link(ob)
    ob.location=(sign*9.65,4.975,4.36)
    ob.rotation_euler=(math.pi/2,0,0)
# Warm reflected source in two existing dark library recesses.
lights=[]
for sign in (-1,1):
    l=bpy.data.lights.new("ATLAS R6C • soft hidden library glow","AREA")
    l.energy=110;l.color=(1,.71,.39);l.shape="DISK";l.size=1.75
    ob=bpy.data.objects.new("ATLAS R6C • hidden library light "+str(sign),l)
    scene.collection.objects.link(ob)
    ob.location=(sign*4.72,10.8,4.50)
    ob.rotation_euler=(Vector((sign*4.72,11.5,4.15))-ob.location).to_track_quat("-Z","Y").to_euler()
    lights.append(ob.name)

if roots_before!=portals():raise RuntimeError("Original portal transforms changed")
if camera!=(list(hero.location),list(hero.rotation_euler),hero.data.lens):
    raise RuntimeError("HERO camera changed")
if [len(placed[k]) for k in ("tall_tree","ground_shrub","bookcase","upper_gallery")]!=[2,2,4,2]:
    raise RuntimeError("Architectural furniture placement incomplete")
scene.camera=hero
bpy.ops.file.pack_all()
candidate=OUT/"atlas-r6c-furnishings.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(candidate))
report={"schema":"atlas.art-dir02.r6c-furnishings/v1",
 "state":"TECHNICAL_CANDIDATE__ART_NOT_APPROVED",
 "source_r5_sha256":sha(SOURCE),"candidate_blend_sha256":sha(candidate),
 "official_cc0_assets":asset_evidence,"instances_by_family":placed,
 "new_planters":vases,"hidden_old_foliage_and_vases":hidden,
 "existing_banners_finished":banners,"background_lights":lights,
 "portal_roots_unchanged":True,"hero_camera_unchanged":True,
 "human_art_approved":False,"no_publication":True,"renders":{}}
detail=bpy.data.objects.new("CAM_ATLAS_R6C_FURNISHINGS_DETAIL",
                           bpy.data.cameras.new("CAM_ATLAS_R6C_FURNISHINGS_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(0,-11.2,2.20)
detail.rotation_euler=(Vector((5.0,-1.2,2.40))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=33
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for key,cam,w,h,n in (("hero",hero,1152,648,24),
                      ("furnishings",detail,896,504,16)):
    scene.camera=cam
    scene.render.resolution_x=w;scene.render.resolution_y=h;scene.cycles.samples=n
    img=OUT/("atlas-r6c-"+key+".png")
    scene.render.filepath=str(img);bpy.ops.render.render(write_still=True)
    if not img.is_file() or img.stat().st_size<10000:
        raise RuntimeError("Missing actual Cycles render "+key)
    report["renders"][key]={"file":img.name,"sha256":sha(img),"bytes":img.stat().st_size,"size_px":[w,h]}
(OUT/"atlas-r6c-receipt.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print("ATLAS_R6C_COMPLETE",json.dumps({"CC0":{k:v["LOD_triangles"] for k,v in asset_evidence.items()},
 "instances":{k:len(v) for k,v in placed.items()},"vases":len(vases),"banners":len(banners)}))
