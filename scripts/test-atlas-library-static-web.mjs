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
    const context=await browser.newContext({
      viewport:{width:dim.width,height:dim.height},reducedMotion:"no-preference",
      ...(dim.name==="phone"?{isMobile:true,hasTouch:true,deviceScaleFactor:2.75,
        userAgent:"Mozilla/5.0 (Linux; Android 12; M2007J20CG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36"}:{})
    });
    await context.route("**/*",r=>new URL(r.request().url()).origin===origin?r.continue():(
      report.externalRequests.push(r.request().url()),r.abort()));
    const page=await context.newPage();
    await page.addInitScript(()=>{
      window.__atlasObservedPhases=[];
      window.addEventListener("message",event=>{
        if(event.data?.type==="atlas-3d-phase"&&typeof event.data.id==="string")
          window.__atlasObservedPhases.push(event.data.step+":"+event.data.id);
      });
    });
    let manifestReads=0;
    const compressedRequests=new Set(),originalModelRequests=new Set();
    page.on("request",request=>{
      const path=new URL(request.url()).pathname;
      if(path==="/biblioteca/native-manifest.json")manifestReads++;
      if(path.startsWith("/atlas-gateway-gzip/"))compressedRequests.add(path);
      if(path.startsWith("/atlas-gateway-native/")&&path.endsWith(".glb"))originalModelRequests.add(path);
    });
    page.on("pageerror",e=>report.errors.push(String(e)));
    page.on("console",m=>{if(m.type()==="error")report.errors.push(m.text())});
    await page.goto(origin+"/biblioteca/"+(dim.name==="phone"?"?diagnostica=1":""),{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>document.querySelector("#status")?.textContent?.startsWith("Biblioteca pronta"),null,{timeout:90000});
    assert.equal(manifestReads,1,"the signed manifest must be fetched once per scene startup");
    assert.equal(compressedRequests.size,7,"seven lossless compressed resources must be served");
    assert.equal(originalModelRequests.size,0,"compressed models must not silently fall back to full-size transport");
    report.results.push({device:dim.name+"-network",compressedRequests:compressedRequests.size,originalModelRequests:originalModelRequests.size});
    if(dim.name==="phone"){
      const phases=await page.evaluate(()=>window.__atlasObservedPhases);
      assert(phases.includes("decode:shell"),"mobile must report the architectural decoding stage");
      assert(phases.includes("preview:shell"),"mobile must show the shell before the full library finishes");
      assert(phases.includes("decode:bays"),"mobile must report shelving decoding stage");
      report.progressivePreview=phases;
    }
    if(dim.name==="desktop")assert.equal(await page.locator("#atlas-diag").count(),0,"diagnostic must be invisible by default");
    const frame=page.frameLocator("iframe");
    const result=await frame.locator("canvas").evaluate(el=>{
      const m=nativeMaterialBridge?.evidence()??[];
      return {phase:nativePhase,ready,revision:THREE.REVISION,materials:new Set(m.map(r=>r.name)).size,corrected:m.filter(r=>r.corrected).length,compiled:m.filter(r=>r.compiled>0).length,sceneObjects:visibility.update(camera).total,buffer:[el.width,el.height],calls:renderer.info.render.calls,lighting:scene.userData.atlasLighting,shadowEnabled:renderer.shadowMap.enabled,shadowType:renderer.shadowMap.type,castShadowLights:scene.children.filter(o=>o.isDirectionalLight&&o.castShadow).length,spotLights:scene.children.filter(o=>o.isSpotLight).length,renderBudgetMs:renderBudget.lastSubmitMs};
    });
    assert.equal(result.phase,"ready");assert.equal(result.ready,true);assert.equal(result.revision,"128");assert.equal(result.materials,7);assert.equal(result.corrected,1);assert(dim.name==="phone"?result.compiled===0:result.compiled>=1);assert.equal(result.sceneObjects,495);assert(result.calls>0);
    assert.equal(result.lighting?.mode,"web-architectural-lite-v2");
    assert.equal(result.lighting?.shelfCount,dim.name==="phone"?3:9);
    assert.equal(result.lighting?.materialModel,dim.name==="phone"?"original-maps-scalar":"microstructure");
    assert.equal(result.lighting?.crownCount,dim.name==="phone"?2:8);
    assert.equal(result.lighting?.shadowMapSize,dim.name==="phone"?512:1024);
    assert.equal(result.spotLights,result.lighting.crownCount+result.lighting.shelfCount);
    assert(result.shadowEnabled&&result.castShadowLights===1&&result.lighting.oneTimeShadows,"Web architectural lighting is not active");
    assert(Number.isFinite(result.renderBudgetMs)&&result.renderBudgetMs>=0,"missing real renderer timing");
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
      const introHeight=await page.locator(".intro").evaluate(el=>el.getBoundingClientRect().height);
      assert(introHeight<=70,"introductory mobile banner should not overwhelm the 3D scene");
      const raster=await frame.locator("canvas").evaluate(()=>({
        width:renderer.getContext().drawingBufferWidth,
        height:renderer.getContext().drawingBufferHeight,
        cssWidth:innerWidth,cssHeight:innerHeight,
        pixelScale:renderBudget.scale,
        frameSubmissionMs:renderBudget.lastSubmitMs
      }));
      assert(raster.pixelScale>=1.17&&raster.pixelScale<=1.21,"mobile scene must balance high-DPI clarity and render cost");
      assert(raster.width*raster.height<=1048576,"existing 1 Mi-pixel ceiling must be preserved");
      report.results.push({device:"phone-first-screen",layout,introHeight,raster});
      const dragScale=await frame.locator("canvas").evaluate(()=>{
        const resting=renderBudget.scale;
        down={x:80,y:140,angle,tilt};
        resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));
        const moving=renderBudget.scale;
        down=null;
        resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));
        return {resting,moving,restored:renderBudget.scale};
      });
      assert(dragScale.moving>=0.70&&dragScale.moving<=0.73,"drag must lower shader pixel work");
      assert(Math.abs(dragScale.restored-dragScale.resting)<.012,"drag must restore high-detail stationary view");
      report.dragRaster=dragScale;
    }
    if(dim.name==="phone"){
      const nativeStatus=await frame.locator("#native-status").evaluate(el=>({hidden:el.hidden,display:getComputedStyle(el).display}));
      assert.equal(nativeStatus.hidden,true,"ready scene must hide the temporary loading overlay");
      assert.equal(nativeStatus.display,"none","no loading overlay may remain visible after 3D ready");
      // Local opt-in diagnostic: start, exercise actual native controls,
      // receive report without network telemetry, then hide its panel
      // so that product screenshots remain visually comparable.
      const diagnose=page.locator("#atlas-diag");
      assert.equal(await diagnose.count(),1,"opt-in diagnostic should appear only with query flag");
      await page.locator("#diag-start").click();
      await diagnose.evaluate(el=>el.style.display="none");
      const panel=frame.locator("#atlas-controls-panel");
      assert.equal(await panel.count(),1,"mobile camera panel must exist");
      assert.equal(await panel.evaluate(el=>el.open),false,"mobile camera panel must initially be collapsed");
      await panel.locator("summary").click();
      assert.equal(await panel.evaluate(el=>el.open),true,"mobile camera controls must open");
      const menuHeight=await frame.locator("#native-controls").evaluate(el=>el.getBoundingClientRect().height);
      assert(menuHeight>=88&&menuHeight<=140,"mobile camera controls must fit in two compact rows");
      report.mobileMenuHeightPx=menuHeight;
      await frame.locator('#native-controls button[data-action="left"]').click();
      await frame.locator('#native-controls button[data-action="reset"]').click();
      const steady=await frame.locator("canvas").evaluate(()=>({
        millisecondRender:renderBudget.lastSubmitMs,
        cachedStaticShadow:renderer.shadowMap.needsUpdate===false,
        frames:renderBudget.frames,
        passes:renderer.info.render.calls
      }));
      assert(steady.cachedStaticShadow,"shadow map may not re-render for every navigation frame");
      assert(Number.isFinite(steady.millisecondRender)&&steady.millisecondRender>=0,"missing mobile steady frame metric");
      report.steadyNavigation=steady;
      assert.equal(await frame.locator("canvas").evaluate(()=>ready&&!closing),true,"camera controls must preserve the live scene");
      await panel.locator("summary").click();
      assert.equal(await panel.evaluate(el=>el.open),false,"mobile controls must close");
      await diagnose.evaluate(el=>el.style.display="");
      await page.locator("#diag-stop").click();
      await page.waitForFunction(()=>document.querySelector("#diag-result")?.value.includes("fotogrammi_inviati"),null,{timeout:10000});
      const localReport=await page.locator("#diag-result").inputValue();
      const localData=JSON.parse(localReport);
      assert(localData.fotogrammi_inviati>=2,"diagnostic must observe actual render submissions");
      assert.equal(localData.misurazione_tempo_gpu,"non disponibile","CPU submissions must not be mistaken for GPU FPS");
      assert.equal(localData.contenuto_personale,"nessuno");
      report.localDiagnostic={submissions:localData.fotogrammi_inviati,p95Ms:localData.intervallo_invio_p95_ms,
        gpu:localData.misurazione_tempo_gpu,bytesSentToExternalEndpoints:0};
      await diagnose.evaluate(el=>el.style.display="none");
    }
    await page.screenshot({path:join(out,dim.name+"-library.png")});
    if(dim.name==="phone"){
      const expand=page.locator("#expand");
      await expand.click();
      assert.equal(await page.locator("#viewer").evaluate(el=>el.classList.contains("expanded")),true,"immersive view must open");
      assert.equal(await page.locator("body").evaluate(el=>el.classList.contains("viewer-expanded")),true,"immersive view must prevent background scrolling");
      await page.waitForFunction(()=>{
        const f=document.querySelector("#scene iframe");
        return f&&Math.abs(f.getBoundingClientRect().height-innerHeight)<3;
      },null,{timeout:10000});
      const immersive=await frame.locator("canvas").evaluate(()=>({
        ready,closed:closing,drawWidth:renderer.getContext().drawingBufferWidth,
        drawHeight:renderer.getContext().drawingBufferHeight,
        calls:renderer.info.render.calls
      }));
      assert(immersive.ready&&!immersive.closed&&immersive.calls>0,"immersive viewing must keep the 3D renderer active");
      assert(immersive.drawWidth*immersive.drawHeight<=1048576,"immersive view may not exceed the raster budget");
      await page.screenshot({path:join(out,"phone-immersive.png")});
      await expand.click();
      assert.equal(await page.locator("#viewer").evaluate(el=>el.classList.contains("expanded")),false,"immersive view must be dismissible");
      report.immersive=immersive;
    }
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
