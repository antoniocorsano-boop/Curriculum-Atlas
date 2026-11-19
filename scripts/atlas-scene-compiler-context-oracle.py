"""B2a: extract opaque geometric context from the exact immutable Blender master.

Use the matched B1 corners and camera, without re-unwrapping or rebaking.
Build an independent Blender BVH oracle for stable, pixel-centred samples.
No master, renderer, or application writes.
"""
import hashlib, json, os, sys
from pathlib import Path
import bpy
import numpy as np
from mathutils import Matrix, Vector
from mathutils.bvhtree import BVHTree

MASTER = "f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
B1 = "6593b1f33fe00db7797ebab2708c3b86a365a5c1"
def require(ok, msg):
    if not ok:
        raise RuntimeError(msg)
def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):
    return json.loads(p.read_text())
def write(p, obj):
    p.write_text(json.dumps(obj, indent=2, allow_nan=False)+"\n")

def triangle_rows(mesh, matrix):
    mesh.calc_loop_triangles()
    coords = np.empty(len(mesh.vertices)*3, dtype=np.float32)
    mesh.vertices.foreach_get("co",coords)
    coords=coords.reshape(-1,3).astype(np.float64)
    m=np.array(matrix,dtype=np.float64)
    world=coords @ m[:3,:3].T + m[:3,3]
    inds=np.empty(len(mesh.loop_triangles)*3,dtype=np.int32)
    mesh.loop_triangles.foreach_get("vertices",inds)
    return np.ascontiguousarray(world[inds],dtype="<f4").reshape(-1,3)

def canonical_triangles(rows):
    # Compare unordered corners with a small tolerance, independent of winding.
    return sorted(tuple(sorted(tuple(round(float(x),5) for x in v) for v in t))
                  for t in rows.reshape(-1,3,3))

