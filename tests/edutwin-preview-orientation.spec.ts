import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import {createHash} from "node:crypto";
import {mediaDigestInput} from "../src/features/pathways/edutwin-preview-media";

const fixture = JSON.parse(readFileSync("fixtures/studio-atlas-preview/valid/edutwin-orientation.json","utf8"));
const base64="UklGRh4AAABXRUJQVlA4TBEAAAAvH8AHAAdQoMIUqv+BiOh/AAA=";
const sha=(data:string|Buffer)=>createHash("sha256").update(data).digest("hex");
const media={revisionDigest:"b".repeat(64),bindings:[
 {sceneId:"edutwin-opening",assetId:"city",alt:"Città sintetica originale",role:"SETTING" as const},
 {sceneId:"document",assetId:"city",alt:"Ambientazione sintetica del documento",role:"SETTING" as const}
],images:[{assetId:"city",sha256:sha(Buffer.from(base64,"base64")),pixelWidth:32,pixelHeight:32,base64}]};
fixture.edutwinMedia={...media,mediaDigest:sha(mediaDigestInput(fixture,media))};

async function openPreview(page:import("@playwright/test").Page,context:import("@playwright/test").BrowserContext,candidate:unknown,expectReady:boolean){
  await page.setViewportSize({width:390,height:844});
  const studioOrigin="http://127.0.0.1:3100";
  const atlasOrigin="http://127.0.0.1:3000";
  const channel="synthetic-edutwin-orientation-qualification";
  await context.route(studioOrigin+"/",route=>route.fulfill({contentType:"text/html",body:"<!doctype html><title>Studio fixture</title><button id='open'>Apri</button>"}));
  await page.goto(studioOrigin+"/");
  await page.evaluate(({atlasOrigin,channel})=>{
    const host=window as Window & {previewAcks?:number};
    host.previewAcks=0;
    window.addEventListener("message",event=>{if(event.origin===atlasOrigin&&event.data?.type==="STUDIO_ATLAS_PREVIEW_ACK"&&event.data?.channel===channel)host.previewAcks=(host.previewAcks??0)+1;});
    document.querySelector("#open")!.addEventListener("click",()=>{
      (window as Window & {qualificationPreview?:Window|null}).qualificationPreview=window.open(atlasOrigin+"/percorsi/lab/studio-atlas-preview/?channel="+channel,"_blank");
    });
  },{atlasOrigin,channel});
  const [preview]=await Promise.all([page.waitForEvent("popup"),page.getByRole("button",{name:"Apri"}).click()]);
  const runtime=preview.locator(".experience-runtime");
  await expect.poll(async()=>{
    await page.evaluate(({atlasOrigin,channel,candidate})=>{
      (window as Window & {qualificationPreview?:Window|null}).qualificationPreview?.postMessage({type:"STUDIO_ATLAS_PREVIEW_SNAPSHOT",channel,snapshot:candidate},atlasOrigin);
    },{atlasOrigin,channel,candidate});
    return expectReady?runtime.count():preview.getByRole("heading",{name:"Anteprima non disponibile"}).count();
  },{timeout:20000}).toBe(1);
  return {preview,runtime};
}

