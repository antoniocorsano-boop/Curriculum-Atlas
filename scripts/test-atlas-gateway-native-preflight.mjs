// Run the exact generated native scene in the exact opaque sandbox before
// building Next or repeating device tests. No alternate renderer, mock GLB,
// loosened CSP, new service, or external requests.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
import {execFileSync} from "node:child_process";
import {createServer} from "node:http";
import {stripTypeScriptTypes} from "node:module";
import {chromium} from "playwright";
import {parseNativeManifest} from "../src/features/atlas-gateway/native-asset-policy.ts";
const [bundle,out]=process.argv.slice(2).map(p=>resolve(p));
mkdirSync(out,{recursive:true});
const sha=b=>createHash("sha256").update(b).digest("hex");
const manifestBytes=readFileSync(join(bundle,"native-manifest.json"));
const manifest=parseNativeManifest(JSON.parse(manifestBytes.toString("utf8")));
const receipt=JSON.parse(readFileSync(join(bundle,"native-build-receipt.json"),"utf8"));
const sceneBytes=readFileSync(join(bundle,"scene.html"));
assert(manifest);assert.equal(manifest.studentAuthorized,false);
assert.equal(sha(manifestBytes),receipt.manifestSha256);
assert.equal(sha(sceneBytes),receipt.sceneSha256);
const html=sceneBytes.toString("utf8");
assert(html.includes("connect-src 'none'")&&html.includes("img-src data: blob:")&&html.includes("atlas-gateway-native-v1"));
assert(html.length<=4000000);
const assets=new Map();
for(const a of manifest.assets){
 const b=readFileSync(resolve("public/atlas-gateway-native",a.file));
 assert.equal(b.length,a.bytes);assert.equal(sha(b),a.sha256);
 assets.set("/atlas-gateway-native/"+a.file,b);
}
const policy=stripTypeScriptTypes(readFileSync("src/features/atlas-gateway/native-asset-policy.ts","utf8"),{mode:"strip"});
const safe=value=>JSON.stringify(value).replace(/</g,"\\u003c");
const host=`<!doctype html><html lang="it"><meta charset="utf-8"><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%;display:block}</style><body><script type="module">
import {nativeRequest,verifiedNativeBytes,parseNativeManifest} from "/asset-policy.js";
const manifest=parseNativeManifest(${safe(manifest)});
const channel=Array.from(crypto.getRandomValues(new Uint8Array(24)),x=>x.toString(16).padStart(2,"0")).join("");
const frame=document.createElement("iframe");frame.setAttribute("sandbox","allow-scripts");frame.referrerPolicy="no-referrer";
const controller=new AbortController(),requested=new Set();
const started=performance.now();
window.nativePreflight={state:"pending",transfers:[],elapsedMs:null,error:null,handoffs:[]};
function finish(state,error=null){if(window.nativePreflight.state!=="pending")return;window.nativePreflight.state=state;window.nativePreflight.error=error;window.nativePreflight.elapsedMs=performance.now()-started;if(state!=="ready")controller.abort();}
addEventListener("message",event=>{
 if(event.source!==frame.contentWindow||event.origin!=="null"||event.data?.channel!==channel)return;
 if(event.data.type==="atlas-open"){window.nativePreflight.handoffs.push(event.data.id);return}
 if(event.data.type==="atlas-3d-error"){finish("failed","Runtime reported atlas-3d-error");return}
 if(event.data.type==="atlas-3d-ready"){finish("ready");return}
 const a=nativeRequest(event.data,channel,manifest);
 if(!a||requested.has(a.id)||window.nativePreflight.state!=="pending")return;
 requested.add(a.id);const t=performance.now();
 verifiedNativeBytes(a,controller.signal).then(bytes=>{
  if(controller.signal.aborted)return;
  window.nativePreflight.transfers.push({id:a.id,bytes:a.bytes,elapsedMs:performance.now()-t});
  frame.contentWindow.postMessage({type:"atlas-native-asset",channel,id:a.id,bytes},"*",[bytes]);
 }).catch(e=>finish("failed",String(e)));
});
setTimeout(()=>finish("failed","Native startup timeout"),60000);
frame.srcdoc=${safe(html)}.replace("__ATLAS_PARENT_ORIGIN_JSON__",JSON.stringify(location.origin)).replace("__ATLAS_CHANNEL_JSON__",JSON.stringify(channel));
document.body.appendChild(frame);
</script></body></html>`;
const server=createServer((req,res)=>{
 const path=new URL(req.url,"http://127.0.0.1").pathname;
 let bytes,type;
 if(path==="/"){bytes=Buffer.from(host);type="text/html; charset=utf-8";}
 else if(path==="/asset-policy.js"){bytes=Buffer.from(policy);type="text/javascript; charset=utf-8";}
 else if(assets.has(path)){bytes=assets.get(path);type="application/octet-stream";}
 else if(path==="/favicon.ico"){res.writeHead(204);return res.end();}
 else{res.writeHead(404);return res.end();}
 res.writeHead(200,{"Content-Type":type,"Content-Length":bytes.length,"Cache-Control":"no-store"});res.end(bytes);
});
let browser,page,report={status:"FAIL",scope:"exact-native-sandbox-preflight",sceneSha256:receipt.sceneSha256,manifestSha256:receipt.manifestSha256,profile:receipt.profile,external:[],errors:[],diagnostics:[],studentAuthorized:false,publishable:false};
try{
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const context=await browser.newContext({viewport:{width:900,height:700},deviceScaleFactor:1});
 await context.route("**/*",route=>{const u=new URL(route.request().url());if(/^https?:$/.test(u.protocol)&&u.origin!==origin){report.external.push(u.href);return route.abort()}return route.continue()});
 page=await context.newPage();
 page.on("pageerror",e=>report.errors.push(e.message));
 page.on("console",m=>{const t=m.text();if(m.type()==="error"||t.startsWith("ATLAS_"))report.diagnostics.push(t)});
 await page.goto(origin,{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>window.nativePreflight&&window.nativePreflight.state!=="pending",null,{timeout:65000});
 report.startup=await page.evaluate(()=>window.nativePreflight);
 assert.equal(report.startup.state,"ready",JSON.stringify(report.startup));
 assert.deepEqual(report.startup.transfers.map(t=>t.id),["sky","ambient","shell","scenography","cupola","portals","bays","stars"]);
 const el=await page.locator("iframe").elementHandle(),frame=await el.contentFrame();
 assert.equal(await el.getAttribute("sandbox"),"allow-scripts");assert(frame);
 report.render=await frame.evaluate(()=>{
  const gl=renderer.getContext();
  return {phase:nativePhase,decoded:nativeDecoded,revision:THREE.REVISION,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,stats:visibility.update(camera),sky:!!scene.background,cupola:!!groupMap.cupola,contextLost:gl.isContextLost(),glError:gl.getError()};
 });
 assert.equal(report.render.phase,"ready");
 if(receipt.materialDetailApplied){
   const material=await frame.evaluate(()=>nativeMaterialBridge?.evidence()??null);
   assert(material&&new Set(material.map(x=>x.name)).size===7,"integrated material inventory");
   assert(material.filter(x=>x.corrected).length===1,"brass correction");
   assert(material.some(x=>x.compiled>0),"material shaders actually compiled");
   report.materialDetail=material;
 }
 assert.deepEqual(Object.keys(report.render.decoded),["shell","scenography","cupola","portals","bays","stars"]);
 assert(report.render.decoded.shell.images>0&&report.render.decoded.shell.textures>0);
 assert(Object.values(report.render.decoded).every(m=>m.decoder==="TextureLoader"));
 assert.equal(report.render.stats.total,495);assert(report.render.stats.culled>0);
 assert(report.render.calls>0&&report.render.triangles>0&&report.render.triangles<1101794&&report.render.sky&&report.render.cupola);
 assert.equal(report.render.glError,0);assert.equal(report.render.contextLost,false);
 assert.deepEqual(report.external,[]);assert.deepEqual(report.errors,[]);
 assert.equal(report.diagnostics.filter(t=>/ATLAS_CSP|ATLAS_NATIVE_FAILURE|Content Security Policy/i.test(t)).length,0,JSON.stringify(report.diagnostics));
 await page.screenshot({path:join(out,"native-preflight.png")});
 // ASI-L2: observe the actual renderer; ASD: apply one typed camera plan
 // only via the isolated Playwright sandbox. No runtime command surface.
 const plan=JSON.parse(execFileSync("python3",["-c",`import runpy,json
m=runpy.run_path("scripts/scene-director.py")
c,r=m["load_sources"]()
q=m["request_for"](c,r,"webgl",{"camera.orbit":0.11},False,False)
print(json.dumps(m["make_plan"](c,r,q)))`],{encoding:"utf8"}));
 assert.equal(plan.status,"CANDIDATE");assert.equal(plan.target,"webgl");
 assert.equal(plan.rendererWriteAuthorized,false);assert.equal(plan.studentAuthorized,false);
 assert.equal(plan.publishable,false);assert.equal(plan.changes.length,1);
 report.sceneObservation={status:"PENDING",exactHead:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),plan};
 report.sceneObservation.result=await frame.evaluate(plan=>{
   const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
   const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
   const require=(ok,msg)=>{if(!ok)throw Error("ASI-L2 "+msg)};
   const parameters=()=>{const lights=scene.children.filter(o=>o.isLight);
     const hemi=lights.find(o=>o.isHemisphereLight),directions=lights.filter(o=>o.isDirectionalLight);
     require(hemi&&directions.length===2,"light inventory");
     return {"camera.mode":"auto","camera.orbit":angle,"camera.tilt":tilt,"camera.distance":distance,
       "lighting.exposure":renderer.toneMappingExposure,"lighting.skyFill":hemi.intensity,
       "lighting.sun":directions[0].intensity,"lighting.frontFill":directions[1].intensity,"astral.motion":motion};
   };
   const inventory=()=>Object.entries(groupMap).map(([id,root])=>{
     const objects=[];root.traverse(o=>{objects.push({name:o.name,type:o.type,visible:o.visible,
       matrix:o.matrix.toArray(),vertices:o.geometry?.attributes?.position?.count??0,
       materials:(Array.isArray(o.material)?o.material:o.material?[o.material]:[]).map(m=>({name:m.name,type:m.type,uuid:m.uuid}))})});
     return {id,objects};
   });
   const state=()=>({parameters:parameters(),position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),
     projection:camera.projectionMatrix.toArray(),inventory:inventory(),decoded:nativeDecoded,
     alsPoints:als.object.geometry.attributes.position.count,viewport:[w,h],revision:THREE.REVISION});
   const canonical=o=>JSON.stringify(Object.entries(o).sort(([a],[b])=>a.localeCompare(b)));
   function pixels(){render();const b=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);
     require(!gl.isContextLost()&&gl.getError()===gl.NO_ERROR,"pixel capture");return b}
   function difference(a,b){let changed=0,max=0;for(let i=0;i<a.length;i+=4){
     const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(d>12)changed++;max=Math.max(max,d);
   }return {changed,max,total:w*h,threshold:12}}
   function check(p){require(ready&&!closing&&!failed&&!motion&&!document.hidden&&!down&&!reduced.matches,"inactive or moving");
     require(p.schema==="atlas.asd.plan/v1"&&p.target==="webgl"&&p.mode==="PLAN_ONLY"&&p.status==="CANDIDATE"&&p.rendererWriteAuthorized===false&&p.artisticApproval===false&&p.studentAuthorized===false&&p.publishable===false,"authority");
     require(p.changes.length===1&&p.changes[0].id==="camera.orbit"&&p.changes[0].unit==="rad","allowlist");
     const v=p.changes[0].after;require(typeof v==="number"&&Number.isFinite(v)&&v>=-.3&&v<=.3&&v!==angle,"range");
     require(p.changes[0].before===angle&&canonical(p.rollback)===canonical(parameters()),"stale observation");
     require(canonical(p.candidate)===canonical({...parameters(),"camera.orbit":v}),"candidate drift");return v;
   }
   const before=state(),base=pixels(),beforeImage=canvas.toDataURL("image/png");
   const rejected=[];
   for(const [id,p] of [
     ["protected",{...plan,changes:[{...plan.changes[0],id:"materials"}]}],
     ["range",{...plan,changes:[{...plan.changes[0],after:2}]}],
     ["stale",{...plan,rollback:{...plan.rollback,"camera.orbit":.2}}],
     ["authority",{...plan,rendererWriteAuthorized:true}]
   ]){try{check(p)}catch{rejected.push(id)}}
   require(rejected.length===4&&equal(before,state()),"negative cases changed state");
   const next=check(plan),original=angle;let variant,variantPixels,restored,restoredPixels,portalHits,variantImage,restoredImage;
   try{
     angle=next;setCamera();variantPixels=pixels();variantImage=canvas.toDataURL("image/png");variant=state();
     portalHits=NATIVE_PORTALS.map(p=>{const v=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);
       return {id:p.id,hit:hitPortal((v.x+1)*innerWidth/2,(1-v.y)*innerHeight/2)}});
   }finally{angle=original;setCamera();restoredPixels=pixels();restoredImage=canvas.toDataURL("image/png");restored=state()}
   const visual=difference(base,variantPixels),rollbackVisual=difference(base,restoredPixels);
   require(canonical(variant.parameters)===canonical(plan.candidate),"candidate state");
   require(!equal(before.position,variant.position),"camera unchanged");
   require(equal(before.inventory,variant.inventory)&&equal(before.decoded,variant.decoded)&&before.alsPoints===variant.alsPoints,"protected inventory");
   require(equal(before,restored),"rollback state mismatch");
   require(visual.changed>100&&rollbackVisual.changed===0,"visual comparison");
   return {before,variant,restored,visual,rollbackVisual,rejected,portalHits,images:{before:beforeImage,variant:variantImage,restored:restoredImage}};
 },plan);
 for(const [id,data] of Object.entries(report.sceneObservation.result.images)){
   assert(data.startsWith("data:image/png;base64,"));
   writeFileSync(join(out,"asi-l2-webgl-"+id+"-canvas.png"),Buffer.from(data.slice("data:image/png;base64,".length),"base64"));
 }
 delete report.sceneObservation.result.images;
 report.sceneObservation.status="PASS";
 assert.deepEqual(report.external,[]);assert.deepEqual(report.errors,[]);
 await page.screenshot({path:join(out,"asi-l2-webgl-restored.png")});
 // ART-100 / LIGHT-01: bracket the existing lighting baseline using the
 // same ASD P1 planner. This is an isolated comparison, not artistic approval.
 const artPlans=JSON.parse(execFileSync("python3",["-c",`import runpy,json
m=runpy.run_path("scripts/scene-director.py")
c,r=m["load_sources"]()
variants={"chiaroscuro":{"lighting.exposure":0.78,"lighting.skyFill":0.14,"lighting.sun":1.18,"lighting.frontFill":0.10},"warm-open":{"lighting.exposure":0.90,"lighting.skyFill":0.27,"lighting.sun":1.10,"lighting.frontFill":0.20}}
print(json.dumps({k:m["make_plan"](c,r,m["request_for"](c,r,"webgl",v,False,False)) for k,v in variants.items()}))`],{encoding:"utf8"}));
 report.art100={status:"PENDING",scope:"LIGHT-01 isolated comparison only",plans:artPlans,artisticApproval:false,publishable:false};
 report.art100.result=await frame.evaluate(plans=>{
   const require=(x,msg)=>{if(!x)throw Error("ART-100 "+msg)};
   require(ready&&!closing&&!failed&&!motion&&!down&&!document.hidden,"scene not static");
   const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
   const lights=scene.children.filter(o=>o.isLight),hemi=lights.find(o=>o.isHemisphereLight),dirs=lights.filter(o=>o.isDirectionalLight);
   require(hemi&&dirs.length===2,"light inventory");
   const keys=["lighting.exposure","lighting.skyFill","lighting.sun","lighting.frontFill"];
   const read=()=>({"lighting.exposure":renderer.toneMappingExposure,"lighting.skyFill":hemi.intensity,"lighting.sun":dirs[0].intensity,"lighting.frontFill":dirs[1].intensity});
   function write(v){renderer.toneMappingExposure=v[keys[0]];hemi.intensity=v[keys[1]];dirs[0].intensity=v[keys[2]];dirs[1].intensity=v[keys[3]]}
   const base=read(), cameraState=()=>JSON.stringify([angle,tilt,distance,camera.position.toArray(),camera.quaternion.toArray(),camera.projectionMatrix.toArray(),motion,als.object.geometry.attributes.position.count]);
   const fixed=cameraState();
   function capture(){
     render();const b=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);
     require(!gl.isContextLost()&&gl.getError()===gl.NO_ERROR,"capture");
     return {pixels:b,image:canvas.toDataURL("image/png")};
   }
   function metrics(b){
     const histogram=Array(16).fill(0);let sum=0,dark=0,bright=0;
     for(let i=0;i<b.length;i+=4){const y=.2126*b[i]+.7152*b[i+1]+.0722*b[i+2];sum+=y;histogram[Math.min(15,Math.floor(y/16))]++;if(y<24)dark++;if(y>245)bright++}
     return {meanDisplayLuma:sum/(w*h),darkPixels:dark,brightPixels:bright,histogram,total:w*h};
   }
   function diff(a,b){let changed=0,max=0;for(let i=0;i<a.length;i+=4){const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(d>12)changed++;max=Math.max(max,d)}return {changed,max,threshold:12}}
   const reference=capture(),results={},images={reference:reference.image};
   for(const [id,p] of Object.entries(plans)){
     require(p.schema==="atlas.asd.plan/v1"&&p.target==="webgl"&&p.mode==="PLAN_ONLY"&&p.status==="DEPENDENCY_REQUIRED"&&p.rendererWriteAuthorized===false&&p.artisticApproval===false&&p.studentAuthorized===false&&p.publishable===false,"plan boundary");
     require(p.changes.length===4&&p.changes.every(x=>keys.includes(x.id)&&x.before===base[x.id]&&typeof x.after==="number"&&Number.isFinite(x.after)),"change set");
     require(p.candidate["astral.motion"]===false&&p.candidate["camera.orbit"]===angle&&p.candidate["camera.tilt"]===tilt&&p.candidate["camera.distance"]===distance,"protected camera");
     const ranges=[[.65,1],[.12,.35],[.75,1.3],[.08,.28]];
     require(keys.every((k,i)=>p.rollback[k]===base[k]&&p.candidate[k]>=ranges[i][0]&&p.candidate[k]<=ranges[i][1]),"bounds");
     let variant,observed,restored;
     try{write(p.candidate);variant=capture();observed=read();require(keys.every(k=>observed[k]===p.candidate[k]),"candidate values");require(cameraState()===fixed,"protected state")}
     finally{write(base);restored=capture()}
     require(keys.every(k=>read()[k]===base[k])&&cameraState()===fixed,"restore state");
     const visual=diff(reference.pixels,variant.pixels),rollbackVisual=diff(reference.pixels,restored.pixels);
     require(visual.changed>100&&rollbackVisual.max===0,"visual effect/rollback");
     results[id]={observed,metrics:metrics(variant.pixels),visual,rollbackVisual};
     images[id]=variant.image;images[id+"-restored"]=restored.image;
   }
   return {baseline:base,reference:metrics(reference.pixels),results,images,viewport:[w,h]};
 },artPlans);
 for(const [id,data] of Object.entries(report.art100.result.images)){
   assert(data.startsWith("data:image/png;base64,"));
   writeFileSync(join(out,"art100-light01-"+id+".png"),Buffer.from(data.slice("data:image/png;base64,".length),"base64"));
 }
 delete report.art100.result.images;
 report.art100.status="PASS_COMPARISON_ONLY";
 // PERF-05A only on the explicitly isolated geometry experiment.
 if(process.env.ATLAS_PERF_GEOMETRY==="true"){
   const {runGeometryProbe}=await import("./atlas-perf-geometry-probe.mjs");
   report.geometry=await runGeometryProbe({page,frame,out:join(out,"perf-geometry"),manifest});
 }
 // Exercise the real runtime's lifecycle with a live ALS adapter, not a mock.
 // Instrument actual calls, then reproduce late events and repeated closure.
 report.lifecycle=await frame.evaluate(()=>{
   let renders=0,updates=0,disposals=0,rendererDisposals=0;
   const rr=renderer.render.bind(renderer),au=als.update.bind(als),ad=als.dispose.bind(als),rd=renderer.dispose.bind(renderer);
   renderer.render=(...args)=>{renders++;return rr(...args)};
   als.update=(...args)=>{updates++;return au(...args)};
   als.dispose=()=>{disposals++;return ad()};
   renderer.dispose=()=>{rendererDisposals++;return rd()};
   motionButton.click();
   const before=motion&&frameId!==0;
   dispatchEvent(new PageTransitionEvent("pagehide",{persisted:true}));
   const paused=ready&&!closing&&!motion&&frameId===0&&disposals===0;
   dispatchEvent(new PageTransitionEvent("pageshow",{persisted:true}));
   const restored=ready&&!closing&&renders>0&&updates>0;
   motionButton.click();
   requestPortal("esperienze");
   const handedOff=closing&&!ready&&!motion&&frameId===0&&disposals===0&&rendererDisposals===0;
   const previous={renders,updates};
   // Events can already be queued during browser teardown. Even direct calls
   // must not touch the disposed ALS adapter or schedule a frame.
   document.dispatchEvent(new Event("visibilitychange"));
   dispatchEvent(new Event("resize"));
   dispatchEvent(new PageTransitionEvent("pagehide",{persisted:false}));
   motionButton.click();loop(performance.now());stopMotion();render();shutdown();shutdown();
   return {before,paused,restored,handedOff,closed:closing&&!ready&&!motion&&frameId===0&&nativePhase==="closed",disposals,rendererDisposals,lateRenders:renders-previous.renders,lateUpdates:updates-previous.updates};
 });
 assert.deepEqual(report.lifecycle,{before:true,paused:true,restored:true,handedOff:true,closed:true,disposals:1,rendererDisposals:1,lateRenders:0,lateUpdates:0});
 await page.waitForFunction(()=>window.nativePreflight.handoffs.length===1);
 report.handoffs=await page.evaluate(()=>window.nativePreflight.handoffs);
 assert.deepEqual(report.handoffs,["esperienze"]);
 assert.deepEqual(report.errors,[]);
 report.status="PASS";
}catch(e){
 report.failure=String(e);process.exitCode=1;
 if(page){
  report.startup??=await page.evaluate(()=>window.nativePreflight??null).catch(()=>null);
  const el=await page.locator("iframe").elementHandle({timeout:2000}).catch(()=>null);
  const frame=el?await el.contentFrame().catch(()=>null):null;
  if(frame)report.lastPhase=await frame.evaluate(()=>typeof nativePhase==="undefined"?"script-not-started":nativePhase).catch(()=>null);
  await page.screenshot({path:join(out,"native-preflight-failure.png"),timeout:5000}).catch(()=>{});
 }
}
finally{
 await browser?.close();
 if(server.listening)await new Promise(r=>server.close(r));
 writeFileSync(join(out,"native-preflight.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report));
}
