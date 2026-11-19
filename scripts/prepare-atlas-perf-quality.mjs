// PERF-04: experiment-only derivative of the locked native runtime. Both
// modes collect the same nonblocking fence observations, fixed or adaptive.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
const [mode,out]=process.argv.slice(2);
assert(["fixed","adaptive"].includes(mode));
assert.equal(process.env.ATLAS_GATEWAY_PREVIEW,"true");
assert.equal(process.env.ATLAS_GATEWAY_NATIVE_PREVIEW,"true");
assert.notEqual(process.env.ATLAS_GITHUB_PAGES,"true");
const path="scripts/atlas-gateway-integration/native-preview-runtime.js";
const before=readFileSync(path,"utf8");
const policy=readFileSync("scripts/atlas-gateway-integration/adaptive-quality.mjs","utf8").replace(/^export /gm,"");
const sha=x=>createHash("sha256").update(x).digest("hex");
let c=before;
function rep(a,b){assert.equal(c.split(a).length,2,"Unexpected runtime binding: "+a.slice(0,100));c=c.replace(a,b)}
assert(before.includes("preserveDrawingBuffer:false"));
rep("const NATIVE_MAX_RASTER_PIXELS=1048576;",policy+"\nconst adaptiveQuality=createQualityController({adaptive:"+(mode==="adaptive")+"});\nconst qualityObservations=[];let submittedAt=0,submittedSkips=0;\nconst NATIVE_MAX_RASTER_PIXELS=1048576;");
rep("Math.sqrt(NATIVE_MAX_RASTER_PIXELS/(w*h))","Math.sqrt(adaptiveQuality.limit()/(w*h))");
rep("  renderer.setSize(bw,bh,false);","  if(renderer.domElement.width!==bw||renderer.domElement.height!==bh)renderer.setSize(bw,bh,false);");
rep("if(renderBudget.bufferWidth*renderBudget.bufferHeight>NATIVE_MAX_RASTER_PIXELS)","if(renderBudget.bufferWidth*renderBudget.bufferHeight>adaptiveQuality.limit())");
rep("  if(status===gl.WAIT_FAILED){renderBudget.fenceSupported=false}\n  return true;",`  if(status===gl.WAIT_FAILED){renderBudget.fenceSupported=false;return true}
  if(submittedAt>0){
    const now=performance.now(),sample={elapsedMs:now-submittedAt,skippedPolls:renderBudget.backpressureSkips-submittedSkips,nowMs:now,eligible:innerWidth*innerHeight>QUALITY_LIMITS[2]};
    qualityObservations.push({...sample,elapsedMs:Math.round(sample.elapsedMs),nowMs:Math.round(now)});
    if(qualityObservations.length>64)qualityObservations.shift();
    if(adaptiveQuality.observe(sample)){
      rasterWidth=0;rasterHeight=0;
      resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));
      console.info("ATLAS_NATIVE_QUALITY "+JSON.stringify(adaptiveQuality.snapshot()));
    }
  }
  return true;`);
rep("  gl.flush();","  gl.flush();");
rep("const start=performance.now();renderer.render(scene,camera);recordSubmission();","const start=performance.now();submittedAt=start;submittedSkips=renderBudget.backpressureSkips;renderer.render(scene,camera);recordSubmission();");
rep('console.info("ATLAS_NATIVE_RENDER_FINAL "+JSON.stringify(renderBudget));','console.info("ATLAS_NATIVE_RENDER_FINAL "+JSON.stringify({...renderBudget,quality:adaptiveQuality.snapshot(),qualityObservations}));');
writeFileSync(path,c);
mkdirSync(out,{recursive:true});
writeFileSync(join(out,"perf-quality-variant.json"),JSON.stringify({mode,referenceRuntimeSha256:sha(before),variantRuntimeSha256:sha(c),policySha256:sha(policy),studentAuthorized:false,publishable:false},null,2)+"\n");
