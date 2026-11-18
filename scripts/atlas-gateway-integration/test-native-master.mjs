// Native master draft browser probe. No Gateway replacement or publication.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {createServer} from "node:http";
import {chromium} from "playwright";
import {atlasAnchors,OPTICS} from "../als01/core.mjs";
const [master,r2,out]=process.argv.slice(2).map(x=>resolve(x));
mkdirSync(out,{recursive:true});
const sha=b=>createHash("sha256").update(b).digest("hex");
const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const receipt=JSON.parse(readFileSync(join(master,"architecture-transport-receipt.json"),"utf8"));
assert.equal(receipt.status,"DRAFT_ARCHITECTURE_TRANSPORT_PROBE");
assert.equal(receipt.bay.instances,495);
assert.equal(receipt.bay.uniqueMeshes,25);
assert.equal(receipt.placements.length,45);
const resources=new Map();
const add=(name,bytes,mime)=>resources.set("/"+name,[bytes,mime]);
for(const [name,record] of Object.entries({...receipt.files,"library-bays.glb":receipt.bay.nativePayload})){
  const data=readFileSync(join(master,name));assert.equal(data.length,record.bytes);assert.equal(sha(data),record.sha256);
  add(name,data,"model/gltf-binary");
}
const starBytes=readFileSync(join(r2,"four-stars.glb"));
assert.equal(sha(starBytes),"684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0");
add("four-stars.glb",starBytes,"model/gltf-binary");
const sky=readFileSync(join(master,"atlas-sky-clouds.png"));
const lighting=JSON.parse(readFileSync(join(master,"lighting-study.json"),"utf8"));
assert.equal(sha(sky),lighting.skyPanoramaSha256);
add("sky.png",sky,"image/png");
const composition=JSON.parse(readFileSync("scripts/atlas-gateway-c3/knowledge-composition.json","utf8"));
const anchors=atlasAnchors(composition);
assert.equal(OPTICS.revision,"ALS-01-R4");
for(const name of ["core.mjs","three-adapter.mjs"])add(name,readFileSync(join("scripts/als01",name)),"text/javascript");
const temp=mkdtempSync(join(tmpdir(),"atlas-native-master-"));
const results=[],failures=[];
let browser,server;
try{
 const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
 const extract=p=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+p],{maxBuffer:8*1024*1024});
 const engine=extract("build/three.min.js"),loader=extract("examples/js/loaders/GLTFLoader.js");
 assert.equal(blob(engine),"b14f47c0908bab15e890b468d53bb07db0be3a18");
 assert.equal(blob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686");
 add("three.js",engine,"text/javascript");add("loader.js",loader,"text/javascript");
 add("index.html",Buffer.from('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:#263e50}canvas{display:block}</style></head><body><script src="/three.js"></script><script src="/loader.js"></script></body></html>'),"text/html");
 server=createServer((req,res)=>{if(req.url==="/favicon.ico"){res.writeHead(204);return res.end()}const entry=resources.get(req.url==="/" ? "/index.html":req.url);if(!entry){res.writeHead(404);return res.end()}res.writeHead(200,{"Content-Type":entry[1],"Cache-Control":"no-store"});res.end(entry[0])});
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 for(const device of [{name:"atrium",w:1200,h:750,view:"atrium"},{name:"vertical",w:640,h:960,view:"vertical"},{name:"compact",w:320,h:568,view:"vertical",touch:true}]){
  const context=await browser.newContext({viewport:{width:device.w,height:device.h},deviceScaleFactor:1,isMobile:!!device.touch,hasTouch:!!device.touch});
  const page=await context.newPage(),errors=[],external=[],warnings=[];
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error")errors.push(m.text());if(m.type()==="warning")warnings.push(m.text())});
  await context.route("**/*",route=>{const url=route.request().url();if(url.startsWith(origin+"/")||url.startsWith("blob:")||url.startsWith("data:"))return route.continue();external.push(url);return route.abort()});
  try{
   await page.goto(origin,{waitUntil:"load"});
   const metrics=await page.evaluate(async({receipt,anchors,device})=>{
    const T=window.THREE,loader=new T.GLTFLoader();
    const {createAstralLights}=await import("/three-adapter.mjs");
    const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
    renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=T.sRGBEncoding;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
    document.body.appendChild(renderer.domElement);
    const scene=new T.Scene();
    const start=performance.now();
    const sky=await new T.TextureLoader().loadAsync("/sky.png");
    sky.encoding=T.sRGBEncoding;sky.mapping=T.EquirectangularReflectionMapping;
    scene.background=sky;
    const pmrem=new T.PMREMGenerator(renderer);const env=pmrem.fromEquirectangular(sky);scene.environment=env.texture;pmrem.dispose();
    // Web lighting approximation, not AgX/Cycles or the offline HDRI rig.
    scene.add(new T.HemisphereLight(0xfff3dc,0x746b57,.85));
    const sun=new T.DirectionalLight(0xffe2bc,1.15);sun.position.set(-6,8,5);scene.add(sun);
    const fill=new T.DirectionalLight(0xddeaff,.35);fill.position.set(0,4,9);scene.add(fill);
    const groups={};
    async function load(name){
      const gltf=await loader.loadAsync("/"+name);
      const definitions=gltf.parser.json.materials||[];
      const materialByName=new Map(definitions.map(m=>[m.name,m]));
      gltf.scene.traverse(o=>{if(!o.isMesh)return;
        const mats=Array.isArray(o.material)?o.material:[o.material];
        for(const mat of mats){const strength=materialByName.get(mat.name)?.extensions?.KHR_materials_emissive_strength?.emissiveStrength;
          if(strength!==undefined){if(!Number.isFinite(strength)||strength<0)throw Error("Invalid emissive strength");mat.emissiveIntensity=strength;}}
        o.raycast=()=>{};
      });
      scene.add(gltf.scene);groups[name]=gltf.scene;return gltf.scene;
    }
    for(const name of ["library-shell.glb","library-scenography.glb","library-cupola.glb","library-portals.glb","library-bays.glb","four-stars.glb"])await load(name);
    const loadMs=performance.now()-start;
    const stars=groups["four-stars.glb"];
    let starMeshes=0,starVertices=0;stars.traverse(o=>{if(o.isMesh){starMeshes++;starVertices+=o.geometry.attributes.position.count;}});
    if(starMeshes!==3||starVertices!==9956)throw Error("R2 topology");
    const als=createAstralLights(T,anchors);scene.add(als.object);als.update(0,{viewportWidth:innerWidth,viewportHeight:innerHeight,backdrop:"light",paused:true});
    if(als.object.geometry.attributes.position.count!==18)throw Error("ALS topology");
    const view=receipt.cameras.find(v=>v.id===device.view),aspect=innerWidth/innerHeight;
    const verticalSpan=36/view.lensMm/(aspect>=1?aspect:1);
    const camera=new T.PerspectiveCamera(T.MathUtils.radToDeg(2*Math.atan(verticalSpan/2)),aspect,.05,150);
    camera.position.set(...view.position);camera.lookAt(...view.target);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const bays=groups["library-bays.glb"],originals=[];
    bays.traverse(o=>{if(o.isMesh)originals.push(o)});
    // A glTF primitive can split a source mesh. Every actual renderable
    // object is retained and batched only if geometry and material match.
    if(originals.length<receipt.bay.instances)throw Error("Bay instances missing");
    const bounds=new T.Box3().setFromObject(bays);
    for(let i=0;i<3;i++)if(Math.abs(bounds.min.getComponent(i)-receipt.bay.boundsThree.min[i])>.04||Math.abs(bounds.max.getComponent(i)-receipt.bay.boundsThree.max[i])>.04)throw Error("Bay world bounds mismatch");
    const gl=renderer.getContext();
    function capture(){
      renderer.render(scene,camera);
      const b=new Uint8Array(innerWidth*innerHeight*4);
      gl.readPixels(0,0,innerWidth,innerHeight,gl.RGBA,gl.UNSIGNED_BYTE,b);
      if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error("WebGL error");
      return {b,calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
    }
    function diff(a,b){let count=0,sum=0;for(let i=0;i<a.length;i+=4){const delta=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(delta>12)count++;sum+=delta;}return {pixels:count,mean:sum/(a.length/4*3)};}
    const original=capture();
    const buckets=new Map(),unbatched=[];
    for(const o of originals){
      if(Array.isArray(o.material)||o.material.transparent||o.matrixWorld.determinant()<=0||o.isSkinnedMesh||o.morphTargetInfluences?.length){unbatched.push(o);continue;}
      const key=o.geometry.uuid+"/"+o.material.uuid;
      if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
    }
    const optimized=new T.Group();optimized.name="Native library bay instances";
    let instancedCount=0,batches=0;
    for(const objects of buckets.values()){
      if(objects.length===1){unbatched.push(objects[0]);continue;}
      const inst=new T.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
      inst.frustumCulled=false;inst.raycast=()=>{};
      for(let i=0;i<objects.length;i++)inst.setMatrixAt(i,objects[i].matrixWorld);
      inst.instanceMatrix.needsUpdate=true;optimized.add(inst);instancedCount+=objects.length;batches++;
    }
    if(instancedCount+unbatched.length!==originals.length||batches===0)throw Error("Instancing coverage");
    // Leave the original group untouched. Unbatchable meshes are cloned with
    // the exact world matrix; never merge transparent materials.
    for(const o of unbatched){const clone=new T.Mesh(o.geometry,o.material);clone.matrixAutoUpdate=false;clone.matrix.copy(o.matrixWorld);clone.raycast=()=>{};optimized.add(clone);}
    scene.add(optimized);bays.visible=false;scene.updateMatrixWorld(true);
    const final=capture(),parity=diff(original.b,final.b);
    if(final.calls>=original.calls||parity.pixels>innerWidth*innerHeight*.01||parity.mean>1)throw Error("Instancing parity/calls "+JSON.stringify({before:original.calls,after:final.calls,parity}));
    const centers=anchors.map(a=>{const q=new T.Vector3(a.center[0],a.center[2],-a.center[1]).project(camera);return {id:a.id,inFrame:Math.abs(q.x)<1&&Math.abs(q.y)<1&&Math.abs(q.z)<1,x:q.x,y:q.y}});
    if(!centers.every(c=>c.inFrame))throw Error("Native constellation framing "+JSON.stringify(centers));
    als.object.visible=false;const noALS=capture();als.object.visible=true;
    const lights=diff(final.b,noALS.b);if(lights.pixels<1||final.calls-noALS.calls!==1)throw Error("ALS invisible or draw-call budget");
    stars.visible=false;const noStars=capture();stars.visible=true;
    if(diff(noALS.b,noStars.b).pixels<1)throw Error("R2 invisible");
    const moduleEffect={};
    for(const name of ["library-shell.glb","library-scenography.glb","library-cupola.glb","library-portals.glb"]){
      groups[name].visible=false;const hidden=capture();groups[name].visible=true;moduleEffect[name]=diff(final.b,hidden.b).pixels;
    }
    optimized.visible=false;const noBays=capture();optimized.visible=true;moduleEffect["library-bays.glb"]=diff(final.b,noBays.b).pixels;
    // Preserve measured occlusion results even for modules not visible in
    // a particular framing. Shell and shelving must be demonstrably present.
    if(moduleEffect["library-shell.glb"]<100||moduleEffect["library-bays.glb"]<100)throw Error("Architecture/bays not visible");
    const restored=capture();if(diff(final.b,restored.b).pixels>0)throw Error("Restoration differs");
    const debug=gl.getExtension("WEBGL_debug_renderer_info");
    return {loadMs,originalCalls:original.calls,optimizedCalls:final.calls,originalTriangles:original.triangles,optimizedTriangles:final.triangles,originalMeshes:originals.length,instancedCount,batches,unbatched:unbatched.length,parity,centers,alsPixels:lights.pixels,moduleEffect,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
   },{receipt,anchors,device});
   assert.equal(external.length,0);assert.equal(errors.length,0,JSON.stringify(errors));
   const image=device.name+".png",bytes=await page.screenshot({path:join(out,image)});
   results.push({device:device.name,...metrics,errors,external,warnings,image:{file:image,sha256:sha(bytes),bytes:bytes.length}});
  }catch(e){failures.push({device:device.name,error:String(e),errors,external,warnings});await page.screenshot({path:join(out,device.name+"-failure.png")}).catch(()=>{});}
  finally{await context.close();}
 }
}finally{
 await browser?.close();if(server)await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});
 const report={status:failures.length||results.length!==3?"FAIL":"PASS",scope:"NATIVE_MASTER_ISOLATED_WEBGL_PROBE",source:receipt.source,architectureFiles:receipt.files,bayPayload:receipt.bay.nativePayload,lighting:"local sky panorama + approximate WebGL rig; no AgX/HDRI/AO parity",geometryOptimized:"instancing only; no decimation",gatewayIntegrated:false,artisticApproval:false,physicalDeviceQualified:false,studentAuthorized:false,publishable:false,results,failures};
 writeFileSync(join(out,"native-master-webgl.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report));
}
assert.equal(failures.length,0,JSON.stringify(failures));assert.equal(results.length,3);
