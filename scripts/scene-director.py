"""ASD-01: typed, bounded, reversible configuration proposals; no renderer writes."""
import argparse, hashlib, json, math, re, subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CAT=Path("ops/atlas-scene-director/parameters.json")
MASTER=Path("ops/atlas-scene-package/editable-master-receipt-summary.json")
HEX64=re.compile(r"[a-f0-9]{64}")
HEX40=re.compile(r"[a-f0-9]{40}")
def require(ok,why):
    if not ok: raise ValueError(why)
def canonical(value):
    return json.dumps(value,sort_keys=True,separators=(",",":"),ensure_ascii=False,allow_nan=False).encode()
def digest(value): return hashlib.sha256(canonical(value)).hexdigest()
def validate_value(p,v):
    t=p["type"]
    if t=="boolean": require(type(v) is bool,p["id"]+": expected boolean")
    elif t=="enum": require(type(v) is str and v in p["values"],p["id"]+": unknown value")
    elif t=="number": require(type(v) in (int,float) and math.isfinite(v) and p["min"]<=v<=p["max"],p["id"]+": out of range")
    else: raise ValueError("unknown parameter type")
def specs(catalog,master,target):
    require(catalog["schema"]=="atlas.asd.parameter-registry/v1" and catalog["mode"]=="PLAN_ONLY","registry boundary")
    require(master["schema"]=="atlas.asp01.editable-master-evidence/v1" and master["file"]["sha256"]==catalog["masterSha256"],"wrong master")
    require(master["independentReopenRender"]["status"]=="PASS","unverified master")
    require(all(master[k] is False for k in ("artisticApproval","browserQualified","studentAuthorized","publishable")),"authority boundary")
    require(HEX40.fullmatch(catalog["sourceCommit"]) and HEX64.fullmatch(catalog["masterSha256"]),"source identity")
    require(target in ("blender","webgl"),"unknown target")
    allkeys=set();selected={}
    for p in catalog["parameters"]:
        key=(p["target"],p["id"])
        require(key not in allkeys,"duplicate parameter")
        allkeys.add(key)
        validate_value(p,p["baseline"])
        if p["id"]=="camera.active":
            require(p["values"]==master["cameraIds"],"camera inventory drift")
        if p["target"]==target:selected[p["id"]]=p
    require(bool(selected),"empty target")
    return selected
def make_plan(catalog,master,request):
    require(type(request) is dict and set(request)=={"target","masterSha256","expectedStateSha256","changes","reducedMotion","motionOptIn"},"unexpected request fields")
    target=request["target"];ps=specs(catalog,master,target)
    require(request["masterSha256"]==catalog["masterSha256"],"stale master")
    require(type(request["reducedMotion"]) is bool and type(request["motionOptIn"]) is bool,"explicit accessibility context required")
    baseline={k:p["baseline"] for k,p in ps.items()}
    require(request["expectedStateSha256"]==digest(baseline),"stale baseline; observe again")
    changes=request["changes"]
    require(type(changes) is dict and 0<len(changes)<=len(ps),"invalid change set")
    for k,v in changes.items():
        require(k in ps,"unknown or protected parameter: "+k)
        validate_value(ps[k],v)
    desired=dict(baseline,**changes)
    checks=["Preserve original master and protected groups","Review before any renderer application"]
    dependencies=[]
    if target=="webgl":
        if desired["astral.motion"]:
            require(request["motionOptIn"] and not request["reducedMotion"],"motion requires explicit opt-in and no reduced-motion preference")
        if any(k.startswith("camera.") for k in changes):
            checks+=["Check portal and astral projection in each supported viewport"]
        if any(k.startswith("lighting.") for k in changes):
            checks+=["Compare actual images against P1","Measure visual comfort and rendering cost"]
            dependencies.append("Lighting ranges are proposed experiments, not qualified profiles")
    else:
        if desired["camera.active"]!="atrium" and desired["astral.visible"]:
            dependencies.append("Reproject ALS-01 static points with camera-specific optical adapter before rendering")
        if desired["camera.active"]!="atrium":
            checks+=["Apply camera resolution and verify framing"]
        if "astral.visible" in changes:
            checks+=["Compare reference with and without optical points"]
    actual=[{"id":k,"before":baseline[k],"after":desired[k],"unit":ps[k]["unit"],"binding":ps[k]["binding"],"scope":ps[k]["scope"]} for k in sorted(changes) if baseline[k]!=desired[k]]
    require(bool(actual),"no effective change")
    return {"schema":"atlas.asd.plan/v1","target":target,"mode":"PLAN_ONLY","status":"DEPENDENCY_REQUIRED" if dependencies else "CANDIDATE","masterSha256":catalog["masterSha256"],"registrySha256":digest(catalog),"baselineSha256":digest(baseline),"candidateSha256":digest(desired),"changes":actual,"candidate":desired,"rollback":baseline,"dependencies":dependencies,"checks":checks,"protected":catalog["protected"],"rendererWriteAuthorized":False,"artisticApproval":False,"studentAuthorized":False,"publishable":False}
def request_for(catalog,master,target,changes,reduced=True,opt_in=False):
    baseline={k:p["baseline"] for k,p in specs(catalog,master,target).items()}
    return {"target":target,"masterSha256":catalog["masterSha256"],"expectedStateSha256":digest(baseline),"changes":changes,"reducedMotion":reduced,"motionOptIn":opt_in}
def load_sources(root=ROOT):
    return tuple(json.loads((root/p).read_text()) for p in (CAT,MASTER))
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--request",type=Path)
    parser.add_argument("--example",choices=("webgl","blender"))
    args=parser.parse_args()
    require(bool(args.request)!=bool(args.example),"choose request or example")
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    for p in (CAT,MASTER):
        require((ROOT/p).read_bytes()==subprocess.check_output(["git","show",f"{head}:{p.as_posix()}"],cwd=ROOT),"uncommitted source")
    c,m=load_sources()
    req=json.loads(args.request.read_text()) if args.request else request_for(c,m,args.example,{"camera.orbit":.11,"lighting.exposure":.9} if args.example=="webgl" else {"camera.active":"vertical"})
    result=make_plan(c,m,req)
    result["exactHead"]=head
    print(json.dumps(result,ensure_ascii=False,indent=2))
if __name__=="__main__":main()
