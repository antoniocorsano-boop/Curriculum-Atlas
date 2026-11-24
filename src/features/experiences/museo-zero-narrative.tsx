"use client";
import { useState } from "react";
import "./museo-zero-narrative.css";
const scenes = [
  {
    "image": "sala",
    "title": "Un museo da vivere",
    "speaker": "Narratore",
    "text": "Qui non si viene soltanto a guardare. Quando un visitatore entra, immagini, suoni e luci lo accompagnano lungo il percorso. Domani apre la mostra.",
    "alt": "Sala Zero, mostra interattiva in funzione"
  },
  {
    "image": "squadra",
    "title": "La squadra",
    "speaker": "Lia",
    "text": "Abbiamo cambiato l’ingresso per rendere la mostra accessibile a tutti. Prima di aprire, ci resta l’ultima prova.",
    "alt": "Lia, Omar e Teo al lavoro nella Sala Zero"
  },
  {
    "image": "omar",
    "title": "I dispositivi",
    "speaker": "Omar",
    "text": "Ho controllato i dispositivi. Il sensore rileva il passaggio. Teo, possiamo cominciare.",
    "alt": "Omar, responsabile dei dispositivi"
  },
  {
    "image": "teo",
    "title": "L’ultima prova",
    "speaker": "Teo",
    "text": "Lia, attraversa la soglia come farebbe un visitatore. Dalla regia controllerò quando partono immagini, suoni e luci.",
    "alt": "Teo, responsabile di regia e prove"
  },
  {
    "image": "regia",
    "title": "Qualcosa non torna",
    "speaker": "Teo",
    "text": "La risposta è arrivata troppo tardi. Eppure Omar ha verificato il sensore. Lia, che cosa è cambiato durante la giornata?",
    "alt": "Cabina di regia adiacente alla sala"
  },
  {
    "image": "lia",
    "title": "Il tuo incarico",
    "speaker": "Lia",
    "text": "Ognuno di noi ha visto una parte della storia. Aiutaci a capire perché la sala risponde in ritardo, mantenendo accessibile il nuovo ingresso. Comincia osservando l’ultima prova.",
    "alt": "Lia, responsabile del percorso accessibile"
  }
] as const;
const base = "/media/museo-zero/narrative-v1/";
export function museoZeroPortrait(name:string): string | null {
  const id=name.trim().toLowerCase();
  return id==="lia"||id==="omar"||id==="teo" ? base+id+".webp" : null;
}
export function MuseoZeroNarrative({onStart}: {onStart:()=>void}) {
  const [index,setIndex]=useState(0);
  const scene=scenes[index];
  return <section className="mz-narrative" aria-label="Prologo di Museo Zero" data-testid="mz-narrative">
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={base+scene.image+".webp"} alt={scene.alt} />
      <figcaption aria-live="polite"><small>{scene.speaker}</small><h2>{scene.title}</h2><p>{scene.text}</p></figcaption>
    </figure>
    <nav aria-label="Scene del racconto">
      <button type="button" disabled={index===0} onClick={()=>setIndex(i=>i-1)}>Indietro</button>
      <span aria-live="polite">{index+1} / {scenes.length}</span>
      <button type="button" className="mz-narrative__primary" onClick={()=>index===scenes.length-1?onStart():setIndex(i=>i+1)}>{index===scenes.length-1?"Osserva la prova":"Continua"}</button>
      {index<scenes.length-1&&<button type="button" onClick={()=>setIndex(scenes.length-1)}>Vai all’incarico</button>}
    </nav>
  </section>;
}
