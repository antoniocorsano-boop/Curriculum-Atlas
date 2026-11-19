// PERF-04 compare actual sustained-load runs. Different CI runners: descriptive
// timing only. A policy test PASS is not evidence of artistic approval.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
import sharp from "sharp";
import {createQualityController} from "./atlas-gateway-integration/adaptive-quality.mjs";
const root=process.argv[2],out=join(root,"perf-quality-comparison.json");
const result={schema:"atlas.perf.quality/v1",status:"PENDING",scope:"software Chromium; independent CI runners",modes:{},comparisons:[],studentAuthorized:false,publishable:false,automaticPromotion:false};
const save=()=>writeFileSync(out,JSON.stringify(result,null,2)+"\n");
function find(dir,name){const a=[];for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())a.push(...find(p,name));else if(e.name===name)a.push(p)}return a}
function one(dir,name){const a=find(dir,name);assert.equal(a.length,1,"missing or duplicate "+name);return a[0]}
const json=(dir,n)=>JSON.parse(readFileSync(one(dir,n),"utf8"));
const time=(r,a,b)=>{const x=r.routeEvents.find(e=>e.checkpoint===a),y=r.routeEvents.find(e=>e.checkpoint===b);assert(x&&y);return y.at-x.at};
const devices=["large","large-repeat-2","large-repeat-3","compact","phone","landscape","tablet","desktop"];
const stress=devices.filter(x=>x.startsWith("large")||x==="desktop");
try{
 const entries={};
 for(const mode of ["fixed","adaptive"]){
  const dir=join(root,"atlas-perf-quality-"+mode),v=json(dir,"perf-quality-variant.json"),r=json(dir,"native-gateway-receipt.json"),d=json(dir,"navigation-differential.json"),build=json(dir,"native-build-receipt.json");
  assert.equal(v.mode,mode);assert.equal(r.qualityMode,mode);assert.equal(r.perfBufferMode,"transient");assert.equal(r.navMode,"detach-first");
  assert.equal(r.status,"PASS");assert.equal(r.failures.length,0);assert.equal(r.results.length,10);assert.equal(d.results.length,4);assert(d.results.every(s=>s.status==="PASS"));
  const rows=r.results.filter(x=>x.device);assert.deepEqual(rows.map(x=>x.device),devices);
  const timing=rows.map(x=>({device:x.device,commitMs:time(x,"portal-action","commit-observed"),detachMs:time(x,"ATLAS_NATIVE_DETACH_BEGIN","ATLAS_NATIVE_FRAME_DETACHED")}));
  const load=[];
  for(const device of stress){
   const q=rows.find(x=>x.device===device).qualityEvidence;assert(q);assert(q.final.frames-q.initial.frames>=6);assert.equal(q.final.state.adaptive,mode==="adaptive");assert(q.final.hits.every(p=>p.hit===p.id));
   const controller=createQualityController({adaptive:mode==="adaptive"});
   // Replay rounded samples only as a diagnostic, not an exact threshold
   // assertion: rounding near the threshold can change a decision.
   for(const s of q.final.observations)controller.observe(s);
   load.push({device,initialTier:q.initial.state.tier,finalTier:q.final.state.tier,initialLimit:q.initial.state.limit,finalLimit:q.final.state.limit,buffer:q.final.buffer,css:q.final.css,transitions:q.final.state.transitions,samples:q.final.state.samples,observedFrames:q.final.frames-q.initial.frames,workloadMs:q.workloadMs,replayTier:controller.snapshot().tier});
  }
  result.modes[mode]={variant:v,manifestSha256:build.manifestSha256,timing,load};entries[mode]={dir,rows};save();
 }
 assert.equal(result.modes.fixed.variant.referenceRuntimeSha256,result.modes.adaptive.variant.referenceRuntimeSha256);
 assert.equal(result.modes.fixed.variant.policySha256,result.modes.adaptive.variant.policySha256);
 assert.equal(result.modes.fixed.manifestSha256,result.modes.adaptive.manifestSha256);
 for(const device of stress){
  const a=result.modes.fixed.load.find(x=>x.device===device),b=result.modes.adaptive.load.find(x=>x.device===device);
  assert.deepEqual(a.css,b.css);
  const pixels=async mode=>sharp(one(entries[mode].dir,device+"-quality-stable.png")).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const x=await pixels("fixed"),y=await pixels("adaptive");assert.deepEqual(x.info,y.info);
  let sum=0,changed=0;
  for(let i=0;i<x.data.length;i+=3){let m=0;for(let k=0;k<3;k++){const d=Math.abs(x.data[i+k]-y.data[i+k]);sum+=d;m=Math.max(m,d)}if(m>12)changed++}
  result.comparisons.push({device,bufferFixed:a.buffer,bufferAdaptive:b.buffer,pixelReduction:1-b.buffer[0]*b.buffer[1]/(a.buffer[0]*a.buffer[1]),meanAbsoluteRGBDelta:sum/x.data.length/255,changedPixelFraction:changed/(x.data.length/3),workloadFixedMs:a.workloadMs,workloadAdaptiveMs:b.workloadMs,commitFixedMs:result.modes.fixed.timing.find(t=>t.device===device).commitMs,commitAdaptiveMs:result.modes.adaptive.timing.find(t=>t.device===device).commitMs});save();
 }
 result.adaptationObserved=result.modes.adaptive.load.some(x=>x.transitions.some(t=>t.reason==="sustained-pressure"));
 result.visualThresholds={meanAbsoluteRGBDelta:.04,changedPixelFraction:.15,meaning:"diagnostic only; manual artistic review required"};
 result.visualCompatible=result.comparisons.every(x=>x.meanAbsoluteRGBDelta<=.04&&x.changedPixelFraction<=.15);
 result.status=!result.adaptationObserved?"PASS_POLICY_ONLY_NO_LIVE_TRANSITION":result.visualCompatible?"PASS_COMPARISON_ONLY":"REVIEW_VISUAL_DIFFERENCE";
 save();console.log(JSON.stringify(result));
}catch(e){result.status="FAIL_OR_INCOMPLETE";result.error=String(e);save();throw e}
