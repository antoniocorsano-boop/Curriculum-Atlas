/* Biblioteca Atlas — diagnostics are opt-in, local-only and ephemeral.
 * No cookies, identifiers, analytics, storage, network calls or automatic uploads.
 * Reports distinguish render submissions from real GPU/visible FPS. */
(()=>{
"use strict";
if(new URLSearchParams(location.search).get("diagnostica")!=="1")return;

const sampleBridge="const atlasPerf={active:false,start:0,samples:[],backpressure:0,moves:[],gesture:0,dragging:false,lastMoveAt:0};\nconst atlasRound=value=>Math.round(value*10)/10;\nconst atlasP95=values=>{\n  if(!values.length)return null;\n  const sorted=values.slice().sort((a,b)=>a-b);\n  return atlasRound(sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*.95)-1)]);\n};\n// Gesture samples are recorded independently of the render loop: stationary\n// pauses do not become false 3-second \"GPU stalls\".\ncanvas.addEventListener(\"pointerdown\",event=>{\n  if(!atlasPerf.active||!ready||closing||event.isPrimary===false)return;\n  atlasPerf.dragging=true;atlasPerf.gesture++;atlasPerf.lastMoveAt=0;\n},events);\ncanvas.addEventListener(\"pointermove\",event=>{\n  if(!atlasPerf.active||!atlasPerf.dragging)return;\n  const now=performance.now();\n  atlasPerf.lastMoveAt=now;\n  if(atlasPerf.moves.length<2400)atlasPerf.moves.push({time:now,gesture:atlasPerf.gesture});\n},events);\nfunction atlasGestureEnd(){atlasPerf.dragging=false}\ncanvas.addEventListener(\"pointerup\",atlasGestureEnd,events);\ncanvas.addEventListener(\"pointercancel\",atlasGestureEnd,events);\naddEventListener(\"message\",event=>{\n  if(event.source!==parent||event.origin!==ATLAS_PARENT_ORIGIN||event.data?.channel!==ATLAS_CHANNEL)return;\n  if(event.data.type===\"atlas-diagnostic-start\"&&ready&&!closing){\n    atlasPerf.active=true;atlasPerf.start=performance.now();atlasPerf.samples=[];\n    atlasPerf.moves=[];atlasPerf.gesture=0;atlasPerf.dragging=false;atlasPerf.lastMoveAt=0;\n    atlasPerf.backpressure=renderBudget.backpressureSkips;\n    send(\"atlas-diagnostic-started\");\n  }\n  if(event.data.type===\"atlas-diagnostic-stop\"&&atlasPerf.active){\n    atlasPerf.active=false;atlasPerf.dragging=false;\n    const samples=atlasPerf.samples;\n    const gaps=samples.slice(1).map((s,i)=>s.time-samples[i].time);\n    const motionGaps=[];\n    for(let i=1;i<samples.length;i++){\n      const a=samples[i-1],b=samples[i];\n      if(!a.gesture||a.gesture!==b.gesture)continue;\n      if(atlasPerf.moves.some(m=>m.gesture===b.gesture&&m.time>a.time&&m.time<=b.time))\n        motionGaps.push(b.time-a.time);\n    }\n    const motionCpu=samples.filter(s=>s.gesture>0).map(s=>s.cpu);\n    let movementDuration=0;\n    for(let i=1;i<atlasPerf.moves.length;i++){\n      const prev=atlasPerf.moves[i-1],next=atlasPerf.moves[i];\n      if(prev.gesture===next.gesture)movementDuration+=Math.min(150,next.time-prev.time);\n    }\n    const length=samples.length,elapsed=performance.now()-atlasPerf.start;\n    const report={\n      durationMs:Math.round(elapsed),submittedFrames:length,\n      submissionRate:length>1?atlasRound((length-1)*1000/(samples[length-1].time-samples[0].time)):0,\n      frameIntervalP95Ms:atlasP95(gaps),longestFrameMs:gaps.length?atlasRound(Math.max(...gaps)):null,\n      cpuSubmitP95Ms:atlasP95(samples.map(s=>s.cpu)),\n      gpuBackpressure:renderBudget.backpressureSkips-atlasPerf.backpressure,\n      gpuQueueFenceSupported:Boolean(renderBudget.fenceSupported),\n      rasterScale:atlasRound(renderBudget.scale),drawCalls:renderer.info.render.calls,\n      gestureCount:atlasPerf.gesture,gestureMoveEvents:atlasPerf.moves.length,\n      estimatedActiveMovementMs:Math.round(movementDuration),\n      renderIntervalsDuringMotion:motionGaps.length,\n      motionSubmissionRate:motionGaps.length?atlasRound(1000/(motionGaps.reduce((x,y)=>x+y,0)/motionGaps.length)):null,\n      motionIntervalP95Ms:atlasP95(motionGaps),\n      motionLongestIntervalMs:motionGaps.length?atlasRound(Math.max(...motionGaps)):null,\n      motionDelaysAbove200Ms:motionGaps.filter(x=>x>200).length,\n      motionCpuSubmitP95Ms:atlasP95(motionCpu)\n    };\n    send(\"atlas-diagnostic-report\",{report});\n  }\n},events);";
const inject=function(source){
  const anchors=["function render(t=0){","renderBudget.lastSubmitMs=Math.round(performance.now()-start);"];
  for(const anchor of anchors)if(source.split(anchor).length!==2)throw Error("DIAGNOSTICA_SCENA_MODIFICATA");
  source=source.replace(anchors[0],sampleBridge+"\n"+anchors[0]);
  source=source.replace(anchors[1],anchors[1]+
    '\n if(atlasPerf.active&&atlasPerf.samples.length<900){const now=performance.now();atlasPerf.samples.push({time:now,cpu:renderBudget.lastSubmitMs,scale:renderBudget.scale,gesture:atlasPerf.dragging||now-atlasPerf.lastMoveAt<180?atlasPerf.gesture:0});}');
  return source;
};

const panel=document.createElement("section");
panel.id="atlas-diag";
panel.setAttribute("aria-label","Diagnostica locale della biblioteca");
panel.style.cssText="position:fixed;z-index:200;left:8px;right:8px;bottom:8px;max-width:560px;margin:0 auto;padding:10px 12px;border:1px solid #d2b778;border-radius:12px;background:#102333f4;color:#fff;box-shadow:0 5px 24px #0008;font:13px system-ui";
panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><strong>Diagnostica locale · Atlas</strong><button type="button" id="diag-hide" aria-label="Riduci la diagnostica">Riduci</button></div><p id="diag-instructions" style="margin:8px 0">Avvia, muovi la visuale 3D per alcuni secondi, poi termina. Nessun dato viene inviato.</p><div id="diag-controls" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="diag-start" disabled>Avvia misura</button><button type="button" id="diag-stop" disabled>Termina misura</button><button type="button" id="diag-copy" disabled>Copia risultato</button></div><p id="diag-state" role="status" aria-live="polite" style="margin:8px 0 0">Preparazione della biblioteca…</p><textarea id="diag-result" aria-label="Risultato delle misure" rows="5" readonly hidden style="width:100%;margin-top:7px;background:#0b1924;color:#fff;border:1px solid #81939b;border-radius:6px;padding:6px;font:12px monospace;resize:vertical"></textarea>';
document.body.append(panel);
for(const button of panel.querySelectorAll("button")){
  button.style.cssText="min-height:44px;padding:7px 11px;border:1px solid #d2b778;background:#203a4a;color:white;border-radius:8px;cursor:pointer;font:inherit";
}
const button=id=>panel.querySelector("#"+id);
let channel=null,frame=null,ready=false,started=false,lastReport="",readyAtMs=null;
const setState=value=>button("diag-state").textContent=value;
function send(type){
  if(!frame?.contentWindow||!channel)return;
  frame.contentWindow.postMessage({type,channel}, "*");
}
button("diag-start").addEventListener("click",()=>{
  if(!ready||started)return;
  started=true;lastReport="";
  button("diag-result").hidden=true;
  button("diag-start").disabled=true;button("diag-stop").disabled=false;button("diag-copy").disabled=true;
  setState("Misura in corso: trascina la scena a sinistra e a destra.");
  send("atlas-diagnostic-start");
});
button("diag-stop").addEventListener("click",()=>{
  if(!started)return;started=false;button("diag-stop").disabled=true;
  setState("Elaborazione dei risultati locali…");
  send("atlas-diagnostic-stop");
});
button("diag-copy").addEventListener("click",async()=>{
  if(!lastReport)return;
  try{await navigator.clipboard.writeText(lastReport);setState("Risultato copiato. Nessun invio automatico.");}
  catch{button("diag-result").focus();button("diag-result").select();setState("Seleziona e copia il testo del risultato.");}
});
button("diag-hide").addEventListener("click",()=>{
  const controls=button("diag-controls"),instructions=button("diag-instructions"),result=button("diag-result");
  const hidden=controls.hidden===true;
  controls.hidden=hidden;instructions.hidden=hidden;result.hidden=hidden||!lastReport;
  button("diag-hide").textContent=hidden?"Riduci":"Mostra";
});
function report(data){
  const out={
    tipo:"Misura locale Biblioteca Atlas",
    nota:"Frequenza dei disegni inviati, NON FPS GPU o fotogrammi effettivamente visualizzati.",
    tempo_fino_a_sala_pronta_ms:readyAtMs,
    durata_prova_ms:data.durationMs,
    fotogrammi_inviati:data.submittedFrames,
    frequenza_invio_media_fps:data.submissionRate,
    intervallo_invio_p95_ms:data.frameIntervalP95Ms,
    intervallo_massimo_ms:data.longestFrameMs,
    cpu_sottomissione_p95_ms:data.cpuSubmitP95Ms,
    attese_gpu:data.gpuBackpressure,
    controllo_coda_gpu_supportato:data.gpuQueueFenceSupported,
    gesti_rilevati:data.gestureCount,
    eventi_movimento:data.gestureMoveEvents,
    durata_movimento_rilevata_ms:data.estimatedActiveMovementMs,
    intervalli_in_movimento:data.renderIntervalsDuringMotion,
    frequenza_invio_durante_movimento_fps:data.motionSubmissionRate,
    intervallo_movimento_p95_ms:data.motionIntervalP95Ms,
    intervallo_massimo_movimento_ms:data.motionLongestIntervalMs,
    ritardi_movimento_oltre_200ms:data.motionDelaysAbove200Ms,
    cpu_sottomissione_movimento_p95_ms:data.motionCpuSubmitP95Ms,
    scala_render:data.rasterScale,
    chiamate_grafiche:data.drawCalls,
    misurazione_tempo_gpu:"non disponibile",
    contenuto_personale:"nessuno"
  };
  lastReport=JSON.stringify(out,null,2);
  button("diag-result").value=lastReport;button("diag-result").hidden=false;
  button("diag-copy").disabled=false;button("diag-start").disabled=!ready;
  setState(data.renderIntervalsDuringMotion<3
    ?"Movimento insufficiente per una diagnosi affidabile: ripeti trascinando la scena più a lungo."
    :"Movimento rilevato: il rapporto separa le pause dai rallentamenti durante il gesto.");
}
function handleMessage(data){
  if(data.type==="atlas-3d-ready"){
    ready=true;readyAtMs=Math.round(performance.now());button("diag-start").disabled=false;setState("Biblioteca pronta. Premi «Avvia misura».");
  }else if(data.type==="atlas-3d-error"){
    ready=false;started=false;button("diag-start").disabled=true;
    button("diag-stop").disabled=true;setState("La scena 3D non è disponibile.");
  }else if(data.type==="atlas-diagnostic-report"&&data.report){
    report(data.report);
  }
}
function attach(newChannel,newFrame){channel=newChannel;frame=newFrame;ready=false;started=false;button("diag-start").disabled=true;button("diag-stop").disabled=true;setState("Preparazione della biblioteca…");}
window.atlasDiagnostics={inject,handleMessage,attach};
})();