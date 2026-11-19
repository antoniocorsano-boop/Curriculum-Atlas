"""ART-LEARN-05B: original reusable book assets; native Blender collection library.
Source master only observed. Studio baseline and detailed candidates share layout,
lighting, dimensions and camera. No WebGL qualification or master promotion.
"""
import bpy, bmesh, hashlib, json, math, os, sys, time
from pathlib import Path
from collections import Counter
from mathutils import Vector, Matrix
import numpy as np

args=sys.argv[sys.argv.index("--")+1:]
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def digest(x):return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def vec(v):return [round(float(x),8) for x in v]
def inventory(collection):
    rows=[]
    for o in sorted(collection.all_objects,key=lambda o:o.name):
        d={"name":o.name,"type":o.type,"location":vec(o.location),"rotation":vec(o.rotation_euler),"scale":vec(o.scale)}
        if o.type=="MESH":
            m=o.data;m.calc_loop_triangles()
            d.update(vertices=len(m.vertices),faces=len(m.polygons),baseTriangles=len(m.loop_triangles),materials=[x.name for x in m.materials],modifiers=[{"type":x.type,"name":x.name} for x in o.modifiers])
        elif o.type=="FONT":
            d.update(body=o.data.body,size=float(o.data.size),materials=[x.name for x in o.data.materials])
        rows.append(d)
    return rows
def dependency_audit():
    # A Library record alone is not evidence of a live linked datablock.
    # Inspect all ID types, not merely the appended Object IDs.
    ids=set(bpy.data.user_map().keys())
    for prop in bpy.data.bl_rna.properties:
        if prop.type!="COLLECTION":continue
        try:ids.update(x for x in getattr(bpy.data,prop.identifier) if isinstance(x,bpy.types.ID))
        except (TypeError,AttributeError):continue
    linked=sorted([{"type":x.bl_rna.identifier,"name":x.name,"library":x.library.filepath} for x in ids if x.library],key=lambda x:(x["type"],x["name"],x["library"]))
    return {"linkedIDs":linked,"libraryRecords":[{"name":x.name,"filepath":x.filepath,"users":x.users} for x in bpy.data.libraries],"fileImages":[i.filepath for i in bpy.data.images if i.source=="FILE" and not i.packed_file],"externalFonts":[f.filepath for f in bpy.data.fonts if f.filepath not in ("","<builtin>") and not f.packed_file]}
def validate_assets(collections,r):
    require(set(c.name for c in collections)==set(r["assets"]),"unexpected asset collections")
    for c in collections:
        require(c and inventory(c)==r["assets"][c.name]["objects"],"asset roundtrip drift "+str(c))
        require(c.asset_data and not c.library,"asset metadata/locality")
    audit=dependency_audit()
    require(not any(audit[k] for k in ("linkedIDs","fileImages","externalFonts")),"live external dependencies: "+json.dumps(audit))
    return audit

if args[0] in ("verify-library","verify-offline"):
    path,receipt=map(Path,args[1:3])
    r=json.loads(receipt.read_text());out=receipt.parent
    if args[0]=="verify-library":
        require(sha(path)==r["librarySha256"],"library digest")
        with bpy.data.libraries.load(str(path),link=False) as (src,dst):
            require(set(src.collections)==set(r["assets"]),"unexpected library collections")
            dst.collections=sorted(src.collections)
        for c in dst.collections:bpy.context.scene.collection.children.link(c)
        audit=dependency_audit()
        (out/"library-append-audit.json").write_text(json.dumps(audit,indent=2)+"\n")
        validate_assets(dst.collections,r)
        target=out/"Atlas-Book-Offline-Test.blend"
        bpy.ops.wm.save_as_mainfile(filepath=str(target),compress=True)
        require(target.is_file(),"independent file not written")
        print("ART_LEARN_05B_APPEND PASS",json.dumps(audit),flush=True)
    else:
        require(len(args)==4,"offline source path required")
        require(not Path(args[3]).exists(),"original library still accessible")
        require(Path(bpy.data.filepath).resolve()==path.resolve(),"offline file not opened")
        collections=[bpy.data.collections.get(n) for n in sorted(r["assets"])]
        require(all(collections),"missing appended collections")
        audit=dependency_audit()
        (out/"library-offline-audit.json").write_text(json.dumps(audit,indent=2)+"\n")
        validate_assets(collections,r)
        require(all(c in list(bpy.context.scene.collection.children) for c in collections),"collections not in independent scene")
        q={"status":"PASS","librarySha256":r["librarySha256"],"offlineFileSha256":sha(path),"assets":sorted(r["assets"]),"objectInventoriesEqual":True,"externalDependencies":False,"sourceUnavailableOnReopen":True,"appendAudit":json.loads((out/"library-append-audit.json").read_text()),"offlineAudit":audit}
        (out/"library-roundtrip.json").write_text(json.dumps(q,indent=2)+"\n")
        print("ART_LEARN_05B_LIBRARY_ROUNDTRIP PASS",json.dumps(audit),flush=True)
    sys.exit(0)

