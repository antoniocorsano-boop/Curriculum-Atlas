"""ART-LEARN-05D: material correction on exact 05C library, paired studio and offline proof."""
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
        req(set(src.collections)=={"AL05D "+n for n in NAMES},"candidate inventory")
        dst.collections=sorted(src.collections)
    for c in dst.collections:bpy.context.scene.collection.children.link(c)
    imgs=[i for i in bpy.data.images if i.name.startswith("AL05C ")]
    req(len(imgs)==16 and all(i.packed_file and i.size[0]>=512 and i.size[1]==1536 for i in imgs),"missing packed maps")
    req(not any(o.library for c in dst.collections for o in c.all_objects),"external linked object")
    out=receipt.parent/"Atlas-Material-Offline.blend"
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
    req(all(bpy.data.collections.get("AL05D "+n) for n in NAMES),"collection loss")
    write(offline.parent/"offline-reopen.json",{"status":"PASS","images":16,"sourceUnavailable":True,"fileSha256":sha(offline)})
    sys.exit(0)
library,prior,out=map(Path,args[:3]);out.mkdir(parents=True,exist_ok=True)
p=json.loads(prior.read_text())
req(p["status"]=="PASS_EDITORIAL_CANDIDATES" and p["sourceUnchanged"] and p["librarySha256"]==sha(library),"exact 05C source")
req(set(p["assets"])==set(NAMES),"source inventory")
locked=sha(library)
with bpy.data.libraries.load(str(library),link=False) as (src,dst):
    req(set(src.collections)=={"AL05C "+n for n in NAMES},"source collections")
    dst.collections=sorted(src.collections)
base={c.name.split()[-1]:c for c in dst.collections}
def geom(o):
    return [o.type,tuple(o.location),tuple(o.rotation_euler),tuple(o.scale),len(o.data.vertices),len(o.data.polygons),hashlib.sha256(repr([(tuple(v.co)) for v in o.data.vertices]).encode()).hexdigest(),tuple(tuple(f.vertices) for f in o.data.polygons)] if o.type=="MESH" else [o.type,tuple(o.location)]
def state(c):
    return [(o.name,geom(o),o.data.name if o.data else "",tuple(m.name for m in o.data.materials) if o.type=="MESH" else ()) for o in sorted(c.all_objects,key=lambda x:x.name)]
def material_state():
    return sorted((m.name,[(n.name,n.label,[(s.name,repr(s.default_value) if not hasattr(s.default_value,"__len__") else repr(tuple(s.default_value))) for s in n.inputs if hasattr(s,"default_value")]) for n in m.node_tree.nodes]) for m in bpy.data.materials if m.use_nodes and m.name.startswith(("AL05B ","AL05C ")))
