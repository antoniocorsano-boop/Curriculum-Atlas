// Isolated browser qualification; no application route, no remote runtime requests.
import {chromium} from "playwright";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {createServer} from "node:http";
import assert from "node:assert/strict";
const input=resolve(process.argv[2]),out=resolve(process.argv[3]);
mkdirSync(out,{recursive:true});
const temp=mkdtempSync(join(tmpdir(),"atlas-c32b-"));
let browser,server;
try {
  const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
  const extract=path=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+path],{maxBuffer:8*1024*1024});
  const blob=bytes=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length+"\0"),bytes])).digest("hex");
  const engine=extract("build/three.min.js"),loader=extract("examples/js/loaders/GLTFLoader.js"),license=extract("LICENSE");
  assert.equal(blob(engine),"b14f47c0908bab15e890b468d53bb07db0be3a18");
  assert.equal(blob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686");
  assert.equal(blob(license),"5303437e406ed22d8cb0b4c12398870792a25878");
  const receipt=JSON.parse(readFileSync(join(input,"ao-manifest.json"),"utf8"));
  const glb=readFileSync(join(input,"campata-ao.glb"));
  assert.equal(createHash("sha256").update(glb).digest("hex"),receipt.files["campata-ao.glb"].sha256);
  const html=Buffer.from('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}canvas{display:block}</style></head><body><script src="/three.js"></script><script src="/loader.js"></script></body></html>');
  const resources={"/": [html,"text/html"],"/three.js":[engine,"text/javascript"],"/loader.js":[loader,"text/javascript"],"/bay.glb":[glb,"model/gltf-binary"]};
  server=createServer((req,res)=>{const item=resources[req.url];if(!item){res.writeHead(404);res.end();return}res.writeHead(200,{"Content-Type":item[1],"Cache-Control":"no-store"});res.end(item[0])});
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const origin="http://127.0.0.1:"+server.address().port;
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  const results=[];
  for(const [width,height] of [[360,640],[800,800],[1200,800]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[],external=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
    await page.route("**/*",route=>{const url=route.request().url();if(url.startsWith(origin+"/")||url.startsWith("blob:")||url.startsWith("data:"))return route.continue();external.push(url);return route.abort()});
    await page.goto(origin);
    const metrics=await page.evaluate(async()=>{
      const T=window.THREE;
      if(T.REVISION!=="128")throw Error("Wrong engine");
      const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=T.sRGBEncoding;
      renderer.toneMapping=T.ACESFilmicToneMapping;
      document.body.appendChild(renderer.domElement);
      const scene=new T.Scene();scene.background=new T.Color(0x29303c);
      const gltf=await new T.GLTFLoader().loadAsync("/bay.glb");scene.add(gltf.scene);
      const bounds=new T.Box3().setFromObject(gltf.scene),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
      const cam=new T.PerspectiveCamera(42,innerWidth/innerHeight,.1,100);
      const distance=Math.max(size.y/(2*Math.tan(T.MathUtils.degToRad(21))),size.x/(2*Math.tan(T.MathUtils.degToRad(21))*cam.aspect))*1.35;
      cam.position.copy(center).add(new T.Vector3(.25,.10,1).normalize().multiplyScalar(distance));cam.lookAt(center);
      scene.add(new T.HemisphereLight(0xfff4de,0x65554a,1.4));
      const key=new T.DirectionalLight(0xffebd2,.8);key.position.set(3,5,5);scene.add(key);
      const materials=new Set();let meshes=0;
      gltf.scene.traverse(o=>{if(!o.isMesh)return;meshes++;if(!o.geometry.attributes.uv2||!o.geometry.attributes.uv)throw Error("Missing UV1/UV0");for(const m of (Array.isArray(o.material)?o.material:[o.material])){if(!m.aoMap||!m.aoMap.image)throw Error("Missing decoded AO");materials.add(m)}});
      if(meshes!==11||materials.size!==11)throw Error("Unexpected primitives/materials: "+meshes+"/"+materials.size);
      const capture=()=>{renderer.render(scene,cam);const gl=renderer.getContext();const p=new Uint8Array(innerWidth*innerHeight*4);gl.readPixels(0,0,innerWidth,innerHeight,gl.RGBA,gl.UNSIGNED_BYTE,p);if(gl.getError()!==gl.NO_ERROR)throw Error("WebGL error");return p};
      for(const m of materials)m.aoMapIntensity=0;
      const a=capture();window.atlasBefore=renderer.domElement.toDataURL("image/png");
      for(const m of materials)m.aoMapIntensity=1;
      const b=capture();
      let changed=0,darker=0,delta=0;
      for(let i=0;i<a.length;i+=4){const x=a[i]+a[i+1]+a[i+2],y=b[i]+b[i+1]+b[i+2];if(Math.abs(x-y)>3)changed++;if(x-y>3)darker++;delta+=x-y}
      window.atlasAfter=renderer.domElement.toDataURL("image/png");
      return {meshes,materials:materials.size,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,changedPixels:changed,darkerPixels:darker,delta,aoImages:new Set([...materials].map(m=>m.aoMap.image)).size,renderer:renderer.getContext().getParameter(renderer.getContext().RENDERER)};
    });
    assert.equal(errors.length,0,errors.join("\n"));assert.equal(external.length,0,external.join("\n"));
    assert.equal(metrics.drawCalls,11);assert.ok(metrics.triangles>0&&metrics.changedPixels>100&&metrics.darkerPixels>100&&metrics.delta>0,JSON.stringify(metrics));
    for(const name of ["Before","After"]){const uri=await page.evaluate(n=>window["atlas"+n],name);writeFileSync(join(out,width+"x"+height+"-"+name.toLowerCase()+".png"),Buffer.from(uri.split(",")[1],"base64"))}
    results.push({width,height,...metrics,externalRequests:external.length,errors:errors.length});
    await page.close();
  }
  writeFileSync(join(out,"webgl.json"),JSON.stringify({status:"PASS",engine:"r128",loaderBlob:blob(loader),softwareRenderer:true,studentAuthorized:false,results},null,2)+"\n");
  writeFileSync(join(out,"THREE-LICENSE.txt"),license);
  console.log(JSON.stringify(results,null,2));
} finally {if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true})}
