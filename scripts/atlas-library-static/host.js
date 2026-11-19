"use strict";
const $=id=>document.getElementById(id);
const scene=$("scene"),status=$("status"),toggle=$("toggle");
const routes=Object.freeze({curricolo:"/curricolo/",esperienze:"/esperienze/"});
const ids=["shell","scenography","cupola","portals","bays","stars","sky","ambient"];
let frame=null,channel=null,active=false,ready=false,closing=false,controller=null,timeout=0;
const setStatus=text=>status.textContent=text;
const hex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
async function hash(bytes){return hex(await crypto.subtle.digest("SHA-256",bytes));}
async function readFile(url){
  const response=await fetch(url,{credentials:"omit",redirect:"error",cache:"no-store"});
  if(!response.ok||response.type==="opaque"||!response.body)throw Error("Risorsa locale non disponibile");
  return new Uint8Array(await response.arrayBuffer());
}
async function readJson(url){return JSON.parse(new TextDecoder().decode(await readFile(url)));}
function stop(){
  if(closing)return;closing=true;ready=false;active=false;
  window.clearTimeout(timeout);controller?.abort();controller=null;
  if(frame)frame.remove();frame=null;channel=null;
}
function fallback(message){
  stop();document.body.classList.add("simplified");toggle.textContent="Attiva la sala 3D";toggle.setAttribute("aria-pressed","true");
  setStatus(message);
}
function navigate(id){
  if(id==="studio"){setStatus("Studio Atlas: l'accesso professionale non è ancora abilitato.");return;}
  const url=routes[id];if(!url)return;
  stop();setStatus("Apertura di "+(id==="curricolo"?"Curricolo":"Esperienze")+"…");
  window.setTimeout(()=>window.location.assign(url),0);
}
for(const el of document.querySelectorAll("[data-portal]")){
  el.addEventListener("click",event=>{
    const id=el.getAttribute("data-portal");
    if(id==="studio"){event.preventDefault();navigate(id);return;}
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();navigate(id);
  });
}
document.querySelector(".home").addEventListener("click",()=>stop());
document.querySelector(".brand").addEventListener("click",()=>stop());
toggle.addEventListener("click",()=>{
  if(!closing&&active){fallback("Vista semplificata attivata. Puoi scegliere uno degli accessi.");return;}
  if(closing){closing=false;document.body.classList.remove("simplified");toggle.textContent="Vista semplificata";toggle.setAttribute("aria-pressed","false");void start();}
});
async function start(){
  closing=false;ready=false;active=false;
  controller=new AbortController();
  const current=controller;
  try{
    setStatus("Caricamento della biblioteca tridimensionale…");
    const [manifest,receipt,sceneBytes]=await Promise.all([
      readJson("./native-manifest.json"),readJson("./native-build-receipt.json"),readFile("./scene.html")
    ]);
    if(closing||current!==controller)return;
    if(manifest.schema!=="atlas.gateway.native-assets/v1"||manifest.studentAuthorized!==false||
       receipt.profile!=="M2-micro-integrated"||receipt.materialDetailApplied!==true||
       manifest.assets?.length!==ids.length||manifest.assets.reduce((sum,a)=>sum+a.bytes,0)>40000000)throw Error("Identità del pacchetto non valida");
    const manifestBytes=await readFile("./native-manifest.json");
    if(await hash(manifestBytes)!==receipt.manifestSha256||await hash(sceneBytes)!==receipt.sceneSha256)throw Error("Impronte della scena non valide");
    const map=new Map();
    manifest.assets.forEach((a,i)=>{
      if(a.id!==ids[i]||!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>40000000||!/^[a-f0-9]{64}$/.test(a.sha256)||
         a.file!==a.id+"-"+a.sha256+"."+({sky:"png",ambient:"hdr"}[a.id]||"glb"))throw Error("Risorsa non autorizzata");
      map.set(a.id,a);
    });
    if(closing||current!==controller)return;
    const html=new TextDecoder().decode(sceneBytes);
    if(html.split("__ATLAS_PARENT_ORIGIN_JSON__").length!==2||html.split("__ATLAS_CHANNEL_JSON__").length!==2)throw Error("Scena non compatibile");
    channel=hex(crypto.getRandomValues(new Uint8Array(24)));
    const seen=new Set();
    const source=html.replace("__ATLAS_PARENT_ORIGIN_JSON__",JSON.stringify(location.origin))
                     .replace("__ATLAS_CHANNEL_JSON__",JSON.stringify(channel));
    function handle(event){
      if(closing||event.source!==frame?.contentWindow||event.origin!=="null"||!event.data||event.data.channel!==channel)return;
      const data=event.data;
      if(data.type==="atlas-native-asset-request"){
        const asset=map.get(data.id);
        if(!asset||seen.has(data.id))return;
        seen.add(data.id);
        const target=frame.contentWindow;
        void (async()=>{
          const bytes=await readFile("/atlas-gateway-native/"+asset.file);
          if(bytes.byteLength!==asset.bytes||await hash(bytes)!==asset.sha256)throw Error("Risorsa non integra: "+data.id);
          if(closing||controller!==current||frame?.contentWindow!==target)return;
          const transferred=bytes.buffer;
          target.postMessage({type:"atlas-native-asset",channel,id:asset.id,bytes:transferred},"*",[transferred]);
        })().catch(()=>fallback("Una risorsa grafica non è disponibile. Gli accessi restano utilizzabili."));
        return;
      }
      if(data.type==="atlas-3d-ready"){
        ready=true;window.clearTimeout(timeout);
        setStatus("Biblioteca pronta. Esplora la sala oppure scegli un ambiente.");
      }else if(data.type==="atlas-3d-error"){
        fallback("Il motore grafico non è disponibile. Usa gli accessi della biblioteca.");
      }else if(data.type==="atlas-open"&&ready&&typeof data.id==="string"&&["curricolo","esperienze","studio"].includes(data.id)){
        navigate(data.id);
      }
    }
    window.addEventListener("message",handle,{signal:current.signal});
    frame=document.createElement("iframe");
    frame.title="Biblioteca Atlas tridimensionale";
    frame.setAttribute("sandbox","allow-scripts");
    frame.referrerPolicy="no-referrer";
    frame.srcdoc=source;
    scene.replaceChildren(frame);active=true;
    timeout=window.setTimeout(()=>fallback("L'avvio 3D non è riuscito. Gli accessi restano utilizzabili."),90000);
  }catch(e){
    if(!closing)fallback("Anteprima 3D non disponibile. Gli accessi restano utilizzabili.");
    console.error("ATLAS_LIBRARY_WEB_START",e?.message??String(e));
  }
}
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||
   window.innerWidth<320||window.innerHeight<300){
  fallback("Vista semplificata disponibile. Se preferisci, puoi attivare la sala 3D.");
}else void start();
