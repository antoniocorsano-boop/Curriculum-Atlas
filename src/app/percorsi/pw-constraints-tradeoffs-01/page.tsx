import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import type { ExperienceDefinition } from "@/features/experiences/model";
import governedDefinition from "../../../../content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json";
import { constraintsTradeoffsGrowthAchievements } from "@/features/pathways/pw-constraints-tradeoffs-01/growth";

export default function ConstraintsTradeoffsPathwayPage() {
  return (
    <PathwayRuntimeSurface
      definition={governedDefinition as unknown as ExperienceDefinition}
      title="Una soluzione, molti vincoli"
      description="Entra in un brief di progetto, rendi esplicito un compromesso, rivedi la soluzione quando cambia un requisito e trasferisci il metodo."
      growthAchievements={constraintsTradeoffsGrowthAchievements}
    />
  );
}
