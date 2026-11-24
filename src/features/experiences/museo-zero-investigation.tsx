"use client";
import {useId,useState} from "react";
import type {ExperienceWorldState} from "./model";
import {museoZeroPortrait} from "./museo-zero-narrative";
import "./museo-zero-investigation.css";
const base="/media/museo-zero/narrative-v1/";
export type Prediction="delayed"|"stable"|"manual";
const outcomes:Record<Prediction,string>={delayed:"La risposta arriva in ritardo",stable:"La sala risponde al passaggio senza intervento umano",manual:"La risposta dipende dall’operatore"};
export function museoOutcome(world?:ExperienceWorldState):Prediction{
 if(world?.signals.some(s=>s.state==="MANUAL"))return "manual";
 if(world?.signals.some(s=>["projection","sequence","room"].includes(s.id)&&s.state==="STABLE"))return "stable";
 return "delayed";
}
const locations:Record<string,{image:string;alt:string;person?:string;question?:string;evidence?:string}>={
 entry:{image:"sala",alt:"La soglia accessibile e il percorso nella galleria",person:"Lia",question:"Perché avete cambiato il percorso?",evidence:"ev-lia"},
 room:{image:"sala",alt:"Sala Zero, parete di proiezione e percorso",person:"Omar",question:"Che cosa hai verificato sul sensore?",evidence:"ev-sensor-b"},
 control:{image:"regia",alt:"Cabina di regia affacciata sulla sala",person:"Teo",question:"Che cosa è successo durante la prova?",evidence:"ev-teo"},
 lab:{image:"squadra",alt:"La squadra e il tavolo di lavoro: illustrazione di riferimento"}
};
export function MuseoLocation({location,onAsk,activeEvidenceId}:{location:string;onAsk?:(id:string)=>void;activeEvidenceId?:string}){
 const scene=locations[location];if(!scene)return null;
 return <section className="mz-location" data-testid="mz-location" data-location={location} aria-label="Ambiente dell’indagine">
   <figure>
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={base+scene.image+".webp"} alt={scene.alt} loading="lazy"/>
     <figcaption>{location==="lab"?"La squadra al lavoro · riferimento illustrativo":"Ambiente di riferimento"}</figcaption>
   </figure>
   {scene.person&&scene.evidence&&onAsk&&<div className="mz-location__dialogue">
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={museoZeroPortrait(scene.person)!} alt="" loading="lazy"/>
     <div><strong>Parla con {scene.person}</strong><button type="button" aria-pressed={activeEvidenceId===scene.evidence} onClick={()=>onAsk(scene.evidence!)}>{scene.question}</button></div>
   </div>}
 </section>
}
export function MuseoPrediction({value,onChange,last}:{value:Prediction|"";onChange:(value:Prediction)=>void;last:{prediction:Prediction;observed:Prediction}|null}){
 const id=useId();
 return <section className="mz-prediction" data-testid="mz-prediction" aria-labelledby={id}>
 <h3 id={id}>Prima della prova, che cosa prevedi?</h3>
 <p>Immagina il risultato dell’intervento che vuoi provare. Poi confrontalo con quello che accade.</p>
 <div role="group" aria-label="Previsione del risultato">{(Object.keys(outcomes) as Prediction[]).map(key=><button key={key} type="button" aria-pressed={value===key} onClick={()=>onChange(key)}>{outcomes[key]}</button>)}</div>
 {last&&<div role="status" data-testid="mz-prediction-result"><p><strong>Previsione precedente:</strong> {outcomes[last.prediction]}.</p><p><strong>Esito osservato:</strong> {outcomes[last.observed]}.</p><p>{last.prediction===last.observed?"La previsione coincide con l’esito di questa prova. Quale indizio la sosteneva?":"La previsione non coincide con l’esito. Quale relazione o ipotesi devi rivedere?"}</p></div>}
 </section>
}
export function MuseoExtension(){
 const [open,setOpen]=useState(false);const [choice,setChoice]=useState<"tempo"|"relazioni"|"">("");const [reason,setReason]=useState("");const id=useId();
 return <section className="mz-extension" data-testid="mz-extension" aria-labelledby={id}><h3 id={id}>Una nuova domanda, se vuoi approfondire</h3><p>Il museo è pronto. Puoi concludere qui, oppure aiutare la squadra con una situazione diversa.</p>
 <button type="button" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{open?"Chiudi approfondimento":"Esplora un nuovo caso"}</button>
 {open&&<div><h4>Due visitatori, una sola sala</h4><p>Durante una nuova prova, una persona entra al secondo 0 e un’altra al secondo 5. La proiezione dura 10 secondi e non sappiamo ancora se riparte al secondo ingresso. Quali informazioni ti servono per capirlo?</p>
 <div role="group" aria-label="Come organizzi le informazioni?"><button type="button" aria-pressed={choice==="tempo"} onClick={()=>setChoice("tempo")}>Metto in fila ingressi e risposte</button><button type="button" aria-pressed={choice==="relazioni"} onClick={()=>setChoice("relazioni")}>Collego ingressi e regole della proiezione</button></div>
 {choice&&<p role="status">{choice==="tempo"?"La sequenza ti aiuta a confrontare il momento dei due ingressi con l’inizio e la fine della proiezione. Ti manca ancora la risposta al secondo ingresso.":"Le relazioni ti aiutano a capire quale evento dovrebbe attivare o riavviare la proiezione. Ti manca ancora la regola effettiva del sistema."}</p>}
 <label>Quale prova faresti per ottenere l’informazione mancante?<textarea value={reason} maxLength={500} onChange={e=>setReason(e.target.value)} placeholder="Annota un’idea, se vuoi." /></label><small>Appunto facoltativo, solo nella sessione: non viene salvato né valutato.</small></div>}
 </section>
}