master,prior,out=map(lambda x:Path(x).resolve(),args)
out.mkdir(parents=True,exist_ok=True)
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
p=json.loads(prior.read_text())
require(p["status"]=="PASS_BOOK_SCENOGRAPHY_CANDIDATES" and p["masterSha256"]==MASTER and p["sourceUnchanged"] and p["sharedMeshesRestored"] and not p["artisticApproval"],"prior evidence")
require(len(p["bookInventory"])==308,"prior paired inventory")
source=bpy.context.scene
require(source.camera and source.camera.name=="atrium" and not bpy.data.libraries,"source scene")
def source_state():
    return digest({"objects":[[o.name,o.type,[vec(r) for r in o.matrix_world],bool(o.hide_render),o.data.name if o.data else None,[x.name if x else None for x in o.data.materials] if o.type=="MESH" else None] for o in sorted(source.objects,key=lambda x:x.name)],"camera":source.camera.name,"world":source.world.name if source.world else None,"render":[source.render.engine,source.render.resolution_x,source.render.resolution_y,source.render.resolution_percentage],"color":[source.view_settings.view_transform,source.view_settings.look,source.view_settings.exposure,source.view_settings.gamma]})
locked=source_state()
# Measure real connected components in a qualified original bay; the same
# local axes used in 05A are width X, depth Y, height Z. No guessed scale.
dims=[]
for i in range(6):
    o=source.objects.get("Library bay 04-0-Bay Book "+str(i))
    require(o and o.type=="MESH","source binding")
    adj=[[] for _ in o.data.vertices]
    for e in o.data.edges:
        a,b=e.vertices;adj[a].append(b);adj[b].append(a)
    seen=set()
    for k in range(len(adj)):
        if k in seen:continue
        seen.add(k);stack=[k];ids=[]
        while stack:
            q=stack.pop();ids.append(q)
            for j in adj[q]:
                if j not in seen:seen.add(j);stack.append(j)
        require(len(ids)>=8,"book component")
        vs=[o.data.vertices[j].co for j in ids]
        scales=[o.matrix_world.to_3x3().col[j].length for j in range(3)]
        d=[(max(v[j] for v in vs)-min(v[j] for v in vs))*scales[j] for j in range(3)]
        require(all(.005<x<2 for x in d),"source dimension")
        dims.append({"object":o.name,"component":len(dims),"size":d})
