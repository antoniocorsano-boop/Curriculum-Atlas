"""Read actual packed Blender scene and run a reversible, isolated ASD experiment."""
import bpy, hashlib, json, sys, math
from pathlib import Path
import numpy as np

def require(condition,message):
    if not condition: raise RuntimeError(message)
def canonical(v):return json.dumps(v,sort_keys=True,separators=(",",":"),ensure_ascii=False,allow_nan=False).encode()
def digest(v):return hashlib.sha256(canonical(v)).hexdigest()
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rounded(v):return round(float(v),8)
def vec(v):return [rounded(x) for x in v]
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2,allow_nan=False)+"\n")
def scalar(v):
    if isinstance(v,(int,float)):return rounded(v)
    if isinstance(v,str):return v
    try:return vec(v)
    except (TypeError,ValueError):return None
def observe(s,bindings):
    collection=bpy.data.collections.get(bindings["parameters"]["astral.visible"]["collection"])
    require(collection is not None,"Missing bound collection")
    points=sorted(collection.objects,key=lambda o:o.name)
    require(len(points)==bindings["parameters"]["astral.visible"]["expectedObjects"],"Bound object inventory drift")
    flags={o.hide_render for o in points}
    require(len(flags)==1,"Mixed visibility requires explicit review")
    require(s.camera is not None and s.camera.name in bindings["parameters"]["camera.active"]["allowed"],"Unknown active camera")
    objects=[]
    for o in sorted(s.objects,key=lambda o:o.name):
        d={"name":o.name,"type":o.type,"data":o.data.name if o.data else None,"matrix":[vec(r) for r in o.matrix_world],"hideRender":o.hide_render,"collections":sorted(c.name for c in o.users_collection),"materials":[m.name if m else None for m in o.data.materials] if o.type=="MESH" else []}
        if o.type=="MESH":
            d["geometry"]={"vertices":len(o.data.vertices),"polygons":len(o.data.polygons),"bounds":[vec(v) for v in o.bound_box]}
        if o.type=="LIGHT":d["light"]={"type":o.data.type,"energy":rounded(o.data.energy),"color":vec(o.data.color)}
        if o.type=="CAMERA":d["camera"]={"lens":rounded(o.data.lens),"clipStart":rounded(o.data.clip_start),"clipEnd":rounded(o.data.clip_end),"type":o.data.type}
        objects.append(d)
    materials=[]
    for m in sorted(bpy.data.materials,key=lambda m:m.name):
        nodes=[]
        if m.node_tree:
            for n in sorted(m.node_tree.nodes,key=lambda n:n.name):
                nodes.append({"name":n.name,"type":n.bl_idname,"image":n.image.name if n.type=="TEX_IMAGE" and n.image else None,"inputs":[{"id":i.identifier,"linked":i.is_linked,"value":scalar(i.default_value) if hasattr(i,"default_value") else None} for i in n.inputs]})
        materials.append({"name":m.name,"diffuse":vec(m.diffuse_color),"nodes":nodes,"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in m.node_tree.links) if m.node_tree else []})
    return {"parameters":{"camera.active":s.camera.name,"astral.visible":not next(iter(flags))},"objects":objects,"materials":materials,"images":[{"name":i.name,"size":list(i.size),"packed":bool(i.packed_file),"source":i.source} for i in sorted(bpy.data.images,key=lambda i:i.name) if i.type not in ("RENDER_RESULT","COMPOSITING") and i.source!="VIEWER"],"render":{"engine":s.render.engine,"resolution":[s.render.resolution_x,s.render.resolution_y,s.render.resolution_percentage],"exposure":rounded(s.view_settings.exposure),"viewTransform":s.view_settings.view_transform},"world":s.world.name if s.world else None}
def set_visibility(binding,value):
    require(type(value) is bool,"Invalid visibility")
    col=bpy.data.collections.get(binding["collection"])
    require(col and len(col.objects)==binding["expectedObjects"],"Binding drift")
    for o in col.objects:o.hide_render=not value
    bpy.context.view_layer.update()
def pixels(p):
    im=bpy.data.images.load(str(p),check_existing=False)
    try:
        a=np.empty(len(im.pixels),dtype=np.float32);im.pixels.foreach_get(a)
        return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    x=np.abs(a-b)
    return {"mae":float(x.mean()),"changedPixels":int(np.count_nonzero(np.max(x,axis=1)>1/255)),"pixels":len(x),"max":float(x.max())}

master,manifest_path,plan_path,out=map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
manifest=json.loads(manifest_path.read_text());plan=json.loads(plan_path.read_text())
require(manifest["schema"]=="atlas.asd.blender-bindings/v1" and manifest["studentAuthorized"] is False and manifest["publishable"] is False,"Binding contract")
expected=manifest["masterSha256"]
require(sha(master)==expected,"Master digest")
require(Path(bpy.data.filepath).resolve()==master,"Wrong loaded file")
require(not out.exists(),"Output already exists")
require(plan["schema"]=="atlas.asd.plan/v1" and plan["target"]=="blender" and plan["status"]=="CANDIDATE" and plan["mode"]=="PLAN_ONLY","Unsupported plan")
require(plan["masterSha256"]==expected and all(plan[k] is False for k in ("rendererWriteAuthorized","artisticApproval","studentAuthorized","publishable")),"Authorization boundary")
s=bpy.context.scene
before=observe(s,manifest)
require(digest(before["parameters"])==plan["baselineSha256"] and before["parameters"]==plan["rollback"],"Observed parameter baseline differs")
require(plan["candidate"]=={"camera.active":"atrium","astral.visible":False} and plan["rollback"]=={"camera.active":"atrium","astral.visible":True},"Only isolated visibility experiment supported")
require(len(plan["changes"])==1 and plan["changes"][0]["id"]=="astral.visible","Only bound visibility supported")
require(not bpy.data.libraries and all(i.packed_file for i in bpy.data.images if i.source=="FILE"),"External resource")
out.mkdir(parents=True)
write(out/"observation-before.json",before)
# Keep render settings fixed across all three images. Do not save altered settings to master.
orig_path=s.render.filepath
orig_pct=s.render.resolution_percentage
orig_format=s.render.image_settings.file_format
cycles={}
if s.render.engine=="CYCLES":
    for k,v in {"samples":24,"seed":0,"use_animated_seed":False,"use_adaptive_sampling":False}.items():
        cycles[k]=getattr(s.cycles,k);setattr(s.cycles,k,v)
s.render.resolution_percentage=manifest["experiment"]["resolutionPercent"]
s.render.image_settings.file_format="PNG"
def render(name):
    p=out/(name+".png");s.render.filepath=str(p)
    bpy.ops.render.render(write_still=True)
    require(p.is_file(),"Missing render")
    return p
a=render("01-baseline")
set_visibility(manifest["parameters"]["astral.visible"],False)
# For structural comparisons normalize the temporary render resolution.
s.render.resolution_percentage=orig_pct
after=observe(s,manifest)
require(after["parameters"]==plan["candidate"],"Candidate mismatch")
expected_after=json.loads(json.dumps(before))
expected_after["parameters"]["astral.visible"]=False
bound_names={o.name for o in bpy.data.collections[manifest["parameters"]["astral.visible"]["collection"]].objects}
for o in expected_after["objects"]:
    if o["name"] in bound_names:o["hideRender"]=True
require(after==expected_after,"Unexpected scene property change")
write(out/"observation-candidate.json",after)
s.render.resolution_percentage=manifest["experiment"]["resolutionPercent"]
b=render("02-candidate")
set_visibility(manifest["parameters"]["astral.visible"],True)
c=render("03-restored")
s.render.resolution_percentage=orig_pct
s.render.filepath=orig_path;s.render.image_settings.file_format=orig_format
for k,v in cycles.items():setattr(s.cycles,k,v)
restored=observe(s,manifest)
require(restored==before,"Rollback did not restore observed state")
write(out/"observation-restored.json",restored)
p0,p1,p2=map(pixels,(a,b,c))
require(p0.shape==p1.shape==p2.shape,"Image dimensions differ")
delta=compare(p0,p1);rollback=compare(p0,p2)
require(delta["changedPixels"]>0,"No visible experimental change")
# Deterministic seeded rendering; allow tiny numerical variation, not a visible drift.
require(rollback["mae"]<0.0002 and rollback["changedPixels"]<=max(1,int(rollback["pixels"]*.001)),"Visual rollback drift")
require(sha(master)==expected,"Master bytes changed")
receipt={"schema":"atlas.asi.l2-blender-experiment/v1","status":"PASS","sceneId":manifest["sceneId"],"masterSha256":expected,"planSha256":sha(plan_path),"bindingSha256":sha(manifest_path),"observedObjects":len(before["objects"]),"observedMaterials":len(before["materials"]),"observedImages":len(before["images"]),"boundObjects":len(bound_names),"beforeStateSha256":digest(before),"candidateStateSha256":digest(after),"restoredStateSha256":digest(restored),"changedParameter":"astral.visible","candidateComparison":delta,"rollbackComparison":rollback,"imageHashes":{p.name:sha(p) for p in (a,b,c)},"inputUnchanged":True,"scope":"Observed Blender state and one reversible visibility experiment; no WebGL, artistic approval or cross-world reuse","studentAuthorized":False,"publishable":False}
write(out/"receipt.json",receipt);print("ASI_L2_EXPERIMENT",json.dumps(receipt),flush=True)
