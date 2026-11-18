import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const baseURL = process.env.ATLAS_GATEWAY_TEST_ORIGIN ?? "http://127.0.0.1:3000";
const expectedOrigin = new URL(baseURL).origin;
const basePath = process.env.ATLAS_GATEWAY_TEST_BASEPATH ?? "";
const evidence = process.env.ATLAS_GATEWAY_EVIDENCE ?? ".atlas-gateway/evidence";
mkdirSync(evidence,{recursive:true});
const browser = await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const results = [];
const failures = [];
async function assertLayout(page, frame, label) {
  const parent = await page.locator("iframe").boundingBox();
  const viewport = page.viewportSize();
  assert(parent && viewport && parent.x >= -1 && parent.y >= -1 && parent.x+parent.width <= viewport.width+1 && parent.y+parent.height <= viewport.height+1, label+" iframe fuori schermo: "+JSON.stringify(parent));
  assert(parent.height >= 180, label+" scena troppo bassa");
  const controls = await frame.locator("#gesture-controls button").evaluateAll(elements => elements.map(el => {
    const r=el.getBoundingClientRect();
    const center=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {label:el.textContent, x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,vw:innerWidth,vh:innerHeight,reachable:el.contains(center)};
  }));
  assert.equal(controls.length,6,label+" comandi di movimento");
  assert.equal(await frame.locator("#atlas-quick").isVisible(),false,label+" navigazione duplicata");
  assert.equal(await frame.locator("#hero-footer").isVisible(),false,label+" medaglione non coperto dal testo");
  const direct=await page.locator(".atlas-gateway-direct").evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {id:el.dataset.portal,x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom,reachable:el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}}));
  assert.deepEqual(direct.map(c=>c.id),["curricolo","esperienze","studio"],label+" destinazioni");
  for(const c of direct)assert(c.x>=-1&&c.y>=-1&&c.right<=viewport.width+1&&c.bottom<=viewport.height+1&&c.w>=40&&c.h>=43&&c.reachable,label+" destinazione non raggiungibile "+JSON.stringify(c));
  for (const c of controls) assert(c.x>=-1 && c.y>=-1 && c.right<=c.vw+1 && c.bottom<=c.vh+1 && c.height>=43 && c.width>=40 && c.reachable,label+" comando non raggiungibile: "+JSON.stringify(c));
  const dimensions=await page.evaluate(()=>{
    const root=document.documentElement, body=document.body, shell=document.querySelector(".atlas-gateway-immersive");
    return {width:innerWidth,height:innerHeight,scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight,
      bodyPaddingBottom:getComputedStyle(body).paddingBottom,shellHeight:shell?.getBoundingClientRect().height};
  });
  assert(dimensions.scrollWidth<=dimensions.width+1 && dimensions.scrollHeight<=dimensions.height+1
    && dimensions.bodyPaddingBottom==="0px" && Math.abs(dimensions.shellHeight-dimensions.height)<=1,
    label+" contratto dimensionale violato: "+JSON.stringify(dimensions));
  return parent;
}
// Poll from Node, not from an injected browser-side predicate. The sandbox CSP
// deliberately rejects string evaluation inside the document.
async function readSceneState(frame) {
  return frame.evaluate(() => {
    if (typeof THREE === "undefined" || typeof renderer === "undefined" || !renderer || !camera) return null;
    return {
      revision: THREE.REVISION,
      calls: renderer.info.render.calls,
      camera: camera.position.toArray(),
      offset: carousel.offset,
      panels: panelGroups.length,
    };
  });
}
async function waitScene(frame, predicate, label, timeout = 30000) {
  const end = Date.now() + timeout;
  let last = null;
  while (Date.now() < end) {
    last = await readSceneState(frame);
    if (last && predicate(last)) return last;
    await delay(150);
  }
  throw new Error(label + ": " + JSON.stringify(last));
}
try {
  for (const device of [
    {name:"small-phone", viewport:{width:320,height:568}, deviceScaleFactor:1, isMobile:true, hasTouch:true},
    {name:"phone", viewport:{width:393,height:873}, deviceScaleFactor:1, isMobile:true, hasTouch:true},
    {name:"phone-landscape", viewport:{width:873,height:393}, deviceScaleFactor:1, isMobile:true, hasTouch:true},
    {name:"tablet", viewport:{width:768,height:1024}, deviceScaleFactor:1, isMobile:true, hasTouch:true},
    {name:"desktop", viewport:{width:1440,height:1000}, deviceScaleFactor:1},
    {name:"large-screen", viewport:{width:1920,height:1080}, deviceScaleFactor:1}
  ]) {
    const {name,...options}=device;
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const external = [];
    try {
    await context.route("**/*",route=>{
      const url=route.request().url();
      if (/^https?:/.test(url) && new URL(url).origin!==expectedOrigin) {
        external.push(url);
        return route.abort();
      }
      return route.continue();
    });
    await page.goto(baseURL+basePath+"/gateway/",{waitUntil:"domcontentloaded"});
    const frameElement=page.locator("iframe[title='Biblioteca Atlas tridimensionale']");
    await frameElement.waitFor({state:"visible",timeout:60000});
    const handle=await frameElement.elementHandle();
    const frame=await handle.contentFrame();
    assert(frame,"iframe disponibile");
    await waitScene(frame, state => state.calls > 0, "Primo rendering WebGL", 60000);
    await page.waitForFunction(()=>!document.querySelector("[role='status']")?.textContent?.includes("Preparazione della sala"),null,{timeout:60000});
    await frame.locator("#loader").waitFor({state:"hidden",timeout:60000});
    const initial=await waitScene(frame, state => state.calls > 0, "Scena pronta");
    assert.equal(initial.revision,"128");
    assert.equal(initial.panels,3);
    assert(initial.calls>0);
    const beforeNotice=await assertLayout(page,frame,name);
    await page.screenshot({path:evidence+"/"+name+"-sala.png",animations:"disabled"});
    await frame.locator("#cycle-next").click();
    const after=await waitScene(frame, state => Math.abs(state.offset - 1) < 0.025, "Assestamento portali");
    assert(initial.camera.every((v,i)=>Math.abs(v-after.camera[i])<0.03),"rotazione portali non altera la posizione camera");
    await frame.locator("#reset-view").click();
    await waitScene(frame, state => Math.abs(state.offset) < 0.025, "Ripristino panoramica");
    // Click the real semantic 3D object, rather than the removed duplicate toolbar.
    const point=await frame.evaluate(()=>{scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);const p=panelGroups[2].getWorldPosition(new THREE.Vector3()).project(camera);const x=(p.x+1)*innerWidth/2,y=(1-p.y)*innerHeight/2;return {x,y,hit:hitPanel(x,y)}});
    assert.equal(point.hit,2,name+" hit test Studio");
    await frame.locator("canvas").click({position:{x:point.x,y:point.y}});
    await page.getByRole("status").filter({hasText:"accesso professionale non ancora abilitato"}).waitFor({timeout:30000});
    assert(page.url().includes("/gateway"));
    const afterNotice=await assertLayout(page,frame,name+" dopo messaggio Studio");
    assert(Math.abs(beforeNotice.y-afterNotice.y)<1 && Math.abs(beforeNotice.height-afterNotice.height)<1,name+" la notifica sposta la sala");
    await page.screenshot({path:evidence+"/"+name+"-studio.png",animations:"disabled"});
    if (name === "phone") {
      await page.setViewportSize({width:873,height:393});
      await waitScene(frame, state => state.calls > 0, "Rotazione schermo");
      await assertLayout(page,frame,"telefono ruotato durante la sessione");
      await page.screenshot({path:evidence+"/phone-rotated.png",animations:"disabled"});
      await page.setViewportSize(device.viewport);
      await waitScene(frame, state => state.calls > 0, "Ritorno verticale");
      await assertLayout(page,frame,"telefono tornato verticale");
    }
    await page.locator('.atlas-gateway-direct[data-portal="esperienze"]').click();
    await page.waitForURL("**/esperienze/",{timeout:60000});
    await page.getByRole("heading",{name:"Esplora, scopri, comprendi."}).waitFor();
    await page.getByRole("button",{name:"Laboratori",exact:true}).click();
    await page.getByRole("region",{name:"Risultati della ricerca"}).getByText("Non ci sono ancora esperienze autorizzate in questa sezione.").waitFor();
    await page.screenshot({path:evidence+"/"+name+"-esperienze.png",animations:"disabled"});
    assert.equal(external.length,0,"nessuna richiesta HTTP a origini terze");
    results.push({device:name,revision:initial.revision,drawCalls:initial.calls,panels:initial.panels,layout:"PASS",stableNotice:"PASS",carousel:"PASS",studio:"PASS",experiences:"PASS",externalRequests:external.length});
    } catch (error) {
      const detail=error instanceof Error ? error.message : String(error);
      failures.push({device:name,error:detail});
      results.push({device:name,status:"FAIL",error:detail});
      console.error(name+": "+detail);
      await page.screenshot({path:evidence+"/"+name+"-failure.png",animations:"disabled"}).catch(()=>{});
    } finally { await context.close(); }
  }
  const recovery=await browser.newContext({viewport:{width:393,height:873},hasTouch:true,isMobile:true});
  const recoveryPage=await recovery.newPage();
  try {
    await recoveryPage.goto(baseURL+basePath+"/gateway/");
    const locator=recoveryPage.locator("iframe[title='Biblioteca Atlas tridimensionale']");
    await locator.waitFor({state:"visible",timeout:60000});
    const initialFrame=await (await locator.elementHandle()).contentFrame();
    await waitScene(initialFrame, state=>state.calls>0,"Preparazione recupero",60000);
    await recoveryPage.setViewportSize({width:280,height:600});
    await recoveryPage.getByRole("status").filter({hasText:"spazio disponibile è insufficiente"}).waitFor();
    await locator.waitFor({state:"detached"});
    await recoveryPage.setViewportSize({width:393,height:873});
    await recoveryPage.getByRole("button",{name:"Attiva la sala 3D"}).click();
    await locator.waitFor({state:"visible",timeout:60000});
    const recoveredFrame=await (await locator.elementHandle()).contentFrame();
    await waitScene(recoveredFrame,state=>state.calls>0,"Ripristino motore",60000);
    const lost=await recoveredFrame.evaluate(()=>{
      const extension=renderer.getContext().getExtension("WEBGL_lose_context");
      if (!extension) return false;
      extension.loseContext();
      return true;
    });
    assert(lost,"Estensione perdita contesto non disponibile");
    await recoveryPage.getByRole("status").filter({hasText:"Motore 3D non disponibile"}).waitFor({timeout:30000});
    await locator.waitFor({state:"detached"});
    await recoveryPage.getByRole("navigation",{name:"Accedi agli ambienti Atlas"}).getByRole("link",{name:"Entra →"}).first().click();
    await recoveryPage.waitForURL("**/curricolo/");
    results.push({device:"recovery",constrainedViewport:"PASS",restart:"PASS",contextLoss:"PASS",curricolo:"PASS"});
  } catch (error) {
    const detail=error instanceof Error ? error.message : String(error);
    failures.push({device:"recovery",error:detail});
    results.push({device:"recovery",status:"FAIL",error:detail});
    await recoveryPage.screenshot({path:evidence+"/recovery-failure.png"}).catch(()=>{});
  } finally { await recovery.close(); }
  const reduced=await browser.newContext({reducedMotion:"reduce",viewport:{width:393,height:873}});
  const page=await reduced.newPage();
  try {
  await page.goto(baseURL+basePath+"/gateway/");
  await page.getByRole("status").filter({hasText:"movimento ridotto"}).waitFor();
  assert.equal(await page.locator("iframe").count(),0);
  await page.getByRole("navigation",{name:"Accedi agli ambienti Atlas"}).getByRole("link",{name:"Entra →"}).first().click();
  await page.waitForURL("**/curricolo/");
  results.push({device:"reduced-motion",fallback:"PASS",curricolo:"PASS"});
  } catch (error) {
    const detail=error instanceof Error ? error.message : String(error);
    failures.push({device:"reduced-motion",error:detail});
    results.push({device:"reduced-motion",status:"FAIL",error:detail});
    await page.screenshot({path:evidence+"/reduced-motion-failure.png"}).catch(()=>{});
  } finally { await reduced.close(); }
} finally {
  writeFileSync(evidence+"/results.json",JSON.stringify({results,failures,studentAuthorized:false},null,2)+"\n");
  await browser.close();
}
console.log(JSON.stringify(results,null,2));
assert.equal(failures.length,0,"Qualificazione incompleta: "+JSON.stringify(failures));
