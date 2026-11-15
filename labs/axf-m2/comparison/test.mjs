import {chromium} from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
(async()=>{const variant=process.argv.includes("--variant"), evidence=variant?"evidence/variant":"evidence";
 const browser=await chromium.launch(), reports=[];for(const engine of ["phaser","gdevelop"])for(const [w,h] of (variant?[[390,844],[1280,800]]:[[320,720],[390,844],[844,390],[1280,800]])){
 const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900,serviceWorkers:"block"});
 const page=await c.newPage(),external=[],errors=[],writes=[],sockets=[];const origin=variant?"http://127.0.0.1:8767/":"http://127.0.0.1:8765/";
 page.on("pageerror",e=>errors.push(String(e)));page.on("websocket",s=>sockets.push(s.url()));page.on("request",r=>{if(!["GET","HEAD"].includes(r.method()))writes.push(r.url());if(!r.url().startsWith(origin)&&! /^(data:|blob:)/.test(r.url()))external.push(r.url())});
 await c.route("**/*",r=>r.request().url().startsWith(origin)||/^(data:|blob:)/.test(r.request().url())?r.continue():r.abort());
 await page.goto(origin+"?engine="+engine);await page.locator("#frame[data-ready=true]").waitFor({timeout:45000});const readyMs=Number(await page.locator("#frame").getAttribute("data-ready-ms"));
 const canvas=page.frameLocator("iframe").locator("canvas").first();await canvas.waitFor({state:"visible"});await canvas.scrollIntoViewIfNeeded();const b=await canvas.boundingBox();
 if(variant){
  const x=b.x+b.width*115/640,y=b.y+b.height*77/384;
  if(w<900)await page.touchscreen.tap(x,y);else await page.mouse.click(x,y);
  await page.waitForTimeout(250);assert.equal(await page.locator("#zone").getAttribute("data-action"),null,"Old notebook position must be inactive");
 }
 for(const [x,y,action] of [[320,250,"inspect-square"],[115,variant?205:77,"inspect-notebook"],[510,265,"open-bench"]]){
  await canvas.scrollIntoViewIfNeeded();const box=await canvas.boundingBox();
  if(w<900)await page.touchscreen.tap(box.x+box.width*x/640,box.y+box.height*y/384);else await page.mouse.click(box.x+box.width*x/640,box.y+box.height*y/384);
  await page.waitForFunction(a=>document.querySelector("#zone").dataset.action===a,action,{timeout:5000});
 }
 await page.getByRole("button",{name:"Quaderno",exact:true}).press("Enter");assert.equal(await page.locator("#zone").getAttribute("data-action"),"inspect-notebook");
 await page.getByRole("button",{name:"Banco",exact:true}).press("Enter");
 assert(await page.getByRole("button",{name:"Prova A",exact:true}).isDisabled());
 for(const name of ["Prevedo A","Prova A","Prova B","Prova C","Scelgo C","Stessa luce, meno ingresso"])await page.getByRole("button",{name,exact:true}).click();
 const trace=JSON.parse(await page.locator("#reflection").getAttribute("data-trace"));assert.deepEqual(trace,[{type:"predict",id:"A"},{type:"test",id:"A"},{type:"test",id:"B"},{type:"test",id:"C"},{type:"revise",id:"C"},{type:"explain",reason:"same-light"}]);
 assert.equal(await page.locator("#trials tr").count(),3);assert((await page.locator("#status").innerText()).includes("50%"));
 await page.screenshot({path:evidence+"/"+engine+"-"+w+"x"+h+".png",fullPage:true});
 await page.getByRole("button",{name:"Ricomincia"}).click();assert.equal(await page.locator("#reflection").getAttribute("data-trace"),"null");
 await page.waitForTimeout(6500);const other=await c.newPage();await other.goto("about:blank");await other.bringToFront();await page.bringToFront();await page.waitForTimeout(2000);
 const storage=await page.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).map(d=>d.name),cache:await caches.keys()}));const cookies=await c.cookies();
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.goto("about:blank");await page.waitForTimeout(1000);
 reports.push({engine,viewport:[w,h],readyMs,canvas:[b.width,b.height],trace,external,errors,writes,sockets,storage,cookies:cookies.length});fs.writeFileSync(evidence+"/comparison.json",JSON.stringify(reports,null,2));
 assert.deepEqual({external,errors,writes,sockets,storage,cookies:cookies.length},{external:[],errors:[],writes:[],sockets:[],storage:{local:[],session:[],db:[],cache:[]},cookies:0});
 await c.close();
 }await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
