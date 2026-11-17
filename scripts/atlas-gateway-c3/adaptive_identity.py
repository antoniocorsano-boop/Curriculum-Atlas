"""SP-06.1/2: deterministic local adaptation of actual projected core meshes."""
import hashlib,itertools,json,math
from pathlib import Path
from knowledge_composition import project

HERE=Path(__file__).resolve().parent
POLICY=HERE/"adaptive-identity.json"
def rect(x,z,w,h):
    return [(x-w/2,z-h/2),(x+w/2,z-h/2),(x+w/2,z+h/2),(x-w/2,z+h/2)]
def polygons(sid):
    if sid=="storie":
        return [[(-.49,-.27),(-.49,.32),(-.06,.18),(-.06,-.40)],[(.06,-.40),(.06,.18),(.49,.32),(.49,-.27)],rect(0,-.19,.08,.30)]
    if sid=="laboratori":
        return [rect(-.25,-.25,.36,.36),rect(.25,-.25,.36,.36),rect(0,.25,.36,.36),rect(0,-.25,.16,.12),[(-.23,-.10),(-.12,-.16),(.04,.09),(-.06,.16)],[(.23,-.10),(.12,-.16),(-.04,.09),(.06,.16)]]
    if sid=="scoperte":
        pts=[((.52 if j%2==0 else .19)*math.cos(j*math.pi/4),(.52 if j%2==0 else .19)*math.sin(j*math.pi/4)) for j in range(8)]
        return [[(0,0),pts[j],pts[(j+1)%8]] for j in range(8)]
    if sid=="percorsi":
        return [rect(-.31,-.34,.36,.18),rect(-.13,-.19,.24,.23),rect(.04,-.08,.36,.18),rect(.22,.10,.20,.28),[(.02,.22),(.22,.49),(.42,.22)]]
    raise ValueError(sid)

def geometry(sid,scale,half):
    verts=[];faces=[]
    for poly in polygons(sid):
        # Orient each convex component consistently; extrude to a real 3D mesh.
        if sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))<0:poly=poly[::-1]
        n=len(poly);k=len(verts)
        verts.extend((x*scale,dy,z*scale) for dy in (-half,half) for x,z in poly)
        faces.extend((k,k+j,k+j+1) for j in range(1,n-1))
        faces.extend((k+n,k+n+j+1,k+n+j) for j in range(1,n-1))
        for j in range(n):
            a=k+j;b=k+(j+1)%n
            faces.extend(((a,a+n,b+n),(a,b+n,b)))
    return verts,faces

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
    assert p["scales"]==[.60,.72,.84,.96] and p["maxAttempts"]==4
    assert p["halfThicknessM"]==.07 and p["maxCoreRadiusM"]==.64
    assert p["normalizationPixels"]==32 and p["maxNormalizedIoU"]==.65
    assert p["views"]=={"atrium":{"pixels":[600,375],"minWidth":20,"minHeight":16,"minArea":100},"vertical":{"pixels":[320,480],"minWidth":16,"minHeight":14,"minArea":90}}
    assert p["resources"]=={"maxBlenderPreviews":1,"externalServices":False,"paidServices":False}
    return p,hashlib.sha256(raw).hexdigest()

def run(plan,p,max_attempts):
    ids=p["ids"];layout=plan["layouts"][plan["selected"]]
    assert plan["ids"]==ids and len(layout)==4 and 1<=max_attempts<=p["maxAttempts"]
    scales=p["scales"];indices=[0]*4;attempts=[];best=None
    for attempt in range(max_attempts):
        current=[scales[i] for i in indices]
        meshes=[geometry(sid,scale,p["halfThicknessM"]) for sid,scale in zip(ids,current)]
        failed={sid:[] for sid in ids};metrics={};pairs={}
        for i,(sid,(v,f)) in enumerate(zip(ids,meshes)):
            extent=max(math.sqrt(sum(x*x for x in q)) for q in v)
            if extent>min(p["maxCoreRadiusM"],layout[i][3]) or min(q[2]+layout[i][2] for q in v)<=6:
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
        record={"attempt":attempt+1,"scales":dict(zip(ids,current)),"metrics":metrics,"normalizedIoU":pairs,"failed":failed,"status":"PASS" if failure_count==0 else "REVISE"}
        attempts.append(record)
        # Stable selection: minimum failed criteria, then earliest attempt.
        rank=(failure_count,attempt)
        if best is None or rank<best[0]:best=(rank,record,meshes)
        if not failure_count:break
        next_indices=[min(i+1,len(scales)-1) if failed[sid] else i for sid,i in zip(ids,indices)]
        if next_indices==indices:break
        indices=next_indices
    record,meshes=best[1],best[2]
    return {"status":"PASS" if best[0][0]==0 else "EXHAUSTED","attempts":attempts,"selectedAttempt":record["attempt"],"selectedScales":record["scales"],"shapeKinds":dict(zip(ids,p["shapeKinds"])),"meshes":{sid:{"vertices":[list(q) for q in v],"faces":[list(q) for q in f]} for sid,(v,f) in zip(ids,meshes)},"visualAcceptance":False,"qualified":False,"publishable":False}

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
    assert not a["visualAcceptance"] and not a["qualified"] and not a["publishable"]
    print("SP-06 adaptive selftest: 6/6 PASS")
    return a

if __name__=="__main__":
    import argparse
    from knowledge_composition import load
    ap=argparse.ArgumentParser();ap.add_argument("--out",type=Path,required=True);args=ap.parse_args()
    plan,_,_=load();result=selftest(plan)
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(evidence(result),indent=2)+"\n")
    print("SP-06 adaptive evidence:",json.dumps(evidence(result),separators=(",",":")))
