"""ART/PERF-05F: measured volumetric L1 with intact 05D maps and restrained ribs."""
import bpy, bmesh, math, hashlib, json, os, sys, time
from pathlib import Path
from mathutils import Vector
import numpy as np
args=sys.argv[sys.argv.index("--")+1:]
def req(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(p,x):Path(p).write_text(json.dumps(x,indent=2,allow_nan=False)+"\n")
NAMES=("ATLANTE","NATURA","STORIA","GEOMETRIA")
if args[0]=="verify":
    lib,receipt=map(Path,args[1:3]);r=json.loads(receipt.read_text())
    req(sha(lib)==r["librarySha256"],"candidate library identity")
    with bpy.data.libraries.load(str(lib),link=False) as (src,dst):
        req(set(src.collections)=={"AL05F "+n for n in NAMES},"candidate inventory")
        dst.collections=sorted(src.collections)
    for c in dst.collections:bpy.context.scene.collection.children.link(c)
    imgs=[i for i in bpy.data.images if i.name.startswith("AL05C ")]
    req(len(imgs)==16 and all(i.packed_file and i.size[0]>=512 and i.size[1]==1536 for i in imgs),"missing packed maps")
    req(not any(o.library for c in dst.collections for o in c.all_objects),"external linked object")
    out=receipt.parent/"Atlas-L1-Offline.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True)
    write(receipt.parent/"offline-append.json",{"status":"PASS","images":len(imgs),"fileSha256":sha(out)})
    sys.exit(0)
if args[0]=="reopen":
    offline,lib,source=map(Path,args[1:4]);req(not lib.exists() and not source.exists(),"source still accessible")
    req(Path(bpy.data.filepath).resolve()==offline.resolve(),"wrong offline file")
    imgs=[i for i in bpy.data.images if i.name.startswith("AL05C ")]
    req(len(imgs)==16 and all(i.packed_file and i.size[0]>=512 and i.size[1]==1536 for i in imgs),"packed image loss")
    for i in imgs:
        a=np.empty(len(i.pixels),dtype=np.float32);i.pixels.foreach_get(a);req(np.isfinite(a).all() and a.max()>0,"unreadable embedded image")
    req(all(bpy.data.collections.get("AL05F "+n) for n in NAMES),"collection loss")
    write(offline.parent/"offline-reopen.json",{"status":"PASS","images":16,"sourceUnavailable":True,"fileSha256":sha(offline)})
    sys.exit(0)
library,prior,out=map(Path,args[:3]);out.mkdir(parents=True,exist_ok=True)
p=json.loads(prior.read_text())
req(p["status"]=="PASS_MATERIAL_CANDIDATES" and p["sourceUnchanged"] and p["librarySha256"]==sha(library),"exact 05D source")
locked=sha(library)
with bpy.data.libraries.load(str(library),link=False) as (src,dst):
    req(set(src.collections)=={"AL05D "+n for n in NAMES},"source collections")
    dst.collections=sorted(src.collections)
base={c.name.split()[-1]:c for c in dst.collections}
def state(c):
    return [(o.name,tuple(o.location),tuple(o.rotation_euler),tuple(o.scale),o.data.name,tuple(tuple(v.co) for v in o.data.vertices),tuple((tuple(f.vertices),f.material_index) for f in o.data.polygons),tuple(m.name for m in o.data.materials),tuple((m.name,m.type,m.segments,m.width) for m in o.modifiers if m.type=="BEVEL")) for o in sorted(c.objects,key=lambda o:o.name)]
initial={n:state(c) for n,c in base.items()}
report={"schema":"atlas.art-perf.l1/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"sourceArtifact":14528332050,"sourceLibrarySha256":locked,"maps":p["maps"],"assets":{},"renders":{},"comparisons":{},"artisticApproval":False,"webglQualified":False,"publishable":False,"studentAuthorized":False}
def receipt():write(out/"l1-study.json",report)
receipt()
def mesh_bounds(m):
    return [Vector(tuple(f(v.co[k] for v in m.vertices) for k in range(3))) for f in (min,max)]
def rebuild(src,segments,editorial):
    # Measured arc from the original strip; no planar proxy or invented depth.
    old=src.data;lo,hi=mesh_bounds(old);w=hi.x-lo.x
    shoulders=[v.co.y for v in old.vertices if abs(v.co.x-hi.x)<1e-6]
    wall=max(shoulders)-min(shoulders);shoulder=min(shoulders);depth=shoulder-lo.y
    req(w>0 and depth>0 and wall>0,"source arc geometry")
    outer=[((lo.x+hi.x)/2-.5*w*math.cos(math.pi*j/segments),shoulder-depth*math.sin(math.pi*j/segments)) for j in range(segments+1)]
    outline=outer+[(x,y+wall) for x,y in reversed(outer)];N=len(outline)
    vs=[(x,y,z) for z in (lo.z,hi.z) for x,y in outline]
    fs=[tuple(reversed(range(N))),tuple(range(N,2*N))]
    fs.extend((j,(j+1)%N,(j+1)%N+N,j+N) for j in range(N))
    m=bpy.data.meshes.new("AL05F "+src.name);m.from_pydata(vs,[],fs);m.update()
    bm=bmesh.new()
    try:
        bm.from_mesh(m);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(m)
    finally:bm.free()
    m.update()
    for mat in old.materials:m.materials.append(mat)
    idx=next((i for i,mat in enumerate(m.materials) if mat.use_nodes and any(n.label=="Independent foil mask" for n in mat.node_tree.nodes)),None)
    if editorial:
        req(idx is not None,"missing original editorial material")
        uv=m.uv_layers.new(name="EditorialUV");mapped=0
        for f in m.polygons:
            if len(f.vertices)==4:f.use_smooth=True
            if f.normal.y>=-.03:continue
            f.material_index=idx;mapped+=1
            for j in f.loop_indices:
                v=m.vertices[m.loops[j].vertex_index].co
                uv.data[j].uv=((v.x-lo.x)/w,(v.z-lo.z)/(hi.z-lo.z))
        req(mapped>=segments,"editorial UV coverage")
    else:
        for f in m.polygons:
            if len(f.vertices)==4:f.use_smooth=True
    return m
def evaluated(c):
    # Actual evaluated modifier output, not the base cage.
    sc=bpy.context.scene;sc.collection.children.link(c)
    try:
        bpy.context.view_layer.update();dg=bpy.context.evaluated_depsgraph_get();rows={};pts=[]
        for o in c.objects:
            e=o.evaluated_get(dg);m=e.to_mesh()
            try:
                m.calc_loop_triangles();count=len(m.loop_triangles)
                req(count>0,"empty evaluated mesh")
                rows[o.name]={"triangles":count,"vertices":len(m.vertices),"materials":[x.name for x in o.data.materials],"uv":[u.name for u in m.uv_layers]}
                pts.extend(e.matrix_world@v.co for v in m.vertices)
            finally:e.to_mesh_clear()
        return {"triangles":sum(v["triangles"] for v in rows.values()),"objects":rows,"bounds":[list(f(v[k] for v in pts) for k in range(3)) for f in (min,max)]}
    finally:sc.collection.children.unlink(c);bpy.context.view_layer.update()
candidates={}
for name in NAMES:
    source=base[name];baseline=evaluated(source)
    c=bpy.data.collections.new("AL05F "+name);c.asset_mark();c.asset_data.description="Volumetric L1: reduced bevels, measured spine arc, protected original 05D materials."
    candidates[name]=c;changes=[]
    ribs=sorted((o for o in source.objects if "raised rib" in o.name),key=lambda o:mesh_bounds(o.data)[0].z)
    req(len(ribs) in (2,4),"unexpected rib inventory")
    keep={ribs[0].name:.30,ribs[-1].name:.72}
    for src in source.objects:
        isrib="raised rib" in src.name;isspine=src.name.endswith("curved binding")
        if isrib and src.name not in keep:
            changes.append({"object":src.name,"role":"omit redundant rib outside typography-free layout"});continue
        o=src.copy();o.name=src.name.replace("AL05D","AL05F");o.data=rebuild(src,4 if isrib else 8,isspine) if (isrib or isspine) else src.data.copy();c.objects.link(o)
        for mod in o.modifiers:
            if mod.type=="BEVEL":mod.segments=1
        if isrib:
            lo,hi=mesh_bounds(o.data);o.location.z+=p["assets"][name]["nominalSize"][2]*keep[src.name]-(lo.z+hi.z)/2
            changes.append({"object":o.name,"role":"4-segment physical rib in typography-free band","centerFraction":keep[src.name]})
        elif isspine:changes.append({"object":o.name,"role":"8-segment curved spine, reconstructed original UV"})
        else:changes.append({"object":o.name,"role":"one-segment edge bevel; original mesh and UV copied"})
        req(tuple(m.name for m in o.data.materials)==tuple(m.name for m in src.data.materials),"original material drift")
        if o.name.endswith("page block"):req(o.data.uv_layers.get("PageMetric"),"metric page UV lost")
        if o.name.endswith(("left cover","right cover","curved binding")):req(o.data.uv_layers.get("EditorialUV"),"editorial UV lost")
    simplified=evaluated(c);saving=1-simplified["triangles"]/baseline["triangles"]
    delta=max(abs(a-b) for aa,bb in zip(baseline["bounds"],simplified["bounds"]) for a,b in zip(aa,bb))
    req(delta<.002,"evaluated envelope drift")
    req(saving>0,"no geometry saving")
    report["assets"][name]={"nominalSize":p["assets"][name]["nominalSize"],"baseline":baseline,"candidate":simplified,"savingFraction":saving,"maxEnvelopeDeltaMetres":delta,"changes":changes,"meets50PercentTarget":saving>=.50}
req(len([i for i in bpy.data.images if i.name.startswith("AL05C ") and i.packed_file])==16,"packed maps")
target=out/"Atlas-L1-Collection.blend";bpy.data.libraries.write(str(target),set(candidates.values()),fake_user=True,compress=True)
report["librarySha256"]=sha(target);receipt()
# Independent paired studio. Identical transforms and light between variants.
s=bpy.context.scene
for o in list(s.objects):bpy.data.objects.remove(o,do_unlink=True)
s.world=bpy.data.worlds.new("AL05F studio world");s.world.use_nodes=True
bg=s.world.node_tree.nodes.get("Background");bg.inputs[0].default_value=(.12,.14,.18,1);bg.inputs[1].default_value=.32
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=40;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_x=1200;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
s.view_settings.view_transform="AgX";s.view_settings.look="AgX - Medium High Contrast"
dims=[report["assets"][n]["nominalSize"] for n in NAMES];H=max(d[2] for d in dims);D=max(d[1] for d in dims);W=sum(d[0] for d in dims)
def instance(c,n):
    o=bpy.data.objects.new(n,None);s.collection.objects.link(o);o.instance_type="COLLECTION";o.instance_collection=c;return o
pairs=[(instance(base[n],"baseline "+n),instance(candidates[n],"candidate "+n)) for n in NAMES]
bpy.ops.mesh.primitive_plane_add(size=20*H,location=(0,0,-.001))
floor=bpy.context.object;mat=bpy.data.materials.new("AL05F floor");mat.diffuse_color=(.12,.105,.09,1);floor.data.materials.append(mat)
R=max(H,D,W)
def area(n,pos,at,power,size,color):
    d=bpy.data.lights.new(n,"AREA");d.energy=power;d.shape="DISK";d.size=size;d.color=color;o=bpy.data.objects.new(n,d);s.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(at)-o.location).to_track_quat("-Z","Y").to_euler();return o
lights=[area("key",(-R,-R,1.7*R),(0,0,H/2),115*R*R,R*1.15,(1,.90,.77)),area("fill",(R,-.30*R,.95*R),(0,0,H/2),46*R*R,R*.9,(.81,.90,1)),area("rim",(.12*R,1.35*R,1.5*R),(0,0,H/2),145*R*R,R*.85,(1,.94,.86))]
d=bpy.data.cameras.new("comparison camera");cam=bpy.data.objects.new("comparison camera",d);s.collection.objects.link(cam);s.camera=cam;d.lens=50;d.clip_start=.002;d.clip_end=100
def configure(view):
    cover=view=="covers";macro=view=="macro"
    widths=[a[1] if cover else a[0] for a in dims];gap=H*.12;total=sum(widths)+3*gap
    x=-total/2
    for i,(a,b) in enumerate(pairs):
        p=(x+widths[i]/2,0,0);x+=widths[i]+gap
        for o in (a,b):
            o.rotation_euler.z=-math.pi/2 if cover else math.radians((-2,1,-1,2)[i])
            o.location=p
            if cover:o.location.x-=dims[i][1]/2
    target=Vector((0,0 if cover else D*.35,H*.52))
    span=max(total,H*1.4,D);distance=span*1.75
    if view=="page-macro":
        target=Vector((pairs[2][0].location.x,dims[2][1]-.005,dims[2][2]*.55));pos=(target.x+.06*H,target.y+.36*H,target.z+.035*H)
    elif macro:
        target=Vector((pairs[2][0].location.x,0,H*.56));pos=(target.x+.1*H,-1.65*H,H*.69)
    elif view=="pages":pos=(.12*span,D+distance,H*.95)
    else:pos=(.08*span,-distance,H*.87)
    cam.location=pos;cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
    return {"position":list(cam.location),"target":list(target),"lens":d.lens}
def pixels(path):
    i=bpy.data.images.load(str(path),check_existing=False)
    try:
        a=np.empty(len(i.pixels),np.float32);i.pixels.foreach_get(a);return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(i)
try:
    for view in ("spines","covers","pages","macro","page-macro"):
        report.setdefault("cameras",{})[view]=configure(view);arrays={}
        for mode in ("baseline","candidate","restored") if view=="spines" else ("baseline","candidate"):
            for a,b in pairs:a.hide_render=mode=="candidate";b.hide_render=mode!="candidate"
            bpy.context.view_layer.update();key=view+"-"+mode;path=out/(key+".png");s.render.filepath=str(path)
            t=time.monotonic();bpy.ops.render.render(write_still=True);a=pixels(path);req(np.isfinite(a).all() and a.max()>0,"invalid image")
            arrays[mode]=a;delta=np.abs(a-arrays["baseline"])
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-t,3),"size":[1200,900]}
            report["comparisons"][key]={"meanAbsoluteRGBDelta":float(delta.mean()),"changedPixels":int(np.count_nonzero(delta.max(axis=1)>1/255))}
            req(sha(library)==locked and all(state(base[n])==initial[n] for n in NAMES),"source drift");receipt()
        req(report["comparisons"][view+"-candidate"]["changedPixels"]>0,"no candidate effect")
        if view=="spines":req(report["comparisons"][view+"-restored"]["meanAbsoluteRGBDelta"]<.0002,"rollback drift")
    report.update(status="PASS_L1_CANDIDATES",sourceUnchanged=True,artisticReviewRequired=True,allMeet50PercentTarget=all(v["meets50PercentTarget"] for v in report["assets"].values()));receipt()
except Exception as e:
    report.update(status="FAIL",error=repr(e));receipt();raise
