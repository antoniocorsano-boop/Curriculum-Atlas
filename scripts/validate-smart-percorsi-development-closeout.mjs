import fs from "node:fs";
const fail=m=>{console.error(m);process.exit(1);};
const closeout=JSON.parse(fs.readFileSync("governance/smart-percorsi-development-closeout.json","utf8"));
const registry=JSON.parse(fs.readFileSync("governance/smart-percorsi-binding-registry.json","utf8"));
const decision=JSON.parse(fs.readFileSync("governance/smart-percorsi-first-binding-decision.json","utf8"));

if(closeout.schemaVersion!=="atlas.smart.percorsi-development-closeout/v1") fail("closeout schemaVersion invalid");
if(closeout.status!=="COMPLETE") fail("development not marked COMPLETE");
if(closeout.runtimeAuthorized!==false) fail("runtime must remain unauthorized");
if(closeout.activeBindingCount!==0) fail("closeout must record zero active bindings");
if(!Array.isArray(registry.bindings)||registry.bindings.some(x=>x.status==="ACTIVE")) fail("canonical registry has active binding");
if(decision.status!=="BLOCKED_NO_GOVERNED_PATHWAY_TARGET") fail("first binding decision is no longer blocked");
if(decision.bindingRegistrationAuthorized!==false||decision.runtimeAuthorized!==false) fail("binding/runtime unexpectedly authorized");
if(closeout.firstBindingDecision!==decision.status) fail("closeout/decision mismatch");
const expected=[
 [50,"50ab5fa6de548d357f8e91c99ae3ce0c84fdc6d3"],
 [58,"446ff80ef6129f6c38e22d203c0f2339738836f6"],
 [59,"337761cc5219c54a3f3c3628e2c14ec20c49d3ae"],
 [60,"c386e7b8561c8efc7d4b519230ffcddb09ba555f"]
];
for(const [pr,sha] of expected){
 const item=closeout.integratedMilestones.find(x=>x.pr===pr);
 if(!item||item.mergeCommit!==sha) fail("missing or incorrect integrated milestone PR #"+pr);
}
if(closeout.futureWorkClass!=="NEW_GOVERNANCE_DECISION_NOT_TECHNICAL_BACKLOG") fail("future work classification drift");
console.log("SMART-PERCORSI-DEVELOPMENT-CLOSEOUT-01: PASS");
