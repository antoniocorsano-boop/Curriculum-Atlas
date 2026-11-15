import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

const root=fs.realpathSync(process.argv[2]??"out");
const route="revisione/energia";
const sourcePath=path.join(root,route,"esperienza.html");
const assembled=process.argv[3]==="--assembled";
const targets=["libro","energia","laboratorio-energia","mappa-energia","scheda-energia","universo-energia","libro-docente"];
// Shell-only CI checks the actual compiled Next navigation against a tiny non-content fixture.
// An assembled local review must instead use the exact attached edition.
if(assembled)assert.ok(fs.existsSync(sourcePath),"Assembled review edition missing");
else {assert.ok(!fs.existsSync(sourcePath),"Unexpected full edition in CI");fs.writeFileSync(sourcePath,'<!doctype html><html lang="it"><title>Fixture di collegamento</title><h1>Fixture, non opera</h1></html>',{flag:"wx"});}
const types={".html":"text/html; charset=utf-8",".js":"text/javascript",".css":"text/css",".json":"application/json",".txt":"text/plain; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer((req,res)=>{try{const url=new URL(req.url,"http://127.0.0.1");let file=path.resolve(root,"."+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,"index.html");if(!fs.existsSync(file)){res.writeHead(404).end();return;}res.setHeader("Content-Type",types[path.extname(file)]??"application/octet-stream");fs.createReadStream(file).pipe(res);}catch{res.writeHead(500).end();}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,430,1920]){
  const page=await browser.newPage({viewport:{width,height:width===1920?1080:932}});const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(origin+"/",{waitUntil:"domcontentloaded"});
  const entry=page.locator('a[data-review-boundary="ATLAS_ENERGIA_REVIEW_ONLY_V1"]');await entry.click();await page.waitForURL(`**/${route}/`);
  await page.locator('.atlas-energy-review h1').waitFor();assert.equal(await page.locator('.energy-review-card').count(),4);
  for(const scale of [100,200]){await page.evaluate(n=>document.documentElement.style.fontSize=n+"%",scale);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Native review overflow ${width}/${scale}`);}
  for(const target of targets){
   const href=`/revisione/energia/esperienza.html#${target}`;
   await page.locator(`.atlas-energy-review a[href="${href}"]`).click();await page.waitForURL(`**/esperienza.html#${target}`);
   if(assembled){const visible=target.startsWith("libro-")?"#libro":"#"+target;await page.locator(visible).waitFor({state:"visible"});}
   else assert.equal(await page.locator("h1").innerText(),"Fixture, non opera");
   await page.goBack();await page.locator('.atlas-energy-review h1').waitFor();
  }
  if(assembled){await page.locator('a[href="/revisione/energia/esperienza.html#universo-energia"]').click();await page.locator('#universo-energia [data-atlas-native-return]').click();await page.locator('.atlas-energy-review h1').waitFor();}
  await page.locator('.energy-review-back').click();await page.waitForURL(origin+"/");assert.deepEqual(errors,[]);await page.close();console.log("PASS",width,assembled?"assembled":"shell fixture");
 }
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));if(!assembled)fs.rmSync(sourcePath,{force:true});}
