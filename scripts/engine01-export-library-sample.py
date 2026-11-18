"""P1A: export a bounded, actual Atlas library sample from the immutable master."""
import bpy, hashlib, json, os, sys
from pathlib import Path
from mathutils import Vector

master, out = map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
expected="f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def require(ok,msg):
    if not ok: raise RuntimeError(msg)
def write(path,value): path.write_text(json.dumps(value,indent=2,allow_nan=False)+"\n")
require(Path(bpy.data.filepath).resolve()==master and sha(master)==expected,"wrong master")
s=bpy.context.scene
require(s.camera and s.camera.name=="atrium","camera identity")
out.mkdir(parents=True,exist_ok=True)
# Real named objects observed in ASI-L2; shell meshes are intentionally intact.
names=["Shell Arena patinated bronze","Shell Atlas blue marble","Shell Brushed brass","Shell Polished warm stone","Shell Warm limestone","Cupola Cupola satin gold","Detail Brushed brass","Detail Warm luminous brass","Knowledge sculpture warm","Knowledge sculpture cool"]
suffixes=["Book "+str(i) for i in range(6)]+["Brushed brass","Paper","Recessed walnut","Walnut","Warm limestone"]
for bay in ("02-0","03-0","04-0","05-0"):
    names += ["Library bay "+bay+"-Bay "+suffix for suffix in suffixes]
selected=[s.objects.get(n) for n in names]
require(all(o and o.type=="MESH" and not o.hide_render for o in selected),"sample identity/visibility drift")
require(len(set(names))==len(names),"duplicate sample name")
dg=bpy.context.evaluated_depsgraph_get()
inventory=[]
def rounded(v):return [round(float(x),8) for x in v]
def material(o):
    require(len(o.data.materials)==1 and o.data.materials[0],"single source material required: "+o.name)
    m=o.data.materials[0]
    p=next((n for n in m.node_tree.nodes if n.type=="BSDF_PRINCIPLED"),None) if m.node_tree else None
    color=list(p.inputs["Base Color"].default_value)[:3] if p else list(m.diffuse_color)[:3]
    return {"name":m.name,"rgb":rounded(color),"baseColorLinked":bool(p and p.inputs["Base Color"].is_linked),"roughness":float(p.inputs["Roughness"].default_value) if p else None,"metallic":float(p.inputs["Metallic"].default_value) if p else None}
for i,o in enumerate(selected):
    evaluated=o.evaluated_get(dg); mesh=evaluated.to_mesh()
    try:
        world=[o.matrix_world @ v.co for v in mesh.vertices]
        require(len(world)>0,"empty mesh")
        ext=[max(v[j] for v in world)-min(v[j] for v in world) for j in range(3)]
        inventory.append({"alias":"AtlasMesh%03d"%i,"name":o.name,"vertices":len(mesh.vertices),"faces":len(mesh.polygons),"worldExtent":sorted(rounded(ext)),"sourceMatrix":[rounded(r) for r in o.matrix_world],"material":material(o)})
    finally:evaluated.to_mesh_clear()
camera=s.camera
manifest={"schema":"atlas.engine01.sample/v1","status":"PENDING","masterSha256":expected,"sourceRevision":os.environ["ATLAS_EXACT_HEAD"],"objects":inventory,"camera":{"alias":"AtlasCamera","name":camera.name,"matrix":[rounded(r) for r in camera.matrix_world],"lens":camera.data.lens,"clip":[camera.data.clip_start,camera.data.clip_end]},"resolution":[480,300],"scope":"Geometry/camera sample and explicit diffuse material proxies. Glazing, landscape, portal signage, ALS cards and other bays excluded; no claim of full material or lighting equivalence.","masterModified":False,"publishable":False,"studentAuthorized":False}
write(out/"sample.json",manifest)
# Render the actual subset with original source materials and scene lights.
keep=set(selected)
for o in s.objects:
    if o.type=="MESH" and o not in keep: o.hide_render=True
s.render.engine="CYCLES";s.cycles.device="CPU";s.cycles.samples=16
s.cycles.seed=0;s.cycles.use_animated_seed=False
s.render.threads_mode="FIXED";s.render.threads=2
s.render.resolution_x=480;s.render.resolution_y=300;s.render.resolution_percentage=100
s.render.image_settings.file_format="PNG";s.render.filepath=str(out/"blender-reference.png")
bpy.ops.render.render(write_still=True)
require((out/"blender-reference.png").is_file(),"missing Blender source render")
# Rename only the in-memory export objects to stable USD-safe IDs.
bpy.ops.object.select_all(action="DESELECT")
for o,row in zip(selected,inventory):
    o.name=row["alias"];o.data=o.data.copy();o.data.name=row["alias"]+"_mesh"
    o.hide_set(False);o.select_set(True)
camera.name="AtlasCamera";camera.data=camera.data.copy();camera.data.name="AtlasCamera_data";camera.hide_set(False);camera.select_set(True)
bpy.context.view_layer.objects.active=camera
kwargs={"filepath":str(out/"atlas-sample.usdc"),"selected_objects_only":True,"export_animation":False,"export_materials":False,"export_cameras":True,"export_lights":False}
properties=bpy.ops.wm.usd_export.get_rna_type().properties
require(all(k in properties for k in kwargs),"USD exporter contract changed")
result=bpy.ops.wm.usd_export(**kwargs)
require("FINISHED" in result and (out/"atlas-sample.usdc").stat().st_size>0,"USD export failed")
require(sha(master)==expected,"master changed")
manifest.update(status="EXPORTED",usdSha256=sha(out/"atlas-sample.usdc"),blenderImageSha256=sha(out/"blender-reference.png"))
write(out/"sample.json",manifest)
print("ENGINE01_P1_EXPORT",len(inventory),"objects",flush=True)
