"""SP-05: simulate spatial composition before Blender geometry or rendering."""
import hashlib,itertools,json,math
from pathlib import Path
from art_quality import evaluate
HERE=Path(__file__).resolve().parent
PLAN=HERE/"knowledge-composition.json"

def project(camera,p):
    w,h,pos,target,lens=camera
    x,y,z=p
    assert pos[0]==target[0]==0
    dy,dz=target[1]-pos[1],target[2]-pos[2]
    d=math.hypot(dy,dz);fy,fz=dy/d,dz/d
    dep=(y-pos[1])*fy+(z-pos[2])*fz
    up=-(y-pos[1])*fz+(z-pos[2])*fy
    assert dep>0
    fx=lens/36*max(1,h/w)
    return .5+fx*x/dep,.5+fx*w/h*up/dep

def bbox(camera,p,r):
    v=[project(camera,tuple(a+s*r for a,s in zip(p,sign))) for sign in itertools.product((-1,1),repeat=3)]
    return [min(x for x,y in v),max(x for x,y in v),min(y for x,y in v),max(y for x,y in v)]

def overlap(a,b,m=.004):
    return a[0]<b[1]+m and a[1]>b[0]-m and a[2]<b[3]+m and a[3]>b[2]-m

def paths(plan,layout):
    hx,hy,hz=plan["hub"]
    out=[]
    for x,y,z,r in layout:
        side=1 if x>0 else -1
        p0=(x,y,z-r*.7)
        if abs(x)>2:
            p1=(x*.98,y+.30,5.50);p2=(side*1.80,hy-.15,5.15);p3=(hx+side*.22,hy,hz)
        else:
            p1=(x*.90,y,5.95);p2=(side*.52,hy+.13,5.78);p3=(hx+side*.16,hy,hz+.15)
        n=plan["segments"]
        out.append([tuple((1-t)**3*a+3*(1-t)**2*t*b+3*(1-t)*t*t*c+t**3*d for a,b,c,d in zip(p0,p1,p2,p3)) for t in (k/n for k in range(n+1))])
    return out

def simulate(plan,key):
    layout=plan["layouts"][key];assert len(layout)==4
    trajectories=paths(plan,layout)
    views={}
    for name,camera in plan["cameras"].items():
        protected=plan["protected"][name];p=[protected["arena"],*protected["portals"]]
        b=[bbox(camera,s[:3],s[3]) for s in layout]
        h=bbox(camera,plan["hub"],plan["hubRadius"])
        valid=all(min(v)>=.015 and max(v)<=.985 and not any(overlap(v,q) for q in p+b[:i]) for i,v in enumerate(b))
        valid=valid and min(h)>=.015 and max(h)<=.985 and not any(overlap(h,q) for q in p+b)
        collisions=[]
        for i,trajectory in enumerate(trajectories):
            for j,point in enumerate(trajectory):
                v=bbox(camera,point,plan["connectionRadius"])
                if min(v)<.015 or max(v)>.985 or any(overlap(v,q) for q in p+[x for k,x in enumerate(b) if k!=i]):
                    collisions.append([i,j]);break
        views[name]={"stars":b,"arena":protected["arena"],"portals":protected["portals"],"hub":h,"clear":valid,"curveCollisions":collisions}
    study={"stars":[{"id":sid,"positionBlender":s[:3]} for sid,s in zip(plan["ids"],layout)],"projection":views}
    quality=evaluate(study)
    valid=quality["status"]=="PASS" and all(q["clear"] and not q["curveCollisions"] for q in views.values())
    return {"status":"PASS" if valid else "REVISE","quality":quality,"views":views,"paths":trajectories}

def load():
    raw=PLAN.read_bytes();plan=json.loads(raw)
    assert plan["schemaVersion"]==1 and plan["phase"]=="C3.3A5.5a"
    assert plan["ids"]==["storie","laboratori","scoperte","percorsi"]
    assert set(plan["layouts"])=={"A","B","C"} and plan["segments"]==48
    assert set(plan["cameras"])==set(plan["protected"])=={"atrium","vertical","portrait-focus"}
    result={k:simulate(plan,k) for k in plan["layouts"]}
    assert result[plan["selected"]]["status"]=="PASS","Selected composition failed preflight"
    return plan,result,hashlib.sha256(raw).hexdigest()

if __name__=="__main__":
    plan,result,digest=load()
    assert {k:v["status"] for k,v in result.items()}=={"A":"PASS","B":"REVISE","C":"REVISE"}
    print(json.dumps({"planSha256":digest,"selected":plan["selected"],"alternatives":{k:{"status":v["status"],"quality":v["quality"],"curveCollisions":{n:q["curveCollisions"] for n,q in v["views"].items()}} for k,v in result.items()}},indent=2))
