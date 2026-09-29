import fs from "node:fs";
const fail=(m)=>{console.error(m);process.exit(1);};
const decision=JSON.parse(fs.readFileSync("governance/smart-percorsi-first-binding-decision.json","utf8"));
const registry=JSON.parse(fs.readFileSync("governance/smart-percorsi-binding-registry.json","utf8"));
const material=JSON.parse(fs.readFileSync("content/smart-activities/sistema-tecnologico/material-set.v2.json","utf8"));
const smartDoc=fs.readFileSync("docs/ATLAS-SMART-ACTIVITY-01.md","utf8");
const pathwayDoc=fs.readFileSync("docs/governance/ATLAS-PERCORSI-G1-BOUNDARY.md","utf8");

if(decision.schemaVersion!=="atlas.smart.percorsi-first-binding-decision/v1") fail("invalid decision schemaVersion");
if(decision.baseline!=="337761cc5219c54a3f3c3628e2c14ec20c49d3ae") fail("decision baseline drift");
if(decision.status!=="BLOCKED_NO_GOVERNED_PATHWAY_TARGET") fail("first binding must remain blocked");
if(decision.bindingRegistrationAuthorized!==false||decision.runtimeAuthorized!==false) fail("binding/runtime authorization must remain false");
if(decision.smartCandidate.activityId!==material.activityId||decision.smartCandidate.materialSetId!==material.materialSetId||decision.smartCandidate.materialSetVersion!==material.version) fail("Smart candidate identity mismatch");
if(material.publication?.eligibility!=="PUBLICATION_CANDIDATE") fail("Smart material is not a publication candidate");
if(!smartDoc.includes("SP-01 — Analizzare un sistema tecnologico")) fail("SP-01 source evidence missing");
if(!smartDoc.includes("decisione esplicita e nuova progettazione")) fail("Smart promotion governance evidence missing");
if(!Array.isArray(registry.bindings)||registry.bindings.length!==0) fail("canonical registry must remain completely empty in this tranche");
if(!Array.isArray(decision.evaluatedExistingPathways)||decision.evaluatedExistingPathways.length===0) fail("existing pathway assessment missing");
for(const p of decision.evaluatedExistingPathways){
  if(p.decision!=="NOT_BOUND"||p.reasonCode!=="NO_GOVERNED_ASSOCIATION_EVIDENCE") fail("existing pathway cannot be implicitly bound");
  if(p.pathwayId==="pw-missing-information-01" && (!pathwayDoc.includes("PW-MISSING-INFORMATION-01")||!pathwayDoc.includes("Prima di decidere, cosa manca?"))) fail("evaluated pathway source evidence mismatch");
}
for(const ref of decision.smartCandidate.sourceRefs) if(!fs.existsSync(ref)) fail("missing Smart sourceRef: "+ref);
for(const p of decision.evaluatedExistingPathways) if(!fs.existsSync(p.sourceRef)) fail("missing pathway sourceRef: "+p.sourceRef);
const required=["GOVERNED_TARGET_PATHWAY_ID","PATHWAY_DOSSIER_OR_IMPLEMENTATION_SPEC_REF","EXPLICIT_HUMAN_PROMOTION_OR_ASSOCIATION_DECISION","SMART_MATERIAL_REUSE_PLAN","COMPLETE_PERCORSI_CANDIDATE_IDENTITY","AUTHORITY_EVIDENCE"];
if(required.some(x=>!decision.nextRequiredEvidence.includes(x))||decision.nextRequiredEvidence.length!==required.length) fail("required unlock evidence incomplete or expanded");
console.log("SMART-PERCORSI-FIRST-BINDING-DECISION-01: PASS — no binding can be registered from current evidence");
