export type ExperienceMode = "SMART" | "PATHWAY";
export type ExperiencePrimitive = "EXPLORE" | "CHOOSE" | "CONNECT" | "BUILD" | "INVESTIGATE" | "REFRAME" | "TRANSFER";
export type FeedbackCategory = "EVIDENCE_SUPPORTED" | "EVIDENCE_INCOMPLETE" | "DECISION_PREMATURE" | "ALTERNATIVE_PLAUSIBLE" | "MODEL_NEEDS_REVISION" | "TRANSFER_SUCCESSFUL";
export type RuntimeStatePolicy = "VOLATILE_MEMORY" | "LOCAL_DEVICE";

export interface ChallengeKernel {
  schemaVersion: "atlas.challenge-kernel/v1";
  kernelId: string;
  title: string;
  situation: string;
  generativeQuestion: string;
  competenceTargets: string[];
  evidenceModel: Record<string, unknown>;
  decisionModel: Record<string, unknown>;
  transferPrinciple: string;
  completionEvidence: string[];
  provenanceRefs: string[];
}

export type ExperienceWorldSignalState =
  | "OFF"
  | "READY"
  | "ACTIVE"
  | "DELAYED"
  | "MISMATCH"
  | "STABLE"
  | "MANUAL";

export interface ExperienceWorldSignal {
  id: string;
  label: string;
  state: ExperienceWorldSignalState;
  detail?: string;
}

export interface ExperienceWorldState {
  place: string;
  status: string;
  signals: ExperienceWorldSignal[];
}

export type ExperienceStageLocationPosition = "ENTRY" | "ROOM" | "CONTROL" | "LAB";
export type ExperienceStageEvidenceKind = "TRACE" | "OBJECT" | "PERSON" | "SYSTEM";
export type ExperienceWorkbenchMode = "TIMELINE" | "CONNECTIONS" | "COMPARE";

export interface ExperienceStageLocation {
  id: string;
  label: string;
  detail: string;
  position: ExperienceStageLocationPosition;
}

export interface ExperienceStageEvidence {
  id: string;
  label: string;
  detail: string;
  locationId: string;
  kind: ExperienceStageEvidenceKind;
  character?: string;
}

export interface ExperienceStage {
  visualMode: "CINEMATIC_EDITORIAL";
  focusLocationId?: string;
  locations?: ExperienceStageLocation[];
  evidence?: ExperienceStageEvidence[];
  characterBeat?: {
    name: string;
    role: string;
    line: string;
  };
  workbench?: {
    modes: ExperienceWorkbenchMode[];
    prompt: string;
    minEvidence: number;
    transitionMap?: Partial<Record<ExperienceWorkbenchMode, string>>;
  };
}

export interface ExperienceTransition {
  id?: string;
  targetNodeId: string;
  label?: string;
  feedback?: string;
  worldAfter?: ExperienceWorldState;
}

export interface ExperienceNode {
  id: string;
  primitive: ExperiencePrimitive;
  interaction: string;
  title?: string;
  prompt?: string;
  facts?: string[];
  world?: ExperienceWorldState;
  stage?: ExperienceStage;
  feedbackCategory: FeedbackCategory;
  transitions: ExperienceTransition[];
  terminal?: boolean;
}

export interface ExperiencePresentationTransition {
  label?: string;
  feedback?: string;
}

export interface ExperiencePresentationNode {
  title?: string;
  prompt?: string;
  facts?: string[];
  transitions?: Record<string, ExperiencePresentationTransition>;
}

export interface ExperiencePresentation {
  id: string;
  nodes: Record<string, ExperiencePresentationNode>;
}

export interface ExperienceDefinition {
  schemaVersion: "atlas.experience/v1";
  experienceId: string;
  version: string;
  mode: ExperienceMode;
  kernelRef: string;
  qualificationProfileId: string;
  runtime: { statePolicy: RuntimeStatePolicy; learnerIdentityRequired: false; telemetryAllowed: false };
  presentationGrammarIds: string[];
  presentationData?: Record<string, ExperiencePresentation>;
  graph: { entryNodeId: string; nodes: ExperienceNode[] };
}
