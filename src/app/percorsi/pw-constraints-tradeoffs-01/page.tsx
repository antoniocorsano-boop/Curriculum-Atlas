import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import type { ExperienceDefinition } from "@/features/experiences/model";
import governedDefinition from "../../../../content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json";

export default function ConstraintsTradeoffsPathwayPage() {
  return (
    <PathwayRuntimeSurface
      definition={governedDefinition as unknown as ExperienceDefinition}
      title="Una soluzione, molti vincoli"
      description="Esplora i vincoli, confronta i compromessi e rivedi la soluzione quando cambia un requisito."
    />
  );
}
