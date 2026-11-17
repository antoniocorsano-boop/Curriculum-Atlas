"""SP-07.2: four volumetric sculptural identities within the locked star envelopes."""
import math,collections,hashlib,json

def rect(x,z,w,h,ch=.045):
    a,b=w/2,h/2;c=min(ch,a*.45,b*.45)
    return [(x-a+c,z-b),(x+a-c,z-b),(x+a,z-b+c),(x+a,z+b-c),(x+a-c,z+b),(x-a+c,z+b),(x-a,z+b-c),(x-a,z-b+c)]
def bar(a,b,w):
    dx,dz=b[0]-a[0],b[1]-a[1];d=math.hypot(dx,dz);u,v=-dz*w/(2*d),dx*w/(2*d)
    return [(a[0]-u,a[1]-v),(b[0]-u,b[1]-v),(b[0]+u,b[1]+v),(a[0]+u,a[1]+v)]
def sculpture(sid):
    # Convex outline, depth multiplier, centre depth, fold slope, bevel fraction.
    if sid=="storie":
        left=[(-.53,-.25),(-.53,.30),(-.44,.34),(-.06,.20),(-.035,-.36),(-.12,-.38)]
        right=[(-x,z) for x,z in left]
        return [(left,1.0,.07,-.18,.10),(right,1.0,.07,.18,.10), ([(x*.94,z*.95+.018) for x,z in left],.68,-.035,-.18,.11), ([(x*.94,z*.95+.018) for x,z in right],.68,-.035,.18,.11),(rect(0,-.10,.095,.51,.025),1.22,-.025,0,.20)]
    if sid=="laboratori":
        a,b,c=(-.29,-.23),(.29,-.23),(0,.30)
        return [(bar(a,b,.13),.70,.08,0,.18),(bar(a,c,.13),.70,.08,0,.18),(bar(b,c,.13),.70,.08,0,.18),*((rect(x,z,.34,.34,.065),1.30,-.025,0,.22) for x,z in (a,b,c))]
    if sid=="scoperte":
        blade=[(-.13,.10),(-.17,.20),(0,.56),(.17,.20),(.13,.10)]
        return [*(([(a*x-b*z,b*x+a*z) for x,z in blade],1.05,0,0,.22) for a,b in ((1,0),(0,1),(-1,0),(0,-1))),(rect(0,0,.33,.33,.075),1.45,-.035,0,.24)]
    if sid=="percorsi":
        return [(rect(-.30,-.34,.43,.18,.04),1.10,.045,0,.18),(rect(-.12,-.22,.18,.30,.035),1.10,.025,0,.18),(rect(.02,-.085,.40,.18,.04),1.16,.005,0,.18),(rect(.21,.09,.19,.35,.035),1.20,-.015,0,.18),([(-.04,.22),(.21,.54),(.46,.22)],1.38,-.035,0,.19)]
    raise ValueError(sid)
# Per-component inset, recessed rim, inner crest depth, and crest offset.
# All relief is recessed into the existing front cap; external rings are unchanged.
RELIEF={
    "storie": [(.40,.026,.008,0,.18),(.40,.026,.008,0,.18),
               (.24,.031,.003,.14,.18),(.24,.031,.003,-.14,.18),(.36,.024,.006,0,0)],
    "laboratori": [(.40,.018,.005,0,0)]*3+[(.30,.035,.028,0,0)]*3,
    "scoperte": [(.25,.036,.002,0,.19),(.25,.036,.002,-.19,0),
                 (.25,.036,.002,0,-.19),(.25,.036,.002,.19,0),(.34,.040,.004,0,0)],
    "percorsi": [(.35,.026,.004,.16,0),(.35,.026,.004,0,.16),
                 (.35,.026,.004,.16,0),(.35,.026,.004,0,.16),(.30,.033,.003,0,.18)]
}
def face_roles(sid,relief=True):
    roles=[]
    for i,(poly,*_) in enumerate(sculpture(sid)):
        n=len(poly)
        if relief:
            roles.extend((i,"rim",j) for j in range(2*n))
            roles.extend((i,"crest",j) for j in range(n))
        else:roles.extend((i,"front",j) for j in range(n-2))
        roles.extend((i,"back",j) for j in range(n-2))
        for band in range(3):roles.extend((i,"band"+str(band),j) for j in range(2*n))
    return roles

