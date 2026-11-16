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
    {name:"desktop", viewport:{width:1440,height:1000}, deviceScaleFactor:1},
    {name:"mobile", viewport:{width:393,height:873}, deviceScaleFactor:1, isMobile:true, hasTouch:true}
  ]) {
    const {name,...options}=device;
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const external = [];
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
    await page.screenshot({path:evidence+"/"+name+"-sala.png",animations:"disabled"});
    await frame.locator("#cycle-next").click();
    const after=await waitScene(frame, state => Math.abs(state.offset - 1) < 0.025, "Assestamento portali");
    assert(initial.camera.every((v,i)=>Math.abs(v-after.camera[i])<0.03),"rotazione portali non altera la posizione camera");
    await frame.locator("#reset-view").click();
    await waitScene(frame, state => Math.abs(state.offset) < 0.025, "Ripristino panoramica");
    await frame.locator('[data-atlas="studio"]').click();
    await page.getByRole("status").filter({hasText:"accesso professionale non ancora abilitato"}).waitFor({timeout:30000});
    assert(page.url().includes("/gateway"));
    await frame.locator('[data-atlas="esperienze"]').click();
    await page.waitForURL("**/esperienze/",{timeout:60000});
    await page.getByRole("heading",{name:"Esplora, scopri, comprendi."}).waitFor();
    await page.getByRole("button",{name:"Laboratori",exact:true}).click();
    await page.getByRole("region",{name:"Risultati della ricerca"}).getByText("Non ci sono ancora esperienze autorizzate in questa sezione.").waitFor();
    await page.screenshot({path:evidence+"/"+name+"-esperienze.png",animations:"disabled"});
    assert.equal(external.length,0,"nessuna richiesta HTTP a origini terze");
    results.push({device:name,revision:initial.revision,drawCalls:initial.calls,panels:initial.panels,carousel:"PASS",studio:"PASS",experiences:"PASS",externalRequests:external.length});
    await context.close();
  }
  const reduced=await browser.newContext({reducedMotion:"reduce",viewport:{width:393,height:873}});
  const page=await reduced.newPage();
  await page.goto(baseURL+basePath+"/gateway/");
  await page.getByRole("status").filter({hasText:"movimento ridotto"}).waitFor();
  assert.equal(await page.locator("iframe").count(),0);
  await page.getByRole("navigation",{name:"Accedi agli ambienti Atlas"}).getByRole("link",{name:"Entra →"}).first().click();
  await page.waitForURL("**/curricolo/");
  results.push({device:"reduced-motion",fallback:"PASS",curricolo:"PASS"});
  await reduced.close();
} finally {
  writeFileSync(evidence+"/results.json",JSON.stringify({results,studentAuthorized:false},null,2)+"\n");
  await browser.close();
}
console.log(JSON.stringify(results,null,2));
