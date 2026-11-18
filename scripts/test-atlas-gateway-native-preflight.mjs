// Run the exact generated native scene in the exact opaque sandbox before
// building Next or repeating device tests. No alternate renderer, mock GLB,
// loosened CSP, new service, or external requests.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
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
 assert.deepEqual(Object.keys(report.render.decoded),["shell","scenography","cupola","portals","bays","stars"]);
 assert(report.render.decoded.shell.images>0&&report.render.decoded.shell.textures>0);
 assert(Object.values(report.render.decoded).every(m=>m.decoder==="TextureLoader"));
 assert.equal(report.render.stats.total,495);assert(report.render.stats.culled>0);
 assert(report.render.calls>0&&report.render.triangles>0&&report.render.triangles<1101794&&report.render.sky&&report.render.cupola);
 assert.equal(report.render.glError,0);assert.equal(report.render.contextLost,false);
 assert.deepEqual(report.external,[]);assert.deepEqual(report.errors,[]);
 assert.equal(report.diagnostics.filter(t=>/ATLAS_CSP|ATLAS_NATIVE_FAILURE|Content Security Policy/i.test(t)).length,0,JSON.stringify(report.diagnostics));
 await page.screenshot({path:join(out,"native-preflight.png")});
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
