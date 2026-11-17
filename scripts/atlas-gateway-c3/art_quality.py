"""SP-05: measurable composition gate and explicit visual review, never auto-approval."""
import hashlib,json,math,re
from pathlib import Path

HERE=Path(__file__).resolve().parent
BRIEF=HERE/"art-direction.json"
REVIEW=HERE/"art-review.json"
def brief():
    raw=BRIEF.read_bytes()
    data=json.loads(raw)
    assert data["schemaVersion"]==1
    assert data["phase"]=="C3.3A5.5a"
    return data,hashlib.sha256(raw).hexdigest()

def evaluate(study):
    b,digest=brief();o=b["objective"];stars=study["stars"]
    assert [s["id"] for s in stars]==o["requiredIds"]
    ys=[float(s["positionBlender"][1]) for s in stars]
    assert all(math.isfinite(y) for y in ys)
    depth=max(ys)-min(ys);checks={"depthSpread":depth>=o["minDepthSpreadM"]}
    widths={}
    def box(v):
        assert len(v)==4 and all(math.isfinite(x) for x in v) and v[0]<v[1] and v[2]<v[3]
        return v
    def overlap(a,b):
        m=o["protectedMargin"]
        return a[0]<b[1]+m and a[1]>b[0]-m and a[2]<b[3]+m and a[3]>b[2]-m
    for name in ("atrium","vertical"):
        q=study["projection"][name];bs=[box(v) for v in q["stars"]]
        protected=[box(q["arena"]),*[box(v) for v in q["portals"]]]
        assert len(bs)==4 and len(protected)==4
        widths[name]=[v[1]-v[0] for v in bs]
        checks[name+"Width"]=all(o["minProjectedWidth"][name]<=w<=o["maxProjectedWidth"][name] for w in widths[name])
        margin=o["minFrameMargin"]
        checks[name+"Frame"]=all(min(v)>=margin and max(v)<=1-margin for v in bs)
        checks[name+"Clearance"]=all(not overlap(v,p) for i,v in enumerate(bs) for p in protected+bs[:i])
    if "composition" in study:
        raw=(HERE/"knowledge-composition.json").read_bytes();plan=json.loads(raw)
        selected=plan["selected"];layout=plan["layouts"][selected]
        checks["compositionIdentity"]=study["composition"]["id"]==selected and study["composition"]["planSha256"]==hashlib.sha256(raw).hexdigest()
        checks["compositionGeometry"]=all(s["positionBlender"]==q[:3] and s["radiusBound"]==q[3] for s,q in zip(stars,layout))
        connections=study["connections"];cp=study["connectionProjection"]
        checks["symbolicConnections"]=[q["from"] for q in connections]==o["requiredIds"] and all(q["to"]=="esperienze" and q["interactive"] is False and q["samples"]==plan["segments"]+1 for q in connections)
        checks["connectionClearance"]=all(cp[name]["protectedClear"] is True and cp[name]["pathSampleCounts"]==[plan["segments"]+1]*4 for name in ("atrium","vertical"))
    if "identityStudy" in study:
        from adaptive_identity import solve,evidence
        from knowledge_composition import PLAN
        plan=json.loads(PLAN.read_text())
        expected=evidence(solve(plan))
        checks["adaptiveIdentity"]=study["identityStudy"]==expected and expected["status"]=="PASS"
        checks["identityGeometry"]=all(s.get("identityKind")==expected["shapeKinds"][s["id"]] and s.get("identityScale")==expected["selectedScales"][s["id"]] for s in stars)
    return {"briefSha256":digest,"status":"PASS" if all(checks.values()) else "REVISE","checks":checks,"depthSpreadM":depth,"projectedWidths":widths}

