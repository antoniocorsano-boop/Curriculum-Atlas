"""ART-LEARN-05C: apply original plates to exact 05B assets, paired studio, offline proof."""
import bpy, math, hashlib, json, os, sys, time
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
        req(set(src.collections)=={"AL05C "+n for n in NAMES},"candidate inventory")
        dst.collections=sorted(src.collections)
    for c in dst.collections:bpy.context.scene.collection.children.link(c)
    imgs=[i for i in bpy.data.images if i.name.startswith("AL05C ")]
    req(len(imgs)==16 and all(i.packed_file and i.size[0]>=512 and i.size[1]==1536 for i in imgs),"missing packed maps")
    req(not any(o.library for c in dst.collections for o in c.all_objects),"external linked object")
    out=receipt.parent/"Atlas-Editorial-Offline.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(out),compress=True)
    write(receipt.parent/"offline-append.json",{"status":"PASS","images":len(imgs),"fileSha256":sha(out)})
    sys.exit(0)
if args[0]=="reopen":
    offline,lib,plates=map(Path,args[1:4]);req(not lib.exists() and not plates.exists(),"source still accessible")
    req(Path(bpy.data.filepath).resolve()==offline.resolve(),"wrong offline file")
    imgs=[i for i in bpy.data.images if i.name.startswith("AL05C ")]
    req(len(imgs)==16 and all(i.packed_file and i.size[0]>=512 and i.size[1]==1536 for i in imgs),"packed image loss")
    for i in imgs:
        a=np.empty(len(i.pixels),dtype=np.float32);i.pixels.foreach_get(a);req(np.isfinite(a).all() and a.max()>0,"unreadable embedded image")
    req(all(bpy.data.collections.get("AL05C "+n) for n in NAMES),"collection loss")
    write(offline.parent/"offline-reopen.json",{"status":"PASS","images":16,"sourceUnavailable":True,"fileSha256":sha(offline)})
    sys.exit(0)
library,prior,plates,out=map(Path,args[:4]);out.mkdir(parents=True,exist_ok=True)
p=json.loads(prior.read_text());m=json.loads((plates/"plates.json").read_text())
req(p["status"]=="PASS_ORIGINAL_BOOK_ASSET_CANDIDATES" and p["librarySha256"]==sha(library),"exact 05B source")
req(set(p["assets"])=={"AL05B "+n for n in NAMES},"source collections")
locked=sha(library)
with bpy.data.libraries.load(str(library),link=False) as (src,dst):
    req(set(src.collections)==set(p["assets"]),"source inventory")
    dst.collections=sorted(src.collections)
base={c.name.split()[-1]:c for c in dst.collections}
def state(c):
    return [(o.name,o.type,tuple(o.location),tuple(o.rotation_euler),tuple(o.scale),bool(o.hide_render),o.data.name if o.data else "",tuple(x.name for x in o.data.materials) if o.type=="MESH" else ()) for o in sorted(c.all_objects,key=lambda x:x.name)]
