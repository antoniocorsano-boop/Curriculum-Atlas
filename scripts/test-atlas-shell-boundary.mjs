import assert from "node:assert/strict";
import fs from "node:fs";
import { buildExperienceCandidate } from "./build-experience-candidate.mjs";
import { validateExperienceDefinition } from "./lib/experience-contracts.mjs";
import { studioAtlasSnapshotToExperience } from "../src/features/pathways/studio-atlas-preview-adapter.ts";
import { loadPublicPathways } from "../src/features/pathways/load-public-pathways.ts";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const seed = read("fixtures/percorsi-factory/valid/constraints-tradeoffs.seed.json").experienceSeed;
const definition = buildExperienceCandidate(seed);
assert.deepEqual(definition, read("content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json"));
assert.equal(validateExperienceDefinition(definition).valid, true);
// A shell may select presentation data but must not own or rewrite semantic transitions.
const changed = structuredClone(seed);
const grammarId = changed.presentationGrammarIds[0];
const nodeId = changed.entryNodeId;
changed.presentationData ??= {};
changed.presentationData[grammarId] ??= { id: grammarId, nodes: {} };
changed.presentationData[grammarId].nodes[nodeId] ??= {};
changed.presentationData[grammarId].nodes[nodeId].title = "Synthetic visual label";
const alternate = buildExperienceCandidate(changed);
assert.deepEqual(alternate.graph, definition.graph);
assert.deepEqual(alternate.runtime, definition.runtime);
assert.equal(alternate.presentationData[grammarId].nodes[nodeId].title, "Synthetic visual label");
const bad = structuredClone(changed);
bad.presentationData[grammarId].nodes[nodeId].transitions = { "unregistered-transition": { label: "Invalid" } };
assert.throws(() => buildExperienceCandidate(bad), /presentationTransition/);
for (const fixture of ["minimal", "edutwin-orientation"]) {
  const snapshot = read("fixtures/studio-atlas-preview/valid/" + fixture + ".json");
  const original = structuredClone(snapshot);
  const preview = studioAtlasSnapshotToExperience(snapshot);
  assert.deepEqual(snapshot, original);
  assert.equal(validateExperienceDefinition(preview).valid, true);
  assert.equal(preview.runtime.statePolicy, "VOLATILE_MEMORY");
  assert.equal(preview.runtime.learnerIdentityRequired, false);
  assert.equal(preview.runtime.telemetryAllowed, false);
  for (const scene of snapshot.scenes.filter(scene => scene.interaction === "CHOICE")) {
    const node = preview.graph.nodes.find(node => node.id === scene.sceneId);
    assert.deepEqual(node.transitions.map(t => [t.id, t.targetNodeId]), scene.choices.map(c => [c.choiceId, c.targetSceneId]));
  }
  // A preview definition is not publication authority.
  assert.deepEqual(loadPublicPathways([{ pathwayId: preview.experienceId, title: snapshot.title, version: preview.version, provenanceRef: "SYNTHETIC", publicPath: "/percorsi/synthetic", availability: "ACTIVE", runtimeAuthorization: "NOT_RUNTIME_AUTHORIZED" }]), []);
  assert.throws(() => studioAtlasSnapshotToExperience({ ...snapshot, studentAuthorized: true }), /studentAuthorized/);
}
console.log("AXF R05: PASS — canonical builder, presentation invariance, Studio preview adapter, explicit catalog authority. No P1 shell mount or runtime integration claimed.");
