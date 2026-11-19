"""ASC-P2A: controlled page-block geometry ablation, immutable source."""
import bpy, bmesh, hashlib, json, os, sys, time
from pathlib import Path
from mathutils import Vector
import numpy as np

master, prior, out = map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
P1="e39afbe21a9758f0d8261d92b39cf1a28a9b5330"
TARGET="Library bay 04-0-Bay Paper"
def require(ok,msg):
    if not ok: raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def val(x):return [round(float(v),8) for v in x]
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
p=json.loads(prior.read_text())
require(p["status"]=="PASS_OBSERVATION_ONLY" and p["revision"]==P1 and p["masterBytesVerified"] and p["masterUnchanged"] and p["masterSha256"]==MASTER,"P1 receipt")
row=next(x for x in p["pilotObjects"] if x["object"]==TARGET)
require(row["triangles"]==8316,"P1 geometry binding")
s=bpy.context.scene;orig_cam=s.camera
require(orig_cam and orig_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
o=s.objects.get(TARGET)
require(o and o.type=="MESH" and o.data.name==row["mesh"] and not o.modifiers and not o.hide_render,"page object binding")
source=o.data;mat=source.materials[0]
require(len(source.materials)==1 and mat and mat.name=="Paper" and mat.use_nodes,"Paper material")
nodes=mat.node_tree.nodes
require(not any(n.type in {"TEX_IMAGE","UVMAP","GROUP","TEX_COORD","ATTRIBUTE"} for n in nodes),"material requires separate attribute transfer")
def triangles(m):
    m.calc_loop_triangles();return len(m.loop_triangles)
def signature(m):
    return digest({"vertices":[val(v.co) for v in m.vertices],"faces":[[list(f.vertices),f.material_index,f.use_smooth] for f in m.polygons],
                   "edges":[list(e.vertices) for e in m.edges],"uv":[[u.name,[val(l.uv) for l in u.data]] for u in m.uv_layers],"materials":[x.name if x else None for x in m.materials]})
source_hash=signature(source)
original=list(s.objects);bindings={x.name:x.data for x in original if x.type=="MESH"}
def protected():
    return digest([{"name":x.name,"type":x.type,"matrix":[val(r) for r in x.matrix_world],"hide":x.hide_render,
                    "data":(bindings[x.name].name if x==o else x.data.name) if x.data else None,
                    "materials":[m.name if m else None for m in x.data.materials] if x.type=="MESH" else [],
                    "light":[x.data.type,float(x.data.energy),val(x.data.color)] if x.type=="LIGHT" else None}
                   for x in sorted(original,key=lambda q:q.name)])
locked=protected()
def guard():
    require(protected()==locked and signature(source)==source_hash,"protected source drift")
    require(all(x.data==bindings[x.name] for x in original if x.type=="MESH" and x!=o),"shared mesh modified")
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
        lo=Vector(tuple(min(v[k] for v in co) for k in range(3)))
        hi=Vector(tuple(max(v[k] for v in co) for k in range(3)))
        require(min(hi-lo)>.001,"degenerate component")
        res.append((lo,hi,len(ids)))
    return sorted(res,key=lambda r:tuple(round(float(v),6) for v in r[0]))
bounds=components(source)
require(len(bounds)==77 and triangles(source)==8316,"source topology drift")
out.mkdir(parents=True,exist_ok=True)
report={"schema":"atlas.asc01.page-ablation/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],
        "masterSha256":MASTER,"priorReceiptSha256":sha(prior),"object":TARGET,"sourceMesh":source.name,
        "sourceTriangles":triangles(source),"sourceComponents":len(bounds),"variants":{},"renders":{},"comparisons":{},
        "masterModified":False,"runtimeModified":False,"studentAuthorized":False,"publishable":False,"artisticApproval":False,"webglQualified":False}
def write():(out/"page-ablation.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()
# Winding is outward. Each disconnected component receives the measured local AABB.
faces=((0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7))
def build(mode):
    bm=bmesh.new()
    try:
        for lo,hi,_ in bounds:
            v=[bm.verts.new((x,y,z)) for x,y,z in ((lo.x,lo.y,lo.z),(hi.x,lo.y,lo.z),(hi.x,hi.y,lo.z),(lo.x,hi.y,lo.z),(lo.x,lo.y,hi.z),(hi.x,lo.y,hi.z),(hi.x,hi.y,hi.z),(lo.x,hi.y,hi.z))]
            f=[bm.faces.new([v[i] for i in face]) for face in faces]
            if mode=="bevel":
                edges=list({e for face in f for e in face.edges})
                bmesh.ops.bevel(bm,geom=edges,offset=min(.002,min(hi-lo)*.10),offset_type="OFFSET",segments=1,affect="EDGES",clamp_overlap=True)
        bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
        m=bpy.data.meshes.new("ASC-P2A "+mode);bm.to_mesh(m);m.update();m.materials.append(mat)
    finally:bm.free()
    actual=components(m);require(len(actual)==len(bounds),"component count "+mode)
    for (lo,hi,_),(a,b,_) in zip(bounds,actual):
        require(max(abs(lo[i]-a[i]) for i in range(3))<.00005 and max(abs(hi[i]-b[i]) for i in range(3))<.00005,"component bounds "+mode)
    require(all(f.area>1e-10 for f in m.polygons),"degenerate face "+mode)
    n=triangles(m);require(0<n<8316,"no reduction "+mode)
    if mode=="box":require(n==77*12,"box triangle count")
    report["variants"][mode]={"triangles":n,"components":len(actual),"reductionFraction":1-n/8316,"localBoundsPreserved":True}
    return m
variants={}
camdata=None;cam=None
def restore():
    o.data=source;bpy.context.view_layer.update()
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        w,h=im.size;a=np.empty(w*h*4,np.float32);im.pixels.foreach_get(a)
        return a.reshape((h,w,4))[:,:,:3].copy()
    finally:bpy.data.images.remove(im)
def metrics(a,b):
    d=np.abs(a-b);return {"pixels":int(a.shape[0]*a.shape[1]),"changedPixels":int(np.count_nonzero(np.max(d,axis=2)>1/255)),
                         "meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
def compare(a,b):
    h,w=a.shape[:2];ys=slice(h//4,3*h//4);xs=slice(w//4,3*w//4)
    return {"full":metrics(a,b),"centralCrop":metrics(a[ys,xs],b[ys,xs])}
try:
    for mode in ("box","bevel"):variants[mode]=build(mode)
    require(report["variants"]["box"]["triangles"]<report["variants"]["bevel"]["triangles"],"bevel comparison")
    guard();write()
    target=sum((o.matrix_world@((lo+hi)/2) for lo,hi,_ in bounds),Vector())/len(bounds)
    radial=Vector((target.x,target.y,0)).normalized()
    require(radial.length>.9,"context direction")
    camdata=bpy.data.cameras.new("ASC P2A context");cam=bpy.data.objects.new("ASC P2A context",camdata);s.collection.objects.link(cam)
    camdata.lens=45;camdata.clip_start=.05;camdata.clip_end=150
    cam.location=target-radial*3.4+Vector((0,0,.1));cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    report["contextCamera"]={"location":val(cam.location),"target":val(target),"lens":camdata.lens}
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=16;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
    s.cycles.use_denoising=True;s.render.threads_mode="FIXED";s.render.threads=2
    s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
    for view,camera,w,h in (("atrium",orig_cam,720,450),("context",cam,640,480)):
        s.camera=camera;s.render.resolution_x=w;s.render.resolution_y=h;arrays={}
        for mode in ("baseline","box","bevel","restored"):
            restore()
            if mode in variants:o.data=variants[mode];bpy.context.view_layer.update()
            guard()
            key=view+"-"+mode;path=out/(key+".png");s.render.filepath=str(path)
            start=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path)
            require(np.isfinite(a).all() and a.max()>0 and a.shape==(h,w,3),"invalid render")
            arrays[mode]=a;guard()
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"width":w,"height":h,"triangles":triangles(o.data)}
            report["comparisons"][key]=compare(arrays["baseline"],a);write()
        rb=report["comparisons"][view+"-restored"]["full"]
        require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback drift "+view)
    restore();s.camera=orig_cam;guard();require(o.data==source and sha(master)==MASTER,"source restore")
    report.update(status="PASS_GEOMETRY_COMPARISON",masterUnchanged=True,sharedMeshesRestored=True,artisticReviewRequired=True);write()
    print("ASC-P2A",json.dumps({"status":report["status"],"variants":report["variants"],"comparisons":report["comparisons"]},ensure_ascii=False),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    restore();s.camera=orig_cam
    if cam:bpy.data.objects.remove(cam,do_unlink=True)
    if camdata:bpy.data.cameras.remove(camdata)
    for m in variants.values():bpy.data.meshes.remove(m)
