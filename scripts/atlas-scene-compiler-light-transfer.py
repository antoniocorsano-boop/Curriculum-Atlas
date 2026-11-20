"""ASC-P2C1: bake actual static cover lighting, export bounded self-contained GLB."""
import bpy, hashlib, json, math, os, struct, sys, time
from collections import Counter
from pathlib import Path
from mathutils import Vector
import numpy as np

master, p1file, p2afile, p2bfile, out = map(lambda x: Path(x).resolve(), sys.argv[sys.argv.index("--")+1:])
MASTER="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
P1="e39afbe21a9758f0d8261d92b39cf1a28a9b5330"
P2A="5c2405291d1f4bcc499db848ec0a980de3ae5c1a"
P2B="b9bff7378eb6b7337efb16e734711906b5fdd328"
def require(c,m):
    if not c:raise RuntimeError(m)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def val(v):return [round(float(a),8) for a in v]
def write(path,data):path.write_text(json.dumps(data,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
def triangles(m):m.calc_loop_triangles();return len(m.loop_triangles)
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
p1=json.loads(p1file.read_text());p2a=json.loads(p2afile.read_text());p2b=json.loads(p2bfile.read_text())
require(p1["status"]=="PASS_OBSERVATION_ONLY" and p1["revision"]==P1 and p1["masterUnchanged"] and p1["masterSha256"]==MASTER,"P1 receipt")
require(p2a["status"]=="PASS_GEOMETRY_COMPARISON" and p2a["revision"]==P2A and p2a["masterUnchanged"],"P2A receipt")
require(p2b["status"]=="PASS_EXTENSION_COMPARISON" and p2b["revision"]==P2B and p2b["masterUnchanged"] and p2b["sharedMeshesRestored"],"P2B receipt")
require(p2b["theoreticalTriangles"]=={"source":374220,"candidate":41580,"saved":332640},"P2B quantities")
s=bpy.context.scene;original_cam=s.camera
require(original_cam and original_cam.name=="atrium" and not bpy.data.libraries,"scene identity")
initial_objects=list(s.objects)
original_meshes={o.name:o.data for o in initial_objects if o.type=="MESH"}
original_materials={o.name:tuple(o.data.materials) for o in initial_objects if o.type=="MESH"}
# Only pre-existing static covers and architectural material are eligible.
candidate_names=["Library bay 04-0-Bay Book "+str(i) for i in range(6)]+[
    "Library bay 04-0-Bay Walnut","Library bay 04-0-Bay Warm limestone"]
candidates=[s.objects.get(name) for name in candidate_names]
require(all(o and o.type=="MESH" and not o.modifiers and not o.hide_render and len(o.data.materials)==1 for o in candidates),"static binding")
detail=s.objects.get("detail")
require(detail and detail.type=="CAMERA","native detail camera")
camdata=bpy.data.cameras.new("ASC-P2C contextual lens")
cam=bpy.data.objects.new("ASC-P2C context",camdata);s.collection.objects.link(cam)
cam.location=Vector(p2a["contextCamera"]["location"])
target=Vector(p2a["contextCamera"]["target"])
camdata.lens=p2a["contextCamera"]["lens"];camdata.clip_start=.05;camdata.clip_end=150
cam.rotation_euler=(target-cam.location).to_track_quat("-Z","Y").to_euler()
# Find a real, first-visible, static candidate from the unchanged scene.
dg=bpy.context.evaluated_depsgraph_get()
corners=camdata.view_frame(scene=s)
bounds=[(min(q[i] for q in corners),max(q[i] for q in corners)) for i in range(2)]
first=Counter();z=corners[0].z;rotation=cam.matrix_world.to_3x3()
for iy in range(64):
    for ix in range(96):
        d=Vector((bounds[0][0]+(bounds[0][1]-bounds[0][0])*(ix+.5)/96,
                  bounds[1][0]+(bounds[1][1]-bounds[1][0])*(iy+.5)/64,z))
        hit,_,_,_,obj,_=s.ray_cast(dg,cam.location,(rotation@d).normalized(),distance=150)
        if hit and obj:first[obj.name]+=1
available=[(first[o.name],-j,o) for j,o in enumerate(candidates) if first[o.name]>0]
require(available,"no visible static surface in pilot camera")
hits,_,o=max(available,key=lambda row:(row[0],row[1]))
source=o.data;original_mat=o.data.materials[0]
require(original_mat and original_mat.use_nodes and len(source.uv_layers)>=1,"source UV/material")
require(triangles(source)>0 and not any(n.type=="TEX_IMAGE" and n.image is None for n in original_mat.node_tree.nodes),"source material readiness")
out.mkdir(parents=True,exist_ok=True)
report={"schema":"atlas.asc01.light-transfer/v1","status":"PENDING","revision":os.environ["ATLAS_EXACT_HEAD"],
        "masterSha256":MASTER,"inputs":{"p1":sha(p1file),"p2a":sha(p2afile),"p2b":sha(p2bfile)},
        "surface":{"name":o.name,"sourceMesh":source.name,"originalMaterial":original_mat.name,"firstVisibleRays":hits,
                   "sampledRays":6144,"camera":"context","sourceTriangles":triangles(source)},
        "variants":{"A":"Native Cycles PBR","B":"Diffuse bake emission, no double lighting in Blender"},
        "bake":{},"export":{},"images":{},"comparisons":{},
        "masterModified":False,"rendererModified":False,"studentAuthorized":False,"publishable":False,
        "artisticApproval":False,"webglQualified":False}
def persist():write(out/"light-transfer.json",report)
persist()
clone=None;bake_mat=None;unlit=None;im=None
def restore():
    o.data=source;bpy.context.view_layer.update()
def protect():
    require(sha(master)==MASTER,"master on disk modified")
    require(all(x.data==original_meshes[x.name] for x in initial_objects if x.type=="MESH" and x!=o),"other objects rebound")
    require(all(tuple(x.data.materials)==original_materials[x.name] for x in initial_objects if x.type=="MESH" and x!=o),"other materials rebound")
    require(tuple(source.materials)==original_materials[o.name],"source material modified")
def image_pixels(path):
    im2=bpy.data.images.load(str(path),check_existing=False)
    try:
        width,height=im2.size
        rgb=np.empty(width*height*4,np.float32);im2.pixels.foreach_get(rgb)
        return rgb.reshape((height,width,4))[:,:,:3].copy()
    finally:bpy.data.images.remove(im2)
def compare(a,b):
    diff=np.abs(a-b)
    return {"pixels":int(a.shape[0]*a.shape[1]),"changedPixels":int(np.count_nonzero(np.max(diff,axis=2)>1/255)),
            "meanAbsoluteRGBDelta":float(diff.mean()),"maxChannelDelta":float(diff.max())}
def render(name):
    path=out/(name+".png");s.render.filepath=str(path)
    start=time.monotonic();bpy.ops.render.render(write_still=True)
    img=image_pixels(path)
    require(np.isfinite(img).all() and float(img.max())>0,"invalid render "+name)
    report["images"][name]={"sha256":sha(path),"width":int(img.shape[1]),"height":int(img.shape[0]),
                            "seconds":round(time.monotonic()-start,3)}
    persist();return img
def uv_check(mesh,uv):
    mesh.calc_loop_triangles()
    coords=np.array([tuple(x.uv) for x in uv.data],dtype=np.float64)
    report["bake"]["uvDiagnostic"]={"min":float(coords.min()),"max":float(coords.max()),"activeIndex":mesh.uv_layers.active_index,"layers":[v.name for v in mesh.uv_layers]};persist()
    require(np.isfinite(coords).all() and coords.min()>=-1e-6 and coords.max()<=1.000001,"UV2 out of range")
    size=256;mask=np.zeros((size,size),np.uint16)
    for t in mesh.loop_triangles:
        a,b,c=coords[list(t.loops)]*size
        x0=max(0,int(np.floor(min(a[0],b[0],c[0]))));x1=min(size,int(np.ceil(max(a[0],b[0],c[0]))))
        y0=max(0,int(np.floor(min(a[1],b[1],c[1]))));y1=min(size,int(np.ceil(max(a[1],b[1],c[1]))))
        if x1<=x0 or y1<=y0:continue
        denom=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
        if abs(denom)<1e-10:continue
        x,y=np.meshgrid(np.arange(x0,x1)+.5,np.arange(y0,y1)+.5)
        u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/denom
        v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/denom
        mask[y0:y1,x0:x1]+=((u>1e-6)&(v>1e-6)&(u+v<1-1e-6)).astype(np.uint16)
    covered=int(np.count_nonzero(mask));overlap=int(np.count_nonzero(mask>1))
    require(covered>size*size*.08 and overlap==0,"UV2 overlap/coverage")
    return {"coveredPixelsAt256":covered,"overlapPixelsAt256":overlap,"uvLayer":uv.name,"rasterSize":size}
def validate_glb(path):
    data=path.read_bytes();require(len(data)>100 and data[:4]==b"glTF","GLB magic")
    _,version,size=struct.unpack_from("<III",data,0)
    require(version==2 and size==len(data),"GLB structure")
    jlen,jtype=struct.unpack_from("<I4s",data,12)
    require(jtype==b"JSON","GLB JSON section")
    j=json.loads(data[20:20+jlen].decode("utf-8"))
    require(len(j.get("meshes",[]))==1 and len(j.get("materials",[]))==1,"single-surface GLB")
    attrs=j["meshes"][0]["primitives"][0]["attributes"]
    require("TEXCOORD_0" in attrs and "TEXCOORD_1" in attrs,"UV2 not exported")
    images=j.get("images",[])
    require(images and all(im.get("mimeType")=="image/png" and "bufferView" in im for im in images),"no embedded PNG")
    mat=j["materials"][0]
    texrefs=[]
    for k,v in mat.items():
        if k.endswith("Texture") and isinstance(v,dict):texrefs.append(v)
    pbr=mat.get("pbrMetallicRoughness",{})
    for k,v in pbr.items():
        if k.endswith("Texture") and isinstance(v,dict):texrefs.append(v)
    require(texrefs and any(t.get("texCoord")==1 for t in texrefs),"lightmap not bound to UV2")
    return {"bytes":len(data),"sha256":sha(path),"primitiveAttributes":sorted(attrs),
            "materialExtensions":sorted(mat.get("extensions",{})),"textureCoordinateSets":sorted({t.get("texCoord",0) for t in texrefs}),
            "embeddedImages":len(images),"unlit":bool(mat.get("extensions",{}).get("KHR_materials_unlit") is not None)}
try:
    protect()
    s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=16;s.cycles.seed=0
    s.cycles.use_animated_seed=False;s.cycles.use_adaptive_sampling=False;s.cycles.use_denoising=True
    s.render.threads_mode="FIXED";s.render.threads=2
    s.render.resolution_percentage=100;s.render.image_settings.file_format="PNG"
    s.camera=cam;s.render.resolution_x=640;s.render.resolution_y=480
    baseline=render("context-original")
    clone=source.copy();clone.name="ASC-P2C probe UV2 "+source.name;o.data=clone
    require(len(clone.uv_layers)>=1,"no UV0")
    uv0=clone.uv_layers[0].name;atlas=clone.uv_layers.new(name="AtlasLightmap",do_init=True)
    clone.uv_layers.active_index=len(clone.uv_layers)-1
    bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.mode_set(mode="EDIT");clone.uv_layers.active_index=len(clone.uv_layers)-1;bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.012)
    bpy.ops.object.mode_set(mode="OBJECT")
    atlas=clone.uv_layers["AtlasLightmap"]
    require(clone.uv_layers[0].name==uv0 and clone.uv_layers[-1].name=="AtlasLightmap","UV layer drift")
    report["bake"]["uv"]=uv_check(clone,atlas)
    clone.uv_layers.active_index=0;clone.uv_layers[0].active_render=True
    bake_mat=original_mat.copy();bake_mat.name="ASC-P2C temporary bake "+original_mat.name
    clone.materials.clear();clone.materials.append(bake_mat)
    im=bpy.data.images.new("ASC-P2C 512 baked diffuse",width=512,height=512,alpha=False,float_buffer=False)
    im.colorspace_settings.name="sRGB"
    nodes=bake_mat.node_tree.nodes
    for node in nodes:node.select=False
    target_node=nodes.new("ShaderNodeTexImage");target_node.name="ASC bake target UV2"
    target_node.image=im;target_node.select=True;nodes.active=target_node
    protect()
    start=time.monotonic()
    bpy.ops.object.bake(type="DIFFUSE",pass_filter={"COLOR","DIRECT","INDIRECT"},uv_layer=atlas.name,margin=8,use_clear=True)
    report["bake"]["seconds"]=round(time.monotonic()-start,3)
    sample=np.empty(512*512*4,np.float32);im.pixels.foreach_get(sample)
    require(np.isfinite(sample).all(),"nonfinite bake")
    rgb=sample.reshape((-1,4))[:,:3]
    require(float(rgb.max()-rgb.min())>.03 and float(rgb.mean())>.01,"empty/flat bake")
    im.filepath_raw=str(out/"lightmap-512.png");im.file_format="PNG";im.save()
    report["bake"].update({"pngSha256":sha(out/"lightmap-512.png"),"bytes":(out/"lightmap-512.png").stat().st_size,
                            "resolution":[512,512],"samples":16,"margin":8,"passes":["COLOR","DIRECT","INDIRECT"],
                            "rgbMin":float(rgb.min()),"rgbMax":float(rgb.max()),"rgbMean":float(rgb.mean()),
                            "uv1":"AtlasLightmap","uv0":uv0})
    persist()
    unlit=bpy.data.materials.new("ASC-P2C diffuse-baked emission")
    unlit.use_nodes=True;nodes=unlit.node_tree.nodes;nodes.clear();links=unlit.node_tree.links
    output=nodes.new("ShaderNodeOutputMaterial");emit=nodes.new("ShaderNodeEmission")
    uv=nodes.new("ShaderNodeUVMap");uv.uv_map="AtlasLightmap"
    tex=nodes.new("ShaderNodeTexImage");tex.image=im;tex.interpolation="Linear"
    links.new(uv.outputs["UV"],tex.inputs["Vector"]);links.new(tex.outputs["Color"],emit.inputs["Color"])
    links.new(emit.outputs["Emission"],output.inputs["Surface"])
    clone.materials.clear();clone.materials.append(unlit)
    s.camera=cam;s.render.resolution_x=640;s.render.resolution_y=480
    baked=render("context-baked");report["comparisons"]["context-baked"]=compare(baseline,baked)
    restore();s.camera=cam
    restored=render("context-restored");rollback=compare(baseline,restored)
    report["comparisons"]["context-restored"]=rollback
    require(rollback["meanAbsoluteRGBDelta"]<.0002 and rollback["changedPixels"]<=max(1,int(rollback["pixels"]*.001)),"rollback drift")
    s.camera=original_cam;s.render.resolution_x=720;s.render.resolution_y=450
    wide=render("atrium-original")
    o.data=clone;s.camera=original_cam
    wide_bake=render("atrium-baked");report["comparisons"]["atrium-baked"]=compare(wide,wide_bake)
    o.select_set(True);bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
    result=bpy.ops.export_scene.gltf(filepath=str(out/"single-surface-baked.glb"),export_format="GLB",
                                      use_selection=True,export_texcoords=True,export_materials="EXPORT",
                                      export_image_format="PNG",export_apply=False,export_lights=False)
    require("FINISHED" in result,"GLB export")
    report["export"]=validate_glb(out/"single-surface-baked.glb")
    restore();s.camera=original_cam;protect()
    report["status"]="PASS_ISOLATED_BAKE_AND_GLTF"
    report["masterUnchanged"]=sha(master)==MASTER
    report["sourceBindingsRestored"]=o.data==source
    report["artisticReviewRequired"]=True
    persist()
    print("ASC_P2C1 "+json.dumps({"status":report["status"],"surface":report["surface"],
          "bake":report["bake"],"export":report["export"],"comparisons":report["comparisons"]},
          ensure_ascii=False),flush=True)
except Exception as e:
    report.update(status="FAIL_OR_INCOMPLETE",error=repr(e));persist();raise
finally:
    restore();s.camera=original_cam
    if cam:bpy.data.objects.remove(cam,do_unlink=True)
    if camdata:bpy.data.cameras.remove(camdata)
    if clone:bpy.data.meshes.remove(clone)
    if bake_mat:bpy.data.materials.remove(bake_mat)
    if unlit:bpy.data.materials.remove(unlit)
    if im:bpy.data.images.remove(im)
