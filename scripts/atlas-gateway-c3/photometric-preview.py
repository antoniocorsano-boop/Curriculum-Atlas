"""SP-06.4: isolated photometric loop within a single built Blender scene."""
import ast,importlib.util,json,sys,tempfile,time
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import photometry as pm
import adaptive_identity,knowledge_composition,art_quality
spec=importlib.util.spec_from_file_location("smart_preview",HERE/"smart-preview.py")
preview=importlib.util.module_from_spec(spec);spec.loader.exec_module(preview)
CANDIDATE=HERE/"library-master-knowledge-stars.py"
INJECT=r'''
# SP-06.4: compare against core-free reference; adapt only local materials.
import photometry as _pm
import adaptive_identity as _ai
import knowledge_composition as _kc
from array import array
import time as _pt
import hashlib as _ph
import json as _pj
_p,_pd=_pm.policy()
_fault_sid=__FAULT_SID__
_plan,_,_=_kc.load()
_identity=_ai.solve(_plan)
assert _identity["status"]=="PASS"
_core={sid:bpy.data.objects["Knowledge core "+sid] for sid in _pm.IDS}
assert all(not o.hide_render and len(o.data.materials)==1 for o in _core.values())
def _fingerprint():
    h=_ph.sha256();meshes={};records=[]
    for o in sorted(scene.objects,key=lambda q:q.name):
        d=o.data;rec=[o.name,o.type,tuple(float(x) for row in o.matrix_world for x in row),bool(o.hide_render)]
        if d is not None:rec.append(d.name)
        if o.type=="MESH":
            key=d.as_pointer()
            if key not in meshes:
                dig=_ph.sha256()
                for items,attr,typ,n in ((d.vertices,"co","f",3*len(d.vertices)),(d.loops,"vertex_index","i",len(d.loops)),(d.polygons,"loop_total","i",len(d.polygons))):
                    ar=array(typ,[0])*n;items.foreach_get(attr,ar);dig.update(ar.tobytes())
                meshes[key]=dig.hexdigest()
            rec.append(meshes[key])
            if o not in _core.values():rec.append([s.material.name if s.material else None for s in o.material_slots])
        elif o.type=="LIGHT":rec.extend([d.type,float(d.energy),list(d.color)])
        elif o.type=="CAMERA":rec.extend([float(d.lens),float(d.clip_end)])
        records.append(rec)
    h.update(_pj.dumps(records,sort_keys=True).encode())
    # Include original material scalar/color inputs; exclude only the new local copies.
    mats=[]
    for m in sorted(bpy.data.materials,key=lambda q:q.name):
        if m.name.startswith("SP06 photometric "):continue
        if m.use_nodes:
            p=m.node_tree.nodes.get("Principled BSDF")
            if p:
                mats.append([m.name,[(k,list(p.inputs[k].default_value) if k in ("Base Color","Emission Color") else float(p.inputs[k].default_value)) for k in ("Base Color","Emission Color","Emission Strength","Metallic","Roughness")]])
    h.update(_pj.dumps(mats,sort_keys=True).encode())
    return {"sha256":h.hexdigest(),"objects":len(records),"uniqueMeshes":len(meshes),"materials":len(mats)}
def _read(mat):
    bs=mat.node_tree.nodes.get("Principled BSDF")
    return {"color":list(bs.inputs["Base Color"].default_value)[:3],"emission":float(bs.inputs["Emission Strength"].default_value),"roughness":float(bs.inputs["Roughness"].default_value),"metallic":float(bs.inputs["Metallic"].default_value)}
def _same(a,b):
    return all(abs(x-y)<1e-5 for x,y in zip(a["color"],b["color"])) and all(abs(a[k]-b[k])<1e-5 for k in ("emission","roughness","metallic"))
_before=_fingerprint()
for sid,o in _core.items():
    original=o.data.materials[0]
    assert _same(_read(original),_pm.recipe(_p,sid,"base"))
    copy=original.copy();copy.name="SP06 photometric "+sid;o.data.materials[0]=copy
def _set_fault(enabled):
    if _fault_sid is None:return
    m=_core[_fault_sid].data.materials[0];tree=m.node_tree
    output=next(n for n in tree.nodes if n.type=="OUTPUT_MATERIAL" and n.is_active_output)
    surface=output.inputs["Surface"];bs=tree.nodes.get("Principled BSDF")
    for link in list(surface.links):tree.links.remove(link)
    faulty=tree.nodes.get("SP07 injected transparent defect")
    if enabled:
        if faulty is None:
            faulty=tree.nodes.new("ShaderNodeBsdfTransparent");faulty.name="SP07 injected transparent defect"
        tree.links.new(faulty.outputs[0],surface)
    else:
        if faulty is not None:tree.nodes.remove(faulty)
        tree.links.new(bs.outputs["BSDF"],surface)
def _apply(sid,key):
    if sid==_fault_sid:_set_fault(False)
    q=_pm.recipe(_p,sid,key);m=_core[sid].data.materials[0];bs=m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*q["color"],1)
    bs.inputs["Emission Color"].default_value=(*q["color"],1)
    bs.inputs["Emission Strength"].default_value=q["emission"]
    bs.inputs["Roughness"].default_value=q["roughness"]
    bs.inputs["Metallic"].default_value=q["metallic"]
    assert _same(_read(m),q)
_times=[]
def _render_pair(prefix):
    for name in _pm.VIEWS:
        cam,w,h=_photo_cameras[name];scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
        scene.render.filepath=str(out/(prefix+"-"+name+".png"))
        start=_pt.monotonic()
        bpy.ops.render.render(write_still=True)
        _times.append({"file":prefix+"-"+name+".png","seconds":_pt.monotonic()-start})
for o in _core.values():o.hide_render=True
_render_pair("background")
for o in _core.values():o.hide_render=False
bpy.context.view_layer.update()
assert _fingerprint()==_before
_current=dict.fromkeys(_pm.IDS,"base")
_set_fault(True)
bpy.context.view_layer.update()
_attempts=[];_best=None;_updates=[]
for _index in range(1,_p["maxAttempts"]+1):
    _render_pair("attempt-%d"%_index)
    _record=_pm.evaluate(out,_index,_p,_plan,_identity)
    _record.update({"attempt":_index,"recipes":dict(_current),"injectedFault":_fault_sid if _index==1 else None})
    if _fault_sid is not None and _index==1:assert _record["failed"][_fault_sid],"SP-07: injected defect not detected"
    _attempts.append(_record)
    if _best is None or _pm.ranking(_record,_p)<_pm.ranking(_best,_p):_best=_record
    if _record["status"]=="PASS" or _index==_p["maxAttempts"]:break
    _next=_pm.advance(_current,_record,_p)
    _changed=[s for s in _pm.IDS if _next[s]!=_current[s]]
    if not _changed:break
    assert all(_record["failed"][s] for s in _changed)
    t=_pt.monotonic()
    for s in _changed:_apply(s,_next[s])
    bpy.context.view_layer.update()
    _updates.append({"fromAttempt":_index,"changed":_changed,"seconds":_pt.monotonic()-t})
    assert all(_same(_read(_core[s].data.materials[0]),_pm.recipe(_p,s,_next[s])) for s in _pm.IDS)
    assert _fingerprint()==_before
    _current=_next
# Restore the best measured configuration, not necessarily the final trial.
for s in _pm.IDS:
    if _current[s]!=_best["recipes"][s]:_apply(s,_best["recipes"][s])
_set_fault(_fault_sid is not None and _best["attempt"]==1)
bpy.context.view_layer.update()
_after=_fingerprint();assert _after==_before
assert all(_same(_read(_core[s].data.materials[0]),_pm.recipe(_p,s,_best["recipes"][s])) for s in _pm.IDS)
assert len(_times)==2+2*len(_attempts)<=_p["maxRenders"]
# SP-07.2: six bounded, non-qualifying review images of the selected state.
_review_times=[]
if _fault_sid is None:
    _saved=(scene.camera,scene.render.resolution_x,scene.render.resolution_y,scene.render.resolution_percentage,scene.render.filepath,scene.cycles.samples)
    scene.render.resolution_percentage=100;scene.cycles.samples=32
    def _review_render(name,cam,w,h):
        scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
        scene.render.filepath=str(out/(name+".png"))
        t=_pt.monotonic();bpy.ops.render.render(write_still=True)
        _review_times.append({"file":name+".png","seconds":_pt.monotonic()-t,"dimensions":[w,h]})
    for _name in _pm.VIEWS:
        _cam,_w,_h=_photo_cameras[_name]
        _review_render("review-"+_name,_cam,_w,_h)
    for _sid in _pm.IDS:
        _center=Vector(next(q["positionBlender"] for q in star_records if q["id"]==_sid))
        _direction=(_photo_cameras["atrium"][0].location-_center).normalized()
        # Near the principal sight line, modest lateral offset reveals relief.
        _direction=(_direction+Vector((.12,0,.04))).normalized()
        _data=bpy.data.cameras.new("SP072 review "+_sid)
        _camera=bpy.data.objects.new("SP072 review "+_sid,_data);scene.collection.objects.link(_camera)
        _camera.location=_center+3.3*_direction
        _camera.rotation_euler=(_center-_camera.location).to_track_quat("-Z","Y").to_euler()
        _data.lens=55;_data.clip_end=150
        _review_render("detail-"+_sid,_camera,512,512)
        scene.camera=_saved[0];bpy.data.objects.remove(_camera,do_unlink=True);bpy.data.cameras.remove(_data)
    scene.camera,scene.render.resolution_x,scene.render.resolution_y,scene.render.resolution_percentage,scene.render.filepath,scene.cycles.samples=_saved
    bpy.context.view_layer.update()
    assert _fingerprint()==_before and len(_review_times)==6
_photo_receipt={"status":"PASS" if _best["status"]=="PASS" else "EXHAUSTED","experimentOnly":True,"scenario":"fault-recovery" if _fault_sid else "baseline","faultSid":_fault_sid,"selectedFault":_best["injectedFault"],"qualified":False,"publishable":False,"studentAuthorized":False,"visualAcceptance":False,"sceneBuilds":1,"renderCount":len(_times),"policySha256":_pd,"attempts":_attempts,"selectedAttempt":_best["attempt"],"selectedRecipes":_best["recipes"],"selectedMaterials":{s:_pm.recipe(_p,s,_best["recipes"][s]) for s in _pm.IDS},"updates":_updates,"renderTimes":_times,"reviewRenderTimes":_review_times,"reviewRenderCount":len(_review_times),"sceneBefore":_before,"sceneAfter":_after}
(out/"photometric-receipt.json").write_text(_pj.dumps(_photo_receipt,indent=2)+"\n")
'''
def transform(fault=False):
    code=preview.transform(preview.resolve(CANDIDATE))
    code=preview.once(code,'star_objects=merge_group(star_objects,"Knowledge stars")\nassert len(star_objects)==3','# SP-06.4: editable local objects; no export.\nassert len(star_objects)>3')
    anchor='for i,(name,w,h,pos,target,lens) in enumerate(views):'
    code=preview.once(code,anchor,'_photo_cameras={}\n'+anchor)
    anchor='    bpy.ops.render.render(write_still=True)\n'
    assert code.count(anchor)==1
    pos=code.index(anchor)
    code=code[:pos]+'    _photo_cameras[name]=(cam,w,h)\n'+INJECT.replace('__FAULT_SID__',repr('laboratori' if fault else None))+'\n'+code[pos+len(anchor):]
    ast.parse(code)
    assert "export_scene.gltf" not in code and "save_as_mainfile" not in code
    return code
