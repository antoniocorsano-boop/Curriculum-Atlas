import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import type { ExperienceDefinition, ExperiencePresentation } from "@/features/experiences/model";
import governedDefinition from "../../../../../content/experiences/pathways/pw-missing-information-01.v1.json";
import { missingInformationGrowthAchievements } from "@/features/pathways/pw-missing-information-01/growth";

type GovernedDefinition = ExperienceDefinition & {
  presentationData?: Record<string, ExperiencePresentation>;
};

export const metadata = {
  title: "Percorsi · Prima di decidere, cosa manca? · Anteprima Atlas",
  robots: { index: false, follow: false },
};

export default function MissingInformationPathwayLabPage() {
  return (
    <PathwayRuntimeSurface
      definition={governedDefinition as unknown as GovernedDefinition}
      title="Prima di decidere, cosa manca?"
      description="Osserva, scegli, rivedi e prova la stessa strategia in situazioni diverse. Questa è un’anteprima di prodotto, non un quiz."
      growthAchievements={missingInformationGrowthAchievements}
    />
  );
}
