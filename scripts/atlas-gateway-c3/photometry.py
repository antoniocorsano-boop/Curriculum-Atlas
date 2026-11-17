"""SP-06.4: reproducible pixel metrics and bounded local material choices."""
import hashlib,json,statistics,struct,zlib
from pathlib import Path
import adaptive_identity,knowledge_composition
HERE=Path(__file__).resolve().parent
POLICY=HERE/"photometric-policy.json"
IDS=("storie","laboratori","scoperte","percorsi")
VIEWS=("atrium","vertical")
def policy():
    raw=POLICY.read_bytes();p=json.loads(raw)
    assert p["schemaVersion"]==1 and p["phase"]=="C3.3A5.5a" and p["views"]==list(VIEWS)
    assert (p["maxAttempts"],p["maxRenders"],p["minimumSamples"])==(3,8,20)
    assert (p["minMedianDelta"],p["minCoverage"],p["coverageDelta"],p["maxClippedFraction"],p["clipCode"],p["brightBackground"])==(.16,.65,.10,.15,250,.45)
    assert p["externalServices"] is False and set(p["recipes"])=={"base","darkWarm","darkCool","lightWarm","lightCool"}
    assert set(p["recipes"]["base"])==set(IDS)
    for q in [*p["recipes"]["base"].values(),*(p["recipes"][k] for k in ("darkWarm","darkCool","lightWarm","lightCool"))]:
        assert set(q)=={"color","emission","roughness","metallic"} and len(q["color"])==3
        assert all(0<=v<=1 for v in q["color"]) and 0<=q["emission"]<=1.8 and 0<=q["roughness"]<=1 and 0<=q["metallic"]<=1
    return p,hashlib.sha256(raw).hexdigest()

