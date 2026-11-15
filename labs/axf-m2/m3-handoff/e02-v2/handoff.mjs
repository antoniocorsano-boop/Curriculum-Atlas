import {verifyEvidence} from "./energy/model.mjs";
const stage=document.getElementById("stage"),summary=document.getElementById("summary");
let phase="", epoch=0, dispose=null, trace=null;
const buttons=(id,label)=>'<button id="'+id+'">'+label+'</button>';
const on=(id,fn)=>document.getElementById(id).onclick=fn;
function setTrace(next){trace=next;summary.dataset.trace=JSON.stringify(trace);summary.textContent=trace?"Confronto completato: misure e motivazione disponibili in questa sessione.":"Nessun confronto completato."}
function enter(name,html){epoch++;if(dispose){dispose();dispose=null}stage.replaceChildren();phase=name;stage.dataset.phase=name;stage.innerHTML=html;stage.focus();return epoch}
function prologue(){enter("prologue",'<h2>La città delle piccole stelle</h2><figure><img src="assets/PE-01.webp" alt="Il gruppo osserva il plastico della città."></figure><p>La luce si è affievolita. Non sappiamo perché. Elena, Matteo e Samir vogliono capire come ottenere la stessa luce usando meno energia.</p>'+buttons("explore","Entra nell’atelier"));on("explore",explore)}
function explore(){
 enter("explore",'<h2>Il plastico</h2><p>Esamina la piazza, gli appunti e il banco. Esplora il plastico illustrato. I tre modelli sono virtuali e non rappresentano tecnologie commerciali.</p><div id="map"></div><nav aria-label="Zone del plastico">'+buttons("square","Piazza")+buttons("notebook","Quaderno")+buttons("bench","Banco")+'</nav><p id="zone" role="status"></p>'+buttons("review","Presenta il confronto"));
 document.getElementById("review").disabled=!trace;on("review",review);
 const frame=document.createElement("iframe");frame.title="Plastico illustrato E02";frame.setAttribute("aria-hidden","true");frame.tabIndex=-1;frame.src="./gdevelop/index.html";document.getElementById("map").append(frame);
 on("square",()=>window.axfSelect("inspect-square"));on("notebook",()=>window.axfSelect("inspect-notebook"));on("bench",()=>window.axfSelect("open-bench"));
}
window.axfReady=()=>{if(phase==="explore"&&document.getElementById("map"))document.getElementById("map").dataset.ready="true"};
window.axfSelect=action=>{
 if(phase!=="explore")return;
 const z=document.getElementById("zone");
 if(action==="inspect-square")z.textContent="Il lampione appare affievolito. L’immagine non è una misura: la causa rimane ignota.";
 if(action==="inspect-notebook")z.textContent="Nel modello virtuale, A trasferisce più energia termica di B.";
 if(action==="open-bench"){if(trace){z.textContent="Hai un confronto completato. Presentalo o scegli esplicitamente una nuova prova.";const b=document.createElement("button");b.textContent="Nuova prova (sostituisce il confronto)";b.onclick=()=>{setTrace(null);bench()};z.append(b)}else bench()}
};
async function bench(){
 const ticket=enter("bench",'<h2>Banco virtuale</h2><p>Stesso servizio luminoso: 20 J. Modello ipotetico, due uscite, nessun accumulo.</p><div id="predictions" class="buttons"></div><div class="bench"><section><div id="game" aria-hidden="true"></div><div id="tests" class="buttons"></div><p id="status" role="status"></p></section><section><table><caption>Misure: joule e percentuale</caption><thead><tr><th>Lampada</th><th>Ingresso</th><th>Luce</th><th>Calore</th><th>%</th></tr></thead><tbody id="trials"></tbody></table><div id="revisions" class="buttons"></div><div id="reasons" class="buttons"></div><p id="reflection" role="status"></p>'+buttons("reset","Ricomincia")+'</section></div><nav>'+buttons("back","Torna al plastico (annulla prova incompleta)")+buttons("present","Presenta il confronto")+'</nav>');
 document.getElementById("present").disabled=true;on("back",explore);on("present",review);
 try{
 const {mountEnergyLab}=await import("./energy/scene.mjs");if(ticket!==epoch)return;
 dispose=mountEnergyLab(document,next=>{if(ticket!==epoch)return;setTrace(verifyEvidence(next)?next:null);document.getElementById("present").disabled=!trace});
 }catch(e){if(ticket===epoch)stage.textContent="Banco non disponibile: torna all’inizio.";throw e}
}
function review(){
 if(!trace)return;
 enter("review",'<h2>La proposta alla mostra</h2><figure><img src="assets/PE-03.webp" alt="I ragazzi presentano il loro progetto."></figure><p id="recommendation"></p><p>Le misure virtuali non spiegano perché la luce si sia affievolita.</p><nav>'+buttons("return","Torna al plastico")+buttons("close","Chiudi il racconto")+'</nav>');
 document.getElementById("recommendation").textContent="Scelta rivista: "+trace[4].id+". Spiega al visitatore la scelta usando le misure del banco; la luce utile è uguale.";
 on("return",explore);on("close",()=>{enter("closing",'<h2>Ora sappiamo come confrontare</h2><img src="assets/PE-04.webp" alt="Il docente mostra nuovamente il progetto."><p>La nuova dimostrazione non è un effetto della scelta virtuale. La causa del problema rimane ignota.</p>'+buttons("again","Ritorna al plastico"));on("again",explore)})
}
on("exit",()=>{setTrace(null);enter("exit","<h2>Episodio chiuso</h2><p>Le evidenze di questa sessione sono state eliminate.</p>"+buttons("start","Ricomincia"));on("start",prologue)});
setTrace(null);prologue();
