"use client";
import { useState } from "react";
import "./escape-room.css";

type Place = "sala" | "ingresso" | "regia" | "laboratorio";
type Source = "A" | "B" | "MANUALE";
type Test = "ATTESA" | "RITARDO" | "SINCRONO" | "INSTABILE";
type Mode = "cronologia" | "collegamenti" | "confronto";
type Trace = { id: string; place: Place; label: string; detail: string; time: string; x: number; y: number };

const places: Array<{ id: Place; label: string; heading: string; description: string; who: string; says: string }> = [
 {id:"sala",label:"Sala Zero",heading:"La sala parte tardi",description:"Lia attraversa la porta nuova. La proiezione si accende solo quando è quasi dall'altra parte.",who:"Teo · cabina regia",says:"Aspetta. Ancora. La sequenza parte quando Lia è già passata."},
 {id:"ingresso",label:"Ingresso",heading:"Il percorso è cambiato",description:"Le indicazioni sul pavimento seguono una direzione diversa da quella di ieri.",who:"Lia · percorso dei visitatori",says:"Questo ingresso è più comodo per tutti. Non voglio tornare indietro."},
 {id:"regia",label:"Cabina regia",heading:"La console ascolta",description:"Proiezione, suono e luce dipendono da un unico segnale di ingresso.",who:"Teo · cabina regia",says:"Il programma funziona. Ma da quale sensore sta aspettando il segnale?"},
 {id:"laboratorio",label:"Laboratorio",heading:"Le modifiche dell'ultimo minuto",description:"Etichette, appunti e materiali raccontano la preparazione della sala.",who:"Omar · installazione",says:"Il sensore è stato spostato, non sostituito. La luce di prova si accende."}
];
const traces: Trace[] = [
 {id:"ritardo",place:"sala",label:"Proiezione in ritardo",detail:"La parete si accende dopo che Lia supera il vecchio punto di ingresso.",time:"18:42",x:70,y:43},
 {id:"cammino",place:"sala",label:"Percorso nella prova",detail:"Lia passa prima sul sensore B, poi attraversa la precedente zona A.",time:"18:42",x:32,y:74},
 {id:"percorso",place:"ingresso",label:"Nuovo accesso",detail:"Alle 16:10 Lia ha invertito l'ingresso per liberare un passaggio più ampio.",time:"16:10",x:36,y:58},
 {id:"accessibilita",place:"ingresso",label:"Spazio di passaggio",detail:"Tornare al percorso precedente ridurrebbe lo spazio riservato al transito.",time:"16:10",x:73,y:70},
 {id:"trigger",place:"regia",label:"Segnale attivo: A",detail:"La regia è ancora collegata alla vecchia zona di ingresso A, non al nuovo sensore B.",time:"18:30",x:67,y:45},
 {id:"log",place:"regia",label:"Registro della prova",detail:"Il sensore B rileva l'ingresso. La sequenza parte solo quando arriva un evento da A.",time:"18:42",x:32,y:72},
 {id:"sensore",place:"laboratorio",label:"Sensore B",detail:"Omar ha posizionato il sensore B sulla nuova entrata. La sua spia conferma il passaggio.",time:"17:05",x:64,y:55},
 {id:"volume",place:"laboratorio",label:"Appunto sul volume",detail:"Alle 17:20 il suono è stato abbassato: questo non modifica quando si accende la proiezione.",time:"17:20",x:27,y:76}
];
const order = ["percorso","accessibilita","sensore","volume","trigger","ritardo","cammino","log"];
function outcome(state: Test) {
 if(state==="SINCRONO") return "Proiezione, suono e luce sincronizzati";
 if(state==="RITARDO") return "La proiezione parte in ritardo";
 if(state==="INSTABILE") return "Il comando manuale non è ripetibile";
 return "La prossima prova non è ancora iniziata";
}

