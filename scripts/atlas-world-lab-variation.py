"""AWC-D: one reversible orbit variation in the qualified bay laboratory.

This adapter has no general execution authority. It produces a bounded
laboratory request from the AWC-C plan and the existing ASD orbit domain.
The producer is pinned to PR 146; its runtime is not modified in the repo.
"""
import argparse,hashlib,importlib.util,json,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("compose",ROOT/"scripts/atlas-world-compose.py")
awc=importlib.util.module_from_spec(spec);spec.loader.exec_module(awc)
require=awc.require
PRODUCER="abfb83b9c9cf17d5c3e46c79eaa7ac9dab96e3cc"
PRODUCER_SCRIPT="524d0effc6df376c383078e29d7c50293501ae84"
EXPORT_SCRIPT="8c28dc7722eca0465ba79d487e25be79d251d9ad"
PARAM="camera.orbit"
STEP=.004
# Fixed, reviewed demonstration. No arbitrary arguments or command generation.
ANGLE=.12

def make_lab_plan(archives):
    request=awc.example("bay")
    composition=awc.compose(request,archives=archives)
    require(composition["archiveReplay"] and composition["context"]=="bay-preview","bay evidence replay required")
    require(composition["readyForExecution"] is False and not any(composition["authority"].values()),"composition authority")
    require(composition["steps"][-1]["id"]=="library.bay.navigation","bay profile")
    data=awc.inputs();registry,master=data[3],data[4]
    domain=awc.asd.specs(registry,master,"webgl")[PARAM]
    # Reuse ASD type/range ONLY, not the native-preview-runtime binding.
    awc.asd.validate_value(domain,ANGLE)
    require(domain["baseline"]==0 and domain["unit"]=="rad","ASD orbit domain drift")
    pixels=round(ANGLE/STEP)
    require(math.isclose(pixels*STEP,ANGLE,abs_tol=1e-12) and 0<pixels<=75,"pointer displacement")
    plan={"schema":"atlas.awc.lab-variation/v1","mode":"ISOLATED_LAB_ONLY",
          "producerRevision":PRODUCER,"producerScriptBlob":PRODUCER_SCRIPT,"exportScriptBlob":EXPORT_SCRIPT,
          "compositionPlanSha256":composition["planSha256"],"sources":composition["sources"],
          "masterSha256":composition["sources"]["masterSha256"],"context":"bay-preview",
          "parameter":PARAM,"unit":domain["unit"],"before":domain["baseline"],"after":ANGLE,
          "pointerDeltaX":pixels,"pointerDeltaY":0,"radiansPerPixel":STEP,
          "preserve":["pitch","zoom","viewport","geometry","materialPackage","lighting","AgX"],
          "rollback":"existing reset control","nativeRuntimeBinding":False,
          "authority":composition["authority"],"productionExecutionAuthorized":False}
    plan["labPlanSha256"]=awc.asd.digest(plan)
    return composition,plan

def instrument(source,plan):
    raw=source.read_bytes()
    require(awc.ev.awc.blob_sha(raw)==PRODUCER_SCRIPT,"producer script identity")
    # The only code additions are readback and the CI driver of the existing
    # pointer/reset UI. The original scene/shaders/rendering remain unchanged.
    s=raw.decode("utf-8")
    def once(old,new):
        nonlocal s
        require(s.count(old)==1,"producer instrumentation anchor drift")
        s=s.replace(old,new,1)
    once('window.__capture=capture;window.__resize=(cw,ch)=>render(cw,ch);',
         'window.__capture=capture;window.__resize=(cw,ch)=>render(cw,ch);\n'
         'window.__awcSnapshot=()=>({yaw,pitch,zoom,width:canvas.width,height:canvas.height,camera:cam.matrixWorld.elements.slice(),projection:cam.projectionMatrix.elements.slice()});')
    once('await capture("reference");const box=await page.locator("canvas").boundingBox();',
         'const awcPlan=JSON.parse(readFileSync(process.env.AWC_LAB_PLAN,"utf8"));\n'
         'assert.equal(awcPlan.mode,"ISOLATED_LAB_ONLY");assert.equal(awcPlan.parameter,"camera.orbit");\n'
         'report.awc={labPlanSha256:awcPlan.labPlanSha256,compositionPlanSha256:awcPlan.compositionPlanSha256,before:await page.evaluate(()=>window.__awcSnapshot())};\n'
         'await capture("reference");const box=await page.locator("canvas").boundingBox();')
    once('box.x+box.width/2+70,box.y+box.height/2+10,{steps:4}',
         'box.x+box.width/2+awcPlan.pointerDeltaX,box.y+box.height/2+awcPlan.pointerDeltaY,{steps:1}')
    once('await capture("rotated");assert.notEqual',
         'await capture("rotated");report.awc.after=await page.evaluate(()=>window.__awcSnapshot());assert.notEqual')
    once('await capture("restored");assert.equal',
         'await capture("restored");report.awc.restored=await page.evaluate(()=>window.__awcSnapshot());assert.equal')
    return s

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--archives",type=Path,required=True)
    p.add_argument("--producer",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    p.add_argument("--instrumented",type=Path,required=True)
    args=p.parse_args()
    require(awc.ev.awc.blob_sha((args.producer/"scripts/atlas-export-bay-preview.py").read_bytes())==EXPORT_SCRIPT,"export script identity")
    c,plan=make_lab_plan(args.archives)
    args.out.mkdir(parents=True,exist_ok=True)
    def write(name,data):(args.out/name).write_text(json.dumps(data,indent=2,sort_keys=True,allow_nan=False)+"\n")
    write("composition-plan.json",c);write("lab-plan.json",plan)
    args.instrumented.write_text(instrument(args.producer/"scripts/test-atlas-bay-material-webgl.mjs",plan))
    print("AWC-D isolated lab plan",plan["labPlanSha256"],"orbit",plan["after"])
if __name__=="__main__":main()
