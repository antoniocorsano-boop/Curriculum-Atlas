"use client";

import { useMemo, useState } from "react";
import { ExperienceRuntime } from "@/features/experiences/experience-runtime";
import type { ExperienceDefinition, ExperiencePresentation } from "@/features/experiences/model";
import { LocalGrowthPanel, useLocalPathwayGrowth, type LocalGrowthAchievement } from "./local-growth-panel";
import "./pw-missing-information-01/pathway.css";

type DefinitionWithPresentations = ExperienceDefinition & {
  presentationData?: Record<string, ExperiencePresentation>;
};

export function PathwayRuntimeSurface({
  definition,
  title,
  description,
  growthAchievements = [],
  reviewNotice,
}: {
  definition: DefinitionWithPresentations;
  title: string;
  description: string;
  growthAchievements?: LocalGrowthAchievement[];
  reviewNotice?: string;
}) {
  const availablePresentations = useMemo(
    () => definition.presentationGrammarIds.filter((id) => Boolean(definition.presentationData?.[id])),
    [definition],
  );
  const [presentationId, setPresentationId] = useState(availablePresentations[0] ?? "");
  const presentation = presentationId ? definition.presentationData?.[presentationId] : undefined;
  const growth = useLocalPathwayGrowth({
    pathwayId: definition.experienceId,
    pathwayVersion: definition.version,
    achievements: growthAchievements,
  });

  return (
    <main className="pathwayPrototype">
      <header className="pathwayPrototype__header">
        <div>
          <p className="pathwayPrototype__eyebrow">Atlas · Percorsi</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="pathwayPrototype__status">
          {reviewNotice ? <strong>{reviewNotice}</strong> : <strong>Sessione locale</strong>}
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

      {growth.ready && growthAchievements.length > 0 && (
        <LocalGrowthPanel
          enabled={growth.enabled}
          earned={growth.earnedHere}
          totalEarned={growth.totalEarned}
          onEnable={growth.enable}
          onReset={growth.reset}
          onExport={growth.exportRecord}
          notice={growth.notice}
        />
      )}

      <ExperienceRuntime definition={definition} presentation={presentation} onNodeVisit={growth.noteNode} />

      <details className="pathwayPrototype__privacy">
        <summary><strong>Privacy del percorso</strong></summary>
        <p>Le scelte del percorso restano nella memoria volatile della sessione e non vengono inviate ad Atlas. Solo se lo scegli, i traguardi didattici possono essere conservati localmente sul dispositivo; puoi esportarli o cancellarli in qualsiasi momento.</p>
      </details>
    </main>
  );
}
