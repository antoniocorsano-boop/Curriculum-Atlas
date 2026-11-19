"""Bake the nine still-approximate visible material objects of bay 04-0.
The hidden paper is retained, not optimized away. Master bytes never written.
Each object is restored before the next bake so illumination remains original.
"""
import bpy, numpy as np, hashlib, json, os, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from atlas_linear_texture_contract import preflight, export_opaque_rgb, pixels

master,baydir,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
PREVIEW="abfb83b9c9cf17d5c3e46c79eaa7ac9dab96e3cc"
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def need(x,msg):
    if not x:raise RuntimeError(msg)
def canon(a):
    return sorted(tuple(sorted(tuple(round(float(x),5) for x in v) for v in tri)) for tri in a.reshape(-1,3,3))
need(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
bay=json.loads((baydir/"bay.json").read_text())
need(bay["revision"]==os.environ["ATLAS_EXACT_HEAD"] and bay["masterUnchanged"],"bay export identity")
need(bay["sha256"]==sha(baydir/"bay.f32")=="74edac6cc8e4a2a7f6a13b5345731eb2c6ab8e837cd1662d19bc6f811ff953ab","qualified bay geometry")
base=np.fromfile(baydir/"bay.f32",dtype="<f4").reshape(-1,11)
out.mkdir(parents=True,exist_ok=True)
s=bpy.context.scene
need(len(bay["objects"])==11 and bay["triangles"]==19008,"bay inventory")
targets=[x for x in bay["objects"] if x["object"]!=bay["target"] and not x["object"].endswith("-Bay Paper")]
papers=[x["object"] for x in bay["objects"] if x["object"].endswith("-Bay Paper")]
need(len(targets)==9 and len(papers)==1,"scope")
bindings={o.name:o.data for o in s.objects if o.type=="MESH"}
source_materials={n:tuple(m.materials) for n,m in bindings.items()}
def effective_slots(o):
    return tuple((slot.link,slot.material) for slot in o.material_slots)
object_slots={n:effective_slots(bpy.data.objects[n]) for n in bindings}
def verify_originals():
    need(all(bpy.data.objects[n].data==m and tuple(m.materials)==source_materials[n]
             and effective_slots(bpy.data.objects[n])==object_slots[n]
             for n,m in bindings.items()),"source data or object material bindings drift")
def bind_isolated(o,d,slots,clones):
    # Resolve effective materials BEFORE changing mesh. An OBJECT-linked slot
    # can override the DATA material even for different users of the same mesh.
    need(len(d.materials)==len(slots)>0,"material slot count")
    o.data=d
    for i,(link,mat) in enumerate(slots):
        need(link in ("DATA","OBJECT") and mat is not None and mat.use_nodes,"unsupported effective material")
        c=mat.copy();clones.append(c)
        o.material_slots[i].link="DATA"
        d.materials[i]=c
        need(o.material_slots[i].material==c,"effective clone binding")
    need(effective_slots(o)==tuple(("DATA",c) for c in clones),"isolated effective bindings")
def restore_slots(o,source,slots):
    o.data=source
    need(len(o.material_slots)==len(slots),"restore slot count")
    # DATA slots must not be assigned through the object: that would write the
    # shared source mesh. Only restore the original OBJECT override pointers.
    for i,(link,mat) in enumerate(slots):
        slot=o.material_slots[i];slot.link=link
        if link=="OBJECT":slot.material=mat
        else:need(slot.material==mat,"shared DATA material drift")
    need(effective_slots(o)==slots,"effective slot rollback")
def slot_inventory(o,slots):
    indices=[int(p.material_index) for p in o.data.polygons]
    need(len(slots)==len(o.data.materials)>0 and all(0<=i<len(slots) for i in indices),"material index range "+o.name)
    need(all(link in ("DATA","OBJECT") and mat is not None and mat.use_nodes for link,mat in slots),"unsupported effective source "+o.name)
    return {"object":o.name,"mesh":o.data.name,"meshUsers":int(o.data.users),
            "slots":[{"index":i,"link":link,"effectiveMaterial":mat.name,
                      "dataMaterial":o.data.materials[i].name if o.data.materials[i] else None,
                      "faces":indices.count(i)} for i,(link,mat) in enumerate(slots)]}
def test_shared_override():
    # Small deterministic adversarial case, before real geometry or costly bake.
    mesh=bpy.data.meshes.new("ASC slot test mesh")
    mesh.from_pydata([(0,0,0),(1,0,0),(0,1,0),(1,1,0)],[],[(0,1,2),(1,3,2)])
    mats=[];objects=[];clones=[];d=None
    try:
        for label in ("data0","data1","overrideA","overrideB"):
            mat=bpy.data.materials.new("ASC slot test "+label);mat.use_nodes=True;mats.append(mat)
        mesh.materials.append(mats[0]);mesh.materials.append(mats[1]);mesh.polygons[1].material_index=1
        for i in range(2):
            o=bpy.data.objects.new("ASC slot test "+str(i),mesh);objects.append(o)
            o.material_slots[1].link="OBJECT";o.material_slots[1].material=mats[2+i]
        a,b=objects;sa,sb=effective_slots(a),effective_slots(b)
        need(sa==(("DATA",mats[0]),("OBJECT",mats[2])) and sb==(("DATA",mats[0]),("OBJECT",mats[3])),"canary initial identity")
        d=mesh.copy()
        try:
            bind_isolated(a,d,sa,clones)
            need(b.data==mesh and effective_slots(b)==sb and tuple(mesh.materials)==tuple(mats[:2]),"canary sibling drift")
            need(clones[0].name.startswith(mats[0].name) and clones[1].name.startswith(mats[2].name),"canary override resolution")
        finally:restore_slots(a,mesh,sa)
        need(a.data==b.data==mesh and effective_slots(a)==sa and effective_slots(b)==sb,"canary rollback")
        return {"passed":True,"sharedMesh":True,"mixedDataAndObject":True,"distinctOverrides":True,"siblingUnchanged":True,"rollback":True}
    finally:
        for o in objects:bpy.data.objects.remove(o,do_unlink=True)
        if d:bpy.data.meshes.remove(d)
        bpy.data.meshes.remove(mesh)
        for mat in clones+mats:bpy.data.materials.remove(mat)

report={"schema":"atlas.library.bay-baked-surround/v1","revision":os.environ["ATLAS_EXACT_HEAD"],"priorRevision":PREVIEW,"masterSha256":MASTER,"baySha256":bay["sha256"],"status":"PENDING","objects":[],"retainedTarget":bay["target"],"retainedPaper":papers,"staticCombinedApproximation":True,"artisticApproval":False,"webglQualified":False,"publishable":False}
def write():
    (out/"baked-surround.json").write_text(json.dumps(report,indent=2,allow_nan=False)+"\n")
write()
def uv_occupancy(mesh,uv,size):
    counts=np.zeros((size,size),np.uint16);minarea=1.
    for tri in mesh.loop_triangles:
        p=np.array([tuple(uv.data[i].uv) for i in tri.loops],dtype=np.float64)
        need(np.isfinite(p).all() and p.min()>=-1e-7 and p.max()<=1+1e-7,"UV bounds")
        v,w=p[1]-p[0],p[2]-p[0];det=float(v[0]*w[1]-v[1]*w[0])
        need(abs(det)>1e-13,"degenerate UV triangle")
        minarea=min(minarea,abs(det)/2)
        lo=np.maximum(0,np.floor(p.min(axis=0)*size).astype(int));hi=np.minimum(size-1,np.floor(p.max(axis=0)*size).astype(int))
        xx,yy=np.meshgrid((np.arange(lo[0],hi[0]+1)+.5)/size,(np.arange(lo[1],hi[1]+1)+.5)/size)
        dx=xx-p[0,0];dy=yy-p[0,1]
        u=(dx*w[1]-dy*w[0])/det;t=(v[0]*dy-v[1]*dx)/det
        counts[lo[1]:hi[1]+1,lo[0]:hi[0]+1]+=((u>1e-7)&(t>1e-7)&(u+t<1-1e-7)).astype(np.uint16)
    return counts,minarea

try:
    report["materialBindingPreflight"]={"synthetic":test_shared_override(),"real":[],"passed":False};write()
    verify_originals()
    for item in targets:
        o=bpy.data.objects[item["object"]];source=o.data;slots=object_slots[o.name]
        need(not o.modifiers,"unsupported source modifiers "+o.name)
        entry=slot_inventory(o,slots);d=source.copy();clones=[]
        try:
            bind_isolated(o,d,slots,clones)
            need(all(c!=original for c,(_,original) in zip(clones,slots)),"source material not isolated")
            entry["isolatedCloneCount"]=len(clones)
        finally:
            restore_slots(o,source,slots)
            bpy.data.meshes.remove(d)
            for c in clones:bpy.data.materials.remove(c)
        verify_originals()
        entry["rollback"]=True;report["materialBindingPreflight"]["real"].append(entry);write()
    need(any(q["link"]=="OBJECT" for entry in report["materialBindingPreflight"]["real"] for q in entry["slots"]),"original override regression not covered")
    report["materialBindingPreflight"]["passed"]=True;write()
    report["preflight"]=preflight(out);write()
    need(report["preflight"]["passed"],"preventive EXR transfer")
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=64
    s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
    s.render.threads_mode="FIXED";s.render.threads=2
    for idx,item in enumerate(targets):
        name=item["object"];o=bpy.data.objects[name];source=o.data;slots=object_slots[name];d=None;clones=[];im=None;loaded=None
        rec={"object":name,"mesh":source.name,"id":"surface-%02d"%idx,"sourceTriangles":item["triangles"],"state":"PENDING"}
        report["objects"].append(rec);write()
        try:
            rec["materialSlots"]=slot_inventory(o,slots)["slots"];write()
            primary=next((u.name for u in source.uv_layers if u.active_render),None)
            original_indices=tuple(p.material_index for p in source.polygons)
            d=source.copy();d.name="Atlas bay baked "+source.name
            bind_isolated(o,d,slots,clones)
            bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
            uv=d.uv_layers.new(name="ASC_BayBake");need(uv.name=="ASC_BayBake","UV layer conflict")
            d.uv_layers.active=uv
            bpy.ops.object.mode_set(mode="EDIT");bpy.ops.mesh.select_all(action="SELECT")
            need("FINISHED" in bpy.ops.uv.smart_project(island_margin=.025),"smart project")
            need("FINISHED" in bpy.ops.uv.pack_islands(margin_method="FRACTION",margin=.012),"pack islands")
            bpy.ops.object.mode_set(mode="OBJECT");d.update();d.calc_loop_triangles()
            uv=d.uv_layers.get("ASC_BayBake");need(uv is not None and len(uv.data)==len(d.loops),"UV reacquire")
            size=512
            raw=np.array([tuple(x.uv) for x in uv.data],dtype=np.float64)
            lo=raw.min(axis=0);hi=raw.max(axis=0);span=hi-lo
            need(np.isfinite(raw).all() and span.min()>1e-8,"UV extent")
            fit=(raw-(lo+hi)/2)*((1-16/size)/span.max())+.5
            for loop,value in zip(uv.data,fit):loop.uv=tuple(value)
            d.update();uv=d.uv_layers.get("ASC_BayBake");d.uv_layers.active=uv
            # Bake uses its explicit UV layer; original material graph still sees original render UV.
            if primary:
                d.uv_layers[primary].active_render=True
            else:
                uv.active_render=True
            counts,minarea=uv_occupancy(d,uv,size);covered=counts>0
            rec["uv"]={"size":size,"occupiedTexels":int(covered.sum()),"overlapTexels":int((counts>1).sum()),"minTriangleArea":minarea,"borderPixels":8,"bakeMarginPixels":4,"sampledOnly":True,"sourceRenderUV":primary}
            write()
            need(rec["uv"]["occupiedTexels"]>100 and rec["uv"]["overlapTexels"]==0,"UV coverage "+name)
            im=bpy.data.images.new(rec["id"],width=size,height=size,alpha=True,float_buffer=True)
            im.colorspace_settings.name="Linear Rec.709"
            need(tuple(p.material_index for p in d.polygons)==original_indices,"material face assignment drift")
            need(effective_slots(o)==tuple(("DATA",c) for c in clones),"bake effective material binding")
            for c in clones:
                tree=c.node_tree;node=tree.nodes.new("ShaderNodeTexImage");node.image=im
                for n in tree.nodes:n.select=False
                node.select=True;tree.nodes.active=node
            bpy.context.view_layer.update()
            bake=s.render.bake
            for prop in ("use_pass_direct","use_pass_indirect","use_pass_diffuse","use_pass_glossy","use_pass_transmission","use_pass_emit"):
                if hasattr(bake,prop):setattr(bake,prop,True)
            need("FINISHED" in bpy.ops.object.bake(type="COMBINED",uv_layer=uv.name,margin=4,use_clear=True),"combined bake "+name)
            a=pixels(im).copy();need(np.isfinite(a).all() and a[:,:,:3].max()>0,"empty bake "+name)
            alphaCoverage=float(np.count_nonzero(a[:,:,3][covered]>0)/covered.sum())
            rec["alphaCoverage"]=alphaCoverage;write()
            need(alphaCoverage>=.95,"incomplete bake "+name)
            exr=out/(rec["id"]+".exr")
            loaded,transfer=export_opaque_rgb(a,exr);need(transfer["outsideTolerance"]==0,"EXR transfer "+name)
            a=pixels(loaded).copy();a[:,:,3]=1
            rawpath=out/(rec["id"]+".rgba32f");rawpath.write_bytes(np.ascontiguousarray(a,dtype="<f4").tobytes())
            deps=bpy.context.evaluated_depsgraph_get();ev=o.evaluated_get(deps);mesh=ev.to_mesh()
            try:
                mesh.calc_loop_triangles();buv=mesh.uv_layers.get("ASC_BayBake")
                need(buv is not None,"evaluated UV missing")
                rows=[]
                for tri in mesh.loop_triangles:
                    for li in tri.loops:
                        p=ev.matrix_world@mesh.vertices[mesh.loops[li].vertex_index].co
                        rows.append([*p,*buv.data[li].uv])
                rows=np.asarray(rows,dtype="<f4")
            finally:ev.to_mesh_clear()
            original=base[item["firstVertex"]:item["firstVertex"]+item["vertexCount"],:3]
            need(rows.shape==(item["vertexCount"],5) and np.isfinite(rows).all() and canon(rows[:,:3])==canon(original),"geometry identity "+name)
            geometry=out/(rec["id"]+".f32");geometry.write_bytes(rows.tobytes())
            rec.update(state="PASS_BAKED_SURFACE",transfer=transfer,geometrySha256=sha(geometry),textureSha256=sha(rawpath),vertices=len(rows),width=size,height=size,sourceMaterials=[m.name for _,m in slots])
            write()
        finally:
            if o.mode!="OBJECT":bpy.ops.object.mode_set(mode="OBJECT")
            restore_slots(o,source,slots);bpy.context.view_layer.update()
            if d:bpy.data.meshes.remove(d)
            for c in clones:bpy.data.materials.remove(c)
            if loaded:bpy.data.images.remove(loaded)
            if im:bpy.data.images.remove(im)
        verify_originals()
        rec["materialBindingsRestored"]=True;write()
    need(sha(master)==MASTER,"master changed")
    report.update(status="PASS_BAY_SURROUND_PACKAGE",masterUnchanged=True,bindingsRestored=True,objectMaterialBindingsRestored=True)
    write();print("ASC BAY SURROUND",json.dumps(report),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
