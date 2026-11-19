"""AWC-E: artistic derivative from the actual, immutable Blender master.

The camera matrices come from the already verified WebGL variation. The
original material graphs, world and lights are retained; other meshes are
hidden only in memory to frame the same isolated bay. This is not a claim
of optical equivalence or of final library quality.
"""
import bpy, hashlib, json, math, os, sys
from pathlib import Path
import numpy as np
from mathutils import Matrix

MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def need(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def arr(m):return np.asarray(m,dtype=np.float64)
def write(p,obj):p.write_text(json.dumps(obj,indent=2,sort_keys=True,allow_nan=False)+"\n")
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        w,h=im.size;a=np.empty(w*h*4,np.float32);im.pixels.foreach_get(a)
        a=a.reshape(h,w,4)[:,:,:3].copy()
        need(np.isfinite(a).all(),"nonfinite rendered pixels")
        return a
    finally:bpy.data.images.remove(im)

master,out=map(Path,sys.argv[sys.argv.index("--")+1:])
need(Path(bpy.data.filepath).resolve()==master.resolve() and sha(master)==MASTER,"master identity")
d=read(out/"lab-variation-report.json");browser=read(out/"bay-browser.json");bay=read(out/"bay.json");plan=read(out/"lab-plan.json")
need(d["status"]=="PASS_AWC_D_ISOLATED_ORBIT" and d["rollbackExact"] and d["masterUnchanged"],"AWC-D gate")
need(d["revision"]==bay["revision"]==browser["revision"]==os.environ["ATLAS_EXACT_HEAD"],"revision identity")
need(d["labPlanSha256"]==plan["labPlanSha256"] and d["compositionPlanSha256"]==plan["compositionPlanSha256"],"plan identity")
need(d["masterSha256"]==MASTER and d["productionExecutionAuthorized"] is False,"authority")
names={x["object"] for x in bay["objects"]}
need(len(names)==11 and all(bpy.data.objects.get(n) is not None for n in names),"bay inventory")
s=bpy.context.scene;previous_camera=s.camera
visibility={o.name:o.hide_render for o in s.objects}
original_bindings={n:bpy.data.objects[n].data.name for n in names}
original_materials={n:[m.name if m else None for m in bpy.data.objects[n].data.materials] for n in names}
camdata=bpy.data.cameras.new("AWC E matched camera");cam=bpy.data.objects.new("AWC E matched camera",camdata)
s.collection.objects.link(cam)
result={"schema":"atlas.awc.artistic-derivative/v1","revision":os.environ["ATLAS_EXACT_HEAD"],
        "status":"PENDING","masterSha256":MASTER,"labPlanSha256":d["labPlanSha256"],
        "compositionPlanSha256":d["compositionPlanSha256"],"labReceiptSha256":sha(out/"lab-variation-report.json"),
        "sourceGeometrySha256":d["sourceGeometrySha256"],"sourceMaterialPackageSha256":d["sourceMaterialPackageSha256"],
        "scope":"isolated bay; original Blender material graphs, lights and world; other mesh objects hidden in memory",
        "blenderVersion":bpy.app.version_string,"objects":sorted(names),"frames":{},
        "artisticApproval":False,"opticalEquivalence":False,"publishable":False}
try:
    for o in s.objects:
        if o.type=="MESH":o.hide_render=o.name not in names
    s.camera=cam
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=32
    s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
    s.render.threads_mode="FIXED";s.render.threads=2
    s.render.resolution_x=640;s.render.resolution_y=480;s.render.resolution_percentage=100
    s.render.pixel_aspect_x=1;s.render.pixel_aspect_y=1
    s.render.image_settings.file_format="PNG";s.render.image_settings.color_mode="RGB";s.render.image_settings.color_depth="8"
    s.render.film_transparent=False
    camdata.type="PERSP";camdata.sensor_fit="VERTICAL";camdata.sensor_height=24
    camdata.lens=camdata.sensor_height/(2*math.tan(math.radians(42)/2))
    camdata.clip_start=.05;camdata.clip_end=150;camdata.shift_x=0;camdata.shift_y=0
    result["render"]={"width":640,"height":480,"samples":32,"engine":"CYCLES","device":"CPU",
                      "viewTransform":s.view_settings.view_transform,"look":s.view_settings.look,
                      "exposure":float(s.view_settings.exposure),"gamma":float(s.view_settings.gamma)}
    need(s.view_settings.view_transform=="AgX","source color profile drift")
    images={}
    for name,state_key in (("artistic-reference","before"),("artistic-rotated","after"),("artistic-restored","restored")):
        state=browser["awc"][state_key]
        need((state["width"],state["height"])==(640,480),"matched viewport")
        target=arr(state["camera"]).reshape((4,4),order="F")
        projection=arr(state["projection"]).reshape((4,4),order="F")
        cam.matrix_world=Matrix(target.tolist());bpy.context.view_layer.update()
        actual=arr(cam.matrix_world)
        pm=arr(cam.calc_matrix_camera(bpy.context.evaluated_depsgraph_get(),x=640,y=480,scale_x=1,scale_y=1))
        matrix_error=float(np.max(np.abs(actual-target)));projection_error=float(np.max(np.abs(pm-projection)))
        need(matrix_error<=2e-6 and projection_error<=2e-6,"matched camera matrix/projection")
        p=out/(name+".png");s.render.filepath=str(p);bpy.ops.render.render(write_still=True)
        a=pixels(p);need(a.shape==(480,640,3),"render dimensions")
        lit=int(np.count_nonzero(a.max(axis=2)>.015));need(lit>=3072,"empty artistic render")
        images[name]=a;result["frames"][name]={"sha256":sha(p),"width":640,"height":480,"lit":lit,
                "cameraMatrixMaxDelta":matrix_error,"projectionMaxDelta":projection_error,"sourceState":state_key}
    ref=images["artistic-reference"]
    def compare(a):
        delta=np.abs(a-ref)
        return {"mean":float(delta.mean()),"max":float(delta.max()),
                "changedPixels":int(np.count_nonzero(delta.max(axis=2)>1/255+1e-7))}
    result["variation"]=compare(images["artistic-rotated"])
    result["rollback"]=compare(images["artistic-restored"])
    need(result["variation"]["changedPixels"]>=3072,"artistic camera change not visible")
    need(result["rollback"]["mean"]<=.0002 and result["rollback"]["max"]<=1/255+1e-7,"artistic rollback drift")
    need(all(bpy.data.objects[n].data.name==original_bindings[n] and [m.name if m else None for m in bpy.data.objects[n].data.materials]==original_materials[n] for n in names),"material/geometry mutation")
    result["sourceBindingsUnchanged"]=True
    result["status"]="PASS_ARTISTIC_DERIVATIVE"
finally:
    s.camera=previous_camera
    for name,value in visibility.items():bpy.data.objects[name].hide_render=value
    bpy.data.objects.remove(cam,do_unlink=True);bpy.data.cameras.remove(camdata)
    result["masterUnchanged"]=sha(master)==MASTER
    result["visibilityRestored"]=all(bpy.data.objects[n].hide_render==v for n,v in visibility.items())
    write(out/"artistic-derivative.json",result)
    print("AWC-E ARTISTIC",json.dumps(result),flush=True)
    need(result["masterUnchanged"] and result["visibilityRestored"],"master/visibility restoration")
