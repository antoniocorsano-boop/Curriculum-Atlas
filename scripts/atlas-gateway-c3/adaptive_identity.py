"""SP-06.1/2: deterministic local adaptation of actual projected core meshes."""
import hashlib,itertools,json,math
from pathlib import Path
from knowledge_composition import project

HERE=Path(__file__).resolve().parent
POLICY=HERE/"adaptive-identity.json"
from star_sculpture import geometry,inspect

def mask(camera,center,verts,faces,w,h):
    points=[project(camera,tuple(a+b for a,b in zip(center,v))) for v in verts]
    pts=[(x*w,y*h) for x,y in points];pix=set()
    def side(a,b,p):return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])
    for f in faces:
        a,b,c=[pts[i] for i in f];area=side(a,b,c)
        if abs(area)<1e-9:continue
        for y in range(max(0,math.floor(min(a[1],b[1],c[1]))),min(h,math.ceil(max(a[1],b[1],c[1])))):
            for x in range(max(0,math.floor(min(a[0],b[0],c[0]))),min(w,math.ceil(max(a[0],b[0],c[0])))):
                p=(x+.5,y+.5)
                if all(side(u,v,p)*area>=-1e-8 for u,v in ((a,b),(b,c),(c,a))):pix.add((x,y))
    return pix

def describe(pix,n):
    if not pix:return {"width":0,"height":0,"area":0},set()
    x0=min(x for x,y in pix);y0=min(y for x,y in pix)
    w=max(x for x,y in pix)-x0+1;h=max(y for x,y in pix)-y0+1
    norm={(x,y) for y in range(n) for x in range(n) if (x0+min(w-1,int((x+.5)*w/n)),y0+min(h-1,int((y+.5)*h/n))) in pix}
    return {"width":w,"height":h,"area":len(pix)},norm

def read_policy():
    raw=POLICY.read_bytes();p=json.loads(raw)
    assert p["schemaVersion"]==1 and p["phase"]=="C3.3A5.5a"
    assert p["ids"]==["storie","laboratori","scoperte","percorsi"]
    assert p["shapeKinds"]==["libro-aperto","moduli-connessi","rosa-di-orientamento","freccia-ascendente"]
    assert p["scales"]==[.70,.82,.94,1.06] and p["maxAttempts"]==4
    assert p["halfThicknessM"]==.11 and p["maxCoreRadiusM"]==.64 and p["minCoreRadiusM"]==.55
    assert p["normalizationPixels"]==32 and p["maxNormalizedIoU"]==.65
    assert p["views"]=={"atrium":{"pixels":[600,375],"minWidth":24,"minHeight":18,"minArea":180},"vertical":{"pixels":[320,480],"minWidth":18,"minHeight":16,"minArea":120}}
    assert p["resources"]=={"maxBlenderPreviews":1,"externalServices":False,"paidServices":False}
    return p,hashlib.sha256(raw).hexdigest()

def run(plan,p,max_attempts):
    ids=p["ids"];layout=plan["layouts"][plan["selected"]]
    assert plan["ids"]==ids and len(layout)==4 and 1<=max_attempts<=p["maxAttempts"]
    scales=p["scales"];indices=[0]*4;attempts=[];best=None
    for attempt in range(max_attempts):
        current=[scales[i] for i in indices]
        meshes=[geometry(sid,scale,p["halfThicknessM"]) for sid,scale in zip(ids,current)]
        failed={sid:[] for sid in ids};metrics={};pairs={};sculptures={}
        for i,(sid,(v,f)) in enumerate(zip(ids,meshes)):
            extent=max(math.sqrt(sum(x*x for x in q)) for q in v)
            sculptures[sid]=inspect(sid,v,f)
            if not sculptures[sid]["valid"]:failed[sid].append("sculpturalMesh")
            if extent>min(p["maxCoreRadiusM"],layout[i][3]) or extent<p["minCoreRadiusM"] or min(q[2]+layout[i][2] for q in v)<=6:
                failed[sid].append("coreEnvelope")
        for name,limits in p["views"].items():
            w,h=limits["pixels"];metrics[name]={};normalized=[]
            for sid,center,(v,f) in zip(ids,layout,meshes):
                m,n=describe(mask(plan["cameras"][name],center[:3],v,f,w,h),p["normalizationPixels"])
                metrics[name][sid]=m;normalized.append(n)
                if m["width"]<limits["minWidth"] or m["height"]<limits["minHeight"] or m["area"]<limits["minArea"]:
                    failed[sid].append(name+"MinimumSize")
            pairs[name]={}
            for i,j in itertools.combinations(range(4),2):
                a,b=normalized[i],normalized[j];iou=len(a&b)/len(a|b) if a|b else 1.
                pairs[name][ids[i]+":"+ids[j]]=round(iou,6)
                if iou>p["maxNormalizedIoU"]:
                    failed[ids[i]].append(name+"Similarity:"+ids[j]);failed[ids[j]].append(name+"Similarity:"+ids[i])
        failure_count=sum(len(v) for v in failed.values())
        record={"attempt":attempt+1,"scales":dict(zip(ids,current)),"metrics":metrics,"normalizedIoU":pairs,"sculptures":sculptures,"failed":failed,"status":"PASS" if failure_count==0 else "REVISE"}
        attempts.append(record)
        # Stable selection: minimum failed criteria, then earliest attempt.
        rank=(failure_count,attempt)
        if best is None or rank<best[0]:best=(rank,record,meshes)
        if not failure_count:break
        next_indices=[min(i+1,len(scales)-1) if failed[sid] else i for sid,i in zip(ids,indices)]
        if next_indices==indices:break
        indices=next_indices
    record,meshes=best[1],best[2]
    return {"status":"PASS" if best[0][0]==0 else "EXHAUSTED","attempts":attempts,"selectedAttempt":record["attempt"],"selectedScales":record["scales"],"sculptureEvidence":record["sculptures"],"shapeKinds":dict(zip(ids,p["shapeKinds"])),"meshes":{sid:{"vertices":[list(q) for q in v],"faces":[list(q) for q in f]} for sid,(v,f) in zip(ids,meshes)},"visualAcceptance":False,"qualified":False,"publishable":False}

