"""SP-06.3: isolated in-memory Blender reuse experiment, no qualification."""
import ast,hashlib,importlib.util,json,sys,tempfile,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import adaptive_identity,knowledge_composition
spec=importlib.util.spec_from_file_location("smart_preview",HERE/"smart-preview.py")
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
CANDIDATE=HERE/"library-master-knowledge-stars.py"
INJECT=r'''
# SP-06.3: one built scene, local mesh changes only, no export or save.
from array import array
import time as _reuse_time
import hashlib as _reuse_hash
import json as _reuse_json
_reuse_started=_reuse_time.monotonic()
_reuse_core={sid:bpy.data.objects["Knowledge core "+sid] for sid in ("storie","laboratori","scoperte","percorsi")}
_reuse_cfg=composition["identityEvidence"]
_reuse_before=_reuse_cfg["attempts"][-2]["scales"]
_reuse_after=_reuse_cfg["selectedScales"]
_reuse_changed=[sid for sid in _reuse_core if _reuse_before[sid]!=_reuse_after[sid]]
assert _reuse_changed==["laboratori","scoperte"]
def _reuse_fingerprint():
    h=_reuse_hash.sha256();meshes={};objects=[]
    excluded={_reuse_core[s].name for s in _reuse_changed}
    for obj in sorted(scene.objects,key=lambda o:o.name):
        if obj.name in excluded:continue
        data=obj.data
        item=[obj.name,obj.type,tuple(float(x) for row in obj.matrix_world for x in row),bool(obj.hide_render)]
        if data is not None:item.append(data.name)
        if obj.type=="MESH":
            pointer=data.as_pointer()
            if pointer not in meshes:
                d=_reuse_hash.sha256()
                v=array("f",[0.0])*(3*len(data.vertices));data.vertices.foreach_get("co",v);d.update(v.tobytes())
                l=array("i",[0])*len(data.loops);data.loops.foreach_get("vertex_index",l);d.update(l.tobytes())
                p=array("i",[0])*len(data.polygons);data.polygons.foreach_get("loop_total",p);d.update(p.tobytes())
                d.update(_reuse_json.dumps([m.name for m in data.materials]).encode())
                meshes[pointer]=d.hexdigest()
            item.append(meshes[pointer]);item.append([s.material.name if s.material else None for s in obj.material_slots])
        elif obj.type=="LIGHT":item.extend([float(data.energy),list(data.color),data.type])
        elif obj.type=="CAMERA":item.extend([float(data.lens),float(data.clip_end)])
        objects.append(item)
    h.update(_reuse_json.dumps(objects,sort_keys=True).encode())
    return {"digest":h.hexdigest(),"objects":len(objects),"uniqueMeshes":len(meshes)}
def _reuse_replace(sid,shape):
    obj=_reuse_core[sid];old=obj.data
    center=Vector(next(q["positionBlender"] for q in star_records if q["id"]==sid))
    d=bpy.data.meshes.new("SP06 reuse "+sid)
    d.from_pydata([tuple(center+Vector(p)) for p in shape["vertices"]],[],shape["faces"])
    d.update()
    for material in old.materials:d.materials.append(material)
    obj.data=d
    if old.users==0:bpy.data.meshes.remove(old)
def _reuse_geometry(sid):
    d=_reuse_core[sid].data
    h=_reuse_hash.sha256()
    v=array("f",[0.0])*(3*len(d.vertices));d.vertices.foreach_get("co",v);h.update(v.tobytes())
    l=array("i",[0])*len(d.loops);d.loops.foreach_get("vertex_index",l);h.update(l.tobytes())
    return h.hexdigest()
_reuse_original={sid:_reuse_geometry(sid) for sid in _reuse_core}
_reuse_prior_meshes=__PRIOR_MESHES__
for _sid in _reuse_changed:_reuse_replace(_sid,_reuse_prior_meshes[_sid])
bpy.context.view_layer.update()
_reuse_scene_before=_reuse_fingerprint()
_reuse_prior={sid:_reuse_geometry(sid) for sid in _reuse_core}
_reuse_path=scene.render.filepath
scene.render.filepath=str(out/"before.png")
_reuse_t0=_reuse_time.monotonic()
bpy.ops.render.render(write_still=True)
_reuse_first=_reuse_time.monotonic()-_reuse_t0
_reuse_t1=_reuse_time.monotonic()
for _sid in _reuse_changed:_reuse_replace(_sid,composition["identityMeshes"][_sid])
bpy.context.view_layer.update()
_reuse_update=_reuse_time.monotonic()-_reuse_t1
_reuse_scene_after=_reuse_fingerprint()
_reuse_final={sid:_reuse_geometry(sid) for sid in _reuse_core}
assert _reuse_scene_before==_reuse_scene_after and _reuse_original==_reuse_final
assert [sid for sid in _reuse_core if _reuse_prior[sid]!=_reuse_final[sid]]==_reuse_changed
scene.render.filepath=str(out/"after.png")
_reuse_t2=_reuse_time.monotonic()
bpy.ops.render.render(write_still=True)
_reuse_second=_reuse_time.monotonic()-_reuse_t2
scene.render.filepath=_reuse_path
_reuse_receipt={"status":"EXPERIMENT_ONLY","qualified":False,"publishable":False,"studentAuthorized":False,"sceneBuilds":1,"renderCount":2,"changedCores":_reuse_changed,"unchangedSceneBefore":_reuse_scene_before,"unchangedSceneAfter":_reuse_scene_after,"coreBefore":_reuse_prior,"coreAfter":_reuse_final,"canonicalCore":_reuse_original,"firstRenderSeconds":_reuse_first,"meshUpdateSeconds":_reuse_update,"secondRenderSeconds":_reuse_second,"experimentSeconds":_reuse_time.monotonic()-_reuse_started}
(out/"reuse-experiment.json").write_text(_reuse_json.dumps(_reuse_receipt,indent=2)+"\n")
'''

