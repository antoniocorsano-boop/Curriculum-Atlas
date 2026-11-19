"""ART-LEARN-02: controlled transfer of a lighting principle, not source assets.
Read-only master, source evidence pinned, one isolated factor per diagnostic.
Blender --background --factory-startup --disable-autoexec MASTER --python-exit-code 1
 --python this.py -- MASTER CLASSROOM_OBSERVATION ATLAS_OBSERVATION OUT
"""
import bpy, hashlib, json, math, os, sys, time
from pathlib import Path
import numpy as np

master, ref_path, obs_path, out = map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
out.mkdir(parents=True,exist_ok=True)
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
REF="8af1dc650d38d68e76c969de43844b09f663ea707d3ac345e0c6c924dde10031"
OBS="20c5725687460271743ba5ade045d26256ae156c13c0e0a95c50ed6d7a1fb8b1"
STUDY="bca6ac4c07ce3d38a3737ca79f6d57e267528e6a"
def require(ok,msg):
    if not ok: raise RuntimeError(msg)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def write(n,v):(out/n).write_text(json.dumps(v,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
def val(v):
    if isinstance(v,bool) or isinstance(v,str):return v
    if isinstance(v,(int,float)):return round(float(v),8) if math.isfinite(float(v)) else None
    try:return [val(x) for x in v]
    except (TypeError,ValueError):return None
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
        for k in ("operation","blend_type","interpolation","projection","extension"):
            if hasattr(n,k):d[k]=val(getattr(n,k))
        nodes.append(d)
    return {"nodes":nodes,"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in t.links)}
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
require(sha(ref_path)==REF and sha(obs_path)==OBS,"prior evidence identity")
ref=json.loads(ref_path.read_text());obs=json.loads(obs_path.read_text())
require(ref["revision"]==obs["revision"]==STUDY and ref["status"]=="PASS_OBSERVATION_AND_ABLATION" and obs["status"]=="PASS_OBSERVATION_ONLY" and obs["sourceSha256"]==MASTER,"study provenance")
require(ref["experiment"]["type"]=="SUN" and ref["experiment"]["changedPixels"]>0 and ref["experiment"]["rollbackMeanAbsoluteRGBDelta"]<.0002,"reference causal evidence")
s=bpy.context.scene
require(s.camera and s.camera.name=="atrium" and not bpy.data.libraries,"scene/camera identity")
actual={o.name:o for o in s.objects if o.type=="LIGHT"}
prior={r["name"]:r for r in obs["lights"]}
require(set(actual)==set(prior) and len(actual)==47,"light inventory drift")
groups={"sun":[],"sky":[],"shelf":[],"crown":[],"front":[]}
for name,o in sorted(actual.items()):
    r=prior[name]
    require(o.data.name==r["dataName"] and o.data.type==r["parameters"]["type"] and abs(o.data.energy-r["parameters"]["energy"])<1e-5 and (not o.hide_render)==r["visible"] and o.data.users==1 and not o.data.use_nodes,"light binding drift: "+name)
    require(np.allclose(np.asarray(o.matrix_world),np.asarray(r["matrix"]),rtol=0,atol=1e-5),"light transform drift")
    if name=="Directional afternoon sun":g="sun"
    elif name=="Cool diffuse skylight":g="sky"
    elif name=="Warm frontal fill":g="front"
    elif name.startswith("Warm shelf wash"):g="shelf"
    elif name.startswith("Indirect upper crown wash "):g="crown"
    else:raise RuntimeError("unknown light role "+name)
    groups[g].append(name)
require({k:len(v) for k,v in groups.items()}=={"sun":1,"sky":1,"shelf":36,"crown":8,"front":1},"role inventory")
require(all(not o.hide_render for o in actual.values()),"unexpected source visibility")
base={n:{"energy":float(o.data.energy),"hide":bool(o.hide_render)} for n,o in actual.items()}
def protected():
    # Observe data independently of the light energy/visibility knobs.
    objects=[]
    for o in sorted(s.objects,key=lambda o:o.name):
        d={"name":o.name,"type":o.type,"data":o.data.name if o.data else None,"matrix":val(o.matrix_world),"collections":sorted(c.name for c in o.users_collection)}
        if o.type!="LIGHT":d["hide"]=bool(o.hide_render)
        if o.type=="MESH":
            d["mesh"]=[len(o.data.vertices),len(o.data.polygons),len(o.data.loops)]
            d["materials"]=[m.name if m else None for m in o.data.materials]
        if o.type=="LIGHT":
            d["light"]={k:val(getattr(o.data,k)) for k in ("type","color","size","size_y","shape","angle","shadow_soft_size","use_nodes") if hasattr(o.data,k)}
        if o.type=="CAMERA":
            d["camera"]={k:val(getattr(o.data,k)) for k in ("type","lens","sensor_width","sensor_height","sensor_fit","shift_x","shift_y","clip_start","clip_end")}
            d["dof"]={k:val(getattr(o.data.dof,k)) for k in ("use_dof","focus_distance","aperture_fstop")}
        objects.append(d)
    materials=[{"name":m.name,"color":val(m.diffuse_color),"graph":graph(m.node_tree) if m.use_nodes else None} for m in sorted(bpy.data.materials,key=lambda m:m.name)]
    world={"name":s.world.name,"graph":graph(s.world.node_tree)} if s.world else None
    return digest({"objects":objects,"materials":materials,"world":world,"camera":s.camera.name,"color":{k:val(getattr(s.view_settings,k)) for k in ("view_transform","look","exposure","gamma")},"compositor":graph(s.node_tree) if s.use_nodes else None})
locked=protected()
# All candidates are evaluated against the same baseline. No camera, material,
# geometry, exposure or environment edits. Multipliers are Atlas-specific hypotheses.
cases=[
 ("01-reference",{"sun":1,"sky":1,"shelf":1,"crown":1,"front":1},False),
 ("02-sun-ablation",{"sun":1,"sky":1,"shelf":1,"crown":1,"front":1},True),
 ("03-practical-hierarchy",{"sun":1,"sky":1,"shelf":.40,"crown":.35,"front":.25},False),
 ("04-directional-hierarchy",{"sun":1.35,"sky":.75,"shelf":.40,"crown":.35,"front":.25},False),
 ("05-restored",{"sun":1,"sky":1,"shelf":1,"crown":1,"front":1},False)]
report={"schema":"atlas.art-learning.transfer/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"studyRevision":STUDY,"studyArtifact":14467907953,"referenceObservationSha256":REF,"atlasObservationSha256":OBS,"referenceExperiment":ref["experiment"],"principle":"Measure source contribution, then organize practical lights beneath daylight hierarchy. Do not copy numeric powers or camera settings from another scene.","groups":groups,"baseline":base,"protectedStateSha256":locked,"renders":{},"comparisons":{},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"crossWorldQualified":False}
write("transfer.json",report)
def apply(factors,hide_sun):
    for g,names in groups.items():
        for n in names:
            o=actual[n]
            o.data.energy=base[n]["energy"]*factors[g]
            o.hide_render=base[n]["hide"] or (g=="sun" and hide_sun)
    bpy.context.view_layer.update()
def restore():
    apply({k:1 for k in groups},False)
def image_pixels(p):
    im=bpy.data.images.load(str(p),check_existing=False)
    try:
        a=np.empty(len(im.pixels),dtype=np.float32);im.pixels.foreach_get(a)
        return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b)
    lum=b @ np.array([.2126,.7152,.0722],dtype=np.float32)
    q=np.quantile(lum,[.05,.50,.95])
    return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max()),"luminanceP05P50P95":[float(x) for x in q],"nearBlackFraction":float(np.mean(lum<.01)),"nearWhiteFraction":float(np.mean(lum>.95))}
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=24
s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
s.render.threads_mode="FIXED";s.render.threads=2
s.render.resolution_percentage=60
s.render.image_settings.file_format="PNG"
arrays={}
try:
    for name,factors,hide in cases:
        apply(factors,hide)
        require(protected()==locked,"protected state changed before "+name)
        p=out/(name+".png");s.render.filepath=str(p)
        t=time.monotonic();bpy.ops.render.render(write_still=True)
        require(p.is_file(),"missing render "+name)
        a=image_pixels(p);require(np.isfinite(a).all() and float(a.max())>0,"invalid render")
        arrays[name]=a
        require(protected()==locked,"protected state changed after "+name)
        report["renders"][name]={"sha256":sha(p),"seconds":round(time.monotonic()-t,3),"factors":factors,"sunHidden":hide,"actualEnergies":{n:float(o.data.energy) for n,o in actual.items()}}
        report["comparisons"][name]=compare(arrays["01-reference"],a)
        write("transfer.json",report)
    require(report["comparisons"]["02-sun-ablation"]["changedPixels"]>0,"sun has no measured effect")
    require(report["comparisons"]["03-practical-hierarchy"]["changedPixels"]>0,"practical hierarchy has no measured effect")
    require(compare(arrays["03-practical-hierarchy"],arrays["04-directional-hierarchy"])["changedPixels"]>0,"directional rebalance has no measured effect")
    report["incrementalDirectionalComparison"]=compare(arrays["03-practical-hierarchy"],arrays["04-directional-hierarchy"])
    rb=report["comparisons"]["05-restored"]
    require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback visual drift")
    require(all(o.data.energy==base[n]["energy"] and o.hide_render==base[n]["hide"] for n,o in actual.items()),"rollback light state")
    require(sha(master)==MASTER,"master changed")
    report.update(status="PASS_CONTROLLED_TRANSFER_CANDIDATES",sourceUnchanged=True,protectedStateUnchanged=True,artisticReviewRequired=True)
    write("transfer.json",report)
    print("ART_LEARN_02",report["status"],json.dumps(report["comparisons"]),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write("transfer.json",report);raise
finally:
    restore()
