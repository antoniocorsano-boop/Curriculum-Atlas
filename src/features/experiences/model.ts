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
