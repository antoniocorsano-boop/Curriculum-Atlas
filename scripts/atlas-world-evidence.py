"""AWC-B: observation profiles, derived from exact producer evidence.
No parameter binding, renderer invocation, distribution, or promotion.
Archive replay is explicit; catalog-only checks never claim evidence revalidation.
"""
import argparse, hashlib, json, re, zipfile
from pathlib import Path
import importlib.util

ROOT=Path(__file__).resolve().parents[1]
INDEX=Path("ops/atlas-scene-package/awc-evidence-index.json")
spec=importlib.util.spec_from_file_location("awc_catalog",ROOT/"scripts/atlas-world-catalog.py")
awc=importlib.util.module_from_spec(spec)
spec.loader.exec_module(awc)
require=awc.require
strict_json=awc.strict_json
HEX64=re.compile(r"[0-9a-f]{64}")
HEX40=re.compile(r"[0-9a-f]{40}")
AUTHORITY={"execute","parameterWrite","masterWrite","runtimeWrite","artisticApproval",
           "physicalDeviceQualified","publishable","studentAuthorized","licenseQualified","autoPromotion"}
PROFILE_ENTRIES={"library.pages.reduction":"library.architecture","library.walnut.microstructure":"library.materials",
                 "library.walnut.lightmap":"library.materials","library.agx.display":"library.lighting",
                 "library.bay.navigation":"library.camera"}
RECEIPTS={"pages","micro","finish","bake","agx","agxRef","bay","browser"}
ARCHIVES={"geometry","micro","finish","agx","bay"}

def sha(raw):return hashlib.sha256(raw).hexdigest()
def hex64(value):return type(value) is str and HEX64.fullmatch(value) is not None
def hex40(value):return type(value) is str and HEX40.fullmatch(value) is not None
def shape(obj,keys,msg):require(type(obj) is dict and set(obj)==set(keys),msg)
def pointer(obj,path):
    require(type(path) is str and path.startswith("/") and not path.endswith("/"),"receipt pointer")
    for p in path[1:].split("/"):
        require(p and "~" not in p,"unsupported pointer escape")
        if type(obj) is dict:
            require(p in obj,"missing receipt field "+path);obj=obj[p]
        elif type(obj) is list:
            require(p.isdecimal() and int(p)<len(obj),"receipt index "+path);obj=obj[int(p)]
        else:raise ValueError("invalid receipt traversal "+path)
    return obj
def same(a,b):
    # bool is not interchangeable with an integer; JSON 0 and 0.0 are equal.
    if type(a) is bool or type(b) is bool:return type(a) is type(b) and a==b
    return a==b

def load_catalog():
    c=strict_json((ROOT/awc.CATALOG).read_bytes())
    s={k:(ROOT/p).read_bytes() for k,p in awc.SOURCES.items()}
    return c,awc.validate(c,s)

def validate(index,catalog,report):
    shape(index,{"schema","version","mode","masterSha256","catalogVersion","archives","receipts","profiles","authority"},"index shape")
    require(index["schema"]=="atlas.awc.evidence-index/v1" and index["version"]=="0.1.0"
            and index["mode"]=="OBSERVATION_ONLY","index boundary")
    require(index["catalogVersion"]==catalog["version"] and index["masterSha256"]==report["masterReceiptSha256"],"catalog/master identity")
    shape(index["authority"],AUTHORITY,"authority shape")
    require(all(x is False for x in index["authority"].values()),"no promotion or execution")
    shape(index["archives"],ARCHIVES,"archive set")
    artifact_ids=set()
    for key,a in index["archives"].items():
        shape(a,{"pr","revision","run","artifact","sha256"},"archive shape")
        require(all(type(a[k]) is int and a[k]>0 for k in ("pr","run","artifact")) and hex40(a["revision"]) and hex64(a["sha256"]),"archive identity")
        require(a["artifact"] not in artifact_ids,"duplicate artifact")
        artifact_ids.add(a["artifact"])
    shape(index["receipts"],RECEIPTS,"receipt set")
    files=set()
    for key,r in index["receipts"].items():
        shape(r,{"archive","file","sha256","schema","status"},"receipt shape")
        require(r["archive"] in index["archives"] and re.fullmatch(r"[a-z][a-z0-9-]*[.]json",r["file"]) is not None
                and hex64(r["sha256"]) and r["schema"].startswith("atlas.asc01."),"receipt identity")
        require(r["status"] is None or (type(r["status"]) is str and r["status"].startswith("PASS_")),"receipt status")
        pair=(r["archive"],r["file"]);require(pair not in files,"duplicate receipt file");files.add(pair)
    entries={e["id"]:e for e in catalog["entries"]}
    profiles={}
    require(type(index["profiles"]) is list,"profiles")
    for p in index["profiles"]:
        shape(p,{"id","entry","state","scope","dependencies","targets","facts","limitations"},"profile shape")
        pid=p["id"]
        require(pid in PROFILE_ENTRIES and pid not in profiles and p["entry"]==PROFILE_ENTRIES[pid] and p["entry"] in entries,"profile identity")
        require(p["state"]=="OBSERVED_BOUNDED" and type(p["scope"]) is str and p["scope"],"profile scope")
        targets=awc.strings(p["targets"],"profile targets")
        require(targets and targets<=awc.TARGETS,"profile targets")
        awc.strings(p["dependencies"],"profile dependencies")
        require(awc.strings(p["limitations"],"profile limitations"),"profile limits")
        require(type(p["facts"]) is dict and p["facts"],"profile facts")
        for name,f in p["facts"].items():
            require(type(name) is str and re.fullmatch(r"[a-z][A-Za-z0-9]*",name),"fact identity")
            require(type(f) is list and len(f)==3 and f[0] in index["receipts"],"fact source")
            require(type(f[1]) is str and f[1].startswith("/") and not f[1].endswith("/"),"fact pointer")
            require(type(f[2]) in (str,int,float,bool),"scalar observation")
        profiles[pid]=p
    require(set(profiles)==set(PROFILE_ENTRIES),"profile coverage")
    visited=set();active=set()
    def visit(pid):
        require(pid in profiles and pid not in active,"profile dependency or cycle")
        if pid in visited:return
        active.add(pid)
        for dep in profiles[pid]["dependencies"]:visit(dep)
        active.remove(pid);visited.add(pid)
    for pid in profiles:visit(pid)
    # Observational records cannot unblock architecture/material parameter bindings.
    require(report["blockedEntries"]==["library.architecture","library.materials"],"unexpected catalog promotion")
    require(report["rendererExecution"] is False and report["artisticApproval"] is False,"catalog promotion")
    return {"schema":"atlas.awc.evidence-report/v1","status":"INDEX_CONTRACT_VALID","mode":"OBSERVATION_ONLY",
            "masterSha256":index["masterSha256"],"profileCount":len(profiles),
            "archiveCount":len(index["archives"]),"receiptCount":len(index["receipts"]),
            "factCount":sum(len(p["facts"]) for p in profiles.values()),"archiveReplay":False,
            "blockedEntries":report["blockedEntries"],"authority":index["authority"]}

