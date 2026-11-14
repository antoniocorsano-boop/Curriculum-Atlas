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
