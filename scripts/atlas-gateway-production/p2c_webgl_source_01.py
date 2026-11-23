#!/usr/bin/env python3
"""P2C: export an authenticated editable Blender P2B/R2 source to genuine GLB.
Four interactive portal meshes are encoded as glTF extras. No deploy or merge.
"""
import bpy,hashlib,json,struct,sys
from pathlib import Path
A=sys.argv[sys.argv.index("--")+1:]
def arg(x):
    assert x in A and A.index(x)+1<len(A),x
    return A[A.index(x)+1]
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):h.update(chunk)
    return h.hexdigest()
src=Path(bpy.data.filepath).resolve()
out=Path(arg("--out")).resolve()
out.mkdir(parents=True,exist_ok=True)
r=json.loads(Path(arg("--parent-receipt")).read_text())
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
APPROVED_R4="3e425897ccf6092110d27955b3c25dfe28c6a52046aa0576acaf33b67959e56f"
if not (r.get("schema")=="atlas.artdir02.p2b-material-finish-01/v1"
 and r.get("reference_sha256")==CANON
 and r.get("source_p2a_blend_sha256")==APPROVED_R4
 and r.get("approved_architectural_source")=="P2A/R4 A Monumentale"
 and r.get("source_binary_unchanged") and r.get("original_objects_unchanged")
 and not r.get("art_final_approved") and not r.get("web_approved")
 and r.get("no_deploy") and r.get("no_merge")
 and src.name==r["files"]["blend"]["name"]
 and sha(src)==r["files"]["blend"]["sha256"]):
    raise RuntimeError("Unqualified P2B/R2 Blender source")
src_hash=sha(src)
scene=bpy.context.scene
for ob in scene.objects:ob.select_set(False)
routes={"Curricolo":"/curricolo/","Esplora":"/esplora/",
        "Percorsi":"/percorsi/","Esperienze":"/esperienze/"}
eligible=[]
for ob in scene.objects:
    if ob.hide_render or ob.hide_get():continue
    if ob.type in ("MESH","CAMERA") or (ob.type=="EMPTY" and ob.name.startswith("Portale •")) or (ob.type=="CURVE" and ob.name.startswith("ATLAS P2A • bordo luminoso")):
        ob.select_set(True)
        eligible.append(ob)
if len([ob for ob in eligible if ob.type=="MESH"])<70:
    raise RuntimeError("Real atrium geometry absent")
cam=bpy.data.objects.get("CAM_HERO_ARCH04")
if not cam or not cam.select_get():raise RuntimeError("Approved HERO camera absent")
for name,path in routes.items():
    root=bpy.data.objects.get("Portale • "+name)
    pane=bpy.data.objects.get(name+" • vetro cobalto")
    if not root or not pane or not root.select_get() or not pane.select_get():
        raise RuntimeError("Portal geometry not visible: "+name)
    for target in (root,pane):
        target["atlas_portal_id"]=name.lower()
        target["atlas_route"]=path
    pane["atlas_hit_target"]=True
# Convert Cycles mixing into glTF-native PBR in the in-memory derivative only.
def mat(name,color,metal,rough,alpha=1.,emission=None):
    material=bpy.data.materials.new("ATLAS P2C • "+name)
    material.use_nodes=True
    bs=material.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,alpha)
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    bs.inputs["Alpha"].default_value=alpha
    if alpha<1.:material.surface_render_method="BLENDED"
    if emission:
        bs.inputs["Emission Color"].default_value=(*emission,1.)
        bs.inputs["Emission Strength"].default_value=1.7
    return material
