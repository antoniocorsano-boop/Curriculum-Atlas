import assert from "node:assert/strict";
import {validateChallengeKernel,validateExperienceDefinition,validateExperienceGraph} from "./lib/experience-contracts.mjs";

const kernel={schema:"atlas.challenge-kernel/v1",kernelId:"k1",title:"K",situation:"Situazione",generativeQuestion:"Domanda?",competenceTargets:[{id:"c1"}],evidenceModel:{availableEvidence:[{id:"e1"}]},decisionModel:{decisions:[{id:"d1"}],consequencePolicy:"EXPLANATORY",revisionAllowed:true},transferPrinciple:"Principio",completionEvidence:[{id:"ce1"}],provenanceRefs:["prov:1"]};
assert.equal(validateChallengeKernel(kernel).valid,true);
assert.equal(validateChallengeKernel({...kernel,schema:"wrong"}).valid,false);

const smart={schema:"atlas.experience/v1",experienceId:"e1",kernelRef:"k1",mode:"SMART",sceneGraph:{entrySceneId:"s1",scenes:[{id:"s1",primitive:"EXPLORE",interaction:{kind:"choice"},transitions:[{id:"t1",targetSceneId:"end"}]},{id:"end",primitive:"CHOOSE",interaction:{kind:"terminal"},transitions:[],terminal:true}]},presentationGrammarRef:"sequential-visual-narrative",qualificationProfileRef:"SMART_FAST_V1",runtimeStatePolicy:"LOCAL_DEVICE",learnerIdentityRequired:false,telemetryAllowed:false};
assert.equal(validateExperienceDefinition(smart).valid,true);
assert.equal(validateExperienceDefinition({...smart,mode:"OTHER"}).valid,false);
assert.equal(validateExperienceDefinition({...smart,learnerIdentityRequired:true}).valid,false);
assert.equal(validateExperienceDefinition({...smart,telemetryAllowed:true}).valid,false);
assert.equal(validateExperienceDefinition({...smart,sceneGraph:{...smart.sceneGraph,scenes:[{...smart.sceneGraph.scenes[0],primitive:"QUIZ"},smart.sceneGraph.scenes[1]]}}).valid,false);
assert.equal(validateExperienceGraph({...smart.sceneGraph,scenes:[{...smart.sceneGraph.scenes[0],transitions:[{id:"bad",targetSceneId:"missing"}]},smart.sceneGraph.scenes[1]]},{mode:"SMART"}).valid,false);

const pathway={...smart,experienceId:"p1",mode:"PATHWAY",qualificationProfileRef:"PATHWAY_G2_PLUS_V1",runtimeStatePolicy:"VOLATILE_MEMORY",sceneGraph:{entrySceneId:"a",scenes:[{id:"a",primitive:"EXPLORE",interaction:{kind:"choice"},transitions:[{id:"to-transfer",targetSceneId:"b"}]},{id:"b",primitive:"TRANSFER",interaction:{kind:"choice"},transitions:[{id:"to-end",targetSceneId:"c"}]},{id:"c",primitive:"REFRAME",interaction:{kind:"terminal"},transitions:[],terminal:true}]}};
assert.equal(validateExperienceDefinition(pathway).valid,true);
assert.equal(validateExperienceDefinition({...pathway,sceneGraph:{entrySceneId:"a",scenes:[{id:"a",primitive:"EXPLORE",interaction:{kind:"choice"},transitions:[{id:"x",targetSceneId:"c"}]},{id:"c",primitive:"REFRAME",interaction:{kind:"terminal"},transitions:[],terminal:true}]}}).valid,false);

for(const missing of ["situation","generativeQuestion","competenceTargets","evidenceModel","decisionModel","transferPrinciple","completionEvidence","provenanceRefs"]){const x=structuredClone(kernel);delete x[missing];assert.equal(validateChallengeKernel(x).valid,false,missing);}
const feedback=["EVIDENCE_SUPPORTED","EVIDENCE_INCOMPLETE","DECISION_PREMATURE","ALTERNATIVE_PLAUSIBLE","MODEL_NEEDS_REVISION","TRANSFER_SUCCESSFUL"];
for(const category of feedback){const x=structuredClone(smart);x.sceneGraph.scenes[0].feedback={category};assert.equal(validateExperienceDefinition(x).valid,true,category);}
{const x=structuredClone(smart);x.sceneGraph.scenes[0].feedback={category:"SCORE"};assert.equal(validateExperienceDefinition(x).valid,false);}
console.log("EXPERIENCE CONTRACTS: PASS");