def png(path):
    b=Path(path).read_bytes();assert b.startswith(b"\x89PNG\r\n\x1a\n")
    pos=8;data=[];header=None
    while pos<len(b):
        n,kind=struct.unpack_from(">I4s",b,pos);v=b[pos+8:pos+8+n]
        assert zlib.crc32(kind+v)&0xffffffff==struct.unpack_from(">I",b,pos+8+n)[0]
        pos+=12+n
        if kind==b"IHDR":header=struct.unpack(">IIBBBBB",v)
        elif kind==b"IDAT":data.append(v)
        elif kind==b"IEND":break
    w,h,depth,color,comp,filt,interlace=header
    assert depth==8 and color in (2,6) and (comp,filt,interlace)==(0,0,0) and (w,h) in ((600,375),(320,480))
    channels=3 if color==2 else 4;stride=w*channels
    raw=zlib.decompress(b"".join(data));assert len(raw)==h*(stride+1)
    prior=bytearray(stride);rows=[]
    def paeth(a,b,c):
        p=a+b-c;pa,pb,pc=abs(p-a),abs(p-b),abs(p-c)
        return a if pa<=pb and pa<=pc else b if pb<=pc else c
    for y in range(h):
        mode=raw[y*(stride+1)];row=bytearray(raw[y*(stride+1)+1:(y+1)*(stride+1)])
        assert 0<=mode<=4
        if mode:
            for i in range(stride):
                a=row[i-channels] if i>=channels else 0;v=prior[i];c=prior[i-channels] if i>=channels else 0
                row[i]=(row[i]+(a if mode==1 else v if mode==2 else (a+v)//2 if mode==3 else paeth(a,v,c)))&255
        rows.append(row);prior=row
    # Projection has a bottom-left origin, PNG rows top-left.
    return w,h,lambda x,y:tuple(rows[h-1-y][x*channels:x*channels+3])

def mask_points(plan,result,name,sid):
    i=IDS.index(sid);center=plan["layouts"][plan["selected"]][i][:3];q=result["meshes"][sid]
    w,h={"atrium":(600,375),"vertical":(320,480)}[name]
    raw=adaptive_identity.mask(plan["cameras"][name],center,q["vertices"],q["faces"],w,h)
    # Sample only interior pixels, avoiding antialiased outer edges.
    return sorted((x,y) for x,y in raw if sum((x+a,y+b) in raw for a,b in ((1,0),(-1,0),(0,1),(0,-1)))>=3)

def luma(rgb):return (.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2])/255
def metrics(fg,bg,points,p):
    assert len(points)>=p["minimumSamples"],("too few interior samples",len(points))
    f=[fg(x,y) for x,y in points];b=[bg(x,y) for x,y in points]
    dif=[abs(luma(a)-luma(c)) for a,c in zip(f,b)]
    return {"samples":len(points),"medianDelta":round(statistics.median(dif),6),"coverage":round(sum(d>=p["coverageDelta"] for d in dif)/len(dif),6),"clippedFraction":round(sum(min(a)>=p["clipCode"] for a in f)/len(f),6),"backgroundMedian":round(statistics.median(map(luma,b)),6)}
def failures(m,p):
    return [k for k,failed in (("contrast",m["medianDelta"]<p["minMedianDelta"]),("coverage",m["coverage"]<p["minCoverage"]),("clipping",m["clippedFraction"]>p["maxClippedFraction"])) if failed]
def evaluate(out,index,p,plan,result):
    all_metrics={};failed={sid:[] for sid in IDS}
    for name in VIEWS:
        w,h,fg=png(out/("attempt-%d-%s.png"%(index,name)));bw,bh,bg=png(out/("background-"+name+".png"))
        assert (w,h)==(bw,bh)==({"atrium":(600,375),"vertical":(320,480)}[name])
        all_metrics[name]={}
        for sid in IDS:
            m=metrics(fg,bg,mask_points(plan,result,name,sid),p);all_metrics[name][sid]=m
            failed[sid].extend(name+":"+k for k in failures(m,p))
    return {"metrics":all_metrics,"failed":failed,"status":"PASS" if not any(failed.values()) else "REVISE"}
def advance(current,record,p):
    new=dict(current)
    for sid in IDS:
        if not record["failed"][sid]:continue
        family="Warm" if sid in ("storie","scoperte") else "Cool"
        bright=statistics.mean(record["metrics"][v][sid]["backgroundMedian"] for v in VIEWS)>=p["brightBackground"]
        first=("dark" if bright else "light")+family
        second=("light" if bright else "dark")+family
        new[sid]=first if current[sid]=="base" else second if current[sid]==first else current[sid]
    return new
def ranking(record,p):
    # Count violations first, then aggregate magnitude, then earliest attempt.
    m=[r for v in record["metrics"].values() for r in v.values()]
    deficit=sum(max(0,p["minMedianDelta"]-q["medianDelta"])+max(0,p["minCoverage"]-q["coverage"])+max(0,q["clippedFraction"]-p["maxClippedFraction"]) for q in m)
    return (sum(len(v) for v in record["failed"].values()),round(deficit,6),record["attempt"])
def recipe(p,sid,key):return p["recipes"]["base"][sid] if key=="base" else p["recipes"][key]
def selftest():
    p,_=policy();points=[(i,0) for i in range(20)]
    dark=lambda x,y:(20,20,20);light=lambda x,y:(200,200,200);white=lambda x,y:(255,255,255)
    assert not failures(metrics(dark,light,points,p),p)
    assert "contrast" in failures(metrics(light,light,points,p),p)
    assert "clipping" in failures(metrics(white,dark,points,p),p)
    current=dict.fromkeys(IDS,"base")
    rec={"failed":dict.fromkeys(IDS,[]),"metrics":{v:{s:{"backgroundMedian":.7} for s in IDS} for v in VIEWS}}
    rec["failed"]["storie"]=["atrium:contrast"];n=advance(current,rec,p)
    assert n=={**current,"storie":"darkWarm"} and advance(n,rec,p)["storie"]=="lightWarm"
    print("SP-06.4 photometric policy: 4/4 PASS (synthetic)")
if __name__=="__main__":selftest()
