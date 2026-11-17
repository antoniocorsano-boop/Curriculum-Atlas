"""SP-07.1: one adaptive draft preview with separate proposal identity.

Do not impersonate a canonical SP-05 receipt or authorize qualification.
"""
import importlib.util,json,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location("photometric_preview",HERE/"photometric-preview.py")
photo=importlib.util.module_from_spec(spec);spec.loader.exec_module(photo)
pv=photo.preview
VIEWS=("atrium","vertical")
def summary(out):
    cycle=out/"cycle"
    r=json.loads((cycle/"photometric-receipt.json").read_text())
    assert r["scenario"]=="baseline" and r["faultSid"] is None and r["selectedFault"] is None
    p,_=photo.pm.policy()
    materials=r["selectedMaterials"]
    changed=[s for s in photo.pm.IDS if materials[s]!=photo.pm.recipe(p,s,"base")]
    groups={json.dumps(q,sort_keys=True) for q in materials.values()}
    # The shared orbit/trajectory material is separate; estimate groups, not measured GLB primitives.
    groups_estimate=len(groups)+1
    selected={n:pv.image_record(cycle/f"attempt-{r['selectedAttempt']}-{n}.png") for n in VIEWS}
    return {"schemaVersion":1,"status":"ADAPTIVE_PREVIEW_ONLY","result":r["status"],"qualified":False,"publishable":False,"studentAuthorized":False,"visualAcceptance":False,"canonicalReviewReceipt":False,
        "candidateIdentity":r["identity"],"adaptiveSourceSha256":r["experimentSourceSha256"],"unifiedAdapterSha256":pv.sha(Path(__file__).read_bytes()),"cycleReceiptSha256":pv.sha((cycle/"photometric-receipt.json").read_bytes()),
        "dependencyHashes":r["dependencyHashes"],"artQuality":r["artQuality"],"sceneBuilds":r["sceneBuilds"],"renderCount":r["renderCount"],"geometryAttempts":r["artEvidence"]["identityStudy"]["selectedAttempt"],
        "photometricAttempts":len(r["attempts"]),"selectedAttempt":r["selectedAttempt"],"selectedRecipes":r["selectedRecipes"],"selectedMaterials":materials,"changedFromCanonical":changed,
        "estimatedMaterialGroups":groups_estimate,"withinCanonicalThreeGroupBudgetEstimate":groups_estimate<=3,"requiresCanonicalMaterialConsolidation":bool(changed),
        "selectedImages":selected,"reviewImages":r["reviewImages"],"reviewRenderCount":r["reviewRenderCount"],"totalRenderCount":r["renderCount"]+r["reviewRenderCount"],"seconds":r["totalSeconds"]}
def verify(out):
    assert set(x.name for x in out.iterdir())=={"cycle","atrium.png","vertical.png","unified-receipt.json"}
    photo.verify(out/"cycle",False)
    r=json.loads((out/"unified-receipt.json").read_text())
    assert r==summary(out) and r["sceneBuilds"]==1 and r["reviewRenderCount"]==6 and r["totalRenderCount"]<=14
    for n in VIEWS:
        assert pv.image_record(out/(n+".png"))==r["selectedImages"][n]
    assert r["status"]=="ADAPTIVE_PREVIEW_ONLY" and not any(r[k] for k in ("qualified","publishable","studentAuthorized","visualAcceptance","canonicalReviewReceipt"))
    print("SP-07.1 unified preview:",json.dumps({k:r[k] for k in ("result","sceneBuilds","renderCount","reviewRenderCount","totalRenderCount","geometryAttempts","photometricAttempts","selectedRecipes","changedFromCanonical","estimatedMaterialGroups","seconds")}),flush=True)
def produce(out):
    assert out.parent.is_dir() and not out.exists()
    root=photo.resource_directory(out)
    out.mkdir()
    photo.produce(out/"cycle",False,resource_root=root)
    r=summary(out)
    for n in VIEWS:
        (out/(n+".png")).write_bytes((out/"cycle"/f"attempt-{r['selectedAttempt']}-{n}.png").read_bytes())
    (out/"unified-receipt.json").write_text(json.dumps(r,indent=2)+"\n")
    verify(out)
if __name__=="__main__":
    args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:]
    if len(args)==2 and args[0]=="--identity-probe":
        path=Path(args[1]);assert not path.exists()
        path.write_text(json.dumps(photo.identity_probe(),sort_keys=True,indent=2)+"\n")
        print("SP-07.2 identity probe written",flush=True)
    elif args==["--selftest"]:
        compile(photo.transform(False),str(photo.CANDIDATE),"exec")
        # Reproduce the nested layout that previously failed before Blender loaded.
        with tempfile.TemporaryDirectory() as td:
            root=Path(td);dest=root/"atlas-unified-preview";dest.mkdir();cycle=dest/"cycle"
            for name in photo.RESOURCE_FILES:
                f=root/name;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b"fixture")
            assert photo.resource_directory(dest)==root
            assert photo.resource_directory(cycle,root)==root
            try:photo.resource_directory(cycle)
            except ValueError as e:assert "Missing Blender input resources" in str(e)
            else:raise AssertionError("Nested evidence destination accepted as input root")
            with tempfile.TemporaryDirectory(prefix="atlas-photometry-",dir=photo.resource_directory(cycle,root)) as scratch:
                assert Path(scratch).parent==root
            (root/"atlas-c32b/ao-manifest.json").unlink()
            try:photo.resource_directory(cycle,root)
            except ValueError as e:assert "atlas-c32b/ao-manifest.json" in str(e)
            else:raise AssertionError("Missing manifest accepted")
        print("SP-07.1 unified adapter compile and resource-path regression PASS; real Blender evidence separate")
    else:
        assert len(args)==2 and args[0] in ("produce","verify")
        {"produce":produce,"verify":verify}[args[0]](Path(args[1]).resolve())