initial={n:state(c) for n,c in base.items()}
report={"schema":"atlas.art-learning.editorial/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"sourceArtifact":14505875148,"sourceLibrarySha256":locked,"maps":m["assets"],"assets":{},"renders":{},"comparisons":{},"artisticApproval":False,"webglQualified":False,"publishable":False,"studentAuthorized":False}
def receipt():write(out/"editorial-study.json",report)
receipt()
def image(name,side,mode):
    key=f"{name.lower()}-{side}-{mode}";path=plates/(key+".png")
    req(sha(path)==m["assets"][key]["pngSha256"],"map hash")
    i=bpy.data.images.load(str(path),check_existing=False);i.name="AL05C "+key
    i.colorspace_settings.name="Non-Color" if mode=="foil" else "sRGB"
    i.pack();req(i.packed_file,"packing failed");return i
def editorial(original,name,side):
    mat=original.copy();mat.name=f"AL05C {name} {side}";nodes=mat.node_tree.nodes;links=mat.node_tree.links;bs=nodes.get("Principled BSDF")
    def node(t,label):
        n=nodes.new(t);n.label=label;return n
    def plug(a,b):
        for l in list(b.links):links.remove(l)
        links.new(a,b)
    uv=node("ShaderNodeUVMap","Explicit editorial UV");uv.uv_map="EditorialUV"
    color=node("ShaderNodeTexImage","Original color plate");color.image=image(name,side,"color")
    foil=node("ShaderNodeTexImage","Independent foil mask");foil.image=image(name,side,"foil")
    for n in (color,foil):n.extension="EXTEND";links.new(uv.outputs["UV"],n.inputs["Vector"])
    # Preserve existing procedural grain and use a low-amplitude tint from it.
    old=bs.inputs["Base Color"].links[0].from_socket if bs.inputs["Base Color"].is_linked else None
    if old is not None:
        mix=node("ShaderNodeMixRGB","Editorial dye + original grain");mix.blend_type="MULTIPLY";mix.inputs[0].default_value=.20
        links.new(color.outputs["Color"],mix.inputs[1]);links.new(old,mix.inputs[2]);plug(mix.outputs[0],bs.inputs["Base Color"])
    else:plug(color.outputs["Color"],bs.inputs["Base Color"])
    def masked(lo,hi,label):
        n=node("ShaderNodeMapRange",label);n.inputs["To Min"].default_value=lo;n.inputs["To Max"].default_value=hi;links.new(foil.outputs["Color"],n.inputs["Value"]);return n.outputs["Result"]
    plug(masked(.02,.84,"Foil metallic response"),bs.inputs["Metallic"])
    plug(masked(.64,.30,"Foil roughness response"),bs.inputs["Roughness"])
    oldnormal=bs.inputs["Normal"].links[0].from_socket if bs.inputs["Normal"].is_linked else None
    b=node("ShaderNodeBump","Fine raised foil");b.inputs["Strength"].default_value=.30;b.inputs["Distance"].default_value=.00006;links.new(foil.outputs["Color"],b.inputs["Height"])
    if oldnormal is not None:links.new(oldnormal,b.inputs["Normal"])
    plug(b.outputs["Normal"],bs.inputs["Normal"]);return mat
def assign_uv(o,mat,side):
    mesh=o.data;mesh.materials.append(mat);idx=len(mesh.materials)-1
    uv=mesh.uv_layers.new(name="EditorialUV")
    lo=[min(v.co[k] for v in mesh.vertices) for k in range(3)];hi=[max(v.co[k] for v in mesh.vertices) for k in range(3)]
    n=0
    for f in mesh.polygons:
        if side=="spine":
            # The convex front of the curved binding is the negative-Y side.
            use=f.normal.y<-.03
        else:
            sign=1 if "right cover" in o.name else -1
            use=f.normal.x*sign>.9
        if not use:continue
        f.material_index=idx;n+=1
        for j in f.loop_indices:
            v=mesh.vertices[mesh.loops[j].vertex_index].co
            k=0 if side=="spine" else 1
            u=(v[k]-lo[k])/(hi[k]-lo[k]);z=(v.z-lo[2])/(hi[2]-lo[2])
            if side=="cover" and sign>0:u=1-u
            uv.data[j].uv=(u,z)
    req(n>0,"no editorial faces: "+o.name)
    return n
candidates={}
for name in NAMES:
    c=bpy.data.collections.new("AL05C "+name);c.asset_mark();c.asset_data.description="Original editorial plates and embedded maps; experimental, not released."
    candidates[name]=c;maps={};counts={};removed=[]
    for src in base[name].objects:
        if src.type=="FONT" or " foil rule " in src.name:
            removed.append(src.name);continue
        o=src.copy();o.name=src.name.replace("AL05B","AL05C");o.data=src.data.copy() if src.data else None;c.objects.link(o)
        if o.type!="MESH":continue
        side="cover" if o.name.endswith(("left cover","right cover")) else "spine" if o.name.endswith("curved binding") else None
        if side:
            if side not in maps:maps[side]=editorial(o.data.materials[0],name,side)
            counts[o.name]=assign_uv(o,maps[side],side)
        if o.name.endswith("page block"):
            paper=o.data.materials[0].copy();paper.name="AL05C "+name+" paper";o.data.materials[0]=paper
            for node in paper.node_tree.nodes:
                if node.label=="Page pitch in scene units":node.inputs[1].default_value=2*math.pi/.00055
                if node.label=="Page edge relief":node.inputs["Strength"].default_value=.34
                if node.label=="Paper fiber and page gaps":
                    node.color_ramp.elements[0].color=(.23,.16,.085,1);node.color_ramp.elements[1].color=(.72,.61,.43,1)
    req(len(counts)==3 and set(maps)=={"cover","spine"},"binding face coverage")
    report["assets"][name]={"sourceObjects":len(base[name].objects),"candidateObjects":len(c.objects),"removedOverlays":removed,"mappedFaces":counts,"nominalSize":p["assets"]["AL05B "+name]["nominalSize"]}
req(len([i for i in bpy.data.images if i.name.startswith("AL05C ")])==16,"map inventory")
target=out/"Atlas-Editorial-Collection.blend";bpy.data.libraries.write(str(target),set(candidates.values()),fake_user=True,compress=True)
report["librarySha256"]=sha(target);receipt()
# Independent paired studio. Identical transforms and light between variants.
s=bpy.context.scene
for o in list(s.objects):bpy.data.objects.remove(o,do_unlink=True)
s.world=bpy.data.worlds.new("AL05C studio world");s.world.use_nodes=True
bg=s.world.node_tree.nodes.get("Background");bg.inputs[0].default_value=(.12,.14,.18,1);bg.inputs[1].default_value=.32
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=40;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_x=1200;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
s.view_settings.view_transform="AgX";s.view_settings.look="AgX - Medium High Contrast"
dims=[report["assets"][n]["nominalSize"] for n in NAMES];H=max(d[2] for d in dims);D=max(d[1] for d in dims);W=sum(d[0] for d in dims)
def instance(c,n):
    o=bpy.data.objects.new(n,None);s.collection.objects.link(o);o.instance_type="COLLECTION";o.instance_collection=c;return o
pairs=[(instance(base[n],"baseline "+n),instance(candidates[n],"candidate "+n)) for n in NAMES]
bpy.ops.mesh.primitive_plane_add(size=20*H,location=(0,0,-.001))
floor=bpy.context.object;mat=bpy.data.materials.new("AL05C floor");mat.diffuse_color=(.12,.105,.09,1);floor.data.materials.append(mat)
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
    if macro:
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
    for view in ("spines","covers","pages","macro"):
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
    report.update(status="PASS_EDITORIAL_CANDIDATES",sourceUnchanged=True,artisticReviewRequired=True);receipt()
except Exception as e:
    report.update(status="FAIL",error=repr(e));receipt();raise
