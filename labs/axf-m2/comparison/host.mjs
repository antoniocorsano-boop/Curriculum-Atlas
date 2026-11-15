import {initial,act,measure,evidenceTrace} from "./model.mjs";
const $=id=>document.getElementById(id), labels={"inspect-square":"La luce si è affievolita. Causa non nota.","inspect-notebook":"Confronto virtuale: stesso servizio, ingressi differenti.","open-bench":"Banco virtuale: prova le lampade."};
let state=initial();
window.axfReady=()=>{$("frame").dataset.ready="true";$("frame").dataset.readyMs=String(Math.round(performance.now()))};
window.axfSelect=action=>{if(!Object.hasOwn(labels,action))return;$("zone").textContent=labels[action];$("zone").dataset.action=action;$("bench").hidden=action!=="open-bench"};
for(const b of document.querySelectorAll("[data-zone]"))b.onclick=()=>window.axfSelect(b.dataset.zone);
const ids=["A","B","C"], reasons=[["same-light","Stessa luce, meno ingresso"],["thermal-loss","Minore energia termica"],["input-only","Solo il valore in ingresso"]];
function dispatch(a){state=act(state,a);render()}
function controls(type,opts,selected,disabled){
 const el=$(type); if(!el.children.length)for(const [id,label] of opts){const b=document.createElement("button");b.textContent=label;b.dataset.id=id;b.onclick=()=>dispatch(type==="explain"?{type,reason:id}:{type,id});el.append(b)}
 for(const b of el.children){b.disabled=disabled;b.setAttribute("aria-pressed",String(selected===b.dataset.id))}
}
function render(){
 controls("predict",ids.map(x=>[x,"Prevedo "+x]),state.prediction,!!state.trials.length);
 controls("test",ids.map(x=>[x,"Prova "+x]),state.active,!state.prediction);
 controls("revise",ids.map(x=>[x,"Scelgo "+x]),state.revision,state.trials.length!==3);
 controls("explain",reasons,state.explanation,!state.revision);
 const m=state.active&&measure(state.active);
 $("status").textContent=m?"Lampada "+m.id+": "+m.input+" J in ingresso, "+m.useful+" J luce, "+m.thermal+" J calore, efficienza "+m.efficiency+"%.":state.prediction?"Ipotesi: "+state.prediction:"Scegli prima un'ipotesi.";
 $("trials").replaceChildren();for(const id of state.trials){const m=measure(id),tr=document.createElement("tr");for(const n of [id,m.input,m.useful,m.thermal,m.efficiency]){const td=document.createElement("td");td.textContent=String(n);tr.append(td)}$("trials").append(tr)}
 const trace=evidenceTrace(state);$("reflection").textContent=trace?"Ipotesi "+state.prediction+"; scelta "+state.revision+"; criterio "+reasons.find(r=>r[0]===state.explanation)[1]+". Motiva con le misure.":"Confronta tutte e tre le lampade.";
 $("reflection").dataset.trace=JSON.stringify(trace);
}
$("reset").onclick=()=>dispatch({type:"reset"});render();
const f=document.createElement("iframe");f.title="Plastico virtuale";f.setAttribute("aria-hidden","true");f.tabIndex=-1;f.src=new URLSearchParams(location.search).get("engine")==="gdevelop"?"./gdevelop/index.html":"./phaser/frame.html";$("frame").append(f);
