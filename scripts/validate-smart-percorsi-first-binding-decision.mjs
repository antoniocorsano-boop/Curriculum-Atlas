import fs from "node:fs";

const fail=(m)=>{console.error(m);process.exit(1);};
const decision=JSON.parse(fs.readFileSync("governance/smart-percorsi-first-binding-decision.json","utf8"));
const registry=JSON.parse(fs.readFileSync("governance/smart-percorsi-binding-registry.json","utf8"));
const material=JSON.parse(fs.readFileSync("content/smart-activities/sistema-tecnologico/material-set.v2.json","utf8"));

if(decision.schemaVersion!=="atlas.smart.percorsi-first-binding-decision/v1") fail("invalid decision schemaVersion");
if(decision.status!=="BLOCKED_NO_GOVERNED_PATHWAY_TARGET") fail("first binding must remain blocked in this tranche");
if(decision.bindingRegistrationAuthorized!==false||decision.runtimeAuthorized!==false) fail("binding/runtime authorization must remain false");
if(decision.smartCandidate.activityId!==material.activityId||decision.smartCandidate.materialSetId!==material.materialSetId||decision.smartCandidate.materialSetVersion!==material.version) fail("Smart candidate identity mismatch");
if(!Array.isArray(registry.bindings)||registry.bindings.some(x=>x.status==="ACTIVE")) fail("canonical registry must contain zero active bindings");
if(!Array.isArray(decision.evaluatedExistingPathways)||decision.evaluatedExistingPathways.length===0) fail("existing pathway assessment missing");
for(const p of decision.evaluatedExistingPathways){
  if(p.decision!=="NOT_BOUND"||p.reasonCode!=="NO_GOVERNED_ASSOCIATION_EVIDENCE") fail("existing pathway cannot be implicitly bound");
}
const required=[
"GOVERNED_TARGET_PATHWAY_ID",
"PATHWAY_DOSSIER_OR_IMPLEMENTATION_SPEC_REF",
"EXPLICIT_HUMAN_PROMOTION_OR_ASSOCIATION_DECISION",
"SMART_MATERIAL_REUSE_PLAN",
"COMPLETE_PERCORSI_CANDIDATE_IDENTITY",
"AUTHORITY_EVIDENCE"
];
if(required.some(x=>!decision.nextRequiredEvidence.includes(x))) fail("required unlock evidence incomplete");

console.log("SMART-PERCORSI-FIRST-BINDING-DECISION-01: PASS — binding remains fail-closed");
