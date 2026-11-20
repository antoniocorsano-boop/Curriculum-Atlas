/* Source-grounded Web lighting bridge for Atlas Library. No remote assets. */
(()=>{
  "use strict";
  function once(s,a,b){const p=s.split(a);if(p.length!==2)throw Error("ATLAS_LIGHT_RIG_SCHEMA:"+a.slice(0,50));return p.join(b)}
  window.atlasLightingBridge=function(source){
    const hasSun=' const sun=new THREE.DirectionalLight(0xffffff,1.05);sun.color.setRGB(1,.91,.79);';
    const hasRender=' renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:false});';
    const hasFill=' const fill=new THREE.DirectionalLight(0xddeaff,.18);fill.position.set(0,4,9);scene.add(fill);';
    const hasFinal=' nativePhase="first-render";ready=true;setCamera();render();';
    source=once(source,hasRender,hasRender+'\n renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;');
    source=once(source,hasSun,` const sun=new THREE.DirectionalLight(0xffffff,1.05);sun.color.setRGB(1,.91,.79);
 // One static, physically located daylight-shadow pass, not a 36-light mobile shadow rig.
 sun.castShadow=true;sun.shadow.mapSize.set(innerWidth<=650?512:1024,innerWidth<=650?512:1024);
 Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:55});
 sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00022;sun.shadow.normalBias=.032;sun.shadow.radius=3;`);
    source=once(source,hasFill,hasFill+`
 // Transfer the master A5.4c crown and tier lighting structure. Blender
 // AREA watts do not convert directly to Three SpotLight intensity.
 if(NATIVE_LIGHTING.crownWashCount!==8||NATIVE_LIGHTING.crownWashWatts?.length!==8||NATIVE_LIGHTING.shelfWashWatts?.length!==3)throw Error("Atlas source lighting contract changed");
 const sectorLighting=[];
 const crownAngles=innerWidth<=650?[2,6]:[0,1,2,3,4,5,6,7];
 for(const i of crownAngles){
   const t=2*Math.PI*i/8,w=NATIVE_LIGHTING.crownWashWatts[i];
   const spot=new THREE.SpotLight(0xffd8ab,.72*w/56,3.7,Math.PI/3,.72,1.45);
   spot.position.set(8.35*Math.sin(t),10.1,-8.35*Math.cos(t));
   spot.target.position.set(9.5*Math.sin(t),11,-9.5*Math.cos(t));
   spot.name="Crown wash approximate "+i;scene.add(spot,spot.target);sectorLighting.push(spot);
 }
 // Nine bounded shelf accents approximate 36 Cycles area lights. Mobile
 // shaders run 9 rather than 36 dynamic shelf emitters.
 const crownCount=sectorLighting.length;
 const shelfAngles=[-Math.PI/2,0,Math.PI/2];
 const shelfLevels=innerWidth<=650?[1]:[0,1,2];
 for(const level of shelfLevels)for(const t of shelfAngles){
   const w=NATIVE_LIGHTING.shelfWashWatts[level];
   const spot=new THREE.SpotLight(0xffddbd,.42*w/61,3.6,Math.PI/2.5,.77,1.55);
   spot.position.set(9.65*Math.sin(t),2.55+level*3.63,-9.65*Math.cos(t));
   spot.target.position.set(10.6*Math.sin(t),1.45+level*3.63,-10.6*Math.cos(t));
   spot.name="Shelf wash approximate "+level;scene.add(spot,spot.target);sectorLighting.push(spot);
 }
 `);
    source=once(source,hasFinal,` // Static shadows cover the architectural structure and the open cupola;
 // no 495 individual per-frame shelf shadow casters on a mobile GPU.
 for(const id of ["shell","scenography","cupola","portals"]){
   groupMap[id].traverse(o=>{if(o.isMesh){o.receiveShadow=true;o.castShadow=id==="shell"||id==="cupola";}});
 }
 groupMap.bays.traverse(o=>{if(o.isMesh)o.receiveShadow=true});
 renderer.shadowMap.needsUpdate=true;
 scene.userData.atlasLighting={mode:"web-architectural-lite-v2",crownCount:crownCount,shelfCount:sectorLighting.length-crownCount,shadowMapSize:sun.shadow.mapSize.x,oneTimeShadows:true,materialModel:innerWidth<=650?"original-maps-scalar":"microstructure",mobileTier:innerWidth<=650?"balanced":"desktop"};
 `+hasFinal);
    // The ALS button animates decorative point sprites, not architectural lights.
    source=once(source,'<button id="atlas-astral-toggle" type="button" aria-pressed="false">Anima luci</button>',
                       '<button id="atlas-astral-toggle" type="button" aria-pressed="false">Anima stelle</button>');
    source=once(source,'motionButton.textContent="Anima luci"','motionButton.textContent="Anima stelle"');
    source=once(source,'motionButton.textContent="Ferma luci"','motionButton.textContent="Ferma stelle"');
    return source;
  };
})();