require(len(dims)==77,"source inventory drift")
dims.sort(key=lambda d:(d["size"][2],d["size"][0],d["component"]))
profiles=[dims[round((len(dims)-1)*q)] for q in (.15,.38,.63,.86)]
names=["ATLANTE","NATURA","STORIA","GEOMETRIA"]
palette=[(.115,.028,.018),(.025,.095,.066),(.025,.048,.115),(.135,.087,.035)]
report={"schema":"atlas.art-learning.book-library/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":MASTER,"priorArtifact":14498509624,"priorStudySha256":sha(prior),"sourceStateSha256":locked,"sourceBookCount":len(dims),"profiles":profiles,"assets":{},"renders":{},"comparisons":{},"masterModified":False,"artisticApproval":False,"publishable":False,"studentAuthorized":False,"crossWorldQualified":False,"webglQualified":False}
def write():(out/"book-library-study.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
write()

# Original shading: object-local coordinates preserve grain scale when instanced.
def material(name,color,rough,metal=0):
    m=bpy.data.materials.new("AL05B "+name);m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF");bs.inputs["Base Color"].default_value=(*color,1);bs.inputs["Roughness"].default_value=rough;bs.inputs["Metallic"].default_value=metal
    return m,bs
def node(m,typ,name):
    n=m.node_tree.nodes.new(typ);n.label=name;return n
def link(m,a,b):m.node_tree.links.new(a,b)
def noise(m,coord,scale,detail,rough,name):
    n=node(m,"ShaderNodeTexNoise",name);n.inputs["Scale"].default_value=scale;n.inputs["Detail"].default_value=detail;n.inputs["Roughness"].default_value=rough;link(m,coord,n.inputs["Vector"]);return n.outputs["Fac"]
def ramp(m,fac,a,b,name,lo=.15,hi=.85):
    n=node(m,"ShaderNodeValToRGB",name);e0,e1=n.color_ramp.elements;e0.position=lo;e0.color=(*a,1);e1.position=hi;e1.color=(*b,1);link(m,fac,n.inputs["Fac"]);return n.outputs["Color"]
def mix(m,a,b,f,name,mode="MIX"):
    n=node(m,"ShaderNodeMixRGB",name);n.blend_type=mode;n.inputs[0].default_value=f;link(m,a,n.inputs[1]);link(m,b,n.inputs[2]);return n.outputs[0]
def bump(m,bs,fac,strength,dist,name,normal=None):
    n=node(m,"ShaderNodeBump",name);n.inputs["Strength"].default_value=strength;n.inputs["Distance"].default_value=dist;link(m,fac,n.inputs["Height"])
    if normal is not None:link(m,normal,n.inputs["Normal"])
    if bs is not None:link(m,n.outputs["Normal"],bs.inputs["Normal"])
    return n.outputs["Normal"]
def math_node(m,op,a,b,name):
    n=node(m,"ShaderNodeMath",name);n.operation=op
    for i,v in enumerate((a,b)):
        if isinstance(v,(int,float)):n.inputs[i].default_value=v
        else:link(m,v,n.inputs[i])
    return n.outputs[0]
def leather(name,c,fabric=False):
    m,bs=material(name,c,.62);tc=node(m,"ShaderNodeTexCoord","Local book coordinates").outputs["Object"]
    broad=noise(m,tc,22,3,.68,"Dye irregularity")
    tone=ramp(m,broad,tuple(x*.58 for x in c),tuple(min(1,x*1.42+.012) for x in c),"Leather dye")
    fine=noise(m,tc,420,2,.72,"Leather grain")
    if fabric:
        # Two crossed warp/weft signals on the cloth binding; no external image.
        split=node(m,"ShaderNodeSeparateXYZ","Binding axes");link(m,tc,split.inputs[0])
        u=math_node(m,"MULTIPLY",split.outputs["Z"],2*math.pi/.0011,"Warp frequency")
        v=math_node(m,"MULTIPLY",split.outputs["Y"],2*math.pi/.0012,"Weft frequency")
        u=math_node(m,"SINE",u,0,"Warp");v=math_node(m,"SINE",v,0,"Weft")
        fine=math_node(m,"MULTIPLY",u,v,"Woven relief")
    tint=ramp(m,fine,(.69,.61,.51),(1,.99,.95),"Grain tint",.10,.85)
    link(m,mix(m,tone,tint,.40,"Dye and grain","MULTIPLY"),bs.inputs["Base Color"])
    link(m,ramp(m,broad,(.44,.44,.44),(.76,.76,.76),"Variable roughness"),bs.inputs["Roughness"])
    bump(m,bs,fine,.38,.00032 if fabric else .00024,"Binding microrelief")
    return m
def paper():
    m,bs=material("aged laid paper",(.64,.54,.37),.82)
    tc=node(m,"ShaderNodeTexCoord","Page coordinates").outputs["Object"]
    sep=node(m,"ShaderNodeSeparateXYZ","Page thickness axis");link(m,tc,sep.inputs[0])
    phase=math_node(m,"MULTIPLY",sep.outputs["X"],2*math.pi/.00023,"Page pitch in scene units")
    wave=math_node(m,"SINE",phase,0,"Individual page edges")
    # Sine is [-1,1]; convert to [0,1] before color ramp.
    wave=math_node(m,"MULTIPLY",wave,.5,"Half wave")
    wave=math_node(m,"ADD",wave,.5,"Normalized page signal")
    lines=ramp(m,wave,(.36,.28,.16),(.82,.74,.57),"Paper fiber and page gaps",.05,.34)
    aging=noise(m,tc,45,3,.65,"Uneven paper oxidation")
    stain=ramp(m,aging,(.56,.44,.28),(1,.96,.85),"Subtle aging")
    link(m,mix(m,lines,stain,.42,"Layered page color","MULTIPLY"),bs.inputs["Base Color"])
    bump(m,bs,wave,.22,.00012,"Page edge relief")
    return m
paper_mat=paper()
gold,bs=material("muted foil",(.44,.23,.065),.43,.72)
ivory,_=material("endpaper",(.66,.53,.33),.86)
seam,_=material("binding seam",(.032,.021,.012),.83)
simple_paper,_=material("comparison flat paper",(.64,.54,.37),.82)
detailed_mats=[leather(n.lower()+" binding",c,i==3) for i,(n,c) in enumerate(zip(names,palette))]
simple_mats=[material(n.lower()+" flat binding",c,.62)[0] for n,c in zip(names,palette)]
def mesh_obj(collection,name,verts,faces,mat,bevel=0):
    m=bpy.data.meshes.new(name+" mesh");m.from_pydata(verts,[],faces);m.update()
    bm=bmesh.new();bm.from_mesh(m);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(m);bm.free();m.update()
    require(len(m.polygons)>0 and all(p.area>1e-14 for p in m.polygons),"degenerate mesh "+name)
    m.materials.append(mat);o=bpy.data.objects.new(name,m);collection.objects.link(o)
    if bevel>0:
        mod=o.modifiers.new("Rounded physical edges","BEVEL");mod.width=bevel;mod.segments=3;mod.limit_method="ANGLE"
    return o
def box(c,name,lo,hi,mat,bevel=0):
    x,y,z=lo;X,Y,Z=hi
    require(X>x and Y>y and Z>z,"invalid box "+name)
    return mesh_obj(c,name,[(x,y,z),(X,y,z),(X,Y,z),(x,Y,z),(x,y,Z),(X,y,Z),(X,Y,Z),(x,Y,Z)],[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,bevel)
def spine(c,name,w,depth,z0,z1,mat,offset=0,wall=.0015,segments=16):
    # A closed, gently curved spine strip, not a cube or displacement illusion.
    # Cosine sampling is uniform in arc angle and includes both shoulders.
    outer=[]
    for j in range(segments+1):
        a=math.pi*j/segments
        outer.append((-.5*w*math.cos(a),-depth*math.sin(a)-offset))
    inner=[(x,y+wall) for x,y in reversed(outer)]
    outline=outer+inner;N=len(outline)
    vs=[(x,y,z) for z in (z0,z1) for x,y in outline]
    fs=[tuple(reversed(range(N))),tuple(range(N,2*N))]
    fs.extend((j,(j+1)%N,(j+1)%N+N,j+N) for j in range(N))
    o=mesh_obj(c,name,vs,fs,mat,min(wall*.22,(z1-z0)*.12))
    for poly in o.data.polygons:
        if len(poly.vertices)==4:poly.use_smooth=True
    return o
def title(c,name,body,w,h,depth):
    f=bpy.data.curves.new(name+" typography","FONT");f.body=body;f.align_x="CENTER";f.align_y="CENTER";f.size=min(w*.37,h*.056);f.extrude=min(.00009,w*.0015);f.resolution_u=4;f.materials.append(gold)
    o=bpy.data.objects.new(name,f);c.objects.link(o)
    o.location=(0,-depth-.00045,h*.60)
    o.rotation_euler=Matrix(((0,-1,0),(0,0,-1),(1,0,0))).to_euler()
    return o
assets=[];baselines=[]
for i,(name,profile,binding,flat) in enumerate(zip(names,profiles,detailed_mats,simple_mats)):
    w,d,h=profile["size"]
    require(h>w and d>w,"unexpected book proportions")
    # All geometry fits the measured nominal bounding dimensions. Y=0 is the
    # front tangent; the spine bulge stays inside the nominal depth.
    cover=min(.0035,w*.09);inset=min(.006,d*.035,h*.025);curve=min(d*.045,w*.16)
    # Baseline and detail share nominal extent w,d,h. Move the spine origin
    # to +curve, using a local collection offset via object translation.
    c=bpy.data.collections.new("AL05B "+name);c.asset_mark();c.asset_data.description="Original Studio Atlas book binding; measured nominal dimensions; candidate, not released."
    base=bpy.data.collections.new("AL05B baseline "+name)
    assets.append(c);baselines.append(base)
    for coll,mat,pm,detail in ((c,binding,paper_mat,True),(base,flat,simple_paper,False)):
        prefix=coll.name
        for side,x0,x1 in (("left",-w/2,-w/2+cover),("right",w/2-cover,w/2)):
            box(coll,prefix+" "+side+" cover",(x0,curve*.75,0),(x1,d,h),mat,min(cover*.28,.0012) if detail else 0)
        box(coll,prefix+" page block",(-w/2+cover,curve+inset,inset),(w/2-cover,d-inset,h-inset),pm,min(inset*.28,.0014) if detail else 0)
        if detail:
            o=spine(coll,prefix+" curved binding",w,curve,0,h,mat,wall=min(cover,.002));o.location.y=curve
            for j,t in enumerate((.10,.25,.84,.94) if i in (0,2) else (.12,.86)):
                z=t*h;th=min(.0035,h*.012)
                o=spine(coll,prefix+" raised rib "+str(j),w*.96,curve,z-th/2,z+th/2,mat,offset=.00065,wall=min(.001,w*.035));o.location.y=curve
                o=spine(coll,prefix+" foil rule "+str(j),w*.90,curve,z+th*.65,z+th*.90,gold,offset=.00086,wall=min(.0006,w*.025));o.location.y=curve
            for side,x in (("left",-w/2+cover*.50),("right",w/2-cover*.50)):
                # Endpaper is visible at the fore-edge, behind each board.
                a=min(cover*.18,.00065)
                x=-w/2+cover+a/2 if side=="left" else w/2-cover-a/2
                box(coll,prefix+" "+side+" endpaper",(x-a/2,curve+inset,inset*.8),(x+a/2,d-inset*.72,h-inset*.8),ivory,min(a*.15,.0001))
            o=title(coll,prefix+" title",name,w,h,curve);o.location.y+=curve
        else:
            box(coll,prefix+" flat spine",(-w/2,0,0),(w/2,curve+inset,h),mat)
    report["assets"][c.name]={"title":name,"nominalSize":profile["size"],"objects":inventory(c),"binding":"woven cloth" if i==3 else "leather"}
# A stand-alone native collection library: only original candidate collections,
# their owned meshes/materials/text, no master scenes or baseline collections.
library=out/"Atlas-Book-Collection.blend"
bpy.data.libraries.write(str(library),set(assets),fake_user=True,compress=True)
require(library.is_file() and library.stat().st_size>0,"library missing")
report["librarySha256"]=sha(library);report["libraryBytes"]=library.stat().st_size;write()

# Independent neutral studio, same exposure/cameras/placement for both variants.
studio=bpy.data.scenes.new("AL05B studio")
studio.world=bpy.data.worlds.new("AL05B studio world");studio.world.use_nodes=True
bg=studio.world.node_tree.nodes.get("Background");bg.inputs["Color"].default_value=(.12,.14,.18,1);bg.inputs["Strength"].default_value=.32
studio.render.engine="CYCLES";studio.cycles.device="CPU";studio.cycles.samples=40;studio.cycles.seed=0;studio.cycles.use_animated_seed=False;studio.cycles.use_adaptive_sampling=False;studio.cycles.use_denoising=True
studio.render.threads_mode="FIXED";studio.render.threads=2;studio.render.resolution_x=1000;studio.render.resolution_y=750;studio.render.resolution_percentage=100;studio.render.image_settings.file_format="PNG"
studio.view_settings.view_transform="AgX";studio.view_settings.look="AgX - Medium High Contrast";studio.view_settings.exposure=0
width=sum(x["size"][0] for x in profiles);H=max(x["size"][2] for x in profiles);D=max(x["size"][1] for x in profiles)
gap=max(.025,H*.10);total=width+3*gap
positions=[];x=-total/2
for i,prof in enumerate(profiles):
    w,d,h=prof["size"];positions.append((x+w/2,0,0));x+=w+gap
pairs=[]
for i,(a,b,pos) in enumerate(zip(assets,baselines,positions)):
    row=[]
    for mode,coll in (("candidate",a),("baseline",b)):
        o=bpy.data.objects.new("AL05B studio "+mode+" "+str(i),None);studio.collection.objects.link(o);o.instance_type="COLLECTION";o.instance_collection=coll;o.location=pos
        o.rotation_euler.z=math.radians((-2,1,-1,2)[i]);row.append(o)
    pairs.append(row)
floor_mat,_=material("neutral studio surface",(.12,.105,.09),.78)
box(studio.collection,"AL05B studio floor",(-6*H,-6*H,-.04*H),(6*H,6*H,-.0005),floor_mat,.002)
def area(name,loc,target,power,size,color):
    d=bpy.data.lights.new(name,"AREA");d.energy=power;d.shape="DISK";d.size=size;d.color=color
    o=bpy.data.objects.new(name,d);studio.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
target=Vector((0,D*.45,H*.50));R=max(total,H,D)
area("AL05B key",(-R,-R,1.7*R),target,115*R*R,R*1.15,(1,.90,.77))
area("AL05B fill",(R,-.30*R,.95*R),target,46*R*R,R*.90,(.81,.90,1))
area("AL05B rim",(.12*R,1.35*R,1.5*R),target,145*R*R,R*.85,(1,.94,.86))
def camera(name,pos,at,lens):
    d=bpy.data.cameras.new(name);d.lens=lens;d.sensor_width=36;d.clip_start=.005;d.clip_end=100
    o=bpy.data.objects.new(name,d);studio.collection.objects.link(o);o.location=pos;o.rotation_euler=(Vector(at)-o.location).to_track_quat("-Z","Y").to_euler();return o
# Horizontal sensor framing: at 50mm, distance 1.95*R yields ~1.4*R span.
cams={"spines":camera("AL05B spines",(.23*R,-1.95*R,H*.86),target,50),
      "pages":camera("AL05B pages",(.62*R, D+1.9*R,H*.96),target,50)}
# A close view of one complete object: inspect typography and fine relief.
w,d,h=profiles[2]["size"];px=positions[2][0]
cams["macro"]=camera("AL05B macro",(px+.10*h,-1.65*h,h*.63),(px,0,h*.52),52)
report["studio"]={"positions":positions,"cameras":{k:{"location":vec(v.location),"lens":v.data.lens} for k,v in cams.items()},"resolution":[1000,750],"samples":40,"renderer":"Cycles CPU","scope":"Neutral authored studio; simplified comparator is not the original Atlas scene."}
def pixels(path):
    im=bpy.data.images.load(str(path),check_existing=False)
    try:
        a=np.empty(len(im.pixels),np.float32);im.pixels.foreach_get(a);return a.reshape((-1,4))[:,:3].copy()
    finally:bpy.data.images.remove(im)
def compare(a,b):
    d=np.abs(a-b);return {"pixels":len(a),"changedPixels":int(np.count_nonzero(np.max(d,axis=1)>1/255)),"meanAbsoluteRGBDelta":float(d.mean()),"maxRGBDelta":float(d.max())}
try:
    bpy.context.window.scene=studio
    for view,cam in cams.items():
        studio.camera=cam;arrays={}
        modes=("baseline","candidate","restored") if view!="macro" else ("baseline","candidate")
        for mode in modes:
            for detail,base in pairs:
                detail.hide_render=mode!="candidate";base.hide_render=mode=="candidate"
            bpy.context.view_layer.update()
            key=view+"-"+mode;path=out/(key+".png");studio.render.filepath=str(path)
            start=time.monotonic();bpy.ops.render.render(write_still=True,scene=studio.name);a=pixels(path)
            require(np.isfinite(a).all() and a.max()>0,"invalid studio render")
            arrays[mode]=a
            require(source_state()==locked and sha(master)==MASTER,"source state drift")
            report["renders"][key]={"sha256":sha(path),"seconds":round(time.monotonic()-start,3),"camera":cam.name,"mode":mode}
            report["comparisons"][key]=compare(arrays["baseline"],a);write()
        require(report["comparisons"][view+"-candidate"]["changedPixels"]>0,"no candidate effect")
        if view!="macro":
            rb=report["comparisons"][view+"-restored"];require(rb["meanAbsoluteRGBDelta"]<.0002 and rb["changedPixels"]<=max(1,int(rb["pixels"]*.001)),"studio comparator rollback")
    require(source_state()==locked and sha(master)==MASTER,"final source guard")
    report.update(status="PASS_ORIGINAL_BOOK_ASSET_CANDIDATES",sourceUnchanged=True,protectedStateUnchanged=True,artisticReviewRequired=True,libraryRoundtripRequired=True);write()
    print("ART_LEARN_05B",report["status"],len(assets),"original assets",flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write();raise
finally:
    bpy.context.window.scene=source
