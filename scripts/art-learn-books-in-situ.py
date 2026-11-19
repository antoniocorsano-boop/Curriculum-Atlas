"""ART-LEARN-05E: reversible in-situ library comparison on exact master."""
import bpy, hashlib, json, math, os, random, sys, time
from pathlib import Path
from collections import Counter
from mathutils import Vector, Matrix
import bmesh
import numpy as np

master,library,prior,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
out.mkdir(parents=True,exist_ok=True)
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def require(x,m):
    if not x:raise RuntimeError(m)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def val(x):
    if isinstance(x,(bool,str)):return x
    if isinstance(x,(int,float)):return round(float(x),8) if math.isfinite(float(x)) else None
    try:return [val(v) for v in x]
    except (TypeError,ValueError):return None
def mesh_hash(m):
    return digest({"vertices":[val(v.co) for v in m.vertices],"edges":[list(e.vertices) for e in m.edges],"faces":[[list(p.vertices),p.material_index,p.use_smooth] for p in m.polygons],"materials":[x.name if x else None for x in m.materials]})
def graph(t):
    if not t:return None
    return {"nodes":[{"name":n.name,"type":n.bl_idname,"inputs":[[i.identifier,bool(i.is_linked),val(i.default_value) if hasattr(i,"default_value") else None] for i in n.inputs],"image":n.image.name if getattr(n,"image",None) else None} for n in sorted(t.nodes,key=lambda n:n.name)],"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in t.links)}
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
p=json.loads(prior.read_text())
require(p["status"]=="PASS_MATERIAL_CANDIDATES" and p["sourceUnchanged"] and p["librarySha256"]==sha(library),"exact 05D source")
require(all(v["geometryEqual"] for v in p["assets"].values()) and not p["artisticApproval"],"05D receipt")
s=bpy.context.scene;orig_cam=s.camera
require(orig_cam and orig_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
original_objects=list(s.objects);original_materials=list(bpy.data.materials)
base_meshes={o.name:o.data for o in original_objects if o.type=="MESH"}
mesh_signatures={m.name:mesh_hash(m) for m in set(base_meshes.values())}
bay_ids=("04-0",)
targets={};book_records=[]
report={"schema":"atlas.art-learning.in-situ/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"librarySha256":sha(library),"sourceArtifact":14528332050,"bays":list(bay_ids),"bookInventory":[],"placements":[],"renders":{},"comparisons":{},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"webglQualified":False}
def write():(out/"in-situ-study.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()
def components(o):
    m=o.data; adj=[[] for v in m.vertices]
    for e in m.edges:
        a,b=e.vertices;adj[a].append(b);adj[b].append(a)
    seen=set();res=[]
    for k in range(len(adj)):
        if k in seen:continue
        ids=[];stack=[k];seen.add(k)
        while stack:
            a=stack.pop();ids.append(a)
            for b in adj[a]:
                if b not in seen:seen.add(b);stack.append(b)
        require(len(ids)>=8,"unexpected small connected component "+o.name)
        co=[m.vertices[i].co for i in ids];world=[o.matrix_world@v for v in co]
        lo=Vector(tuple(min(v[j] for v in co) for j in range(3)));hi=Vector(tuple(max(v[j] for v in co) for j in range(3)))
        center=o.matrix_world@((lo+hi)/2)
        require(all(x>0.001 for x in hi-lo),"degenerate book component "+o.name)
        res.append({"o":o,"ids":ids,"lo":lo,"hi":hi,"center":center,"z0":min(v.z for v in world),"z1":max(v.z for v in world)})
    return res
def source_object(bay,suffix):
    o=s.objects.get("Library bay "+bay+"-Bay "+suffix)
    require(o and o.type=="MESH" and not o.hide_render and len(o.data.materials)==1 and o.data.materials[0].name==suffix,"source book binding "+bay+" "+suffix)
    require(o.matrix_world.to_3x3().col[2].normalized().dot(Vector((0,0,1)))>.999,"upright book binding")
    targets[o.name]=o
    return o
for bay in bay_ids:
    covers=[c for i in range(6) for c in components(source_object(bay,"Book "+str(i)))]
    pages=components(source_object(bay,"Paper"))
    require(len(covers)==len(pages)==77,"book/page inventory drift "+bay+" "+str((len(covers),len(pages))))
    # Match using measured centres in the bay's tangent/vertical coordinates.
    # Radial offset is allowed: the original page block is inset from its cover.
    pairs=[]
    for ci,c in enumerate(covers):
        tangent=c["o"].matrix_world.to_3x3().col[0].normalized()
        for pi,q in enumerate(pages):
            d=q["center"]-c["center"]
            w=(c["hi"]-c["lo"]).x;h=c["z1"]-c["z0"]
            dx=abs(d.dot(tangent));dz=abs(d.z)
            if dx<=max(.02,w*.48) and dz<=max(.035,h*.24) and d.length<=.20:
                pairs.append((dx/max(w,.01)+dz/max(h,.01)+.20*d.length,ci,pi))
    used_c=set();used_p=set();chosen=[]
    for _,ci,pi in sorted(pairs):
        if ci in used_c or pi in used_p:continue
        used_c.add(ci);used_p.add(pi);chosen.append((ci,pi))
    require(len(chosen)==77,"cover/page pairing incomplete "+bay+" "+str(len(chosen)))
    for ci,pi in sorted(chosen):
        c,q=covers[ci],pages[pi]
        rng=random.Random(int(hashlib.sha256((bay+":"+str(ci)).encode()).hexdigest()[:16],16))
        # A reduction only; same pivot and scale for cover and pages, width and
        # depth unchanged, so an existing gap cannot become a horizontal overlap.
        factor=rng.uniform(.83,1.0) if rng.random()<.70 else 1.0
        style=rng.randrange(4)
        c.update(bay=bay,index=ci,pages=q,heightFactor=factor,style=style,ornament=rng.uniform(.12,.23))
        book_records.append(c)
        report["bookInventory"].append({"bay":bay,"index":ci,"coverObject":c["o"].name,"pageObject":q["o"].name,"coverVertices":len(c["ids"]),"pageVertices":len(q["ids"]),"center":val(c["center"]),"pairDistance":(c["center"]-q["center"]).length,"heightFactor":factor,"style":style})

require(len(targets)==7 and len(book_records)==77,"sample scope")
def protected():
    objects=[]
    for o in sorted(original_objects,key=lambda x:x.name):
        d={"name":o.name,"type":o.type,"matrix":val(o.matrix_world),"hide":bool(o.hide_render),"collections":sorted(c.name for c in o.users_collection)}
        if o.type=="MESH":
            d["sourceData"]=base_meshes[o.name].name
            if o.name not in targets:d["actualData"]=o.data.name
            d["materials"]=[m.name if m else None for m in o.data.materials]
        if o.type=="LIGHT":d["light"]={k:val(getattr(o.data,k)) for k in ("type","energy","color","size","size_y","shape","angle","shadow_soft_size") if hasattr(o.data,k)}
        if o.type=="CAMERA":d["camera"]={k:val(getattr(o.data,k)) for k in ("type","lens","sensor_width","sensor_height","shift_x","shift_y","clip_start","clip_end")}
        objects.append(d)
    return digest({"objects":objects,"materials":[[m.name,graph(m.node_tree) if m.use_nodes else None] for m in sorted(original_materials,key=lambda x:x.name)],"world":graph(s.world.node_tree) if s.world else None,"color":{k:val(getattr(s.view_settings,k)) for k in ("view_transform","look","exposure","gamma")},"compositor":graph(s.node_tree) if s.use_nodes else None})
locked=protected();report["protectedStateSha256"]=locked
def intact():return sha(master)==MASTER and sha(library)==report["librarySha256"] and all(mesh_hash(m)==mesh_signatures[m.name] for m in set(base_meshes.values()))
with bpy.data.libraries.load(str(library),link=False) as (src,dst):
    require(set(src.collections)=={"AL05D "+n for n in p["assets"]},"collection inventory")
    dst.collections=sorted(src.collections)
assets={c.name.split()[-1]:c for c in dst.collections}
require(len(assets)==4 and all(c.asset_data and not c.library for c in assets.values()),"asset locality")
require(not any(i.source=="FILE" and not i.packed_file for i in bpy.data.images),"external images")
collection=bpy.data.collections.new("AL05E in-situ experiment");s.collection.children.link(collection)
def bounds(c):
    pts=[]
    for o in c.all_objects:
        require(o.type=="MESH","unexpected library object")
        pts.extend(o.matrix_basis@Vector(v) for v in o.bound_box)
    return Vector(tuple(min(v[k] for v in pts) for k in range(3))),Vector(tuple(max(v[k] for v in pts) for k in range(3)))
asset_bounds={n:bounds(c) for n,c in assets.items()}
# Use 4 original books on each of two visible shelf levels, one of each title.
# A physical source book's envelope is a hard maximum; remove exactly its
# paired original cover and paper components, not adjacent books or furniture.
records=sorted(book_records,key=lambda c:(c["z0"],c["center"].x,c["center"].y))
levels=[]
for c in records:
    if not levels or abs(c["z0"]-levels[-1][0]["z0"])>.045:levels.append([c])
    else:levels[-1].append(c)
eligible=[g for g in levels if len(g)>=8]
require(len(eligible)>=2,"insufficient shelf levels")
chosen_levels=sorted(eligible,key=lambda g:abs(sum(c["center"].z for c in g)/len(g)-2.0))[:2]
placements=[];removed={}
for level in chosen_levels:
    tangent=level[0]["o"].matrix_world.to_3x3().col[0].normalized()
    group=sorted(level,key=lambda c:c["center"].dot(tangent))
    start=(len(group)-4)//2
    sample=group[start:start+4]
    for name,rec in zip(("ATLANTE","NATURA","STORIA","GEOMETRIA"),sample):
        o=rec["o"];lo=rec["lo"];hi=rec["hi"]
        basis=o.matrix_world.to_3x3();axes=[basis.col[k].normalized() for k in range(3)]
        radial=Vector((rec["center"].x,rec["center"].y,0)).normalized()
        sign=1 if axes[1].dot(radial)>0 else -1
        require(abs(axes[1].dot(radial))>.9,"book radial orientation")
        bx,by,bz=axes[0]*sign,axes[1]*sign,axes[2]
        rotation=Matrix((bx,by,bz)).transposed().to_4x4()
        require(rotation.to_3x3().determinant()>.99,"handedness")
        size=Vector(tuple((hi[k]-lo[k])*basis.col[k].length for k in range(3)))
        al,ah=asset_bounds[name];ad=ah-al
        require(all(x>.001 for x in ad),"asset bounds")
        # Leave 2% clearance horizontally and in depth. Use measured height,
        # not a guessed scale; preserve bottom alignment.
        scale=Vector((size.x/ad.x*.98,size.y/ad.y*.98,size.z/ad.z*.99))
        require(all(.25<x<4 for x in scale),"excessive scale")
        front=o.matrix_world@Vector(((lo.x+hi.x)/2,lo.y if sign>0 else hi.y,lo.z))
        origin=front+by*(size.y*.01)
        local=Vector(((al.x+ah.x)/2,al.y,al.z))
        transform=Matrix.Translation(origin)@rotation@Matrix.Diagonal((*scale,1))@Matrix.Translation(-local)
        inv=o.matrix_world.inverted()
        for i in range(8):
            v=Vector(tuple(ah[k] if i&(1<<k) else al[k] for k in range(3)));q=inv@(transform@v)
            require(all(lo[k]-.00005<=q[k]<=hi[k]+.00005 for k in range(3)),"replacement leaves source envelope")
        placements.append((name,transform,rec))
        for part in (rec,rec["pages"]):removed.setdefault(part["o"].name,set()).update(part["ids"])
        report["placements"].append({"title":name,"bay":rec["bay"],"sourceIndex":rec["index"],"cover":o.name,"paper":rec["pages"]["o"].name,"sourceSize":val(size),"scale":val(scale),"matrix":val(transform),"sourceEnvelopeVerified":True})
require(len(placements)==8 and len({r["sourceIndex"] for r in report["placements"]})==8,"placement inventory")
write()
instances=[];copies=[]
def restore():
    for name,o in targets.items():o.data=base_meshes[name]
    for o in instances:bpy.data.objects.remove(o,do_unlink=True)
    instances.clear()
    for m in copies:bpy.data.meshes.remove(m)
    copies.clear();bpy.context.view_layer.update()
def apply():
    restore()
    for name,ids in removed.items():
        o=targets[name];m=base_meshes[name].copy();m.name="AL05E residual "+name;copies.append(m);o.data=m
        bm=bmesh.new()
        try:
            bm.from_mesh(m);bm.verts.ensure_lookup_table()
            bmesh.ops.delete(bm,geom=[bm.verts[i] for i in sorted(ids)],context="VERTS")
            bm.to_mesh(m);m.update()
        finally:bm.free()
        require(len(m.vertices)==len(base_meshes[name].vertices)-len(ids),"residual geometry mismatch")
    for i,(name,matrix,_) in enumerate(placements):
        o=bpy.data.objects.new("AL05E placed "+str(i)+" "+name,None);collection.objects.link(o);instances.append(o)
        o.instance_type="COLLECTION";o.instance_collection=assets[name];o.matrix_world=matrix
    bpy.context.view_layer.update()
    require(protected()==locked and intact(),"protected source drift")
    return {"instances":len(instances),"residualMeshes":len(copies)}
target=sum((r["center"] for _,_,r in placements),Vector())/len(placements)
radial=Vector((target.x,target.y,0)).normalized()
camdata=bpy.data.cameras.new("AL05E contextual lens");cam=bpy.data.objects.new("AL05E contextual",camdata);collection.objects.link(cam)
camdata.lens=50;camdata.clip_start=.05;camdata.clip_end=150
cam.location=target-radial*2.45+Vector((0,0,.09));cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
cams={n:s.objects.get(n) for n in ("atrium","detail")};require(all(o and o.type=="CAMERA" for o in cams.values()),"camera bindings");cams["context"]=cam
report["contextCamera"]={"location":val(cam.location),"target":val(target),"lens":camdata.lens}
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a);return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=24;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_percentage=75;s.render.image_settings.file_format="PNG"
try:
    for view,camera in cams.items():
        s.camera=camera;arrays={}
        for mode in ("baseline","candidate","restored"):
            scope=apply() if mode=="candidate" else (restore() or {"instances":0,"residualMeshes":0})
            key=view+"-"+mode;path=out/(key+".png");s.render.filepath=str(path)
            start=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path)
            require(np.isfinite(a).all() and a.max()>0,"invalid render")
            arrays[mode]=a;require(protected()==locked and intact(),"protected source drift")
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"camera":camera.name,**scope}
            report["comparisons"][key]=compare(arrays["baseline"],a);write()
        rb=report["comparisons"][view+"-restored"];require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback drift "+view)
    require(report["comparisons"]["context-candidate"]["changedPixels"]>0,"no contextual effect")
    restore();s.camera=orig_cam;require(protected()==locked and intact() and all(o.data==base_meshes[n] for n,o in targets.items()),"final source guard")
    report.update(status="PASS_IN_SITU_CANDIDATE",sourceUnchanged=True,protectedStateUnchanged=True,sharedMeshesRestored=True,artisticReviewRequired=True);write()
    print("ART_LEARN_05E PASS",len(placements),"measured placements",flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    restore();s.camera=orig_cam;bpy.data.objects.remove(cam,do_unlink=True);bpy.data.cameras.remove(camdata);bpy.data.collections.remove(collection)
