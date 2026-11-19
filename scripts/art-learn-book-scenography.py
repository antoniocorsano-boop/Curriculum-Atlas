"""ART-LEARN-05A: deterministic original book construction in four real bays.
Separate shape and spine detail; immutable master; only temporary derivative data.
"""
import bpy, hashlib, json, math, os, random, sys, time
from pathlib import Path
from collections import Counter
from mathutils import Vector
import numpy as np

master,prior,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
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
require(p["status"]=="PASS_LIMESTONE_CANDIDATES" and p["masterSha256"]==MASTER and p["sourceUnchanged"] and not p["artisticApproval"],"prior evidence")
s=bpy.context.scene;orig_cam=s.camera
require(orig_cam and orig_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
require(all(i.packed_file for i in bpy.data.images if i.source=="FILE"),"unpacked resource")
bay_ids=("02-0","03-0","04-0","05-0")
original_objects=list(s.objects);original_materials=list(bpy.data.materials)
base_meshes={o.name:o.data for o in original_objects if o.type=="MESH"}
mesh_signatures={m.name:mesh_hash(m) for m in set(base_meshes.values())}
targets={}; book_records=[]; matching=[]; temp_meshes=[];temp_objects=[];temp_materials=[]
report={"schema":"atlas.art-learning.scenography/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"priorArtifact":14497991405,"priorStudySha256":sha(prior),"bays":list(bay_ids),"principle":"Treat covers and pages as a paired physical book; add restrained original spine relief. Preserve source architecture and no automatic promotion.","renders":{},"comparisons":{},"bookInventory":[],"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"crossWorldQualified":False}
def write():(out/"scenography-study.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
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
write()
require(len(targets)==28 and len(book_records)==308,"sample scope")
def protected():
    objects=[]
    for o in sorted(original_objects,key=lambda x:x.name):
        d={"name":o.name,"type":o.type,"matrix":val(o.matrix_world),"hide":bool(o.hide_render),"collections":sorted(c.name for c in o.users_collection)}
        if o.type=="MESH":
            source=base_meshes[o.name]
            d["sourceData"]=source.name
            if o.name not in targets:d["actualData"]=o.data.name
            d["materials"]=[m.name if m else None for m in o.data.materials]
        if o.type=="LIGHT":d["light"]={k:val(getattr(o.data,k)) for k in ("type","energy","color","size","size_y","shape","angle","shadow_soft_size") if hasattr(o.data,k)}
        if o.type=="CAMERA":d["camera"]={k:val(getattr(o.data,k)) for k in ("type","lens","sensor_width","sensor_height","shift_x","shift_y","clip_start","clip_end")}
        objects.append(d)
    return digest({"objects":objects,"materials":[[m.name,graph(m.node_tree) if m.use_nodes else None] for m in sorted(original_materials,key=lambda x:x.name)],"world":graph(s.world.node_tree) if s.world else None,"color":{k:val(getattr(s.view_settings,k)) for k in ("view_transform","look","exposure","gamma")},"compositor":graph(s.node_tree) if s.use_nodes else None})
locked=protected();report["protectedStateSha256"]=locked
def source_intact():
    return all(mesh_hash(m)==mesh_signatures[m.name] for m in set(base_meshes.values()))
# All experimental objects are linked to a distinct temporary collection.
collection=bpy.data.collections.new("AL05 temporary scenery");s.collection.children.link(collection)
def mat(name,rgb,rough,metal=0):
    m=bpy.data.materials.new("AL05 "+name);temp_materials.append(m);m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF");bs.inputs["Base Color"].default_value=(*rgb,1);bs.inputs["Roughness"].default_value=rough;bs.inputs["Metallic"].default_value=metal
    return m
trim=[mat("muted gold",(.28,.16,.055),.48,.52),mat("aged ivory",(.55,.43,.28),.82),mat("dark leather",(.035,.025,.017),.78)]
def remove_variants():
    for name,o in targets.items():o.data=base_meshes[name]
    for o in temp_objects:bpy.data.objects.remove(o,do_unlink=True)
    temp_objects.clear()
    for m in temp_meshes:bpy.data.meshes.remove(m)
    temp_meshes.clear()
    bpy.context.view_layer.update()
def apply(shape,detail):
    remove_variants()
    if shape:
        for name,o in targets.items():
            m=base_meshes[name].copy();m.name="AL05 "+name;temp_meshes.append(m);o.data=m
        for c in book_records:
            pivot=c["z0"];f=c["heightFactor"]
            for part in (c,c["pages"]):
                o=part["o"];inv=o.matrix_world.inverted()
                for idx in part["ids"]:
                    src=base_meshes[o.name].vertices[idx].co
                    w=o.matrix_world@src;old=w.copy();w.z=pivot+(w.z-pivot)*f
                    require(abs(w.x-old.x)<1e-8 and abs(w.y-old.y)<1e-8,"horizontal mutation")
                    o.data.vertices[idx].co=inv@w
        for o in targets.values():o.data.update()
    if detail:
        for bay in bay_ids:
            verts=[];faces=[];mids=[]
            def box(o,lo,hi,mi):
                k=len(verts)
                verts.extend([o.matrix_world@Vector((x,y,z)) for x,y,z in ((lo.x,lo.y,lo.z),(hi.x,lo.y,lo.z),(hi.x,hi.y,lo.z),(lo.x,hi.y,lo.z),(lo.x,lo.y,hi.z),(hi.x,lo.y,hi.z),(hi.x,hi.y,hi.z),(lo.x,hi.y,hi.z))])
                faces.extend([tuple(k+i for i in ids) for ids in ((0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7))]);mids.extend([mi]*6)
            for c in book_records:
                if c["bay"]!=bay or c["style"]==0:continue
                o=c["o"];lo=c["lo"];hi=c["hi"];w=hi.x-lo.x;h=hi.z-lo.z
                radial=Vector((c["center"].x,c["center"].y,0)).normalized()
                local_y=o.matrix_world.to_3x3().col[1].normalized();sign=1 if local_y.dot(radial)>0 else -1
                require(abs(local_y.dot(radial))>.90,"spine orientation")
                front=lo.y if sign>0 else hi.y
                # A small raised band is placed on the inward-facing spine,
                # not on the paper block. The original bevel remains visible.
                depth=min(.0018,(hi.y-lo.y)*.07)
                y0,y1=(front-depth,front+depth*.20) if sign>0 else (front-depth*.20,front+depth)
                # Height follows the same measured book pivot in shaped mode.
                f=c["heightFactor"] if shape else 1.
                local_pivot=(o.matrix_world.inverted()@Vector((c["center"].x,c["center"].y,c["z0"]))).z
                def z(t):return local_pivot+(lo.z+h*t-local_pivot)*f
                def band(t,th,margin,mi):
                    box(o,Vector((lo.x+w*margin,y0,z(t-th/2))),Vector((hi.x-w*margin,y1,z(t+th/2))),mi)
                if c["style"]==1:
                    band(.19,.026,.18,0);band(.79,.026,.18,0)
                elif c["style"]==2:
                    band(.66,.12,.20,1);band(.21,.022,.20,2)
                else:
                    band(.30,.036,.16,0);band(.35,.014,.16,0);band(.80,.023,.16,2)
            require(len(verts)>0,"empty spine detail "+bay)
            m=bpy.data.meshes.new("AL05 spine "+bay);temp_meshes.append(m);m.from_pydata(verts,[],faces);m.update()
            for x in trim:m.materials.append(x)
            for face,mi in zip(m.polygons,mids):face.material_index=mi
            o=bpy.data.objects.new("AL05 spine "+bay,m);collection.objects.link(o);temp_objects.append(o)
    bpy.context.view_layer.update()
    require(protected()==locked,"protected objects changed")
    require(source_intact(),"source geometry mutated")
    if shape:
        for name,o in targets.items():
            a=base_meshes[name];b=o.data
            require(len(a.vertices)==len(b.vertices) and len(a.polygons)==len(b.polygons),"shape topology changed")
            require(all(abs(v.co.x-u.co.x)<1e-5 and abs(v.co.y-u.co.y)<1e-5 for u,v in zip(a.vertices,b.vertices)),"shape horizontal drift")
    require(len(s.objects)==len(original_objects)+len(temp_objects)+1,"unplanned scene inventory")
    return {"changedMeshes":len(targets) if shape else 0,"ornamentMeshes":len(temp_objects),"addedVertices":sum(len(o.data.vertices) for o in temp_objects),"addedFaces":sum(len(o.data.polygons) for o in temp_objects)}
# Explicit detail camera, derived from the measured front-facing book group.
chosen=[c for c in book_records if c["bay"]=="04-0"]
target=sum((c["center"] for c in chosen),Vector())/len(chosen)
radial=Vector((target.x,target.y,0)).normalized()
camdata=bpy.data.cameras.new("AL05 close-up lens");cam=bpy.data.objects.new("AL05 close-up",camdata);collection.objects.link(cam)
camdata.lens=43;camdata.clip_start=.05;camdata.clip_end=150
cam.location=target-radial*3.55+Vector((0,0,.15))
cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
report["detailCamera"]={"position":val(cam.location),"target":val(target),"lensMm":43,"derivedFrom":"04-0"}
cams={n:s.objects.get(n) for n in ("atrium","detail")}
require(all(o and o.type=="CAMERA" for o in cams.values()),"camera bindings")
cams["closeup"]=cam
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a);return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=24;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_percentage=75;s.render.image_settings.file_format="PNG"
cases={"01-reference":(False,False),"02-shape":(True,False),"03-spines":(False,True),"04-combined":(True,True),"05-restored":(False,False)}
try:
    for view,camera in cams.items():
        s.camera=camera;arrays={}
        keys=list(cases) if view=="detail" else ["01-reference","04-combined","05-restored"]
        for case in keys:
            shape,detail=cases[case];scope=apply(shape,detail)
            key=view+"-"+case;path=out/(key+".png");s.render.filepath=str(path)
            start=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path)
            require(np.isfinite(a).all() and a.max()>0,"invalid render")
            arrays[case]=a
            require(protected()==locked and source_intact(),"render altered source state")
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"camera":camera.name,"shape":shape,"detail":detail,**scope}
            report["comparisons"][key]=compare(arrays["01-reference"],a);write()
        rb=report["comparisons"][view+"-05-restored"]
        require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback drift "+view)
    for key in ("detail-02-shape","detail-03-spines","closeup-04-combined"):
        require(report["comparisons"][key]["changedPixels"]>0,"no measured effect "+key)
    remove_variants();s.camera=orig_cam
    require(protected()==locked and source_intact() and sha(master)==MASTER,"final source protection")
    require(all(o.data==base_meshes[name] for name,o in targets.items()),"shared meshes not restored")
    report.update(status="PASS_BOOK_SCENOGRAPHY_CANDIDATES",sourceUnchanged=True,protectedStateUnchanged=True,sharedMeshesRestored=True,artisticReviewRequired=True,webglQualified=False);write()
    print("ART_LEARN_05A",report["status"],len(book_records),"paired books",flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    remove_variants();s.camera=orig_cam
    bpy.data.objects.remove(cam,do_unlink=True);bpy.data.cameras.remove(camdata)
    for m in temp_materials:bpy.data.materials.remove(m)
    bpy.data.collections.remove(collection)
