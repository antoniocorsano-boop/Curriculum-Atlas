"use client";

import { useMemo, useState } from "react";
import { pathwayScenes, type PresentationCondition } from "./model";
import "./pathway.css";

export function MissingInformationPathwayPrototype() {
  const [condition, setCondition] = useState<PresentationCondition>("L");
  const [sceneIndex, setSceneIndex] = useState(0);
  const [selection, setSelection] = useState<string | null>(null);

  const scene = pathwayScenes[sceneIndex];
  const progress = useMemo(() => `${sceneIndex + 1} di ${pathwayScenes.length}`, [sceneIndex]);
  const feedback = selection ? scene.feedback[selection] : null;

  function choose(id: string) {
    setSelection(id);
  }

  function next() {
    if (!selection) return;
    if (sceneIndex < pathwayScenes.length - 1) {
      setSceneIndex((value) => value + 1);
      setSelection(null);
    }
  }

  function restart() {
    setSceneIndex(0);
    setSelection(null);
  }

  return (
    <section className={`pathwayPrototype pathwayPrototype--${condition.toLowerCase()}`} aria-labelledby="pathway-title">
      <header className="pathwayPrototype__header">
        <div>
          <p className="pathwayPrototype__eyebrow">Prototipo controllato · Percorsi G1</p>
          <h1 id="pathway-title">Prima di decidere, cosa manca?</h1>
          <p>Allenati a riconoscere quali informazioni servono prima di una scelta. Le risposte restano soltanto in questa sessione.</p>
        </div>
        <div className="pathwayPrototype__status" aria-label="Stato del prototipo">
          <strong>NON AUTORIZZATO ALL'USO CON STUDENTI</strong>
          <span>Validazione umana e accessibilità ancora necessarie</span>
        </div>
      </header>

      <fieldset className="pathwayPrototype__condition">
        <legend>Condizione di prova</legend>
        <label><input type="radio" name="condition" value="L" checked={condition === "L"} onChange={() => setCondition("L")} /> Letterale</label>
        <label><input type="radio" name="condition" value="N" checked={condition === "N"} onChange={() => setCondition("N")} /> Narrativa</label>
      </fieldset>

      <div className="pathwayPrototype__progress" aria-label={`Tappa ${progress}`}>
        <span>Tappa {progress}</span><progress value={sceneIndex + 1} max={pathwayScenes.length} />
      </div>

      <article className="pathwayScene">
        {condition === "N" ? (
          <div className="pathwayJourney" aria-hidden="true">
            <span className="pathwayJourney__start">Partenza</span>
            <span className="pathwayJourney__line" />
            <span className="pathwayJourney__point">{sceneIndex + 1}</span>
            <span className="pathwayJourney__line" />
            <span className="pathwayJourney__end">Esplora</span>
          </div>
        ) : null}

        <p className="pathwayScene__step">{scene.id}</p>
        <h2>{scene.title}</h2>
        <div className="pathwayScene__facts" aria-label="Fatti disponibili">
          <h3>Quello che sappiamo</h3>
          <ul>{scene.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
        <h3 className="pathwayScene__prompt">{scene.prompt}</h3>
        <div className="pathwayScene__options" role="group" aria-label="Possibili scelte">
          {scene.options.map((option) => (
            <button key={option.id} type="button" className={selection === option.id ? "is-selected" : ""} aria-pressed={selection === option.id} onClick={() => choose(option.id)}>
              {option.label}
            </button>
          ))}
        </div>

        <div className="pathwayScene__feedback" aria-live="polite">
          {feedback ? <><h3>Che cosa possiamo osservare</h3><p>{feedback}</p></> : <p>Scegli un'opzione per osservare che cosa rende disponibile.</p>}
        </div>

        <div className="pathwayScene__actions">
          <button type="button" className="pathwayButton pathwayButton--secondary" onClick={restart}>Ricomincia</button>
          {sceneIndex < pathwayScenes.length - 1 ? (
            <button type="button" className="pathwayButton" disabled={!selection} onClick={next}>Continua</button>
          ) : (
            <button type="button" className="pathwayButton" disabled={!selection} onClick={restart}>Termina la prova</button>
          )}
        </div>
      </article>

      <aside className="pathwayPrototype__privacy" aria-label="Informazioni sui dati">
        <strong>Nessun profilo dello studente.</strong> Nessun nome, testo libero, analitica individuale o risposta viene inviata a un server da questo componente.
      </aside>
    </section>
  );
}
