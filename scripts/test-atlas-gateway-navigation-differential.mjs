// Differential diagnosis of the actual local Atlas route, not a substitute for
// the full qualification matrix. No change to runtime, assets or timeouts.
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {performance} from "node:perf_hooks";
import {chromium} from "playwright";
import {parseNativeManifest} from "../src/features/atlas-gateway/native-asset-policy.ts";
const [bundle,out]=process.argv.slice(2);
mkdirSync(out,{recursive:true});
const manifest=parseNativeManifest(JSON.parse(readFileSync(join(bundle,"native-manifest.json"),"utf8")));
assert(manifest);
const origin="http://127.0.0.1:3000";
const expectedAssets=manifest.assets.map(a=>"/atlas-gateway-native/"+a.file).sort();
const heading="Esplora, scopri, comprendi.";
const scenarios=[
 {id:"simplified",reducedMotion:"reduce",action:"direct"},
 {id:"static-direct",reducedMotion:"no-preference",action:"direct"},
 {id:"static-portal",reducedMotion:"no-preference",action:"portal"},
 {id:"animated-portal",reducedMotion:"no-preference",action:"portal",animate:true}
];
const results=[];
const limit=(p,ms)=>{let t;return Promise.race([p,new Promise((_,reject)=>{t=setTimeout(()=>reject(Error("Diagnostic deadline "+ms+"ms")),ms)})]).finally(()=>clearTimeout(t))};
const record=(r,kind,data={})=>r.events.push({ms:Math.round(performance.now()-r.started),kind,...data});
const localPath=url=>{try{const u=new URL(url);return u.origin===origin?u.pathname:null}catch{return null}};
for(const scenario of scenarios){
 const r={id:scenario.id,status:"FAIL",started:performance.now(),events:[],errors:[],external:[],assets:[],checkpoints:{}};
 results.push(r);let browser,context,page,cdp,mainFrame;
 try{
  // Independent Chromium process per scenario: no retained GPU context from
  // an earlier control, no heavy pixel reads or prior camera/animation tests.
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1,reducedMotion:scenario.reducedMotion});
  page=await context.newPage();
  page.on("console",m=>{if(m.type()==="error"||m.text().startsWith("ATLAS_NATIVE_"))record(r,"console",{text:m.text().slice(0,500)})});
  page.on("pageerror",e=>{r.errors.push(e.message);record(r,"pageerror",{text:e.message})});
  page.on("crash",()=>record(r,"crash"));
  page.on("domcontentloaded",()=>record(r,"playwright-domcontentloaded",{path:localPath(page.url())}));
  page.on("load",()=>record(r,"playwright-load",{path:localPath(page.url())}));
  page.on("framenavigated",f=>{if(f===page.mainFrame())record(r,"playwright-main-frame",{path:localPath(f.url())})});
  page.on("request",req=>{const p=localPath(req.url());if(p?.startsWith("/atlas-gateway-native/"))r.assets.push(p);if(p==="/esperienze/")record(r,"request",{resourceType:req.resourceType(),navigation:req.isNavigationRequest()})});
  page.on("response",resp=>{if(localPath(resp.url())==="/esperienze/")record(r,"response",{status:resp.status(),resourceType:resp.request().resourceType()})});
  page.on("requestfailed",req=>{if(localPath(req.url())==="/esperienze/")record(r,"requestfailed",{error:req.failure()?.errorText,resourceType:req.resourceType()})});
  // Block external HTTP(S) only. No interception/continue of local responses.
  await context.route(/^https?:\/\/(?!127\.0\.0\.1:3000(?:\/|$))/,route=>{r.external.push(new URL(route.request().url()).origin);return route.abort()});
  cdp=await context.newCDPSession(page);
  await cdp.send("Page.enable");await cdp.send("Network.enable");await cdp.send("Page.setLifecycleEventsEnabled",{enabled:true});
  mainFrame=(await cdp.send("Page.getFrameTree")).frameTree.frame.id;
  const requests=new Map();
  cdp.on("Network.requestWillBeSent",e=>{if(localPath(e.request.url)==="/esperienze/"&&e.type==="Document"){requests.set(e.requestId,e.loaderId);record(r,"cdp-document-request",{requestId:e.requestId,loaderId:e.loaderId,redirect:Boolean(e.redirectResponse)})}});
  cdp.on("Network.responseReceived",e=>{if(requests.has(e.requestId))record(r,"cdp-document-response",{requestId:e.requestId,status:e.response.status,mimeType:e.response.mimeType})});
  cdp.on("Network.loadingFinished",e=>{if(requests.has(e.requestId))record(r,"cdp-document-finished",{requestId:e.requestId,encodedDataLength:e.encodedDataLength})});
  cdp.on("Network.loadingFailed",e=>{if(requests.has(e.requestId))record(r,"cdp-document-failed",{requestId:e.requestId,error:e.errorText,canceled:Boolean(e.canceled),blockedReason:e.blockedReason??null})});
  cdp.on("Page.frameNavigated",e=>{if(e.frame.id===mainFrame)record(r,"cdp-main-frame",{path:localPath(e.frame.url),loaderId:e.frame.loaderId})});
  cdp.on("Page.lifecycleEvent",e=>{if(e.frameId===mainFrame&&["init","DOMContentLoaded","load"].includes(e.name))record(r,"cdp-lifecycle",{name:e.name,loaderId:e.loaderId})});
  await page.goto(origin+"/gateway/",{waitUntil:"domcontentloaded",timeout:30000});
  if(scenario.id==="simplified"){
   await page.getByRole("status").filter({hasText:"movimento ridotto"}).waitFor({timeout:15000});
   assert.equal(await page.locator("iframe").count(),0);
   assert.deepEqual(r.assets,[]);
   r.checkpoints.ready=true;
  }else{
   const element=page.locator("iframe[title='Biblioteca Atlas tridimensionale']");
   await element.waitFor({state:"visible",timeout:65000});
   const frame=await (await element.elementHandle()).contentFrame();assert(frame);
   await frame.locator("#native-controls").waitFor({state:"visible",timeout:65000});
   await page.waitForFunction(()=>!document.querySelector("[role='status']")?.textContent?.includes("Preparazione della sala"),null,{timeout:15000});
   assert.deepEqual(r.assets.slice().sort(),expectedAssets);
   r.checkpoints.ready=await frame.evaluate(()=>ready&&nativePhase==="ready"&&!motion);
   assert.equal(r.checkpoints.ready,true);
   if(scenario.animate){
    await frame.locator("#atlas-astral-toggle").click();
    assert.equal(await frame.locator("#atlas-astral-toggle").getAttribute("aria-pressed"),"true");
   }
   r.checkpoints.motion=await frame.evaluate(()=>motion);
   assert.equal(r.checkpoints.motion,Boolean(scenario.animate));
   if(scenario.action==="portal"){
    const hit=await frame.evaluate(()=>{
     const p=NATIVE_PORTALS.find(p=>p.id==="esperienze");
     const v=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);
     const x=(v.x+1)*innerWidth/2,y=(1-v.y)*innerHeight/2;
     const c=document.querySelector("canvas"),b=c.getBoundingClientRect();
     return {x,y,hit:hitPortal(x,y),canvasX:b.x,canvasY:b.y,width:b.width,height:b.height};
    });
    assert.equal(hit.hit,"esperienze");
    const box=await frame.locator("canvas").boundingBox();assert(box);
    r.checkpoints.hit=hit;
    r.clickPoint={x:box.x+hit.x-hit.canvasX,y:box.y+hit.y-hit.canvasY};
   }
  }
  // Observe committed URL and DOM separately; do not conflate network
  // response, main-frame commit, DOM readiness and interactive content.
  record(r,"action-start",{action:scenario.action});
  const commit=page.waitForURL("**/esperienze/",{waitUntil:"commit",timeout:30000});
  const click=scenario.id==="simplified"
    ?page.locator(".atlas-gateway-portal").filter({hasText:"Esperienze Atlas"}).getByRole("link").click({timeout:15000})
    :scenario.action==="direct"
      ?page.locator("a[data-portal='esperienze']").click({timeout:15000})
      :page.mouse.click(r.clickPoint.x,r.clickPoint.y);
  await Promise.all([commit,click]);
  r.checkpoints.committed=true;record(r,"url-committed");
  await page.getByRole("heading",{name:heading,exact:true}).waitFor({state:"visible",timeout:30000});
  r.checkpoints.heading=true;record(r,"heading-visible");
  assert.equal(await page.locator("iframe[title='Biblioteca Atlas tridimensionale']").count(),0);
  await page.getByRole("button",{name:"Laboratori",exact:true}).click({timeout:15000});
  await page.getByRole("region",{name:"Risultati della ricerca"}).getByText("Non ci sono ancora esperienze autorizzate in questa sezione.").waitFor({timeout:15000});
  r.checkpoints.interactive=true;
  if(scenario.action==="portal"){
   for(const marker of ["ATLAS_NATIVE_CLOSED","ATLAS_NATIVE_NAV_REQUEST esperienze","ATLAS_NATIVE_NAV_ACCEPT esperienze"])
    assert(r.events.some(e=>e.kind==="console"&&e.text===marker),marker);
  }
  assert.deepEqual(r.errors,[]);assert.deepEqual(r.external,[]);
  r.status="PASS";
 }catch(e){
  r.failure=String(e);record(r,"failure",{text:r.failure.slice(0,500)});
  if(page){
   r.urlAtFailure=page.url();
   try{r.dom=await limit(page.evaluate(()=>({url:location.href,ready:document.readyState,h1:document.querySelector("h1")?.textContent??null,frames:document.querySelectorAll("iframe").length})),3000)}catch(err){r.dom={error:String(err)}}
   try{await limit(page.screenshot({path:join(out,scenario.id+"-failure.png"),timeout:4000}),5000)}catch(err){r.screenshotFailure=String(err)}
  }
 }finally{
  // Keep timing of shutdown separate: ERR_ABORTED during cleanup is not
  // evidence that it caused the earlier navigation failure.
  record(r,"before-cleanup");
  try{await limit(browser?.close()??Promise.resolve(),10000)}catch(e){r.cleanupFailure=String(e)}
  record(r,"after-cleanup");delete r.started;
  writeFileSync(join(out,"navigation-differential.json"),JSON.stringify({schema:"atlas.gateway.navigation-differential/v1",scope:"diagnosis only",results,studentAuthorized:false,publishable:false},null,2)+"\n");
  console.log("ATLAS_NAV_DIFFERENTIAL "+JSON.stringify(r));
 }
}
const allPassed=results.every(r=>r.status==="PASS");
console.log("ATLAS_NAV_DIFFERENTIAL_SUMMARY "+JSON.stringify({allPassed,scenarios:results.map(r=>({id:r.id,status:r.status,checkpoints:r.checkpoints,failure:r.failure??null}))}));
assert(allPassed,"Differential diagnosis contains unresolved scenarios; preserve all evidence before full matrix");