def dependency_hashes():
    return {n:preview.sha((HERE/n).read_bytes()) for n in ("photometric-preview.py","photometry.py","photometric-policy.json","star_sculpture.py","adaptive_identity.py","adaptive-identity.json","knowledge_composition.py","knowledge-composition.json","smart-preview.py","art_quality.py","art-direction.json")}
def verify(out,fault=False):
    r=json.loads((out/"photometric-receipt.json").read_text());p,pd=pm.policy()
    assert r["experimentOnly"] and not any(r[k] for k in ("qualified","publishable","studentAuthorized","visualAcceptance"))
    fault_sid="laboratori" if fault else None
    assert r["scenario"]==("fault-recovery" if fault else "baseline") and r["faultSid"]==fault_sid
    assert r["sceneBuilds"]==1 and r["sceneBefore"]==r["sceneAfter"] and r["sceneBefore"]["objects"]>490
    assert r["policySha256"]==pd,("policy hash mismatch",r["policySha256"],pd)
    expected_identity=preview.identity(CANDIDATE)
    assert r["identity"]==expected_identity,("candidate identity mismatch",r["identity"],expected_identity)
    assert r["artQuality"]==art_quality.evaluate(r["artEvidence"])
    assert r["artQuality"]["status"]=="PASS" and len(r["artQuality"]["checks"])==13
    expected_source=preview.sha(transform(fault).encode())
    assert r["experimentSourceSha256"]==expected_source,("adaptive source mismatch",r["experimentSourceSha256"],expected_source)
    expected_deps=dependency_hashes()
    assert r["dependencyHashes"]==expected_deps,("dependency mismatch",[k for k in expected_deps if r["dependencyHashes"].get(k)!=expected_deps[k]])
    assert 1<=len(r["attempts"])<=p["maxAttempts"] and r["renderCount"]==2+2*len(r["attempts"])<=p["maxRenders"]
    names={f"background-{v}.png" for v in pm.VIEWS}|{f"attempt-{i}-{v}.png" for i in range(1,len(r["attempts"])+1) for v in pm.VIEWS}
    review_dims={} if fault else {"review-atrium.png":[1200,750],"review-vertical.png":[640,960],**{"detail-"+s+".png":[512,512] for s in pm.IDS}}
    assert set(x.name for x in out.iterdir())==names|set(review_dims)|{"photometric-receipt.json"} and set(r["images"])==names and set(r["reviewImages"])==set(review_dims)
    assert r["reviewRenderCount"]==len(review_dims)==len(r["reviewRenderTimes"]) and r["renderCount"]+r["reviewRenderCount"]<=14
    assert {q["file"]:q["dimensions"] for q in r["reviewRenderTimes"]}==review_dims and all(q["seconds"]>0 for q in r["reviewRenderTimes"])
    for n in names:assert preview.image_record(out/n)==r["images"][n]
    for n,dims in review_dims.items():assert preview.image_record(out/n)==r["reviewImages"][n] and r["reviewImages"][n]["dimensions"]==dims
    plan,_,_=knowledge_composition.load();result=adaptive_identity.solve(plan);current=dict.fromkeys(pm.IDS,"base")
    assert result["status"]=="PASS"
    for i,record in enumerate(r["attempts"],1):
        expected=pm.evaluate(out,i,p,plan,result);expected.update({"attempt":i,"recipes":current,"injectedFault":fault_sid if i==1 else None})
        assert record==expected
        if i<len(r["attempts"]):
            assert record["status"]=="REVISE"
            new=pm.advance(current,record,p);assert new!=current
            assert r["updates"][i-1]["fromAttempt"]==i and r["updates"][i-1]["changed"]==[s for s in pm.IDS if new[s]!=current[s]] and r["updates"][i-1]["seconds"]>0
            current=new
    last=r["attempts"][-1];assert last["status"]=="PASS" or len(r["attempts"])==p["maxAttempts"] or pm.advance(current,last,p)==current
    assert len(r["updates"])==len(r["attempts"])-1
    best=min(r["attempts"],key=lambda q:pm.ranking(q,p))
    assert r["selectedAttempt"]==best["attempt"] and r["selectedRecipes"]==best["recipes"] and r["selectedFault"]==best["injectedFault"]
    if fault:
        assert r["attempts"][0]["failed"][fault_sid] and len(r["attempts"])>=2
        assert fault_sid in r["updates"][0]["changed"]
        assert all(s in r["attempts"][0]["failed"] and r["attempts"][0]["failed"][s] for s in r["updates"][0]["changed"])
        # A successfully executed experiment can exhaust its budget; never auto-promote.
    assert r["status"]==("PASS" if best["status"]=="PASS" else "EXHAUSTED")
    assert r["selectedMaterials"]=={s:pm.recipe(p,s,best["recipes"][s]) for s in pm.IDS}
    assert len(r["renderTimes"])==len(names) and {q["file"] for q in r["renderTimes"]}==names and all(q["seconds"]>0 for q in r["renderTimes"])
    assert r["totalSeconds"]>0
    print("SP-06.4 verified:",json.dumps({k:r[k] for k in ("status","sceneBuilds","renderCount","selectedAttempt","selectedRecipes","attempts","updates","renderTimes","totalSeconds")},separators=(",",":")),flush=True)
