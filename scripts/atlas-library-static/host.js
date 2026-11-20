"use strict";
const $=id=>document.getElementById(id);
const scene=$("scene"),status=$("status"),toggle=$("toggle");
const routes=Object.freeze({curricolo:"/curricolo/",esperienze:"/esperienze/"});
const ids=["shell","scenography","cupola","portals","bays","stars","sky","ambient"];
let frame=null,channel=null,active=false,ready=false,closing=false,controller=null,timeout=0;
const setStatus=text=>status.textContent=text;
const hex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
async function hash(bytes){return hex(await crypto.subtle.digest("SHA-256",bytes));}
// A cellular browser can fail a transfer even when the page and files
// are healthy. Retry transient reads without relaxing SHA-256 verification.
async function readFile(url,signal){
  const immutable=url.startsWith("/atlas-gateway-native/");
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{signal,credentials:"omit",redirect:"follow",cache:immutable?"force-cache":"default"});
      const finalUrl=new URL(response.url,location.href);
      if(finalUrl.origin!==location.origin)throw Error("ORIGINE_NON_AUTORIZZATA");
      if(!response.ok||response.type==="opaque"||!response.body)throw Error("HTTP_"+response.status);
      return new Uint8Array(await response.arrayBuffer());
    }catch(error){
      if(signal?.aborted||String(error?.message).includes("ORIGINE_NON_AUTORIZZATA"))throw error;
      if(attempt===2)throw error;
      await new Promise(resolve=>setTimeout(resolve,450*(attempt+1)));
    }
  }
  throw Error("RETE");
}
function parseJson(bytes,label){
  try{return JSON.parse(new TextDecoder().decode(bytes));}
  catch{throw Error("DATI_NON_VALIDI_"+label);}
}

// Keep the original scene and all its signed resources unmodified.
// Only on narrow screens, wrap the existing controls in an accessible
// collapsible panel. SHA-256 is checked on the source before this adaptation.
function phoneControls(original){
  const nav='<nav id="native-controls" aria-label="Controlli della visuale" hidden>';
  if(original.split(nav).length!==2||original.split("</nav><script>").length!==2||
     original.split("</head>").length!==2)throw Error("Struttura dei controlli cambiata");
  return original.replace("</head>","<style>\n#atlas-controls-panel{position:fixed;z-index:5;bottom:8px;left:8px;right:8px;pointer-events:none}\n#atlas-controls-panel summary{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;background:#122b3de8;border:1px solid #dbbb7d;color:#fff;border-radius:10px;box-shadow:0 3px 16px #06101870;font:600 13px system-ui;list-style:none;cursor:pointer;pointer-events:auto}\n#atlas-controls-panel summary::-webkit-details-marker{display:none}\n#atlas-controls-panel[open] summary{background:#294456}\n#atlas-controls-panel #native-controls{position:static;left:auto;right:auto;bottom:auto;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;max-width:100%;margin-top:6px;padding:7px;background:#102a3de8;border:1px solid #b9a27488;border-radius:10px;pointer-events:auto}\n#atlas-controls-panel:not([open]) #native-controls,#atlas-controls-panel #native-controls[hidden]{display:none}\n#atlas-controls-panel #native-controls button{min-width:44px;min-height:44px;flex:1 1 auto;white-space:nowrap}\n</style>"+"</head>")
    .replace(nav,'<details id="atlas-controls-panel"><summary>Comandi 3D</summary>'+nav)
    .replace("</nav><script>","</nav></details><script>");
}
function stop(){
  if(closing)return;closing=true;ready=false;active=false;
  window.clearTimeout(timeout);controller?.abort();controller=null;
  if(frame)frame.remove();frame=null;channel=null;
}
function fallback(message,retry=false){
  stop();document.body.classList.add("simplified");toggle.textContent=retry?"Riprova 3D":"Attiva la sala 3D";toggle.setAttribute("aria-pressed","true");
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
    // Read each versioned document exactly once. A second request could
    // cross a Cloudflare preview rollout and yield a mismatched checksum.
    const [manifestBytes,receiptBytes]=await Promise.all([
      readFile("./native-manifest.json",current.signal),readFile("./native-build-receipt.json",current.signal)
    ]);
    if(closing||current!==controller)return;
    const manifest=parseJson(manifestBytes,"manifest"),receipt=parseJson(receiptBytes,"receipt");
    if(manifest.schema!=="atlas.gateway.native-assets/v1"||manifest.studentAuthorized!==false||
       receipt.profile!=="M2-micro-integrated"||receipt.materialDetailApplied!==true||
       manifest.assets?.length!==ids.length||manifest.assets.reduce((sum,a)=>sum+a.bytes,0)>40000000)throw Error("Identità del pacchetto non valida");
    if(await hash(manifestBytes)!==receipt.manifestSha256)throw Error("INTEGRITA_MANIFEST");
    const sceneBytes=await readFile("./scene.html",current.signal);
    if(closing||current!==controller)return;
    if(await hash(sceneBytes)!==receipt.sceneSha256)throw Error("INTEGRITA_SCENA");
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
    let source=html.replace("__ATLAS_PARENT_ORIGIN_JSON__",JSON.stringify(location.origin))
                   .replace("__ATLAS_CHANNEL_JSON__",JSON.stringify(channel));
    if(window.innerWidth<=650)source=phoneControls(source);
    function handle(event){
      if(closing||event.source!==frame?.contentWindow||event.origin!=="null"||!event.data||event.data.channel!==channel)return;
      const data=event.data;
      if(data.type==="atlas-native-asset-request"){
        const asset=map.get(data.id);
        if(!asset||seen.has(data.id))return;
        seen.add(data.id);
        const target=frame.contentWindow;
        void (async()=>{
          const bytes=await readFile("/atlas-gateway-native/"+asset.file,current.signal);
          if(bytes.byteLength!==asset.bytes||await hash(bytes)!==asset.sha256)throw Error("Risorsa non integra: "+data.id);
          if(closing||controller!==current||frame?.contentWindow!==target)return;
          const transferred=bytes.buffer;
          target.postMessage({type:"atlas-native-asset",channel,id:asset.id,bytes:transferred},"*",[transferred]);
        })().catch(()=>fallback("Una risorsa grafica non è stata caricata. Tocca «Riprova 3D».",true));
        return;
      }
      if(data.type==="atlas-3d-ready"){
        ready=true;window.clearTimeout(timeout);
        setStatus("Biblioteca pronta · scegli un accesso o esplora.");
      }else if(data.type==="atlas-3d-error"){
        fallback("Il motore 3D non si è avviato. Tocca «Riprova 3D».",true);
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
    timeout=window.setTimeout(()=>fallback("L'avvio 3D non è riuscito. Tocca «Riprova 3D».",true),90000);
  }catch(e){
    if(!closing){
      const code=String(e?.message||"ERRORE");
      const reason=code.startsWith("INTEGRITA")?"integrità dei file":
        code.startsWith("DATI_NON_VALIDI")?"dati della scena":
        code.startsWith("HTTP_")||e?.name==="TypeError"?"connessione":
        "caricamento";
      fallback("Sala 3D non avviata ("+reason+"). Tocca «Riprova 3D».",true);
    }
    console.error("ATLAS_LIBRARY_WEB_START",e?.message??String(e));
  }
}
if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||
   window.innerWidth<320||window.innerHeight<300){
  fallback("Vista semplificata disponibile. Se preferisci, puoi attivare la sala 3D.");
}else void start();
