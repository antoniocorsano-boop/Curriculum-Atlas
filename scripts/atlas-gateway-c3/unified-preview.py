"""SP-07.1: one adaptive draft preview with separate proposal identity.

Do not impersonate a canonical SP-05 receipt or authorize qualification.
"""
import importlib.util,json,sys
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
        "selectedImages":selected,"seconds":r["totalSeconds"]}
def verify(out):
    assert set(x.name for x in out.iterdir())=={"cycle","atrium.png","vertical.png","unified-receipt.json"}
    photo.verify(out/"cycle",False)
    r=json.loads((out/"unified-receipt.json").read_text())
    assert r==summary(out) and r["sceneBuilds"]==1
    for n in VIEWS:
        assert pv.image_record(out/(n+".png"))==r["selectedImages"][n]
    assert r["status"]=="ADAPTIVE_PREVIEW_ONLY" and not any(r[k] for k in ("qualified","publishable","studentAuthorized","visualAcceptance","canonicalReviewReceipt"))
    print("SP-07.1 unified preview:",json.dumps({k:r[k] for k in ("result","sceneBuilds","renderCount","geometryAttempts","photometricAttempts","selectedRecipes","changedFromCanonical","estimatedMaterialGroups","seconds")}),flush=True)
def produce(out):
    assert out.parent.is_dir() and not out.exists()
    out.mkdir()
    photo.produce(out/"cycle",False)
    r=summary(out)
    for n in VIEWS:
        (out/(n+".png")).write_bytes((out/"cycle"/f"attempt-{r['selectedAttempt']}-{n}.png").read_bytes())
    (out/"unified-receipt.json").write_text(json.dumps(r,indent=2)+"\n")
    verify(out)
if __name__=="__main__":
    args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:]
    if args==["--selftest"]:
        compile(photo.transform(False),str(photo.CANDIDATE),"exec")
        print("SP-07.1 unified adapter compile PASS; real Blender evidence separate")
    else:
        assert len(args)==2 and args[0] in ("produce","verify")
        {"produce":produce,"verify":verify}[args[0]](Path(args[1]).resolve())
