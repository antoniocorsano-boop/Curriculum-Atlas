"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole, RotateCcw } from "lucide-react";
import "./sistema-tecnologico.css";

type Answers = Record<string, string>;
const STORAGE_KEY = "atlas:smart:sistema-tecnologico:v1";
const examples = ["Smartphone", "Automobile", "Frigorifero", "Bicicletta elettrica", "Treno", "Lavatrice", "Impianto fotovoltaico"];
const steps = [
 {id:"scelta",label:"Sistema",title:"Scegli il sistema",question:"Quale sistema tecnologico vuoi analizzare?",hint:"Scegli uno degli esempi oppure indica un sistema diverso.",rows:1},
 {id:"funzione",label:"Bisogno e funzione",title:"Perché esiste?",question:"Quale bisogno soddisfa, quale risultato deve ottenere e quali componenti sono indispensabili?",hint:"Non descrivere soltanto l'oggetto: spiega come le parti collaborano per raggiungere uno scopo.",rows:6},
 {id:"funzionamento",label:"Funzionamento",title:"Entrate → trasformazioni → uscite",question:"Che cosa entra nel sistema? Che cosa viene trasformato? Che cosa otteniamo in uscita?",hint:"Considera materiali, informazioni ed energia; poi azioni e processi; infine prodotto, servizio, scarti o altri effetti.",rows:6},
 {id:"energia",label:"Energia",title:"Segui l'energia",question:"Da dove proviene, in quale forma entra, come cambia e quale parte diventa utile o viene dissipata?",hint:"Cerca anche calore, attriti, rumore o altre dispersioni. Come ottenere lo stesso risultato usando meno energia?",rows:6},
 {id:"risorse",label:"Risorse",title:"Di che cosa ha bisogno?",question:"Quali materiali e risorse richiede il sistema? Quale ti sembra più importante o critica?",hint:"Considera anche le risorse necessarie alla produzione, al trasporto e all'uso.",rows:6},
 {id:"ciclo",label:"Ciclo di vita",title:"Guarda oltre la fase d'uso",question:"Che cosa accade da materie prime → produzione → trasporto → uso → fine vita? Quali impatti riconosci?",hint:"Osserva energia, risorse, emissioni e rifiuti e i possibili effetti su aria, acqua, suolo, paesaggio e biodiversità.",rows:7},
 {id:"miglioramento",label:"Sostenibilità",title:"Proponi un miglioramento",question:"In quale punto interverresti per rendere il sistema più sostenibile e perché la proposta dovrebbe ridurre l'impatto?",hint:"Ragiona su efficienza, durata e riparabilità, riuso e riciclo, fonti energetiche e processi.",rows:7}
];

export default function SistemaTecnologicoPage(){
 const [index,setIndex]=useState(0); const [answers,setAnswers]=useState<Answers>({}); const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(STORAGE_KEY);if(raw){const saved=JSON.parse(raw);setIndex(Math.min(Math.max(saved.index??0,0),steps.length));setAnswers(saved.answers??{});}}catch{localStorage.removeItem(STORAGE_KEY);}finally{setReady(true);}},[]);
 useEffect(()=>{if(ready)localStorage.setItem(STORAGE_KEY,JSON.stringify({index,answers}));},[index,answers,ready]);
 const done=index===steps.length; const step=steps[index];
 function reset(){localStorage.removeItem(STORAGE_KEY);setAnswers({});setIndex(0);}
 if(!ready)return <main className="st-shell"><p>Preparazione attività…</p></main>;
 return <main className="st-shell">
  <header className="st-hero"><span className="st-kicker">Atlas · attività guidata</span><h1>Analizzare un sistema tecnologico</h1><p>Energia · Ambiente · Sostenibilità</p><div className="st-privacy" role="status"><LockKeyhole size={15} aria-hidden="true"/>Nessun account · risposte salvate solo su questo dispositivo</div></header>
  <div className="st-progress-wrap"><div className="st-progress-copy"><strong>{done?"Completato":`Passaggio ${index+1} di ${steps.length}`}</strong><span>{done?"Riepilogo":step?.label}</span></div><div className="st-progress" aria-label={done?"Attività completata":`Passaggio ${index+1} di ${steps.length}`}>{steps.map((s,i)=><span key={s.id} className={i<index?"done":i===index?"current":""}/>)}</div></div>
  {!done&&step?<section className={`st-card ${step.id==="scelta"?"st-card-choice":""}`} aria-live="polite"><span className="st-eyebrow">{index+1} · {step.label}</span><h2>{step.title}</h2><p className="st-question">{step.question}</p><p className="st-hint">{step.hint}</p>{step.id==="scelta"&&<><span className="st-examples-label">Esempi</span><div className="st-examples" aria-label="Esempi di sistemi tecnologici">{examples.map(example=><button key={example} type="button" aria-pressed={answers.scelta===example} className={answers.scelta===example?"selected":""} onClick={()=>setAnswers(a=>({...a,scelta:example}))}>{example}</button>)}</div></>}<label className={`st-field ${step.id==="scelta"?"st-field-choice":""}`}><span>{step.id==="scelta"?"Oppure scegli un altro sistema":"Il tuo ragionamento"}</span>{step.id==="scelta"?<input type="text" value={answers.scelta??""} onChange={e=>setAnswers(a=>({...a,scelta:e.target.value}))} placeholder="Scrivi il nome del sistema…"/>:<textarea rows={step.rows} value={answers[step.id]??""} onChange={e=>setAnswers(a=>({...a,[step.id]:e.target.value}))} placeholder="Scrivi con parole tue…"/>}</label><div className="st-nav"><button className="secondary" disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}><ArrowLeft size={18}/>Indietro</button><button className="primary" disabled={!answers[step.id]?.trim()} onClick={()=>setIndex(i=>Math.min(steps.length,i+1))}>Continua<ArrowRight size={18}/></button></div></section>:
  <section className="st-summary"><div className="st-summary-title"><CheckCircle2 size={28}/><div><span className="st-eyebrow">Riepilogo</span><h2>Il sistema, visto nel suo insieme</h2></div></div><p className="st-hint">Rileggi il percorso: la qualità dell&apos;analisi dipende dai collegamenti costruiti, non dalla quantità di informazioni.</p>{steps.map((s,i)=><article className="st-summary-item" key={s.id}><span>{i+1}</span><div><h3>{s.label}</h3><p>{answers[s.id]?.trim()||"Nessuna risposta inserita."}</p></div></article>)}<aside className="st-conclusion"><strong>Conclusione da discutere:</strong> quale relazione tra funzionamento, energia, risorse e ambiente ti sembra più importante? Motiva la risposta usando ciò che hai osservato.</aside><div className="st-nav"><button className="secondary" onClick={()=>setIndex(steps.length-1)}><ArrowLeft size={18}/>Rivedi</button><button className="secondary" onClick={reset}><RotateCcw size={17}/>Ricomincia</button></div></section>}
 </main>;
}
