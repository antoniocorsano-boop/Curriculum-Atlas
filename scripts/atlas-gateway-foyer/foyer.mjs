// ATLAS-GATEWAY-01 / G1.1 — atrio tridimensionale reale; nessuna libreria 3D aggiunta.
import {PORTALS,FOYER_SCHEMA,verifyPortalContract} from "./portal-contract.mjs";
import {createAtmosphereLayer} from "./motion-layer.mjs";

const stage=document.querySelector(".stage");
const canvas=document.getElementById("foyer-canvas");
const status=document.getElementById("foyer-status");
const links=[...document.querySelectorAll("nav.destinations [data-portal]")];
const setStatus=value=>{status.textContent=value;};
verifyPortalContract();
for(const p of PORTALS){
  const link=links.find(x=>x.dataset.portal===p.id);
  if(!link||link.getAttribute("href")!==p.href)throw Error("ATLAS_PORTAL_DOM_DRIFT:"+p.id);
}
if(links.length!==PORTALS.length)throw Error("ATLAS_EXTRA_PORTAL");

const T=globalThis.THREE;
const mobile=()=>window.matchMedia("(max-width:650px)").matches;
let renderer,scene,camera,request=0,orbit=0,vertical=0,pressed=null,portalPanels=[];
let stopped=false,selected=null,motionLayer=null;
const motionButton=document.getElementById("motion-preview");
const motionPreference=window.matchMedia("(prefers-reduced-motion: reduce)");
const motionOptIn=new URLSearchParams(location.search).get("vf-motion")==="1";
function highlight(id){
  selected=id;
  for(const {pane,portal} of portalPanels){
    const active=portal.id===id;
    if(!pane.userData.hitOnly){
      pane.material.color.setHex(active?0xffffff:0xf0f4f6);
      pane.material.opacity=active?1:.97;
    }
  }
  for(const link of links)link.dataset.active=String(link.dataset.portal===id);
  schedule();
}
function fallback(message){
  stopped=true;
  motionLayer?.dispose();
  if(motionButton)motionButton.hidden=true;
  document.body.classList.add("no-webgl");
  setStatus(message+" · Puoi usare direttamente gli accessi qui sotto.");
  if(renderer){try{renderer.dispose();renderer.forceContextLoss();}catch{}}
}
// One authoritative visual treatment for all four architectural portals.
// The Blender-backed scene uses a transparent UV-like graphic layer; the geometric
// fallback receives the same symbols and title over a restrained blue glass base.
const portalTextureCache=new Map();
function labelTexture(portal, transparentArtwork=false){
  const key=portal.id+(transparentArtwork?":art":":glass");
  if(portalTextureCache.has(key))return portalTextureCache.get(key);
  const c=document.createElement("canvas");c.width=512;c.height=768;
  const ctx=c.getContext("2d");if(!ctx)throw Error("Canvas2D assente");
  if(!transparentArtwork){
    const grad=ctx.createLinearGradient(0,0,0,768);
    grad.addColorStop(0,"#173a5a");
    grad.addColorStop(.55,"#103052");
    grad.addColorStop(1,"#081e37");
    ctx.fillStyle=grad;ctx.fillRect(0,0,512,768);
    // Leave the glass and its frame to the scene: no graphic second outline.
    const light=ctx.createRadialGradient(256,260,40,256,365,450);
    light.addColorStop(0,"rgba(69,149,207,.11)");
    light.addColorStop(1,"rgba(24,70,113,0)");
    ctx.fillStyle=light;ctx.fillRect(0,0,512,768);
  }
  ctx.save();ctx.translate(256,190);
  ctx.strokeStyle="#e6d1aa";ctx.fillStyle="#e6d1aa";ctx.lineWidth=9;
  ctx.lineCap="round";ctx.lineJoin="round";
  if(portal.id==="curricolo"){
    ctx.beginPath();ctx.moveTo(0,-43);ctx.bezierCurveTo(-23,-58,-53,-55,-72,-40);
    ctx.lineTo(-72,42);ctx.bezierCurveTo(-42,30,-19,32,0,48);
    ctx.bezierCurveTo(20,32,43,30,72,42);ctx.lineTo(72,-40);
    ctx.bezierCurveTo(50,-55,21,-58,0,-43);ctx.lineTo(0,48);ctx.stroke();
  }else if(portal.id==="esplora"){
    ctx.beginPath();ctx.arc(0,0,65,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(24,-30);ctx.lineTo(-9,39);
    ctx.lineTo(-25,-30);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
  }else if(portal.id==="percorsi"){
    ctx.beginPath();ctx.moveTo(-62,-39);ctx.lineTo(44,-39);ctx.lineTo(44,31);
    ctx.lineTo(-24,31);ctx.stroke();
    for(const [x,y] of [[-62,-39],[44,-39],[44,31],[-24,31]]){
      ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();
    }
  }else if(portal.id==="esperienze"){
    ctx.beginPath();ctx.moveTo(-58,49);ctx.lineTo(-58,-53);
    ctx.lineTo(58,-53);ctx.lineTo(58,49);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-21,48);ctx.lineTo(-21,-15);
    ctx.lineTo(24,-15);ctx.lineTo(24,48);ctx.stroke();
  }else throw Error("Unknown ATLAS portal: "+portal.id);
  ctx.restore();
  // The single visible name belongs to the portal surface, not HTML.
  ctx.fillStyle="#fff1d7";ctx.font="600 52px system-ui,sans-serif";
  ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(portal.label,256,285,454);
  // One subdued spatial motif below the title; never explanatory subtitles,
  // particle fields, duplicate icons, or decorative miniature cards.
  ctx.strokeStyle="rgba(104,185,221,.54)";ctx.lineWidth=4;
  ctx.beginPath();
  if(portal.id==="curricolo"){
    for(let i=0;i<3;i++){
      const y=556+i*31;
      ctx.moveTo(128,y);ctx.lineTo(256,y-23);ctx.lineTo(384,y);
      ctx.lineTo(256,y+23);ctx.closePath();
    }
  }else if(portal.id==="esplora"){
    ctx.ellipse(256,587,128,53,-.16,Math.PI,Math.PI*2);
    ctx.moveTo(140,612);ctx.quadraticCurveTo(256,525,372,612);
  }else if(portal.id==="percorsi"){
    ctx.moveTo(141,633);ctx.bezierCurveTo(202,639,185,552,256,590);
    ctx.bezierCurveTo(304,617,318,538,372,550);
  }else{
    ctx.moveTo(147,636);ctx.lineTo(147,550);ctx.lineTo(365,550);
    ctx.lineTo(365,636);ctx.moveTo(256,568);ctx.lineTo(256,632);
  }
  ctx.stroke();
  const texture=new T.CanvasTexture(c);
  texture.encoding=T.sRGBEncoding;texture.anisotropy=2;texture.needsUpdate=true;
  portalTextureCache.set(key,texture);
  return texture;
}
function box(w,h,d,color,metalness=.3,roughness=.4){
  return new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,metalness,roughness}));
}
function torus(radius,tube,color,y,rotation=0){
  const ring=new T.Mesh(new T.TorusGeometry(radius,tube,7,72),
    new T.MeshStandardMaterial({color,metalness:.7,roughness:.28,emissive:color,emissiveIntensity:.10}));
  ring.position.set(0,y,rotation);ring.rotation.x=Math.PI/2;scene.add(ring);return ring;
}
function drawFoyer(){
  // AWC / G2 — scenografia v2: architettura e materiali, non un secondo motore.
  // Geometrie e risorse locali senza animazione permanente o servizi esterni.
  const material=(color,metalness=.28,roughness=.52,emissive=0,emissiveIntensity=0)=>
    new T.MeshStandardMaterial({color,metalness,roughness,emissive,emissiveIntensity});
  const bronze=material(0xb69b69,.8,.28),darkBronze=material(0x66583f,.65,.39),
    darkWall=material(0x152737,.32,.76),obsidian=material(0x0c1826,.63,.3),
    recessed=material(0x0b1d31,.32,.66),glassFrame=material(0x224d73,.48,.36),
    blueLight=new T.MeshBasicMaterial({color:0x5eabf7,transparent:true,opacity:.55,depthWrite:false}),
    amberLight=new T.MeshBasicMaterial({color:0xffd4a1,transparent:true,opacity:.5,depthWrite:false});
  function add(mesh,x,y,z,parent=scene){
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  function section(w,h,d,x,y,z,mat,angle=0,parent=scene){
    const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.rotation.y=angle;
    return add(mesh,x,y,z,parent);
  }
  function circumference(radius,y,color,thickness=.038,z=-1.3){
    const mesh=new T.Mesh(new T.TorusGeometry(radius,thickness,6,92),color);
    mesh.rotation.x=-Math.PI/2;return add(mesh,0,y,z);
  }
  function radialPanel(a,r,y,w,h,mat){
    const x=Math.sin(a)*r,z=-1.3-Math.cos(a)*r;
    return section(w,h,.16,x,y,z,mat,-a);
  }
  function floorTexture(){
    const c=document.createElement("canvas");c.width=c.height=512;
    const ctx=c.getContext("2d");if(!ctx)throw Error("Decorative canvas not available");
    ctx.fillStyle="#192938";ctx.fillRect(0,0,512,512);
    for(let i=0;i<155;i++){
      const x=(i*173)%512,y=(i*311)%512,w=18+(i*37)%118;
      ctx.strokeStyle=i%3===0?"#5a718343":"#ced9d010";
      ctx.lineWidth=.4+(i%4)*.22;ctx.beginPath();ctx.moveTo(x,y);
      ctx.bezierCurveTo(x+w*.28,y-9,x+w*.65,y+5,x+w,y-6);ctx.stroke();
    }
    const t=new T.CanvasTexture(c);
    t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(2.5,2.5);
    t.encoding=T.sRGBEncoding;t.anisotropy=2;return t;
  }
  // Dark stone floor, bounded stage edge and only restrained brass inlays.
  const stoneMat=material(0xb5c2cb,.42,.42);stoneMat.map=floorTexture();
  const floor=new T.Mesh(new T.CylinderGeometry(11.7,11.7,.34,80),stoneMat);
  add(floor,0,-.27,-1.3);
  const perimeter=new T.Mesh(new T.CylinderGeometry(11.77,11.83,.18,80),darkBronze);
  add(perimeter,0,-.42,-1.3);
  for(const [r,th] of [[3.35,.035],[8.65,.027],[10.6,.045]]){
    circumference(r,-.083,bronze,th);
  }
  // Two overlapping shadows establish the central object's contact with floor.
  const shadowTex=(()=>{
    const c=document.createElement("canvas");c.width=c.height=128;const ctx=c.getContext("2d");
    const grad=ctx.createRadialGradient(64,64,6,64,64,62);
    grad.addColorStop(0,"rgba(0,0,0,.78)");grad.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
    return new T.CanvasTexture(c);
  })();
  for(const [r,alpha] of [[4.7,.7],[7,.25]]){
    const s=new T.Mesh(new T.PlaneGeometry(r*2,r*2),
      new T.MeshBasicMaterial({map:shadowTex,transparent:true,opacity:alpha,depthWrite:false}));
    s.rotation.x=-Math.PI/2;add(s,0,-.074,1.65);
  }
  // A solid rotunda with recessed wall bays and mezzanine, not an open wire cage.
  const wall=new T.Mesh(new T.CylinderGeometry(11.58,11.58,6.8,72,1,true,
    Math.PI*.5,Math.PI),new T.MeshStandardMaterial({
      color:0x13253a,metalness:.26,roughness:.78,side:T.BackSide}));
  add(wall,0,3.0,-1.3);
  for(const [y,th] of [[.19,.11],[3.48,.095],[5.8,.10]]){
    const band=new T.Mesh(new T.TorusGeometry(11.55,th,6,90,Math.PI),
      new T.MeshStandardMaterial({color:y===3.48?0x8c7656:0x5e5862,metalness:.76,roughness:.35}));
    band.rotation.x=-Math.PI/2;add(band,0,y,-1.3);
  }
  // Architectural piers, two-level framed wall bays and indirect blue coves.
  for(let i=0;i<=16;i++){
    const a=-Math.PI*.49+i*(Math.PI*.98/16);
    const x=Math.sin(a)*11.46,z=-1.3-Math.cos(a)*11.46;
    section(.32,6.42,.40,x,3.15,z,i%4===0?darkBronze:darkWall,-a);
    section(.12,6.2,.43,x,3.14,z,bronze,-a);
    if(i<16){
      const mid=a+Math.PI*.98/32;
      radialPanel(mid,11.37,2.3,1.06,3.45,recessed);
      const glow=radialPanel(mid,11.24,3.2,.72,1.15,
        new T.MeshBasicMaterial({color:0x2e69a9,transparent:true,opacity:.13,depthWrite:false}));
      glow.material.side=T.DoubleSide;
      radialPanel(mid,11.26,4.12,1.16,.035,bronze);
      radialPanel(mid,11.26,1.06,1.16,.04,darkBronze);
    }
  }
  // Dense crown, dark panels and curved architectural ribs.
  const ceiling=new T.Mesh(new T.SphereGeometry(11.42,44,10,0,Math.PI*2,0,Math.PI/2),
    new T.MeshStandardMaterial({color:0x091b2f,metalness:.32,roughness:.72,transparent:true,opacity:.28,
      side:T.BackSide,emissive:0x061428,emissiveIntensity:.05}));
  ceiling.scale.y=.29;add(ceiling,0,5.65,-1.3);
  circumference(8.1,6.45,bronze,.08);
  circumference(4.45,7.9,glassFrame,.12);
  circumference(4.1,7.93,amberLight,.046);
  for(let i=0;i<18;i++){
    const a=i*2*Math.PI/18;
    const x=10.8*Math.sin(a),z=-1.3-10.8*Math.cos(a);
    const path=new T.CatmullRomCurve3([
      new T.Vector3(x,5.65,z),
      new T.Vector3(x*.79,6.84,-1.3+(z+1.3)*.79),
      new T.Vector3(x*.46,7.82,-1.3+(z+1.3)*.46),
      new T.Vector3(0,8.26,-1.3)]);
    const rib=new T.Mesh(new T.TubeGeometry(path,12,.075,5,false),i%3===0?bronze:glassFrame);
    scene.add(rib);
  }
  // Opaque luminous central oculus simulates bounced indirect blue light.
  const oculus=new T.Mesh(new T.CircleGeometry(3.25,48),
    new T.MeshBasicMaterial({color:0x2762a6,side:T.DoubleSide,transparent:true,opacity:.42}));
  oculus.rotation.x=Math.PI/2;add(oculus,0,8.17,-1.3);
  circumference(3.38,8.17,bronze,.095);
  // The oculus lighting is provided by real scene lights, not fake luminous cones.
  // Central elliptical monument, inspired by the original Arena composition.
  // A low domed volume avoids blocking the essential portal titles.
  const pedestal=new T.Mesh(new T.CylinderGeometry(3.12,3.44,.44,64),obsidian);
  add(pedestal,0,.17,2.0);
  const pedestalBand=new T.Mesh(new T.TorusGeometry(3.25,.095,8,64),bronze);
  pedestalBand.rotation.x=-Math.PI/2;add(pedestalBand,0,.36,2.0);
  const dome=new T.Mesh(new T.SphereGeometry(2.98,48,18,0,Math.PI*2,0,Math.PI/2),
    material(0x143b65,.7,.27,0x0b2245,.15));
  dome.scale.y=.49;add(dome,0,.4,2.0);
  const domeHighlight=new T.Mesh(new T.TorusGeometry(2.57,.038,6,64),
    new T.MeshBasicMaterial({color:0xe7be79,transparent:true,opacity:.5}));
  domeHighlight.rotation.x=-Math.PI/2;add(domeHighlight,0,.53,2.0);
  // Approved ATLAS logo: the same transparent brand artwork used by the
  // responsive entry. Its vertices follow the actual flattened ellipsoid;
  // a flat plane in front of the dome would be an unacceptable fake decal.
  const brandLogoTexture = new T.TextureLoader().load("./atlas-logo-approved-01.png",()=>schedule());
  brandLogoTexture.encoding=T.sRGBEncoding;
  brandLogoTexture.anisotropy=2;
  const logoGeometry=new T.PlaneGeometry(3.10,.675,62,14);
  const logoPositions=logoGeometry.getAttribute("position");
  const radius=2.98, verticalRadius=radius*.49, centreY=.4, centreZ=2.0;
  for(let i=0;i<logoPositions.count;i++){
    const x=logoPositions.getX(i);
    const y=.93+logoPositions.getY(i);
    const radial=1-(x/radius)**2-((y-centreY)/verticalRadius)**2;
    if(radial<=.001)throw Error("ATLAS_LOGO_CURVED_SURFACE_OVERFLOW");
    const z=centreZ+radius*Math.sqrt(radial)+.035;
    logoPositions.setXYZ(i,x,y,z);
  }
  logoGeometry.computeVertexNormals();
  const logoSurface=new T.Mesh(logoGeometry,new T.MeshStandardMaterial({
    map:brandLogoTexture,transparent:true,depthWrite:false,metalness:.15,
    roughness:.41,side:T.FrontSide,polygonOffset:true,polygonOffsetFactor:-1
  }));
  logoSurface.name="ATLAS • marchio approvato aderente al volume ellissoidale";
  scene.add(logoSurface);
  // The rounded silhouette is one architectural object, not multiple glowing
  // rectangles or a flat card. One outline, one panel, one visual identifier.
  const roundedPortalShape=(w,h,r)=>{
    const x=-w/2,y=-h/2,shape=new T.Shape();
    shape.moveTo(x+r,y);
    shape.lineTo(x+w-r,y);
    shape.quadraticCurveTo(x+w,y,x+w,y+r);
    shape.lineTo(x+w,y+h-r);
    shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    shape.lineTo(x+r,y+h);
    shape.quadraticCurveTo(x,y+h,x,y+h-r);
    shape.lineTo(x,y+r);
    shape.quadraticCurveTo(x,y,x+r,y);
    shape.closePath();
    return shape;
  };
  const roundedFaceGeometry=(w,h,r)=>{
    const geometry=new T.ShapeGeometry(roundedPortalShape(w,h,r),8);
    const pos=geometry.getAttribute("position"),uv=geometry.getAttribute("uv");
    for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/w+.5,pos.getY(i)/h+.5);
    uv.needsUpdate=true;return geometry;
  };
  const outlineGeometry=()=>{
    const pts=roundedPortalShape(3.08,4.96,.34).getPoints(64);
    const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p.x,p.y,.10)),true);
    return new T.TubeGeometry(curve,80,.032,5,true);
  };
  const panelShape=roundedFaceGeometry(2.77,4.55,.27);
  const hitPaneShape=roundedFaceGeometry(2.68,4.43,.23);
  const frameShape=new T.ExtrudeGeometry(roundedPortalShape(3.16,5.02,.37),
    {depth:.21,bevelEnabled:false,curveSegments:8});
  const sharedOutline=outlineGeometry();
  for(const p of PORTALS){
    const group=new T.Group();group.position.set(p.x,2.66,p.z);
    group.rotation.y=p.yaw;
    const back=new T.Mesh(frameShape,glassFrame);add(back,0,0,-.19,group);
    const pane=new T.Mesh(panelShape,
      new T.MeshBasicMaterial({map:labelTexture(p),transparent:false,opacity:1,
        side:T.DoubleSide}));
    add(pane,0,0,.040,group);pane.userData.portalId=p.id;
    const trim=new T.Mesh(sharedOutline,bronze);add(trim,0,0,.01,group);
    section(3.30,.16,.6,0,-2.58,-.04,obsidian,0,group);
    scene.add(group);portalPanels.push({pane,portal:p});
  }
}