def main():
    master,src,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
    require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
    out.mkdir(parents=True,exist_ok=True)
    b=read(src/"surface-binding.json");r=read(src/"surface-browser.json");a=read(src/"diffuse-bake.json")
    require(b["revision"]==r["revision"]==a["revision"]==B1,"B1 revision")
    require(r["status"]=="PASS_ISOLATED_SURFACE_BINDING" and a["status"]=="PASS_DIFFUSE_BAKE_PROBE"
            and a["masterUnchanged"] and a["bindingsRestored"],"B1 evidence")
    require(r["bindingSha256"]==sha(src/"surface-binding.json")
            and r["textureSha256"]==b["texture"]["sha256"]==sha(src/"binding.rgba32f"),"B1 bytes")
    require(b["masterSha256"]==a["masterSha256"]==MASTER and b["target"]==a["target"],"target receipt")
    require(b["texture"]["sourceExrSha256"]==a["transfer"]["sha256"],"B1 EXR identity")
    p=np.asarray(b["positions"],dtype="<f4");u=np.asarray(b["uv"],dtype=np.float64)
    n=len(p)//3
    require(n==b["triangles"] and p.shape==(3*n,3) and u.shape==(3*n,2),"target geometry")
    require(np.isfinite(p).all() and np.isfinite(u).all(),"target finite")
    s=bpy.context.scene; deps=bpy.context.evaluated_depsgraph_get()
    target=s.objects.get(b["target"]["object"])
    require(target and target.type=="MESH" and target.data.name==b["target"]["mesh"],"target identity")
    original=triangle_rows(target.data,target.matrix_world)
    require(canonical_triangles(original)==canonical_triangles(p),"B1 geometry differs from original")
    # Same active view layer, render-visible collections; opaque geometric proxy.
    visible={}
    def walk(layer):
        if layer.exclude or layer.collection.hide_render:
            return
        for o in layer.collection.objects:
            if not o.hide_render:
                visible[o.name]=o
        for child in layer.children:
            walk(child)
    walk(bpy.context.view_layer.layer_collection)
    require(target.name in visible,"target not render-visible")
    rows=[];inventory=[];nonmesh=[];modifier_differences=[]
    for name,o in sorted(visible.items()):
        if name==target.name:continue
        if o.type!="MESH":
            nonmesh.append({"name":name,"type":o.type})
            continue
        require(o.instance_type=="NONE","unsupported object instance: "+name)
        for mod in o.modifiers:
            if mod.show_viewport!=mod.show_render:
                modifier_differences.append({"object":name,"modifier":mod.name})
        ev=o.evaluated_get(deps)
        mesh=ev.to_mesh()
        try:
            arr=triangle_rows(mesh,ev.matrix_world)
            require(np.isfinite(arr).all(),"nonfinite context: "+name)
            if len(arr):
                rows.append(arr)
                inventory.append({"object":name,"triangles":len(arr)//3,
                                  "sourceMesh":o.data.name})
        finally:
            ev.to_mesh_clear()
    require(not modifier_differences,"render/viewport modifier visibility differs")
    require(all(x["type"] in ("CAMERA","LIGHT","EMPTY") for x in nonmesh),"unsupported nonmesh geometry")
    require(rows and len(inventory)>10,"insufficient context")
    occ=np.concatenate(rows).astype("<f4",copy=False)
    require(len(occ)%3==0 and len(occ)//3<2000000,"context size bound")
    op=out/"occluders.f32";op.write_bytes(occ.tobytes())
    # Build oracle from exact serialized vertices, not GPU results.
    allp=np.concatenate([p,occ])
    # Duplicated corner vertices preserve triangle ordering and simplify provenance.
    bvh=BVHTree.FromPolygons(allp.tolist(),[(i,i+1,i+2) for i in range(0,len(allp),3)],
                             all_triangles=True)
    cam=b["camera"];w,h=cam["width"],cam["height"]
    require(w==640 and h==480,"B1 camera dimensions")
    inv=(Matrix(cam["projection"]) @ Matrix(cam["view"])).inverted()
    def trace(x,y):
        # x,y are bottom-up window coordinates, near to far clipping segment.
        ndc=(2*x/w-1,2*y/h-1)
        ends=[]
        for z in (-1,1):
            q=inv @ Vector((ndc[0],ndc[1],z,1))
            require(abs(q.w)>1e-9,"invalid clip inverse")
            ends.append(Vector(q[:3])/q.w)
        origin,end=ends;delta=end-origin
        hit,normal,index,distance=bvh.ray_cast(origin,delta.normalized(),delta.length)
        if index is None:return ("background",None)
        if index>=n:return ("occluder",None)
        tri=p[3*index:3*index+3].astype(np.float64)
        v0,v1=tri[1]-tri[0],tri[2]-tri[0];v2=np.array(hit)-tri[0]
        d00,d01,d11=np.dot(v0,v0),np.dot(v0,v1),np.dot(v1,v1)
        den=d00*d11-d01*d01
        require(abs(den)>1e-20,"degenerate target face")
        beta=(d11*np.dot(v2,v0)-d01*np.dot(v2,v1))/den
        gamma=(d00*np.dot(v2,v1)-d01*np.dot(v2,v0))/den
        uv=(1-beta-gamma)*u[3*index]+beta*u[3*index+1]+gamma*u[3*index+2]
        return ("target",[float(q) for q in uv])
    samples=[];counts={"target":0,"occluder":0,"background":0,"unstable":0}
    for gy in range(64):
        for gx in range(96):
            x=int((gx+.5)*w/96);y=int((gy+.5)*h/64)
            kind,uv=trace(x+.5,y+.5)
            neighbors=[trace(x+.5+dx,y+.5+dy)[0] for dx,dy in ((-1,0),(1,0),(0,-1),(0,1))]
            stable=all(k==kind for k in neighbors)
            counts[kind if stable else "unstable"]+=1
            samples.append({"x":x,"y":y,"kind":kind,"stable":stable,"uv":uv})
    require(counts["target"]>=100 and counts["occluder"]>=100,"insufficient visible/occluded samples")
    require(sum(counts.values())==6144,"sample inventory")
    write(out/"context-oracle.json",{
        "schema":"atlas.asc01.context-oracle/v1","revision":os.environ["ATLAS_EXACT_HEAD"],
        "sourceRevision":B1,"masterSha256":MASTER,"bindingSha256":r["bindingSha256"],
        "textureSha256":r["textureSha256"],"occluderSha256":sha(op),
        "occluderTriangles":len(occ)//3,"inventory":inventory,"nonmesh":nonmesh,
        "counts":counts,"samples":samples,"grid":{"width":96,"height":64},
        "scope":"render-visible evaluated mesh geometry, opaque proxy; not optical transparency",
        "color":a["color"],"masterUnchanged":sha(master)==MASTER})
    print("ASC-B2a oracle",json.dumps({"counts":counts,"occluderTriangles":len(occ)//3,
          "objects":len(inventory),"masterUnchanged":sha(master)==MASTER}),flush=True)
    require(sha(master)==MASTER,"master changed")
if __name__=="__main__":main()
