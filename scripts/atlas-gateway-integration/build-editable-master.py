"""ASP-01 editable Blender master: reuse exact A5.5a + R2 + ALS source.
No public release, external font distribution, or GLB substitution for architecture.
"""
import bpy,hashlib,json,sys,ast
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
adapter=HERE.parent/"als01"/"compare-context.py"
raw=adapter.read_bytes()
assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()=="2d2eb53a86b0e455e1b9f75aa1e08ea3fba85fd3"
module,sample,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
assert not out.exists()
# Execute only the proven source adapter, not its render/production steps.
marker='compile(source,str(candidate),"exec")\nold=sys.argv'
assert raw.decode().count(marker)==1
ns={"__file__":str(adapter),"__name__":"__asp01_adapter__"}
exec(compile(raw.decode().split(marker,1)[0],str(adapter),"exec"),ns)
source=ns["source"]
marker='views=[v for v in views if v[0] in ("atrium","vertical")]'
assert source.count(marker)==1
# Keep every original camera definition, but stop before camera/render loop.
source=source.split(marker,1)[0]
assert "bpy.ops.render.render(" not in source and "save_as_mainfile" not in source
ast.parse(source)
old=sys.argv
try:
    sys.argv=[str(ns["candidate"]),"--",str(out)]
    scene_ns={"__file__":str(ns["candidate"]),"__name__":"__asp01_master__","als_adapter":ns["adapter"],"als_sample":ns["static_sample"],"als_composition":ns["composition"]}
    exec(compile(source,str(ns["candidate"]),"exec"),scene_ns)
finally:sys.argv=old
scene=scene_ns["scene"]
assert len(scene_ns["placements"])==45
# The canonical star objects remain as historical source, not visible duplicates.
for obj in scene_ns["canonical_stars"]:
    obj.hide_render=True;obj.hide_set(True)
camera_records={}
for name,w,h,pos,target,lens in scene_ns["views"]:
    data=bpy.data.cameras.new(name);cam=bpy.data.objects.new(name,data)
    scene.collection.objects.link(cam);cam.location=pos
    cam.rotation_euler=(Vector(target)-cam.location).to_track_quat("-Z","Y").to_euler()
    data.lens=lens;data.clip_end=150
    cam["atlas_resolution_x"]=w;cam["atlas_resolution_y"]=h
    camera_records[name]={"position":list(pos),"target":list(target),"lensMm":lens,"resolution":[w,h]}
assert len(camera_records)==7
scene.camera=bpy.data.objects["atrium"]
scene.render.resolution_x,scene.render.resolution_y=camera_records["atrium"]["resolution"]
scene.render.resolution_percentage=100
points=scene_ns["als_points"]
projection=ns["adapter"].position_points(scene,scene.camera,points,ns["static_sample"]["views"]["atrium"],ns["composition"]["protected"]["atrium"])
for obj,p in points:obj.hide_render=False
assert len(projection)==18
# Organize actual objects in stable collections without changing transforms,
# material nodes, lighting or shared mesh identities.
groups={}
for name in ("01 Architettura","02 Campate condivise","03 Cupola","04 Scenografia e paesaggio","05 Portali","06 Astri R2","07 ALS-01 R4","08 Luci","09 Regia visiva","10 Riferimenti non visibili"):
    col=bpy.data.collections.new(name);scene.collection.children.link(col);groups[name]=col
r2=set(scene_ns["new_objects"]);old_stars=set(scene_ns["canonical_stars"])
als=set(o for o,p in points)
roof=set(scene_ns["roof"]);portals=set(scene_ns["portal_meshes"])
scenery=set(scene_ns["scenery"])|set(scene_ns["decor"])
before={o.name:([list(row) for row in o.matrix_world],o.data.name if o.data else None) for o in scene.objects}
for obj in list(scene.objects):
    if obj in old_stars or obj.hide_render:group="10 Riferimenti non visibili"
    elif obj in r2:group="06 Astri R2"
    elif obj in als:group="07 ALS-01 R4"
    elif obj.type=="LIGHT":group="08 Luci"
    elif obj.type=="CAMERA":group="09 Regia visiva"
    elif obj.name.startswith("Library bay "):group="02 Campate condivise"
    elif obj in roof:group="03 Cupola"
    elif obj in portals:group="05 Portali"
    elif obj in scenery:group="04 Scenografia e paesaggio"
    else:group="01 Architettura"
    groups[group].objects.link(obj)
    for col in list(obj.users_collection):
        if col!=groups[group]:col.objects.unlink(obj)
