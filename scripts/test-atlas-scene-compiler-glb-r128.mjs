import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from "node:fs";
import {resolve,join} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {chromium} from "playwright";
const [artifact,receiptPath,engineDir,outDir]=process.argv.slice(2).map(p=>resolve(p));
assert(artifact&&receiptPath&&engineDir&&outDir,"input arguments");
mkdirSync(outDir,{recursive:true});
const hex=b=>createHash("sha256").update(b).digest("hex");
const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const glb=readFileSync(artifact),r=JSON.parse(readFileSync(receiptPath,"utf8"));
assert.equal(r.status,"PASS_ISOLATED_BAKE_AND_GLTF");
assert.equal(r.revision,"4ad58f761246a317461c08dc7c78563a25fa2eda");
assert.equal(r.masterUnchanged,true);
assert.equal(r.export.sha256,"442791262d07bb48bb51800d89a149046067047163d117a04d4fad3395e2a856");
assert.equal(hex(glb),r.export.sha256);
assert.deepEqual(r.export.textureCoordinateSets,[1]);
assert.equal(r.export.unlit,false);
assert.deepEqual(r.export.primitiveAttributes,["NORMAL","POSITION","TEXCOORD_0","TEXCOORD_1"]);
const engine=readFileSync(join(engineDir,"three.min.js"));
assert.equal(blob(engine),"b14f47c0908bab15e890b468d53bb07db0be3a18","Three r128");
const temp=mkdtempSync(join(tmpdir(),"asc-p2c2-three-"));
let server,browser;
const report={schema:"atlas.asc01.p2c2-glb-webgl/v1",status:"PENDING",revision:process.env.ATLAS_EXACT_HEAD,
  p2c1Revision:r.revision,glbSha256:hex(glb),sourceMaster:r.masterSha256,
  externalRequests:[],pageErrors:[],consoleErrors:[],cspViolations:[],
  studentAuthorized:false,publishable:false,artisticApproval:false,physicalDeviceQualified:false,
  runtimeModified:false,masterModified:false};