test("generated EduTwin keeps the first action visible and reveals consequences only after it", async ({page, context}) => {
  const {preview,runtime}=await openPreview(page,context,fixture,true);
  await preview.setViewportSize({width:390,height:844});
  await expect(runtime.getByText("Una visitatrice vuole raggiungere il laboratorio.",{exact:true})).toBeVisible();
  const image=runtime.getByRole("img",{name:"Città sintetica originale"});
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBe(32);
  await expect(runtime.getByText("Ambientazione di riferimento",{exact:true})).toBeVisible();
  await expect(runtime.getByRole("button",{name:"Continua",exact:true})).toHaveCount(0);
  await runtime.getByRole("button",{name:"Raggiungi il punto di incontro"}).click();
  await expect(runtime.locator(".experience-feedback")).toContainText("La missione comincia.");
  await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
  await expect(runtime.getByRole("heading",{name:"Il documento",exact:true})).toBeVisible();
  await expect(runtime.getByRole("img",{name:"Ambientazione sintetica del documento"})).toBeVisible();
  await expect(image).toHaveCount(0);
  await expect(runtime.getByText("La chiusura temporanea non equivale a una cancellazione.",{exact:false})).toHaveCount(0);
  await runtime.getByRole("button",{name:"Apri il documento originale"}).click();
  await expect(runtime.getByRole("heading",{name:"Il documento",exact:true})).toBeVisible();
  await expect(runtime.locator(".experience-feedback")).toContainText("La chiusura temporanea non equivale a una cancellazione.");
  await runtime.getByRole("button",{name:"Prosegui"}).click();
  await expect(runtime.getByRole("heading",{name:"Scegli l'avviso",exact:true})).toBeVisible();
  await expect(runtime.locator("figure.experience-illustration")).toHaveCount(0);
  await expect(runtime.getByText("Il contesto completo aiuta a scegliere.",{exact:false})).toHaveCount(0);
  await runtime.getByRole("radio",{name:"Esponi solo l'inizio"}).check();
  await expect(runtime.locator(".experience-world__status")).toHaveText("Avviso ancora incompleto");
  await expect(runtime.locator(".experience-feedback")).toContainText("Il contesto completo aiuta a scegliere.");
  await runtime.getByRole("button",{name:"Continua",exact:true}).click();
  await expect(runtime.getByRole("heading",{name:"L'orario mancante",exact:true})).toBeVisible();
  await runtime.getByRole("button",{name:"Completa l'orario"}).click();
  await expect(runtime.locator(".experience-feedback")).toContainText("La visitatrice conosce entrambi gli orari.");
  await runtime.getByRole("button",{name:"Prosegui"}).click();
  await expect(runtime.getByRole("heading",{name:"Visita possibile",exact:true})).toBeVisible();
  await expect(runtime.getByText("Verificare la fonte prima di agire.",{exact:true})).toBeVisible();
  await expect(runtime.getByRole("button",{name:"Nuovo percorso"})).toBeVisible();
  expect(await preview.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

test("altered illustrated snapshot is rejected before runtime mount",async({page,context})=>{
 const bad=structuredClone(fixture);bad.edutwinMedia.images[0].base64="AA==";
 const {preview,runtime}=await openPreview(page,context,bad,false);
 await expect(runtime).toHaveCount(0);
 await expect(preview.getByRole("heading",{name:"Anteprima non disponibile"})).toBeVisible();
});

test("tampered retries with unchanged declared digests never receive an ACK",async({page,context})=>{
 const {preview,runtime}=await openPreview(page,context,fixture,true);
 const count=()=>page.evaluate(()=>(window as Window & {previewAcks?:number}).previewAcks??0);
 await expect.poll(count).toBeGreaterThan(0);
 // Allow ACKs already queued by the opening retry loop to arrive.
 await page.waitForTimeout(250);
 const baseline=await count();
 const altered=structuredClone(fixture);
 altered.scenes[0].visibleSituation="Testo sostituito";
 altered.edutwinMedia.images[0].base64="AA==";
 await page.evaluate(({altered,fixture})=>{
  const w=(window as Window & {qualificationPreview?:Window|null}).qualificationPreview;
  const channel="synthetic-edutwin-orientation-qualification";
  const type="STUDIO_ATLAS_PREVIEW_SNAPSHOT",origin="http://127.0.0.1:3000";
  w?.postMessage({type,channel,snapshot:altered},origin);
  w?.postMessage({type,channel,snapshot:fixture},origin);
 },{altered,fixture});
 await expect.poll(count).toBe(baseline+1);
 await expect(runtime.getByText("Una visitatrice vuole raggiungere il laboratorio.",{exact:true})).toBeVisible();
 await expect(runtime.getByText("Testo sostituito",{exact:true})).toHaveCount(0);
 await expect(preview.getByRole("img",{name:"Città sintetica originale"})).toBeVisible();
});

test("invalid stage fields block preview before mount",async({page,context})=>{
 const bad=structuredClone(fixture);delete bad.edutwinMedia;
 bad.scenes[0].stage={visualMode:"CINEMATIC_EDITORIAL",workbench:{prompt:"Test",minEvidence:0}};
 const {runtime}=await openPreview(page,context,bad,false);
 await expect(runtime).toHaveCount(0);
});
test("staged story preserves closure and starts a fresh investigation after restart",async({page,context})=>{
 const candidate=structuredClone(fixture);delete candidate.edutwinMedia;
 candidate.scenes[0].stage={visualMode:"CINEMATIC_EDITORIAL",locations:[{id:"entry",label:"Ingresso",detail:"Vicino all'avviso",position:"ENTRY"}],evidence:[{id:"notice",label:"Avviso originale",detail:"Testo completo",locationId:"entry",kind:"TRACE"}],workbench:{prompt:"Confronta i documenti",minEvidence:1,modes:["COMPARE"]}};
 candidate.scenes.at(-1).stage={visualMode:"CINEMATIC_EDITORIAL"};
 const {runtime}=await openPreview(page,context,candidate,true);
 await expect(runtime.getByRole("button",{name:"Confronta",exact:true})).toBeDisabled();
 await runtime.getByRole("button",{name:"Porta sul banco",exact:true}).click();
 await expect(runtime.getByRole("button",{name:"Confronta",exact:true})).toBeEnabled();
 await runtime.getByRole("button",{name:"Raggiungi il punto di incontro"}).click();
 await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
 await runtime.getByRole("button",{name:"Apri il documento originale"}).click();
 await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
 await runtime.getByRole("radio",{name:"Esponi solo l'inizio"}).check();
 await runtime.getByRole("button",{name:"Continua",exact:true}).click();
 await runtime.getByRole("button",{name:"Completa l'orario"}).click();
 await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
 await expect(runtime.getByText("Il problema è risolto.",{exact:true})).toBeVisible();
 await expect(runtime.getByText("Verificare la fonte prima di agire.",{exact:true})).toBeVisible();
 await runtime.getByRole("button",{name:"Ricomincia",exact:true}).click();
 await expect(runtime.getByRole("button",{name:"Confronta",exact:true})).toBeDisabled();
 await expect(runtime.getByRole("button",{name:"Porta sul banco",exact:true})).toBeVisible();
 await expect(runtime.getByText("0 indizi sul banco",{exact:true})).toBeVisible();
});

test("cinematic choice displays authored world status and immediate consequence",async({page,context})=>{
 const candidate=structuredClone(fixture);delete candidate.edutwinMedia;
 const scene=candidate.scenes.find((s:{interaction:string})=>s.interaction==="CHOICE");
 scene.stage={visualMode:"CINEMATIC_EDITORIAL"};
 const {runtime}=await openPreview(page,context,candidate,true);
 await runtime.getByRole("button",{name:"Raggiungi il punto di incontro",exact:true}).click();
 await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
 await runtime.getByRole("button",{name:"Apri il documento originale",exact:true}).click();
 await runtime.getByRole("button",{name:"Prosegui",exact:true}).click();
 const status=runtime.locator(".experience-causal-rail__status");
 await expect(status).toHaveText("Avviso incompleto");
 await runtime.getByRole("button",{name:"Esponi solo l'inizio",exact:true}).click();
 await expect(status).toHaveText("Avviso ancora incompleto");
});
test("invalid consequence signal detail blocks preview before mounting",async({page,context})=>{
 const candidate=structuredClone(fixture);delete candidate.edutwinMedia;
 const scene=candidate.scenes.find((s:{interaction:string})=>s.interaction==="CHOICE");
 scene.choices[0].worldAfter.signals[0].detail={text:"not a string"};
 const {runtime}=await openPreview(page,context,candidate,false);
 await expect(runtime).toHaveCount(0);
});
