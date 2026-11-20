"""AWC-F: render only the technical Sala Zero fixture, never save a .blend.

Loads the exact AWC transfer plan created from the existing MUSEO ZERO
experience. The existing museum product and the library master are untouched.
"""
import bpy,hashlib,json,math,sys,os
from pathlib import Path
from mathutils import Vector
import numpy as np
def require(x,m):
    if not x:raise RuntimeError(m)
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
out=Path(sys.argv[sys.argv.index("--")+1])
plan=json.loads((out/"transfer-plan.json").read_text())
require(plan["status"]=="SCENE_PLAN_READY" and plan["mode"]=="ISOLATED_LAB_ONLY" and not any(plan["authority"].values()),"transfer gate")
require(not bpy.data.filepath,"factory scene only; no original master")
bpy.ops.object.select_all(action="SELECT");bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=24
scene.cycles.use_adaptive_sampling=False;scene.cycles.use_denoising=True;scene.cycles.seed=0
scene.render.threads_mode="FIXED";scene.render.threads=2
scene.render.resolution_x=640;scene.render.resolution_y=480;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG";scene.render.image_settings.color_mode="RGB";scene.render.image_settings.color_depth="8"
scene.render.film_transparent=False
scene.view_settings.view_transform="AgX";scene.view_settings.look="AgX - Medium High Contrast"
world=bpy.data.worlds.new("Museo Zero technical studio");scene.world=world;world.use_nodes=True
world.node_tree.nodes.get("Background").inputs["Color"].default_value=(.035,.06,.09,1)
world.node_tree.nodes.get("Background").inputs["Strength"].default_value=.65
def rgba(s):
    c=tuple(int(s[i:i+2],16)/255 for i in (1,3,5))
    def lin(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
    return (*[lin(x) for x in c],1.0)
materials={}
for name,spec in plan["materials"].items():
    m=bpy.data.materials.new(name);m.diffuse_color=rgba(spec["color"]);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=rgba(spec["color"])
    p.inputs["Roughness"].default_value=spec["roughness"]
    p.inputs["Metallic"].default_value=spec.get("metalness",0.0)
    materials[name]=m
s=plan["materials"]["screen"]
mat=bpy.data.materials.new("projection-current-cue");mat.use_nodes=True
p=mat.node_tree.nodes.get("Principled BSDF")
p.inputs["Roughness"].default_value=s["roughness"]
# Separate material to avoid rewriting the source material family.
p.inputs["Base Color"].default_value=rgba(s["color"])
materials["screen"]=mat
objects={}
for item in plan["objects"]:
    bpy.ops.mesh.primitive_cube_add(size=1,location=item["position"])
    o=bpy.context.object;o.name=item["id"];o.dimensions=item["size"]
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(materials[item["material"]]);objects[item["id"]]=o
def light(name,where,power,size):
    data=bpy.data.lights.new(name,"AREA");data.energy=power;data.shape="DISK";data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o)
    o.location=where;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat("-Z","Y").to_euler()
light("Softbox near entry",(-2.4,-3.5,4.5),650,4)
light("Softbox ceiling",(2.1,1.8,4.7),480,3.5)
data=bpy.data.cameras.new("Shared AWC orbit camera");cam=bpy.data.objects.new("Shared AWC orbit camera",data)
scene.collection.objects.link(cam);scene.camera=cam;data.type="PERSP";data.sensor_fit="VERTICAL";data.sensor_height=24
data.lens=24/(2*math.tan(math.radians(plan["camera"]["fov"]/2)))
data.clip_start=plan["camera"]["near"];data.clip_end=plan["camera"]["far"]
def mat_state(signal):
    bs=materials["screen"].node_tree.nodes.get("Principled BSDF")
    bs.inputs["Emission Color"].default_value=rgba("#67d9ca" if signal=="B" else "#1d3448")
    bs.inputs["Emission Strength"].default_value=4.0 if signal=="B" else .08
def read_img(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        w,h=im.size;a=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(a)
        a=a.reshape(h,w,4)[:,:,:3].copy()
        require(np.isfinite(a).all(),"invalid image")
        return a
    finally:bpy.data.images.remove(im)
report={"schema":"atlas.awc.museo-artistic/v1","status":"PENDING",
        "revision":os.environ["ATLAS_EXACT_HEAD"],"planSha256":plan["planSha256"],
        "storyRevision":plan["storyRevision"],"world":plan["world"],"scene":plan["scene"],
        "engine":"Blender/Cycles","blenderVersion":bpy.app.version_string,
        "objects":len(objects),"triangles":len(objects)*12,"samples":24,
        "frames":{},"artisticApproval":False,"publishable":False,"masterWrite":False}
arrays={}
for frame in plan["frames"]:
    mat_state(frame["signal"])
    cam.location=frame["eye"];cam.rotation_euler=(Vector(frame["target"])-cam.location).to_track_quat("-Z","Y").to_euler()
    bpy.context.view_layer.update()
    path=out/("museo-art-"+frame["id"]+".png")
    scene.render.filepath=str(path);bpy.ops.render.render(write_still=True)
    a=read_img(path);arrays[frame["id"]]=a
    report["frames"][frame["id"]]={"sha256":h(path),"width":640,"height":480,
        "lit":int(np.count_nonzero(a.max(axis=2)>.015)),"signal":frame["signal"],
        "orbit":frame["orbit"],"eye":frame["eye"]}
ref=arrays["reference"]
def diff(name):
    d=np.abs(arrays[name]-ref)
    return {"mean":float(d.mean()),"max":float(d.max()),
            "changedPixels":int(np.count_nonzero(d.max(axis=2)>1/255+1e-7))}
report["variation"]=diff("rotated");report["rollback"]=diff("restored");report["cueChange"]=diff("cue-B")
require(report["variation"]["changedPixels"]>500 and report["cueChange"]["changedPixels"]>500,"nonfunctional state")
require(report["rollback"]["mean"]<.0003 and report["rollback"]["max"]<=1/255+1e-7,"render rollback")
require(all(q["lit"]>10000 for q in report["frames"].values()),"empty render")
report["status"]="PASS_MUSEO_ARTISTIC_DERIVATIVE"
(out/"museo-artistic.json").write_text(json.dumps(report,sort_keys=True,indent=2,allow_nan=False)+"\n")
print("AWC-F ARTISTIC",json.dumps(report),flush=True)
