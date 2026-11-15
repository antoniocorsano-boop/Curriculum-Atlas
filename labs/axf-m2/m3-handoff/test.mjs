import {chromium} from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
const browser=await chromium.launch(),reports=[];
try{
for(const [w,h] of [[390,844],[1280,800]]){
 const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:w<900,isMobile:w<900,serviceWorkers:"block"});
 const page=await c.newPage(),external=[],errors=[],writes=[],sockets=[],origin="http://127.0.0.1:8768/";
 page.on("pageerror",e=>errors.push(String(e)));page.on("websocket",s=>sockets.push(s.url()));page.on("request",r=>{if(!["GET","HEAD"].includes(r.method()))writes.push(r.url());if(!r.url().startsWith(origin)&&! /^(data:|blob:)/.test(r.url()))external.push(r.url())});
 await c.route("**/*",r=>r.request().url().startsWith(origin)||/^(data:|blob:)/.test(r.request().url())?r.continue():r.abort());
 await page.goto(origin);await page.locator("#stage[data-phase=prologue] img").waitFor();assert(await page.locator("img").evaluate(e=>e.complete&&e.naturalWidth>0));
 await page.getByRole("button",{name:"Entra nell’atelier"}).click();await page.locator("#map[data-ready=true]").waitFor();assert.equal(await page.locator("iframe").count(),1);assert.equal(await page.locator("#game canvas").count(),0);
 const canvas=page.frameLocator("iframe").locator("canvas").first();await canvas.waitFor();await canvas.scrollIntoViewIfNeeded();const b=await canvas.boundingBox();
 if(w<900)await page.touchscreen.tap(b.x+b.width*510/640,b.y+b.height*265/384);else await page.mouse.click(b.x+b.width*510/640,b.y+b.height*265/384);
 await page.locator("#game[data-ready=true] canvas").waitFor();assert.equal(await page.locator("iframe").count(),0);assert.equal(await page.locator("#game canvas").count(),1);
 for(const name of ["Prevedo A","Prova A","Prova B","Prova C","Scelgo C","Stessa luce, meno ingresso"])await page.getByRole("button",{name,exact:true}).click();
 const trace=JSON.parse(await page.locator("#summary").getAttribute("data-trace"));assert.deepEqual(trace,[{type:"predict",id:"A"},{type:"test",id:"A"},{type:"test",id:"B"},{type:"test",id:"C"},{type:"revise",id:"C"},{type:"explain",reason:"same-light"}]);
 await page.screenshot({path:"evidence/m3-handoff/bench-"+w+".png",fullPage:true});
 await page.getByRole("button",{name:"Presenta il confronto"}).click();await page.locator("#stage[data-phase=review] img").waitFor();assert.equal(await page.locator("canvas,iframe").count(),0);assert((await page.locator("#recommendation").innerText()).includes("C"));
 await page.getByRole("button",{name:"Torna al plastico",exact:true}).click();await page.locator("#map[data-ready=true]").waitFor();assert.deepEqual(JSON.parse(await page.locator("#summary").getAttribute("data-trace")),trace);
 await page.getByRole("button",{name:"Banco",exact:true}).press("Enter");await page.getByRole("button",{name:"Nuova prova (sostituisce il confronto)"}).click();await page.locator("#game[data-ready=true] canvas").waitFor();assert.equal(await page.locator("#summary").getAttribute("data-trace"),"null");assert.equal(await page.locator("iframe").count(),0);
 await page.getByRole("button",{name:"Esci dall'episodio"}).click();assert.equal(await page.locator("canvas,iframe").count(),0);assert.equal(await page.locator("#summary").getAttribute("data-trace"),"null");
 await page.waitForTimeout(6500);const storage=await page.evaluate(async()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage),db:(await indexedDB.databases()).map(d=>d.name),cache:await caches.keys()}));const cookies=await c.cookies();
 assert.deepEqual({external,errors,writes,sockets,storage,cookies:cookies.length},{external:[],errors:[],writes:[],sockets:[],storage:{local:[],session:[],db:[],cache:[]},cookies:0});
 reports.push({viewport:[w,h],trace,exclusiveRenderer:true,returnPreservesTrace:true,resetAndExit:true,external,errors,writes,sockets,storage,cookies:cookies.length});await c.close();
}
}finally{await browser.close();fs.writeFileSync("evidence/m3-handoff/report.json",JSON.stringify(reports,null,2))}
