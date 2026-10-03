import type { LocalGrowthAchievement } from "../local-growth-panel";

export const constraintsTradeoffsGrowthAchievements: LocalGrowthAchievement[] = [
  {
    id: "explicit-design-tradeoff",
    label: "Rendo esplicito un compromesso di progetto",
    stage: "BEGINNING_TO_RECOGNISE",
    triggerNodeId: "C3A_TRADEOFF",
    triggerTransitionId: "explicit-durable"
  },
  {
    id: "explicit-design-tradeoff",
    label: "Rendo esplicito un compromesso di progetto",
    stage: "BEGINNING_TO_RECOGNISE",
    triggerNodeId: "C3B_TRADEOFF",
    triggerTransitionId: "explicit-economical"
  },
  {
    id: "revise-changed-requirement",
    label: "Rivedo una soluzione quando cambia un requisito",
    stage: "CHOOSES_WHEN_TO_USE",
    triggerNodeId: "C5A_REFRAME",
    triggerTransitionId: "revise-durable"
  },
  {
    id: "revise-changed-requirement",
    label: "Rivedo una soluzione quando cambia un requisito",
    stage: "CHOOSES_WHEN_TO_USE",
    triggerNodeId: "C5B_REFRAME",
    triggerTransitionId: "revise-economical"
  },
  {
    id: "transfer-design-method",
    label: "Trasferisco il metodo di progetto in una nuova situazione",
    stage: "TRANSFERS_TO_NEW_SITUATION",
    triggerNodeId: "C7_TRANSFER",
    triggerTransitionId: "transfer-method"
  }
];
