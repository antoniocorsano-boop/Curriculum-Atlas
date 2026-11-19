"""ART-LEARN-04: original multiscale limestone graph, two variants, real Atlas cameras.
No source asset copied; master read-only; preserve all existing graph nodes and restore links.
"""
import bpy, hashlib, json, os, sys, time, math
from pathlib import Path
import numpy as np

master, study, prev, out=map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
out.mkdir(parents=True,exist_ok=True)
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def val(x):
    if isinstance(x,(bool,str)):return x
    if isinstance(x,(int,float)):return round(float(x),8) if math.isfinite(float(x)) else None
    try:return [val(v) for v in x]
    except (TypeError,ValueError):return None
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def graph(t,seen=None):
    if not t:return None
    seen=set() if seen is None else seen
    if t.as_pointer() in seen:return {"shared":t.name}
    seen.add(t.as_pointer())
    nodes=[]
    for n in sorted(t.nodes,key=lambda n:n.name):
        d={"name":n.name,"type":n.bl_idname,"inputs":[[i.identifier,bool(i.is_linked),val(i.default_value) if hasattr(i,"default_value") else None] for i in n.inputs]}
        if getattr(n,"image",None):d["image"]=n.image.name
        if getattr(n,"node_tree",None):d["group"]=graph(n.node_tree,seen)
        if hasattr(n,"color_ramp"):d["ramp"]={"interpolation":n.color_ramp.interpolation,"elements":[[e.position,val(e.color)] for e in n.color_ramp.elements]}
        for k in ("operation","blend_type","interpolation","projection","extension","noise_dimensions","normalize"):
            if hasattr(n,k):d[k]=val(getattr(n,k))
        nodes.append(d)
    return {"nodes":nodes,"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in t.links)}
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
r=json.loads(study.read_text());p=json.loads(prev.read_text())
require(r["status"]=="PASS_OBSERVATION_AND_ABLATION" and r["sourceUnchanged"],"reference evidence")
require(p["status"]=="PASS_SURFACE_DIRECTION_CANDIDATES" and p["masterSha256"]==MASTER and p["sourceUnchanged"] and not p["artisticApproval"],"prior evidence")
ref=next(m for m in r["materials"] if m["name"]=="beigeWall")
require(ref["nodeTypes"].get("ShaderNodeTexImage")==2 and ["Mix","Result_Color","Bump","Height"] in ref["graph"]["links"],"reference material graph")
s=bpy.context.scene;orig_cam=s.camera
require(orig_cam and orig_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
cams={n:bpy.data.objects.get(n) for n in ("atrium","detail")}
require(all(c and c.type=="CAMERA" for c in cams.values()),"camera bindings")
mat=bpy.data.materials.get("Warm limestone");require(mat and mat.use_nodes and mat.users>0,"target material")
t=mat.node_tree;bs=t.nodes.get("Principled BSDF");geom=t.nodes.get("Geometry")
require(bs and geom,"source bindings")
require({n.image.name for n in t.nodes if n.type=="TEX_IMAGE"}=={"marble_01_diff.jpg","marble_01_rough.jpg","marble_01_nor_gl.jpg"},"source texture identity")
require(all(i.packed_file for i in bpy.data.images if i.source=="FILE"),"external images")
targets=[bs.inputs[n] for n in ("Base Color","Roughness","Normal")]
require(all(len(i.links)==1 for i in targets),"source surface inputs")
original_links=[(i,i.links[0].from_socket) for i in targets]
original_graph=graph(t);original_hash=digest(original_graph)
def protected():
    objects=[]
    for o in sorted(s.objects,key=lambda x:x.name):
        d={"name":o.name,"type":o.type,"data":o.data.name if o.data else None,"matrix":val(o.matrix_world),"hide":bool(o.hide_render),"collections":sorted(c.name for c in o.users_collection)}
        if o.type=="MESH":d["mesh"]=[len(o.data.vertices),len(o.data.polygons),len(o.data.loops)];d["materials"]=[sl.material.name if sl.material else None for sl in o.material_slots]
        if o.type=="LIGHT":d["light"]={k:val(getattr(o.data,k)) for k in ("type","energy","color","size","size_y","shape","angle","shadow_soft_size") if hasattr(o.data,k)}
        if o.type=="CAMERA":d["camera"]={k:val(getattr(o.data,k)) for k in ("type","lens","sensor_width","sensor_height","shift_x","shift_y","clip_start","clip_end")};d["dof"]={k:val(getattr(o.data.dof,k)) for k in ("use_dof","focus_distance","aperture_fstop")}
        objects.append(d)
    materials=[{"name":m.name,"graph":graph(m.node_tree) if m.use_nodes else None} for m in sorted(bpy.data.materials,key=lambda x:x.name) if m!=mat]
    return digest({"objects":objects,"materials":materials,"world":graph(s.world.node_tree) if s.world else None,"color":{k:val(getattr(s.view_settings,k)) for k in ("view_transform","look","exposure","gamma")},"compositor":graph(s.node_tree) if s.use_nodes else None,"images":sorted(i.name for i in bpy.data.images if i.type not in ("RENDER_RESULT","COMPOSITING") and i.source!="VIEWER")})
locked=protected()
report={"schema":"atlas.art-learning.limestone/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"referenceArtifact":14495079642,"referenceMaterial":"beigeWall","referenceObservationSha256":sha(study),"previousArtifact":14495734118,"previousStudySha256":sha(prev),"targetMaterial":mat.name,"originalGraphSha256":original_hash,"protectedStateSha256":locked,"originalTextures":["marble_01_diff.jpg","marble_01_rough.jpg","marble_01_nor_gl.jpg"],"principle":"Correlate multiscale mineral color, roughness and relief with restrained shared signals. Original procedural graph; no Classroom textures copied.","renders":{},"comparisons":{},"graphs":{},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"crossWorldQualified":False}
def write():(out/"limestone-study.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()
added=[]
def new(kind,name):
    n=t.nodes.new(kind);added.append(n);n.name="AL04 "+name;n.label=name;return n
def link(a,b):t.links.new(a,b)
def noise(name,scale,detail,rough):
    n=new("ShaderNodeTexNoise",name);n.inputs["Scale"].default_value=scale;n.inputs["Detail"].default_value=detail;n.inputs["Roughness"].default_value=rough;link(geom.outputs["Position"],n.inputs["Vector"]);return n.outputs["Fac"]
def ramp(name,signal,low,high,lo=.22,hi=.78):
    n=new("ShaderNodeValToRGB",name);a,b=n.color_ramp.elements;a.position=lo;a.color=low;b.position=hi;b.color=high;link(signal,n.inputs["Fac"]);return n.outputs["Color"]
def mix(name,a,b,f,mode="MIX"):
    n=new("ShaderNodeMixRGB",name);n.blend_type=mode;n.inputs[0].default_value=f;link(a,n.inputs[1]);link(b,n.inputs[2]);return n.outputs[0]
def restore():
    for n in reversed(added):t.nodes.remove(n)
    added.clear()
    for dest,src in original_links:
        for l in list(dest.links):t.links.remove(l)
        link(src,dest)
def apply(mode):
    restore()
    if mode=="original":return
    # World-space independent scales; no texture resources from the reference.
    macro=noise("Mineral variation",2.5,3.0,.62)
    grain=noise("Mineral grains",32.0,2.0,.67)
    pores=noise("Fine pores",155.0,2.0,.70)
    mineral=ramp("Warm mineral palette",macro,(.39,.30,.20,1),(.67,.57,.43,1))
    grain_tint=ramp("Grain tone",grain,(.79,.75,.69,1),(1.,.99,.95,1))
    tone=mix("Layered stone color",mineral,grain_tint,.48,"MULTIPLY")
    pore_tint=ramp("Pore tone",pores,(.65,.61,.55,1),(1.,1.,1.,1),.12,.43)
    tone=mix("Subtle pore coloration",tone,pore_tint,.25,"MULTIPLY")
    # Hybrid retains part of the original stone image; mineral is procedural only.
    if mode=="hybrid":tone=mix("Existing texture continuity",tone,original_links[0][1],.28)
    rough=ramp("Mineral roughness",grain,(.44,.44,.44,1),(.75,.75,.75,1))
    if mode=="hybrid":rough=mix("Existing roughness continuity",rough,original_links[1][1],.22)
    link(tone,targets[0]);link(rough,targets[1])
    n=new("ShaderNodeBump","Grain relief");n.inputs["Strength"].default_value=.24;n.inputs["Distance"].default_value=.0025;link(grain,n.inputs["Height"])
    if mode=="hybrid":link(original_links[2][1],n.inputs["Normal"])
    q=new("ShaderNodeBump","Pore relief");q.inputs["Strength"].default_value=.20;q.inputs["Distance"].default_value=.00065;link(pores,q.inputs["Height"]);link(n.outputs["Normal"],q.inputs["Normal"]);link(q.outputs["Normal"],targets[2])
    require(all(len(i.links)==1 for i in targets),"candidate graph disconnected")
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a);return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=32;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_percentage=75;s.render.image_settings.file_format="PNG"
cases=[("01-reference","original"),("02-hybrid","hybrid"),("03-mineral","mineral"),("04-restored","original")]
try:
    for view,cam in cams.items():
        s.camera=cam;arrays={}
        for name,mode in cases:
            apply(mode);require(protected()==locked,"protected scene drift")
            g=graph(t);gh=digest(g)
            if mode=="original":require(gh==original_hash,"original graph not restored")
            else:
                require(gh!=original_hash and len(added)>0,"candidate graph absent")
                report["graphs"][mode]={"sha256":gh,"graph":g,"addedNodes":len(added)}
            key=view+"-"+name;path=out/(key+".png");s.render.filepath=str(path)
            start=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path)
            require(np.isfinite(a).all() and float(a.max())>0,"invalid render")
            arrays[name]=a;require(protected()==locked and digest(graph(t))==gh,"render changed protected state")
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"graphSha256":gh,"camera":cam.name}
            report["comparisons"][key]=compare(arrays["01-reference"],a);write()
        rb=report["comparisons"][view+"-04-restored"]
        require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback pixel drift")
    for case in ("02-hybrid","03-mineral"):
        require(any(report["comparisons"][v+"-"+case]["changedPixels"]>0 for v in cams),"candidate effect absent")
    restore();s.camera=orig_cam
    require(digest(graph(t))==original_hash and protected()==locked and sha(master)==MASTER,"final rollback")
    report.update(status="PASS_LIMESTONE_CANDIDATES",sourceUnchanged=True,protectedStateUnchanged=True,graphRestored=True,artisticReviewRequired=True);write();print("ART_LEARN_04",report["status"],flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    restore();s.camera=orig_cam
