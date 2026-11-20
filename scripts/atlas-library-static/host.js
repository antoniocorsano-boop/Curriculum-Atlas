"use strict";
const $=id=>document.getElementById(id);
const scene=$("scene"),status=$("status"),toggle=$("toggle"),viewer=$("viewer"),expand=$("expand");
const routes=Object.freeze({curricolo:"/curricolo/",esperienze:"/esperienze/"});
const ids=["shell","scenography","cupola","portals","bays","stars","sky","ambient"];
const assetLabels={shell:"struttura",scenography:"allestimenti",cupola:"cupola",portals:"portali",bays:"scaffalature",stars:"luci",sky:"cielo",ambient:"illuminazione"};
const megabytes=n=>(n/1000000).toLocaleString("it-IT",{maximumFractionDigits:1});
function adaptMobileScene(original){
  // The original scene is SHA-256 verified before these display-only edits.
  const wait='},45000);',stage='nativePhase="decode:"+id;',
    sequence='for(const id of ["shell","scenography","cupola","portals","bays","stars"]){await loadModel(id);assertActive();}',
    raster='const scale=Math.min(1,Math.sqrt(NATIVE_MAX_RASTER_PIXELS/(w*h)));',
    resizeGuard='if(rasterWidth===w&&rasterHeight===h)return;',
    pointerDown='down={x:e.clientX,y:e.clientY,angle,tilt};canvas.setPointerCapture(e.pointerId)',
    pointerUp=' down=null;\n if(tap){',
    pointerCancel='canvas.addEventListener("pointercancel",()=>{down=null;scheduleFrame()},events);',
    microMode='nativeMaterialBridge.apply("micro");',
    dragOriginal="canvas.addEventListener(\"pointermove\",e=>{\n if(!down||!ready)return;\n if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<8)return;\n angle=THREE.MathUtils.clamp(down.angle+(down.x-e.clientX)*.002,-.30,.30);\n tilt=THREE.MathUtils.clamp(down.tilt+(e.clientY-down.y)*.008,-1.3,1.3);setCamera();render();\n},events);",
    dragOptimized="let pendingDragFrame=0,lastDragPaint=0;\nfunction drawDrag(t){\n  pendingDragFrame=0;\n  if(!down||!ready||closing||document.hidden)return;\n  // Coalesce touch events: <=30 frames/s and never queue behind a GPU fence.\n  if(t-lastDragPaint<32||!animationSlot()){\n    pendingDragFrame=requestAnimationFrame(drawDrag);return;\n  }\n  lastDragPaint=t;setCamera();render(t);\n}\nfunction scheduleDragDraw(){if(!pendingDragFrame)pendingDragFrame=requestAnimationFrame(drawDrag)}\ncanvas.addEventListener(\"pointermove\",e=>{\n if(!down||!ready)return;\n if(Math.hypot(e.clientX-down.x,e.clientY-down.y)<8)return;\n angle=THREE.MathUtils.clamp(down.angle+(down.x-e.clientX)*.002,-.30,.30);\n tilt=THREE.MathUtils.clamp(down.tilt+(e.clientY-down.y)*.008,-1.3,1.3);scheduleDragDraw();\n},events);";
  for(const [name,anchor] of Object.entries({raster,resizeGuard,pointerDown,pointerUp,pointerCancel,microMode,dragOriginal})){
    if(original.split(anchor).length!==2)throw Error("SCENA_MOBILE_"+name+"_INCOMPATIBILE");
  }
  if(original.split(wait).length!==2||original.split(stage).length!==2||original.split(sequence).length!==2)
    throw Error("STRUTTURA_SCENA_INCOMPATIBILE");
  // Keep visible high-DPI detail at rest; reduce fragment shader workload
  // during a real drag, then restore clarity on release. Zero added assets.
  // Original photographic maps always remain active.
  return original.replace(resizeGuard,
      'const desiredScale=Math.min(down?0.72:1.20,devicePixelRatio||1,Math.sqrt(NATIVE_MAX_RASTER_PIXELS/(w*h)));'+
      'if(rasterWidth===w&&rasterHeight===h&&Math.abs(renderBudget.scale-desiredScale)<0.008)return;')
    .replace(raster,'const scale=desiredScale;')
    .replace(pointerDown,'down={x:e.clientX,y:e.clientY,angle,tilt};resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));canvas.setPointerCapture(e.pointerId)')
    .replace(pointerUp,' if(pendingDragFrame){cancelAnimationFrame(pendingDragFrame);pendingDragFrame=0;} down=null;resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));setCamera();render();\\n if(tap){'.replace('\\n','\n'))
    .replace(pointerCancel,'canvas.addEventListener("pointercancel",()=>{if(pendingDragFrame){cancelAnimationFrame(pendingDragFrame);pendingDragFrame=0;}down=null;resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));setCamera();render();scheduleFrame()},events);')
    .replace(microMode,'nativeMaterialBridge.apply(innerWidth<=650?"scalar":"micro");')
    .replace(dragOriginal,dragOptimized)
    .replace(wait,'},120000);')
    .replace(stage,stage+'send("atlas-3d-phase",{step:"decode",id});')
    // The early 3D preview sets display:grid inline. Hidden alone does not
    // override it: reset only the display declaration on final readiness.
    .replace('status.hidden=true;document.querySelector("#native-controls").hidden=false;',
             'status.style.removeProperty("display");status.hidden=true;document.querySelector("#native-controls").hidden=false;')
    .replace(sequence,`for(const id of ["shell","scenography","cupola","portals","bays","stars"]){
      await loadModel(id);assertActive();
      if(id==="shell"&&innerWidth<=650){
        try{
          const v=NATIVE_CAMERAS.find(item=>item.id==="vertical");
          camera.position.set(...v.position);camera.lookAt(new THREE.Vector3(...v.target));
          camera.aspect=Math.max(1,innerWidth)/Math.max(1,innerHeight);
          camera.fov=65;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);
          resizeRaster(Math.max(1,innerWidth),Math.max(1,innerHeight));
          renderer.render(scene,camera);
          status.style.cssText="position:fixed;inset:auto 0 0 0;min-height:48px;padding:12px;background:#122536dd;display:grid;place-items:center;font:13px system-ui;pointer-events:none";
          send("atlas-3d-phase",{step:"preview",id});
        }catch(error){console.warn("ATLAS_MOBILE_EARLY_RENDER",error?.message??String(error));}
      }
    }`);
}

