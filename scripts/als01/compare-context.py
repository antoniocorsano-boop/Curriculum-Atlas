"""ALS-01 R2: compare exact R2 library without and with shared optical points."""
import bpy,hashlib,importlib.util,json,sys,math
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent
LIB=HERE.parent/"atlas-gateway-c3"
sys.path.insert(0,str(LIB))
spec=importlib.util.spec_from_file_location("atlas_smart_preview",LIB/"smart-preview.py")
pv=importlib.util.module_from_spec(spec);spec.loader.exec_module(pv)
candidate=LIB/"library-master-knowledge-stars.py"
module,sample_path,out=map(lambda p:Path(p).resolve(),sys.argv[sys.argv.index("--")+1:])
static_sample=json.loads(sample_path.read_text())
composition=json.loads((LIB/"knowledge-composition.json").read_text())
assert static_sample["optics"]["revision"]=="ALS-01-R4"
assert [a["center"]+[a["radius"]] for a in static_sample["anchors"]]==composition["layouts"]["A"]
adapter_spec=importlib.util.spec_from_file_location("als01_blender",HERE/"blender-adapter.py")
adapter=importlib.util.module_from_spec(adapter_spec);adapter_spec.loader.exec_module(adapter)
assert not out.exists()
digest=hashlib.sha256(module.read_bytes()).hexdigest()
receipt=json.loads((module.parent/"receipt.json").read_text())
assert receipt["revision"]=="ART-FINAL-R2" and receipt["moduleSha256"]==digest
assert receipt["bytes"]==module.stat().st_size and receipt["vertices"]<=18000 and receipt["primitives"]==3
assert digest=="684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0"
for p in ("atlas-c32/campata.blend","atlas-c32/manifest.json","atlas-c32b/campata-ao.glb","atlas-c32b/ao-manifest.json"):
    assert (out.parent/p).is_file(),p
source=pv.transform(pv.resolve(candidate))
source=pv.once(source,"scene.cycles.samples=12","scene.cycles.samples=24")
source=pv.once(source,"scene.render.resolution_percentage=50","scene.render.resolution_percentage=100")
hook="""
# Existing canonical objects remain available for the control render.
canonical_stars=list(star_objects)
for o in canonical_stars:o.hide_render=True
before=set(scene.objects)
bpy.ops.import_scene.gltf(filepath=__MODULE__)
new_objects=list(set(scene.objects)-before)
new_stars=[o for o in new_objects if o.type=="MESH"]
assert len(new_stars)==3
counts={q["id"]:0 for q in star_records}
for o in new_stars:
    assert len(o.data.materials)==1
    name=o.data.materials[0].name
    if name.startswith("Knowledge star satin orbit"):continue
    assert name.startswith(("Knowledge finish warm","Knowledge finish cool")),name
    for v in o.data.vertices:
        point=o.matrix_world@v.co
        q=min(star_records,key=lambda q:(point-Vector(q["positionBlender"])).length)
        assert (point-Vector(q["positionBlender"])).length<=q["radiusBound"]+.003
        assert name.startswith("Knowledge finish warm")== (q["id"] in ("storie","scoperte"))
        counts[q["id"]]+=1
assert all(n>=100 for n in counts.values()),counts
als_points=als_adapter.make_points(scene,als_sample)
als_projection={}
"""
source=pv.once(source,"assert len(star_objects)==3","assert len(star_objects)==3\n"+hook.replace("__MODULE__",repr(str(module))))
render="""
    als_projection[name]=als_adapter.position_points(scene,scene.camera,als_points,als_sample["views"][name],als_composition["protected"][name])
    for o,p in als_points:o.hide_render=True
    scene.render.filepath=str(out/("baseline-"+name+".png"))
    bpy.ops.render.render(write_still=True)
    for o,p in als_points:o.hide_render=False
    scene.render.filepath=str(out/("candidate-"+name+".png"))
    bpy.ops.render.render(write_still=True)
    for o,p in als_points:o.hide_render=True
"""
source=pv.once(source,"    bpy.ops.render.render(write_still=True)",render)
source+="""
assert set(star_projection)=={"atrium","vertical"}
(out/"context-projection.json").write_text(json.dumps({"projection":star_projection,"connectionProjection":connection_projection,"verticesByCore":counts,"als":als_projection},indent=2))
"""
compile(source,str(candidate),"exec")
old=sys.argv
try:
    sys.argv=[str(candidate),"--",str(out)]
    exec(compile(source,str(candidate),"exec"),{"__file__":str(candidate),"__name__":"__als01_context__","als_adapter":adapter,"als_sample":static_sample,"als_composition":composition})
finally:sys.argv=old
files={}
for view,dims in (("atrium",[1200,750]),("vertical",[640,960])):
    for kind in ("baseline","candidate"):
        name=kind+"-"+view+".png";r=pv.image_record(out/name)
        assert r["dimensions"]==dims
        files[name]=r
projection=json.loads((out/"context-projection.json").read_text())
assert set(projection["projection"])=={"atrium","vertical"}
assert set(projection["als"])=={"atrium","vertical"} and all(len(v)==18 for v in projection["als"].values())
assert files["baseline-atrium.png"]["sha256"]!=files["candidate-atrium.png"]["sha256"]
assert files["baseline-vertical.png"]["sha256"]!=files["candidate-vertical.png"]["sha256"]
assert not list(out.glob("*.blend")) and not list(out.glob("*.glb"))
receipt={"status":"ALS01_CONTEXT_COMPARISON_ONLY","moduleSha256":digest,"sceneIdentity":pv.identity(candidate),"effectiveComparisonSourceSha256":pv.sha(source.encode()),"files":files,"projection":projection,"renderCount":4,"samples":24,"sameScene":True,"architectureChanged":False,"camerasChanged":False,"lightingChanged":False,"navigationChanged":False,"baseline":"ART-FINAL-R2 same geometry without ALS","staticSampleSha256":hashlib.sha256(sample_path.read_bytes()).hexdigest(),"opticalRevision":"ALS-01-R4","resolvedOptics":static_sample["views"],"points":18,"physicalLightsAdded":0,"rendererParityClaimed":False,"artisticApproval":False,"runtimeQualified":False,"studentAuthorized":False,"publishable":False}
(out/"als01-context-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
print("ALS01_CONTEXT_COMPARISON_ONLY",json.dumps(receipt),flush=True)
