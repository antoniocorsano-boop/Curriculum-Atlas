import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import type { ExperienceDefinition, ExperiencePresentation } from "@/features/experiences/model";
import governedDefinition from "../../../../content/experiences/pathways/pw-missing-information-01.v1.json";
import { missingInformationGrowthAchievements } from "@/features/pathways/pw-missing-information-01/growth";

type GovernedDefinition = ExperienceDefinition & {
  presentationData?: Record<string, ExperiencePresentation>;
};

export default function MissingInformationPathwayPage() {
  return (
    <PathwayRuntimeSurface
      definition={governedDefinition as unknown as GovernedDefinition}
      title="Prima di decidere, cosa manca?"
      description="Riconosci l’informazione pertinente che manca, rivedi la strategia e trasferiscila in un nuovo contesto."
      growthAchievements={missingInformationGrowthAchievements}
    />
  );
}
