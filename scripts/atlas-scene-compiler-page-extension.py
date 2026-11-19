"""ASC-P2B: extend measured AABB derivative to three shared paper meshes; diagnose visibility."""
import bpy,bmesh,hashlib,json,os,sys,time
from collections import Counter
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
import numpy as np
master,p1,p2a,out=map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
P1="e39afbe21a9758f0d8261d92b39cf1a28a9b5330"
P2A="5c2405291d1f4bcc499db848ec0a980de3ae5c1a"
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def val(v):return [round(float(x),8) for x in v]
def tris(m):m.calc_loop_triangles();return len(m.loop_triangles)
def signature(m):
    return digest({"vertices":[val(v.co) for v in m.vertices],"faces":[[list(f.vertices),f.material_index,f.use_smooth] for f in m.polygons],"edges":[list(e.vertices) for e in m.edges],"uv":[[u.name,[val(l.uv) for l in u.data]] for u in m.uv_layers],"materials":[m.name if m else None for m in m.materials]})
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
p=json.loads(p1.read_text());a=json.loads(p2a.read_text())
require(p["revision"]==P1 and p["status"]=="PASS_OBSERVATION_ONLY" and p["masterSha256"]==MASTER and p["masterUnchanged"],"P1 evidence")
require(a["revision"]==P2A and a["status"]=="PASS_GEOMETRY_COMPARISON" and a["masterSha256"]==MASTER and a["masterUnchanged"] and a["sharedMeshesRestored"] and a["variants"]["box"]["triangles"]==924,"P2A evidence")
s=bpy.context.scene;orig_cam=s.camera;require(orig_cam and orig_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
col=bpy.data.collections.get("02 Campate condivise");require(col is not None,"bay collection")
targets=sorted([o for o in col.all_objects if o.type=="MESH" and o.name.endswith("-Bay Paper")],key=lambda o:o.name)
require(len(targets)==45 and all(not o.hide_render and not o.modifiers for o in targets),"paper targets")
bindings={o.name:o.data for o in targets};sources={o.data.name:o.data for o in targets}
require(len(sources)==3 and set(Counter(o.data.name for o in targets).values())=={15},"sharing drift")
expected={x["mesh"]:x for x in p["bayMeshRanking"] if x["materials"]==["Paper"]}
require(set(expected)==set(sources) and all(x["triangles"]==8316 and x["instances"]==15 for x in expected.values()),"P1 mapping")
mat=bpy.data.materials.get("Paper")
require(mat and mat.use_nodes and all(list(m.materials)==[mat] for m in sources.values()),"paper material")
require(not any(n.type in {"TEX_IMAGE","UVMAP","GROUP","TEX_COORD","ATTRIBUTE"} for n in mat.node_tree.nodes),"UV transfer required")
original=list(s.objects);target_names=set(bindings);all_bindings={o.name:o.data for o in original if o.type=="MESH"}
source_hashes={n:signature(m) for n,m in sources.items()}
flags={o.name:o.hide_render for o in original if o.type=="MESH"}
def protected():
    return digest([{"name":o.name,"type":o.type,"matrix":[val(r) for r in o.matrix_world],"hide":o.hide_render,
                    "data":(bindings[o.name].name if o.name in target_names else o.data.name) if o.data else None,
                    "materials":[m.name if m else None for m in o.data.materials] if o.type=="MESH" else [],
                    "light":[o.data.type,float(o.data.energy),val(o.data.color)] if o.type=="LIGHT" else None}
                   for o in sorted(original,key=lambda q:q.name)])
locked=protected()
def guard():
    require(protected()==locked and all(signature(m)==source_hashes[n] for n,m in sources.items()),"protected source drift")
    require(all(o.data==all_bindings[o.name] for o in original if o.type=="MESH" and o.name not in target_names),"non-target mesh drift")
def components(m):
    adj=[[] for _ in m.vertices]
    for e in m.edges:
        a,b=e.vertices;adj[a].append(b);adj[b].append(a)
    seen=set();res=[]
    for i in range(len(adj)):
        if i in seen:continue
        seen.add(i);todo=[i];ids=[]
        while todo:
            j=todo.pop();ids.append(j)
            for k in adj[j]:
                if k not in seen:seen.add(k);todo.append(k)
        co=[m.vertices[j].co for j in ids]
        lo=Vector(tuple(min(v[k] for v in co) for k in range(3)));hi=Vector(tuple(max(v[k] for v in co) for k in range(3)))
        require(min(hi-lo)>.001,"degenerate component")
        res.append((lo,hi))
    return sorted(res,key=lambda r:tuple(round(float(v),6) for v in r[0]))
faces=((0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7))
out.mkdir(parents=True,exist_ok=True)
report={"schema":"atlas.asc01.page-extension/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,
        "p1ReceiptSha256":sha(p1),"p2aReceiptSha256":sha(p2a),"families":[],"bindings":[],"renders":{},"comparisons":{},"visibility":{},
        "masterModified":False,"runtimeModified":False,"studentAuthorized":False,"publishable":False,"artisticApproval":False,"webglQualified":False}
def write():(out/"page-extension.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()
derivatives={};camdata=None;cam=None
def build(name,m):
    bounds=components(m);require(len(bounds)==77 and tris(m)==8316,"source topology "+name)
    bm=bmesh.new()
    try:
        for lo,hi in bounds:
            v=[bm.verts.new((x,y,z)) for x,y,z in ((lo.x,lo.y,lo.z),(hi.x,lo.y,lo.z),(hi.x,hi.y,lo.z),(lo.x,hi.y,lo.z),(lo.x,lo.y,hi.z),(hi.x,lo.y,hi.z),(hi.x,hi.y,hi.z),(lo.x,hi.y,hi.z))]
            for f in faces:bm.faces.new([v[i] for i in f])
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        n=bpy.data.meshes.new("ASC-P2B "+name);bm.to_mesh(n);n.update();n.materials.append(mat)
    finally:bm.free()
    actual=components(n);require(len(actual)==77 and tris(n)==924,"derivative topology "+name)
    for (lo,hi),(a,b) in zip(bounds,actual):
        require(max(abs(lo[i]-a[i]) for i in range(3))<.00005 and max(abs(hi[i]-b[i]) for i in range(3))<.00005,"bounds "+name)
    require(all(f.area>1e-10 for f in n.polygons),"degenerate face")
    report["families"].append({"source":name,"derivative":n.name,"sourceTriangles":8316,"candidateTriangles":924,"instances":15,"components":77,"boundsPreserved":True,"sourceSignature":source_hashes[name],"candidateSignature":signature(n)})
    return n
def set_geometry(candidate):
    for o in targets:o.data=derivatives[bindings[o.name].name] if candidate else bindings[o.name]
    bpy.context.view_layer.update()
    require(len(set(o.data.name for o in targets))==3 and set(Counter(o.data.name for o in targets).values())=={15},"sharing lost")
def restore_flags():
    for o in original:
        if o.type=="MESH":o.hide_render=flags[o.name]
    bpy.context.view_layer.update()
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        w,h=im.size;a=np.empty(w*h*4,np.float32);im.pixels.foreach_get(a);return a.reshape((h,w,4))[:,:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);return {"pixels":int(a.shape[0]*a.shape[1]),"changedPixels":int(np.count_nonzero(np.max(d,axis=2)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
def rays(camera,nx=96,ny=64):
    require(camera.data.type=="PERSP","perspective required")
    frame=camera.data.view_frame(scene=s)
    lo=[min(v[i] for v in frame) for i in range(2)];hi=[max(v[i] for v in frame) for i in range(2)]
    z=frame[0].z;world=camera.matrix_world
    for y in range(ny):
        for x in range(nx):
            p=Vector((lo[0]+(hi[0]-lo[0])*(x+.5)/nx,lo[1]+(hi[1]-lo[1])*(y+.5)/ny,z))
            yield world.translation.copy(),(world.to_3x3()@p).normalized()
def visibility(camera,pilot):
    dg=bpy.context.evaluated_depsgraph_get();first=Counter();direct=0
    bvh=BVHTree.FromObject(pilot,dg);inv=pilot.matrix_world.inverted()
    for origin,direction in rays(camera):
        hit,_,_,_,o,_=s.ray_cast(dg,origin,direction,distance=150)
        first[o.name if hit and o else "<miss>"]+=1
        if bvh.ray_cast(inv@origin,(inv.to_3x3()@direction).normalized(),150)[0] is not None:direct+=1
    return {"sampledRays":6144,"firstHitPaper":sum(first[n] for n in target_names),"pilotFirstHits":first[pilot.name],"pilotDirectGeometryHitsIgnoringOcclusion":direct,"firstHits":dict(sorted(first.items()))}
def render(key):
    path=out/(key+".png");s.render.filepath=str(path);start=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path)
    require(np.isfinite(a).all() and a.max()>0 and a.shape==(s.render.resolution_y,s.render.resolution_x,3),"invalid render "+key)
    report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"width":a.shape[1],"height":a.shape[0]}
    return a
try:
    for name,m in sorted(sources.items()):derivatives[name]=build(name,m)
    report["bindings"]=[{"object":o.name,"source":bindings[o.name].name,"derivative":derivatives[bindings[o.name].name].name,"matrix":[val(r) for r in o.matrix_world]} for o in targets]
    report["theoreticalTriangles"]={"source":374220,"candidate":41580,"saved":332640}
    pilot=next(o for o in targets if o.name=="Library bay 04-0-Bay Paper")
    camdata=bpy.data.cameras.new("ASC P2B context");cam=bpy.data.objects.new("ASC P2B context",camdata);s.collection.objects.link(cam)
    camdata.lens=a["contextCamera"]["lens"];camdata.clip_start=.05;camdata.clip_end=150
    cam.location=Vector(a["contextCamera"]["location"]);target=Vector(a["contextCamera"]["target"])
    cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=16;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
    s.cycles.use_denoising=True;s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
    detail=s.objects.get("detail");require(detail and detail.type=="CAMERA","detail camera")
    for view,camera,w,h in (("atrium",orig_cam,720,450),("detail",detail,640,480),("context",cam,640,480)):
        s.camera=camera;s.render.resolution_x=w;s.render.resolution_y=h;set_geometry(False);guard()
        report["visibility"][view]={"baseline":visibility(camera,pilot)}
        ref=render(view+"-baseline");set_geometry(True);guard()
        report["visibility"][view]["candidate"]=visibility(camera,pilot)
        candidate=render(view+"-candidate");set_geometry(False);guard()
        restored=render(view+"-restored");guard()
        report["comparisons"][view+"-candidate"]=compare(ref,candidate);q=compare(ref,restored);report["comparisons"][view+"-restored"]=q
        require(q["meanAbsoluteRGBDelta"]<.0002 and q["changedPixels"]<=max(1,int(q["pixels"]*.001)),"rollback "+view);write()
    s.camera=cam;s.render.resolution_x=640;s.render.resolution_y=480;set_geometry(False)
    require(report["visibility"]["context"]["baseline"]["pilotDirectGeometryHitsIgnoringOcclusion"]>0,"witness camera misses paper")
    for o in original:
        if o.type=="MESH" and o!=pilot:o.hide_render=True
    bpy.context.view_layer.update()
    ref=render("witness-baseline");set_geometry(True);candidate=render("witness-candidate")
    report["comparisons"]["witness-candidate"]=compare(ref,candidate)
    set_geometry(False);restore_flags();s.camera=orig_cam;guard()
    require(all(o.data==bindings[o.name] for o in targets) and sha(master)==MASTER,"final restore")
    report.update(status="PASS_EXTENSION_COMPARISON",masterUnchanged=True,sharedMeshesRestored=True,artisticReviewRequired=True);write()
    print("ASC-P2B",json.dumps({"status":report["status"],"theoreticalTriangles":report["theoreticalTriangles"],"comparisons":report["comparisons"],"visibility":{k:{m:{f:x[f] for f in ("firstHitPaper","pilotFirstHits","pilotDirectGeometryHitsIgnoringOcclusion")} for m,x in v.items()} for k,v in report["visibility"].items()}},ensure_ascii=False),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    set_geometry(False);restore_flags();s.camera=orig_cam
    if cam:bpy.data.objects.remove(cam,do_unlink=True)
    if camdata:bpy.data.cameras.remove(camdata)
    for m in derivatives.values():bpy.data.meshes.remove(m)
