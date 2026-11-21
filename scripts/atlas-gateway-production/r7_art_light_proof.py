#!/usr/bin/env python3
"""ART-DIR-02 R7 — one focused artistic-lighting candidate on genuine R6ABCD.
E-01: hide radial vault strips and reveal one warm sky opening with soft shafts.
E-02: deepen 4 blue glasses and manage specular bloom, preserve sole metal bases.
Also restores dark reflective Onyx floor without replacing its genuine CC0 maps.
No render plane, alternate camera, asset reload, procedural impostor plant or deploy.
"""
import bpy, math, json, hashlib, sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args:raise RuntimeError("Missing --out")
OUT=Path(args[args.index("--out")+1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
if SRC.name!="atlas-art-dir02-r6abcd-integrated.blend":
    raise RuntimeError("Real qualified R6ABCD .blend required")
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
EXPECTED="33768584496e16b7a545f236b6ac3a5da3231358547870f03f79815f54c0fa4d"
if sha(SRC)!=EXPECTED:raise RuntimeError("R6ABCD exact SHA mismatch")
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
floor=bpy.data.objects.get("Atrio • pavimento lapideo")
canopy=bpy.data.objects.get("ATLAS ARCH04 • low elliptical convex canopy")
if not all((hero,sky,floor,canopy)):raise RuntimeError("R6ABCD geometry missing")
portal_names=("Curricolo","Esplora","Percorsi","Esperienze")
roots={}
for name in portal_names:
    obj=bpy.data.objects.get("Portale • "+name)
    if not obj:raise RuntimeError("Portale root absent: "+name)
    roots[name]={"location":list(obj.location),"rotation":list(obj.rotation_euler),
                 "scale":list(obj.scale)}
camera={"location":list(hero.location),"rotation":list(hero.rotation_euler),
        "lens":hero.data.lens}
def pbr(name,base,metal=.05,rough=.5,trans=.0,emit=None,strength=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*base,1)
    p.inputs["Metallic"].default_value=metal
    p.inputs["Roughness"].default_value=rough
    if trans:
        sock=p.inputs.get("Transmission Weight") or p.inputs.get("Transmission")
        if not sock:raise RuntimeError("Missing glass transmission control")
        sock.default_value=trans
    if emit:
        sock=p.inputs.get("Emission Color") or p.inputs.get("Emission")
        if sock:sock.default_value=(*emit,1)
        sock=p.inputs.get("Emission Strength")
        if sock:sock.default_value=strength
    return m
dark=pbr("ATLAS R7 • unbroken midnight-blue rear vault",
         (.012,.019,.034),.015,.84)
bronzedark=pbr("ATLAS R7 • almost invisible oculus housing",
               (.032,.045,.072),.26,.47)
gold=pbr("ATLAS R7 • continuous restrained warm skylight rim",
         (.37,.24,.075),.34,.28,emit=(1,.57,.22),strength=2.15)
blue=pbr("ATLAS R7 • blue depth glass neutral reflected",
         (.005,.023,.081),.045,.16,.13,emit=(.007,.063,.17),strength=.15)
frame=pbr("ATLAS R7 • gentle warm glass perimeter",
          (.40,.25,.100),.22,.35,emit=(1,.59,.26),strength=1.38)
dome=pbr("ATLAS R7 • composed blue night ATLAS canopy",
         (.006,.026,.077),.28,.36)
def setmat(o,m):
    if o.type!="MESH":raise RuntimeError("Not a mesh "+o.name)
    o.data=o.data.copy();o.data.materials.clear();o.data.materials.append(m)

# Hidden R6 radial alternations are retained as editable archival meshes.
roof=[]
for o in scene.objects:
    if o.name.startswith("ARCH04 • separated skylight roof glass"):
        o.hide_render=True
        roof.append(o.name)
if len(roof)!=18:raise RuntimeError("Expected exactly 18 inherited roof panels")
# Recreate *one* curved rear intradosso that follows the professional ARCH04
# vault_z profile and replaces the repeated panel contrast in the HERO.
verts=[];faces=[];na=90;nr=11
for ir in range(nr):
    r=5.56+(11.52-5.56)*ir/(nr-1)
    q=(max(6.85,r)-6.85)/(11.55-6.85)
    z=8.44-1.17*q*q-.023
    for ia in range(na+1):
        a=-math.pi/2+math.pi*ia/na
        verts.append((r*math.sin(a),1.3+r*math.cos(a),z))
for ir in range(nr-1):
    for ia in range(na):
        index=ir*(na+1)+ia
        faces.append((index,index+na+1,index+na+2,index+1))
mesh=bpy.data.meshes.new("ATLAS R7 • continuous upper vault surface")
mesh.from_pydata(verts,[],faces);mesh.update();mesh.materials.append(dark)
ob=bpy.data.objects.new("ATLAS R7 • continuous dark rear vault",mesh)
scene.collection.objects.link(ob)
for face in ob.data.polygons:face.use_smooth=True
# Old half-crown is visually insufficient; a physically continuous dark collar
# and a SINGLE warm visible rim are used, with no extra steel ribs or layers.
oldcorona=[]
for o in scene.objects:
    if o.name.startswith("ARCH04 • monumental oculus corona"):
        o.hide_render=True;oldcorona.append(o.name)
# dark metal annulus, tiny width, fully surrounding the original circular sky.
n=160;v=[];f=[]
for j in range(n):
    a=math.tau*j/n
    for r in (5.385,5.66):
        v.append((r*math.cos(a),1.3+r*math.sin(a),8.455))
for j in range(n):
    f.append((2*j,2*(j+1)% (2*n), (2*(j+1)+1)%(2*n),2*j+1))
cmesh=bpy.data.meshes.new("ATLAS R7 • skylight dark collar mesh")
cmesh.from_pydata(v,[],f);cmesh.update();cmesh.materials.append(bronzedark)
collar=bpy.data.objects.new("ATLAS R7 • one dark skylight collar",cmesh)
scene.collection.objects.link(collar)
circle=bpy.data.curves.new("ATLAS R7 • one continuous warm rim geometry","CURVE")
circle.dimensions="3D";circle.resolution_u=2;circle.bevel_depth=.031
circle.bevel_resolution=2
spline=circle.splines.new("POLY");spline.points.add(n-1);spline.use_cyclic_u=True
for j,p in enumerate(spline.points):
    a=math.tau*j/n
    p.co=(5.51*math.cos(a),1.3+5.51*math.sin(a),8.486,1)
circle.materials.append(gold)
rim=bpy.data.objects.new("ATLAS R7 • ONE golden oculus light seam",circle)
scene.collection.objects.link(rim)

# Preserve original packed sky cloud image and source R6A shader graph;
# lightness adjustment is confined to the emission and colour intensity.
skymat=sky.active_material
if not skymat or not skymat.use_nodes:raise RuntimeError("Actual procedural sky absent")
skymat=skymat.copy();skymat.name="ATLAS R7 • brighter original cloud sky"
for node in skymat.node_tree.nodes:
    if node.bl_idname=="ShaderNodeEmission":
        node.inputs["Strength"].default_value=3.55
setmat(sky,skymat)
# Existing actual participating medium (7 authored cones) is amplified softly,
# never imitated by flat white planes or duplicated as laser beams.
fog=bpy.data.materials.get("PROOF • participating atmospheric shaft")
if not fog:raise RuntimeError("Authored participating atmospheric source absent")
fog=fog.copy();fog.name="ATLAS R7 • subtle zenital blue participating media"
volume=next((n for n in fog.node_tree.nodes
             if n.bl_idname=="ShaderNodeVolumePrincipled"),None)
if not volume:raise RuntimeError("No true volumetric scattering node")
volume.inputs["Density"].default_value=.045
if volume.inputs.get("Anisotropy"):
    volume.inputs["Anisotropy"].default_value=.60
shafts=[]
for o in scene.objects:
    if o.name.startswith("PROOF • atmospheric volume "):
        if o.type=="MESH":
            setmat(o,fog);shafts.append(o.name)
if len(shafts)!=7:raise RuntimeError("Expected seven already authored zenital volumes")
skylight=bpy.data.objects.get("PROOF • broad cool skylight")
if not skylight or skylight.type!="LIGHT":raise RuntimeError("Authored area skylight missing")
skylight.data=skylight.data.copy()
skylight.data.energy=2850
skylight.data.size=6.0
front=bpy.data.objects.get("PROOF • front soft fill")
if front and front.type=="LIGHT":
    front.data=front.data.copy();front.data.energy=390
for o in scene.objects:
    if o.name.startswith("ATLAS R6C • hidden library light") and o.type=="LIGHT":
        o.data=o.data.copy();o.data.energy=170
    if o.name.startswith("PROOF • gallery lamp") and o.type=="LIGHT":
        o.data=o.data.copy();o.data.energy=88

# Front-on cobalt read (no position/scale change, no new glass objects).
glasses=[]
for name in portal_names:
    pane=bpy.data.objects.get(name+" • vetro cobalto")
    frame_obj=bpy.data.objects.get(name+" • cornice continua")
    if not pane or not frame_obj:raise RuntimeError("Real pane or frame lost "+name)
    setmat(pane,blue)
    setmat(frame_obj,frame)
    glasses.append(pane.name)
# D existing 4 separate warm bases are left alone; R2 slit is not reworked.
bases=[o.name for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base")]
if len(bases)!=4:raise RuntimeError("Precisely 4 original R6D bases expected")
setmat(canopy,dome)

# R4 real sourced Onyx013 rough stone is made darker and more polished using
# copied nodes: preserve texture, normals and verifiable material identity.
fm=floor.active_material
if not fm or not fm.use_nodes:raise RuntimeError("Original PBR floor missing")
fm=fm.copy();fm.name="ATLAS R7 • dark polished authored Onyx013 floor"
tintnodes=[x for x in fm.node_tree.nodes if x.bl_idname=="ShaderNodeMixRGB"]
if not tintnodes:raise RuntimeError("Authentic R4 Onyx tint and maps lost")
tintnodes[0].inputs[0].default_value=.095
tintnodes[0].inputs[1].default_value=(.012,.031,.064,1)
for node in fm.node_tree.nodes:
    if node.bl_idname=="ShaderNodeMapRange":
        node.inputs["To Min"].default_value=.11
        node.inputs["To Max"].default_value=.23
setmat(floor,fm)

# Provenance and scene identity invariants
for name,orig in roots.items():
    o=bpy.data.objects["Portale • "+name]
    if (list(o.location)!=orig["location"] or
        list(o.rotation_euler)!=orig["rotation"] or list(o.scale)!=orig["scale"]):
        raise RuntimeError("Portale root moved in art proof "+name)
if (list(hero.location)!=camera["location"] or
    list(hero.rotation_euler)!=camera["rotation"] or hero.data.lens!=camera["lens"]):
    raise RuntimeError("HERO camera was changed")
cc0=[c.name for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(cc0)!=3:raise RuntimeError("Three original CC0 authored collections missing")
seams=[o for o in scene.objects if o.name.startswith("ATLAS R6B • physical floor seam")]
if len(seams)!=4:raise RuntimeError("Source R6B floor seams missing")
brand=bpy.data.objects.get("ATLAS ARCH04 • original logo on convex front")
if not brand or brand.hide_render:raise RuntimeError("Approved Atlas curved logo absent")

scene.camera=hero
bpy.context.view_layer.update()
bpy.ops.file.pack_all()
blend=OUT/"atlas-art-dir02-r7-light-and-blue-glass.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
receipt={
 "schema":"atlas.artdir02.r7-art-review/v1",
 "status":"REAL_ARTISTIC_CANDIDATE__AWAIT_HUMAN_COMPARISON",
 "source_r6abcd_sha256":sha(SRC),"blend_sha256":sha(blend),
 "original_hero_camera_unchanged":camera,"portal_roots_unchanged":roots,
 "original_licenced_cc0_collections":cc0,"original_4_r6d_bases":bases,
 "single_zenital_ring":rim.name,"single_curved_vault":ob.name,
 "old_radial_panels_hidden":roof,"old_corona_hidden":oldcorona,
 "authored_volumetric_shafts":shafts,"glass_targets":glasses,
 "source_onyx_texture_retained":True,
 "light_energy_skylight_w":skylight.data.energy,
 "no_merge":True,"no_publication":True,"human_art_approved":False,
 "renders":{}
}
# HERO at exactly the same camera/resolution as the R6ABCD baseline,
# same overall scene, with an additional detailed sky/portal visual.
detail=bpy.data.objects.new("CAM_ATLAS_R7_DETAIL",
    bpy.data.cameras.new("CAM_ATLAS_R7_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(1,-10.2,3.1)
detail.rotation_euler=(Vector((0,1.4,4.5))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=26
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,samples in (
    ("hero",hero,1152,648,32),("oculus-portals",detail,896,504,19)):
    scene.camera=cam;scene.cycles.samples=samples
    scene.render.resolution_x=w;scene.render.resolution_y=h
    target=OUT/("atlas-r7-"+label+".png")
    scene.render.filepath=str(target);bpy.ops.render.render(write_still=True)
    if not target.is_file() or target.stat().st_size<12000:
        raise RuntimeError("R7 has no actual Cycles render "+label)
    receipt["renders"][label]={"file":target.name,"size_px":[w,h],
                               "sha256":sha(target),"bytes":target.stat().st_size}
(OUT/"atlas-r7-receipt.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print("ATLAS_R7_ART_PROOF_COMPLETE",json.dumps({
    "roof_panel_archived":len(roof),"volumes":len(shafts),
    "authored_cc0_collections":len(cc0),"single_4_bases":len(bases),
    "glass":len(glasses),"art_approved":False}))
