// Photometric A/B comparison of the exact qualified native master. Draft only.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {createServer} from "node:http";
import {chromium} from "playwright";
import sharp from "sharp";
import {atlasAnchors,OPTICS} from "../als01/core.mjs";
const [master,r2,out,hdriPath,referenceDir]=process.argv.slice(2).map(x=>resolve(x));
const materialMode=process.env.ATLAS_MASTER_MATERIAL==="1";
const spatialMode=materialMode||process.env.ATLAS_MASTER_SPATIAL==="1";
const materialBytes=readFileSync(join(master,"material-study.json"));
assert.equal(createHash("sha256").update(materialBytes).digest("hex"),"cdc62198dd97255566f20a1ff48419ecc0540598bf28c517ee7d1fb3f8c9cdc6");
const materialStudy=JSON.parse(materialBytes);
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
const hdr=readFileSync(hdriPath);
assert.equal(sha(hdr),"cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130");
add("ambient.hdr",hdr,"application/octet-stream");
const refs={
 atrium:{file:"candidate-atrium.png",sha:"433e1ee703f26ce9e6105f19155ffd1f26945ebee9ab8aa77292e9a0e3991487"},
 vertical:{file:"candidate-vertical.png",sha:"e704445bda67e29f69b53a6463c10b6063d3ea5fc6f790b4a310d3ee062aac89"}
};
for(const ref of Object.values(refs))assert.equal(sha(readFileSync(join(referenceDir,ref.file))),ref.sha);
const sky=readFileSync(join(master,"atlas-sky-clouds.png"));
const lighting=JSON.parse(readFileSync(join(master,"lighting-study.json"),"utf8"));
assert.equal(sha(sky),lighting.skyPanoramaSha256);
add("sky.png",sky,"image/png");
const composition=JSON.parse(readFileSync("scripts/atlas-gateway-c3/knowledge-composition.json","utf8"));
const anchors=atlasAnchors(composition);
assert.equal(OPTICS.revision,"ALS-01-R4");
for(const name of ["core.mjs","three-adapter.mjs"])add(name,readFileSync(join("scripts/als01",name)),"text/javascript");
if(spatialMode)add("bay-visibility.mjs",readFileSync("scripts/atlas-gateway-integration/bay-visibility.mjs"),"text/javascript");
if(materialMode)add("material-bridge.mjs",readFileSync("scripts/atlas-gateway-integration/material-bridge.mjs"),"text/javascript");
// Regional comparison is a diagnostic, not an artistic acceptance threshold.
async function compareReference(bytes,device){
 if(!refs[device.name])return null;
 const opts={resolveWithObject:true};
 const a=await sharp(bytes).removeAlpha().raw().toBuffer(opts);
 const b=await sharp(join(referenceDir,refs[device.name].file)).removeAlpha().raw().toBuffer(opts);
 assert.deepEqual([a.info.width,a.info.height,a.info.channels],[b.info.width,b.info.height,b.info.channels]);
 const {width:w,height:h,channels:c}=a.info;assert.equal(c,3);
 const zones=device.name==="atrium"?{sky:[.29,.027,.71,.12],shelf:[.034,.187,.267,.72],floor:[.042,.774,.192,.987],portal:[.458,.587,.542,.707],medallion:[.35,.867,.65,.947]}:{whole:[0,0,1,1]};
 const report={};
 for(const [name,[x0,y0,x1,y1]] of Object.entries({whole:[0,0,1,1],...zones})){
  let n=0,mae=0;const mean=[0,0,0],target=[0,0,0];
  for(let y=Math.floor(y0*h);y<Math.floor(y1*h);y++)for(let x=Math.floor(x0*w);x<Math.floor(x1*w);x++){
   const i=(y*w+x)*3;n++;
   for(let k=0;k<3;k++){mean[k]+=a.data[i+k];target[k]+=b.data[i+k];mae+=Math.abs(a.data[i+k]-b.data[i+k]);}
  }
  report[name]={meanRGB:mean.map(v=>v/n),referenceRGB:target.map(v=>v/n),meanAbsoluteRGB:mae/(3*n)};
 }
 return report;
}
const temp=mkdtempSync(join(tmpdir(),"atlas-native-master-"));
const results=[],failures=[];
let browser,server;
try{
 const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
 const extract=p=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+p],{maxBuffer:8*1024*1024});
 assert.equal(pack.integrity,"sha512-i0ap/E+OaSfzw7bD1TtYnPo3VEplkl70WX5fZqZnfZsE3k3aSFudqrrC9ldFZfYFkn1zwDmBcdGfiIm/hnbyZA==");
 const engine=extract("build/three.min.js"),loader=extract("examples/js/loaders/GLTFLoader.js"),rgbe=extract("examples/js/loaders/RGBELoader.js");
 assert.equal(blob(engine),"b14f47c0908bab15e890b468d53bb07db0be3a18");
 assert.equal(blob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686");
 add("three.js",engine,"text/javascript");add("loader.js",loader,"text/javascript");add("rgbe.js",rgbe,"text/javascript");
 add("index.html",Buffer.from('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:#263e50}canvas{display:block}</style></head><body><script src="/three.js"></script><script src="/loader.js"></script><script src="/rgbe.js"></script></body></html>'),"text/html");
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
   const metrics=await page.evaluate(async({receipt,anchors,device,lighting,spatialMode,materialMode,materialStudy})=>{
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
    const hemi=new T.HemisphereLight(0xfff3dc,0x746b57,.85);scene.add(hemi);
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
    als.object.visible=false;stars.visible=false;const noStars=capture();stars.visible=true;als.object.visible=true;
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
    // Baseline evidence from the unchanged native probe. Compare two bounded
    // light configurations using the same camera, geometry, sky and materials.
    const profiles=[{id:"native-control",image:renderer.domElement.toDataURL("image/png"),calls:restored.calls,triangles:restored.triangles}];
    const hdrTexture=await new T.RGBELoader().setDataType(T.HalfFloatType).loadAsync("/ambient.hdr");
    hdrTexture.mapping=T.EquirectangularReflectionMapping;
    const hdrPMREM=new T.PMREMGenerator(renderer);const hdrEnv=hdrPMREM.fromEquirectangular(hdrTexture);hdrPMREM.dispose();hdrTexture.dispose();
    scene.environment=hdrEnv.texture; // background remains the original sky.
    if(scene.background!==sky)throw Error("Sky identity changed");
    const elevation=T.MathUtils.degToRad(lighting.sunElevationDeg),azimuth=T.MathUtils.degToRad(lighting.sunRotationDeg);
    sun.position.set(Math.cos(elevation)*Math.cos(azimuth),Math.sin(elevation),-Math.cos(elevation)*Math.sin(azimuth)).multiplyScalar(24);
    sun.color.setRGB(1,.91,.79);
    const allMaterials=new Set();
    scene.traverse(o=>{if(o.isMesh){for(const m of Array.isArray(o.material)?o.material:[o.material])allMaterials.add(m);}});
    // Same glTF material parameters; only environmental illumination changes.
    for(const m of allMaterials)if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial){m.envMapIntensity=lighting.ambientStrength;m.needsUpdate=true;}
    let spatial=null,materialEvidence=null;
    const candidates=[
      {id:"P1-hdr-balanced",exposure:.82,hemi:.22,sun:1.05,fill:.18,shadow:false},
      {id:"P2-hdr-relief",exposure:.75,hemi:.14,sun:1.35,fill:.15,shadow:true}
    ];
    for(const p of spatialMode?candidates.slice(0,1):candidates){
      renderer.toneMappingExposure=p.exposure;hemi.intensity=p.hemi;sun.intensity=p.sun;fill.intensity=p.fill;
      renderer.shadowMap.enabled=p.shadow;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
      sun.castShadow=p.shadow;
      if(p.shadow){
        sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15,near:.5,far:65});sun.shadow.camera.updateProjectionMatrix();
        sun.shadow.normalBias=.025;sun.shadow.bias=-.0002;
        scene.traverse(o=>{if(!o.isMesh)return;const mats=Array.isArray(o.material)?o.material:[o.material];o.castShadow=mats.every(m=>!m.transparent&&m.opacity===1);o.receiveShadow=true;});
        renderer.shadowMap.needsUpdate=true;
      }
      for(const m of allMaterials)m.needsUpdate=true;
      const warmup=capture(),rendered=capture();
      if(rendered.calls!==restored.calls||rendered.triangles!==restored.triangles)throw Error("Steady draw/triangle budget changed");
      const again=capture();if(diff(rendered.b,again.b).pixels!==0)throw Error("Static photometry changed pixels");
      als.object.visible=false;const noLight=capture();als.object.visible=true;
      const alsEffect=diff(rendered.b,noLight.b).pixels;
      if(alsEffect<1||rendered.calls-noLight.calls!==1)throw Error("ALS regression "+p.id);
      capture();profiles.push({...p,alsPixels:alsEffect,calls:rendered.calls,triangles:rendered.triangles,initialShadowCalls:warmup.calls,changedFromControl:diff(restored.b,rendered.b),image:renderer.domElement.toDataURL("image/png")});
    }
    if(spatialMode){
      const {createBayVisibility}=await import("/bay-visibility.mjs");
      const culling=createBayVisibility(T,optimized,originals);
      const initialPosition=camera.position.clone(),target=new T.Vector3(...view.target);
      const offset=initialPosition.clone().sub(target),axis=new T.Vector3(0,1,0);
      const poses=[{id:"reference",yaw:0,zoom:1},{id:"left",yaw:-.22,zoom:1},{id:"right-near",yaw:.22,zoom:.88},{id:"reset",yaw:0,zoom:1}];
      const checks=[];
      for(const pose of poses){
        camera.position.copy(target).add(offset.clone().applyAxisAngle(axis,pose.yaw).multiplyScalar(pose.zoom));camera.lookAt(target);camera.updateMatrixWorld(true);
        culling.restoreAll();const global=capture();
        optimized.visible=false;bays.visible=true;const individual=capture();
        bays.visible=false;optimized.visible=true;
        const stats=culling.update(camera),filtered=capture();
        const parity=diff(global.b,filtered.b),meshParity=diff(individual.b,filtered.b);
        if(!stats.culled||filtered.triangles>=global.triangles||filtered.calls>global.calls)throw Error("No safe culling gain "+JSON.stringify({pose,stats,global:global.triangles,filtered:filtered.triangles}));
        if(pose.id==="reference"&&filtered.triangles>global.triangles*.75)throw Error("Reference triangle reduction below 25%");
        if(filtered.triangles>individual.triangles||filtered.calls>=individual.calls)throw Error("Culling no better than individual meshes "+JSON.stringify({pose,filtered:[filtered.calls,filtered.triangles],individual:[individual.calls,individual.triangles]}));
        if(parity.pixels>innerWidth*innerHeight*.01||parity.mean>1||meshParity.pixels>innerWidth*innerHeight*.01||meshParity.mean>1)throw Error("Visible geometry parity regression "+JSON.stringify({pose,parity,meshParity}));
        const cached=culling.update(camera);if(cached.recomputed||cached.visible!==stats.visible)throw Error("Static camera triggered redundant matrix writes");
        const stable=capture();if(diff(stable.b,filtered.b).pixels!==0)throw Error("Static filtered image changed");
        checks.push({id:pose.id,globalCalls:global.calls,globalTriangles:global.triangles,individualCalls:individual.calls,individualTriangles:individual.triangles,filteredCalls:filtered.calls,filteredTriangles:filtered.triangles,stats,parity,meshParity});
      }
      if(checks[0].filteredTriangles!==checks[3].filteredTriangles||checks[0].stats.visible!==checks[3].stats.visible)throw Error("Reset visibility mismatch");
      const finalFiltered=capture();
      als.object.visible=false;const noLight=capture();als.object.visible=true;
      const alsPixels=diff(finalFiltered.b,noLight.b).pixels;
      if(alsPixels<1||finalFiltered.calls-noLight.calls!==1)throw Error("ALS culling regression");
      capture();
      profiles.push({id:"P1-spatial",calls:finalFiltered.calls,triangles:finalFiltered.triangles,alsPixels,image:renderer.domElement.toDataURL("image/png")});
      spatial={method:"per-instance conservative sphere compaction",checks,alsPixels,staticMatrixWritesAvoided:true,geometryModified:false};
      if(materialMode){
        const {materialBridge}=await import("/material-bridge.mjs");
        const bridge=materialBridge(T,groups,materialStudy);
        const detailViews=device.name==="atrium"?["detail","cupola-detail"]:[],materialChecks=[],detailProfiles=[];
        const baseFov=camera.fov;
        for(const id of ["reference",...detailViews]){
          if(id==="reference"){
            camera.position.copy(initialPosition);camera.lookAt(target);camera.fov=baseFov;
          }else{
            const v=receipt.cameras.find(q=>q.id===id);
            camera.position.set(...v.position);camera.lookAt(...v.target);
            camera.fov=T.MathUtils.radToDeg(2*Math.atan(36/v.lensMm/(aspect>=1?aspect:1)/2));
          }
          camera.updateProjectionMatrix();camera.updateMatrixWorld(true);culling.update(camera);
          bridge.apply("control");const baseline=capture();
          const comparison=[];
          for(const mode of ["scalar","micro"]){
            bridge.apply(mode);const result=capture();
            if(result.calls!==baseline.calls||result.triangles!==baseline.triangles)throw Error("Surface bridge changed render topology "+id+" "+mode);
            const again=capture();if(diff(result.b,again.b).pixels!==0)throw Error("Unstable material image "+id+" "+mode);
            const effect=diff(baseline.b,result.b);
            const profile={id:(mode==="scalar"?"M1-brass":"M2-micro")+(id==="reference"?"":"-"+id),calls:result.calls,triangles:result.triangles,changedFromP1:effect,image:renderer.domElement.toDataURL("image/png")};
            if(id==="reference"){
              als.object.visible=false;const noLight=capture();als.object.visible=true;
              profile.alsPixels=diff(result.b,noLight.b).pixels;
              if(profile.alsPixels<1||result.calls-noLight.calls!==1)throw Error("Material bridge ALS regression");
              capture();profile.image=renderer.domElement.toDataURL("image/png");profiles.push(profile);
            }else detailProfiles.push(profile);
            comparison.push({mode,effect,calls:result.calls,triangles:result.triangles});
          }
          bridge.apply("control");const restoredMaterial=capture();
          if(diff(baseline.b,restoredMaterial.b).pixels!==0)throw Error("Material bridge reversibility failure "+id);
          materialChecks.push({view:id,baselineCalls:baseline.calls,baselineTriangles:baseline.triangles,comparison});
        }
        camera.position.copy(initialPosition);camera.lookAt(target);camera.fov=baseFov;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);culling.update(camera);
        bridge.apply("micro");capture();
        materialEvidence={sourcePhase:materialStudy.phase,records:bridge.evidence(),checks:materialChecks,detailProfiles,geometryModified:false,sourceMapsReplaced:false,proceduralParity:false,sourceScalarsRestored:true};
      }
    }
    if(scene.background!==sky||groups["library-cupola.glb"].visible!==true)throw Error("Protected architecture changed");
    const debug=gl.getExtension("WEBGL_debug_renderer_info");
    return {profiles,spatial,materialEvidence,loadMs,originalCalls:original.calls,optimizedCalls:final.calls,originalTriangles:original.triangles,optimizedTriangles:final.triangles,originalMeshes:originals.length,instancedCount,batches,unbatched:unbatched.length,parity,centers,alsPixels:lights.pixels,moduleEffect,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
   },{receipt,anchors,device,lighting,spatialMode,materialMode,materialStudy});
   assert.equal(external.length,0);assert.equal(errors.length,0,JSON.stringify(errors));
   const profiles=[];
   for(const p of metrics.profiles){
    const {image,...meta}=p;const bytes=Buffer.from(image.split(",")[1],"base64");
    const file=device.name+"-"+p.id+".png";writeFileSync(join(out,file),bytes);
    profiles.push({...meta,image:{file,sha256:sha(bytes),bytes:bytes.length},referenceComparison:await compareReference(bytes,device)});
   }
   delete metrics.profiles;
   if(metrics.materialEvidence){
    const details=[];
    for(const p of metrics.materialEvidence.detailProfiles){
      const {image,...meta}=p,bytes=Buffer.from(image.split(",")[1],"base64");
      const file=device.name+"-"+p.id+".png";writeFileSync(join(out,file),bytes);
      details.push({...meta,image:{file,sha256:sha(bytes),bytes:bytes.length}});
    }
    metrics.materialEvidence.detailProfiles=details;
   }
   results.push({device:device.name,...metrics,profiles,errors,external,warnings});
  }catch(e){failures.push({device:device.name,error:String(e),errors,external,warnings});await page.screenshot({path:join(out,device.name+"-failure.png")}).catch(()=>{});}
  finally{await context.close();}
 }
}finally{
 await browser?.close();if(server)await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});
 const report={status:failures.length||results.length!==3?"FAIL":"PASS",scope:materialMode?"NATIVE_MASTER_SURFACE_DETAIL":spatialMode?"NATIVE_MASTER_SPATIAL_CULLING":"NATIVE_MASTER_PHOTOMETRY_COMPARISON",materialStudySha256:sha(materialBytes),source:receipt.source,architectureFiles:receipt.files,bayPayload:receipt.bay.nativePayload,lighting:"same original sky; exact locked HDRI for reflection; source solar direction; two bounded WebGL profiles; no AgX/Cycles or baked AO parity",hdriSha256:sha(hdr),referenceImages:refs,geometryOptimized:spatialMode?"per-instance frustum compaction; no decimation":"instancing only; no decimation",gatewayIntegrated:false,artisticApproval:false,physicalDeviceQualified:false,studentAuthorized:false,publishable:false,results,failures};
 writeFileSync(join(out,"native-master-webgl.json"),JSON.stringify(report,null,2)+"\n");
 console.log(JSON.stringify(report));
}
assert.equal(failures.length,0,JSON.stringify(failures));assert.equal(results.length,3);
if(materialMode){
 const records=results.flatMap(d=>d.materialEvidence.records);
 for(const name of Object.keys(materialStudy.offlineMicrostructure))assert.ok(records.some(r=>r.name===name&&r.compiled>0),"No compiled source profile "+name);
 const checks=results.flatMap(d=>d.materialEvidence.checks);
 for(const mode of ["scalar","micro"])assert.ok(checks.some(c=>c.comparison.some(q=>q.mode===mode&&q.effect.pixels>0)),"No rendered effect "+mode);
}