glass=mat("vetro traslucido",(.05,.18,.32),.06,.12,.34)
roof=mat("copertura grafite",(.06,.10,.16),.25,.42)
gallery=mat("gallerie blu",(.08,.12,.18),.26,.39)
filament=mat("filamento caldo",(.34,.21,.10),.38,.25,1.,(.92,.55,.25))
stone=mat("pavimento",(.10,.16,.24),.15,.23)
for ob in eligible:
    if ob.type not in ("MESH","CURVE"):continue
    key=ob.name.lower()
    chosen=None
    if ob.name in [name+" • vetro cobalto" for name in routes]:chosen=glass
    elif key.startswith("atlas p2a • bordo luminoso"):chosen=filament
    elif "pavimento lapideo" in key:chosen=stone
    elif "copertura monolitica" in key or "cielo unico" in key:chosen=roof
    elif "gallery" in key or "galleria" in key:chosen=gallery
    if chosen is not None:
        ob.data=ob.data.copy()
        ob.data.materials.clear()
        ob.data.materials.append(chosen)
scene.camera=cam
bpy.context.view_layer.objects.active=cam
bpy.context.view_layer.update()
glb=out/"atlas-p2c-atrio-4-portali.glb"
bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",
    use_selection=True,export_cameras=True,export_lights=False,
    export_extras=True,export_normals=True,export_texcoords=True,
    export_materials="EXPORT",export_apply=False,export_yup=True)
raw=glb.read_bytes()
magic,version,length=struct.unpack_from("<III",raw)
if magic!=0x46546C67 or version!=2 or length!=len(raw):
    raise RuntimeError("Invalid exported GLB")
n,typ=struct.unpack_from("<II",raw,12)
if typ!=0x4E4F534A:raise RuntimeError("GLB JSON missing")
payload=json.loads(raw[20:20+n].decode("utf8").rstrip(" \x00"))
nodes=payload["nodes"]
portals={}
for name,route in routes.items():
    items=[x for x in nodes if x.get("extras",{}).get("atlas_portal_id")==name.lower()]
    hit=[x for x in items if x.get("extras",{}).get("atlas_hit_target")]
    if not items or not hit or "mesh" not in hit[0] or hit[0]["extras"].get("atlas_route")!=route:
        raise RuntimeError("GLB lacks hit geometry: "+name)
    portals[name.lower()]={"path":route,"hit_node":hit[0]["name"]}
if not any("camera" in x for x in nodes):
    raise RuntimeError("Exported 3D camera not found")
triangles=0
for mesh in payload.get("meshes",[]):
    for prim in mesh.get("primitives",[]):
        if prim.get("mode",4)!=4:continue
        a=prim.get("indices")
        if a is not None:triangles+=payload["accessors"][a]["count"]//3
        elif "POSITION" in prim.get("attributes",{}):
            triangles+=payload["accessors"][prim["attributes"]["POSITION"]]["count"]//3
if triangles<1500:raise RuntimeError("Atrium unexpectedly empty")
if sha(src)!=src_hash:raise RuntimeError("Qualified R2 original changed")
report={"schema":"atlas.artdir02.p2c-webgl-source-01/v1",
    "art_reference_sha256":CANON,"approved_architecture_sha256":APPROVED_R4,
    "input_p2b_r2_sha256":src_hash,"input_binary_unchanged":True,
    "selected_original_objects":len(eligible),"glb_nodes":len(nodes),
    "glb_meshes":len(payload.get("meshes",[])),"glb_triangles":triangles,
    "glb_cameras":len(payload.get("cameras",[])),
    "glb_materials":len(payload.get("materials",[])),"portals":portals,
    "file":{"name":glb.name,"bytes":len(raw),"sha256":sha(glb)},
    "art_final_approved":False,"web_product_approved":False,
    "student_publication_approved":False,"no_merge":True,"no_deploy":True,
    "limits":["PBR approximates Cycles and requires visual WebGL review",
              "Four existing application routes are not authorizations for content",
              "Device FPS, RAM and touch interaction not yet tested"]}
(out/"atlas-p2c-webgl-receipt.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
print("ATLAS_P2C_GLTF_SOURCE_VALID",json.dumps({"triangles":triangles,"bytes":len(raw),"portals":portals}),flush=True)
