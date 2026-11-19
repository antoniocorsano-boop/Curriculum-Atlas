// PERF-02: compare artifacts of the two independently executed full matrices.
// Timing is descriptive, not a controlled hardware benchmark or causal proof.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
import sharp from "sharp";
const root=process.argv[2],out=join(root,"perf-buffer-comparison.json");
const result={schema:"atlas.perf.buffer/v1",status:"PENDING",scope:"Chromium SwiftShader; separate CI runners; full-route experiment",modes:{},images:[],studentAuthorized:false,publishable:false,automaticPromotion:false};
const save=()=>writeFileSync(out,JSON.stringify(result,null,2)+"\n");
function find(dir,name){const matches=[];for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())matches.push(...find(p,name));else if(e.name===name)matches.push(p)}return matches}
function one(dir,name){const p=find(dir,name);assert.equal(p.length,1,"Expected exactly one "+name+" in "+dir);return p[0]}
const json=(dir,name)=>JSON.parse(readFileSync(one(dir,name),"utf8"));
const time=(r,start,end)=>{const a=r.routeEvents.find(e=>e.checkpoint===start),b=r.routeEvents.find(e=>e.checkpoint===end);assert(a&&b,"missing timing markers");return b.at-a.at};
const median=a=>{const s=[...a].sort((x,y)=>x-y),n=s.length;return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2};
const devices=["large","large-repeat-2","large-repeat-3","compact","phone","landscape","tablet","desktop"];
try{
 const entries={};
 for(const mode of ["retained","transient"]){
  const dir=join(root,"atlas-perf-buffer-"+mode);
  const v=json(dir,"perf-buffer-variant.json"),r=json(dir,"native-gateway-receipt.json"),d=json(dir,"navigation-differential.json");
  assert.equal(v.mode,mode);assert.equal(v.changed,mode==="transient");assert.equal(v.changedAttribute,"preserveDrawingBuffer");assert.equal(r.perfBufferMode,mode);
  assert.equal(r.status,"PASS");assert.equal(r.failures.length,0);assert.equal(r.results.length,10);
  assert.equal(d.results.length,4);assert(d.results.every(s=>s.status==="PASS"));
  const rows=r.results.filter(x=>x.device);assert.deepEqual(rows.map(x=>x.device),devices);
  for(const x of rows){
    assert.equal(x.preserved,mode==="retained");
    assert.equal(x.portal,"PASS");assert.equal(x.navigationTeardown,"PASS");
    assert(x.idlePersistence.range>32&&x.idlePersistence.meanAbsoluteRGBDelta<=.005);
    if(x.device.startsWith("large"))assert(x.animationEvidence.after>x.animationEvidence.before);
  }
  const timings=rows.map(x=>({device:x.device,css:x.css,buffer:x.actualBuffer,commitMs:time(x,"portal-action","commit-observed"),detachMs:time(x,"ATLAS_NATIVE_DETACH_BEGIN","ATLAS_NATIVE_FRAME_DETACHED"),idle:x.idlePersistence,animation:x.animationEvidence??null}));
  result.modes[mode]={variant:v,timings,largeMedianMs:median(timings.filter(x=>x.device.startsWith("large")).map(x=>x.commitMs)),largeWorstMs:Math.max(...timings.filter(x=>x.device.startsWith("large")).map(x=>x.commitMs)),fallbacks:r.results.filter(x=>!x.device)};
  entries[mode]={dir,rows,v};save();
 }
 assert.equal(entries.retained.v.baselineSceneSha256,entries.transient.v.baselineSceneSha256);
 assert.equal(entries.retained.v.manifestSha256,entries.transient.v.manifestSha256);
 assert.equal(entries.retained.v.variantSceneSha256,entries.retained.v.baselineSceneSha256);
 assert.notEqual(entries.transient.v.variantSceneSha256,entries.transient.v.baselineSceneSha256);
 for(const device of devices){
  const a=entries.retained.rows.find(x=>x.device===device),b=entries.transient.rows.find(x=>x.device===device);
  assert.deepEqual(a.actualBuffer,b.actualBuffer);assert.deepEqual(a.css,b.css);assert.equal(a.triangles,b.triangles);assert.equal(a.calls,b.calls);
  const pixels=async mode=>sharp(one(entries[mode].dir,device+"-canvas-idle.png")).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const x=await pixels("retained"),y=await pixels("transient");assert.deepEqual(x.info,y.info);
  let sum=0,changed=0;for(let i=0;i<x.data.length;i+=3){let max=0;for(let k=0;k<3;k++){const d=Math.abs(x.data[i+k]-y.data[i+k]);sum+=d;max=Math.max(max,d)}if(max>12)changed++;}
  result.images.push({device,width:x.info.width,height:x.info.height,meanAbsoluteRGBDelta:sum/x.data.length/255,changedPixelFraction:changed/(x.data.length/3)});save();
 }
 const visualCompatible=result.images.every(x=>x.meanAbsoluteRGBDelta<=.02&&x.changedPixelFraction<=.05);
 result.status=visualCompatible?"PASS_COMPARISON_ONLY":"REVIEW_VISUAL_DIFFERENCE";
 result.visualThresholds={meanAbsoluteRGBDelta:.02,changedPixelFraction:.05,meaning:"diagnostic bounds, not artistic acceptance"};
 result.timingComparison={retainedMedianMs:result.modes.retained.largeMedianMs,transientMedianMs:result.modes.transient.largeMedianMs,deltaMs:result.modes.transient.largeMedianMs-result.modes.retained.largeMedianMs,causalClaim:false};
 save();console.log(JSON.stringify(result));assert(visualCompatible,"Visual difference exceeds predeclared diagnostic bounds");
}catch(e){result.status="FAIL_OR_INCOMPLETE";result.error=String(e);save();throw e}