def require_review(identity,phase):
    b,digest=brief()
    assert phase==b["phase"] and REVIEW.is_file() and not REVIEW.is_symlink(),"SP-05: missing visual review"
    r=json.loads(REVIEW.read_text());e=r["previewReceipt"]
    assert r["decision"]=="accepted" and isinstance(r["reviewer"],str) and r["reviewer"].strip()
    assert type(r["artifactId"]) is int and r["artifactId"]>0
    assert e["status"]=="PREVIEW_ONLY" and e["qualified"] is False and e["publishable"] is False and e["studentAuthorized"] is False
    assert e["identity"]==identity and e["artQuality"]==evaluate(e["artEvidence"])
    assert e["artQuality"]["status"]=="PASS" and e["artQuality"]["briefSha256"]==digest
    assert all(e["artQuality"]["checks"].get(k) is True for k in ("compositionIdentity","compositionGeometry","symbolicConnections","connectionClearance","adaptiveIdentity","identityGeometry"))
    assert set(e["files"])=={"atrium","vertical"}
    assert all(re.fullmatch(r"[0-9a-f]{64}",q["sha256"]) for q in e["files"].values())
    scores=r["scores"];criteria=b["visualRubric"]["criteria"]
    assert set(scores)==set(criteria) and all(type(v) is int and b["visualRubric"].get("minimumByCriterion",{}).get(k,b["visualRubric"]["minimumEach"])<=v<=4 for k,v in scores.items())
    # A distinct high-resolution sculptural evidence package is mandatory.
    review=r["sculptureReview"];proposal=review["proposalReceipt"]
    assert type(review["artifactId"]) is int and review["artifactId"]>0
    assert proposal["candidateIdentity"]==identity and proposal["status"]=="ADAPTIVE_PREVIEW_ONLY" and proposal["result"]=="PASS"
    assert proposal["changedFromCanonical"]==[] and proposal["estimatedMaterialGroups"]==3
    assert proposal["artQuality"]==e["artQuality"] and proposal["artQuality"]["briefSha256"]==digest
    assert all(not proposal[k] for k in ("qualified","publishable","studentAuthorized","visualAcceptance","canonicalReviewReceipt"))
    dims={"review-atrium.png":[1200,750],"review-vertical.png":[640,960],**{"detail-"+s+".png":[512,512] for s in b["objective"]["requiredIds"]}}
    assert set(proposal["reviewImages"])==set(dims)
    assert all(proposal["reviewImages"][n]["dimensions"]==dim and re.fullmatch(r"[0-9a-f]{64}",proposal["reviewImages"][n]["sha256"]) and proposal["reviewImages"][n]["bytes"]>1000 for n,dim in dims.items())
    assert set(review["observations"])==set(dims) and all(isinstance(v,str) and v.strip() for v in review["observations"].values())
    assert isinstance(r["observations"],str) and r["observations"].strip()
    return r

def selftest():
    b,_=brief()
    def study(depth,small=False):
        boxes=[[.08+i*.20,.08+i*.20+(.04 if small else .08),.60,.69] for i in range(4)]
        p={"stars":boxes,"arena":[.45,.55,.85,.90],"portals":[[.1,.2,.2,.3],[.4,.5,.2,.3],[.7,.8,.2,.3]]}
        return {"stars":[{"id":s,"positionBlender":[i,depth*(i%2),7]} for i,s in enumerate(b["objective"]["requiredIds"])],"projection":{"atrium":p,"vertical":p}}
    assert evaluate(study(2.5))["status"]=="PASS"
    assert evaluate(study(.4))["status"]=="REVISE"
    assert evaluate(study(2.5,True))["status"]=="REVISE"
    a=study(2.5);a["projection"]["atrium"]["stars"][0]=[.45,.53,.86,.92]
    assert evaluate(a)["status"]=="REVISE"
    a=study(2.5);a["stars"][0]["id"]="unknown"
    try:evaluate(a)
    except AssertionError:pass
    else:raise AssertionError("unexpected semantic id")
    print("SP-05 artistic composition checks: 5/5 PASS (synthetic; actual evidence separate)")
if __name__=="__main__":selftest()
