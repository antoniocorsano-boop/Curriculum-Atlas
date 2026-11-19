import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { chromium } from "playwright";

const [inputDir,enginePath,evidenceDir]=process.argv.slice(2).map(p=>resolve(p));
mkdirSync(evidenceDir,{recursive:true});
const sha=b=>createHash("sha256").update(b).digest("hex");
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const manifest=JSON.parse(readFileSync(join(inputDir,"browser-input.json"),"utf8"));
assert.equal(manifest.revision,process.env.ATLAS_EXACT_HEAD);
const files=new Map();
for(const [name,info] of Object.entries(manifest.images)){
  const b=readFileSync(join(inputDir,name+".rgba32f"));
  assert.equal(sha(b),info.sha256);
  assert.equal(b.length,info.width*info.height*16);
  files.set("/"+name+".rgba32f",["application/octet-stream",b]);
}
const html='<!doctype html><html lang="it"><meta charset="utf-8"><title>ASC P2C2A laboratorio locale</title><body><script src="/three.js"></script><script src="/probe.js"></script></body></html>';
// Executed as an ordinary same-origin script, never eval or injected shader code.
const probe=String.raw`
(async()=>{
 const T=window.THREE;
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 check(T.REVISION==="128","engine revision");
 check(new Uint8Array(new Uint32Array([1]).buffer)[0]===1,"little endian host");
 const canvas=document.createElement("canvas");document.body.appendChild(canvas);
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,preserveDrawingBuffer:true});
 check(gl,"WebGL2 unavailable");check(gl.getExtension("EXT_color_buffer_float"),"float framebuffer unavailable");
 const renderer=new T.WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.toneMapping=T.NoToneMapping;renderer.outputEncoding=T.LinearEncoding;
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-1,1,1,-1,.1,10);
 camera.position.z=1;
 const geom=new T.PlaneGeometry(2,2);
 const material=new T.MeshBasicMaterial({toneMapped:false});
 const mesh=new T.Mesh(geom,material);scene.add(mesh);
 const manifest=await fetch("/browser-input.json").then(r=>{check(r.ok,"manifest");return r.json();});
 const records={};
 function srgb(x){x=Math.max(0,Math.min(1,x));return x<=.0031308?12.92*x:1.055*Math.pow(x,1/2.4)-.055;}
 for(const name of ["canary","diffuse"]){
   const info=manifest.images[name],w=info.width,h=info.height;
   const raw=await fetch("/"+name+".rgba32f").then(r=>{check(r.ok,"input "+name);return r.arrayBuffer();});
   const data=new Float32Array(raw);check(data.length===w*h*4,"texture length");
   const texture=new T.DataTexture(data,w,h,T.RGBAFormat,T.FloatType);
   texture.encoding=T.LinearEncoding;texture.flipY=false;texture.generateMipmaps=false;
   texture.minFilter=T.NearestFilter;texture.magFilter=T.NearestFilter;texture.unpackAlignment=1;texture.needsUpdate=true;
   material.map=texture;material.needsUpdate=true;
   renderer.setSize(w,h,false);
   const target=new T.WebGLRenderTarget(w,h,{type:T.FloatType,format:T.RGBAFormat,minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:false,stencilBuffer:false});
   target.texture.encoding=T.LinearEncoding;
   renderer.setRenderTarget(target);renderer.render(scene,camera);
   check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"incomplete float framebuffer");
   const linear=new Float32Array(data.length);
   renderer.readRenderTargetPixels(target,0,0,w,h,linear);
   check(gl.getError()===gl.NO_ERROR,"float readback error");
   let max=0,bad=0,worst=-1;
   for(let i=0;i<data.length;i++){const d=Math.abs(data[i]-linear[i]);check(Number.isFinite(d),"nonfinite readback");if(d>max){max=d;worst=i;}if(d>2e-6+2e-6*Math.abs(data[i]))bad++;}
   records[name]={width:w,height:h,linear:{samples:data.length,maxAbs:max,outsideTolerance:bad,worstIndex:worst},display:null};
   window.__ascRecords=records;
   check(bad===0,"linear GPU mismatch "+name+" "+JSON.stringify(records[name]));
   renderer.setRenderTarget(null);renderer.outputEncoding=T.sRGBEncoding;material.needsUpdate=true;
   renderer.render(scene,camera);
   const screen=new Uint8Array(data.length);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,screen);
   check(gl.getError()===gl.NO_ERROR,"display readback error");
   let maxByte=0,badByte=0;
   for(let i=0;i<screen.length;i++){const expected=i%4===3?255:Math.round(255*srgb(data[i]));const d=Math.abs(expected-screen[i]);maxByte=Math.max(maxByte,d);if(d>2)badByte++;}
   records[name].display={samples:screen.length,maxByteDelta:maxByte,outsideTolerance:badByte,encoding:"sRGB",toneMapping:"none",maxAllowedByteDelta:2};
   window.__ascRecords=records;
   check(badByte===0,"display encoding mismatch "+name+" "+JSON.stringify(records[name]));
   // Capture actual rendered bytes; chart enlarged only via CSS for inspection.
   canvas.style.width=name==="canary"?"480px":"512px";canvas.style.height=name==="canary"?"200px":"512px";canvas.style.imageRendering="pixelated";
   window.__ascImages=window.__ascImages||{};window.__ascImages[name]=canvas.toDataURL("image/png");
   target.dispose();texture.dispose();renderer.outputEncoding=T.LinearEncoding;
 }
 window.__ascResult={status:"PASS_GPU_TRANSFER_PROBE",revision:T.REVISION,webgl2:renderer.capabilities.isWebGL2,records,device:"Chromium software GPU",physicalDeviceQualified:false,artisticApproval:false,sceneBindingQualified:false,publishable:false};
 geom.dispose();material.dispose();renderer.dispose();
})().catch(e=>{window.__ascResult={status:"FAIL",error:String(e),records:window.__ascRecords||{}};});
`;
files.set("/",["text/html; charset=utf-8",Buffer.from(html)]);
files.set("/three.js",["application/javascript",engine]);
files.set("/probe.js",["application/javascript",Buffer.from(probe)]);
files.set("/browser-input.json",["application/json",Buffer.from(JSON.stringify(manifest))]);
const server=createServer((req,res)=>{
  const file=files.get(req.url);
  res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'none'; object-src 'none'; base-uri 'none'");
  res.setHeader("X-Content-Type-Options","nosniff");
  if(!file){res.writeHead(404);res.end();return;}
  res.writeHead(200,{"Content-Type":file[0],"Cache-Control":"no-store"});res.end(file[1]);
});
let browser;
const report={schema:"atlas.asc01.browser-transfer/v1",revision:manifest.revision,sourceRevision:manifest.sourceRevision,engineSha256:sha(engine),externalRequests:[],pageErrors:[],status:"PENDING"};
try{
  await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
  const origin="http://127.0.0.1:"+server.address().port;
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const context=await browser.newContext({viewport:{width:800,height:650}});
  await context.route("**/*",route=>{
    const u=new URL(route.request().url());
    if(u.origin!==origin){report.externalRequests.push(u.href);return route.abort();}
    return route.continue();
  });
  const page=await context.newPage();
  page.on("pageerror",e=>report.pageErrors.push(String(e)));
  await page.goto(origin+"/");
  // Poll externally, rather than using a string-evaluated wait under CSP.
  let result=null;
  for(let i=0;i<240&&!result;i++){result=await page.evaluate(()=>window.__ascResult||null);if(!result)await new Promise(ok=>setTimeout(ok,250));}
  report.result=result;
  assert(result,"browser probe timeout");assert.equal(result.status,"PASS_GPU_TRANSFER_PROBE",JSON.stringify(result));
  assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
  const images=await page.evaluate(()=>window.__ascImages);
  for(const [name,url] of Object.entries(images)){const b=Buffer.from(url.split(",")[1],"base64");writeFileSync(join(evidenceDir,name+"-gpu.png"),b);}
  report.status="PASS_GPU_TRANSFER_PROBE";
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{
  writeFileSync(join(evidenceDir,"browser-transfer.json"),JSON.stringify(report,null,2)+"\n");
  console.log("ASC-P2C2A",JSON.stringify(report));
  if(browser)await browser.close();
  server.close();
}