def replay(index,directory):
    receipts={}
    for key,a in index["archives"].items():
        path=Path(directory)/(str(a["artifact"])+".zip")
        require(path.is_file(),"missing immutable archive "+key)
        raw=path.read_bytes();require(sha(raw)==a["sha256"],"archive hash "+key)
        with zipfile.ZipFile(path) as z:
            for rid,r in index["receipts"].items():
                if r["archive"]!=key:continue
                require(z.namelist().count(r["file"])==1,"receipt missing or duplicate "+rid)
                content=z.read(r["file"]);require(sha(content)==r["sha256"],"receipt hash "+rid)
                rec=strict_json(content)
                require(rec["revision"]==a["revision"] and rec["schema"]==r["schema"],"receipt revision/schema "+rid)
                if r["status"] is not None:
                    status=rec["result"]["status"] if rid=="agx" else rec["status"]
                    require(status==r["status"],"receipt status "+rid)
                    if rid=="agx":require(rec["status"]==r["status"],"outer AgX status")
                if "masterSha256" in rec:require(rec["masterSha256"]==index["masterSha256"],"receipt master "+rid)
                for scope in (rec,rec.get("result",{})):
                    for flag in ("artisticApproval","publishable","physicalDeviceQualified","studentAuthorized","masterModified","runtimeModified"):
                        if flag in scope:require(scope[flag] is False,"producer promotion "+rid+" "+flag)
                receipts[rid]=rec
    require(set(receipts)==set(index["receipts"]),"receipt coverage")
    p,m,f,b,a,ar,y,n=(receipts[k] for k in ("pages","micro","finish","bake","agx","agxRef","bay","browser"))
    require(p["masterUnchanged"] and p["sharedMeshesRestored"] and b["masterUnchanged"] and b["bindingsRestored"]
            and ar["masterUnchanged"] and y["masterUnchanged"],"master/rollback evidence")
    require(f["priorRevision"]==m["revision"] and f["priorMean"]==m["cases"]["micro-full-texture"]["mean"],"material lineage")
    require(f["decision"]=="CANDIDATE_FOR_VISUAL_REVIEW" and f["artisticApproval"] is False,"material decision")
    require(b["p2bReceiptSha256"]==index["receipts"]["pages"]["sha256"],"geometry lineage")
    require(ar["browserReceiptSha256"]==index["receipts"]["agx"]["sha256"],"AgX lineage")
    require(y["sourceRevision"]==n["sourceRevision"]==f["revision"] and y["materialPackageSha256"]==n["packageSha256"]==f["packageSha256"]
            and y["sha256"]==n["baySha256"],"bay lineage")
    require(not a["externalRequests"] and not a["pageErrors"] and not n["externalRequests"] and not n["pageErrors"],"browser errors or external requests")
    require(n["result"]["geometryBudgetOnly"] is True and n["result"]["sourceRoughness"] is True
            and n["result"]["agxLive"] is True,"bay boundary")
    require(n["views"]["reference"]["sha256"]==n["views"]["restored"]["sha256"]!=n["views"]["rotated"]["sha256"],"navigation rollback")
    observations={}
    for profile in index["profiles"]:
        facts={}
        for name,(rid,path,value) in profile["facts"].items():
            observed=pointer(receipts[rid],path)
            require(same(observed,value),"observation drift "+profile["id"]+"."+name)
            facts[name]=observed
        observations[profile["id"]]=facts
    return observations

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archives",type=Path,help="directory of original ZIPs named <artifact-id>.zip")
    parser.add_argument("--report",type=Path)
    args=parser.parse_args()
    index=strict_json((ROOT/INDEX).read_bytes());catalog,base=load_catalog()
    report=validate(index,catalog,base)
    if args.archives:
        observations=replay(index,args.archives)
        report.update(status="PASS_AWC_B_EVIDENCE_REPLAY",archiveReplay=True,observations=observations)
    raw=json.dumps(report,indent=2,sort_keys=True,allow_nan=False)+"\n"
    if args.report:args.report.write_text(raw)
    print(raw,end="")
if __name__=="__main__":main()
