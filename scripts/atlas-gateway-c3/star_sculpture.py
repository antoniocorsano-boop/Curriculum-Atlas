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
def geometry(sid,scale,half):
    verts=[];faces=[]
    for poly,mult,offset,slope,bevel in sculpture(sid):
        turns=[(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]) for a,b,c in zip(poly,poly[1:]+poly[:1],poly[2:]+poly[:2])]
        assert all(t>0 for t in turns) or all(t<0 for t in turns)
        if sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))<0:poly=poly[::-1]
        n=len(poly);k=len(verts);cx=sum(x for x,z in poly)/n;cz=sum(z for x,z in poly)/n
        depth=half*mult;edge=min(.035,depth*.4)
        for dy,shrink in ((-depth,bevel),(-depth+edge,0),(depth-edge,0),(depth,bevel)):
            for x,z in poly:
                xx=x+(cx-x)*shrink;zz=z+(cz-z)*shrink
                # Canonical nanometre grid; eliminate libm/last-bit variations and signed zero.
                verts.append(tuple(round(v,9) or 0.0 for v in (xx*scale,offset+dy+slope*xx,zz*scale)))
        faces.extend((k,k+j,k+j+1) for j in range(1,n-1))
        faces.extend((k+3*n,k+3*n+j+1,k+3*n+j) for j in range(1,n-1))
        for band in range(3):
            for j in range(n):
                a=k+band*n+j;b=k+band*n+(j+1)%n
                faces.extend(((a,a+n,b+n),(a,b+n,b)))
    return verts,faces
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
    return {"vertices":len(v),"triangles":len(f),"closedOrientedComponents":components,"manifoldEdges":manifold,"nondegenerateTriangles":valid_faces,"signedComponentVolumeSum":round(volume,6),"depthM":round(depth,6),"radiusM":round(radius,6),"meshSha256":hashlib.sha256(json.dumps({"vertices":v,"faces":f},separators=(",",":")).encode()).hexdigest(),"valid":manifold and valid_faces and components==len(sculpture(sid)) and volume>.04 and depth>=.24 and .55<=radius<=.64 and len(v)<=200 and len(f)<=400}
