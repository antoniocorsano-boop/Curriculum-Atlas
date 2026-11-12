// M118-R2: local opt-in, portable minimal checkpoint.
export function validateCheckpoint(x){
 const keys=["contract","activity","version","stage","phase","storyIndex","step","firstModule","principle"];
 if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).length!==keys.length||!keys.every(k=>Object.hasOwn(x,k)))throw Error("INVALID_CHECKPOINT");
 if(x.contract!=="trama.m118-checkpoint/v1"||x.activity!=="trama-missione-118-2026"||x.version!=="0.1.0-draft")throw Error("INCOMPATIBLE_CHECKPOINT");
 const {stage,phase,storyIndex,step,firstModule,principle}=x;
 if(!Number.isInteger(stage)||stage<0||stage>4||!Number.isInteger(storyIndex)||storyIndex<0||storyIndex>4||!Number.isInteger(step)||step<0)throw Error("INVALID_POSITION");
 let ok=false;
 if(stage===0)ok=phase==="narration"&&step===0;
 if(stage>=1&&stage<=3){const n=[0,5,6,4][stage];ok=storyIndex===4&&((phase==="intro"&&step===0)||(phase==="play"&&step<n)||(phase==="complete"&&step===n));}
 if(stage===4)ok=storyIndex===4&&step===0&&["intro","choose","code","done"].includes(phase);
 if(!ok)throw Error("INVALID_PHASE");
 if(stage===2&&step===5){if(!["steps","verify"].includes(firstModule))throw Error("INVALID_MODULE");}
 else if(firstModule!==null)throw Error("INVALID_MODULE");
 if(stage===4&&["code","done"].includes(phase)){if(!["scelta","verifica","sicurezza"].includes(principle))throw Error("INVALID_PRINCIPLE");}
 else if(principle!==null)throw Error("INVALID_PRINCIPLE");
 return x;
}
function browserCheckpoint(){
 const KEY="trama.missione118.checkpoint.v1";
 let enabled=false,stored=null,warning="",pending=false;
 const $=id=>document.getElementById(id);
 const dialog=$("progressDialog");
 function checkpoint(){
  let {stage,phase,storyIndex,step}=st;
  if(st.won)phase="done";
  if(phase==="result"){if(st.feedback?.correct){step++;phase=step>=total(stage)?"complete":"play";}else phase="play";}
  return validateCheckpoint({contract:"trama.m118-checkpoint/v1",activity:"trama-missione-118-2026",version:"0.1.0-draft",stage,phase,storyIndex:stage===0?storyIndex:4,step:stage===4?0:step,firstModule:stage===2&&step===5?st.modules[0]:null,principle:stage===4&&["code","done"].includes(phase)?st.focus:null});
 }
 function restore(x){
  validateCheckpoint(x);stopNarration();st=initial();st.restoredCheckpoint=true;
  st.stage=x.stage;st.storyIndex=x.storyIndex;st.phase=x.phase==="done"?"code":x.phase;st.step=x.step;st.won=x.phase==="done";st.focus=x.principle||"";
  st.solved=[1,2,3].map(n=>x.stage>n||(x.stage===n&&x.phase==="complete"));st.digits=st.solved.map((v,i)=>v?["3","2","4"][i]:"?");
  const count=n=>x.stage>n?total(n):x.stage===n?x.step:0;
  st.notices=notifs.map((n,i)=>i<count(1)?n.correct:null);
  st.claims=claims.map((n,i)=>i<Math.min(4,count(2))?n.correct:null);
  st.modules=count(2)>=6?["steps","verify"]:count(2)===5?[x.firstModule]:[];
  st.traffic=count(3);
 }
 function erase(){
  try{window.localStorage.removeItem(KEY);stored=null;warning="";return true;}catch{warning="Impossibile cancellare il salvataggio del browser. Usa le impostazioni del dispositivo.";return false;}
 }
 function saveCheckpoint(){
  if(!enabled||pending)return;
  try{const x=checkpoint();window.localStorage.setItem(KEY,JSON.stringify(x));stored=x;warning="";}
  catch{warning="Il browser non consente il salvataggio. Esporta un file dei progressi.";}
 }
 function show(message=""){
  $("progressStatus").textContent=message||warning||(enabled?"Salvataggio automatico sul dispositivo attivo.":"Salvataggio automatico non attivo. Puoi esportare un file.");
  $("progressResume").hidden=!stored||!pending;$("progressNew").hidden=!pending;
  $("progressClose").hidden=pending;$("progressEnable").hidden=pending||enabled;
  for(const id of ["progressExport","progressErase","progressImportLabel"])$(id).hidden=pending;
  if(!dialog.open){cancelCrawl();dialog.showModal();}
 }
 function close(){if(dialog.open)dialog.close();if(st.phase==="narration"&&!crawlStatic)playCrawl();}
 function initializeProgress(){
  try{const raw=window.localStorage.getItem(KEY);if(raw!==null){if(raw.length>4096)throw Error();stored=validateCheckpoint(JSON.parse(raw));}}
  catch{warning="Salvataggio non disponibile o non valido. Puoi usare il file dei progressi.";}
  if(stored){pending=true;show("È presente una missione salvata su questo dispositivo. Riprendila solo se è il tuo percorso.");}
 }
 function resetProgress(){
  if(!confirm("Ricominciare? Il salvataggio di Missione 118 su questo dispositivo sarà cancellato."))return;
  if(stored&&!erase()){show(warning);return;}
  enabled=false;stopNarration();st=initial();render();
 }
 $("progressOpen").addEventListener("click",()=>show());
 dialog.addEventListener("cancel",e=>{e.preventDefault();if(!pending)close();});
 $("progressClose").addEventListener("click",close);
 $("progressEnable").addEventListener("click",()=>{enabled=true;saveCheckpoint();show(warning||"Salvataggio locale attivo.");});
 $("progressResume").addEventListener("click",()=>{if(!stored)return;restore(stored);pending=false;enabled=true;close();render();});
 $("progressNew").addEventListener("click",()=>{if(!confirm("Eliminare il percorso salvato?")||!erase()){show(warning);return;}pending=false;enabled=false;st=initial();close();render();});
 $("progressErase").addEventListener("click",()=>{if(!confirm("Cancellare il salvataggio locale? La sessione corrente resta aperta."))return;enabled=false;erase();show(warning||"Salvataggio locale cancellato.");});
 $("progressExport").addEventListener("click",()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(checkpoint(),null,2)+"\n"],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="Missione118-progressi.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  show("File dei progressi preparato. Verifica che sia stato scaricato.");
 });
 $("progressImport").addEventListener("change",async e=>{
  const file=e.target.files?.[0];e.target.value="";if(!file)return;
  try{if(file.size>4096)throw Error();const x=validateCheckpoint(JSON.parse(await file.text()));
   if(!confirm("Riprendere il percorso del file? La sessione corrente sarà sostituita."))return;
   restore(x);close();render();
  }catch{show("File non valido o incompatibile. Il percorso corrente non è stato modificato.");}
 });
 return {saveCheckpoint,initializeProgress,resetProgress};
}
export function addLocalProgress(source){
 let html=source;
 function once(a,b){if(html.split(a).length!==2)throw Error("PROGRESS_ANCHOR "+a.slice(0,100));html=html.replace(a,()=>b)}
 const dialog='<dialog id="progressDialog" aria-labelledby="progressTitle"><h2 id="progressTitle">I tuoi progressi</h2><p>Solo su questo dispositivo. Nessun nome o account. Su un dispositivo condiviso, cancella il salvataggio alla fine.</p><p id="progressStatus" role="status"></p><div class="progress-actions"><button id="progressResume" type="button">Riprendi la missione</button><button id="progressNew" type="button">Nuova missione</button><button id="progressEnable" type="button">Attiva salvataggio locale</button><button id="progressExport" type="button">Esporta progressi</button><label id="progressImportLabel">Importa progressi<input id="progressImport" type="file" accept=".json,application/json"></label><button id="progressErase" type="button">Cancella salvataggio</button><button id="progressClose" type="button">Torna alla missione</button></div></dialog>';
 once('<main id="app"></main>','<main id="app"></main>'+dialog);
 once('<button type="button" class="mini-button" id="restart">Ricomincia</button>','<button type="button" class="mini-button" id="progressOpen">Progressi</button><button type="button" class="mini-button" id="restart">Ricomincia</button>');
 once('</style>','#progressDialog{width:min(90vw,460px);max-height:85vh;overflow:auto;border:1px solid #6ea8d9;border-radius:14px;background:#e8f4ff;color:#111;padding:18px}#progressDialog::backdrop{background:#05111ccc}#progressDialog h2{color:#163b59}#progressDialog p{color:#111;line-height:1.5}.progress-actions{display:grid;gap:8px}.progress-actions button,.progress-actions label{min-height:44px;background:#cfe8ff;color:#111;border:1px solid #47769c;border-radius:8px;padding:8px;display:block;text-align:center}.progress-actions [hidden]{display:none!important}.progress-actions input{max-width:100%;color:#111}.topright{gap:5px}@media(max-width:450px){.topright .mini-button{padding:6px;font-size:11px}}</style>');
 once('const save=()=>{}; // R1 session only; R2 adds validated persistence.','let progressController=null; const save=()=>progressController?.saveCheckpoint();');
 once('function restart(){if(confirm(\'Ricominciare la missione? I progressi di questa versione saranno azzerati.\')){stopNarration();st=initial();render();}}','function restart(){progressController.resetProgress();}');
 once('Solo sul dispositivo. I progressi restano nella sessione.','Solo sul dispositivo. Apri Progressi per salvare o esportare il percorso.');
 once('Correzioni durante la missione: '+String.fromCharCode(36)+'{st.errors}. Anche correggere fa parte della progettazione.','Anche correggere fa parte della progettazione.');
 const ending=html.lastIndexOf('render();');
 if(ending<0)throw Error("INIT_ANCHOR");
 html=html.slice(0,ending)+validateCheckpoint.toString()+'\n'+browserCheckpoint.toString()+'\nprogressController=browserCheckpoint();\nrender();progressController.initializeProgress();'+html.slice(ending+'render();'.length);
 return html;
}
