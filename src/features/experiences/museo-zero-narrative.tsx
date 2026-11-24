"use client";
import { useState } from "react";
import "./museo-zero-narrative.css";
import scenes from "./museo-zero-prologue.generated.json";
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