bpy.context.view_layer.update()
assert all(before[o.name]==([list(row) for row in o.matrix_world],o.data.name if o.data else None) for o in scene.objects)
def inventory(s):
    result={}
    for col in s.collection.children:
        if col.name not in groups:continue
        result[col.name]={"objects":len(col.objects),"meshes":sum(o.type=="MESH" for o in col.objects),"uniqueMeshes":len({o.data.name for o in col.objects if o.type=="MESH"}),"hiddenRender":sum(o.hide_render for o in col.objects)}
    return result
inv=inventory(scene)
assert inv["02 Campate condivise"]["meshes"]==495 and inv["02 Campate condivise"]["uniqueMeshes"]==25
assert inv["03 Cupola"]["meshes"]==2 and inv["06 Astri R2"]["meshes"]==3 and inv["07 ALS-01 R4"]["meshes"]==18
assert inv["09 Regia visiva"]["objects"]==7 and inv["04 Scenografia e paesaggio"]["meshes"]>0
assert not bpy.data.libraries
assert not any(f.filepath not in ("","<builtin>") for f in bpy.data.fonts),"External font must not be distributed"
# Pack actual image resources only; no font file, no external linked library.
for im in bpy.data.images:
    if im.source=="FILE" and not im.packed_file:im.pack()
    if im.source=="FILE":assert im.packed_file,im.name
scene["asp01_version"]="master-candidate-v1"
scene["asp01_als_camera"]="atrium"
scene["asp01_als_note"]="Static R4 points positioned for atrium; recalculate with adapter for other views"
scene["asp01_artistic_approval"]=False
scene["asp01_student_authorized"]=False
scene["asp01_publishable"]=False
scene.render.filepath="//atlas-master-atrium.png"
path=out/"Atlas-Scene-Master.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(path),compress=True)
digest=hashlib.sha256(path.read_bytes()).hexdigest()
# Reload the packed file before qualification. No original asset is re-imported.
bpy.ops.wm.open_mainfile(filepath=str(path),load_ui=False)
scene=bpy.context.scene
assert inventory(scene)==inv and scene.camera.name=="atrium"
assert all(before[o.name]==([list(row) for row in o.matrix_world],o.data.name if o.data else None) for o in scene.objects)
assert not bpy.data.libraries and all(im.packed_file for im in bpy.data.images if im.source=="FILE")
assert not any(f.filepath not in ("","<builtin>") for f in bpy.data.fonts)
assert hashlib.sha256(path.read_bytes()).hexdigest()==digest
receipt={"status":"DRAFT_EDITABLE_MASTER_REOPENED","source":ns["pv"].identity(ns["candidate"]),"r2Sha256":ns["digest"],"staticSampleSha256":hashlib.sha256(sample.read_bytes()).hexdigest(),"collections":inv,"cameras":camera_records,"packedImages":[im.name for im in bpy.data.images if im.source=="FILE"],"sharedBayMeshes":25,"bayInstances":495,"alsPoints":18,"alsActiveCamera":"atrium","sourceTransformsPreserved":True,"sourceGeometryRebuiltFromGenerator":True,"externalLibraries":0,"externalFonts":0,"file":{"name":path.name,"bytes":path.stat().st_size,"sha256":digest},"artisticApproval":False,"browserQualified":False,"studentAuthorized":False,"publishable":False}
(out/"editable-master-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
print("ASP01_EDITABLE_MASTER",json.dumps(receipt),flush=True)
