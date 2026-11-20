import {createServer} from "node:http";
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from "node:fs";
import {resolve,join,extname,sep} from "node:path";
import {chromium} from "playwright";
import assert from "node:assert/strict";
const [root,out]=process.argv.slice(2).map(x=>resolve(x));
if(!root||!out)throw Error("Usage: node test-atlas-library-static-web.mjs EXPORT OUT");
mkdirSync(out,{recursive:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".glb":"model/gltf-binary",".hdr":"application/octet-stream",".png":"image/png",".txt":"text/plain; charset=utf-8"};
const server=createServer((req,res)=>{
  let path;
  try{
    const url=new URL(req.url,"http://127.0.0.1");
    let p=decodeURIComponent(url.pathname);
    if(p.includes("\0")||p.includes("..")||p.includes("\\"))throw Error("unsafe path");
    if(p.endsWith("/"))p+="index.html";
    path=resolve(root,"."+p);
    if(path!==root&&!path.startsWith(root+sep))throw Error("path escape");
    if(!existsSync(path)||!statSync(path).isFile()){res.writeHead(404);res.end("Not found");return;}
    res.writeHead(200,{"Content-Type":types[extname(path)]||"application/octet-stream","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    res.end(readFileSync(path));
  }catch(e){res.writeHead(400);res.end(String(e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const origin="http://127.0.0.1:"+server.address().port;
let browser;const report={status:"PENDING",route:"/biblioteca/",results:[],externalRequests:[],errors:[]};
try{
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  for(const dim of [{name:"phone",width:390,height:844},{name:"desktop",width:1280,height:800}]){
    const context=await browser.newContext({viewport:{width:dim.width,height:dim.height},reducedMotion:"no-preference"});
    await context.route("**/*",r=>new URL(r.request().url()).origin===origin?r.continue():(
      report.externalRequests.push(r.request().url()),r.abort()));
    const page=await context.newPage();
    page.on("pageerror",e=>report.errors.push(String(e)));
    page.on("console",m=>{if(m.type()==="error")report.errors.push(m.text())});
    await page.goto(origin+"/biblioteca/",{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.querySelector("#status")?.textContent?.startsWith("Biblioteca pronta"),null,{timeout:90000});
    const frame=page.frameLocator("iframe");
    const result=await frame.locator("canvas").evaluate(el=>{
      const m=nativeMaterialBridge?.evidence()??[];
      return {phase:nativePhase,ready,revision:THREE.REVISION,materials:new Set(m.map(r=>r.name)).size,corrected:m.filter(r=>r.corrected).length,compiled:m.filter(r=>r.compiled>0).length,sceneObjects:visibility.update(camera).total,buffer:[el.width,el.height],calls:renderer.info.render.calls};
    });
    assert.equal(result.phase,"ready");assert.equal(result.ready,true);assert.equal(result.revision,"128");assert.equal(result.materials,7);assert.equal(result.corrected,1);assert(result.compiled>=1);assert.equal(result.sceneObjects,495);assert(result.calls>0);
    if(dim.name==="phone"){
      const layout=await page.evaluate(()=>{
        const scene=document.querySelector(".scene").getBoundingClientRect();
        const nav=document.querySelector(".portals").getBoundingClientRect();
        const actions=[...document.querySelectorAll(".portals [data-portal]")].map(n=>{
          const r=n.getBoundingClientRect();return {id:n.dataset.portal,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
        });
        return {sceneTop:scene.top,navTop:nav.top,navBottom:nav.bottom,actions,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,viewportHeight:innerHeight};
      });
      assert(layout.navBottom<layout.sceneTop,"mobile portals must precede the 3D scene");
      assert(layout.navBottom<layout.viewportHeight,"mobile portal actions must be visible without scrolling");
      assert(layout.scrollWidth<=layout.viewport,"mobile page must not scroll horizontally");
      assert(layout.actions.every(a=>a.width>=44&&a.height>=44),"mobile portal touch targets too small");
      report.results.push({device:"phone-first-screen",layout});
    }
    await page.screenshot({path:join(out,dim.name+"-library.png")});
    report.results.push({device:dim.name,...result});
    const dest=dim.name==="phone"?"curricolo":"esperienze";
    await page.locator('[data-portal="'+dest+'"]').first().click();
    await page.waitForURL("**/"+dest+"/",{timeout:60000});
    assert.equal(new URL(page.url()).pathname,"/"+dest+"/");
    const heading=await page.locator("h1").first().textContent();
    assert(heading&&heading.trim().length>0,"destination heading");
    report.results.at(-1).portal=dest;
    report.results.at(-1).destinationHeading=heading.trim();
    await context.close();
  }
  assert.deepEqual(report.externalRequests,[]);
  assert.deepEqual(report.errors,[]);
  report.status="PASS_FULL_LIBRARY_STATIC_WEB";
}catch(e){report.status="FAIL";report.error=String(e);throw e}
finally{writeFileSync(join(out,"static-web-receipt.json"),JSON.stringify(report,null,2)+"\n");console.log("ATLAS_STATIC_WEB",JSON.stringify(report));if(browser)await browser.close();server.close();}
