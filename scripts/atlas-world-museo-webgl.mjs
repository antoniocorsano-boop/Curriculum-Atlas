import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";
import {chromium} from "playwright";
const [source,out,enginePath]=process.argv.slice(2).map(x=>resolve(x));
const sha=b=>createHash("sha256").update(b).digest("hex");
const plan=JSON.parse(readFileSync(join(source,"transfer-plan.json")));
assert.equal(plan.schema,"atlas.awc.transfer-plan/v1");
assert.equal(plan.mode,"ISOLATED_LAB_ONLY");assert.equal(plan.status,"SCENE_PLAN_READY");
assert.equal(plan.reused.parameter,"camera.orbit");assert.equal(plan.reused.variant,.12);
assert(!Object.values(plan.authority).some(Boolean));
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const frames=new Map(plan.frames.map(f=>[f.id,f]));
const html='<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Museo Zero · Sala Zero · Prova AWC</title><link rel="stylesheet" href="/style.css"><body><header><strong>MUSEO ZERO · SALA ZERO</strong><span>Anteprima isolata · segnale simulato</span><button id="reset">Ripristina inquadratura</button><button id="cue">Simula segnale B</button><span id="status" role="status">Proiezione in ritardo</span></header><main id="view"></main><script src="/engine.js"></script><script src="/scene.js"></script></body></html>';
const css='body{margin:0;background:#0d1825;color:#e7eaf3;font:14px system-ui}header{display:flex;gap:16px;align-items:center;padding:10px;flex-wrap:wrap}button{background:#263a48;color:#fff;border:1px solid #9db7c0;border-radius:6px;padding:8px}canvas{display:block;max-width:100%;height:auto;touch-action:none;cursor:grab}main{display:flex;justify-content:center}#status{font-weight:600;color:#8ad8c9}';
const js=`(async()=>{
const T=THREE,plan=${JSON.stringify(plan)},cfg=plan.camera;
const container=document.querySelector("#view"),canvas=document.createElement("canvas");canvas.width=640;canvas.height=480;container.append(canvas);
const gl=canvas.getContext("webgl",{antialias:true,preserveDrawingBuffer:true});
if(!gl)throw Error("WebGL unavailable");
const renderer=new T.WebGLRenderer({canvas,context:gl,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(1);renderer.setSize(640,480,false);
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new T.Scene();scene.background=new T.Color(plan.worldEnvironment.background);
scene.add(new T.HemisphereLight(0xd8f0ff,0x243b55,1.1));
const light=new T.DirectionalLight(0xffefd1,2.0);light.position.set(-3,-5,8);scene.add(light);
const fill=new T.PointLight(0x70c7ed,1.7,15);fill.position.set(2,0,3.8);scene.add(fill);
const mats={};
for(const [name,m] of Object.entries(plan.materials)){mats[name]=new T.MeshStandardMaterial({color:new T.Color(m.color),roughness:m.roughness,metalness:m.metalness||0});}
const screen=mats.screen;const geo=[];
for(const o of plan.objects){const shape=new T.BoxGeometry(...o.size),mesh=new T.Mesh(shape,mats[o.material]);mesh.name=o.id;mesh.position.set(...o.position);scene.add(mesh);geo.push(shape);}
const camera=new T.PerspectiveCamera(cfg.fov,640/480,cfg.near,cfg.far);camera.up.set(0,0,1);
let orbit=0,signal="A",drag=null;
function paint(){const t=cfg.azimuth+orbit,d=cfg.distance,h=cfg.elevation,c=cfg.center;
camera.position.set(c[0]+d*Math.cos(h)*Math.sin(t),c[1]-d*Math.cos(h)*Math.cos(t),c[2]+d*Math.sin(h));
camera.lookAt(new T.Vector3(...c));camera.updateMatrixWorld(true);
screen.color.set(signal==="B"?"#224b57":"#23384c");screen.emissive.set(signal==="B"?"#67d9ca":"#1d3448");screen.emissiveIntensity=signal==="B"?3:.08;
document.querySelector("#status").textContent=signal==="B"?"Proiezione, suono e luce sincronizzati":"Proiezione in ritardo";
renderer.render(scene,camera);if(gl.getError()!==gl.NO_ERROR)throw Error("GL error");
}
const capture=()=>({png:canvas.toDataURL("image/png"),width:canvas.width,height:canvas.height,orbit,signal,camera:camera.matrixWorld.elements.slice(),projection:camera.projectionMatrix.elements.slice()});
canvas.addEventListener("pointerdown",e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!drag)return;orbit=Math.min(.3,Math.max(-.3,orbit+(e.clientX-drag[0])*.004));drag=[e.clientX,e.clientY];paint();});
canvas.addEventListener("pointerup",()=>drag=null);
canvas.addEventListener("pointercancel",()=>drag=null);
document.querySelector("#reset").onclick=()=>{orbit=0;signal="A";paint();};
document.querySelector("#cue").onclick=()=>{signal="B";paint();};
window.__capture=capture;window.__resize=(w,h)=>{renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();paint();};
paint();window.__ready={sceneObjects:plan.objects.length,triangles:plan.objects.length*12,status:"READY",world:plan.world,
sourceNarrative:plan.sourceNarrative, realHardwareControl:false,studentAuthorized:false,publishable:false};
})().catch(e=>window.__ready={status:"FAIL",error:String(e)});`;
const files=new Map([["/",["text/html",Buffer.from(html)]],["/style.css",["text/css",Buffer.from(css)]],["/engine.js",["application/javascript",engine]],["/scene.js",["application/javascript",Buffer.from(js)]]]);
const server=createServer((req,res)=>{res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'none'; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'none'");res.setHeader("X-Content-Type-Options","nosniff");const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);});
let browser;const report={schema:"atlas.awc.museo-browser/v1",status:"PENDING",revision:process.env.ATLAS_EXACT_HEAD,planSha256:plan.planSha256,world:plan.world,scene:plan.scene,frames:{},externalRequests:[],pageErrors:[],artisticApproval:false,studentAuthorized:false,publishable:false,realHardwareControl:false};
try{
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const origin="http://127.0.0.1:"+server.address().port;
browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const context=await browser.newContext({viewport:{width:800,height:650}});
await context.route("**/*",route=>{if(new URL(route.request().url()).origin!==origin){report.externalRequests.push(route.request().url);return route.abort();}return route.continue();});
const page=await context.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));
await page.goto(origin+"/");await page.waitForFunction(()=>window.__ready,{},{timeout:180000});
report.result=await page.evaluate(()=>window.__ready);assert.equal(report.result.status,"READY",JSON.stringify(report.result));
assert.equal(report.result.triangles,plan.targetTriangles);
async function capture(name){
const v=await page.evaluate(()=>window.__capture());const png=Buffer.from(v.png.split(",")[1],"base64");
writeFileSync(join(out,"museo-web-"+name+".png"),png);
const entry={sha256:sha(png),width:v.width,height:v.height,orbit:v.orbit,signal:v.signal,camera:v.camera,projection:v.projection};
report.frames[name]=entry;
if(frames.has(name)){const want=frames.get(name);assert(Math.abs(entry.orbit-want.orbit)<1e-12);assert.equal(entry.signal,want.signal);}
return entry;
}
const a=await capture("reference");
const bounds=await page.locator("canvas").boundingBox();
await page.mouse.move(bounds.x+bounds.width/2,bounds.y+bounds.height/2);await page.mouse.down();
await page.mouse.move(bounds.x+bounds.width/2+30,bounds.y+bounds.height/2,{steps:1});await page.mouse.up();
const b=await capture("rotated");assert.notEqual(a.sha256,b.sha256);assert.notDeepEqual(a.camera,b.camera);
await page.locator("#reset").click();const c=await capture("restored");
assert.equal(a.sha256,c.sha256);assert.deepEqual(a.camera,c.camera);assert.deepEqual(a.projection,c.projection);
await page.locator("#cue").click();const d=await capture("cue-B");assert.notEqual(c.sha256,d.sha256);
assert.equal(await page.locator("#status").textContent(),"Proiezione, suono e luce sincronizzati");
await page.evaluate(()=>window.__resize(320,240));const mobile=await capture("mobile");assert.equal(mobile.width,320);assert.equal(mobile.height,240);
assert.equal(report.externalRequests.length,0);assert.equal(report.pageErrors.length,0);
report.status="PASS_MUSEO_INTERACTIVE_TRANSFER";
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{
writeFileSync(join(out,"museo-browser.json"),JSON.stringify(report,null,2)+"\n");
console.log("AWC-F WEBGL",JSON.stringify({status:report.status,revision:report.revision,frames:Object.fromEntries(Object.entries(report.frames).map(([k,v])=>[k,{sha256:v.sha256,width:v.width,height:v.height,orbit:v.orbit,signal:v.signal}])),result:report.result,error:report.error}));
if(browser)await browser.close();server.close();
}
