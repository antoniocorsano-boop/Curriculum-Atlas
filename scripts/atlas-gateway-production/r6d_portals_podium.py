#!/usr/bin/env python3
"""ART-DIR-02 R6D: four deep cobalt portals on ONE low metallic lit plinth each;
keep roots, glyphs, logos, R2 geometric provenance, cameras and dome topology.
"""
import bpy, json, hashlib, sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def option(s):
    if s not in args:raise RuntimeError("Missing "+s)
    return Path(args[args.index(s)+1]).resolve()
OUT=option("--out");OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
if SOURCE.name!="atlas-art-dir02-gallery-finishings-r5.blend":
    raise RuntimeError("R6D must start from the qualified R5 scene")
def digest(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise RuntimeError("R5 HERO missing")
camera=(list(hero.location),list(hero.rotation_euler),hero.data.lens)
names=("Curricolo","Esplora","Percorsi","Esperienze")
def transforms():
    return {n:{"location":list(bpy.data.objects["Portale • "+n].location),
                "rotation":list(bpy.data.objects["Portale • "+n].rotation_euler),
                "scale":list(bpy.data.objects["Portale • "+n].scale)} for n in names}
before=transforms()
def pbr(name,color,metal,rough,transmission=0,emission=None,strength=0):
    mat=bpy.data.materials.new(name);mat.diffuse_color=(*color,1)
    mat.use_nodes=True
    node=mat.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value=(*color,1)
    node.inputs["Metallic"].default_value=metal
    node.inputs["Roughness"].default_value=rough
    if transmission:
        socket=node.inputs.get("Transmission Weight") or node.inputs.get("Transmission")
        if not socket:raise RuntimeError("Missing Blender transmission input")
        socket.default_value=transmission
    if emission:
        e=node.inputs.get("Emission Color") or node.inputs.get("Emission")
        if e:e.default_value=(*emission,1)
        power=node.inputs.get("Emission Strength")
        if power:power.default_value=strength
    return mat
cobalt=pbr("ATLAS R6D • deep cobalt genuine glass",(.008,.040,.125),.06,.17,.37,
           (.035,.19,.42),.16)
brass=pbr("ATLAS R6D • brushed champagne bronze plate",(.37,.25,.105),.78,.27)
gold=pbr("ATLAS R6D • warm optical lip",(.49,.28,.07),.35,.24,0,(1.0,.58,.19),2.3)
night=pbr("ATLAS R6D • obsidian cobalt ellipsoid",(.006,.022,.065),.42,.16)
cool=pbr("ATLAS R6D • discreet blue edge reflection",(.048,.15,.23),.20,.28,0,
         (.11,.35,.70),.65)

def apply(o,mat):
    if not o or o.type!="MESH":raise RuntimeError("Missing compatible source mesh")
    o.data=o.data.copy()
    o.data.materials.clear();o.data.materials.append(mat)

def plate(name,root,mat,width,depth,thick,z,y):
    # One physical low-profile base. Rounded but deliberately not over-modeled.
    bpy.ops.mesh.primitive_cube_add(size=1)
    obj=bpy.context.object;obj.name=name
    obj.dimensions=(width,depth,thick)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    obj.parent=root
    obj.location=(0,y,z)
    obj.data.materials.append(mat)
    bevel=obj.modifiers.new("ATLAS R6D • soft brushed edge","BEVEL")
    bevel.width=.036;bevel.segments=3
    obj.modifiers.new("ATLAS R6D • normal weighting","WEIGHTED_NORMAL")
    return obj
def rim(name,root,y,z,width,depth,mat):
    # Just one restrained illuminated upper-edge path, part of the same base.
    curve=bpy.data.curves.new(name,"CURVE")
    curve.dimensions="3D";curve.resolution_u=2
    curve.bevel_depth=.012;curve.bevel_resolution=2
    poly=curve.splines.new("POLY");poly.points.add(4)
    pts=[
      (-width/2+.06,-depth/2+.06,z),(width/2-.06,-depth/2+.06,z),
      (width/2-.06,depth/2-.06,z),(-width/2+.06,depth/2-.06,z),
      (-width/2+.06,-depth/2+.06,z)
    ]
    for point,v in zip(poly.points,pts):point.co=(*v,1)
    curve.materials.append(mat)
    obj=bpy.data.objects.new(name,curve)
    scene.collection.objects.link(obj);obj.parent=root;obj.location.y=y
    return obj
hide_old=[]
for o in scene.objects:
    if o.name.startswith("PROOF R2 • fine slot lip "):
        o.hide_render=True;hide_old.append(o.name)

plinths=[]
pane_names=[]
for label in names:
    root=bpy.data.objects.get("Portale • "+label)
    if not root:raise RuntimeError("Missing portale "+label)
    pane=bpy.data.objects.get(label+" • vetro cobalto")
    frame=bpy.data.objects.get(label+" • cornice continua")
    if not pane or not frame:raise RuntimeError("Missing source glass or frame "+label)
    pane_names.append(pane.name)
    apply(pane,cobalt)
    # Original frame is genuine geometry; retain its topology, just warm the finish.
    apply(frame,gold)
    # root.z is -0.16; stone floor top is -0.04, hence relative floor plane +0.12
    # physical base reaches 0.035 BU above stone with low metal height.
    obj=plate("ATLAS R6D • sole luminous metal base "+label,root,brass,
              4.06,.86,.083,.158,-.125)
    rim("ATLAS R6D • integral base warm rim "+label,root,-.125,.202,
        4.06,.86,gold)
    plinths.append(obj.name)

# Refine existing elliptical low canopy and perimeter; NEVER retouch the approved logo mesh.
canopy=bpy.data.objects.get("ATLAS ARCH04 • low elliptical convex canopy")
if not canopy:raise RuntimeError("Genuine Atlas dome missing")
apply(canopy,night)
rings=[]
for o in list(scene.objects):
    if o.type=="MESH" and o.name.startswith((
      "ATLAS ARCH04 • one coherent light seam",
      "ATLAS ARCH04 • low outer bronze base",
      "ATLAS ARCH04 • shallow inner plinth",
      "ATLAS • bordo del podio"
    )):
        apply(o,gold if "light seam" in o.name or "bordo" in o.name else brass)
        rings.append(o.name)
if not rings:raise RuntimeError("Original podium perimeter missing")
if before!=transforms():raise RuntimeError("Portal roots moved")
if (list(hero.location),list(hero.rotation_euler),hero.data.lens)!=camera:
    raise RuntimeError("Baseline camera moved")
for obj in bpy.data.objects:
    if obj.name.startswith("ATLAS • logotipo approvato") and obj.hide_render:
        raise RuntimeError("Approved logo hidden")
if len(plinths)!=4 or len(hide_old)!=8:raise RuntimeError(
    "Exactly 4 plinths / 8 redundant old lips required, got "+str((len(plinths),len(hide_old))))
bpy.ops.file.pack_all()
scene.camera=hero
blend=OUT/"atlas-r6d-portals-podium.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
report={"schema":"atlas.art-dir02.r6d-portals/v1",
 "state":"CANDIDATE_TECHNICAL__HUMAN_ART_REVIEW_REQUIRED",
 "source_r5_sha256":digest(SOURCE),"candidate_blend_sha256":digest(blend),
 "portals_unchanged":before,"hero_camera_unchanged":True,
 "base_objects":plinths,"glass_objects":pane_names,
 "obsolete_slot_lips_hidden":hide_old,"podium_modified":canopy.name,
 "podium_rings":rings,"basement_design":"ONE metal low plate + optical line per portal; no boolean",
 "logo_original_untouched":True,"no_publication":True,"human_approved":False,
 "renders":{}}
detail=bpy.data.objects.new("CAM_ATLAS_R6D_BASES_DETAIL",bpy.data.cameras.new("CAM_ATLAS_R6D_BASES_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(0,-8.5,1.65)
detail.rotation_euler=(Vector((0,1.0,.65))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=36
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,samples in (("hero",hero,1152,648,25),
                               ("bases",detail,896,504,17)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    target=OUT/("atlas-r6d-"+label+".png")
    scene.render.filepath=str(target)
    bpy.ops.render.render(write_still=True)
    if not target.exists() or target.stat().st_size<10000:
        raise RuntimeError("No Cycles image "+label)
    report["renders"][label]={"file":target.name,"bytes":target.stat().st_size,
                              "sha256":digest(target),"size_px":[w,h]}
(OUT/"atlas-r6d-receipt.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print("ATLAS_R6D_COMPLETE",json.dumps({"portals":len(plinths),
 "old_lips_hidden":len(hide_old),"rings":len(rings),"status":"TECH_CANDIDATE"}))
