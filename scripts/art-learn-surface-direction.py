"""ART-LEARN-03: isolated surface and sun-incidence experiments on the locked Atlas master.
Read-only Blender source; no external material assets or automatic aesthetic approval.
"""
import bpy, hashlib, json, math, os, sys, time
from pathlib import Path
import numpy as np
from mathutils import Vector

master,ref_path,obs_path,prior_path,out=map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
out.mkdir(parents=True,exist_ok=True)
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def write(v):(out/"surface-study.json").write_text(json.dumps(v,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
def hash_state(v):return hashlib.sha256(json.dumps(v,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def val(x):
    if isinstance(x,(str,bool)):return x
    if isinstance(x,(int,float)):return round(float(x),7) if math.isfinite(float(x)) else None
    try:return [val(v) for v in x]
    except (TypeError,ValueError):return None
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
require(sha(ref_path)=="3d2eb9c575b50d8969785860c09ecad195033986a1f6e8ca78394268f8dc2503","reference observation identity")
require(sha(obs_path)=="b61577ad9eff29c0e37986a09f6e9182604716c012d3b3841d5b14912d37cc64","Atlas observation identity")
ref=json.loads(ref_path.read_text());obs=json.loads(obs_path.read_text());prior=json.loads(prior_path.read_text())
require(ref["status"]=="PASS_OBSERVATION_AND_ABLATION" and obs["status"]=="PASS_OBSERVATION_ONLY" and obs["sourceSha256"]==MASTER,"source evidence")
require(prior["status"]=="PASS_CONTROLLED_TRANSFER_CANDIDATES" and prior["masterSha256"]==MASTER and prior["protectedStateUnchanged"] and prior["sourceUnchanged"] and not prior["artisticApproval"],"prior lighting evidence")
s=bpy.context.scene
require(s.camera and s.camera.name=="atrium" and not bpy.data.libraries,"scene boundary")
require(all(i.packed_file for i in bpy.data.images if i.source=="FILE"),"external image")
cameras={n:bpy.data.objects.get(n) for n in ("atrium","detail")}
require(all(c and c.type=="CAMERA" for c in cameras.values()),"camera binding")
prior_m={m["name"]:m for m in obs["materials"]}
# Observed existing controls only. Values are trial hypotheses, not copied from Classroom.
specs=[
 ("Warm limestone","Bump","Strength",.18,.28),("Warm limestone","Normal Map","Strength",.20,.32),
 ("Polished warm stone","Bump","Strength",.13,.19),("Polished warm stone","Map Range","To Min",.19,.16),("Polished warm stone","Map Range","To Max",.27,.31),
 ("Walnut","Bump","Strength",.16,.24),("Walnut","Normal Map","Strength",.43,.56),
 ("Recessed walnut","Normal Map","Strength",.35,.46),
 ("Brushed brass","Bump","Strength",.08,.13),("Brushed brass","Map Range","To Min",.29,.24),("Brushed brass","Map Range","To Max",.39,.44),
 ("Atlas blue marble","Bump","Strength",.09,.14),("Atlas blue marble","Map Range","To Min",.17,.15),("Atlas blue marble","Map Range","To Max",.23,.27)]
bindings=[]
for mat,node,socket,before,candidate in specs:
    m=bpy.data.materials.get(mat);require(m and m.use_nodes and m.users>0,"material binding "+mat)
    n=m.node_tree.nodes.get(node);require(n is not None,"node binding "+node)
    p=n.inputs.get(socket);require(p and not p.is_linked,"unbound or linked socket "+socket)
    evidence=next(i for x in prior_m[mat]["graph"]["nodes"] if x["name"]==node for i in x["inputs"] if i["socket"]==p.identifier)
    require(not evidence["linked"] and abs(evidence["value"]-before)<1e-6 and abs(float(p.default_value)-before)<1e-6,"source drift "+mat+"/"+node+"/"+socket)
    bindings.append((mat,node,p,float(p.default_value),candidate))
allowed={(m,n,p.identifier) for m,n,p,b,c in bindings}
sun=bpy.data.objects.get("Directional afternoon sun")
require(sun and sun.type=="LIGHT" and sun.data.type=="SUN" and not sun.parent and sun.rotation_mode=="XYZ","sun binding")
original_rotation=sun.rotation_euler.copy()
original_camera=s.camera
prior_sun=next(x for x in obs["lights"] if x["name"]==sun.name)
require(np.allclose(np.asarray(sun.matrix_world),np.asarray(prior_sun["matrix"]),rtol=0,atol=1e-5),"sun transform drift")
# Existing sun elevation ~43 degrees; a 15-degree lower elevation and
# 25-degree azimuth change test oblique incidence. All energies unchanged.
candidate_rotation=original_rotation.copy()
candidate_rotation.x+=math.radians(15);candidate_rotation.z+=math.radians(25)
def sun_direction():
    v=sun.matrix_world.to_3x3() @ Vector((0,0,1));v.normalize()
    return {"towardSource":val(v),"elevationDeg":math.degrees(math.asin(v.z)),"azimuthDeg":math.degrees(math.atan2(v.y,v.x))}
def graph(t,mat=None,seen=None):
    if not t:return None
    seen=set() if seen is None else seen
    if t.as_pointer() in seen:return {"shared":t.name}
    seen.add(t.as_pointer())
    nodes=[]
    for n in sorted(t.nodes,key=lambda n:n.name):
        d={"name":n.name,"type":n.bl_idname,"inputs":[[i.identifier,bool(i.is_linked),"ALLOWED" if (mat,n.name,i.identifier) in allowed else val(i.default_value) if hasattr(i,"default_value") else None] for i in n.inputs]}
        if getattr(n,"image",None):d["image"]=n.image.name
        if getattr(n,"node_tree",None):d["group"]=graph(n.node_tree,None,seen)
        for k in ("operation","blend_type","interpolation","projection","extension"):
            if hasattr(n,k):d[k]=val(getattr(n,k))
        nodes.append(d)
    return {"nodes":nodes,"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in t.links)}
def protected():
    objects=[]
    for o in sorted(s.objects,key=lambda x:x.name):
        d={"name":o.name,"type":o.type,"data":o.data.name if o.data else None,"matrix":val(o.matrix_world) if o!=sun else "ALLOWED_SUN_ROTATION","hide":bool(o.hide_render),"collections":sorted(c.name for c in o.users_collection)}
        if o.type=="MESH":
            d["mesh"]=[len(o.data.vertices),len(o.data.polygons),len(o.data.loops)]
            d["materials"]=[m.name if m else None for m in o.data.materials]
        if o.type=="LIGHT":
            d["light"]={k:val(getattr(o.data,k)) for k in ("type","energy","color","size","size_y","shape","angle","shadow_soft_size","use_nodes") if hasattr(o.data,k)}
        if o.type=="CAMERA":
            d["camera"]={k:val(getattr(o.data,k)) for k in ("type","lens","sensor_width","sensor_height","shift_x","shift_y","clip_start","clip_end")}
            d["dof"]={k:val(getattr(o.data.dof,k)) for k in ("use_dof","focus_distance","aperture_fstop")}
        objects.append(d)
    materials=[{"name":m.name,"color":val(m.diffuse_color),"graph":graph(m.node_tree,m.name) if m.use_nodes else None} for m in sorted(bpy.data.materials,key=lambda m:m.name)]
    return hash_state({"objects":objects,"materials":materials,"world":graph(s.world.node_tree) if s.world else None,"color":{k:val(getattr(s.view_settings,k)) for k in ("view_transform","look","exposure","gamma")},"compositor":graph(s.node_tree) if s.use_nodes else None})
locked=protected()
report={"schema":"atlas.art-learning.surface-study/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"referenceArtifact":14494956906,"previousLightingArtifact":14494883566,"referenceObservationSha256":sha(ref_path),"atlasObservationSha256":sha(obs_path),"priorTransferSha256":sha(prior_path),"referenceBumpMaterials":sum("ShaderNodeBump" in m["nodeTypes"] for m in ref["materials"]),"atlasBumpMaterials":sum("ShaderNodeBump" in m["nodeTypes"] for m in obs["materials"]),"bindings":[{"material":m,"node":n,"socket":p.identifier,"before":b,"candidate":c} for m,n,p,b,c in bindings],"protectedStateSha256":locked,"baselineSun":sun_direction(),"renders":{},"comparisons":{},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"crossWorldQualified":False}
write(report)
def apply(surface,directional):
    for m,n,p,b,c in bindings:p.default_value=c if surface else b
    sun.rotation_euler=candidate_rotation if directional else original_rotation
    bpy.context.view_layer.update()
def pixels(p):
    im=bpy.data.images.load(str(p),check_existing=False)
    try:
        a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a)
        return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);l=b@np.array([.2126,.7152,.0722],np.float32)
    return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max()),"luminanceP05P50P95":[float(x) for x in np.quantile(l,[.05,.5,.95])]}
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=24
s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_percentage=60
s.render.image_settings.file_format="PNG"
cases=[("01-reference",False,False),("02-surface",True,False),("03-oblique-sun",False,True),("04-combined",True,True),("05-restored",False,False)]
try:
    for view,cam in cameras.items():
        s.camera=cam
        arrays={}
        for name,surface,directional in cases:
            apply(surface,directional)
            require(protected()==locked,"protected state drift "+view+"/"+name)
            key=view+"-"+name;p=out/(key+".png");s.render.filepath=str(p)
            start=time.monotonic();bpy.ops.render.render(write_still=True)
            a=pixels(p);require(np.isfinite(a).all() and float(a.max())>0,"invalid render")
            arrays[name]=a
            require(protected()==locked,"protected state changed after render")
            report["renders"][key]={"sha256":sha(p),"seconds":round(time.monotonic()-start,3),"camera":cam.name,"surface":surface,"directional":directional,"sun":sun_direction()}
            report["comparisons"][key]=compare(arrays["01-reference"],a)
            write(report)
        rb=report["comparisons"][view+"-05-restored"]
        require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"rollback drift "+view)
    for case in ("02-surface","03-oblique-sun","04-combined"):
        require(any(report["comparisons"][v+"-"+case]["changedPixels"]>0 for v in cameras),"no measured effect "+case)
    s.camera=original_camera;apply(False,False)
    require(protected()==locked and all(float(p.default_value)==b for m,n,p,b,c in bindings) and sun.rotation_euler==original_rotation,"rollback state")
    require(sha(master)==MASTER,"master changed")
    report.update(status="PASS_SURFACE_DIRECTION_CANDIDATES",sourceUnchanged=True,protectedStateUnchanged=True,artisticReviewRequired=True)
    write(report);print("ART_LEARN_03",report["status"],flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write(report);raise
finally:
    s.camera=original_camera;apply(False,False)
