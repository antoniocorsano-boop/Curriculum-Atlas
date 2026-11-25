// Qualifica visiva di laboratorio: WebGL software, NON telefono fisico.
import {createServer} from "node:http";
import {readFileSync,writeFileSync,mkdirSync,statSync,existsSync} from "node:fs";
import {resolve,extname,join,sep} from "node:path";
import assert from "node:assert/strict";
import {chromium} from "playwright";

const root=resolve(process.argv[2]||"out"),output=resolve(process.argv[3]||"evidence/atlas-foyer");
mkdirSync(output,{recursive:true});
const contentTypes={".html":"text/html; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",
  ".png":"image/png",".svg":"image/svg+xml"};
const server=createServer((req,res)=>{
  try{
    const path=new URL(req.url,"http://127.0.0.1").pathname;
    if(path.includes("\0")||path.includes("..")||path.includes("\\"))throw Error("Unsafe path");
    const name=path.endsWith("/")?path+"index.html":path;
    const file=resolve(root,"."+name);
    if(file!==root&&!file.startsWith(root+sep))throw Error("Path escape");
    if(!existsSync(file)||!statSync(file).isFile()){res.writeHead(404);res.end("not found");return;}
    res.writeHead(200,{"Content-Type":contentTypes[extname(file)]||"application/octet-stream",
      "Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
    res.end(readFileSync(file));
  }catch(error){res.writeHead(400);res.end(String(error))}
});
await new Promise((done,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",done)});
const origin="http://127.0.0.1:"+server.address().port;
const report={status:"PENDING",schema:"atlas.gateway.foyer-visual-evidence/v1",kind:"chromium-software-webgl",
  physicalAndroidVerified:false,artisticApproval:false,devices:[],errors:[],externalRequests:[]};
let browser;
try{
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  for(const dim of [{name:"phone",width:390,height:844,mobile:true},{name:"desktop",width:1280,height:800,mobile:false}]){
    const context=await browser.newContext({viewport:{width:dim.width,height:dim.height},deviceScaleFactor:dim.mobile?2.75:1,
      isMobile:dim.mobile,hasTouch:dim.mobile,reducedMotion:"no-preference"});
    await context.route("**/*",r=>new URL(r.request().url()).origin===origin?r.continue():(
      report.externalRequests.push(r.request().url()),r.abort()));
    const page=await context.newPage();
    page.on("pageerror",error=>report.errors.push(dim.name+": "+String(error)));
    page.on("console",msg=>{if(msg.type()==="error")report.errors.push(dim.name+": "+msg.text())});
    await page.goto(origin+"/atrio/",{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.querySelector("#foyer-status")?.textContent?.includes("pronto"),null,{timeout:30000});
    assert.equal(await page.locator("body.no-webgl").count(),0,"Real WebGL must start: "+dim.name);
    if(process.env.ATLAS_FOYER_EXPECT_ART==="true"){
      const statement=await page.locator("#foyer-status").textContent();
      assert(statement?.includes("modello Blender verificato"),"The authored GLB must actually replace fallback geometry");
    }
    const info=await page.evaluate(()=>{
      const canvas=document.querySelector("#foyer-canvas");
      const context=canvas.getContext("webgl2")||canvas.getContext("webgl");
      const nav=[...document.querySelectorAll(".destinations a")].map(a=>({
        route:a.getAttribute("href"),height:a.getBoundingClientRect().height,width:a.getBoundingClientRect().width
      }));
      return {revision:window.THREE?.REVISION,canvas:[canvas.width,canvas.height],
        glVersion:context?.getParameter(context.VERSION)||null,nav,
        scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,
        liveStatus:document.querySelector("#foyer-status")?.textContent};
    });
    assert.equal(info.revision,"128");
    assert(info.glVersion,"No GPU context");
    assert(info.canvas[0]*info.canvas[1]<=1048576,"Raster exceeds 1 Mi pixel");
    assert.equal(info.nav.length,4);assert(info.nav.every(r=>r.height>=44&&r.width>=44));
    assert.equal(info.scrollWidth<=info.viewport,true,"Horizontal scrolling");
    assert.equal(await page.locator("body.webgl-ready").count(),1,"3D-ready state must enable uncluttered composition");
    await page.waitForFunction(()=>getComputedStyle(document.querySelector(".destinations")).opacity==="0",null,{timeout:5000});
    const navOpacity=await page.locator(".destinations").evaluate(el=>getComputedStyle(el).opacity);
    assert.equal(navOpacity,"0","avoid a second visible title row under the portals");
    await page.screenshot({path:join(output,dim.name+"-foyer.png"),fullPage:true});
    // Keyboard access reveals the otherwise visually discreet HTML fallback.
    await page.locator(".destinations a").first().focus();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector(".destinations")).opacity==="1",null,{timeout:5000});
    assert.equal(await page.locator(".destinations a").first().getAttribute("href"),"/curricolo/");
    // Leaving keyboard navigation restores unobstructed pointer access to
    // camera controls; focus must move before click while the nav overlay closes.
    await page.locator("#camera-right").focus();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector(".destinations")).opacity==="0",null,{timeout:5000});
    // Controlled camera motion must preserve the 3D scene and usable portals.
    await page.locator("#camera-right").click();
    await page.locator("#camera-reset").click();
    assert.equal(await page.locator("body.no-webgl").count(),0);
    // Explicit lab opt-in; ordinary preview remains unchanged.
    assert.equal(await page.locator("#motion-preview").isVisible(),false);
    await page.goto(origin+"/atrio/?vf-motion=1");
    await page.waitForFunction(()=>document.body.classList.contains("webgl-ready"));
    const trigger=page.locator("#motion-preview");
    await trigger.click();
    await page.waitForFunction(()=>document.querySelector("#motion-preview").dataset.running==="true");
    const frames=await page.evaluate(()=>new Promise(resolve=>{
      const gaps=[];let start,last;
      function frame(t){if(start===undefined)start=t;if(last!==undefined)gaps.push(t-last);last=t;
        if(t-start<1000)requestAnimationFrame(frame);else resolve(gaps);}
      requestAnimationFrame(frame);
    }));
    await page.screenshot({path:join(output,dim.name+"-motion.png"),fullPage:true});
    await page.waitForFunction(()=>document.querySelector("#motion-preview").dataset.running==="false",null,{timeout:10000});
    await trigger.click();
    await trigger.click();
    assert.equal(await trigger.getAttribute("data-running"),"false");
    await page.emulateMedia({reducedMotion:"reduce"});
    await page.waitForFunction(()=>document.querySelector("#motion-preview").disabled);
    assert.equal(await trigger.getAttribute("data-running"),"false");
    const sorted=[...frames].sort((a,b)=>a-b);
    const motion={frames:frames.length,meanFps:frames.length?1000*frames.length/frames.reduce((a,b)=>a+b,0):null,
      p95Ms:sorted.length?sorted[Math.ceil(sorted.length*.95)-1]:null,kind:"software-rAF-not-physical-phone"};
    report.devices.push({device:dim.name,width:dim.width,height:dim.height,...info,motion});
    await context.close();
  }
  assert.deepEqual(report.errors,[]);
  assert.deepEqual(report.externalRequests,[]);
  report.status="PASS_SOFTWARE_WEBGL";
}finally{
  if(browser)await browser.close();
  await new Promise(done=>server.close(done));
  writeFileSync(join(output,"report.json"),JSON.stringify(report,null,2)+"\n");
}
console.log("ATLAS_FOYER_BROWSER",report.status);
