"use client";

import { useMemo, useState } from "react";
import { ExperienceRuntime } from "@/features/experiences/experience-runtime";
import type { ExperienceDefinition, ExperiencePresentation } from "@/features/experiences/model";
import "./pw-missing-information-01/pathway.css";

type DefinitionWithPresentations = ExperienceDefinition & {
  presentationData?: Record<string, ExperiencePresentation>;
};

export function PathwayRuntimeSurface({
  definition,
  title,
  description,
}: {
  definition: DefinitionWithPresentations;
  title: string;
  description: string;
}) {
  const availablePresentations = useMemo(
    () => definition.presentationGrammarIds.filter((id) => Boolean(definition.presentationData?.[id])),
    [definition],
  );
  const [presentationId, setPresentationId] = useState(availablePresentations[0] ?? "");
  const presentation = presentationId ? definition.presentationData?.[presentationId] : undefined;

  return (
    <main className="pathwayPrototype">
      <header className="pathwayPrototype__header">
        <div>
          <p className="pathwayPrototype__eyebrow">Atlas · Percorsi</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="pathwayPrototype__status">
          <strong>Sessione locale</strong>
          <span>Nessun account, punteggio, profilo o telemetria dello studente.</span>
        </div>
      </header>

      {availablePresentations.length > 1 && (
        <fieldset className="pathwayPrototype__condition">
          <legend>Modo di presentazione</legend>
          {availablePresentations.map((id) => (
            <label key={id}>
              <input
                type="radio"
                name="presentation-grammar"
                checked={presentationId === id}
                onChange={() => setPresentationId(id)}
              />
              {" "}{id === "L" ? "Letterale" : id === "N" ? "Narrativo" : id}
            </label>
          ))}
        </fieldset>
      )}

      <ExperienceRuntime definition={definition} presentation={presentation} />

      <details className="pathwayPrototype__privacy">
        <summary><strong>Privacy del percorso</strong></summary>
        <p>Le scelte restano nella memoria volatile della sessione. Il percorso non invia risposte, non crea profili e non conserva una cronologia dello studente.</p>
      </details>
    </main>
  );
}
