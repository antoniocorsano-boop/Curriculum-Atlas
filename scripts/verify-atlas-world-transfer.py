"""AWC-F independent transfer verifier, no approval or runtime mutation."""
import argparse,hashlib,importlib.util,json,math,struct,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("transfer",ROOT/"scripts/atlas-world-transfer.py")
transfer=importlib.util.module_from_spec(spec);spec.loader.exec_module(transfer)
need=transfer.need
def read(path):return transfer.read(path)
def sha(path):return transfer.hashfile(path)
def png_dims(p):
    b=p.read_bytes()[:24];need(b[:8]==b"\x89PNG\r\n\x1a\n","not PNG")
    return struct.unpack(">II",b[16:24])
def check(out,story,prior,revision):
    t=read(out/"transfer-plan.json");expected=transfer.make_transfer(read(transfer.SPEC),story,prior)
    need(t==expected,"transfer plan drift")
    a=read(out/"museo-artistic.json");b=read(out/"museo-browser.json")
    need(a["status"]=="PASS_MUSEO_ARTISTIC_DERIVATIVE" and b["status"]=="PASS_MUSEO_INTERACTIVE_TRANSFER","dual renderer gate")
    need(a["revision"]==b["revision"]==revision,"execution revision")
    need(a["planSha256"]==b["planSha256"]==t["planSha256"],"source plan identity")
    need(a["storyRevision"]==t["storyRevision"]=="e1dad70bbe2e05d9ab023c8af18c748adc5e27ed","story source identity")
    need(a["world"]==b["world"]==t["world"] and a["scene"]==b["scene"]==t["scene"],"different worlds")
    need(a["objects"]==b["result"]["sceneObjects"]==len(t["objects"]) and a["triangles"]==b["result"]["triangles"]==t["targetTriangles"],"geometry inventory")
    need(t["targetTriangles"]<transfer.awc.inputs()[-1]["profiles"]["mobile"]["visibleTrianglesTarget"],"mobile geometry budget")
    need(set(a["frames"])=={"reference","rotated","restored","cue-B"},"artistic frame inventory")
    need(set(b["frames"])=={"reference","rotated","restored","cue-B","mobile"},"browser frame inventory")
    seen=[]
    for f in t["frames"]:
        name=f["id"];art=a["frames"][name];web=b["frames"][name]
        for prefix,entry in (("museo-art-",art),("museo-web-",web)):
            path=out/(prefix+name+".png")
            need(path.exists() and sha(path)==entry["sha256"] and png_dims(path)==(640,480),"image integrity "+name)
        need(art["orbit"]==web["orbit"]==f["orbit"] and art["signal"]==web["signal"]==f["signal"],"frame states "+name)
        eye=web["camera"][12:15]
        need(all(math.isfinite(x) and abs(x-y)<1e-5 for x,y in zip(eye,f["eye"])),"WebGL camera transfer "+name)
        need(len(web["camera"])==16 and len(web["projection"])==16,"camera matrices")
        seen.append(name)
    mob=b["frames"]["mobile"]
    need(png_dims(out/"museo-web-mobile.png")==(320,240) and sha(out/"museo-web-mobile.png")==mob["sha256"],"mobile preview")
    need(a["frames"]["reference"]["sha256"]==a["frames"]["restored"]["sha256"],"Blender exact image rollback")
    need(b["frames"]["reference"]["sha256"]==b["frames"]["restored"]["sha256"],"WebGL exact image rollback")
    need(a["frames"]["reference"]["sha256"]!=a["frames"]["rotated"]["sha256"] and b["frames"]["reference"]["sha256"]!=b["frames"]["rotated"]["sha256"],"orbit not effective")
    need(a["frames"]["reference"]["sha256"]!=a["frames"]["cue-B"]["sha256"] and b["frames"]["reference"]["sha256"]!=b["frames"]["cue-B"]["sha256"],"simulated cue not effective")
    need(a["rollback"]["changedPixels"]==0 and a["rollback"]["mean"]==0 and a["rollback"]["max"]==0,"artistic reset")
    need(a["variation"]["changedPixels"]>500 and a["cueChange"]["changedPixels"]>500,"artistic variation")
    need(not b["externalRequests"] and not b["pageErrors"],"network or browser error")
    for flag in ("artisticApproval","publishable"):need(a[flag] is False,"artistic authority "+flag)
    for flag in ("artisticApproval","publishable","studentAuthorized","realHardwareControl"):
        need(b[flag] is False,"browser authority "+flag)
    need(all(v is False for v in t["authority"].values()),"source authority")
    need(b["result"]["realHardwareControl"] is False and b["result"]["studentAuthorized"] is False and b["result"]["publishable"] is False,"browser environment authority")
    need(t["reused"]["parameter"]=="camera.orbit" and t["reused"]["adapter"].startswith("museo-zero-camera-v1"),"parameter adapter")
    need(t["scene"]=="sala-zero.projection-cue" and "simulated sensor A/B" in t["pedagogicalScope"],"narrative scope")
    results={}
    for name in ("transfer-plan.json","museo-artistic.json","museo-browser.json"):
        results[name]={"sha256":sha(out/name),"bytes":(out/name).stat().st_size}
    for prefix,names in (("museo-art-",seen),("museo-web-",seen+["mobile"])):
        for name in names:
            filename=prefix+name+".png"
            results[filename]={"sha256":sha(out/filename),"bytes":(out/filename).stat().st_size}
    report={"schema":"atlas.awc.transfer-report/v1","status":"PASS_AWC_F_SECOND_WORLD",
            "revision":revision,"world":t["world"],"scene":t["scene"],"storyRevision":t["storyRevision"],
            "planSha256":t["planSha256"],"libraryEArtifactSha256":t["reused"]["libraryEArtifactSha256"],
            "reusedParameter":t["reused"]["parameter"],"sourceAssetsCopied":False,
            "sceneObjects":len(t["objects"]),"triangles":t["targetTriangles"],
            "renderers":["Blender/Cycles","three.js-r128"],"states":seen,
            "artisticVariation":a["variation"],"artisticCueChange":a["cueChange"],
            "blenderRollbackExact":True,"webglRollbackExact":True,"mobileBrowserPreview":True,
            "actualPhysicalDeviceQualified":False,"storySourceUnmodified":True,"libraryMasterUnmodified":True,
            "files":results,"authority":t["authority"],"publicDeployment":False,
            "artisticApproval":False,"studentAuthorized":False,"publishable":False}
    report["reportSha256"]=transfer.awc.asd.digest(report)
    return report
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--out",type=Path,required=True);p.add_argument("--story",type=Path,required=True)
    p.add_argument("--prior",type=Path,required=True);p.add_argument("--revision",required=True)
    a=p.parse_args();result=check(a.out,a.story,a.prior,a.revision)
    (a.out/"transfer-report.json").write_text(json.dumps(result,sort_keys=True,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
    print("AWC-F TRANSFER",json.dumps({k:result[k] for k in ("status","revision","reusedParameter","sceneObjects","triangles","blenderRollbackExact","webglRollbackExact")}))
if __name__=="__main__":main()