export function MuseoZeroEscapeRoom() {
 const [started,setStarted] = useState(false);
 const [place,setPlace] = useState<Place>("sala");
 const [selected,setSelected] = useState<string | null>(null);
 const [found,setFound] = useState<string[]>([]);
 const [pinned,setPinned] = useState<string[]>([]);
 const [source,setSource] = useState<Source>("A");
 const [result,setResult] = useState<Test>("ATTESA");
 const [tried,setTried] = useState<Source[]>([]);
 const [board,setBoard] = useState(false);
 const [mode,setMode] = useState<Mode>("collegamenti");
 const [solved,setSolved] = useState(false);
 const [message,setMessage] = useState("La prova generale è fallita. Il museo apre domani.");
 const here = places.find(item=>item.id===place)!;
 const chosen=traces.find(item=>item.id===selected);
 const gathered=traces.filter(item=>pinned.includes(item.id));
 const cause=pinned.includes("trigger") && pinned.includes("sensore");
 const eligible=cause && result==="SINCRONO" && tried.includes("A");

 function inspect(item:Trace) {
  setSelected(item.id);
  setFound(current=>current.includes(item.id)?current:[...current,item.id]);
  setMessage("Hai trovato una traccia: "+item.label+".");
 }
 function move(next:Place) {
  setPlace(next);setSelected(null);setBoard(false);setMessage("Sei in "+places.find(item=>item.id===next)!.label+".");
 }
 function pin(id:string) {setPinned(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);}
 function simulate(){
  setTried(current=>current.includes(source)?current:[...current,source]);
  const next:Test=source==="B"?"SINCRONO":source==="A"?"RITARDO":"INSTABILE";
  setResult(next);
  setMessage(next==="SINCRONO"?"La parete reagisce al passaggio. Tutto torna in sequenza.":next==="RITARDO"?"Lia è già passata quando la parete si illumina.":"Teo può far partire tutto a mano, ma ogni prova ha un tempo diverso.");
 }
 function restart(){
  setStarted(false);setPlace("sala");setSelected(null);setFound([]);setPinned([]);
  setSource("A");setResult("ATTESA");setTried([]);setBoard(false);setMode("collegamenti");
  setSolved(false);setMessage("La prova generale è fallita. Il museo apre domani.");
 }
 return <main className="zero">
  <header className="zero-header">
   <div><small>STUDIO ATLAS</small><strong>MUSEO ZERO</strong></div>
   <span>Anteprima di prodotto · Nessun dato personale</span>
   {started?<button type="button" onClick={restart} className="zero-plain">Ricomincia</button>:null}
  </header>
  {!started?
   <section className="zero-opening">
    <div className="zero-opening__light" aria-hidden="true"/>
    <div className="zero-opening__copy">
     <span className="zero-overline">Una sera prima dell'apertura</span>
     <h1>La sala<br/><em>che non torna.</em></h1>
     <p>La parete si illumina quando Lia è già dall'altra parte. Il suono arriva ancora dopo. Nessuno capisce perché.</p>
     <blockquote>Teo: «No. Ancora. Ieri funzionava.»</blockquote>
     <button className="zero-primary" type="button" onClick={()=>setStarted(true)}>Entra nel museo <span aria-hidden="true">↗</span></button>
     <small>Non è un questionario: esplora, collega le tracce e prova la tua soluzione.</small>
    </div>
    <span className="zero-opening__watermark" aria-hidden="true">00</span>
   </section>
   :<>
    <nav className="zero-map" aria-label="Luoghi del museo">
     {places.map((entry,i)=><button type="button" key={entry.id} onClick={()=>move(entry.id)}
      aria-current={entry.id===place?"location":undefined} className={entry.id===place?"is-current":""}>
      <span>0{i+1}</span>{entry.label}</button>)}
    </nav>
    <div className="zero-layout">
     <section className="zero-world" aria-label="Esplorazione del museo">
      <div className="zero-room" data-place={place} data-outcome={result}>
       <div className="zero-architecture" aria-hidden="true"><div className="zero-screen">{place==="regia"?"CUE / 01":place==="laboratorio"?"LAB / 02":place==="ingresso"?"ENTRATA":"SALA ZERO"}</div></div>
       <div className="zero-room__intro"><span className="zero-overline">MUSEO ZERO / {here.label}</span><h1>{here.heading}</h1><p>{here.description}</p></div>
       {traces.filter(item=>item.place===place).map((item,i)=><button type="button" key={item.id}
        className={"zero-hotspot"+(found.includes(item.id)?" is-seen":"")}
        style={{left:item.x+"%",top:item.y+"%"}} aria-label={"Esamina "+item.label}
        onClick={()=>inspect(item)}>
        <span className="zero-hotspot__point">{i+1}</span><span className="zero-hotspot__name">{item.label}</span>
       </button>)}
       <div className="zero-room__status" role="status"><i data-ok={result==="SINCRONO"}/>{outcome(result)}</div>
      </div>
      <div className="zero-character"><span className="zero-character__avatar" aria-hidden="true">{here.who.slice(0,1)}</span><div><strong>{here.who}</strong><p>«{here.says}»</p></div></div>
      <div className="zero-info" aria-live="polite"><p>{message}</p><button type="button" className="zero-secondary" onClick={()=>setBoard(!board)} aria-expanded={board}>{board?"Chiudi il banco":"Apri il banco degli indizi"} <b>{pinned.length}</b></button></div>
      {chosen&&!board?<div className="zero-detail" aria-label="Indizio esaminato"><div><small>{chosen.time} · TRACCIA</small><h2>{chosen.label}</h2><p>{chosen.detail}</p></div>
       <button type="button" className="zero-primary" onClick={()=>pin(chosen.id)} aria-pressed={pinned.includes(chosen.id)}>{pinned.includes(chosen.id)?"Togli dal banco":"Porta sul banco"}</button>
      </div>:null}
      {board?<div className="zero-board"><div className="zero-board__head"><div><span className="zero-overline">Il tuo banco</span><h2>Metti insieme le tracce</h2></div><small>{pinned.length} indizi</small></div>
       <div role="group" className="zero-board__tools" aria-label="Strumenti del banco">
        {([["cronologia","Metti in fila"],["collegamenti","Collega i segnali"],["confronto","Confronta le soluzioni"]] as const).map(([key,label])=><button key={key} type="button" aria-pressed={mode===key} onClick={()=>setMode(key)}>{label}</button>)}
       </div>
       {gathered.length===0?<p>Esamina gli oggetti e porta sul banco le tracce utili.</p>:
        <div className="zero-board__content">
         {mode==="cronologia"?[...gathered].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id)).map(item=><article key={item.id}><small>{item.time}</small><b>{item.label}</b><p>{item.detail}</p></article>):
         mode==="collegamenti"?<><article><small>INGRESSO</small><b>Sensore fisico B</b></article><span aria-hidden="true">→</span><article><small>REGIA</small><b>Segnale ascoltato A</b></article><p className="zero-board__message">{cause?"Le tracce mostrano un disallineamento: il sensore fisico è B, ma la regia ascolta A.":"Trova l'etichetta del sensore in laboratorio e il segnale configurato in regia: solo così il confronto è dimostrato."}</p></>:
         <><article><b>Tornare al vecchio percorso</b><p>Il passaggio tornerebbe meno accessibile.</p></article><article><b>Comando manuale</b><p>Il tempo cambierebbe da una prova all'altra.</p></article><article><b>Configurare B</b><p>Conserva il nuovo ingresso. Serve una prova simulata.</p></article></>}
        </div>}
       <div className="zero-board__pins">{gathered.map(item=><button type="button" key={item.id} onClick={()=>pin(item.id)}>{item.label} <span aria-hidden="true">×</span></button>)}</div>
      </div>:null}
     </section>
     <aside className="zero-control">
      <span className="zero-overline">CABINA / SIMULAZIONE</span><h2>Fai reagire la sala.</h2>
      <p>Prova quale segnale deve avviare la proiezione. La simulazione non modifica alcun impianto reale.</p>
      <div role="group" aria-label="Segnale della simulazione" className="zero-options">
       {([["A","Sensore A"],["B","Sensore B"],["MANUALE","Comando manuale"]] as const).map(([key,label])=><button type="button" key={key} aria-pressed={source===key} onClick={()=>{setSource(key);setResult("ATTESA");}}>{label}</button>)}
      </div>
      <button type="button" className="zero-primary zero-control__go" onClick={simulate}>Avvia prova nella sala <span aria-hidden="true">↗</span></button>
      <div className="zero-readout" aria-live="polite"><small>RISULTATO</small><strong>{outcome(result)}</strong><div className="zero-readout__rail" data-result={result}><span>Ingresso</span><span>Proiezione</span><span>Suono</span><span>Uscita</span></div>
       <p>{result==="SINCRONO"?"Il visitatore entra: la parete reagisce, poi il suono e la luce arrivano al momento giusto.":result==="RITARDO"?"La sequenza parte soltanto presso la vecchia zona di ingresso.":result==="INSTABILE"?"Teo avvia i segnali a mano, ma i tempi non sono stabili.":"La stanza attende il prossimo passaggio."}</p>
      </div>
      <div className="zero-restore"><span className="zero-overline">La scelta del team</span><p>{cause?"Hai ricostruito quale collegamento provoca il ritardo.":"Confronta il sensore B nel laboratorio e la configurazione A in cabina."}</p><button className="zero-primary" type="button" disabled={!eligible} onClick={()=>setSolved(true)}>Conferma la soluzione</button>
       {!eligible?<small>Servono le prove del sensore B e del comando A, poi confronta una simulazione con A e una con B.</small>:null}
      </div>
     </aside>
    </div>
    {solved?<div className="zero-end__backdrop"><section className="zero-end" role="dialog" aria-modal="true" aria-labelledby="zero-end-title">
      <span className="zero-overline">MUSEO ZERO / PROVA GENERALE</span><div aria-hidden="true" className="zero-end__star">✦</div><h2 id="zero-end-title">Sala pronta.</h2>
      <p>Il visitatore attraversa il nuovo ingresso. La proiezione parte subito. Suono e luce seguono la sequenza. La sala è pronta per la prossima prova.</p>
      <blockquote>Omar: «Il sensore funzionava. Era il collegamento.»</blockquote><div className="zero-end__badge"><strong>Traccia del percorso</strong><p>Hai ricostruito le prove e verificato la causa del ritardo.</p></div>
      <small>Riconoscimento solo in questa sessione. Nessun profilo e nessuna graduatoria.</small>
      <button type="button" className="zero-primary" onClick={restart}>Rigioca l'indagine</button>
     </section></div>:null}
   </>}
  <footer className="zero-footer"><span>Studio Atlas · Museo Zero</span><span>Prototipo in revisione · Non autorizzato agli studenti</span></footer>
 </main>;
}