def solve(plan):
    p,digest=read_policy();result=run(plan,p,p["maxAttempts"])
    result["policySha256"]=digest
    return result

def evidence(result):
    return {k:v for k,v in result.items() if k!="meshes"}

def selftest(plan):
    p,_=read_policy();a=solve(plan);b=solve(plan)
    assert a==b and a["status"]=="PASS"
    assert a["attempts"][0]["status"]=="REVISE" and a["selectedAttempt"]>1
    assert len(a["attempts"])<=p["maxAttempts"] and a["selectedAttempt"]==len(a["attempts"])
    assert run(plan,p,1)["status"]=="EXHAUSTED"
    for old,new in zip(a["attempts"],a["attempts"][1:]):
        for sid in p["ids"]:
            if not old["failed"][sid]:assert new["scales"][sid]==old["scales"][sid]
    assert all(q["valid"] for q in a["sculptureEvidence"].values())
    for sid in p["ids"]:
        q=a["meshes"][sid]
        assert inspect(sid,q["vertices"],q["faces"])==a["sculptureEvidence"][sid]
        assert not inspect(sid,q["vertices"],q["faces"][:-1])["valid"]
        assert not inspect(sid,*geometry(sid,.70,p["halfThicknessM"]))["valid"]
    assert a["selectedScales"]=={"storie":.94,"laboratori":1.06,"scoperte":1.06,"percorsi":.94}
    # SP-07.4: exact outer-ring preservation and unchanged projected mask.
    from star_sculpture import sculpture
    for i,sid in enumerate(p["ids"]):
        scale=a["selectedScales"][sid];half=p["halfThicknessM"]
        old_v,old_f=geometry(sid,scale,half,relief=False)
        new_v,new_f=geometry(sid,scale,half)
        offset_old=offset_new=0
        for poly,*_ in sculpture(sid):
            n=len(poly)
            assert old_v[offset_old:offset_old+4*n]==new_v[offset_new:offset_new+4*n]
            offset_old+=4*n;offset_new+=5*n+1
        assert offset_old==len(old_v) and offset_new==len(new_v)
        center=plan["layouts"][plan["selected"]][i][:3]
        for view,limits in p["views"].items():
            w,h=limits["pixels"]
            assert mask(plan["cameras"][view],center,old_v,old_f,w,h)==mask(plan["cameras"][view],center,new_v,new_f,w,h),(sid,view,"silhouette changed")
        for view in ("portrait-focus",):
            assert mask(plan["cameras"][view],center,old_v,old_f,640,960)==mask(plan["cameras"][view],center,new_v,new_f,640,960),(sid,view,"silhouette changed")
        damaged=list(new_v);n=len(sculpture(sid)[0][0]);x,y,z=damaged[4*n];damaged[4*n]=(x,y+.012,z)
        assert not inspect(sid,damaged,new_f)["valid"],(sid,"relief tamper accepted")
    print("SP-07.4 exact exterior rings, three projected silhouettes and negative relief checks: PASS")

    assert not a["visualAcceptance"] and not a["qualified"] and not a["publishable"]
    print("SP-06/07.2 adaptive selftest: deterministic cycle, geometry and negative topology checks PASS")
    return a

if __name__=="__main__":
    import argparse
    from knowledge_composition import load
    ap=argparse.ArgumentParser();ap.add_argument("--out",type=Path,required=True);args=ap.parse_args()
    plan,_,_=load();result=solve(plan)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(evidence(result),indent=2)+"\n")
    # Preserve best candidate and diagnostic evidence before failing closed.
    assert result["status"]=="PASS","SP-06: bounded search exhausted; evidence retained"
    assert selftest(plan)==result
    print("SP-06 adaptive evidence:",json.dumps(evidence(result),separators=(",",":")))