def transform():
    code=preview.transform(preview.resolve(CANDIDATE))
    plan,_,_=knowledge_composition.load()
    p,_=adaptive_identity.read_policy();r=adaptive_identity.solve(plan)
    assert r["status"]=="PASS" and len(r["attempts"])>=2
    earlier=r["attempts"][-2]["scales"]
    prior={}
    for sid in p["ids"]:
        v,f=adaptive_identity.geometry(sid,earlier[sid],p["halfThicknessM"])
        prior[sid]={"vertices":[list(q) for q in v],"faces":[list(q) for q in f]}
    code=preview.once(code,'star_objects=merge_group(star_objects,"Knowledge stars")\nassert len(star_objects)==3','# SP-06.3 only: retain editable core objects; no export in this experiment.\nassert len(star_objects)>3')
    # Use one normal atrium camera; inject two renders and terminate before the other views.
    anchor='    bpy.ops.render.render(write_still=True)\n'
    assert code.count(anchor)==1
    pos=code.index(anchor)
    code=code[:pos]+''.join('    '+line+'\n' if line else '\n' for line in INJECT.replace("__PRIOR_MESHES__",repr(prior)).splitlines())+'    break\n'
    ast.parse(code)
    assert "export_scene.gltf" not in code and "save_as_mainfile" not in code
    return code

def verify(out):
    assert set(p.name for p in out.iterdir())=={"before.png","after.png","reuse-experiment.json"}
    r=json.loads((out/"reuse-experiment.json").read_text())
    assert r["status"]=="EXPERIMENT_ONLY" and not any(r[k] for k in ("qualified","publishable","studentAuthorized"))
    assert r["sceneBuilds"]==1 and r["renderCount"]==2 and r["changedCores"]==["laboratori","scoperte"]
    assert r["unchangedSceneBefore"]==r["unchangedSceneAfter"] and r["coreAfter"]==r["canonicalCore"]
    assert r["unchangedSceneBefore"]["objects"]>490
    assert r["identity"]==preview.identity(CANDIDATE)
    assert r["experimentSourceSha256"]==preview.sha(transform().encode())
    for name in ("before","after"):
        assert preview.image_record(out/(name+".png"))==r["images"][name]
        assert r["images"][name]["dimensions"]==[600,375]
    assert r["images"]["before"]["sha256"]!=r["images"]["after"]["sha256"]
    assert all(r[k]>0 for k in ("firstRenderSeconds","meshUpdateSeconds","secondRenderSeconds","experimentSeconds","totalSeconds"))
    print("SP-06.3 reuse evidence verified:",json.dumps(r,separators=(",",":")),flush=True)

def produce(out):
    assert out.parent.is_dir() and not out.exists()
    started=time.monotonic();code=transform()
    with tempfile.TemporaryDirectory(prefix="atlas-incremental-",dir=out.parent) as scratch:
        old=sys.argv
        try:
            sys.argv=[str(CANDIDATE),"--",scratch]
            exec(compile(code,str(CANDIDATE),"exec"),{"__file__":str(CANDIDATE),"__name__":"__atlas_incremental__"})
        finally:sys.argv=old
        scratch=Path(scratch);assert not list(scratch.glob("*.glb")) and not list(scratch.glob("*.blend"))
        out.mkdir()
        for n in ("before.png","after.png"):(out/n).write_bytes((scratch/n).read_bytes())
        r=json.loads((scratch/"reuse-experiment.json").read_text())
        r.update({"identity":preview.identity(CANDIDATE),"experimentSourceSha256":preview.sha(code.encode()),"images":{n:preview.image_record(out/(n+".png")) for n in ("before","after")},"totalSeconds":time.monotonic()-started})
        (out/"reuse-experiment.json").write_text(json.dumps(r,indent=2)+"\n")
    verify(out)

if __name__=="__main__":
    args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:]
    if args==["--selftest"]:
        compile(transform(),str(CANDIDATE),"exec");print("SP-06.3 adapter compile PASS")
    else:
        assert len(args)==2 and args[0] in ("produce","verify")
        {"produce":produce,"verify":verify}[args[0]](Path(args[1]).resolve())
