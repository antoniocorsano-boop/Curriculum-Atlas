"use client";

import { ExperienceRuntime } from "@/features/experiences/experience-runtime";
import type { ExperienceDefinition } from "@/features/experiences/model";
import definitionJson from "../../../../content/experiences/smart/fonte-digitale.v1.json";
import "./fonte-digitale.css";

const definition = definitionJson as ExperienceDefinition;

export default function FonteDigitalePage() {
  return (
    <main className="fonteDigitale">
      <header className="fonteDigitale__header">
        <span>Atlas · attività smart</span>
        <h1>Una fonte digitale è affidabile?</h1>
        <p>Raccogli indizi, rivedi il giudizio e trasferisci il metodo a una seconda fonte.</p>
        <small>Nessun account · nessuna risposta inviata · stato solo su questo dispositivo</small>
      </header>
      <ExperienceRuntime definition={definition} />
    </main>
  );
}
