"""ASI-01 L1: deterministic read-only evidence projection, not model training."""
import argparse, hashlib, json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = "antoniocorsano-boop/" + "Curri" + "culum-Atlas"
HEX40 = re.compile(r"[a-f0-9]{40}")
HEX64 = re.compile(r"[a-f0-9]{64}")

def require(ok, why):
    if not ok: raise ValueError(why)

def digest(raw): return hashlib.sha256(raw).hexdigest()
def load(root, path):
    data = (root/path).read_bytes()
    return data, digest(data)

def read_history(raw):
    rows = [json.loads(x) for x in raw.decode().splitlines() if x.strip()]
    ids = {}
    for i,r in enumerate(rows,1):
        require(r["id"] == f"ASP-H{i:03d}" and r["sequence"] == i, "invalid history sequence")
        if r.get("supersedes"):
            require(r["supersedes"] in ids,"unknown supersession")
        ids[r["id"]] = r
    return ids

def project(history_raw, rules, master, master_hash, exact_head, tags=()):
    require(HEX40.fullmatch(exact_head),"exact head required")
    rows = read_history(history_raw)
    superseded = {r["supersedes"] for r in rows.values() if r.get("supersedes")}
    require(rules["schema"]=="atlas.asi.rules/v1","rule schema")
    require(master["schema"]=="atlas.asp01.editable-master-evidence/v1","master schema")
    require(master["independentReopenRender"]["status"]=="PASS","master not reopened")
    require(all(master[k] is False for k in ("artisticApproval","browserQualified","studentAuthorized","publishable")),"master authority boundary")
    require(len(master["collections"])==10 and len(master["cameraIds"])==7,"inventory")
    require(HEX64.fullmatch(master_hash) and HEX64.fullmatch(master["file"]["sha256"]),"master digest")
    require(HEX40.fullmatch(master["sourceCommit"]),"master source")
    sources = []
    findings = []
    blocked = []
    seen = set()
    for rule in rules["rules"]:
        require(rule["id"] not in seen,"duplicate rule")
        seen.add(rule["id"])
        if tags and not set(tags).intersection(rule["tags"]): continue
        require(bool(rule["sources"]) and bool(rule["preconditions"]) and bool(rule["checks"]),"unbounded candidate")
        refs=[];issues=[]
        for rid,commit,status in rule["sources"]:
            row=rows.get(rid)
            if row is None: issues.append("missing:"+rid); continue
            if rid in superseded: issues.append("superseded:"+rid); continue
            if row["commit"]!=commit or row["status"]!=status: issues.append("source-changed:"+rid); continue
            refs.append({"record":rid,"commit":commit,"status":status,"artifactIds":row["artifacts"],"sourceRef":f"https://github.com/{REPO}/blob/{exact_head}/ops/atlas-scene-package/history.jsonl","summary":row["summary"]})
        if issues:
            blocked.append({"id":rule["id"],"issues":issues,"status":"REVIEW_REQUIRED"});continue
        findings.append({"id":rule["id"],"subject":rule["domain"],"scope":"historical evidence; applicability must be checked","status":"HISTORICAL","finding":rule["finding"],"sourceRefs":refs,"negativeKnowledge":bool(rule.get("negative")),"nextCandidateAction":{"action":rule["candidate"],"preconditions":rule["preconditions"],"checks":rule["checks"],"limit":rule["limit"],"authorized":False}})
    return {"schema":"atlas.asi.context/v1","mode":"READ_ONLY_CANDIDATE","knowledgeStatus":"HISTORICAL","liveObservationStatus":"UNAVAILABLE","effectiveContextStatus":"DEGRADED" if blocked else "USABLE_FOR_HISTORICAL_REFERENCE","exactHead":exact_head,"historySha256":digest(history_raw),"masterObservation":{"sourceCommit":master["sourceCommit"],"run":master["run"],"receiptSha256":master_hash,"fileSha256":master["file"]["sha256"],"collections":master["collections"],"cameraIds":master["cameraIds"],"packedImageCount":master["packedImageCount"],"als":master["als"],"independentReopenRender":master["independentReopenRender"],"artisticApproval":False,"browserQualified":False},"findings":findings,"blocked":blocked,"runtimeAuthorized":False,"studentAuthorized":False,"publishable":False,"modelTraining":False}

def build(root,head,tags=()):
    h,_=load(root,"ops/atlas-scene-package/history.jsonl")
    r,rh=load(root,"ops/atlas-scene-intelligence/rules.json")
    m,mh=load(root,"ops/atlas-scene-package/editable-master-receipt-summary.json")
    result=project(h,json.loads(r),json.loads(m),mh,head,tags)
    result["rulesSha256"]=rh
    return result

def main():
    p=argparse.ArgumentParser();p.add_argument("--tag",action="append",default=[]);a=p.parse_args()
    # Source files must match the checked-out commit, not uncommitted content.
    head=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    for path in ("ops/atlas-scene-package/history.jsonl","ops/atlas-scene-intelligence/rules.json","ops/atlas-scene-package/editable-master-receipt-summary.json"):
        require((ROOT/path).read_bytes()==subprocess.check_output(["git","show",f"{head}:{path}"],cwd=ROOT),"uncommitted source "+path)
    print(json.dumps(build(ROOT,head,a.tag),ensure_ascii=False,indent=2))
if __name__=="__main__": main()
