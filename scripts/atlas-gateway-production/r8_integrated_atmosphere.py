#!/usr/bin/env python3
"""ART-DIR-02 R8 — one integrated optical correction to genuine R7.
Smaller visible oculus + continuous dark vault, deep gallery bays, legible
CC0 bookshelves, slightly monumental deep-blue existing portal geometry.
No new architecture, no root/camera translations, no external purchases.
"""
import bpy,math,hashlib,json,sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args:raise RuntimeError("Missing --out")
OUT=Path(args[args.index("--out")+1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
if SRC.name!="atlas-art-dir02-r7-light-and-blue-glass.blend":
    raise RuntimeError("R8 requires true R7 qualified Blender")
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""):h.update(chunk)
    return h.hexdigest()
EXPECTED="4fb946a52b2c2c15e1a42643cf210e9a45c77428c3b9c63bb557d36c6f8a71dc"
if sha(SRC)!=EXPECTED:raise RuntimeError("Verified R7 exact SHA256 mismatch")
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
vault=bpy.data.objects.get("ATLAS R7 • continuous dark rear vault")
collar=bpy.data.objects.get("ATLAS R7 • one dark skylight collar")
rim=bpy.data.objects.get("ATLAS R7 • ONE golden oculus light seam")
if not all((hero,sky,vault,collar,rim)):raise RuntimeError("R7 source objects missing")
original_camera=(list(hero.location),list(hero.rotation_euler),hero.data.lens)
names=("Curricolo","Esplora","Percorsi","Esperienze")
def portal_transforms():
    return {n:{"location":list(bpy.data.objects["Portale • "+n].location),
               "rotation":list(bpy.data.objects["Portale • "+n].rotation_euler),
               "scale":list(bpy.data.objects["Portale • "+n].scale)} for n in names}
original_roots=portal_transforms()
original_base_names=sorted(o.name for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base "))
if len(original_base_names)!=4:raise RuntimeError("Four genuine R6D metal bases missing")
cc0=[c.name for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(cc0)!=3:raise RuntimeError("Three genuine CC0 model libraries missing")

def pbr(name,color,metal=.04,rough=.4,trans=.0,emit=None,strength=0.):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*color,1)
    p.inputs["Metallic"].default_value=metal;p.inputs["Roughness"].default_value=rough
    if trans:
        s=p.inputs.get("Transmission Weight") or p.inputs.get("Transmission")
        if not s:raise RuntimeError("Principled transmission unavailable")
        s.default_value=trans
    if emit:
        s=p.inputs.get("Emission Color") or p.inputs.get("Emission")
        if s:s.default_value=(*emit,1)
        s=p.inputs.get("Emission Strength")
        if s:s.default_value=strength
    return m
def apply(ob,mat):
    if not ob or ob.type!="MESH":raise RuntimeError("Expected real mesh for material")
    ob.data=ob.data.copy()
    ob.data.materials.clear();ob.data.materials.append(mat)

# E01: shift the oculus from wide dominant oval towards the compact skylight
# in the reference. Work on the existing sky, FOUR slender genuine radial
# mullions, R7 collar/rim and curved canopy — never add steel.
cx,cy=0.,1.3
factor=.82
def shrink_xy(ob,factor):
    if ob.type=="MESH":
        ob.data=ob.data.copy()
        for v in ob.data.vertices:
            v.co.x=cx+(v.co.x-cx)*factor
            v.co.y=cy+(v.co.y-cy)*factor
    elif ob.type=="CURVE":
        ob.data=ob.data.copy()
        for spline in ob.data.splines:
            for point in spline.points:
                point.co.x=cx+(point.co.x-cx)*factor
                point.co.y=cy+(point.co.y-cy)*factor
    else:raise RuntimeError("Unexpected oculus type")
old_sky_radius=max(math.hypot(v.co.x-cx,v.co.y-cy) for v in sky.data.vertices)
shrink_xy(sky,factor)
new_sky_radius=max(math.hypot(v.co.x-cx,v.co.y-cy) for v in sky.data.vertices)
shrink_xy(collar,factor);shrink_xy(rim,factor)
mullions=[]
for ob in scene.objects:
    if ob.name.startswith("OCULUS ARCH04 • delicate radial mullion") and not ob.hide_render:
        shrink_xy(ob,factor);mullions.append(ob.name)
if len(mullions)!=4:raise RuntimeError("Four authentic thin sky mullions missing")
# Keep R7 curved roof, respace its existing radial vertices toward the
# reduced opening, without generating a second roof on top of it.
vault.data=vault.data.copy()
for vertex in vault.data.vertices:
    r=math.hypot(vertex.co.x-cx,vertex.co.y-cy)
    if r>0.01 and r<11.55:
        inner=5.56;outer=11.52
        new_r=max(4.58, 4.58+(r-inner)*(outer-4.58)/(outer-inner))
        ratio=new_r/r
        vertex.co.x=cx+(vertex.co.x-cx)*ratio
        vertex.co.y=cy+(vertex.co.y-cy)*ratio
if not 4.30<new_sky_radius<4.55:raise RuntimeError("Oculus outside visual guardrail")

# Grade the ORIGINAL packed sky texture: stronger cerulean blue without
# new generated images, new downloads or a flat replacement billboard.
sky_mat=sky.active_material
if not sky_mat or not sky_mat.use_nodes:
    raise RuntimeError("Missing packed original sky shader")
sky_mat=sky_mat.copy();sky_mat.name="ATLAS R8 • enriched original cloud sky"
tex=next((n for n in sky_mat.node_tree.nodes if n.bl_idname=="ShaderNodeTexImage"),None)
emit=next((n for n in sky_mat.node_tree.nodes if n.bl_idname=="ShaderNodeEmission"),None)
if not tex or not tex.image or not tex.image.packed_file or not emit:
    raise RuntimeError("Missing packed original cloud map")
hue=sky_mat.node_tree.nodes.new("ShaderNodeHueSaturation")
hue.inputs["Saturation"].default_value=1.40
hue.inputs["Value"].default_value=1.02
sky_mat.node_tree.links.new(tex.outputs["Color"],hue.inputs["Color"])
sky_mat.node_tree.links.new(hue.outputs["Color"],emit.inputs["Color"])
apply(sky,sky_mat)

# E03: the gallery bay panels are not white light boxes. The reference is
# dark blue-black architectural glass, with sparse embedded amber warmth.
shadow=pbr("ATLAS R8 • dark deep gallery recess",(.016,.026,.046),.035,.62)
amber=pbr("ATLAS R8 • faint amber book niche",(.047,.030,.019),.015,.59,
          emit=(.30,.14,.045),strength=.12)
bays=sorted((o for o in scene.objects if o.name.startswith("ARCH04 • recessed gallery bay")),key=lambda o:o.name)
if len(bays)<25:raise RuntimeError("Expected genuine two-level 14-bay galleries")
for k,o in enumerate(bays):
    apply(o,amber if k%6 in (1,4) else shadow)
smokeglass=pbr("ATLAS R8 • smoked gallery parapet",(.013,.028,.049),
               .018,.46,.09)
rails=[]
for o in scene.objects:
    if o.name.startswith("ARCH04 • genuine glass balustrade"):
        apply(o,smokeglass);rails.append(o.name)
if len(rails)<25:raise RuntimeError("Actual smoked glass balcony faces missing")

# Modern but subtle satin-blue metal trim; don't introduce new strips.
bronze=pbr("ATLAS R8 • subdued shadowed bronze trim",(.095,.067,.038),.40,.44)
strips=[]
for o in scene.objects:
    if o.name.startswith("ARCH04 • warm reveal within gallery"):
        apply(o,bronze);strips.append(o.name)
if len(strips)!=2:raise RuntimeError("Original two warm gallery reveals missing")
# Bring the ALREADY PURCHASE-FREE CC0 library models slightly forward, from
# behind the gallery back wall into the deeper shadowed recess.
shelves=[]
for o in scene.objects:
    if o.name.startswith("ATLAS R6C • CC0 modular shelving "):
        o.location.y-=.58
        o.scale=tuple(s*1.16 for s in o.scale)
        shelves.append(o.name)
if len(shelves)!=4:raise RuntimeError("Four genuine CC0 bookshelf instances missing")

# E02: real glass remains four physically separate curved-arc portal roots.
# Only enlarge the original four slab families about their local centers;
# do not move the roots or the R6D actual sole metal plinths.
darkblue=pbr("ATLAS R8 • deep laminated cobalt architectural glass",
             (.002,.011,.045),.035,.32,.025,
             emit=(.014,.065,.16),strength=.11)
warm=pbr("ATLAS R8 • thin warm portal perimeter",
         (.29,.19,.077),.28,.32,emit=(.92,.48,.17),strength=1.56)
changed=[]
for label in names:
    for part in ("telaio","retro","vetro cobalto","cornice continua"):
        ob=bpy.data.objects.get(label+" • "+part)
        if not ob or ob.type!="MESH":raise RuntimeError("Genuine portal slab missing "+label+" "+part)
        ob.data=ob.data.copy()
        for v in ob.data.vertices:
            v.co.x*=1.11
            v.co.z*=1.12
        if part=="vetro cobalto":
            ob.data.materials.clear();ob.data.materials.append(darkblue)
        elif part=="cornice continua":
            ob.data.materials.clear();ob.data.materials.append(warm)
        changed.append(ob.name)
if len(changed)!=16:raise RuntimeError("Four pane geometries must be updated consistently")
# The graphic/labels remain original: no second floating cards, no new text.
# The original four portal position/rotation/scale and R6D bases do not move.

# The large white rectangles are specular overexposure, not the
# intended luminous windows. Lower only frontal incidence and IOR reflection.
for mat,level in ((smokeglass,.08),(darkblue,.09)):
    shader=mat.node_tree.nodes.get("Principled BSDF")
    socket=shader.inputs.get("Specular") or shader.inputs.get("Specular IOR Level")
    if socket:socket.default_value=level
front=bpy.data.objects.get("PROOF • front soft fill")
if front and front.type=="LIGHT":
    front.data=front.data.copy()
    front.data.energy=230
canopy=bpy.data.objects.get("ATLAS ARCH04 • low elliptical convex canopy")
if canopy and canopy.active_material and canopy.active_material.use_nodes:
    canopy.data=canopy.data.copy()
    canopy_mat=canopy.active_material.copy()
    canopy_mat.name="ATLAS R8 • softer deep blue podium"
    shader=canopy_mat.node_tree.nodes.get("Principled BSDF")
    if shader:
        spec=shader.inputs.get("Specular") or shader.inputs.get("Specular IOR Level")
        if spec:spec.default_value=.15
        shader.inputs["Roughness"].default_value=.44
    canopy.data.materials.clear()
    canopy.data.materials.append(canopy_mat)

# Concentrate warmth in the real library rather than large white rectangles.
for o in scene.objects:
    if o.name.startswith("ATLAS R6C • hidden library light ") and o.type=="LIGHT":
        o.data=o.data.copy();o.data.energy=260
# The seven Cycles participating cones from the real atmospheric source are
# too regular in R7. Keep fewer varied physical cones, with a lower density.
fog=bpy.data.materials.get("ATLAS R7 • subtle zenital blue participating media")
if fog and fog.use_nodes:
    fog=fog.copy();fog.name="ATLAS R8 • dispersed light blue zenital atmosphere"
    vol=next((n for n in fog.node_tree.nodes if n.bl_idname=="ShaderNodeVolumePrincipled"),None)
    if vol:vol.inputs["Density"].default_value=.016
shafts=[]
for ob in scene.objects:
    if ob.name.startswith("PROOF • atmospheric volume "):
        # Keep only four of seven real physically participating cones.
        n=int(ob.name.rsplit(" ",1)[-1])
        ob.hide_render=n in (1,3,5)
        if not ob.hide_render and fog and ob.type=="MESH":
            apply(ob,fog)
            ob.scale.x*=1.18;ob.rotation_euler.y+=.037*(n-3)
            shafts.append(ob.name)
if len(shafts)!=4:raise RuntimeError("Four subdued real light shafts expected")

if portal_transforms()!=original_roots:raise RuntimeError("Portal root transforms changed")
if (list(hero.location),list(hero.rotation_euler),hero.data.lens)!=original_camera:
    raise RuntimeError("HERO camera changed")
if sorted(o.name for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base "))!=original_base_names:
    raise RuntimeError("Single metal bases missing")
if not bpy.data.objects.get("ATLAS ARCH04 • original logo on convex front"):
    raise RuntimeError("Approved original ATLAS logo missing")
floor=bpy.data.objects.get("Atrio • pavimento lapideo")
if not floor or not floor.active_material or "Onyx" not in floor.active_material.name:
    raise RuntimeError("Real CC0 Onyx stone no longer present")

scene.camera=hero;bpy.context.view_layer.update()
bpy.ops.file.pack_all()
candidate=OUT/"atlas-art-dir02-r8-integrated-atmosphere.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(candidate))
receipt={"schema":"atlas.artdir02.r8-integrated-visual/v1",
"state":"TECHNICAL_CANDIDATE__ARTIST_REVIEW_REQUIRED",
"source_r7_sha256":sha(SRC),"blend_sha256":sha(candidate),
"camera_unchanged":original_camera,"portal_roots_unchanged":original_roots,
"skylight_radius_before":old_sky_radius,"skylight_radius_after":new_sky_radius,
"four_original_oculus_mullions":mullions,
"gallery_bays_darkened":len(bays),"smoked_gallery_panels":len(rails),
"CC0_original_shelf_instances_adjusted":shelves,
"portal_original_geometries_adjusted":changed,
"original_four_thin_metal_bases":original_base_names,
"subtle_real_zenital_shafts":shafts,
"licenced_CC0_source_collections":cc0,
"human_art_approved":False,"no_merge":True,"no_publication":True,
"renders":{}}
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
detail=bpy.data.objects.new("CAM_ATLAS_R8_OCULUS_PORTALS_DETAIL",
  bpy.data.cameras.new("CAM_ATLAS_R8_OCULUS_PORTALS_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(0,-11.6,4.2)
detail.rotation_euler=(Vector((0,1.3,4.65))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=30
for name,cam,w,h,n in (("hero",hero,1152,648,28),
                        ("gallery-portals",detail,832,468,19)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=n
    img=OUT/("atlas-r8-"+name+".png")
    scene.render.filepath=str(img)
    bpy.ops.render.render(write_still=True)
    if not img.is_file() or img.stat().st_size<12000:
        raise RuntimeError("No genuine Cycles render "+name)
    receipt["renders"][name]={"file":img.name,"bytes":img.stat().st_size,
                              "sha256":sha(img),"size":[w,h]}
(OUT/"atlas-r8-receipt.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print("ATLAS_R8_COMPLETE",json.dumps({"oculus_r":new_sky_radius,
"gallery":len(bays),"glass_balconies":len(rails),"portals":len(changed),
"bookshelves":len(shelves),"CC0":len(cc0),"art_approved":False}))