RESOURCE_FILES=("atlas-c32/campata.blend","atlas-c32/manifest.json","atlas-c32b/campata-ao.glb","atlas-c32b/ao-manifest.json")
def resource_directory(out,resource_root=None):
    # The legacy generator resolves inputs beside its temporary output directory.
    # The evidence destination may be nested independently of those inputs.
    root=(Path(resource_root) if resource_root is not None else out.parent).resolve()
    if not root.is_dir():raise ValueError("Missing Blender resource directory: "+str(root))
    missing=[name for name in RESOURCE_FILES if not (root/name).is_file()]
    if missing:raise ValueError("Missing Blender input resources: "+", ".join(missing))
    return root
def identity_probe():
    plan,_,_=knowledge_composition.load()
    result=adaptive_identity.solve(plan)
    assert result["status"]=="PASS"
    return {"identity":preview.identity(CANDIDATE),"adaptiveSourceSha256":preview.sha(transform(False).encode()),"dependencyHashes":dependency_hashes(),"geometry":adaptive_identity.evidence(result)}
def produce(out,fault=False,*,resource_root=None):
    assert out.parent.is_dir() and not out.exists()
    root=resource_directory(out,resource_root)
    started=time.monotonic();code=transform(fault)
    with tempfile.TemporaryDirectory(prefix="atlas-photometry-",dir=root) as scratch:
        old=sys.argv
        try:
            sys.argv=[str(CANDIDATE),"--",scratch]
            exec(compile(code,str(CANDIDATE),"exec"),{"__file__":str(CANDIDATE),"__name__":"__atlas_photometry__"})
        except Exception:
            # Preserve only expected preview images, even if scene execution fails.
            # No normal receipt is issued and the workflow remains failed.
            diagnostic=out.parent/"partial-cycle-diagnostics"
            diagnostic.mkdir(exist_ok=False)
            permitted={f"background-{v}.png" for v in pm.VIEWS}|{f"attempt-{i}-{v}.png" for i in range(1,4) for v in pm.VIEWS}|{"review-atrium.png","review-vertical.png",*{"detail-"+s+".png" for s in pm.IDS}}
            images={}
            for n in sorted(permitted):
                src=Path(scratch)/n
                if src.is_file() and not src.is_symlink():
                    (diagnostic/n).write_bytes(src.read_bytes())
                    images[n]={"bytes":src.stat().st_size,"sha256":preview.sha(src.read_bytes())}
            (diagnostic/"diagnostic.json").write_text(json.dumps({"status":"UNVERIFIED_PARTIAL_FAILURE","qualified":False,"publishable":False,"studentAuthorized":False,"visualAcceptance":False,"images":images},indent=2)+"\n")
            raise
        finally:sys.argv=old
        scratch=Path(scratch);assert not list(scratch.glob("*.glb")) and not list(scratch.glob("*.blend"))
        out.mkdir();r=json.loads((scratch/"photometric-receipt.json").read_text())
        names=[q["file"] for q in r["renderTimes"]]
        review_names=[q["file"] for q in r["reviewRenderTimes"]]
        for n in names+review_names:(out/n).write_bytes((scratch/n).read_bytes())
        study=json.loads((scratch/"knowledge-stars-study.json").read_text())
        evidence={k:study[k] for k in ("stars","projection","composition","connections","connectionProjection","identityStudy")}
        r.update({"artEvidence":evidence,"artQuality":art_quality.evaluate(evidence),"identity":preview.identity(CANDIDATE),"experimentSourceSha256":preview.sha(code.encode()),"dependencyHashes":dependency_hashes(),"images":{n:preview.image_record(out/n) for n in names},"reviewImages":{n:preview.image_record(out/n) for n in review_names},"totalSeconds":time.monotonic()-started})
        (out/"photometric-receipt.json").write_text(json.dumps(r,indent=2)+"\n")
    verify(out,fault)
if __name__=="__main__":
    args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:]
    if args==["--selftest"]:
        pm.selftest();compile(transform(),str(CANDIDATE),"exec");compile(transform(True),str(CANDIDATE),"exec");print("SP-07 baseline and fault adapters compile PASS")
    else:
        assert len(args) in (2,3) and args[0] in ("produce","verify") and (len(args)==2 or args[2]=="--fault")
        {"produce":produce,"verify":verify}[args[0]](Path(args[1]).resolve(),len(args)==3)
