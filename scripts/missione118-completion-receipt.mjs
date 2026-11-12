// Local formative completion receipt. No identity or certification.
export function completionReceipt(state, expected){
 const same=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((x,i)=>x===b[i]);
 if(!state||state.stage!==4||state.phase!=="code"||state.won!==true||
  !same(state.solved,[true,true,true])||!same(state.digits,["3","2","4"])||
  !same(state.notices,expected.notices)||!same(state.claims,expected.claims)||
  !Array.isArray(state.modules)||state.modules.length!==2||
  !state.modules.includes("steps")||!state.modules.includes("verify")||state.traffic!==4||
  !["scelta","verifica","sicurezza"].includes(state.focus))return null;
 const principles={scelta:"Libertà di scelta",verifica:"Verifica umana",sicurezza:"Sicurezza"};
 return {contract:"trama.m118-completion-receipt/v1",activityId:"trama-missione-118-2026",
  activityVersion:"0.1.0-draft",title:"Missione 118",result:"PERCORSO_COMPLETATO",
  origin:state.restoredCheckpoint===true?"RIPRESO_DA_SALVATAGGIO":"SESSIONE_LOCALE",
  evidence:[
   {id:"attenzione",title:"Attenzione digitale",description:"Hai distinto gli avvisi da mostrare dalle notifiche da mettere in pausa."},
   {id:"verifica",title:"Verifica delle informazioni",description:"Hai controllato le affermazioni e scelto funzioni utili per il tutor."},
   {id:"controllo",title:"Controllo umano",description:"Hai riconosciuto le condizioni del sistema e scelto la risposta prudente al guasto."}
  ],principle:{id:state.focus,title:principles[state.focus]},
  transfer:"Progetta una tecnologia: descrivi il problema, la soluzione, un possibile errore e come una persona può intervenire.",
  notice:"Restituzione formativa locale, non ufficiale. Non certifica identità, competenze o voto. I progressi locali possono essere modificati.",
  official:false,identityVerified:false,learningCertified:false};
}
function currentReceipt(){
 return completionReceipt(st,{notices:notifs.map(x=>x.correct),claims:claims.map(x=>x.correct)});
}
function receiptMarkup(r){
 if(!r)return "";
 return '<article class="mission-receipt"><div class="receipt-kicker">PROTOCOLLO 118 · RESTITUZIONE FORMATIVA</div><h2>Custode del futuro</h2><p class="receipt-subtitle">Tre sistemi riprogettati. Una tecnologia più umana.</p><div class="receipt-evidence">'+r.evidence.map(e=>'<section><h3>'+safe(e.title)+'</h3><p>'+safe(e.description)+'</p></section>').join("")+'</div><section class="receipt-principle"><small>IL TUO PRINCIPIO GUIDA</small><h3>'+safe(r.principle.title)+'</h3></section><section><h3>La prossima sfida</h3><p>'+safe(r.transfer)+'</p></section><p class="receipt-meta">Missione 118 · Versione '+safe(r.activityVersion)+' · '+(r.origin==="RIPRESO_DA_SALVATAGGIO"?"Percorso ripreso da salvataggio locale":"Sessione locale")+'</p><p class="receipt-notice">'+safe(r.notice)+'</p></article>';
}
function ending(){
 const r=currentReceipt();
 if(!r)return frame('<h2>Esito non disponibile</h2><p>Il percorso non risulta coerente. Puoi ricominciare la missione.</p>',btn("Nuova missione","reset"),"VERIFICA PERCORSO");
 return frame('<div class="result-art">✦</div><h2 class="action-title">Il futuro è cambiato.</h2>'+receiptMarkup(r),btn("Stampa / salva PDF","print","","secondary")+btn("Salva attestato","receipt-export","","secondary")+btn("Nuova missione","reset"),"MISSIONE RIUSCITA");
}
function updateReceiptPrint(){
 const root=document.getElementById("receiptPrint"),r=currentReceipt();
 root.hidden=!r;root.innerHTML=r?receiptMarkup(r):"";
}
function printReceipt(){if(currentReceipt())window.print();}
function exportReceipt(){
 const r=currentReceipt();if(!r)return;
 const url=URL.createObjectURL(new Blob([JSON.stringify(r,null,2)+"\n"],{type:"application/json"}));
 const a=document.createElement("a");a.href=url;a.download="Missione118-attestato.json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function addCompletionReceipt(source){
 let html=source;
 function once(a,b){if(html.split(a).length!==2)throw Error("RECEIPT_ANCHOR "+a.slice(0,90));html=html.replace(a,()=>b)}
 const a=html.indexOf("function ending(){"),z=html.indexOf("function render(){",a);
 if(a<0||z<0)throw Error("RECEIPT_RANGE");
 html=html.slice(0,a)+[completionReceipt,currentReceipt,receiptMarkup,ending,updateReceiptPrint,printReceipt,exportReceipt].map(f=>f.toString()).join("\n")+"\n"+html.slice(z);
 once('<main id="app"></main>','<main id="app"></main><section id="receiptPrint" hidden aria-label="Attestato stampabile"></section>');
 once(" save(); const panel="," updateReceiptPrint(); save(); const panel=");
 once("case 'print':window.print();break;","case 'print':printReceipt();break;case 'receipt-export':exportReceipt();break;");
 const css=[
 '#receiptPrint{display:none}.mission-receipt{background:#e8f4ff;color:#111;border:2px solid #6ea8d9;border-radius:14px;padding:clamp(12px,2vw,22px);text-align:left;font-size:14px;line-height:1.45;margin:6px 0}',
 '.mission-receipt h2,.mission-receipt h3,.mission-receipt p,.mission-receipt small{color:#163b59;margin:0}.mission-receipt h2{font-size:25px;line-height:1.15;margin:6px 0}.mission-receipt h3{font-size:15px;margin:0 0 4px}.mission-receipt p{color:#111;font-size:14px;line-height:1.45}.receipt-kicker{font-size:10px;font-weight:700;letter-spacing:.08em;color:#163b59}.receipt-evidence{display:grid;gap:8px;margin:12px 0}.receipt-evidence section,.receipt-principle{background:#cfe8ff;border-radius:8px;padding:9px 12px}.receipt-principle{margin:10px 0}.receipt-principle small{font-size:10px;font-weight:700}.receipt-meta,.receipt-notice{font-size:11px!important;margin-top:8px!important}.receipt-notice{border-top:1px solid #47769c;padding-top:8px}',
 '@media(max-width:600px){.mission-receipt h2{font-size:22px}.mission-receipt p{font-size:13px}.mission-receipt{padding:12px}.stage:has(.mission-receipt) .stage-footer{flex-wrap:wrap}.stage:has(.mission-receipt) .stage-footer button{min-height:44px;font-size:12px}}',
 '@page{size:A4;margin:16mm}@media print{body:has(#receiptPrint:not([hidden])) #app,body:has(#receiptPrint:not([hidden])) .top,body:has(#receiptPrint:not([hidden])) #progressDialog{display:none!important}#receiptPrint:not([hidden]){display:block!important;max-width:180mm;margin:0 auto}#receiptPrint .mission-receipt{background:#fff!important;border:2px solid #163b59;padding:12mm;border-radius:0;break-inside:avoid}#receiptPrint .receipt-evidence section,#receiptPrint .receipt-principle{background:#fff!important;border:1px solid #6ea8d9}#receiptPrint .mission-receipt h2{font-size:28pt}#receiptPrint .mission-receipt p{font-size:12pt}#receiptPrint .receipt-notice,#receiptPrint .receipt-meta{font-size:10pt!important}}'
 ].join("\n");
 once("</style>",css+"</style>");return html;
}