def geometry(sid,scale,half,*,relief=True):
    verts=[];faces=[]
    for component,(poly,mult,offset,slope,bevel) in enumerate(sculpture(sid)):
        turns=[(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) for a,b,c in zip(poly,poly[1:]+poly[:1],poly[2:]+poly[:2])]
        assert all(t>0 for t in turns) or all(t<0 for t in turns)
        if sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))<0:poly=poly[::-1]
        n=len(poly);k=len(verts);cx=sum(x for x,z in poly)/n;cz=sum(z for x,z in poly)/n
        depth=half*mult;edge=min(.035,depth*.4)
        def vertex(x,z,dy):
            return tuple(round(v,9) or 0.0 for v in (x*scale,offset+dy+slope*x,z*scale))
        for dy,shrink in ((-depth,bevel),(-depth+edge,0),(depth-edge,0),(depth,bevel)):
            for x,z in poly:
                xx=x+(cx-x)*shrink;zz=z+(cz-z)*shrink
                verts.append(vertex(xx,zz,dy))
        if relief:
            inset,recess,crest,bias_x,bias_z=RELIEF[sid][component]
            assert 0<crest<recess<depth and 0<inset<1
            # The inner ring is a homothetic shrink of the existing front cap.
            # The crest is a convex combination inside that ring; no outer expansion.
            shrink=bevel+(1-bevel)*inset
            inner=[(x+(cx-x)*shrink,z+(cz-z)*shrink) for x,z in poly]
            verts.extend(vertex(x,z,-depth+recess) for x,z in inner)
            # Bias toward an existing inner vertex in the desired direction.
            tip=max(inner,key=lambda p:(p[0]-cx)*bias_x+(p[1]-cz)*bias_z)
            weight=abs(bias_x)+abs(bias_z)
            verts.append(vertex(cx+(tip[0]-cx)*weight,cz+(tip[1]-cz)*weight,-depth+crest))
            for j in range(n):
                a=k+j;b=k+(j+1)%n;u=k+4*n+j;v=k+4*n+(j+1)%n
                faces.extend(((a,b,v),(a,v,u)))
            faces.extend((k+4*n+j,k+4*n+(j+1)%n,k+5*n) for j in range(n))
        else:
            faces.extend((k,k+j,k+j+1) for j in range(1,n-1))
        faces.extend((k+3*n,k+3*n+j+1,k+3*n+j) for j in range(1,n-1))
        for band in range(3):
            for j in range(n):
                a=k+band*n+j;b=k+band*n+(j+1)%n
                faces.extend(((a,a+n,b+n),(a,b+n,b)))
    assert len(faces)==len(face_roles(sid,relief))
    return verts,faces

def relief_measure(sid,v):
    offset=0;depths=[]
    for i,(poly,*_) in enumerate(sculpture(sid)):
        n=len(poly);q=v[offset:offset+5*n+1]
        if len(q)!=5*n+1:return {"valid":False,"components":0}
        a,b,c=q[:3]
        u=[b[j]-a[j] for j in range(3)];w=[c[j]-a[j] for j in range(3)]
        normal=[u[(j+1)%3]*w[(j+2)%3]-u[(j+2)%3]*w[(j+1)%3] for j in range(3)]
        # Express distance along y, not normal length: exact design depth.
        if abs(normal[1])<1e-12:return {"valid":False,"components":0}
        dy=[sum(normal[j]*(p[j]-a[j]) for j in range(3))/normal[1] for p in q[4*n:]]
        target=RELIEF[sid][i]
        depths.append({"rimM":round(sum(dy[:-1])/n,6),"crestM":round(dy[-1],6)})
        if any(abs(d-target[1])>1e-6 for d in dy[:-1]) or abs(dy[-1]-target[2])>1e-6:return {"valid":False,"components":0}
        offset+=5*n+1
    return {"valid":offset==len(v),"components":len(depths),"depths":depths}
def inspect(sid,v,f):
    edge=collections.Counter(tuple(sorted((a,b))) for t in f for a,b in zip(t,t[1:]+t[:1]))
    directed=collections.Counter((a,b) for t in f for a,b in zip(t,t[1:]+t[:1]))
    volume=sum(sum(v[a][k]*(v[b][(k+1)%3]*v[c][(k+2)%3]-v[b][(k+2)%3]*v[c][(k+1)%3]) for k in range(3)) for a,b,c in f)/6
    radius=max(math.sqrt(sum(x*x for x in q)) for q in v)
    depth=max(q[1] for q in v)-min(q[1] for q in v)
    adjacency={i:set() for i in range(len(v))}
    for a,b in edge:adjacency[a].add(b);adjacency[b].add(a)
    unseen=set(adjacency);components=0
    while unseen:
        components+=1;stack=[unseen.pop()]
        while stack:
            for n in adjacency[stack.pop()]&unseen:unseen.remove(n);stack.append(n)
    manifold=all(n==2 for n in edge.values()) and all(directed[a,b]==directed[b,a] for a,b in directed)
    valid_faces=all(len(set(t))==3 and math.sqrt(sum(((v[b][(k+1)%3]-v[a][(k+1)%3])*(v[c][(k+2)%3]-v[a][(k+2)%3])-(v[b][(k+2)%3]-v[a][(k+2)%3])*(v[c][(k+1)%3]-v[a][(k+1)%3]))**2 for k in range(3)))>1e-9 for t in f for a,b,c in [t])
    relief=relief_measure(sid,v)
    return {"relief":relief,"vertices":len(v),"triangles":len(f),"closedOrientedComponents":components,"manifoldEdges":manifold,"nondegenerateTriangles":valid_faces,"signedComponentVolumeSum":round(volume,6),"depthM":round(depth,6),"radiusM":round(radius,6),"meshSha256":hashlib.sha256(json.dumps({"vertices":v,"faces":f},separators=(",",":")).encode()).hexdigest(),"valid":relief["valid"] and manifold and valid_faces and components==len(sculpture(sid)) and volume>.04 and depth>=.24 and .55<=radius<=.64 and len(v)<=200 and len(f)<=400}
