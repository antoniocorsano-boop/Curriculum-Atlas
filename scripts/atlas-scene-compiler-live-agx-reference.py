"""Independent Blender display reference for each newly rendered live frame.

Reuse the RGB8 PNG decoder and reference writer from the qualified B2b probe.
"""
import importlib.util,json,os,sys
from pathlib import Path
import bpy
import numpy as np
spec=importlib.util.spec_from_file_location("agx_reference",Path(__file__).with_name("atlas-scene-compiler-agx-lut.py"))
ref=importlib.util.module_from_spec(spec);spec.loader.exec_module(ref)
def main():
    master,agx,out=map(lambda x:Path(x).resolve(),sys.argv[sys.argv.index("--")+1:])
    require=ref.require;sha=ref.sha
    require(Path(bpy.data.filepath).resolve()==master and sha(master)==ref.MASTER,"master identity")
    m=ref.read(agx/"agx-lut.json");r=ref.read(out/"live-agx.json")
    require(r["revision"]==os.environ["ATLAS_EXACT_HEAD"] and r["sourceRevision"]==m["revision"]=="f2f8c4737ecf1af87565b68cef4171ec2db0ba05","revision")
    require(r["status"]=="PASS_LIVE_AGX_PASS" and r["result"]["gpuRenderTargetSource"] and not r["externalRequests"] and not r["pageErrors"],"browser receipt")
    require(m["masterSha256"]==ref.MASTER and m["masterUnchanged"] and r["lutSha256"]==m["files"]["lut.rgba8"]["sha256"],"source identity")
    original=bpy.context.scene;v=original.view_settings;p=m["profile"]
    require(v.view_transform==p["viewTransform"]=="AgX" and v.look==p["look"]
            and v.exposure==p["exposure"] and v.gamma==p["gamma"]
            and original.display_settings.display_device==p["displayDevice"]=="sRGB"
            and not v.use_curve_mapping,"display profile")
    names=("reference","shifted","mobile","restored")
    require(set(r["arrays"])==set(names) and set(r["result"]["frames"])==set(names),"frame set")
    require(r["arrays"]["reference"]["linear"]["sha256"]==m["files"]["frame.rgba32f"]["sha256"],"original frame drift")
    require(r["arrays"]["reference"]["linear"]==r["arrays"]["restored"]["linear"] and r["arrays"]["reference"]["display"]==r["arrays"]["restored"]["display"],"rollback identity")
    scene=bpy.data.scenes.new("ASC B2c live display reference")
    try:
        scene.display_settings.display_device=p["displayDevice"]
        scene.view_settings.view_transform="AgX";scene.view_settings.look=p["look"]
        scene.view_settings.exposure=p["exposure"];scene.view_settings.gamma=p["gamma"];scene.view_settings.use_curve_mapping=False
        scene.render.dither_intensity=0
        fmt=scene.render.image_settings;fmt.file_format="PNG";fmt.color_mode="RGB";fmt.color_depth="8";fmt.color_management="FOLLOW_SCENE"
        cases={}
        for name in names:
            metric=r["result"]["frames"][name];w,h=metric["width"],metric["height"]
            require((w,h)==((320,240) if name=="mobile" else (640,480)),"viewport size")
            require(metric["screenMax"]<=1 and metric["lit"]>=1000,"screen coverage")
            a=r["arrays"][name]
            for kind,suffix,expected_size in (("linear",".rgba32f",w*h*16),("display",".rgba8",w*h*4),("image",".png",None)):
                f=out/(name+suffix)
                require(sha(f)==a[kind]["sha256"] and f.stat().st_size==a[kind]["bytes"],"frame bytes")
                if expected_size is not None:require(f.stat().st_size==expected_size,"frame size")
            linear=np.frombuffer((out/(name+".rgba32f")).read_bytes(),dtype="<f4").reshape(h,w,4)
            actual=np.frombuffer((out/(name+".rgba8")).read_bytes(),dtype=np.uint8).reshape(h,w,4)
            require(np.isfinite(linear).all() and np.all(linear[:,:,3]==1) and np.all(actual[:,:,3]==255),"opaque finite frame")
            require(float(linear[:,:,:3].min())>=0 and float(linear[:,:,:3].max())<=8,"LUT domain")
            expected_path=out/(name+"-blender-agx.png")
            expected=ref.save(linear,scene,expected_path)
            d=np.abs(expected.astype(np.int16)-actual[:,:,:3].astype(np.int16))
            lit=linear[:,:,:3].max(axis=2)>1e-6
            def stats(x):
                require(x.size>0,"empty comparison")
                return {"channels":int(x.size),"max":int(x.max()),"p99":int(np.sort(x.ravel())[int(np.ceil(.99*x.size))-1]),"mean":float(x.mean())}
            all_stats=stats(d);lit_stats=stats(d[lit])
            require(all(x["max"]<=4 and x["p99"]<=2 for x in (all_stats,lit_stats)),"AgX live mismatch "+name+" "+str((all_stats,lit_stats)))
            cases[name]={"all":all_stats,"nonblack":lit_stats,"referenceSha256":sha(expected_path)}
        require(r["result"]["frames"]["shifted"]["changed"]>=100 and r["result"]["frames"]["shifted"]["displayChanged"]>=100,"camera witness")
        report={"schema":"atlas.asc01.live-agx-reference/v1","revision":r["revision"],"status":"PASS_LIVE_AGX_REFERENCE",
                "browserReceiptSha256":sha(out/"live-agx.json"),"cases":cases,
                "masterUnchanged":sha(master)==ref.MASTER,"fullBeautyRenderQualified":False,
                "physicalDeviceQualified":False,"opticalTransparencyQualified":False,"artisticApproval":False,"publishable":False}
        (out/"live-agx-reference.json").write_text(json.dumps(report,indent=2,allow_nan=False)+"\n")
        print("ASC-B2c reference",json.dumps(report),flush=True)
    finally:bpy.data.scenes.remove(scene)
    require(sha(master)==ref.MASTER,"master changed")
if __name__=="__main__":main()
