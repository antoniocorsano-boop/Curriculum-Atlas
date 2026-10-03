import type { LocalGrowthAchievement } from "../local-growth-panel";

export const missingInformationGrowthAchievements: LocalGrowthAchievement[] = [
  {
    id: "recognise-missing-information-strategy",
    label: "Riconosco la strategia: cerco il dato pertinente che manca",
    stage: "BEGINNING_TO_RECOGNISE",
    triggerNodeId: "S6_NAME_STRATEGY"
  },
  {
    id: "choose-strategy-in-changed-context",
    label: "Riconosco quando la stessa strategia può servire in una situazione diversa",
    stage: "CHOOSES_WHEN_TO_USE",
    triggerNodeId: "S7_CHANGED_CONTEXT"
  },
  {
    id: "transfer-to-source-evaluation",
    label: "Trasferisco la strategia alla valutazione di informazioni e fonti",
    stage: "TRANSFERS_TO_NEW_SITUATION",
    triggerNodeId: "S8_TRANSFER_PROBE"
  }
];
