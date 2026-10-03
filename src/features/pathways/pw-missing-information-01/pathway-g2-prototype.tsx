"use client";

import { useState } from "react";
import { ExperienceRuntime } from "@/features/experiences/experience-runtime";
import type { ExperienceDefinition, ExperiencePresentation } from "@/features/experiences/model";
import governedDefinition from "../../../../content/experiences/pathways/pw-missing-information-01.v1.json";
import "./pathway.css";

type Grammar = "L" | "N";
type GovernedDefinition = ExperienceDefinition & {
  presentationData: Record<Grammar, ExperiencePresentation>;
};

const definition = governedDefinition as unknown as GovernedDefinition;

export function MissingInformationPathwayG2Prototype() {
  const [grammar, setGrammar] = useState<Grammar>("L");

  return (
    <main className={`pathwayPrototype pathwayPrototype--${grammar.toLowerCase()}`}>
      <header className="pathwayPrototype__header">
        <div>
          <p className="pathwayPrototype__eyebrow">Percorsi · prototipo G2</p>
          <h1>Prima di decidere, cosa manca?</h1>
          <p>Un percorso per allenare una strategia: riconoscere l’informazione pertinente che manca prima di scegliere.</p>
        </div>
        <div className="pathwayPrototype__status">
          <strong>PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI</strong>
          <span>Nessun punteggio, profilo o analitica.</span>
        </div>
      </header>

      <fieldset className="pathwayPrototype__condition">
        <legend>Modo di presentazione</legend>
        <label>
          <input type="radio" name="grammar" checked={grammar === "L"} onChange={() => setGrammar("L")} />
          {" "}Letterale
        </label>
        <label>
          <input type="radio" name="grammar" checked={grammar === "N"} onChange={() => setGrammar("N")} />
          {" "}Narrativo
        </label>
      </fieldset>

      <ExperienceRuntime definition={definition} presentation={definition.presentationData[grammar]} />

      <details className="pathwayPrototype__privacy">
        <summary><strong>Privacy del prototipo</strong></summary>
        <p>Le scelte restano nella memoria volatile di questa pagina: questo componente non invia risposte, non crea profili e non conserva una cronologia locale dello studente.</p>
      </details>
    </main>
  );
}
