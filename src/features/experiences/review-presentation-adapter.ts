import type { ComponentType, Ref } from "react";
import type { ExperienceStageEvidence, ExperienceTransition, ExperienceWorkbenchMode, ExperienceWorldState } from "./model";

export type TrialPrediction = "delayed" | "stable" | "manual";
export type RuntimeTransition = ExperienceTransition & { key: string };

// Optional client-only presentation extension. The generic runtime never imports
// a concrete candidate, and the public route has no adapter to instantiate.
export type ReviewPresentationAdapter = {
  experienceId: string;
  openingScene: string;
  predictionScene: string;
  interviewScene: string;
  comparisonScene: string;
  extensionScene: string;
  missionHiddenScenes: readonly string[];
  Opening: ComponentType<{ title: string; headingRef: Ref<HTMLHeadingElement>; onContinue: () => void }>;
  Mission: ComponentType;
  Portrait: ComponentType<{ name: string; variant: "character" | "evidence" }>;
  RoomResponse: ComponentType<{ world?: ExperienceWorldState; sceneId: string; changed: boolean }>;
  Location: ComponentType<{ location: string; activeEvidenceId?: string; onAsk?: (id: string) => void }>;
  Workbench: ComponentType<{
    mode: ExperienceWorkbenchMode; sceneId: string; evidence: ExperienceStageEvidence[];
    connections: Array<{ from: string; to: string }>; connectionOrigin: string | null;
    transitions: RuntimeTransition[]; pendingKey: string | null;
    onReorder: (id: string, direction: -1 | 1) => void; onJoin: (id: string) => void;
    onChoose: (transition: RuntimeTransition) => void;
  }>;
  PredictionPanel: ComponentType<{
    value: TrialPrediction | ""; onChange: (value: TrialPrediction) => void;
    last: { prediction: TrialPrediction; observed: TrialPrediction } | null;
  }>;
  Extension: ComponentType;
  outcome: (world?: ExperienceWorldState) => TrialPrediction;
};
