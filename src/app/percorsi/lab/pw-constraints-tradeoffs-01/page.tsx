import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import type { ExperienceDefinition } from "@/features/experiences/model";
import governedDefinition from "../../../../../content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json";

export const metadata = {
  title: "Percorsi · Una soluzione, molti vincoli · Anteprima Atlas",
  robots: { index: false, follow: false },
};

export default function ConstraintsTradeoffsPathwayLabPage() {
  return (
    <PathwayRuntimeSurface
      definition={governedDefinition as unknown as ExperienceDefinition}
      title="Una soluzione, molti vincoli"
      description="Anteprima di revisione: esplora i vincoli, confronta i compromessi e rivedi la soluzione quando cambia un requisito."
    />
  );
}
