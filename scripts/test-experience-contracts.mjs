import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateChallengeKernel,
  validateExperienceDefinition,
  validateExperienceGraph,
  FEEDBACK_CATEGORIES,
} from "./lib/experience-contracts.mjs";

const fixture = (name) =>
  JSON.parse(readFileSync(new URL(`../fixtures/experience-engine/contracts/${name}.json`, import.meta.url), "utf8"));

const kernel = fixture("valid/challenge-kernel");
const smart = fixture("valid/experience-smart");
const pathway = fixture("valid/experience-pathway");

assert.equal(validateChallengeKernel(kernel).valid, true);
assert.equal(validateExperienceDefinition(smart).valid, true);
assert.equal(validateExperienceDefinition(pathway).valid, true);
assert.equal(validateExperienceGraph(pathway.graph, { mode: "PATHWAY" }).valid, true);

assert.equal(kernel.schemaVersion, "atlas.challenge-kernel/v1");
assert.equal(smart.schemaVersion, "atlas.experience/v1");
assert.deepEqual(
  FEEDBACK_CATEGORIES,
  [
    "EVIDENCE_SUPPORTED",
    "EVIDENCE_INCOMPLETE",
    "DECISION_PREMATURE",
    "ALTERNATIVE_PLAUSIBLE",
    "MODEL_NEEDS_REVISION",
    "TRANSFER_SUCCESSFUL",
  ],
);

const badMode = structuredClone(smart);
badMode.mode = "QUIZ";
assert.equal(validateExperienceDefinition(badMode).valid, false);

const badPrimitive = structuredClone(smart);
badPrimitive.graph.nodes[0].primitive = "SCORE";
assert.equal(validateExperienceDefinition(badPrimitive).valid, false);

const badFeedback = structuredClone(smart);
badFeedback.graph.nodes[0].feedbackCategory = "RIGHT_ANSWER";
assert.equal(validateExperienceDefinition(badFeedback).valid, false);

const identity = structuredClone(smart);
identity.runtime.learnerIdentityRequired = true;
assert.equal(validateExperienceDefinition(identity).valid, false);

const telemetry = fixture("invalid/learner-telemetry");
assert.equal(validateExperienceDefinition(telemetry).valid, false);

const unknownTarget = fixture("invalid/unknown-target");
assert.equal(validateExperienceDefinition(unknownTarget).valid, false);

const noTransfer = structuredClone(pathway);
noTransfer.graph.nodes = noTransfer.graph.nodes.map((node) => ({ ...node, primitive: "CONNECT" }));
assert.equal(validateExperienceDefinition(noTransfer).valid, false);

assert.equal(validateExperienceDefinition(smart).valid, true, "SMART may be linear");

console.log("PASS experience contracts");