function buildArtPortalTargets(){
  // The Blender architecture is immutable. Dynamic labels/icons and click
  // targets are applied in Atlas from one authoritative portal contract.
  for(const portal of PORTALS){
    const overlay=new T.Mesh(new T.ShapeGeometry((()=>{const shape=new T.Shape();const w=2.68,h=4.43,r=.23;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return shape;})(),8),
      new T.MeshBasicMaterial({map:labelTexture(portal,true),transparent:true,opacity:1,
        depthWrite:false,side:T.DoubleSide}));
    const overlayUv=overlay.geometry.getAttribute("uv");
    const overlayPos=overlay.geometry.getAttribute("position");
    for(let i=0;i<overlayPos.count;i++)
      overlayUv.setXY(i,overlayPos.getX(i)/2.68+.5,overlayPos.getY(i)/4.43+.5);
    overlayUv.needsUpdate=true;
    overlay.position.set(portal.x,2.72,portal.z+.36);
    overlay.rotation.y=portal.yaw;
    overlay.userData.portalId=portal.id;
    scene.add(overlay);portalPanels.push({pane:overlay,portal});
  }
}
async function loadArtMaster(){
  // The local manifest is always included, even in geometric fallback mode.
  const response=await fetch("./visual-manifest.json",{credentials:"omit",cache:"no-store"});
  if(!response.ok)throw Error("Art manifest not available");
  const manifest=await response.json();
  if(manifest.schema!=="atlas.gateway.foyer-visual/v1"||
     manifest.studentAuthorized!==false||typeof manifest.available!=="boolean")
    throw Error("Invalid art manifest");
  if(!manifest.available)return false;
  if(manifest.file!=="foyer-master.glb"||
     !Number.isInteger(manifest.bytes)||manifest.bytes<1000||manifest.bytes>8000000||
     !/^[a-f0-9]{64}$/.test(manifest.sha256))
    throw Error("Invalid verified Blender model identity");
  if(typeof T.GLTFLoader!=="function"||!crypto?.subtle)throw Error("GLTF verifier unavailable");
  const file=await fetch("./"+manifest.file,{credentials:"omit",cache:"no-store"});
  if(!file.ok||file.url&&new URL(file.url).origin!==location.origin)throw Error("Untrusted asset URL");
  const bytes=await file.arrayBuffer();
  if(bytes.byteLength!==manifest.bytes)throw Error("Blender model size changed");
  const sha=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),
    b=>b.toString(16).padStart(2,"0")).join("");
  if(sha!==manifest.sha256)throw Error("Blender model checksum changed");
  const gltf=await new Promise((resolve,reject)=>{
    new T.GLTFLoader().parse(bytes,"",resolve,reject);
  });
  if(!gltf?.scene)throw Error("Missing Blender scene");
  let meshes=0;gltf.scene.traverse(o=>{if(o.isMesh)meshes++;});
  if(meshes<30||meshes>1000)throw Error("Unexpected Blender scene size");
  scene.add(gltf.scene);
  buildArtPortalTargets();
  return true;
}
function setCamera(){
  const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
  const aspect=w/h,portrait=aspect<.85;
  // A 9:16 phone has substantially less horizontal field of view than the
  // previous 390x550 stage. Preserve all four architectural portals by
  // increasing distance with the actual aspect rather than cropping edges.
  const z=portrait?Math.min(36,Math.max(19.7,19.7*.72/Math.max(aspect,.42))):16.1;
  const viewHeight=portrait?2.65:3.1;
  const target=new T.Vector3(0,viewHeight,-.65);
  const offset=new T.Vector3(0,portrait?2.7:2.3,z);
  offset.applyAxisAngle(new T.Vector3(0,1,0),orbit);
  camera.position.copy(target).add(offset);
  camera.lookAt(new T.Vector3(0,viewHeight+vertical,-.65));
  camera.aspect=aspect;camera.fov=portrait?60:53;camera.updateProjectionMatrix();
}
function render(now){
  request=0;if(stopped)return;
  const active=motionLayer?.tick(now)??false;
  if(motionButton&&!motionButton.hidden)motionButton.dataset.running=String(active);
  setCamera();renderer.render(scene,camera);
  if(active)schedule();
}
function schedule(){if(!request&&!stopped)request=requestAnimationFrame(render);}
function resize(){
  if(stopped)return;
  const w=Math.max(1,Math.round(stage.clientWidth)),h=Math.max(1,Math.round(stage.clientHeight));
  // Bound fill rate; CSS view remains unchanged, including on high-DPR phones.
  const maxPixels=1048576;const ratio=Math.min(devicePixelRatio||1,1.5,Math.sqrt(maxPixels/(w*h)));
  renderer.setPixelRatio(Math.max(.5,ratio));renderer.setSize(w,h,false);schedule();
}
function activatePortal(id){
  const portal=PORTALS.find(p=>p.id===id);if(!portal)return;
  const anchor=links.find(a=>a.dataset.portal===id);
  if(anchor)anchor.click();else location.assign(portal.href);
}
function pick(event){
  if(!camera||!renderer)return;
  const rect=canvas.getBoundingClientRect();
  const x=((event.clientX-rect.left)/rect.width)*2-1,y=-((event.clientY-rect.top)/rect.height)*2+1;
  const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(x,y),camera);
  const hit=ray.intersectObjects(portalPanels.map(o=>o.pane),false)[0];
  if(hit?.object?.userData?.portalId)activatePortal(hit.object.userData.portalId);
}
async function init(){
  if(!T||typeof T.WebGLRenderer!=="function"){fallback("WebGL non disponibile");return;}
  try{
    renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:"low-power"});
    renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.03;
    scene=new T.Scene();scene.background=new T.Color(0x0a192e);
    scene.fog=new T.FogExp2(0x122641,.012);
    camera=new T.PerspectiveCamera(58,1,.05,90);
    scene.add(new T.HemisphereLight(0x90bcf0,0x121b2b,.67));
    const sun=new T.DirectionalLight(0xf7d4aa,.92);sun.position.set(2,11,8);scene.add(sun);
    let artLoaded=false,artError=null;
    try{artLoaded=await loadArtMaster();}
    catch(error){artError=String(error?.message||error);console.warn("ATLAS_ART_FALLBACK",artError);}
    if(!artLoaded)drawFoyer();
    if(motionOptIn&&motionButton){
      motionLayer=createAtmosphereLayer(T,scene,{mobile:mobile(),reduced:motionPreference.matches});
      motionButton.hidden=false;
      const syncMotionPreference=()=>{
        motionLayer.setReduced(motionPreference.matches);
        motionButton.disabled=motionPreference.matches;
        motionButton.dataset.running="false";
        schedule();
      };
      syncMotionPreference();
      motionPreference.addEventListener("change",syncMotionPreference);
      motionButton.addEventListener("click",()=>{
        if(motionButton.dataset.running==="true"){motionLayer.stop();motionButton.dataset.running="false";}
        else if(motionLayer.play(performance.now()))motionButton.dataset.running="true";
        schedule();
      });
      document.addEventListener("visibilitychange",()=>{
        if(document.hidden){motionLayer.stop();motionButton.dataset.running="false";schedule();}
      });
    }
    canvas.style.touchAction="none";
    canvas.addEventListener("pointerdown",e=>{
      pressed={x:e.clientX,y:e.clientY,orbit,vertical,moved:false};
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove",e=>{
      if(!pressed)return;
      const dx=e.clientX-pressed.x,dy=e.clientY-pressed.y;
      if(Math.hypot(dx,dy)>8)pressed.moved=true;
      if(!pressed.moved)return;
      orbit=T.MathUtils.clamp(pressed.orbit-dx*.0025,-.28,.28);
      vertical=T.MathUtils.clamp(pressed.vertical+dy*.0025,-.2,.2);
      schedule();
    });
    canvas.addEventListener("pointerup",e=>{
      if(!pressed)return;
      const moved=pressed.moved;pressed=null;if(!moved)pick(e);else schedule();
    });
    canvas.addEventListener("pointercancel",()=>{pressed=null;schedule();});
    document.getElementById("camera-left").addEventListener("click",()=>{orbit=T.MathUtils.clamp(orbit-.10,-.28,.28);schedule();});
    document.getElementById("camera-right").addEventListener("click",()=>{orbit=T.MathUtils.clamp(orbit+.10,-.28,.28);schedule();});
    document.getElementById("camera-reset").addEventListener("click",()=>{orbit=0;vertical=0;highlight(null);schedule();});
    for(const a of links){
      a.addEventListener("mouseenter",()=>highlight(a.dataset.portal));
      a.addEventListener("focus",()=>highlight(a.dataset.portal));
      a.addEventListener("mouseleave",()=>highlight(null));
    }
    window.addEventListener("resize",resize,{passive:true});
    canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();fallback("Contesto grafico interrotto");});
    window.addEventListener("pagehide",()=>{stopped=true;cancelAnimationFrame(request);motionLayer?.dispose();renderer?.dispose();});
    document.body.classList.add("webgl-ready");
    resize();setStatus(artLoaded?"Atrio tridimensionale pronto · modello Blender verificato":
      artError?"Atrio tridimensionale pronto · versione geometrica di ripiego":"Atrio tridimensionale pronto · scegli una destinazione");
    console.info("ATLAS_FOYER_READY",FOYER_SCHEMA);
  }catch(error){
    console.error("ATLAS_FOYER_ERROR",error);
    fallback("L'atrio tridimensionale non si è avviato");
  }
}
void init();
