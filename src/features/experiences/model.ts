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

export interface ExperienceTransition { targetNodeId: string; label?: string }
export interface ExperienceNode {
  id: string;
  primitive: ExperiencePrimitive;
  interaction: string;
  feedbackCategory: FeedbackCategory;
  transitions: ExperienceTransition[];
  terminal?: boolean;
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
  graph: { entryNodeId: string; nodes: ExperienceNode[] };
}
