#!/usr/bin/env python3
"""ATLAS P2B/FINISH-01: material and photometric finish of approved P2A/R4.

This script does not change ANY existing object matrix, any existing mesh
vertex, portal arrangement, camera placement, floor slot, or gallery level.
It changes material datablocks, light energy and color, world ambience and
render quality; it saves a separately attributable derivative. Approval
of architectural direction is not approval of the finished art or WebGL.
"""
import bpy
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
from mathutils import Vector

ARGS=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(label):
    if label not in ARGS or ARGS.index(label)+1==len(ARGS):
        raise RuntimeError("Missing "+label)
    return ARGS[ARGS.index(label)+1]
def filehash(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for piece in iter(lambda:f.read(1<<20),b""):
            h.update(piece)
    return h.hexdigest()
source=Path(bpy.data.filepath).resolve()
dest=Path(arg("--out")).resolve()
dest.mkdir(parents=True,exist_ok=True)
parent=json.loads(Path(arg("--parent-receipt")).read_text(encoding="utf-8"))
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
if not (parent.get("schema")=="atlas.artdir02.p2a-art-direction-01/v1"
    and parent.get("canonical_art_sha256")==CANON
    and parent.get("selected_candidate")=="A Monumentale"
    and parent.get("floor_real_boolean")
    and parent.get("three_levels_preserved")
    and parent.get("portal_front_facing_hero")
    and len(parent.get("portal_targets",[]))==4
    and not parent.get("art_approved")
    and not parent.get("web_approved")
    and parent.get("no_merge") and parent.get("no_deploy")
    and source.name==parent["files"]["blend"]["name"]
    and filehash(source)==parent["files"]["blend"]["sha256"]):
    raise RuntimeError("Source is not approved-geometry, qualified P2A/R4 master")
source_sha=filehash(source)
scene=bpy.context.scene

def require(name,kind=None):
    q=bpy.data.objects.get(name)
    if not q or (kind and q.type!=kind):
        raise RuntimeError("Original architecture object missing: "+name)
    return q

# This fingerprint is before/after invariant for every existent spatial object.
# Mesh polygons and local XYZ are included so even a subtle vertex edit fails.
names_before=set(scene.objects.keys())
def spatial_fingerprint():
    data={}
    for ob in scene.objects:
        h=hashlib.sha256()
        for row in ob.matrix_world:
            for v in row: h.update(struct.pack("<d",float(v)))
        if ob.type=="MESH":
            h.update(struct.pack("<Q",len(ob.data.vertices)))
            h.update(struct.pack("<Q",len(ob.data.polygons)))
            for v in ob.data.vertices:
                for co in v.co:h.update(struct.pack("<d",float(co)))
            for p in ob.data.polygons:
                h.update(struct.pack("<Q",len(p.vertices)))
                for i in p.vertices:h.update(struct.pack("<I",i))
        data[ob.name]=h.hexdigest()
    return data

geometry_before=spatial_fingerprint()
roof=require("ATLAS P1F • padiglione lungo copertura monolitica","MESH")
skylight=require("ATLAS P1F • cielo unico del padiglione","MESH")
rim=require("ATLAS P1F • unico bordino lucernario","MESH")
floor=require("Atrio • pavimento lapideo","MESH")
first=require("ARCH04 • first gallery deck","MESH")
upper=require("ARCH04 • upper gallery deck","MESH")
camera=require("CAM_HERO_ARCH04","CAMERA")
portals=("Curricolo","Esplora","Percorsi","Esperienze")
for n in portals:
    require("Portale • "+n)
    require(n+" • vetro cobalto","MESH")
    require("ATLAS P2A • bordo luminoso "+n)
    require("ATLAS R6D • sole luminous metal base "+n)
if any(x.hide_render for x in (roof,skylight,rim,first,upper)):
    raise RuntimeError("Protected architecture visibility changed")
if any(not require(n+" • retro").hide_render for n in portals):
    raise RuntimeError("A historical opaque backing is rendered")

def principled(name, base, metallic, roughness, coat=0.0):
    mat=bpy.data.materials.new(name)
    mat.diffuse_color=(*base,1.)
    mat.use_nodes=True
    shader=mat.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value=(*base,1.)
    shader.inputs["Metallic"].default_value=metallic
    shader.inputs["Roughness"].default_value=roughness
    if "Coat Weight" in shader.inputs:
        shader.inputs["Coat Weight"].default_value=coat
        shader.inputs["Coat Roughness"].default_value=.18
    return mat

def replace_material(ob,mat):
    # Preserve all geometry and transforms; only material assignments change.
    if ob.type!="MESH" and ob.type!="CURVE":
        raise RuntimeError("Not a renderable surface "+ob.name)
    ob.data=ob.data.copy()
    ob.data.materials.clear()
    ob.data.materials.append(mat)

# 1. Enrich the existing long pavilion roof and bands; never deform the shell.
roof_finish=principled("ATLAS P2B • volta blu grafite satinata",
    (.11,.15,.22),.22,.42,.12)
replace_material(roof,roof_finish)
graphite=bpy.data.materials.get("ATLAS P2A • gallerie grafite satinata")
if graphite is None or not graphite.use_nodes:
    raise RuntimeError("Certified P2A gallery material missing")
gshader=graphite.node_tree.nodes.get("Principled BSDF")
gshader.inputs["Base Color"].default_value=(.11,.145,.21,1.)
gshader.inputs["Roughness"].default_value=.40
gshader.inputs["Metallic"].default_value=.23
bronze=bpy.data.materials.get("ATLAS P2A • bronzo scuro")
if bronze is None or not bronze.use_nodes:
    raise RuntimeError("Certified P2A bronze material missing")
metal=bronze.node_tree.nodes.get("Principled BSDF")
metal.inputs["Base Color"].default_value=(.30,.21,.13,1.)
metal.inputs["Roughness"].default_value=.28
metal.inputs["Metallic"].default_value=.77

# 2. Preserve actual glass and symbols, balancing transparency and reflection.
glass=bpy.data.materials.get("ATLAS P2A • vetro azzurro realmente traslucido")
if glass is None or not glass.use_nodes:
    raise RuntimeError("Certified P2A physical glass missing")
mix=next((x for x in glass.node_tree.nodes if x.type=="MIX_SHADER"),None)
glass_principled=next((x for x in glass.node_tree.nodes if x.type=="BSDF_PRINCIPLED"),None)
if mix is None or glass_principled is None:
    raise RuntimeError("Original glass nodes are not as qualified")
mix.inputs[0].default_value=.65
glass_principled.inputs["Base Color"].default_value=(.045,.16,.32,1.)
glass_principled.inputs["Roughness"].default_value=.10
glass_principled.inputs["Metallic"].default_value=.06
if "Coat Weight" in glass_principled.inputs:
    glass_principled.inputs["Coat Weight"].default_value=.16
if "Coat Roughness" in glass_principled.inputs:
    glass_principled.inputs["Coat Roughness"].default_value=.12

# 3. Keep marble/paving linework and make only the existing stone more specular.
floor_materials=[]
for slot in floor.material_slots:
    if slot.material and slot.material.use_nodes:
        m=slot.material.copy()
        slot.material=m
        floor_materials.append(m.name)
        for bs in [n for n in m.node_tree.nodes if n.type=="BSDF_PRINCIPLED"]:
            bs.inputs["Roughness"].default_value=.26
            if "Coat Weight" in bs.inputs:bs.inputs["Coat Weight"].default_value=.22
            if "Coat Roughness" in bs.inputs:bs.inputs["Coat Roughness"].default_value=.15
if not floor_materials:raise RuntimeError("No verified original floor material nodes")
# Softer but visible 4 gilded frames, no new geometry.
frame_emission=bpy.data.materials.get("ATLAS P2A • filamento ottone illuminato")
if frame_emission is None or not frame_emission.use_nodes:
    raise RuntimeError("Existing illuminated perimeter material missing")
emissive=next((n for n in frame_emission.node_tree.nodes if n.type=="EMISSION"),None)
if emissive is None:raise RuntimeError("No physical emission shader on frame")
emissive.inputs["Color"].default_value=(1.0,.71,.39,1.)
emissive.inputs["Strength"].default_value=1.65

# 4. Preserve all lights by name; photometric balance only.
baseline_lights={
 "ATLAS P2A • luce zenitale principale":(2450.,(.78,.88,1.)),
 "ATLAS P2A • diffuse interior from skylight":(2100.,(.77,.87,1.)),
 "ATLAS P2A • riempimento caldo podio":(980.,(1.,.75,.54)),
 "ATLAS P2A • riflesso laterale 0":(530.,(.58,.78,1.)),
 "ATLAS P2A • riflesso laterale 1":(530.,(.58,.78,1.)),
}
for name,(energy,color) in baseline_lights.items():
    light=require(name,"LIGHT")
    light.data=light.data.copy()
    if light.data.type!="AREA":raise RuntimeError("Original Cycles light changed "+name)
    light.data.energy=energy
    light.data.color=color

# Existing world receives more believable ambient fill, not fake volumetric PNG.
scene.world=scene.world.copy() if scene.world else bpy.data.worlds.new("ATLAS P2B • mondo interno")
scene.world.use_nodes=True
background=next((n for n in scene.world.node_tree.nodes if n.type=="BACKGROUND"),None)
if background is None:
    raise RuntimeError("Expected node-based world")
background.inputs["Color"].default_value=(.14,.19,.28,1.)
background.inputs["Strength"].default_value=.39

# 5. Two carefully directed area lights for believable warm/cool cross-reflection.
# New LIGHT objects are permitted, but no mesh, curve or camera geometry.
centroid=skylight.matrix_world @ skylight.data.vertices[0].co
def area(name,xyz,target,energy,size,color):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=energy
    data.shape="DISK"
    data.size=size
    data.color=color
    obj=bpy.data.objects.new(name,data)
    scene.collection.objects.link(obj)
    obj.location=Vector(xyz)
    ray=Vector(target)-obj.location
    obj.rotation_euler=ray.to_track_quat("-Z","Y").to_euler()
    return obj
lights_added=[
 area("ATLAS P2B • bagliore radente bronzo sinistro",
      (centroid.x-9.,centroid.y+1.,6.8),(centroid.x-3.,centroid.y,2.2),
      380.,4.5,(1.,.68,.36)),
 area("ATLAS P2B • bagliore radente bronzo destro",
      (centroid.x+9.,centroid.y+1.,6.8),(centroid.x+3.,centroid.y,2.2),
      380.,4.5,(1.,.68,.36))
]

# 6. Cycles / AgX optical polish. Frame and 3D camera physically unchanged.
scene.render.engine="CYCLES"
scene.cycles.samples=80
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=camera
scene.view_settings.view_transform="AgX"
# Keep the qualified source look; only the AgX display transform and exposure
# are changed. Blender color-management look identifiers differ by version.
scene.view_settings.exposure=.20
scene.view_settings.gamma=1.0
bpy.context.view_layer.update()
geometry_after=spatial_fingerprint()
if geometry_before!=geometry_after:
    altered=[name for name in geometry_before if geometry_before[name]!=geometry_after.get(name)]
    raise RuntimeError("Protected architecture geometry changed: "+str(altered[:10]))
if set(geometry_before)!=names_before:
    raise RuntimeError("Original scene membership corrupted")
new_objects=set(scene.objects.keys())-names_before
if new_objects!={light.name for light in lights_added}:
    raise RuntimeError("Unauthorized extra scene objects: "+str(new_objects))
image=dest/"atlas-p2b-materiali-luce-HERO.png"
scene.render.filepath=str(image)
bpy.ops.render.render(write_still=True)
if not image.is_file() or image.stat().st_size<120000:
    raise RuntimeError("Genuine detailed Cycles output absent")
model=dest/"atlas-p2b-materiali-luce-editable.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(model),compress=True)
if not model.is_file() or model.stat().st_size<100000:
    raise RuntimeError("Editable material-finished Blender scene absent")
if filehash(source)!=source_sha:
    raise RuntimeError("Previously approved R4 binary overwritten")
receipt={
 "schema":"atlas.artdir02.p2b-material-finish-01/v1",
 "reference_sha256":CANON,
 "approved_architectural_source":"P2A/R4 A Monumentale",
 "source_p2a_blend_sha256":source_sha,
 "source_binary_unchanged":True,
 "original_objects_unchanged":True,
 "original_objects_count":len(geometry_before),
 "original_spatial_fingerprint_sha256":hashlib.sha256(
   json.dumps(geometry_before,sort_keys=True).encode()).hexdigest(),
 "new_objects_only_lights":sorted(new_objects),
 "roof_material":roof_finish.name,
 "gallery_material":graphite.name,
 "glass_material":glass.name,
 "floor_materials":floor_materials,
 "certified_portals":list(portals),
 "three_levels":True,
 "floor_cuts_preserved":parent["floor_real_boolean"],
 "art_direction_approved":True,
 "art_final_approved":False,
 "web_approved":False,
 "student_publication_approved":False,
 "no_merge":True,
 "no_deploy":True,
 "files":{
  "blend":{"name":model.name,"bytes":model.stat().st_size,"sha256":filehash(model)},
  "png":{"name":image.name,"bytes":image.stat().st_size,"sha256":filehash(image)}
 },
 "limits":[
  "Optical and photometric concept must be reviewed against ART-DIR-02.",
  "No complete glTF/WebGL, physical device benchmark or classroom approval."
 ]
}
path=dest/"atlas-p2b-materials-receipt.json"
path.write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding="utf-8")
print("ATLAS_P2B_GEO_FROZEN_FINISH_PASS",json.dumps({
 "source_sha":source_sha,"render_sha":receipt["files"]["png"]["sha256"],
 "render_bytes":receipt["files"]["png"]["bytes"],
 "new_lights":receipt["new_objects_only_lights"]}),flush=True)
