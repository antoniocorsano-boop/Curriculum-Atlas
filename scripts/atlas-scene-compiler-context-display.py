"""B2a: apply the pinned Blender AgX display transform offline to verified GPU floats.

This is a reference transform and numeric diagnostic, not a WebGL AgX shader
or a full-scene beauty render. No source scene modifications are required.
"""
import hashlib,json,os,sys
from pathlib import Path
import bpy
import numpy as np
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def load_rgba(path,w,h,receipt):
    require(sha(path)==receipt["sha256"] and path.stat().st_size==receipt["bytes"]==w*h*16,"array identity")
    a=np.frombuffer(path.read_bytes(),dtype="<f4").reshape(h,w,4)
    require(np.isfinite(a).all() and np.all(a[:,:,3]==1),"invalid opaque RGBA")
    return a
def configure(scene,transform,look,exposure,gamma,display):
    scene.display_settings.display_device=display
    scene.view_settings.view_transform=transform
    scene.view_settings.look=look
    scene.view_settings.exposure=exposure
    scene.view_settings.gamma=gamma
    scene.render.image_settings.file_format="PNG"
    scene.render.image_settings.color_mode="RGB"
    scene.render.image_settings.color_depth="8"
    scene.render.image_settings.color_management="FOLLOW_SCENE"
def save(a,scene,path):
    h,w=a.shape[:2]
    im=bpy.data.images.new("ASC B2a linear reference",width=w,height=h,alpha=True,float_buffer=True)
    try:
        im.colorspace_settings.name="Linear Rec.709"
        im.alpha_mode="NONE"
        im.pixels.foreach_set(np.asarray(a,dtype=np.float32).ravel());im.update()
        verify=np.empty(a.size,np.float32);im.pixels.foreach_get(verify)
        require(np.array_equal(verify.reshape(a.shape)[:,:,:3],a[:,:,:3]),"image write drift")
        im.save_render(str(path),scene=scene)
    finally:bpy.data.images.remove(im)
    loaded=bpy.data.images.load(str(path),check_existing=False)
    try:
        require(tuple(loaded.size)==(w,h),"PNG dimensions")
        px=np.empty(a.size,np.float32);loaded.pixels.foreach_get(px)
        return px.reshape(h,w,4)[:,:,:3].copy()
    finally:bpy.data.images.remove(loaded)
def main():
    master,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
    require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
    o=read(out/"context-oracle.json");r=read(out/"context-browser.json")
    require(o["revision"]==r["revision"]==os.environ["ATLAS_EXACT_HEAD"] and
            r["oracleSha256"]==sha(out/"context-oracle.json") and
            r["status"]=="PASS_OPAQUE_CONTEXT_BINDING","browser evidence")
    src=bpy.context.scene
    color=o["color"]
    require(src.view_settings.view_transform==color["viewTransform"]=="AgX"
            and src.view_settings.look==color["look"]
            and src.view_settings.exposure==color["exposure"]
            and src.view_settings.gamma==color["gamma"],"source color settings drift")
    a=load_rgba(out/"actualChart.rgba32f",96,64,r["arrays"]["actualChart"])
    e=load_rgba(out/"expectedChart.rgba32f",96,64,r["arrays"]["expectedChart"])
    gpu=load_rgba(out/"gpu.rgba32f",640,480,r["arrays"]["gpu"])
    scene=bpy.data.scenes.new("ASC B2a isolated display transform")
    try:
        display=src.display_settings.display_device
        configure(scene,"AgX",color["look"],color["exposure"],color["gamma"],display)
        pa=save(a,scene,out/"actual-agx-chart.png")
        pe=save(e,scene,out/"expected-agx-chart.png")
        save(gpu,scene,out/"context-agx-reference.png")
        delta=np.abs(pa-pe)
        require(np.isfinite(delta).all() and float(delta.max())<=1/255+1e-6,"offline AgX chart mismatch")
        # Known nonuniform HDR chart demonstrates that Standard and AgX differ.
        values=np.array([0,.0031308,.018,.18,.5,1,2,4,8],np.float32)
        chart=np.ones((3,len(values),4),np.float32)
        for y in range(3):
            for c in range(3):chart[y,:,c]=np.roll(values,y+c)
        agx=save(chart,scene,out/"hdr-agx.png")
        configure(scene,"Standard","None",color["exposure"],color["gamma"],display)
        standard=save(chart,scene,out/"hdr-standard.png")
        diff=float(np.max(np.abs(agx-standard)))
        require(diff>0.02,"AgX indistinguishable from Standard in HDR diagnostic")
        names=("actual-agx-chart.png","expected-agx-chart.png","context-agx-reference.png","hdr-agx.png","hdr-standard.png")
        report={"schema":"atlas.asc01.context-display/v1","revision":o["revision"],
                "status":"PASS_OFFLINE_AGX_REFERENCE","viewTransform":"AgX","look":color["look"],
                "exposure":color["exposure"],"gamma":color["gamma"],"displayDevice":display,
                "blenderVersion":bpy.app.version_string,"chartMaxReadbackDelta":float(delta.max()),
                "hdrAgxVsStandardMaxReadbackDelta":diff,"samples":r["result"]["metrics"]["testedColor"],
                "images":{n:sha(out/n) for n in names},"masterUnchanged":sha(master)==MASTER,
                "agxRuntimeQualified":False,"fullBeautyRenderQualified":False,"artisticApproval":False,
                "publishable":False}
        (out/"context-display.json").write_text(json.dumps(report,indent=2,allow_nan=False)+"\n")
        print("ASC-B2a display",json.dumps(report),flush=True)
    finally:bpy.data.scenes.remove(scene)
    require(sha(master)==MASTER,"master changed")
if __name__=="__main__":main()
