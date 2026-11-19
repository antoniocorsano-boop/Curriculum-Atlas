"""AWC-E: package the verified dual derivation as a provenance manifest.
A fixed laboratory pipeline, not a deployable scene or arbitrary tool runner.
"""
import argparse,hashlib,importlib.util,json,math,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("lab",ROOT/"scripts/atlas-world-lab-variation.py")
lab=importlib.util.module_from_spec(spec);spec.loader.exec_module(lab)
need=lab.require
D_ARTIFACT=14558434125
D_ARCHIVE_SHA="2e196875a1f913959e2dcc7c7e2550fd2d7affe5520428a0496d5aa82e695b28"
D_REVISION="c62fc46a1b699bffe3f052b107376fa97fbbd3ab"
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return lab.awc.ev.strict_json(p.read_bytes())
def build(p,prior,master,revision):
    need(sha(prior)==D_ARCHIVE_SHA,"historical D archive hash")
    with zipfile.ZipFile(prior) as z:
        old=lab.awc.ev.strict_json(z.read("lab-variation-report.json"))
    need(old["revision"]==D_REVISION and old["status"]=="PASS_AWC_D_ISOLATED_ORBIT","historical D qualification")
    c,l,d,a,b=(read(p/n) for n in ("composition-plan.json","lab-plan.json","lab-variation-report.json","artistic-derivative.json","bay-browser.json"))
    need(d["revision"]==a["revision"]==b["revision"]==revision,"pipeline revision")
    need(d["status"]=="PASS_AWC_D_ISOLATED_ORBIT" and d["rollbackExact"] and d["protectedStateUnchanged"],"current D gate")
    need(a["status"]=="PASS_ARTISTIC_DERIVATIVE" and a["labReceiptSha256"]==sha(p/"lab-variation-report.json"),"artistic gate")
    need(c["archiveReplay"] and c["mode"]=="PLAN_ONLY" and c["readyForExecution"] is False,"composition gate")
    need(c["planSha256"]==l["compositionPlanSha256"]==d["compositionPlanSha256"]==a["compositionPlanSha256"]==old["compositionPlanSha256"],"composition continuity")
    need(l["labPlanSha256"]==d["labPlanSha256"]==a["labPlanSha256"]==old["labPlanSha256"],"lab plan continuity")
    need(sha(master)==c["sources"]["masterSha256"]==l["masterSha256"]==d["masterSha256"]==a["masterSha256"],"master continuity")
    need(d["sourceGeometrySha256"]==a["sourceGeometrySha256"]==old["sourceGeometrySha256"] and d["sourceMaterialPackageSha256"]==a["sourceMaterialPackageSha256"]==old["sourceMaterialPackageSha256"],"shared source identity")
    need(d["views"]==old["views"],"browser repeatability against D")
    need(a["masterUnchanged"] and a["visibilityRestored"] and a["sourceBindingsUnchanged"],"artistic restoration")
    need(a["variation"]["changedPixels"]>=3072 and a["rollback"]["mean"]<=.0002 and a["rollback"]["max"]<=1/255+1e-7,"artistic visual gate")
    need(set(a["frames"])=={"artistic-reference","artistic-rotated","artistic-restored"},"artistic frame inventory")
    for f in a["frames"].values():
        need(f["cameraMatrixMaxDelta"]<=2e-6 and f["projectionMaxDelta"]<=2e-6 and f["lit"]>=3072,"matched artistic framing")
    need(not any(l["authority"].values()) and not any(c["authority"].values()),"authority")
    need(not any(x[k] for x in (a,d) for k in ("artisticApproval","publishable")) and not a["opticalEquivalence"],"promotion")
    names=["composition-plan.json","lab-plan.json","bay.json","bay-browser.json","lab-variation-report.json","artistic-derivative.json"]
    for name,v in list(d["views"].items())+list(a["frames"].items()):
        path=p/(name+".png");need(sha(path)==v["sha256"],"image identity "+name);names.append(path.name)
    files={n:{"sha256":sha(p/n),"bytes":(p/n).stat().st_size} for n in sorted(names)}
    result={"schema":"atlas.awc.dual-derivation/v1","status":"PASS_AWC_E_DUAL_DERIVATION",
            "mode":"ISOLATED_LAB_ONLY","revision":revision,"masterSha256":a["masterSha256"],
            "producerRevision":d["producerRevision"],"historicalD":{"revision":D_REVISION,"artifact":D_ARTIFACT,"sha256":D_ARCHIVE_SHA},
            "compositionPlanSha256":c["planSha256"],"labPlanSha256":l["labPlanSha256"],
            "stages":[{"id":"compose","dependsOn":[],"status":"PASS","receipt":"composition-plan.json"},
                      {"id":"resolve-orbit","dependsOn":["compose"],"status":"PASS","receipt":"lab-plan.json"},
                      {"id":"export","dependsOn":["resolve-orbit"],"status":"PASS","receipt":"bay.json"},
                      {"id":"interactive","dependsOn":["export"],"status":"PASS","receipt":"bay-browser.json"},
                      {"id":"rollback-review","dependsOn":["interactive"],"status":"PASS","receipt":"lab-variation-report.json"},
                      {"id":"artistic","dependsOn":["rollback-review"],"status":"PASS","receipt":"artistic-derivative.json"}],
            "outputs":{"artistic":{"engine":"Blender/Cycles","version":a["blenderVersion"],"frames":list(a["frames"]),"scope":a["scope"]},
                       "interactive":{"engine":"three.js-r128","frames":list(d["views"]),"scope":"actual browser laboratory; not a distributable runtime"}},
            "sourceGeometrySha256":a["sourceGeometrySha256"],"sourceMaterialPackageSha256":a["sourceMaterialPackageSha256"],
            "browserExactRepeat":True,"artisticRollback":a["rollback"],"files":files,
            "authority":c["authority"],"readyForProduction":False,"artisticApproval":False,"opticalEquivalence":False,
            "physicalDeviceQualified":False,"licenseQualified":False,"publishable":False}
    result["manifestSha256"]=lab.awc.asd.digest(result)
    return result
def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out",type=Path,required=True);parser.add_argument("--prior",type=Path,required=True)
    parser.add_argument("--master",type=Path,required=True);parser.add_argument("--revision",required=True)
    a=parser.parse_args();r=build(a.out,a.prior,a.master,a.revision)
    raw=json.dumps(r,sort_keys=True,indent=2,allow_nan=False)+"\n"
    (a.out/"dual-derivation.json").write_text(raw);print(raw,end="")
if __name__=="__main__":main()
