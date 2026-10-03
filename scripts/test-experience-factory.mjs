import assert from "node:assert/strict";
import fs from "node:fs";
import { buildExperienceCandidate } from "./build-experience-candidate.mjs";

const seedA = {
 schemaVersion:"atlas.experience.seed/v1", experienceId:"synthetic-a", version:"1.0.0", mode:"SMART",
 kernelRef:"kernel-a", qualificationProfileId:"SMART_FAST_V1", statePolicy:"LOCAL_DEVICE",
 presentationGrammarIds:["sequential-visual-narrative"], entryNodeId:"a",
 scenes:[
  {id:"a",primitive:"EXPLORE",interaction:"text",feedbackCategory:"EVIDENCE_INCOMPLETE",transitions:[{targetNodeId:"b"}]},
  {id:"b",primitive:"CONNECT",interaction:"summary",feedbackCategory:"EVIDENCE_SUPPORTED",terminal:true,transitions:[]}
 ]
};
const seedB = {
 schemaVersion:"atlas.experience.seed/v1", experienceId:"synthetic-b", version:"1.0.0", mode:"PATHWAY",
 kernelRef:"kernel-b", qualificationProfileId:"PATHWAY_G2_PLUS_V1", statePolicy:"VOLATILE_MEMORY",
 presentationGrammarIds:["branching-consequences"], entryNodeId:"start",
 scenes:[
  {id:"start",primitive:"CHOOSE",interaction:"choice",feedbackCategory:"ALTERNATIVE_PLAUSIBLE",transitions:[{targetNodeId:"left"},{targetNodeId:"right"}]},
  {id:"left",primitive:"TRANSFER",interaction:"choice",feedbackCategory:"TRANSFER_SUCCESSFUL",transitions:[{targetNodeId:"right"}]},
  {id:"right",primitive:"REFRAME",interaction:"summary",feedbackCategory:"MODEL_NEEDS_REVISION",terminal:true,transitions:[]}
 ]
};

const a1=buildExperienceCandidate(seedA), a2=buildExperienceCandidate(seedA);
assert.deepEqual(a1,a2,"composer must be deterministic");
assert.deepEqual(a1.graph.nodes.map(n=>n.id),["a","b"]);
const b=buildExperienceCandidate(seedB);
assert.deepEqual(b.graph.nodes.map(n=>n.id),["start","left","right"]);
assert.equal(b.graph.nodes[0].transitions.length,2);

for (const path of ["scripts/build-experience-candidate.mjs","scripts/lib/experience-contracts.mjs"]) {
 const source=fs.readFileSync(path,"utf8");
 for (const forbidden of ["sistema-tecnologico","pw-missing-information-01","fonte-digitale","pw-constraints-tradeoffs-01"]) {
  assert.equal(source.includes(forbidden),false,`${path} contains special case ${forbidden}`);
 }
}
console.log("PASS experience factory");