function persist(){writeFileSync(join(outDir,"glb-browser.json"),JSON.stringify(report,null,2)+"\n")}
persist();
try{
  const info=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
  assert.equal(info.integrity,"sha512-i0ap/E+OaSfzw7bD1TtYnPo3VEplkl70WX5fZqZnfZsE3k3aSFudqrrC9ldFZfYFkn1zwDmBcdGfiIm/hnbyZA==");
  const loader=execFileSync("tar",["-xOf",join(temp,info.filename),"package/examples/js/loaders/GLTFLoader.js"]);
  assert.equal(blob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686","r128 GLTFLoader");
  const source=readFileSync("scripts/atlas-scene-compiler-glb-preview.js","utf8");
  assert(source.includes("__ASC_P2C2_GLB_BASE64__"));
  const js=Buffer.from(source.replace("__ASC_P2C2_GLB_BASE64__",glb.toString("base64")));
  assert(js.length<1200000,"local fixture memory budget");
  const html=Buffer.from('<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atlas · Luce precalcolata</title><link rel="stylesheet" href="/style.css"><body><header><strong>Atlas · Prova luce precalcolata</strong><span>Superficie reale isolata · Three.js r128</span><button id="reset">Ripristina</button></header><canvas width="640" height="440" aria-label="Superficie tridimensionale interattiva"></canvas><script src="/three.js"></script><script src="/loader.js"></script><script src="/scene.js"></script></body></html>');
  const css=Buffer.from("body{margin:0;background:#101722;color:#f2e8d4;font:14px system-ui}header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px}header span{color:#c1b9ac}button{min-height:44px;padding:8px 12px;background:#253143;border:1px solid #8b98ac;border-radius:8px;color:#fff}canvas{display:block;margin:auto;max-width:100%;touch-action:none;cursor:grab}");
  const files=new Map([["/",["text/html; charset=utf-8",html]],["/style.css",["text/css",css]],["/three.js",["application/javascript",engine]],["/loader.js",["application/javascript",loader]],["/scene.js",["application/javascript",js]]]);
  server=createServer((req,res)=>{
    res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'none'; img-src data: blob:; style-src 'self'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'");
    res.setHeader("X-Content-Type-Options","nosniff");
    const file=files.get(req.url);
    if(!file){res.writeHead(404);res.end();return}
    res.writeHead(200,{"Content-Type":file[0],"Cache-Control":"no-store"});res.end(file[1]);
  });
  await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
  const origin="http://127.0.0.1:"+server.address().port;
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const page=await browser.newPage({viewport:{width:800,height:560},deviceScaleFactor:1});
  page.on("request",req=>{if(!req.url().startsWith(origin+"/"))report.externalRequests.push(req.url())});
  page.on("pageerror",e=>report.pageErrors.push(String(e)));
  page.on("console",msg=>{if(msg.type()==="error")report.consoleErrors.push(msg.text())});
  page.on("console",msg=>{if(/Content Security Policy|ASC_CSP/.test(msg.text()))report.cspViolations.push(msg.text())});
  await page.goto(origin+"/",{waitUntil:"load"});
  await page.waitForFunction(()=>window.__asc?.status==="READY"||window.__asc?.status==="FAIL",{timeout:45000});
  const state=await page.evaluate(()=>({status:window.__asc.status,error:window.__asc.error||null}));
  assert.equal(state.status,"READY",state.error||"GLB decode");
  report.browser=await page.evaluate(()=>window.__asc.run());
  assert.equal(report.browser.material,"MeshBasicMaterial");
  assert.equal(report.browser.originalMaterial,"MeshStandardMaterial");
  assert.equal(report.browser.lightInvariance.changed,0);
  assert.equal(report.browser.highLightInvariance.changed,0);
  assert(report.browser.uvDifferent>0);
  const before=await page.evaluate(()=>document.querySelector("canvas").toDataURL("image/png"));
  const save=(name,data)=>{assert(data.startsWith("data:image/png;base64,"));const bytes=Buffer.from(data.slice(22),"base64");writeFileSync(join(outDir,name+".png"),bytes);return {sha256:hex(bytes),bytes:bytes.length}};
  report.screenshots={reference:save("reference",before)};
  const bounds=await page.locator("canvas").boundingBox();
  assert(bounds&&bounds.width>=640&&bounds.height>=440);
  await page.mouse.move(bounds.x+bounds.width*.55,bounds.y+bounds.height*.55);
  await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.72,bounds.y+bounds.height*.58,{steps:9});await page.mouse.up();
  const rotated=await page.evaluate(()=>document.querySelector("canvas").toDataURL("image/png"));
  assert.notEqual(before,rotated,"camera rotation must affect image");
  report.screenshots.rotated=save("rotated",rotated);
  await page.getByRole("button",{name:"Ripristina"}).click();
  const restored=await page.evaluate(()=>document.querySelector("canvas").toDataURL("image/png"));
  assert.equal(before,restored,"camera rollback exact image");
  report.screenshots.restored=save("restored",restored);
  const mobile=await page.evaluate(()=>{window.__asc.resize(320,240);return {image:document.querySelector("canvas").toDataURL("image/png"),width:document.querySelector("canvas").width,height:document.querySelector("canvas").height,probe:window.__asc.run()}});
  assert.equal(mobile.width,320);assert.equal(mobile.height,240);assert.equal(mobile.probe.lightInvariance.changed,0);
  report.screenshots.mobile=save("mobile",mobile.image);
  report.viewport={desktop:[640,440],mobile:[320,240],input:["pointer","reset"],rollbackPixelsEqual:true};
  assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.consoleErrors,[]);assert.deepEqual(report.cspViolations,[]);
  report.status="PASS_R128_GLB_UNLIT_TRANSFER";
  report.r128BrowserQualified=true;report.artisticReviewRequired=true;report.fullLibraryQualified=false;
  persist();console.log("ASC-P2C2",JSON.stringify({status:report.status,browser:report.browser,viewport:report.viewport}));
}catch(e){report.status="FAIL";report.error=String(e);persist();throw e}
finally{
  if(browser)await browser.close();
  if(server)await new Promise(resolve=>server.close(resolve));
  rmSync(temp,{recursive:true,force:true});
}