initial={n:state(c) for n,c in base.items()}
initial_materials=material_state()
report={"schema":"atlas.art-learning.material/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"sourceArtifact":14523702251,"sourceLibrarySha256":locked,"maps":p["maps"],"assets":{},"renders":{},"comparisons":{},"artisticApproval":False,"webglQualified":False,"publishable":False,"studentAuthorized":False}
def receipt():write(out/"material-study.json",report)
receipt()
PALETTE={"ATLANTE":"#412319","NATURA":"#18372b","STORIA":"#421f2c","GEOMETRIA":"#1c2c46"}
def rgb(h):
    c=[int(h[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in c)
def labelled(m,label):
    n=[x for x in m.node_tree.nodes if x.label==label];req(len(n)==1,m.name+" missing/ambiguous "+label);return n[0]
def node(m,t,label):
    n=m.node_tree.nodes.new(t);n.label=label;return n
def link(m,a,b):
    for l in list(b.links):m.node_tree.links.remove(l)
    m.node_tree.links.new(a,b)
def mathnode(m,op,a,b,label):
    n=node(m,"ShaderNodeMath",label);n.operation=op
    for i,x in enumerate((a,b)):
        if isinstance(x,(float,int)):n.inputs[i].default_value=x
        else:link(m,x,n.inputs[i])
    return n.outputs[0]
def ramp(m,signal,stops,label):
    n=node(m,"ShaderNodeValToRGB",label);r=n.color_ramp;r.interpolation="LINEAR"
    for i,(pos,color) in enumerate(stops):
        e=r.elements[i] if i<2 else r.elements.new(pos);e.position=pos;e.color=(*color,1)
    link(m,signal,n.inputs["Fac"]);return n.outputs["Color"]
def mix(m,fac,a,b,label,mode="MIX"):
    n=node(m,"ShaderNodeMixRGB",label);n.blend_type=mode
    for i,x in enumerate((fac,a,b)):
        if isinstance(x,(tuple,list,float,int)):n.inputs[i].default_value=x
        else:link(m,x,n.inputs[i])
    return n.outputs[0]
def tune_binding(m,name):
    dye=labelled(m,"Leather dye");c=rgb(PALETTE[name])
    # Match editorial base hue across the unprinted edges and raised ribs.
    for e,k in zip(dye.color_ramp.elements,(.65,1.55)):
        e.color=(*(min(.95,x*k+.003) for x in c),1)
    labelled(m,"Binding microrelief").inputs["Strength"].default_value=.45
    labelled(m,"Binding microrelief").inputs["Distance"].default_value=.00033
def tune_editorial(m,name):
    tune_binding(m,name)
    bs=m.node_tree.nodes.get("Principled BSDF");req(bs,"shader")
    dye=labelled(m,"Editorial dye + original grain");dye.inputs[0].default_value=.08
    mask=labelled(m,"Independent foil mask").outputs["Color"]
    # Brass-coloured foil reflects light without depending exclusively on the
    # dark metallic lobe. Keep the original printed plate intact.
    gold=rgb("#e5bd72")
    new=mix(m,mask,dye.outputs[0],(*gold,1),"05D separate foil reflectance")
    link(m,new,bs.inputs["Base Color"])
    metallic=labelled(m,"Foil metallic response");metallic.inputs["To Max"].default_value=.62
    rough=labelled(m,"Foil roughness response");rough.inputs["To Min"].default_value=.59;rough.inputs["To Max"].default_value=.35
    foil=labelled(m,"Fine raised foil");foil.inputs["Strength"].default_value=.38;foil.inputs["Distance"].default_value=.00009
def tune_paper(o,name):
    m=bpy.data.materials.new("AL05D "+name+" paper metric");m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF");bs.inputs["Roughness"].default_value=.86
    mesh=o.data;uv=mesh.uv_layers.new(name="PageMetric")
    for f in mesh.polygons:
        for j in f.loop_indices:
            v=mesh.vertices[mesh.loops[j].vertex_index].co
            # U is thickness in scene metres; V runs along the exposed edge.
            uv.data[j].uv=(v.x,v.y+v.z*.41)
    coord=node(m,"ShaderNodeUVMap","Physical page coordinates");coord.uv_map="PageMetric"
    sep=node(m,"ShaderNodeSeparateXYZ","Thickness and edge axes");link(m,coord.outputs[0],sep.inputs[0])
    n=node(m,"ShaderNodeTexNoise","Uneven page-edge phase");n.inputs["Scale"].default_value=90;n.inputs["Detail"].default_value=2;link(m,coord.outputs[0],n.inputs["Vector"])
    warp=mathnode(m,"MULTIPLY",n.outputs["Fac"],.00013,"Bounded edge irregularity in metres")
    x=mathnode(m,"ADD",sep.outputs["X"],warp,"Metric thickness with slight irregularity")
    def wave(pitch,label):
        phase=mathnode(m,"MULTIPLY",x,2*math.pi/pitch,label)
        s=mathnode(m,"SINE",phase,0,"Page wave")
        return mathnode(m,"ADD",mathnode(m,"MULTIPLY",s,.5,"Half wave"),.5,"Normalized wave")
    fine=wave(.00028,"Individual pages 0.28 mm")
    group=wave(.0016,"Gatherings 1.6 mm")
    finecolor=ramp(m,fine,[(0,(.115,.075,.035)),(.16,(.29,.21,.12)),(.40,(.49,.40,.27)),(1,(.49,.40,.27))],"Fine paper gaps")
    broad=ramp(m,group,[(0,(.55,.44,.31)),(.18,(.8,.73,.58)),(1,(1,.96,.87))],"Gathered page tone")
    color=mix(m,.48,finecolor,broad,"Layered paper tone","MULTIPLY")
    link(m,color,bs.inputs["Base Color"])
    bump=node(m,"ShaderNodeBump","Page edge microrelief");bump.inputs["Strength"].default_value=.40;bump.inputs["Distance"].default_value=.00010;link(m,fine,bump.inputs["Height"]);link(m,bump.outputs[0],bs.inputs["Normal"])
    o.data.materials[0]=m
candidates={}
for name in NAMES:
    c=bpy.data.collections.new("AL05D "+name);c.asset_mark();c.asset_data.description="Material correction on exact 05C; candidate, not released."
    candidates[name]=c;cache={};changes=[]
    for src in base[name].objects:
        req(src.type=="MESH","Unexpected source object type")
        o=src.copy();o.name=src.name.replace("AL05C","AL05D");o.data=src.data.copy();c.objects.link(o)
        if o.name.endswith("page block"):
            tune_paper(o,name);changes.append({"object":o.name,"role":"metric page edges"})
        else:
            for j,orig in enumerate(list(o.data.materials)):
                if not orig.use_nodes:continue
                labels={n.label for n in orig.node_tree.nodes}
                role="editorial" if "Independent foil mask" in labels else "binding" if "Leather dye" in labels else None
                if not role:continue
                key=orig.name
                if key not in cache:
                    m=orig.copy();m.name="AL05D "+orig.name;cache[key]=m
                    if role=="editorial":tune_editorial(m,name)
                    else:tune_binding(m,name)
                o.data.materials[j]=cache[key];changes.append({"object":o.name,"role":role,"slot":j})
        req(geom(o)==geom(src),"Geometry drift")
    req(len(c.objects)==len(base[name].objects) and any(x["role"]=="metric page edges" for x in changes),"candidate coverage")
    report["assets"][name]={"nominalSize":p["assets"][name]["nominalSize"],"objects":len(c.objects),"geometryEqual":True,"changes":changes}
req(len([i for i in bpy.data.images if i.name.startswith("AL05C ") and i.packed_file])==16,"packed maps")
target=out/"Atlas-Material-Collection.blend";bpy.data.libraries.write(str(target),set(candidates.values()),fake_user=True,compress=True)
report["librarySha256"]=sha(target);receipt()
# Independent paired studio. Identical transforms and light between variants.
s=bpy.context.scene
for o in list(s.objects):bpy.data.objects.remove(o,do_unlink=True)
s.world=bpy.data.worlds.new("AL05D studio world");s.world.use_nodes=True
bg=s.world.node_tree.nodes.get("Background");bg.inputs[0].default_value=(.12,.14,.18,1);bg.inputs[1].default_value=.32
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=40;s.cycles.seed=0;s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
s.render.threads_mode="FIXED";s.render.threads=2;s.render.resolution_x=1200;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
s.view_settings.view_transform="AgX";s.view_settings.look="AgX - Medium High Contrast"
dims=[report["assets"][n]["nominalSize"] for n in NAMES];H=max(d[2] for d in dims);D=max(d[1] for d in dims);W=sum(d[0] for d in dims)
def instance(c,n):
    o=bpy.data.objects.new(n,None);s.collection.objects.link(o);o.instance_type="COLLECTION";o.instance_collection=c;return o
pairs=[(instance(base[n],"baseline "+n),instance(candidates[n],"candidate "+n)) for n in NAMES]
bpy.ops.mesh.primitive_plane_add(size=20*H,location=(0,0,-.001))
floor=bpy.context.object;mat=bpy.data.materials.new("AL05D floor");mat.diffuse_color=(.12,.105,.09,1);floor.data.materials.append(mat)
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
            req(sha(library)==locked and all(state(base[n])==initial[n] for n in NAMES) and material_state()==initial_materials,"source drift");receipt()
        req(report["comparisons"][view+"-candidate"]["changedPixels"]>0,"no candidate effect")
        if view=="spines":req(report["comparisons"][view+"-restored"]["meanAbsoluteRGBDelta"]<.0002,"rollback drift")
    report.update(status="PASS_MATERIAL_CANDIDATES",sourceUnchanged=True,artisticReviewRequired=True);receipt()
except Exception as e:
    report.update(status="FAIL",error=repr(e));receipt();raise
