import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {chromium} from "playwright";
import sharp from "sharp";
import {parseNativeManifest,nativeRequest} from "../src/features/atlas-gateway/native-asset-policy.ts";
const [bundle,out,perfBufferMode]=process.argv.slice(2);
assert(!perfBufferMode||["retained","transient"].includes(perfBufferMode));
const perfDiagnostic=Boolean(perfBufferMode);
const manifest=parseNativeManifest(JSON.parse(readFileSync(bundle+"/native-manifest.json","utf8")));
assert(manifest);assert.equal(manifest.assets.length,8);
const channel="a".repeat(48);
assert.equal(nativeRequest({type:"atlas-native-asset-request",channel,id:"shell"},channel,manifest)?.id,"shell");
for(const data of [{type:"atlas-native-asset-request",channel:"wrong",id:"shell"},{type:"atlas-native-asset-request",channel,id:"../shell"},{type:"atlas-native-asset-request",channel,id:"https://example.invalid/asset"}])assert.equal(nativeRequest(data,channel,manifest),null);
assert.equal(parseNativeManifest({...manifest,assets:manifest.assets.map((a,i)=>i===0?{...a,file:"../escape.glb"}:a)}),null);
assert.equal(parseNativeManifest({...manifest,assets:manifest.assets.map((a,i)=>i===0?{...a,bytes:40000001}:a)}),null);
assert.equal(parseNativeManifest({...manifest,studentAuthorized:true}),null);
mkdirSync(out,{recursive:true});
const launch=()=>chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const browser=await launch();
const origin="http://127.0.0.1:3000",results=[],failures=[];
let destinationControl=null;
const bounded=(promise,ms=3000)=>Promise.race([promise.catch(e=>({error:String(e)})),new Promise(r=>setTimeout(()=>r({timeout:true}),ms))]);
const expectedFiles=manifest.assets.map(a=>"/atlas-gateway-native/"+a.file).sort();
async function inspect(page,device){
 const frameElement=page.locator("iframe[title='Biblioteca Atlas tridimensionale']");
 await frameElement.waitFor({state:"visible",timeout:65000});
 const frame=await (await frameElement.elementHandle()).contentFrame();
 assert(frame);
 await frame.locator("#native-status").waitFor({state:"hidden",timeout:65000});
 await frame.locator("#native-controls").waitFor({state:"visible"});
 await page.waitForFunction(()=>!document.querySelector("[role='status']")?.textContent?.includes("Preparazione della sala"),null,{timeout:15000});
 const m=await frame.evaluate(()=>{
   const gl=renderer.getContext(),stats=visibility.update(camera);
   let meshes=0,vertices=0;starGroup.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count}});
   const controls=[...document.querySelectorAll("#native-controls button")].map(b=>{const r=b.getBoundingClientRect();return {h:r.height,reachable:b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}});
   const centers=NATIVE_ANCHORS.map(a=>{const p=new THREE.Vector3(a.center[0],a.center[2],-a.center[1]).project(camera);return {id:a.id,inFrame:Math.abs(p.x)<1&&Math.abs(p.y)<1&&Math.abs(p.z)<1}});
   const hits=NATIVE_PORTALS.map(p=>{const v=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);const x=(v.x+1)*innerWidth/2,y=(1-v.y)*innerHeight/2;return {id:p.id,x,y,hit:hitPortal(x,y)}});
   const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
   function capture(){renderer.render(scene,camera);const b=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error("WebGL");return b}
   const baseline=capture(),calls=renderer.info.render.calls,triangles=renderer.info.render.triangles;
   function effect(o){o.visible=false;const b=capture();o.visible=true;let count=0;for(let i=0;i<b.length;i+=4)if(Math.abs(b[i]-baseline[i])+Math.abs(b[i+1]-baseline[i+1])+Math.abs(b[i+2]-baseline[i+2])>12)count++;return count}
   const cupola=effect(groupMap.cupola),stars=effect(starGroup),lights=effect(als.object);capture();
   return {revision:THREE.REVISION,stats,calls,triangles,meshes,vertices,points:als.object.geometry.attributes.position.count,cupola,stars,lights,sky:!!scene.background,centers,hits,controls,motion,decoded:nativeDecoded,phase:nativePhase,preserved:gl.getContextAttributes().preserveDrawingBuffer,raster:{...renderBudget},actualBuffer:[w,h],css:[innerWidth,innerHeight],canvasRect:[canvas.getBoundingClientRect().width,canvas.getBoundingClientRect().height]};
 });
 assert.equal(m.phase,"ready");
 assert.equal(m.raster.maxPixels,1048576);const [cw,ch]=m.css,[bw,bh]=m.actualBuffer;const scale=Math.min(1,Math.sqrt(1048576/(cw*ch)));
 assert.deepEqual([bw,bh],[Math.max(1,Math.floor(cw*scale)),Math.max(1,Math.floor(ch*scale))]);assert.deepEqual(m.canvasRect,m.css);assert.equal(m.raster.bufferWidth,bw);assert.equal(m.raster.bufferHeight,bh);assert(bw*bh<=1048576);assert.equal(m.raster.fenceSupported,true,"Chromium WebGL2 fence unavailable");assert.deepEqual(Object.keys(m.decoded),["shell","scenography","cupola","portals","bays","stars"]);assert(m.decoded.shell.images>0&&m.decoded.shell.textures>0);assert(Object.values(m.decoded).every(d=>d.decoder==="TextureLoader"));
 assert.equal(m.revision,"128");assert.equal(m.meshes,3);assert.equal(m.vertices,9956);assert.equal(m.points,18);
 assert.equal(m.stats.total,495);assert(m.stats.culled>0);assert(m.triangles<1101794);assert(m.calls>0&&m.calls<=100);
 assert(m.cupola>0&&m.stars>0&&m.lights>0&&m.sky);assert(m.centers.every(c=>c.inFrame),JSON.stringify(m.centers));assert(m.hits.every(h=>h.hit===h.id),JSON.stringify(m.hits));assert(m.controls.every(c=>c.h>=44&&c.reachable));assert.equal(m.motion,false);
 await page.screenshot({path:out+"/"+device+"-native.png"});
 if(perfDiagnostic){
   assert.equal(m.preserved,perfBufferMode==="retained","Actual WebGL context attribute mismatch");
   const target=frame.locator("canvas");
   const before=await target.screenshot({path:out+"/"+device+"-canvas-before.png",timeout:15000});
   const frames=await frame.evaluate(()=>renderBudget.frames);
   // Explicit idle interval: no redraw/readback during compositor persistence probe.
   await new Promise(r=>setTimeout(r,1200));
   const after=await target.screenshot({path:out+"/"+device+"-canvas-idle.png",timeout:15000});
   assert.equal(await frame.evaluate(()=>renderBudget.frames),frames,"Unexpected redraw in idle persistence probe");
   const decode=async x=>sharp(x).removeAlpha().raw().toBuffer({resolveWithObject:true});
   const a=await decode(before),b=await decode(after);assert.deepEqual(a.info,b.info);
   let delta=0,min=255,max=0;for(let i=0;i<a.data.length;i++){delta+=Math.abs(a.data[i]-b.data[i]);min=Math.min(min,b.data[i]);max=Math.max(max,b.data[i]);}
   m.idlePersistence={meanAbsoluteRGBDelta:delta/a.data.length/255,range:max-min,width:b.info.width,height:b.info.height,frames};
   assert(m.idlePersistence.range>32,"Canvas screenshot blank or uniform");assert(m.idlePersistence.meanAbsoluteRGBDelta<=.005,"Composited scene changed during idle");
 }
 await frame.locator('[data-action="right"]').click();
 const moved=await frame.evaluate(()=>angle);
 assert(moved>0);
 await frame.locator('[data-action="reset"]').click();assert.equal(await frame.evaluate(()=>angle),0);
 const toggle=frame.locator("#atlas-astral-toggle");
 await toggle.click();assert.equal(await toggle.getAttribute("aria-pressed"),"true");await toggle.click();assert.equal(await toggle.getAttribute("aria-pressed"),"false");
 return {frame,m};
}
try{
 // Establish the independent destination baseline before creating a WebGL scene.
 const control=await browser.newContext({viewport:{width:1920,height:1080}});
 try{
  const p=await control.newPage();const response=await p.goto(origin+"/esperienze/",{waitUntil:"domcontentloaded",timeout:30000});
  await p.getByRole("heading",{name:"Esplora, scopri, comprendi.",exact:true}).waitFor({state:"visible",timeout:15000});
  destinationControl={status:response.status(),title:await p.locator("h1").innerText(),url:p.url()};
  assert.equal(destinationControl.status,200);
 }finally{await control.close()}
 for(const device of [...["large","large-repeat-2","large-repeat-3"].map(name=>({name,viewport:{width:1920,height:1080}})),{name:"compact",viewport:{width:320,height:568},isMobile:true,hasTouch:true},{name:"phone",viewport:{width:393,height:873},isMobile:true,hasTouch:true},{name:"landscape",viewport:{width:873,height:393},isMobile:true,hasTouch:true},{name:"tablet",viewport:{width:768,height:1024},isMobile:true,hasTouch:true},{name:"desktop",viewport:{width:1440,height:1000}}]){
  // Isolate each format in its own Chromium process, as in the differential test.
  // Keep the combined graphics + navigation workload and the same deadlines.
  const deviceBrowser=await launch();
  const {name,...opts}=device,context=await deviceBrowser.newContext({...opts,deviceScaleFactor:1}),page=await context.newPage();
  const external=[],assets=[],errors=[],diagnostics=[],routeEvents=[];
  page.on("response",r=>{if(r.url().includes("/esperienze")||r.url().includes("/curricolo"))routeEvents.push({url:r.url(),status:r.status(),resourceType:r.request().resourceType()})});
  page.on("requestfailed",r=>routeEvents.push({url:r.url(),failure:r.failure()?.errorText}));
  page.on("crash",()=>routeEvents.push({crash:true}));
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{const t=m.text();if(m.type()==="error"||t.startsWith("ATLAS_NATIVE_"))diagnostics.push(t);if(t==="ATLAS_NATIVE_FRAME_DETACHED"||t==="ATLAS_NATIVE_DOCUMENT_NAV_START"||t==="ATLAS_NATIVE_DETACH_BEGIN"||t==="ATLAS_NATIVE_CLOSED"||t.startsWith("ATLAS_NATIVE_NAV_ACCEPT "))routeEvents.push({checkpoint:t,at:Date.now()});});
  // Observe local requests passively. Routing every local response changes
  // Chromium request scheduling and disables its HTTP cache.
  page.on("request",req=>{const u=new URL(req.url());if(u.origin===origin&&u.pathname.startsWith("/atlas-gateway-native/"))assets.push(u.pathname);if(u.origin===origin&&req.isNavigationRequest()&&req.resourceType()==="document"&&["/esperienze/","/curricolo/"].includes(u.pathname))routeEvents.push({checkpoint:"document-request",path:u.pathname,at:Date.now()});});
  await context.route(/^https?:\/\/(?!127\.0\.0\.1:3000(?:\/|$))/,route=>{external.push(route.request().url());return route.abort()});
  page.on("framenavigated",f=>{if(f===page.mainFrame())routeEvents.push({checkpoint:"main-frame",url:f.url(),at:Date.now()})});
  page.on("domcontentloaded",()=>routeEvents.push({checkpoint:"domcontentloaded",url:page.url(),at:Date.now()}));
  try{
   await page.goto(origin+"/gateway/",{waitUntil:"domcontentloaded"});
   const {frame,m}=await inspect(page,name);
   assert.deepEqual(assets.slice().sort(),expectedFiles);
   assert.equal(external.length,0);assert.equal(errors.length,0,JSON.stringify(errors));assert.equal(diagnostics.filter(t=>/ATLAS_CSP|ATLAS_NATIVE_FAILURE|Content Security Policy/i.test(t)).length,0,JSON.stringify(diagnostics));
   const studio=m.hits.find(h=>h.id==="studio");await frame.locator("canvas").click({position:{x:studio.x,y:studio.y}});
   await page.getByRole("status").filter({hasText:"accesso professionale non ancora abilitato"}).waitFor({timeout:15000});
   const esperienze=m.hits.find(h=>h.id==="esperienze");
   // Reproduce the previous large-screen failure with animation still active.
   if(name.startsWith("large")){
     const toggle=frame.locator("#atlas-astral-toggle");const framesBefore=await frame.evaluate(()=>renderBudget.animationFrames);await toggle.click();assert.equal(await toggle.getAttribute("aria-pressed"),"true");
     if(perfDiagnostic){
       // A toggled control is not proof that animation submitted a frame.
       await frame.waitForFunction(n=>renderBudget.animationFrames>n,framesBefore,{timeout:15000});
       m.animationEvidence={before:framesBefore,after:await frame.evaluate(()=>renderBudget.animationFrames)};
     }
   }
   // Keep the original five full readbacks and all interaction/departure deadlines.
    const transitionStarted=Date.now();
   routeEvents.push({checkpoint:"portal-action",at:transitionStarted});
   await Promise.all([page.waitForURL("**/esperienze/",{waitUntil:"commit",timeout:30000}),frame.locator("canvas").click({position:{x:esperienze.x,y:esperienze.y}})]);
   routeEvents.push({checkpoint:"commit-observed",at:Date.now(),url:page.url()});
   const remaining=30000-(Date.now()-transitionStarted);
   assert(remaining>0,"Navigation exceeded existing 30 s deadline");
   await page.waitForLoadState("domcontentloaded",{timeout:remaining});
   routeEvents.push({checkpoint:"dom-observed",at:Date.now(),url:page.url()});
   await page.getByRole("heading",{name:"Esplora, scopri, comprendi.",exact:true}).waitFor({state:"visible",timeout:30000});
   await page.locator("iframe[title='Biblioteca Atlas tridimensionale']").waitFor({state:"detached",timeout:10000});
   await page.getByRole("button",{name:"Laboratori",exact:true}).click();
   await page.getByRole("region",{name:"Risultati della ricerca"}).getByText("Non ci sono ancora esperienze autorizzate in questa sezione.").waitFor();
   assert.equal(external.length,0);assert.deepEqual(errors,[]);assert.equal(diagnostics.filter(t=>/ATLAS_CSP|ATLAS_NATIVE_FAILURE|ALS-01 disposed|Content Security Policy/i.test(t)).length,0,JSON.stringify(diagnostics));
   assert(diagnostics.includes("ATLAS_NATIVE_CLOSED"),"Native scene did not quiesce");
   assert(diagnostics.includes("ATLAS_NATIVE_NAV_REQUEST esperienze"),"Native portal did not send the request");
   assert(diagnostics.includes("ATLAS_NATIVE_NAV_ACCEPT esperienze"),"Parent did not accept the portal request");
   function assertDetachedBeforeDocument(path){
     const request=routeEvents.findIndex(e=>e.checkpoint==="document-request"&&e.path===path);
     const start=routeEvents.findLastIndex((e,i)=>i<request&&e.checkpoint==="ATLAS_NATIVE_DOCUMENT_NAV_START");
     const detached=routeEvents.findLastIndex((e,i)=>i<start&&e.checkpoint==="ATLAS_NATIVE_FRAME_DETACHED");
     assert(detached>=0&&detached<start&&start<request,"Expected committed frame removal before document request: "+path);
   }
   assertDetachedBeforeDocument("/esperienze/");
   assert(routeEvents.some(e=>e.resourceType==="document"&&e.status===200&&new URL(e.url).pathname==="/esperienze/"),"Expected full document navigation");
   if(name.startsWith("large")){
     await page.goBack({waitUntil:"domcontentloaded",timeout:30000});
     await page.waitForURL("**/gateway/",{waitUntil:"domcontentloaded",timeout:30000});
     const backFrame=page.frameLocator("iframe[title='Biblioteca Atlas tridimensionale']");
     await backFrame.locator("#native-controls").waitFor({state:"visible",timeout:65000});
     await page.waitForFunction(()=>!document.querySelector("[role='status']")?.textContent?.includes("Preparazione della sala"),null,{timeout:15000});
     const backState=await page.locator("iframe[title='Biblioteca Atlas tridimensionale']").elementHandle();
     const restored=await backState.contentFrame();
     assert.equal(await restored.evaluate(()=>nativePhase),"ready");
     await Promise.all([page.waitForURL("**/curricolo/",{waitUntil:"domcontentloaded",timeout:30000}),page.locator("a[data-portal='curricolo']").click()]);
     await page.getByRole("heading",{name:"Il curricolo dell’istituto",exact:true}).waitFor({state:"visible",timeout:15000});
     assert(routeEvents.some(e=>e.resourceType==="document"&&e.status===200&&new URL(e.url).pathname==="/curricolo/"));
     assertDetachedBeforeDocument("/curricolo/");
     assert.equal(await page.locator("iframe[title='Biblioteca Atlas tridimensionale']").count(),0);
     assert.deepEqual(errors,[]);assert.equal(external.length,0);
   }
   results.push({device:name,...m,assets:assets.length,external:external.length,portal:"PASS",navigationTeardown:"PASS",diagnostics,routeEvents});
  }catch(e){const dom=await bounded(page.evaluate(()=>({url:location.href,readyState:document.readyState,headings:[...document.querySelectorAll("h1")].map(h=>({text:h.textContent,rect:h.getBoundingClientRect().toJSON(),display:getComputedStyle(h).display,visibility:getComputedStyle(h).visibility})),iframes:document.querySelectorAll("iframe").length,notice:document.querySelector(".atlas-gateway-notice")?.textContent??null,body:document.body?.innerText.slice(0,1500)})));failures.push({device:name,error:String(e),errors,external,assets,dom,diagnostics,routeEvents});await bounded(page.screenshot({path:out+"/"+name+"-failure.png",timeout:5000}),6000);}
  finally{try{await context.close()}finally{await deviceBrowser.close()}}
  // Stop after the previously failing large-screen case; do not repeat five
  // expensive runs while the targeted regression remains unresolved.
  if(name.startsWith("large")&&failures.length)throw Error("Targeted large-screen regression failed");
 }
 // Integrity rejection exercises the real parent fallback, not a mocked
 // renderer. A one-byte modification preserves length but fails SHA-256.
 const context=await browser.newContext({viewport:{width:800,height:800}});
 const page=await context.newPage();
 await page.route("**/atlas-gateway-native/sky-*.png",async route=>{const response=await route.fetch(),body=Buffer.from(await response.body());body[body.length-1]^=1;await route.fulfill({response,body})});
 await page.goto(origin+"/gateway/",{waitUntil:"domcontentloaded"});
 await page.getByRole("status").filter({hasText:"Risorsa della sala 3D non disponibile o non integra"}).waitFor({timeout:65000});
 assert.equal(await page.locator("iframe").count(),0);
 assert.equal(await page.locator(".atlas-gateway-portal").count(),3);
 await context.close();
 results.push({integrityFallback:"PASS"});
 const reduced=await browser.newContext({viewport:{width:800,height:800},reducedMotion:"reduce"});
 const p=await reduced.newPage();await p.goto(origin+"/gateway/");
 await p.getByRole("status").filter({hasText:"movimento ridotto"}).waitFor({timeout:15000});
 assert.equal(await p.locator("iframe").count(),0);await reduced.close();results.push({reducedMotionFallback:"PASS"});
}finally{
 await browser.close();
 writeFileSync(out+"/native-gateway-receipt.json",JSON.stringify({status:failures.length?"FAIL":"PASS",scope:"local-native-P1-spatial",perfBufferMode:perfBufferMode??null,studentAuthorized:false,publishable:false,destinationControl,results,failures},null,2)+"\n");
 console.log(JSON.stringify({destinationControl,results,failures}));
}
assert.equal(failures.length,0,JSON.stringify(failures));assert.equal(results.length,10);
