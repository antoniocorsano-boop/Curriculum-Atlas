"""ASC-P2C1: isolated, real diffuse bake on a measured visible surface; no promotion."""
import bpy, hashlib, json, os, sys
from pathlib import Path
from mathutils import Vector
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parent))
from atlas_linear_texture_contract import preflight, export_opaque_rgb, legacy_probe

master, p2a, p2b, out = map(lambda p: Path(p).resolve(), sys.argv[sys.argv.index("--")+1:])
MASTER = "f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
P2B = "b9bff7378eb6b7337efb16e734711906b5fdd328"
def require(ok, message):
    if not ok:
        raise RuntimeError(message)
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def pixels(im):
    w,h = im.size
    a=np.empty(w*h*4,np.float32)
    im.pixels.foreach_get(a)
    return a.reshape(h,w,4)
def file_pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        return pixels(im).copy()
    finally:
        bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a[:,:,:3]-b[:,:,:3])
    return {"pixels":int(d.shape[0]*d.shape[1]),"changedPixels":int(np.count_nonzero(d.max(axis=2)>1/255)), "meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
a=json.loads(p2a.read_text()); r=json.loads(p2b.read_text())
require(a["revision"]=="5c2405291d1f4bcc499db848ec0a980de3ae5c1a" and a["status"]=="PASS_GEOMETRY_COMPARISON" and a["masterSha256"]==MASTER,"P2A receipt")
require(r["revision"]==P2B and r["status"]=="PASS_EXTENSION_COMPARISON" and r["masterSha256"]==MASTER and r["masterUnchanged"] and r["sharedMeshesRestored"],"P2B receipt")
require(all(v["baseline"]["firstHitPaper"]==0 and v["candidate"]["firstHitPaper"]==0 for v in r["visibility"].values()),"paper visibility changed")
require(all(r["comparisons"][v+"-candidate"]["changedPixels"]==0 for v in ("atrium","detail","context")),"native parity")
require(r["comparisons"]["witness-candidate"]["changedPixels"]>0,"witness difference absent")
s=bpy.context.scene
require(s.camera and s.camera.name=="atrium" and not bpy.data.libraries,"scene identity")
col=bpy.data.collections.get("02 Campate condivise")
require(col is not None,"bay collection")
# Rank visible non-paper pilot surfaces by measured first hits, not by geometry cost.
options=[]
for v in ("atrium","detail","context"):
    for name,hits in r["visibility"][v]["baseline"]["firstHits"].items():
        o=bpy.data.objects.get(name)
        if hits>0 and o and o.type=="MESH" and o.name in col.all_objects and name.startswith("Library bay 04-0-") and not name.endswith("-Bay Paper") and not o.hide_render and not o.modifiers and len(o.data.materials)>0 and all(m and m.use_nodes for m in o.data.materials) and all(slot.link=="DATA" for slot in o.material_slots):
            options.append((hits,name,v))
require(options,"no measured visible eligible pilot surface")
# Prefer visible book covers/spines, then other architectural surfaces.
books=[x for x in options if "-Bay Book " in x[1]]
hits,name,view=sorted(books or options,key=lambda q:(-q[0],q[1],q[2]))[0]
o=bpy.data.objects[name]; source=o.data; source_mats=list(source.materials)
orig_cam=s.camera
bindings={x.name:x.data for x in s.objects if x.type=="MESH"}
out.mkdir(parents=True,exist_ok=True)
report={"schema":"atlas.asc01.diffuse-bake/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"p2bReceiptSha256":sha(p2b),"target":{"object":name,"mesh":source.name,"view":view,"firstHits":hits,"sampledRays":6144,"materials":[m.name for m in source_mats],"selection":"visible-book-preferred"},"renders":{},"masterModified":False,"runtimeModified":False,"artisticApproval":False,"webglQualified":False,"studentAuthorized":False,"publishable":False,"lightmapTransferQualified":False}
def write():
    (out/"diffuse-bake.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()
derived=None; clones=[]; image=None; transferred=None; preview=None; cam=None; camdata=None
def render(key):
    p=out/(key+".png")
    s.render.filepath=str(p)
    bpy.ops.render.render(write_still=True)
    data=file_pixels(p)
    require(np.isfinite(data).all() and data.max()>0,"invalid render")
    report["renders"][key]={"sha256":sha(p),"width":int(data.shape[1]),"height":int(data.shape[0])}
    return data
try:
    report["transferPreflight"]=preflight(out)
    write()
    require(report["transferPreflight"]["passed"],"linear EXR transfer canary failed before production")
    if view=="context":
        camdata=bpy.data.cameras.new("ASC P2C context")
        cam=bpy.data.objects.new("ASC P2C context",camdata);s.collection.objects.link(cam)
        camdata.lens=a["contextCamera"]["lens"];camdata.clip_start=.05;camdata.clip_end=150
        cam.location=Vector(a["contextCamera"]["location"])
        cam.rotation_euler=(Vector(a["contextCamera"]["target"])-cam.location).to_track_quat("-Z","Y").to_euler()
        s.camera=cam
    elif view=="detail":
        s.camera=s.objects.get("detail")
    require(s.camera and s.camera.type=="CAMERA","selected camera")
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=16;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
    s.render.threads_mode="FIXED";s.render.threads=2
    s.render.resolution_x=720 if view=="atrium" else 640;s.render.resolution_y=450 if view=="atrium" else 480
    s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
    report["color"]={"viewTransform":s.view_settings.view_transform,"look":s.view_settings.look,"exposure":float(s.view_settings.exposure),"gamma":float(s.view_settings.gamma),"bakeSpace":"scene-linear EXR","preview":"same Blender view transform; not r128"}
    ref=render("native-baseline")
    derived=source.copy();derived.name="ASC P2C isolated "+source.name;o.data=derived
    bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
    uv=derived.uv_layers.new(name="ASC_Lightmap")
    require(uv.name=="ASC_Lightmap","UV name conflict")
    derived.uv_layers.active=uv;uv.active_render=True
    bpy.ops.object.mode_set(mode="EDIT");bpy.ops.mesh.select_all(action="SELECT")
    result=bpy.ops.uv.smart_project(island_margin=.025)
    require("FINISHED" in result,"UV smart project did not finish")
    bpy.ops.object.mode_set(mode="OBJECT")
    # Edit-mode conversion can replace the mesh CustomData storage. Never reuse
    # an RNA layer handle obtained before this conversion.
    derived.update();derived.calc_loop_triangles()
    uv=derived.uv_layers.get("ASC_Lightmap")
    require(uv is not None and len(uv.data)==len(derived.loops),"UV layer missing after unwrap")
    derived.uv_layers.active=uv;uv.active_render=True
    size=512
    raw=np.array([tuple(loop.uv) for loop in uv.data],dtype=np.float64)
    require(raw.shape==(len(derived.loops),2) and np.isfinite(raw).all(),"invalid UV coordinates")
    lo_uv=raw.min(axis=0);hi_uv=raw.max(axis=0);span=hi_uv-lo_uv
    require(float(span.min())>1e-8,"degenerate UV atlas extent")
    # Uniform affine fit preserves island layout, proportions and overlaps.
    # Reserve eight texels at the outside for the four-texel bake dilation.
    border=8/size
    factor=(1-2*border)/float(span.max())
    fitted=(raw-(lo_uv+hi_uv)/2)*factor+.5
    report["uv"]={"rawMin":lo_uv.tolist(),"rawMax":hi_uv.tolist(),"rawSpan":span.tolist(),"uniformScale":factor,"outerBorderPixels":8,"fitMethod":"reacquire-after-edit-and-uniform-fit","islandMarginRequested":.025}
    write()
    require(np.isfinite(fitted).all() and fitted.min()>=border-1e-7 and fitted.max()<=1-border+1e-7,"fitted UV bounds")
    for loop,coord in zip(uv.data,fitted):
        loop.uv=tuple(coord)
    derived.update()
    uv=derived.uv_layers.get("ASC_Lightmap")
    require(uv is not None,"UV layer missing after fit")
    derived.uv_layers.active=uv;uv.active_render=True
    actual=np.array([tuple(loop.uv) for loop in uv.data],dtype=np.float64)
    require(float(np.max(np.abs(actual-fitted)))<1e-6,"UV writeback drift")
    report["uv"].update(fittedMin=actual.min(axis=0).tolist(),fittedMax=actual.max(axis=0).tolist())
    write()
    # Sample triangle interiors at texel centers: diagnostic overlap, not an exact polygon proof.
    occupancy=np.zeros((size,size),np.int32);min_area=1.0
    for tri in derived.loop_triangles:
        p=np.array([tuple(uv.data[i].uv) for i in tri.loops],dtype=np.float64)
        require(np.isfinite(p).all() and p.min()>=-1e-6 and p.max()<=1+1e-6,"UV outside unit square")
        v,w=p[1]-p[0],p[2]-p[0];det=float(v[0]*w[1]-v[1]*w[0])
        require(abs(det)>1e-12,"degenerate UV triangle")
        min_area=min(min_area,abs(det)/2)
        lo=np.maximum(0,np.floor(p.min(axis=0)*size).astype(int));hi=np.minimum(size-1,np.floor(p.max(axis=0)*size).astype(int))
        xx,yy=np.meshgrid((np.arange(lo[0],hi[0]+1)+.5)/size,(np.arange(lo[1],hi[1]+1)+.5)/size)
        dx=xx-p[0,0];dy=yy-p[0,1]
        u=(dx*w[1]-dy*w[0])/det;t=(v[0]*dy-v[1]*dx)/det
        mask=(u>1e-7)&(t>1e-7)&(u+t<1-1e-7)
        occupancy[lo[1]:hi[1]+1,lo[0]:hi[0]+1]+=mask.astype(np.int32)
    occupied=int(np.count_nonzero(occupancy));overlap=int(np.count_nonzero(occupancy>1))
    report["uv"].update(layer=uv.name,size=size,triangles=len(derived.loop_triangles),minTriangleArea=min_area,sampledOccupiedTexels=occupied,sampledOverlapTexels=overlap,marginRequested=.025,bakeMarginPixels=4,exactOverlapProven=False)
    write()
    require(occupied>100 and overlap==0,"UV sampled overlap or empty coverage")
    image=bpy.data.images.new("ASC P2C diffuse linear",width=size,height=size,alpha=True,float_buffer=True)
    image.colorspace_settings.name="Linear Rec.709"
    for i,m in enumerate(source_mats):
        c=m.copy();clones.append(c);derived.materials[i]=c
        tree=c.node_tree
        # Preserve implicit original UV sampling if there was a primary UV before unwrap.
        if len(source.uv_layers):
            original_uv=source.uv_layers.active_render if hasattr(source.uv_layers,"active_render") else None
            original_uv=original_uv or next((u for u in source.uv_layers if u.active_render),source.uv_layers.active)
            if original_uv:
                uvnode=tree.nodes.new("ShaderNodeUVMap");uvnode.uv_map=original_uv.name
                for node in list(tree.nodes):
                    if node.type=="TEX_IMAGE" and not node.inputs["Vector"].is_linked:
                        tree.links.new(uvnode.outputs["UV"],node.inputs["Vector"])
        node=tree.nodes.new("ShaderNodeTexImage");node.image=image
        for n in tree.nodes:n.select=False
        node.select=True;tree.nodes.active=node
    bpy.context.view_layer.update()
    bpy.ops.object.bake(type="DIFFUSE",pass_filter={"DIRECT","INDIRECT","COLOR"},margin=4,use_clear=True)
    data=pixels(image).copy();rgb=data[:,:,:3]
    require(np.isfinite(data).all() and float(rgb.max())>0 and float(rgb.std())>1e-6,"empty or invalid bake")
    report["bake"]={"type":"DIFFUSE_DIRECT_INDIRECT_COLOR","width":size,"height":size,"rgbMin":float(rgb.min()),"rgbMax":float(rgb.max()),"rgbStd":float(rgb.std()),"containsSpecular":False}
    write()
    # Reproduce the previously failing route on the actual bake, collecting
    # numeric evidence by alpha group. Use a snapshot, not the mutable image.
    report["legacyTransfer"]=legacy_probe(image,data,out/"diffuse-legacy.exr")
    write()
    path=out/"diffuse-linear.exr"
    transferred,transfer=export_opaque_rgb(data,path)
    report["transfer"]=transfer
    report["bake"].update(sha256=transfer["sha256"],bytes=transfer["bytes"],reloadMaxRGBDelta=transfer["maxAbs"])
    write()
    require(transfer["outsideTolerance"]==0,"explicit RGB FLOAT32 transfer drift")
    if os.environ.get("ATLAS_CAPTURE_BINDING") == "1":
        from atlas_surface_binding import capture
        capture(out,s,o,derived,uv,transferred,report)
    preview=bpy.data.materials.new("ASC P2C baked preview");preview.use_nodes=True
    tree=preview.node_tree;tree.nodes.clear()
    uvnode=tree.nodes.new("ShaderNodeUVMap");uvnode.uv_map=uv.name
    tex=tree.nodes.new("ShaderNodeTexImage");tex.image=transferred;tex.extension="EXTEND"
    em=tree.nodes.new("ShaderNodeEmission");output=tree.nodes.new("ShaderNodeOutputMaterial")
    tree.links.new(uvnode.outputs["UV"],tex.inputs["Vector"]);tree.links.new(tex.outputs["Color"],em.inputs["Color"]);tree.links.new(em.outputs[0],output.inputs["Surface"])
    for i in range(len(derived.materials)):derived.materials[i]=preview
    bpy.context.view_layer.update()
    cand=render("native-baked-preview")
    if os.environ.get("ATLAS_P2C3_ORACLE"):
        from atlas_material_ablation import run as material_ablation
        material_ablation(out,s,o,source,derived,uv,transferred,ref,render,report)
    o.data=source;bpy.context.view_layer.update();restored=render("native-restored")
    report["comparisons"]={"candidate":compare(ref,cand),"restored":compare(ref,restored)}
    q=report["comparisons"]["restored"]
    require(q["meanAbsoluteRGBDelta"]<.0002 and q["changedPixels"]<=max(1,int(q["pixels"]*.001)),"rollback render drift")
    require(all(bpy.data.objects[n].data==m for n,m in bindings.items()) and list(source.materials)==source_mats and sha(master)==MASTER,"source restoration")
    report.update(status="PASS_DIFFUSE_BAKE_PROBE",masterUnchanged=True,bindingsRestored=True,artisticReviewRequired=True)
    write()
    print("ASC-P2C1",json.dumps(report,ensure_ascii=False),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    if o.mode!="OBJECT":bpy.ops.object.mode_set(mode="OBJECT")
    o.data=source;s.camera=orig_cam
    if derived:bpy.data.meshes.remove(derived)
    if preview:bpy.data.materials.remove(preview)
    for m in clones:bpy.data.materials.remove(m)
    if transferred:bpy.data.images.remove(transferred)
    if image:bpy.data.images.remove(image)
    if cam:bpy.data.objects.remove(cam,do_unlink=True)
    if camdata:bpy.data.cameras.remove(camdata)
