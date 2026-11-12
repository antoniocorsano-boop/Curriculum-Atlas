import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve,dirname } from "node:path";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const path=resolve(process.argv[2]||"artifacts/missione118-runtime/Missione118.html");
const manifest=JSON.parse(await readFile(resolve(dirname(path),"manifest.json"),"utf8"));
assert.equal(createHash("sha256").update(await readFile(path)).digest("hex"),manifest.entrypointSha256);
assert.equal(manifest.studentRuntimeAllowed,false);
const browser=await chromium.launch({headless:true});
try{
 for(const [name,viewport] of [["desktop",{width:1280,height:800}],["mobile",{width:393,height:873}]]){
  const context=await browser.newContext({viewport,offline:true,isMobile:name==="mobile",hasTouch:name==="mobile"});
  const requests=[],errors=[];
  await context.route(/^https?:\/\//,route=>{requests.push(route.request().url());return route.abort();});
  await context.addInitScript(()=>{
   window.__printCount=0;window.print=()=>{window.__printCount++};
   Object.defineProperty(window,"speechSynthesis",{get(){throw Error("REMOTE_SPEECH_ACCESSED")}});
   Object.defineProperty(window,"localStorage",{get(){throw Error("STORAGE_ACCESSED_R1")}});
  });
  const page=await context.newPage();
  page.on("pageerror",e=>errors.push(String(e)));
  page.on("request",r=>{if(/^https?:\/\//.test(r.url()))requests.push(r.url())});
  await page.goto(pathToFileURL(path).href);
  const action=name=>page.locator('[data-action="'+name+'"]');
  const click=async name=>{await action(name).click()};
  async function image(){assert.equal(await page.locator(".visual img").evaluate(async i=>{await i.decode();return i.naturalWidth>0}),true)}
  async function choose(index){await action("answer").nth(index).click();await click("advance")}
  await page.locator("#mainTitle").waitFor();
  assert.match(await page.locator("#mainTitle").textContent(),/La città perfetta/);
  await image();
  for(let i=1;i<5;i++){await click("storynext");await image()}
  assert.match(await page.locator("#mainTitle").textContent(),/ultima possibilità/);
  await click("enterMission");
  assert.match(await page.locator("#mainTitle").textContent(),/città che non dorme/);
  await image();await click("begin");
  await action("answer").nth(1).click();await click("retry");
  for(const n of [0,0,0,1,1])await choose(n);
  await click("nextstage");await image();await click("begin");
  for(const n of [0,1,0,1,0,0])await choose(n);
  await click("nextstage");await image();await click("begin");
  for(const n of [1,0,0,1])await choose(n);
  await click("nextstage");await image();await click("begin");
  await action("select-principle").filter({hasText:"Verifica umana"}).click();
  await page.locator("#code").fill("324");
  await page.locator("#codeForm button[type=submit]").click();
  assert.match(await page.locator("#playPane").textContent(),/Il futuro è cambiato/);
  assert.match(await page.locator("#playPane").textContent(),/verifica umana/i);
  await click("print");
  assert.equal(await page.evaluate(()=>window.__printCount),1);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  assert.equal(await page.evaluate(()=>document.querySelectorAll('input[type=file],select,#voiceSelection').length),0);
  await page.reload();
  assert.match(await page.locator("#mainTitle").textContent(),/La città perfetta/);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log(name+" PASS: file offline, five prologue scenes, all three rooms, correction, final code, print, no network/storage/speech access");
  await context.close();
 }
}finally{await browser.close()}
