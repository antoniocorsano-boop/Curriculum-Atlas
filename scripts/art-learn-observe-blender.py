"""ART-LEARN-01: inspect real Blender scenes, record evidence, test a bounded light ablation.
No source scene saved, no copied asset transferred, no artistic score inferred.
Usage: blender --background --factory-startup --disable-autoexec FILE --python-exit-code 1 --python THIS -- SOURCE OUT MODE
"""
import bpy, hashlib, json, math, sys, os
from pathlib import Path
from collections import Counter
import numpy as np

source,out,mode=sys.argv[sys.argv.index("--")+1:]
source=Path(source).resolve();out=Path(out).resolve()
out.mkdir(parents=True,exist_ok=True)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def write(name,v):
    (out/name).write_text(json.dumps(v,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
def value(v):
    if isinstance(v,bool):return v
    if isinstance(v,str):return v
    if isinstance(v,(int,float)):return round(float(v),7) if math.isfinite(float(v)) else None
    try:return [value(x) for x in v]
    except (TypeError,ValueError):return None
def props(o,keys):
    return {k:value(getattr(o,k)) for k in keys if hasattr(o,k)}
def graph(tree,seen=None):
    if tree is None:return None
    seen=set() if seen is None else seen
    ident=tree.as_pointer()
    if ident in seen:return {"sharedGroup":tree.name}
    seen.add(ident)
    nodes=[]
    for n in sorted(tree.nodes,key=lambda n:n.name):
        d={"name":n.name,"type":n.bl_idname,"inputs":[{"socket":i.identifier,"linked":bool(i.is_linked),"value":value(i.default_value) if hasattr(i,"default_value") else None} for i in n.inputs]}
        if getattr(n,"image",None):d["image"]=n.image.name
        if getattr(n,"node_tree",None):d["group"]=graph(n.node_tree,seen)
        if hasattr(n,"operation"):d["operation"]=n.operation
        if hasattr(n,"blend_type"):d["blendType"]=n.blend_type
        nodes.append(d)
    return {"name":tree.name,"nodes":nodes,"links":sorted([l.from_node.name,l.from_socket.identifier,l.to_node.name,l.to_socket.identifier] for l in tree.links)}
def count_types(g):
    counts=Counter()
    def visit(x):
        if not x:return
        for n in x.get("nodes",[]):
            counts[n["type"]]+=1
            if "group" in n:visit(n["group"])
    visit(g);return dict(sorted(counts.items()))
require(mode in ("reference","atlas"),"invalid mode")
require(Path(bpy.data.filepath).resolve()==source,"unexpected source")
before=sha(source)
s=bpy.context.scene
require(s.camera and s.camera.type=="CAMERA","no active camera")
require(not bpy.data.libraries,"external linked libraries not qualified")
camera=s.camera
lights=[]
for o in sorted(s.objects,key=lambda x:x.name):
    if o.type!="LIGHT":continue
    d=o.data
    lights.append({"name":o.name,"dataName":d.name,"visible":not o.hide_render,"matrix":[value(r) for r in o.matrix_world],"cameraRelativePosition":value(camera.matrix_world.inverted() @ o.matrix_world.translation),"parameters":props(d,["type","energy","color","size","size_y","shape","shadow_soft_size","angle","spot_size","spot_blend","use_shadow","use_nodes"]), "graph":graph(d.node_tree) if d.use_nodes else None})
materials=[]
for m in sorted(bpy.data.materials,key=lambda m:m.name):
    g=graph(m.node_tree) if m.use_nodes else None
    materials.append({"name":m.name,"users":m.users,"viewportColor":value(m.diffuse_color),"nodeTypes":count_types(g),"graph":g})
images=[]
for i in sorted(bpy.data.images,key=lambda i:i.name):
    if i.type in ("RENDER_RESULT","COMPOSITING") or i.source=="VIEWER":continue
    path=bpy.path.abspath(i.filepath,library=i.library) if i.filepath else ""
    # File references must be local to the extracted archive or packed; never fetch remote resources.
    packed=bool(i.packed_file)
    local=bool(path and Path(path).is_file())
    images.append({"name":i.name,"source":i.source,"size":list(i.size),"colorspace":i.colorspace_settings.name,"packed":packed,"localAvailable":local,"relativePath":i.filepath if i.filepath.startswith("//") else None})
missing=[i["name"] for i in images if i["source"]=="FILE" and not i["packed"] and not i["localAvailable"]]
camera_rec={"name":camera.name,"matrix":[value(r) for r in camera.matrix_world],"parameters":props(camera.data,["type","lens","sensor_width","sensor_height","sensor_fit","angle_x","angle_y","shift_x","shift_y","clip_start","clip_end"]),"dof":props(camera.data.dof,["use_dof","focus_distance","aperture_fstop","aperture_blades","aperture_rotation","aperture_ratio"])}
if camera.data.dof.focus_object:camera_rec["focusObject"]=camera.data.dof.focus_object.name
types=Counter(o.type for o in s.objects)
mesh_objects=[o for o in s.objects if o.type=="MESH"]
material_usage=Counter(slot.material.name for o in mesh_objects for slot in o.material_slots if slot.material)
world={"name":s.world.name,"color":value(s.world.color),"graph":graph(s.world.node_tree) if s.world.use_nodes else None} if s.world else None
report={"schema":"atlas.art-learning.observation/v1","status":"OBSERVED","mode":mode,"revision":os.environ["ATLAS_EXACT_HEAD"],"sourceSha256":before,"blenderVersion":bpy.app.version_string,"scene":s.name,"camera":camera_rec,"lights":lights,"materials":materials,"materialUsage":dict(material_usage),"images":images,"missingImages":missing,"world":world,"compositor":graph(s.node_tree) if s.use_nodes else None,"render":{"settings":props(s.render,["engine","resolution_x","resolution_y","resolution_percentage","film_transparent","pixel_aspect_x","pixel_aspect_y"]),"cycles":props(s.cycles,["samples","use_denoising","max_bounces","diffuse_bounces","glossy_bounces","transmission_bounces","volume_bounces","transparent_max_bounces","seed","use_adaptive_sampling"]),"color":props(s.view_settings,["view_transform","look","exposure","gamma"]),"display":props(s.display_settings,["display_device"])},"geometry":{"objectTypes":dict(types),"meshObjects":len(mesh_objects),"uniqueMeshes":len({o.data.as_pointer() for o in mesh_objects}),"baseVertices":sum(len(o.data.vertices) for o in mesh_objects),"baseFaces":sum(len(o.data.polygons) for o in mesh_objects),"modifierTypes":dict(Counter(m.type for o in mesh_objects for m in o.modifiers))},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False}
write("observation.json",report)
require(not missing,"missing image resources: "+str(missing))
# One controlled experiment in the reference scene only. The Atlas scene is observed and left intact.
if mode=="reference":
    eligible=[o for o in s.objects if o.type=="LIGHT" and not o.hide_render and o.data.energy>0]
    require(eligible,"no visible direct light available")
    light=next((o for o in sorted(eligible,key=lambda o:o.name) if o.data.type=="SUN"),None)
    if light is None:light=max(eligible,key=lambda o:o.data.energy)
    base=bool(light.hide_render)
    # Preserve native camera, material graph and color settings; downscale only resolution/samples.
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=24
    s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False
    s.render.threads_mode="FIXED";s.render.threads=2
    s.render.resolution_percentage=max(1,min(100,round(64000/max(s.render.resolution_x,s.render.resolution_y))))
    s.render.image_settings.file_format="PNG"
    def render(name):
        p=out/(name+".png");s.render.filepath=str(p)
        bpy.ops.render.render(write_still=True);require(p.is_file(),"missing image")
        image=bpy.data.images.load(str(p),check_existing=False)
        try:
            arr=np.empty(len(image.pixels),dtype=np.float32);image.pixels.foreach_get(arr)
            return arr.reshape((-1,4))[:,:3].copy(),sha(p)
        finally:bpy.data.images.remove(image)
    a,ha=render("reference")
    try:
        light.hide_render=True
        b,hb=render("light-ablation")
    finally:light.hide_render=base
    c,hc=render("restored")
    delta=np.abs(a-b);rollback=np.abs(a-c)
    changed=int(np.count_nonzero(np.max(delta,axis=1)>1/255))
    require(changed>0,"no visible light effect")
    require(float(rollback.mean())<.0002 and int(np.count_nonzero(np.max(rollback,axis=1)>1/255))<=max(1,int(len(a)*.001)),"rollback drift")
    report["experiment"]={"object":light.name,"type":light.data.type,"parameter":"hide_render","baseline":base,"candidate":True,"restored":bool(light.hide_render),"changedPixels":changed,"pixelCount":len(a),"meanAbsoluteRGBDelta":float(delta.mean()),"rollbackMeanAbsoluteRGBDelta":float(rollback.mean()),"imageHashes":{"reference.png":ha,"light-ablation.png":hb,"restored.png":hc},"interpretation":"Demonstrates causal contribution of this light in this source scene, not a portable numerical recipe or aesthetic preference."}
    require(light.hide_render==base,"parameter rollback")
require(sha(source)==before,"source bytes changed")
report["status"]="PASS_OBSERVATION_AND_ABLATION" if mode=="reference" else "PASS_OBSERVATION_ONLY"
report["sourceUnchanged"]=True
write("observation.json",report)
print("ART_LEARN_01",mode,report["status"],"materials",len(materials),"lights",len(lights),"objects",len(s.objects),flush=True)
