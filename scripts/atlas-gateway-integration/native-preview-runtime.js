/* Local native master candidate. No independent navigation or deployment. */
let renderer,scene,camera,visibility,als,starGroup,portalGroup,environmentTarget,failed=false,ready=false,motion=false;
let frameId=0,angle=0,tilt=0,distance=1,closing=false,released=false;
const lifecycle=new AbortController(),events={signal:lifecycle.signal};
function assertActive(){if(closing||failed)throw Error("Native scene inactive");}
function cancelFrame(){if(frameId)clearTimeout(frameId);frameId=0;}
// ALS optical breathing has periods above 3.5 seconds. Bound the render
// cadence to avoid saturating software/mobile graphics and the event queue.
function scheduleFrame(){if(!frameId&&ready&&!failed&&!closing&&motion&&!document.hidden&&!down)frameId=setTimeout(()=>loop(performance.now()),100);}
const groupMap={};
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const canvas=document.querySelector("canvas");
const status=document.querySelector("#native-status");
const motionButton=document.querySelector("#atlas-astral-toggle");
// r128 normally chooses ImageBitmapLoader on Chromium; that loader fetches
// embedded blob URLs, which connect-src 'none' deliberately blocks.
// Decode only embedded images via the DOM image path (img-src blob:).
const nativeManager=new THREE.LoadingManager();
nativeManager.setURLModifier(url=>{
  if(!url.startsWith("blob:"))throw Error("Non-embedded GLTF resource rejected");
  return url;
});
const loader=new THREE.GLTFLoader(nativeManager);
loader.register(parser=>{
  parser.textureLoader=new THREE.TextureLoader(parser.options.manager);
  parser.textureLoader.setCrossOrigin(parser.options.crossOrigin);
  return {name:"ATLAS_embedded_image_decoder"};
});
let nativePhase="initialization";
const nativeDecoded={};
addEventListener("securitypolicyviolation",event=>{
  console.error("ATLAS_CSP "+event.violatedDirective+" "+event.blockedURI);
});
const toThree=p=>[p[0],p[2],-p[1]];
function send(type,extra={}){parent.postMessage({type,channel:ATLAS_CHANNEL,...extra},ATLAS_PARENT_ORIGIN)}
function fail(error){
  if(failed||closing)return;failed=true;ready=false;motion=false;cancelFrame();
  status.textContent="Sala 3D non disponibile.";
  console.error("ATLAS_NATIVE_FAILURE "+nativePhase+" "+(error?.message??String(error)));send("atlas-3d-error");
}
async function asset(id){
  return new Promise((resolve,reject)=>{
    if(closing||failed){reject(Error("Native scene inactive"));return}
    const timeout=setTimeout(()=>{cleanup();reject(Error("Native asset timeout "+id))},45000);
    const repeat=setInterval(request,750);
    function request(){send("atlas-native-asset-request",{id})}
    function cleanup(){clearTimeout(timeout);clearInterval(repeat);removeEventListener("message",receive);lifecycle.signal.removeEventListener("abort",abort)}
    function abort(){cleanup();reject(Error("Native scene closed"))}
    function receive(event){
      if(event.source!==parent||event.origin!==ATLAS_PARENT_ORIGIN)return;
      const d=event.data;
      if(!d||d.channel!==ATLAS_CHANNEL||d.type!=="atlas-native-asset"||d.id!==id||!(d.bytes instanceof ArrayBuffer))return;
      cleanup();resolve(d.bytes);
    }
    lifecycle.signal.addEventListener("abort",abort,{once:true});addEventListener("message",receive,events);request();
  });
}
async function loadModel(id){
  nativePhase="transfer:"+id;
  const bytes=await asset(id);assertActive();
  nativePhase="decode:"+id;
  const gltf=await new Promise((resolve,reject)=>loader.parse(bytes,"",resolve,reject));assertActive();
  if(!gltf.parser.textureLoader.isTextureLoader && !(gltf.parser.textureLoader instanceof THREE.TextureLoader))throw Error("Wrong embedded texture decoder");
  const images=gltf.parser.json.images||[];
  const textures=await gltf.parser.getDependencies("texture");assertActive();
  if(textures.some(t=>!t.image||!(t.image.width>0&&t.image.height>0)))throw Error("Embedded texture decode incomplete");
  nativeDecoded[id]={images:images.length,textures:textures.length,decoder:"TextureLoader"};
  console.info("ATLAS_NATIVE_DECODE "+id+" "+JSON.stringify(nativeDecoded[id]));
  const byName=new Map((gltf.parser.json.materials||[]).map(m=>[m.name,m]));
  gltf.scene.traverse(o=>{
    if(!o.isMesh)return;
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
      const strength=byName.get(m.name)?.extensions?.KHR_materials_emissive_strength?.emissiveStrength;
      if(strength!==undefined){if(!Number.isFinite(strength)||strength<0)throw Error("Material emission");m.emissiveIntensity=strength;}
      if(m.isMeshStandardMaterial||m.isMeshPhysicalMaterial){m.envMapIntensity=NATIVE_LIGHTING.ambientStrength;m.needsUpdate=true;}
    }
  });
  groupMap[id]=gltf.scene;scene.add(gltf.scene);return gltf.scene;
}
async function loadSky(){
  const bytes=await asset("sky");assertActive();
  const url=URL.createObjectURL(new Blob([bytes],{type:"image/png"}));
  try{
    const texture=await new THREE.TextureLoader().loadAsync(url);
    if(closing||failed){texture.dispose();assertActive();}
    texture.encoding=THREE.sRGBEncoding;texture.mapping=THREE.EquirectangularReflectionMapping;
    return texture;
  }finally{URL.revokeObjectURL(url)}
}
async function loadHDR(){
  const bytes=await asset("ambient");assertActive();
  const decoded=new THREE.RGBELoader().setDataType(THREE.HalfFloatType).parse(bytes);
  if(!decoded||!decoded.data||decoded.width<1||decoded.height<1)throw Error("HDR decode");
  const channels=decoded.data.length/(decoded.width*decoded.height);
  if(channels!==3&&channels!==4)throw Error("HDR channels");
  const tex=new THREE.DataTexture(decoded.data,decoded.width,decoded.height,channels===3?THREE.RGBFormat:THREE.RGBAFormat,decoded.type);
  tex.encoding=THREE.LinearEncoding;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;
  tex.flipY=true;tex.generateMipmaps=false;tex.mapping=THREE.EquirectangularReflectionMapping;tex.needsUpdate=true;
  const pmrem=new THREE.PMREMGenerator(renderer);
  const target=pmrem.fromEquirectangular(tex);
  tex.dispose();pmrem.dispose();return target;
}
function buildBays(){
  const root=groupMap.bays,originals=[];root.traverse(o=>{if(o.isMesh)originals.push(o)});
  if(originals.length!==495)throw Error("Native bay count");
  const buckets=new Map(),unbatched=[];
  for(const o of originals){
    if(Array.isArray(o.material)||o.material.transparent||o.matrixWorld.determinant()<=0||o.isSkinnedMesh||o.morphTargetInfluences?.length){unbatched.push(o);continue}
    const key=o.geometry.uuid+"/"+o.material.uuid;
    if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(o);
  }
  const group=new THREE.Group();group.name="Native bay visibility batches";
  let count=0;
  for(const objects of buckets.values()){
    if(objects.length===1){unbatched.push(objects[0]);continue}
    const inst=new THREE.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);
    inst.frustumCulled=false;inst.raycast=()=>{};
    for(let i=0;i<objects.length;i++)inst.setMatrixAt(i,objects[i].matrixWorld);
    inst.instanceMatrix.needsUpdate=true;group.add(inst);count+=objects.length;
  }
  for(const o of unbatched){const clone=new THREE.Mesh(o.geometry,o.material);clone.matrixAutoUpdate=false;clone.matrix.copy(o.matrixWorld);group.add(clone)}
  if(count+unbatched.length!==originals.length)throw Error("Native bay coverage");
  scene.add(group);root.visible=false;scene.updateMatrixWorld(true);
  visibility=ATLAS_VISIBILITY.createBayVisibility(THREE,group,originals);
}
function setCamera(){
  const w=Math.max(1,innerWidth),h=Math.max(1,innerHeight),aspect=w/h;
  const view=NATIVE_CAMERAS.find(v=>v.id===(aspect<1?"vertical":"atrium"));
  const target=new THREE.Vector3(...view.target),offset=new THREE.Vector3(...view.position).sub(target);
  offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle).multiplyScalar(distance);
  target.y+=tilt;camera.position.copy(new THREE.Vector3(...view.target).add(offset));camera.lookAt(target);
  camera.aspect=aspect;
  // Native stage can be much wider than the full viewport. Preserve a
  // generous vertical field rather than cropping the original cupola.
  camera.fov=Math.max(55,THREE.MathUtils.radToDeg(2*Math.atan(36/view.lensMm/(aspect>=1?aspect:1)/2)));
  camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
  if(canvas.width!==w||canvas.height!==h)renderer.setSize(w,h);visibility.update(camera);
}
function render(t=0){
  if(!ready||failed||closing)return;
  visibility.update(camera);
  als.update(Math.max(0,t/1000),{viewportWidth:innerWidth,viewportHeight:innerHeight,pixelRatio:renderer.getPixelRatio(),backdrop:"light",paused:!motion||document.hidden,reducedMotion:reduced.matches});
  renderer.render(scene,camera);
}
function loop(t){
  frameId=0;if(!ready||failed||closing||!motion||document.hidden)return;
  if(down)return;
  render(t);scheduleFrame();
}
function stopMotion(redraw=true){
  cancelFrame();motion=false;
  motionButton.textContent="Anima luci";motionButton.setAttribute("aria-pressed","false");
  if(redraw&&!closing&&!document.hidden)render();
}
function quiesce(){
  if(closing)return;
  closing=true;ready=false;motion=false;nativePhase="closed";cancelFrame();
  lifecycle.abort();down=null;
  console.info("ATLAS_NATIVE_CLOSED");
}
function shutdown(){
  quiesce();if(released)return;released=true;
  // Explicit resource release is for an isolated, retained document only.
  // Do not force synchronous GPU operations during navigation or unload.
  // Explicitly release scene-owned GPU resources, once per shared object.
  // renderer.dispose alone does not dispose geometry, materials or textures.
  const geometries=new Set(),materials=new Set(),textures=new Set();
  scene?.traverse(o=>{
    if(o.geometry)geometries.add(o.geometry);
    for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[])materials.add(m);
  });
  if(als){geometries.delete(als.object.geometry);materials.delete(als.object.material);als.dispose();}
  for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
  for(const g of geometries)g.dispose();
  if(scene?.background?.isTexture)textures.add(scene.background);
  for(const texture of textures)texture.dispose();
  environmentTarget?.dispose();environmentTarget=null;
  if(renderer){renderer.dispose();renderer.forceContextLoss();}
  console.info("ATLAS_NATIVE_RESOURCES_RELEASED");
}
function reset(){angle=0;tilt=0;distance=1;setCamera();render()}
function change(action){
  if(!ready)return;
  if(action==="left")angle=Math.max(-.30,angle-.11);
  if(action==="right")angle=Math.min(.30,angle+.11);
  if(action==="up")tilt=Math.min(1.3,tilt+.45);
  if(action==="down")tilt=Math.max(-1.3,tilt-.45);
  if(action==="near")distance=Math.max(.88,distance-.06);
  if(action==="far")distance=Math.min(1.12,distance+.06);
  if(action==="reset"){reset();return}
  setCamera();render();
}
const portalBoxes=NATIVE_PORTALS.map(p=>{
  const b=p.actualBoundsXYZ;
  return {id:p.id,box:new THREE.Box3(new THREE.Vector3(b[0],b[4],-b[3]),new THREE.Vector3(b[1],b[5],-b[2]))};
});
function hitPortal(x,y){
  if(!ready)return null;
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(x/innerWidth*2-1,1-y/innerHeight*2),camera);
  const hits=ray.intersectObject(portalGroup,true);
  if(!hits.length)return null;
  return portalBoxes.find(p=>p.box.clone().expandByScalar(.02).containsPoint(hits[0].point))?.id??null;
}
let down=null;
function requestPortal(id){
  if(!ready||closing)return;
  if(id==="studio"){send("atlas-open",{id});scheduleFrame();return;}
  // No rendering, disposal or GPU synchronization on the interaction path.
  // Parent validates the request and initiates a normal document navigation.
  quiesce();console.info("ATLAS_NATIVE_NAV_REQUEST "+id);send("atlas-open",{id});
}
canvas.addEventListener("pointerdown",e=>{if(!ready||closing)return;cancelFrame();down={x:e.clientX,y:e.clientY,angle,tilt};canvas.setPointerCapture(e.pointerId)},events);
canvas.addEventListener("pointermove",e=>{
 if(!down||!ready)return;
 if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<8)return;
 angle=THREE.MathUtils.clamp(down.angle+(down.x-e.clientX)*.002,-.30,.30);
 tilt=THREE.MathUtils.clamp(down.tilt+(e.clientY-down.y)*.008,-1.3,1.3);setCamera();render();
},events);
canvas.addEventListener("pointerup",e=>{
 if(!down||closing||!ready)return;
 const tap=Math.hypot(e.clientX-down.x,e.clientY-down.y)<8;
 down=null;
 if(tap){const id=hitPortal(e.clientX,e.clientY);if(id){requestPortal(id);return}}
 scheduleFrame();
},events);
canvas.addEventListener("pointercancel",()=>{down=null;scheduleFrame()},events);
for(const button of document.querySelectorAll("[data-action]"))button.addEventListener("click",()=>change(button.dataset.action),events);
motionButton.addEventListener("click",()=>{if(!ready||closing||reduced.matches)return;if(motion)stopMotion();else{motion=true;motionButton.textContent="Ferma luci";motionButton.setAttribute("aria-pressed","true");scheduleFrame()}},events);
reduced.addEventListener("change",()=>{if(reduced.matches)stopMotion();motionButton.disabled=reduced.matches},events);
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopMotion(false);else if(ready&&!closing)render()},events);
addEventListener("resize",()=>{if(ready&&!closing){setCamera();render()}},events);
// A persisted pagehide (back/forward cache) pauses rather than destroys
// the scene. A real unload is terminal and idempotent.
// The browser owns the lifetime of a departing iframe and its context.
// Synchronous forceContextLoss/disposal here can block the parent transition.
addEventListener("pagehide",e=>{if(e.persisted)stopMotion(false);else quiesce()},events);
addEventListener("pageshow",e=>{if(e.persisted&&ready&&!closing){setCamera();render()}},events);
async function init(){
 renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.outputEncoding=THREE.sRGBEncoding;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.82;
 canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();fail(Error("WebGL context lost"))},{once:true,signal:lifecycle.signal});
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(65,1,.05,150);
 nativePhase="sky";scene.background=await loadSky();assertActive();nativePhase="ambient";const env=await loadHDR();if(closing||failed){env.dispose();assertActive();}environmentTarget=env;scene.environment=env.texture;
 const hemi=new THREE.HemisphereLight(0xfff3dc,0x746b57,.22);scene.add(hemi);
 const sun=new THREE.DirectionalLight(0xffffff,1.05);sun.color.setRGB(1,.91,.79);
 const elevation=THREE.MathUtils.degToRad(NATIVE_LIGHTING.sunElevationDeg),azimuth=THREE.MathUtils.degToRad(NATIVE_LIGHTING.sunRotationDeg);
 sun.position.set(Math.cos(elevation)*Math.cos(azimuth),Math.sin(elevation),-Math.cos(elevation)*Math.sin(azimuth)).multiplyScalar(24);scene.add(sun);
 const fill=new THREE.DirectionalLight(0xddeaff,.18);fill.position.set(0,4,9);scene.add(fill);
 for(const id of ["shell","scenography","cupola","portals","bays","stars"]){await loadModel(id);assertActive();}
 portalGroup=groupMap.portals;starGroup=groupMap.stars;
 let starMeshes=0,starVertices=0;starGroup.traverse(o=>{if(o.isMesh){starMeshes++;starVertices+=o.geometry.attributes.position.count}});
 if(starMeshes!==3||starVertices!==9956)throw Error("R2 topology");
 nativePhase="bay-compaction";scene.updateMatrixWorld(true);buildBays();
 als=ATLAS_ASTRAL.createAstralLights(THREE,NATIVE_ANCHORS);scene.add(als.object);
 if(als.object.geometry.attributes.position.count!==18)throw Error("ALS topology");
 // P1 is the last qualified material baseline. M1/M2 are intentionally
 // not applied while their separate qualification is unresolved.
 nativePhase="first-render";ready=true;setCamera();render();
 if(renderer.info.render.calls<1)throw Error("Native renderer empty");
 status.hidden=true;document.querySelector("#native-controls").hidden=false;
 motionButton.disabled=reduced.matches;
 nativePhase="ready";send("atlas-3d-ready");
}
init().catch(fail);
