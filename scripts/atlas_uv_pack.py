"""Deterministic AABB UV packing without a Blender operator/context dependency.

Preserves a single global scale and per-island shape. A sampled geometry
guard in the caller separately checks dilation collisions.
"""
import numpy as np

def pack(raw, triangles, vertices, size=512, border=9, gap=20):
    raw=np.asarray(raw,dtype=np.float64)
    triangles=[tuple(int(i) for i in tri) for tri in triangles]
    parents=list(range(len(triangles)));edges={}
    def root(i):
        while parents[i]!=i:
            parents[i]=parents[parents[i]];i=parents[i]
        return i
    def corner(i):
        return (vertices[i],*np.round(raw[i],7))
    for i,tri in enumerate(triangles):
        c=[corner(j) for j in tri]
        for k in range(3):
            e=tuple(sorted((c[k],c[(k+1)%3])))
            if e in edges:
                a,b=root(i),root(edges[e])
                if a!=b:parents[max(a,b)]=min(a,b)
            else:edges[e]=i
    groups={}
    for i,tri in enumerate(triangles):groups.setdefault(root(i),set()).update(tri)
    islands=[np.array(sorted(g),dtype=int) for _,g in sorted(groups.items())]
    assert sum(len(g) for g in islands)==len(raw) and len(set(np.concatenate(islands)))==len(raw),"island corner coverage"
    rects=[]
    for idx in islands:
        lo=raw[idx].min(axis=0);span=raw[idx].max(axis=0)-lo
        assert np.all(span>0),"degenerate island"
        rects.append((idx,lo,span*size))
    order=sorted(range(len(rects)),key=lambda i:(-float(np.prod(rects[i][2])),-float(max(rects[i][2])),i))
    # The qualified bottom-left search is retained for small atlases. For
    # many islands use a bounded deterministic shelf strategy: the original
    # Cartesian candidate search grows too quickly for repeated book meshes.
    shelf_order=sorted(range(len(rects)),key=lambda i:(-float(rects[i][2][1]),-float(rects[i][2][0]),i))
    use_shelf=len(rects)>32
    def shelf_place(scale):
        placed={};x=float(border);y=float(border);row_height=0.
        for i in shelf_order:
            w,h=rects[i][2]*scale
            if x+w>size-border+1e-9:
                x=float(border);y+=row_height+gap;row_height=0.
            if x+w>size-border+1e-9 or y+h>size-border+1e-9:return None
            placed[i]=(x,y,w,h)
            x+=w+gap;row_height=max(row_height,h)
        return placed
    def place(scale):
        if use_shelf:return shelf_place(scale)
        placed={}
        for i in order:
            w,h=rects[i][2]*scale
            xs={float(border)}|{x+aw+gap for x,y,aw,ah in placed.values()}
            ys={float(border)}|{y+ah+gap for x,y,aw,ah in placed.values()}
            found=None
            for y in sorted(ys):
                for x in sorted(xs):
                    if x+w>size-border+1e-9 or y+h>size-border+1e-9:continue
                    if any(not (x+w+gap<=ax+1e-9 or ax+aw+gap<=x+1e-9 or y+h+gap<=ay+1e-9 or ay+ah+gap<=y+1e-9) for ax,ay,aw,ah in placed.values()):continue
                    found=(x,y,w,h);break
                if found:break
            if found is None:return None
            placed[i]=found
        return placed
    lo,hi=0.,1.
    best=place(lo)
    assert best is not None,"cannot place islands"
    for _ in range(32):
        mid=(lo+hi)/2;candidate=place(mid)
        if candidate is not None:lo=mid;best=candidate
        else:hi=mid
    assert lo>0,"no positive packing scale"
    result=np.empty_like(raw)
    for i,(idx,origin,_) in enumerate(rects):
        x,y,_,_=best[i]
        result[idx]=(raw[idx]-origin)*lo+np.array([x,y])/size
    assert np.isfinite(result).all() and result.min()>=border/size-1e-9 and result.max()<=1-border/size+1e-9
    return result,{"method":"deterministic-aabb-shelf" if use_shelf else "deterministic-aabb-bottom-left","islands":len(islands),"relativeScale":lo,
                   "borderPixels":border,"gapPixels":gap,"rectangles":[list(best[i]) for i in range(len(rects))]}