let frame=null,channel=null,active=false,ready=false,closing=false,controller=null,timeout=0;
const setStatus=text=>status.textContent=text;
const hex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,"0")).join("");
async function hash(bytes){return hex(await crypto.subtle.digest("SHA-256",bytes));}
// A cellular browser can fail a transfer even when the page and files
// are healthy. Retry transient reads without relaxing SHA-256 verification.
async function readFile(url,signal,onProgress,expectedBytes,compressed=false){
  const immutable=url.startsWith("/atlas-gateway-native/");
  for(let attempt=0;attempt<3;attempt++){
    try{
      const response=await fetch(url,{signal,credentials:"omit",redirect:"follow",cache:immutable?"force-cache":"default"});
      const finalUrl=new URL(response.url,location.href);
      if(finalUrl.origin!==location.origin)throw Error("ORIGINE_NON_AUTORIZZATA");
      if(!response.ok||response.type==="opaque"||!response.body)throw Error("HTTP_"+response.status);
      if(!onProgress)return new Uint8Array(await response.arrayBuffer());
      if(!Number.isSafeInteger(expectedBytes)||expectedBytes<1||expectedBytes>40000000)throw Error("DIMENSIONE_NON_VALIDA");
      const decoded=compressed&&response.headers.get("content-encoding")!=="gzip"
        ?response.body.pipeThrough(new DecompressionStream("gzip"))
        :response.body;
      const data=new Uint8Array(expectedBytes),reader=decoded.getReader();
      let length=0;
      try{
        for(;;){
          const part=await reader.read();
          if(part.done)break;
          if(length+part.value.length>expectedBytes)throw Error("DIMENSIONE_ECCESSIVA");
          data.set(part.value,length);length+=part.value.length;
          onProgress(length,expectedBytes);
        }
      }finally{reader.releaseLock();}
      if(length!==expectedBytes)throw Error("DIMENSIONE_INCOMPLETA");
      onProgress(length,expectedBytes);
      return data;
    }catch(error){
      if(signal?.aborted||String(error?.message).includes("ORIGINE_NON_AUTORIZZATA"))throw error;
      if(attempt===2)throw error;
      onProgress?.(0,expectedBytes);
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
  return original.replace("</head>","<style>\n#atlas-controls-panel{position:fixed;z-index:5;bottom:8px;left:8px;right:8px;pointer-events:none}\n#atlas-controls-panel summary{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 14px;background:#122b3de8;border:1px solid #dbbb7d;color:#fff;border-radius:10px;box-shadow:0 3px 16px #06101870;font:600 13px system-ui;list-style:none;cursor:pointer;pointer-events:auto}\n#atlas-controls-panel summary::-webkit-details-marker{display:none}\n#atlas-controls-panel[open] summary{background:#294456}\n#atlas-controls-panel #native-controls{position:static;left:auto;right:auto;bottom:auto;display:flex;flex-wrap:wrap;justify-content:center;gap:5px;max-width:100%;margin-top:6px;padding:7px;background:#102a3de8;border:1px solid #b9a27488;border-radius:10px;pointer-events:auto}\n#atlas-controls-panel:not([open]) #native-controls,#atlas-controls-panel #native-controls[hidden]{display:none}\n#atlas-controls-panel[open] #native-controls{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;max-height:min(34vh,140px)}\n#atlas-controls-panel #native-controls button{min-width:0;min-height:44px;padding:4px 3px;white-space:normal;font:clamp(10px,2.8vw,12px) system-ui}\n</style>"+"</head>")
    .replace(nav,'<details id="atlas-controls-panel"><summary>Comandi 3D</summary>'+nav)
    .replace("</nav><script>","</nav></details><script>");
}
function setExpanded(value){
  const on=Boolean(value);
  viewer.classList.toggle("expanded",on);
  document.body.classList.toggle("viewer-expanded",on);
  expand.textContent=on?"Riduci":"Espandi";
  expand.setAttribute("aria-pressed",String(on));
  expand.setAttribute("aria-label",on?"Riduci la biblioteca tridimensionale":"Espandi la biblioteca tridimensionale");
}
expand.addEventListener("click",()=>setExpanded(!viewer.classList.contains("expanded")));
window.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&viewer.classList.contains("expanded")){setExpanded(false);expand.focus();}
});
function stop(){
  if(closing)return;setExpanded(false);closing=true;ready=false;active=false;
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
    // Original asset SHA-256 is authoritative. Gzip only reduces transport;
    // if an older mobile browser cannot decode it, use the original files.
    const gzipById=new Map();
    if(typeof DecompressionStream==="function"){
      try{
        const transport=parseJson(await readFile("./asset-transport.json",current.signal),"transport");
        if(transport.schema!=="atlas.library.gzip/v1"||
           transport.sourceManifestSha256!==receipt.manifestSha256||
           transport.assets?.length!==ids.length-1)throw Error("GZIP_MANIFEST");
        const unique=new Set();
        for(const item of transport.assets){
          const original=map.get(item.id);
          if(!original||item.id==="sky"||unique.has(item.id)||
             item.file!==original.file+".gz"||item.originalBytes!==original.bytes||
             !Number.isSafeInteger(item.bytes)||item.bytes<=0||item.bytes>=original.bytes||
             !/^[0-9a-f]{64}$/.test(item.sha256))throw Error("GZIP_IDENTITY");
          unique.add(item.id);gzipById.set(item.id,item);
        }
      }catch(error){
        gzipById.clear();console.warn("ATLAS_GZIP_FALLBACK",error?.message??String(error));
      }
    }
    if(closing||current!==controller)return;
    const html=new TextDecoder().decode(sceneBytes);
    if(html.split("__ATLAS_PARENT_ORIGIN_JSON__").length!==2||html.split("__ATLAS_CHANNEL_JSON__").length!==2)throw Error("Scena non compatibile");
    channel=hex(crypto.getRandomValues(new Uint8Array(24)));
    const seen=new Set(),bytesReceived=new Map();
    const allBytes=manifest.assets.reduce((sum,a)=>sum+a.bytes,0);
    let lastPaint=0;
    let source=html.replace("__ATLAS_PARENT_ORIGIN_JSON__",JSON.stringify(location.origin))
                   .replace("__ATLAS_CHANNEL_JSON__",JSON.stringify(channel));
    if(window.innerWidth<=650)source=adaptMobileScene(phoneControls(source));
    if(typeof window.atlasLightingBridge!=="function")throw Error("MODULO_LUCI_MANCANTE");
    source=window.atlasLightingBridge(source);
    if(window.atlasDiagnostics)source=window.atlasDiagnostics.inject(source);
    function handle(event){
      if(closing||event.source!==frame?.contentWindow||event.origin!=="null"||!event.data||event.data.channel!==channel)return;
      const data=event.data;
      window.atlasDiagnostics?.handleMessage(data);
      if(data.type==="atlas-native-asset-request"){
        const asset=map.get(data.id);
        if(!asset||seen.has(data.id))return;
        seen.add(data.id);
        const target=frame.contentWindow;
        const progress=(received)=>{
          bytesReceived.set(data.id,received);
          const now=performance.now();
          if(now-lastPaint<300&&received!==asset.bytes)return;
          lastPaint=now;
          const sum=[...bytesReceived.values()].reduce((n,v)=>n+v,0);
          setStatus("Preparazione "+assetLabels[data.id]+": "+megabytes(received)+"/"+megabytes(asset.bytes)+" MB · risorse elaborate "+megabytes(sum)+"/"+megabytes(allBytes)+" MB");
        };
        progress(0);
        void (async()=>{
          let bytes;
          const compressed=gzipById.get(asset.id);
          if(compressed){
            try{
              const candidate=await readFile("/atlas-gateway-gzip/"+compressed.file,current.signal,progress,asset.bytes,true);
              if(candidate.byteLength!==asset.bytes||await hash(candidate)!==asset.sha256)throw Error("GZIP_INTEGRITA");
              bytes=candidate;
            }catch(error){
              if(current.signal.aborted)throw error;
              console.warn("ATLAS_GZIP_RESOURCE_FALLBACK",asset.id);
              bytesReceived.set(asset.id,0);
            }
          }
          if(!bytes)bytes=await readFile("/atlas-gateway-native/"+asset.file,current.signal,progress,asset.bytes);
          if(bytes.byteLength!==asset.bytes||await hash(bytes)!==asset.sha256)throw Error("Risorsa non integra: "+data.id);
          if(closing||controller!==current||frame?.contentWindow!==target)return;
          const transferred=bytes.buffer;
          target.postMessage({type:"atlas-native-asset",channel,id:asset.id,bytes:transferred},"*",[transferred]);
        })().catch(()=>fallback("Una risorsa grafica non è stata caricata. Tocca «Riprova 3D».",true));
        return;
      }
      if(data.type==="atlas-3d-phase"&&typeof data.id==="string"&&Object.hasOwn(assetLabels,data.id)){
        setStatus(data.step==="preview"?"La struttura è visibile · completamento della biblioteca…":"Preparazione di "+assetLabels[data.id]+"…");
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
    window.atlasDiagnostics?.attach(channel,frame);
    frame.srcdoc=source;
    scene.replaceChildren(frame);active=true;
    timeout=window.setTimeout(()=>fallback("L'avvio 3D non è riuscito. Tocca «Riprova 3D».",true),210000);
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
