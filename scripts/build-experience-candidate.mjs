import { validateExperienceDefinition } from "./lib/experience-contracts.mjs";

export function buildExperienceCandidate(seed) {
  if (seed?.schemaVersion !== "atlas.experience.seed/v1") throw new Error("invalid experience seed schemaVersion");
  const required = ["experienceId","version","mode","kernelRef","qualificationProfileId","statePolicy","entryNodeId"];
  for (const key of required) if (typeof seed[key] !== "string" || !seed[key].trim()) throw new Error(`missing ${key}`);
  if (!Array.isArray(seed.presentationGrammarIds) || seed.presentationGrammarIds.length === 0) throw new Error("missing presentationGrammarIds");
  if (!Array.isArray(seed.scenes) || seed.scenes.length === 0) throw new Error("missing scenes");

  const candidate = {
    schemaVersion: "atlas.experience/v1",
    experienceId: seed.experienceId,
    version: seed.version,
    mode: seed.mode,
    kernelRef: seed.kernelRef,
    qualificationProfileId: seed.qualificationProfileId,
    runtime: {
      statePolicy: seed.statePolicy,
      learnerIdentityRequired: false,
      telemetryAllowed: false,
    },
    presentationGrammarIds: [...seed.presentationGrammarIds],
    ...(seed.presentationData ? { presentationData: structuredClone(seed.presentationData) } : {}),
    graph: {
      entryNodeId: seed.entryNodeId,
      nodes: seed.scenes.map((scene) => ({
        id: scene.id,
        primitive: scene.primitive,
        interaction: scene.interaction,
        feedbackCategory: scene.feedbackCategory,
        ...(scene.contentRef ? { contentRef: structuredClone(scene.contentRef) } : {}),
        ...(scene.title ? { title: scene.title } : {}),
        ...(Array.isArray(scene.facts) ? { facts: structuredClone(scene.facts) } : {}),
        ...(scene.prompt ? { prompt: scene.prompt } : {}),
        ...(scene.terminal === true ? { terminal: true } : {}),
        transitions: (scene.transitions ?? []).map((transition) => ({ ...transition })),
      })),
    },
  };
  const validation = validateExperienceDefinition(candidate);
  if (!validation.valid) throw new Error(`invalid experience candidate: ${validation.errors.join(", ")}`);
  return candidate;
}
