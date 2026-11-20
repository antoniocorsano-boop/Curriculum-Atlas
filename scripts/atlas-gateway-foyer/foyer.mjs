// ATLAS-GATEWAY-01 / G1.1 — atrio tridimensionale reale; nessuna libreria 3D aggiunta.
import {PORTALS,FOYER_SCHEMA,verifyPortalContract} from "./portal-contract.mjs";

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
let stopped=false,selected=null;
function highlight(id){
  selected=id;
  for(const {pane,portal} of portalPanels){
    const active=portal.id===id;
    pane.material.emissiveIntensity=active?.58:.23;
    pane.material.opacity=active?.96:.86;
  }
  for(const link of links)link.dataset.active=String(link.dataset.portal===id);
  schedule();
}
function fallback(message){
  stopped=true;
  document.body.classList.add("no-webgl");
  setStatus(message+" · Puoi usare direttamente gli accessi qui sotto.");
  if(renderer){try{renderer.dispose();renderer.forceContextLoss();}catch{}}
}
function labelTexture(portal){
  const c=document.createElement("canvas");c.width=512;c.height=768;
  const ctx=c.getContext("2d");if(!ctx)throw Error("Canvas2D assente");
  const grad=ctx.createLinearGradient(0,0,512,768);
  grad.addColorStop(0,"#1d87cd");grad.addColorStop(.45,"#124d8a");grad.addColorStop(1,"#081f48");
  ctx.fillStyle=grad;ctx.fillRect(0,0,512,768);
  const light=ctx.createRadialGradient(280,140,30,270,300,410);
  light.addColorStop(0,"#80d8ff88");light.addColorStop(1,"#03336a00");
  ctx.fillStyle=light;ctx.fillRect(0,0,512,768);
  ctx.strokeStyle="#c1dbf5aa";ctx.lineWidth=5;ctx.strokeRect(22,22,468,724);
  ctx.beginPath();ctx.arc(256,290,84,0,Math.PI*2);ctx.strokeStyle="#e3bb7d";ctx.lineWidth=8;ctx.stroke();
  ctx.fillStyle="#f3ddb5";ctx.font="bold 106px Georgia,serif";ctx.textAlign="center";
  ctx.fillText(portal.label.slice(0,1).toUpperCase(),256,324);
  ctx.font="bold 45px system-ui,sans-serif";ctx.fillStyle="#fff5d8";
  ctx.fillText(portal.label.toUpperCase(),256,500);
  ctx.fillStyle="#b8d8eb";ctx.font="28px system-ui,sans-serif";
  const words=portal.detail.split(" ");let lines=[""];
  for(const word of words){const row=lines.length-1;if(ctx.measureText(lines[row]+" "+word).width>390&&lines[row])lines.push(word);else lines[row]+=(lines[row]?" ":"")+word;}
  lines.slice(0,2).forEach((line,i)=>ctx.fillText(line,256,561+i*39));
  const texture=new T.CanvasTexture(c);texture.encoding=T.sRGBEncoding;
  texture.anisotropy=2;texture.needsUpdate=true;return texture;
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
  const floor=new T.Mesh(new T.CylinderGeometry(12.4,12.4,.28,72),
    new T.MeshStandardMaterial({color:0x163149,metalness:.76,roughness:.28}));
  floor.position.set(0,-.27,-1.3);scene.add(floor);
  for(const radius of [3.15,5.7,8.5,11.7]){
    const ring=new T.Mesh(new T.TorusGeometry(radius,.045,6,92),
      new T.MeshStandardMaterial({color:0xb59a64,emissive:0x483414,emissiveIntensity:.22,metalness:.8,roughness:.31}));
    ring.rotation.x=-Math.PI/2;ring.position.set(0,-.10,-1.3);scene.add(ring);
  }
  // Architettura circolare, cupola e costoloni: vera profondità geometrica.
  for(let i=0;i<=16;i++){
    const angle=-Math.PI*.62+i*(Math.PI*1.24/16);
    const x=11.65*Math.sin(angle),z=-1.3-11.65*Math.cos(angle);
    const col=box(.19,5.9,.23,i%4===0?0xc7a66e:0x315475,.65,.32);
    col.position.set(x,2.85,z);col.rotation.y=-angle;scene.add(col);
    const path=new T.CatmullRomCurve3([
      new T.Vector3(x,5.7,z),new T.Vector3(x*.80,7.35,z*.80-.15),
      new T.Vector3(x*.47,8.25,z*.58-.3),new T.Vector3(0,8.7,-1.3)]);
    const rib=new T.Mesh(new T.TubeGeometry(path,14,.055,5,false),
      new T.MeshStandardMaterial({color:0x9baebd,metalness:.64,roughness:.31,emissive:0x113966,emissiveIntensity:.3}));
    scene.add(rib);
  }
  torus(7.0,.09,0x558ac3,7.15,-1.3);
  torus(3.7,.105,0xbe9955,8.17,-1.3);
  const dome=new T.Mesh(new T.SphereGeometry(3.7,28,10,0,Math.PI*2,0,Math.PI/2),
    new T.MeshStandardMaterial({color:0x19558b,metalness:.65,roughness:.24,side:T.BackSide,transparent:true,opacity:.5,emissive:0x1e5ea3,emissiveIntensity:.15}));
  dome.position.set(0,8.17,-1.3);scene.add(dome);
  const dais=new T.Mesh(new T.CylinderGeometry(2.8,3.45,.58,56),
    new T.MeshStandardMaterial({color:0x194767,metalness:.74,roughness:.28}));
  dais.position.set(0,.23,1.35);scene.add(dais);
  const cap=new T.Mesh(new T.CylinderGeometry(2.82,2.82,.12,56),
    new T.MeshStandardMaterial({color:0x102e4c,metalness:.62,roughness:.3}));
  cap.position.set(0,.58,1.35);scene.add(cap);
  const band=new T.Mesh(new T.TorusGeometry(2.84,.085,8,56),
    new T.MeshStandardMaterial({color:0xe9be74,emissive:0xc58a2e,emissiveIntensity:.4,metalness:.68}));
  band.rotation.x=-Math.PI/2;band.position.set(0,.56,1.35);scene.add(band);
  const logo=labelTexture({label:"ATLAS",detail:"Mondi della conoscenza"});
  const logoMesh=new T.Mesh(new T.PlaneGeometry(2.05,2.3),new T.MeshBasicMaterial({map:logo,transparent:true,opacity:.94,side:T.DoubleSide}));
  logoMesh.position.set(0,2.2,1.3);scene.add(logoMesh);
  // 4 portali in posizione fisica; il testo HTML offre sempre l'equivalente accessibile.
  for(const p of PORTALS){
    const g=new T.Group();g.position.set(p.x,2.55,p.z);g.rotation.y=p.yaw;
    const pane=new T.Mesh(new T.PlaneGeometry(2.6,4.35),
      new T.MeshStandardMaterial({map:labelTexture(p),transparent:true,opacity:.86,metalness:.28,roughness:.32,
        emissive:0x2369ad,emissiveIntensity:.23,side:T.DoubleSide}));
    pane.userData.portalId=p.id;g.add(pane);
    for(const side of [-1,1]){
      const rail=box(.085,4.65,.16,0xe7ba73,.76,.25);rail.position.set(side*1.34,0,0);g.add(rail);
    }
    for(const side of [-1,1]){
      const rail=box(2.72,.09,.16,0xd6ae75,.76,.25);rail.position.set(0,side*2.32,0);g.add(rail);
    }
    scene.add(g);portalPanels.push({pane,portal:p});
  }
  const starsGeo=new T.BufferGeometry();const vertices=[];
  for(let i=0;i<85;i++){
    const a=i*2.39996,rad=4.5+((i*29)%70)/10;
    vertices.push(Math.sin(a)*rad,5.1+(i%10)*.26,-5.1-Math.cos(a)*rad*.35);
  }
  starsGeo.setAttribute("position",new T.Float32BufferAttribute(vertices,3));
  scene.add(new T.Points(starsGeo,new T.PointsMaterial({color:0x8bcfff,size:.07,sizeAttenuation:true})));
}
function setCamera(){
  const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);
  const portrait=w/h<.85, z=portrait?19.3:15.1;
  const target=new T.Vector3(0,3.0,-.25);
  const offset=new T.Vector3(0,portrait?3.5:2.6,z);
  offset.applyAxisAngle(new T.Vector3(0,1,0),orbit);
  camera.position.copy(target).add(offset);camera.lookAt(new T.Vector3(0,3.0+vertical,-.25));
  camera.aspect=w/h;camera.fov=portrait?64:58;camera.updateProjectionMatrix();
}
function render(){
  request=0;if(stopped)return;
  setCamera();renderer.render(scene,camera);
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
function init(){
  if(!T||typeof T.WebGLRenderer!=="function"){fallback("WebGL non disponibile");return;}
  try{
    renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:false,powerPreference:"low-power"});
    renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    scene=new T.Scene();scene.background=new T.Color(0x0a192e);
    scene.fog=new T.FogExp2(0x122641,.012);
    camera=new T.PerspectiveCamera(58,1,.05,90);
    scene.add(new T.HemisphereLight(0xbfdfff,0x18243a,.9));
    const sun=new T.DirectionalLight(0xf7deb8,1.3);sun.position.set(2,11,8);scene.add(sun);
    const blue=new T.PointLight(0x48aaff,1.4,25);blue.position.set(0,7,-1);scene.add(blue);
    const warm=new T.PointLight(0xfbc386,.7,18);warm.position.set(0,4,6);scene.add(warm);
    drawFoyer();
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
    window.addEventListener("pagehide",()=>{stopped=true;cancelAnimationFrame(request);renderer?.dispose();});
    resize();setStatus("Atrio tridimensionale pronto · scegli una destinazione");
    console.info("ATLAS_FOYER_READY",FOYER_SCHEMA);
  }catch(error){
    console.error("ATLAS_FOYER_ERROR",error);
    fallback("L'atrio tridimensionale non si è avviato");
  }
}
init();
