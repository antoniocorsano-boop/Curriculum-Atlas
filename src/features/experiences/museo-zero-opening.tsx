"use client";

import { useEffect, useState, type Ref } from "react";
import "./museo-zero-opening.css";
import { MuseoZeroNarrative } from "./museo-zero-narrative";

const states = [
  ["La sala è in attesa del visitatore.", "In attesa", "Pronto", "Spenta"],
  ["Il visitatore attraversa la soglia. Il sensore rileva il passaggio.", "Passaggio rilevato", "Attivo", "Spenta"],
  ["Il visitatore ha superato la soglia. La parete rimane spenta.", "Oltre la soglia", "Segnale rilevato", "In ritardo"],
  ["La proiezione si accende quando il visitatore è già oltre.", "Oltre la soglia", "Segnale rilevato", "Attiva in ritardo"],
] as const;
const inspections = {
  sensor: ["Sensore B", "Il sensore ha rilevato il passaggio. La prova non indica da sola un guasto del sensore."],
  control: ["Cabina di regia", "La regia riceve segnali e avvia la sequenza. Occorrono altri indizi per comprendere il ritardo."],
  projection: ["Parete di proiezione", "La risposta visiva arriva dopo il passaggio. Confronta il momento del rilevamento con quello dell’accensione."],
} as const;
type Inspection = keyof typeof inspections;
const points: Inspection[] = ["sensor", "control", "projection"];

// Orientamento del fruitore, derivato dalla situazione e dal traguardo canonici.
// Non introduce nuovi eventi, soluzioni o transizioni nella storia.
export const museoZeroMission = "Scopri perché la sala non reagisce al momento giusto e trova una soluzione che mantenga accessibile il nuovo ingresso.";

// Presentazione locale di MZ1: non contiene transizioni narrative, punteggi o persistenza.
// La progressione resta di ExperienceRuntime; il visitatore è provvisorio.
export function MuseoZeroOpening({title, headingRef, onContinue}: {
  title: string; headingRef: Ref<HTMLHeadingElement>; onContinue: () => void;
}) {
  const [narrativeComplete, setNarrativeComplete] = useState(false);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  useEffect(() => {
    if (!playing || step >= 3) return;
    const timer = window.setTimeout(() => {
      setStep(step + 1);
      if (step === 2) setPlaying(false);
    }, step === 0 ? 350 : step === 1 ? 1400 : 1700);
    return () => window.clearTimeout(timer);
  }, [playing, step]);
  useEffect(() => { if (narrativeComplete) document.getElementById("experience-heading")?.focus(); }, [narrativeComplete]);
  function reset() { setPlaying(false); setStep(0); setInspection(null); }
  function play() {
    if (playing) { setPlaying(false); return; }
    if (step === 3) { setStep(0); setInspection(null); }
    setPlaying(true);
  }
  const row = states[step];
  return (
    <section className="mz-opening" aria-labelledby="experience-heading" data-testid="museo-risposta-sala" data-outcome="delayed">
      <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>
      {!narrativeComplete ? <MuseoZeroNarrative onStart={() => setNarrativeComplete(true)} /> : <>
      <section className="mz-mission" aria-labelledby="mz-mission-heading" data-testid="museo-mission">
        <h2 id="mz-mission-heading">Il tuo incarico</h2>
        <p>Fai parte del gruppo che prepara Sala Zero per la prova generale del museo.</p>
        <p>Quando qualcuno entra, la sala dovrebbe reagire al suo passaggio. Durante l’ultima prova qualcosa non ha funzionato.</p>
        <p><strong>La tua missione:</strong> {museoZeroMission}</p>
        <p><strong>Da dove cominci:</strong> osserva il passaggio e la risposta della sala. Poi raccogli gli indizi e prova una soluzione.</p>
      </section>
      <div className="mz-opening__stage" data-testid="mz1-stage" data-state={step}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mz-opening__background" src="/media/museo-zero/sala-zero-r1.webp" alt="Sala Zero: ingresso accessibile, sensore B, cabina di regia e parete di proiezione." />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="mz-opening__visitor" src="/media/museo-zero/visitatore-r1.webp" alt="" aria-hidden="true" />
        <div className="mz-opening__sensor" aria-hidden="true" />
        <div className="mz-opening__projection" aria-hidden="true">
          <svg viewBox="0 0 400 220"><circle cx="200" cy="110" r="67" fill="#275b86" stroke="#8bd5ff" strokeWidth="2"/><g fill="none" stroke="#a2e8ff"><ellipse cx="200" cy="110" rx="107" ry="31" transform="rotate(-23 200 110)"/><ellipse cx="200" cy="110" rx="107" ry="31" transform="rotate(35 200 110)"/><ellipse cx="200" cy="110" rx="43" ry="67"/><path d="M133 110h134M200 43v134"/></g></svg>
        </div>
        <div className="mz-opening__halo" aria-hidden="true"/>
        {step === 3 && points.map((key, i) => <button key={key} type="button" className={"mz-opening__point mz-opening__point--" + key} aria-label={"Esamina: " + inspections[key][0]} aria-pressed={inspection === key} onClick={() => setInspection(key)}>{i+1}</button>)}
      </div>
      <div className="mz-opening__status"><p role="status" aria-live="polite">{row[0]}</p><span>{step+1} / 4</span></div>
      <div className="mz-opening__controls">
        <button type="button" className="mz-opening__primary" onClick={play}>{playing ? "Pausa" : step===3 ? "Ripeti la prova" : step===0 ? "Avvia la prova" : "Riprendi la prova"}</button>
        <button type="button" disabled={playing || step===3} onClick={() => setStep(current => Math.min(3,current+1))}>Passo successivo</button>
        <button type="button" onClick={reset}>Ricomincia prova</button>
      </div>
      <div className="mz-opening__signals" aria-label="Stato dei componenti">{["Ingresso","Sensore B","Proiezione"].map((label,i)=><div key={label}><small>{label}</small><strong>{row[i+1]}</strong></div>)}</div>
      {step===3 && <section className="mz-opening__inspection" aria-label="Ispezione della sala">
        <h2>{inspection ? inspections[inspection][0] : "Osserva l’anomalia"}</h2>
        <p aria-live="polite">{inspection ? inspections[inspection][1] : "Quali elementi non sono sincronizzati? Esamina la scena."}</p>
        <div className="mz-opening__controls">{points.map(key => <button type="button" key={key} aria-pressed={inspection===key} onClick={()=>setInspection(key)}>{inspections[key][0]}</button>)}</div>
        <p className="mz-opening__next"><strong>La prossima mossa:</strong> esplora i luoghi della sala e raccogli gli indizi per capire che cosa è successo.</p>
        <button type="button" className="mz-opening__primary" onClick={onContinue}>Raccogli gli indizi</button>
      </section>}
      <small className="mz-opening__notice">Simulazione 2.5D per revisione professionale; visitatore provvisorio, nessun impianto reale.</small>
      </> }
    </section>
  );
}
