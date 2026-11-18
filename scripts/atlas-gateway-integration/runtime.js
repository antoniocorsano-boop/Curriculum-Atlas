// Installed only in the local, opt-in Gateway candidate. No extra animation loop.
let atlasAstral=null;
let atlasAstralGroup=null;
let atlasAstralMotion=false;
const atlasAstralPreference=window.matchMedia("(prefers-reduced-motion: reduce)");
function updateAtlasAstral(renderer,elapsed){
  if(!atlasAstral)return;
  atlasAstral.update(Math.max(0,elapsed||0),{
    viewportWidth:Math.max(1,innerWidth),viewportHeight:Math.max(1,innerHeight),
    pixelRatio:renderer.getPixelRatio(),backdrop:"light",
    paused:!atlasAstralMotion||document.hidden,reducedMotion:atlasAstralPreference.matches
  });
}
async function installAtlasAstral(scene,renderer){
  const bytes=Uint8Array.from(atob(ATLAS_R2_BASE64),c=>c.charCodeAt(0));
  const gltf=await new Promise((resolve,reject)=>new THREE.GLTFLoader().parse(bytes.buffer,"",resolve,reject));
  const meshes=[];let vertices=0;
  gltf.scene.traverse(o=>{if(o.isMesh){meshes.push(o);vertices+=o.geometry.attributes.position.count;o.raycast=()=>{};}});
  if(meshes.length!==3||vertices!==9956)throw Error("R2 mesh topology mismatch");
  const group=new THREE.Group();
  group.name="Atlas R2 knowledge stars and ALS-01 R4";
  // The current Gateway has taller procedural portals. One shared transform
  // lifts the complete constellation (model and lights together).
  group.position.y=1.2;
  group.userData.decorative=true;
  group.add(gltf.scene);
  const als=ATLAS_ASTRAL.createAstralLights(THREE,ATLAS_R2_ANCHORS);
  if(als.object.geometry.attributes.position.count!==18)throw Error("ALS topology mismatch");
  group.add(als.object);scene.add(group);
  atlasAstral=als;atlasAstralGroup=group;
  const button=document.getElementById("atlas-astral-toggle");
  function sync(){button.hidden=false;button.disabled=atlasAstralPreference.matches;button.setAttribute("aria-pressed",String(atlasAstralMotion));button.textContent=atlasAstralMotion?"Ferma luci":"Anima luci";}
  function stop(){atlasAstralMotion=false;sync();updateAtlasAstral(renderer,0);}
  button.addEventListener("click",()=>{if(atlasAstralPreference.matches)return;atlasAstralMotion=!atlasAstralMotion;sync();updateAtlasAstral(renderer,0);});
  atlasAstralPreference.addEventListener("change",()=>{if(atlasAstralPreference.matches)stop();else sync();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
  renderer.domElement.addEventListener("webglcontextlost",stop,{once:true});
  window.addEventListener("pagehide",()=>{als.dispose();atlasAstral=null;atlasAstralGroup=null;scene.remove(group);for(const mesh of meshes){mesh.geometry.dispose();const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];for(const material of materials)material.dispose();}},{once:true});
  sync();updateAtlasAstral(renderer,0);
}
