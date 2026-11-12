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
  const palette=await page.locator(".crawl-box").evaluate(box=>{
   const css=el=>getComputedStyle(el);
   const luminance=value=>{
    const rgb=value.match(/\d+/g).slice(0,3).map(Number).map(x=>{const v=x/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});
    return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
   };
   const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
   const bg=css(box).backgroundColor;
   return {bg,text:css(box.querySelector(".crawl-text p")).color,mask:css(box.querySelector(".crawl-window")).maskImage,
    textContrast:contrast(css(box.querySelector(".crawl-text p")).color,bg),
    labelContrast:contrast(css(box.querySelector("strong")).color,bg),
    statusContrast:contrast(css(box.querySelector(".crawl-status")).color,bg),
    buttonContrast:contrast(css(box.querySelector("button")).color,css(box.querySelector("button")).backgroundColor)};
  });
  assert.equal(palette.bg,"rgb(207, 232, 255)");
  assert.equal(palette.text,"rgb(17, 17, 17)");
  assert.equal(palette.mask,"none");
  for(const key of ["textContrast","labelContrast","statusContrast","buttonContrast"])assert.ok(palette[key]>=7,key+" "+palette[key]);
  console.log(name+" narrative contrast PASS "+JSON.stringify(palette));
  assert.equal(await page.locator(".stage.prologue").count(),1);
  assert.equal(await page.locator("#playPane .action-title").count(),0);
  const layout=await page.locator(".stage.prologue").evaluate(stage=>{
    const r=el=>el.getBoundingClientRect();
    const body=stage.querySelector("#playPane"),footer=stage.querySelector(".stage-footer"),buttons=[...stage.querySelectorAll(".crawl-controls button")];
    return {bodyScroll:body.scrollHeight-body.clientHeight,footerBottom:r(footer).bottom,viewport:innerHeight,controlsVisible:buttons.every(b=>r(b).bottom<=r(body).bottom+1),titleCount:[...stage.querySelectorAll("h1,h2")].filter(e=>e.textContent==="La città perfetta").length};
  });
  assert.equal(layout.titleCount,1);
  assert.ok(layout.footerBottom<=layout.viewport+1);
  assert.ok(layout.controlsVisible,JSON.stringify(layout));
  console.log(name+" narrative layout PASS "+JSON.stringify(layout));
  const crawl=page.locator("#crawlWindow");
  assert.ok(await crawl.evaluate(e=>e.scrollHeight-e.clientHeight)>=79,"actual scrolling range");
  await page.waitForFunction(()=>document.getElementById("crawlWindow").scrollTop>0);
  await page.locator("#crawlToggle").click();
  const offset=await crawl.evaluate(e=>e.scrollTop);
  await page.waitForTimeout(350);
  assert.equal(await crawl.evaluate(e=>e.scrollTop),offset);
  await page.locator("#crawlSpeed").click();
  assert.match(await page.locator("#crawlSpeed").textContent(),/rapida/);
  await page.locator("#crawlToggle").click();
  await page.waitForFunction(n=>document.getElementById("crawlWindow").scrollTop>n,offset);
  await page.locator("#crawlStatic").click();
  assert.equal(await page.locator(".crawl-box").getAttribute("data-static"),"true");
  assert.equal(await crawl.evaluate(e=>e.scrollHeight===e.clientHeight),true);
  await page.locator("#crawlStatic").click();
  await page.locator('[data-action="crawl-replay"]').click();
  assert.ok(await crawl.evaluate(e=>e.scrollTop)<offset);
  await image();
  for(let i=1;i<5;i++){await click("storynext");await image();assert.ok(await crawl.evaluate(e=>e.scrollHeight-e.clientHeight)>=79,"scene "+(i+1)+" scrolling range");}
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
 const reduced=await browser.newContext({offline:true,reducedMotion:"reduce"});
 const reducedPage=await reduced.newPage();
 await reducedPage.goto(pathToFileURL(path).href);
 assert.equal(await reducedPage.locator(".crawl-box").getAttribute("data-static"),"true");
 await reduced.close();
}finally{await browser.close()}
