const MODES = new Set(["SMART", "PATHWAY"]);
export const EXPERIENCE_PRIMITIVES = Object.freeze([
  "EXPLORE", "CHOOSE", "CONNECT", "BUILD", "INVESTIGATE", "REFRAME", "TRANSFER",
]);
export const FEEDBACK_CATEGORIES = Object.freeze([
  "EVIDENCE_SUPPORTED",
  "EVIDENCE_INCOMPLETE",
  "DECISION_PREMATURE",
  "ALTERNATIVE_PLAUSIBLE",
  "MODEL_NEEDS_REVISION",
  "TRANSFER_SUCCESSFUL",
]);
const PRIMITIVES = new Set(EXPERIENCE_PRIMITIVES);
const FEEDBACK = new Set(FEEDBACK_CATEGORIES);
const STATE_POLICIES = new Set(["VOLATILE_MEMORY", "LOCAL_DEVICE"]);

const result = (errors) => ({ valid: errors.length === 0, errors });

export function validateChallengeKernel(value) {
  const errors = [];
  if (value?.schemaVersion !== "atlas.challenge-kernel/v1") errors.push("schemaVersion");
  for (const key of ["kernelId", "title", "situation", "generativeQuestion", "transferPrinciple"]) {
    if (typeof value?.[key] !== "string" || value[key].trim() === "") errors.push(key);
  }
  for (const key of ["competenceTargets", "completionEvidence", "provenanceRefs"]) {
    if (!Array.isArray(value?.[key]) || value[key].length === 0) errors.push(key);
  }
  if (!value?.evidenceModel || typeof value.evidenceModel !== "object") errors.push("evidenceModel");
  if (!value?.decisionModel || typeof value.decisionModel !== "object") errors.push("decisionModel");
  return result(errors);
}

export function validateExperienceGraph(graph, { mode } = {}) {
  const errors = [];
  const nodes = Array.isArray(graph?.nodes) ? graph.nodes : [];
  const ids = new Set(nodes.map((node) => node?.id).filter(Boolean));
  if (!graph?.entryNodeId || !ids.has(graph.entryNodeId)) errors.push("entryNodeId");
  if (ids.size !== nodes.length) errors.push("nodeIds");
  for (const node of nodes) {
    if (!PRIMITIVES.has(node?.primitive)) errors.push(`primitive:${node?.id ?? "unknown"}`);
    if (!FEEDBACK.has(node?.feedbackCategory)) errors.push(`feedbackCategory:${node?.id ?? "unknown"}`);
    for (const transition of node?.transitions ?? []) {
      if (!ids.has(transition?.targetNodeId)) errors.push(`target:${transition?.targetNodeId ?? "missing"}`);
    }
    if (node?.terminal === true && (node?.transitions?.length ?? 0) > 0) errors.push(`terminalTransitions:${node.id}`);
  }
  if (mode === "PATHWAY" && !nodes.some((node) => node.primitive === "TRANSFER")) errors.push("pathwayTransfer");
  return result(errors);
}

export function validateExperienceDefinition(value) {
  const errors = [];
  if (value?.schemaVersion !== "atlas.experience/v1") errors.push("schemaVersion");
  if (!value?.experienceId) errors.push("experienceId");
  if (!value?.version) errors.push("version");
  if (!MODES.has(value?.mode)) errors.push("mode");
  if (!value?.kernelRef) errors.push("kernelRef");
  if (!value?.qualificationProfileId) errors.push("qualificationProfileId");
  if (!STATE_POLICIES.has(value?.runtime?.statePolicy)) errors.push("statePolicy");
  if (value?.runtime?.learnerIdentityRequired !== false) errors.push("learnerIdentityRequired");
  if (value?.runtime?.telemetryAllowed !== false) errors.push("telemetryAllowed");
  if (!Array.isArray(value?.presentationGrammarIds) || value.presentationGrammarIds.length === 0) errors.push("presentationGrammarIds");
  const graph = validateExperienceGraph(value?.graph, { mode: value?.mode });
  errors.push(...graph.errors);
  return result(errors);
}
