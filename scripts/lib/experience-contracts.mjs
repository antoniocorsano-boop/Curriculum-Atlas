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

function validatePresentationData(value) {
  const errors = [];
  if (value?.presentationData == null) return result(errors);
  if (typeof value.presentationData !== "object" || Array.isArray(value.presentationData)) {
    errors.push("presentationData");
    return result(errors);
  }

  const grammarIds = new Set(Array.isArray(value?.presentationGrammarIds) ? value.presentationGrammarIds : []);
  const graphNodes = Array.isArray(value?.graph?.nodes) ? value.graph.nodes : [];
  const graphById = new Map(graphNodes.map((node) => [node?.id, node]));

  for (const [grammarId, presentation] of Object.entries(value.presentationData)) {
    if (!grammarIds.has(grammarId)) errors.push(`presentationGrammar:${grammarId}`);
    if (!presentation || typeof presentation !== "object" || Array.isArray(presentation)) {
      errors.push(`presentation:${grammarId}`);
      continue;
    }
    if (presentation.id !== grammarId) errors.push(`presentationId:${grammarId}`);
    if (!presentation.nodes || typeof presentation.nodes !== "object" || Array.isArray(presentation.nodes)) {
      errors.push(`presentationNodes:${grammarId}`);
      continue;
    }

    for (const [nodeId, view] of Object.entries(presentation.nodes)) {
      const graphNode = graphById.get(nodeId);
      if (!graphNode) {
        errors.push(`presentationNode:${grammarId}:${nodeId}`);
        continue;
      }
      if (!view || typeof view !== "object" || Array.isArray(view)) {
        errors.push(`presentationView:${grammarId}:${nodeId}`);
        continue;
      }
      for (const key of ["title", "prompt"]) {
        if (key in view && typeof view[key] !== "string") errors.push(`presentationField:${grammarId}:${nodeId}:${key}`);
      }
      if ("facts" in view && (!Array.isArray(view.facts) || view.facts.some((fact) => typeof fact !== "string"))) {
        errors.push(`presentationFacts:${grammarId}:${nodeId}`);
      }
      if ("transitions" in view) {
        if (!view.transitions || typeof view.transitions !== "object" || Array.isArray(view.transitions)) {
          errors.push(`presentationTransitions:${grammarId}:${nodeId}`);
          continue;
        }
        const transitionKeys = new Set(
          (graphNode.transitions ?? []).map((transition, index) => transition?.id ?? `${nodeId}:${index}`),
        );
        for (const [transitionId, copy] of Object.entries(view.transitions)) {
          if (!transitionKeys.has(transitionId)) errors.push(`presentationTransition:${grammarId}:${nodeId}:${transitionId}`);
          if (!copy || typeof copy !== "object" || Array.isArray(copy)) {
            errors.push(`presentationTransitionView:${grammarId}:${nodeId}:${transitionId}`);
            continue;
          }
          for (const key of ["label", "feedback"]) {
            if (key in copy && typeof copy[key] !== "string") {
              errors.push(`presentationTransitionField:${grammarId}:${nodeId}:${transitionId}:${key}`);
            }
          }
        }
      }
    }
  }
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
  const presentations = validatePresentationData(value);
  errors.push(...presentations.errors);
  return result(errors);
}
