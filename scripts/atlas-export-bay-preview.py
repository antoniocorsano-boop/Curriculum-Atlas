"""Export real bay geometry and material constants from the immutable master.
No source image redistribution. Non-target materials are preview approximations.
"""
import bpy, numpy as np, hashlib, json, os, sys, math
from pathlib import Path
from mathutils import Vector

MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def need(x,msg):
    if not x:raise RuntimeError(msg)
master,src,out=map(Path,sys.argv[sys.argv.index("--")+1:])
need(Path(bpy.data.filepath).resolve()==master.resolve() and sha(master)==MASTER,"master")
b=json.loads((src/"surface-binding.json").read_text()); m=json.loads((src/"material-package.json").read_text())
f=json.loads((src/"material-finish.json").read_text())
need(b["revision"]==m["revision"]==f["revision"]=="52804c49858aafb643f11bff10772a32a0c5e14f","finish revision")
need(f["status"]=="PASS_FINISH_PACKAGE" and f["decision"]=="CANDIDATE_FOR_VISUAL_REVIEW","finish result")
need(m["bindingSha256"]==sha(src/"surface-binding.json") and f["packageSha256"]==sha(src/"material-package.json"),"binding identity")
out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene;deps=bpy.context.evaluated_depsgraph_get()
prefix="Library bay 04-0-";target=b["target"]["object"]
objects=sorted([o for o in s.objects if o.name.startswith(prefix) and o.type=="MESH" and not o.hide_render],key=lambda o:o.name)
need(len(objects)==11 and target in [o.name for o in objects],"bay inventory")
rows=[];inv=[];materials={}
def constants(mat):
    nodes=mat.node_tree.nodes if mat and mat.use_nodes else []
    p=next((n for n in nodes if n.type=="BSDF_PRINCIPLED"),None)
    color=list(p.inputs["Base Color"].default_value)[:3] if p else list(mat.diffuse_color)[:3]
    # Source socket constants, not a claim that linked graphs are reproduced.
    rough=float(p.inputs["Roughness"].default_value) if p else .6
    metal=float(p.inputs["Metallic"].default_value) if p else 0.
    rec={"color":color,"roughness":rough,"metallic":metal,"linkedBaseColor":bool(p and p.inputs["Base Color"].is_linked)}
    materials[mat.name]=rec
    return color+[rough,metal]
for o in objects:
    ev=o.evaluated_get(deps);mesh=ev.to_mesh()
    try:
        mesh.calc_loop_triangles();world=ev.matrix_world;normal=world.to_3x3().inverted().transposed()
        count=len(mesh.loop_triangles); start=len(rows)
        for tri in mesh.loop_triangles:
            mat=ev.material_slots[tri.material_index].material
            need(mat is not None,"empty material "+o.name)
            c=constants(mat)
            for li in tri.loops:
                p=world@mesh.vertices[mesh.loops[li].vertex_index].co
                n=(normal@mesh.corner_normals[li].vector).normalized()
                rows.append([*p,*n,*c])
        inv.append({"object":o.name,"triangles":count,"firstVertex":start,"vertexCount":count*3})
    finally:ev.to_mesh_clear()
data=np.array(rows,dtype="<f4")
need(data.shape[1]==11 and np.isfinite(data).all() and len(data)%3==0,"bay data")
need(len(data)//3<100000,"bay triangle budget")
t=next(x for x in inv if x["object"]==target)
tp=data[t["firstVertex"]:t["firstVertex"]+t["vertexCount"],:3]
canon=lambda a:sorted(tuple(sorted(tuple(round(float(x),5) for x in v) for v in tri)) for tri in a.reshape(-1,3,3))
need(canon(tp)==canon(np.array(b["positions"])),"target geometry changed")
# Use the source positions and colors of nearby lights. The browser uses
# a bounded direct-light approximation, not a Cycles illumination replica.
center=(data[:,:3].min(axis=0)+data[:,:3].max(axis=0))/2
lights=[]
for o in s.objects:
    if o.type!="LIGHT" or o.hide_render or o.data.type not in ("POINT","AREA","SPOT"):continue
    pos=np.array(o.matrix_world.translation)
    d=float(np.linalg.norm(pos-center))
    if o.data.energy<=0:continue
    lights.append({"name":o.name,"position":pos.tolist(),"color":list(o.data.color),"energy":float(o.data.energy),"type":o.data.type,"rank":float(o.data.energy)/(1+d*d)})
lights.sort(key=lambda x:(-x["rank"],x["name"]))
need(lights,"no source lights")
lights=lights[:8]
(out/"bay.f32").write_bytes(data.tobytes())
result={"schema":"atlas.asc01.bay-preview/v1","revision":os.environ["ATLAS_EXACT_HEAD"],"sourceRevision":b["revision"],"masterSha256":MASTER,
        "triangles":len(data)//3,"stride":11,"sha256":sha(out/"bay.f32"),"objects":inv,"materials":materials,"lights":lights,
        "bounds":[data[:,:3].min(axis=0).tolist(),data[:,:3].max(axis=0).tolist()],
        "target":target,"targetTriangles":108,"materialPackageSha256":sha(src/"material-package.json"),
        "masterUnchanged":sha(master)==MASTER,"surroundingMaterials":"source socket constants; approximate direct light","publishable":False}
(out/"bay.json").write_text(json.dumps(result,indent=2,allow_nan=False)+"\n")
print("ASC BAY EXPORT",json.dumps({k:v for k,v in result.items() if k not in ("objects","materials","lights")}),flush=True)
