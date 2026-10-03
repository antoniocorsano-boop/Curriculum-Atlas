import assert from "node:assert/strict";
import fs from "node:fs";

const cognitive = JSON.parse(fs.readFileSync("governance/experience-grammar-registry.json", "utf8"));
const presentation = JSON.parse(fs.readFileSync("governance/percorsi-grammar-registry.json", "utf8"));
const profiles = JSON.parse(fs.readFileSync("governance/experience-qualification-profiles.json", "utf8"));

const expected = ["EXPLORE","CHOOSE","CONNECT","BUILD","INVESTIGATE","REFRAME","TRANSFER"];
assert.deepEqual(cognitive.primitives.map((item) => item.id), expected);
assert.equal(new Set(cognitive.primitives.map((item) => item.id)).size, 7);
const presentationIds = new Set(presentation.grammars.map((item) => item.id));
assert.equal(expected.some((id) => presentationIds.has(id)), false);
assert.equal(presentation.kind, "PRESENTATION_GRAMMAR_REGISTRY");

assert.deepEqual(profiles.profiles.map((item) => item.id), ["SMART_FAST_V1","PATHWAY_G2_PLUS_V1"]);
const smart = profiles.profiles[0];
const pathway = profiles.profiles[1];
for (const requirement of ["ANONYMOUS_LOAD","NO_LEARNER_WRITE","MOBILE_DESKTOP","KEYBOARD","MATERIAL_VERIFICATION"]) {
  assert.ok(smart.requirements.includes(requirement), requirement);
}
for (const requirement of ["MEANINGFUL_BRANCHING","TRANSFER","PROVENANCE","ACCESSIBILITY_EVIDENCE","EXPLICIT_RUNTIME_AUTHORIZATION"]) {
  assert.ok(pathway.requirements.includes(requirement), requirement);
}
assert.equal("runtimeAuthorized" in smart, false);
assert.equal("runtimeAuthorized" in pathway, false);
console.log("PASS experience grammar registries");
