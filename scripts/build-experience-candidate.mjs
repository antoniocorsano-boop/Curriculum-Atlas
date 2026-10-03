import {validateExperienceDefinition} from "./lib/experience-contracts.mjs";
const fail=(m)=>{throw new Error(m);};
export function buildExperienceCandidate(seed){
 if(seed?.schemaVersion!=="atlas.experience.seed/v1") fail("invalid experience seed schemaVersion");
 for(const k of ["experienceId","kernelRef","mode","presentationGrammarRef","qualificationProfileRef","runtimeStatePolicy"]) if(typeof seed?.[k]!=="string"||!seed[k].trim()) fail("missing "+k);
 if(!Array.isArray(seed.scenes)||seed.scenes.length===0) fail("missing scenes");
 const definition={schema:"atlas.experience/v1",experienceId:seed.experienceId,kernelRef:seed.kernelRef,mode:seed.mode,sceneGraph:{entrySceneId:seed.entrySceneId||seed.scenes[0].id,scenes:structuredClone(seed.scenes)},presentationGrammarRef:seed.presentationGrammarRef,qualificationProfileRef:seed.qualificationProfileRef,runtimeStatePolicy:seed.runtimeStatePolicy,learnerIdentityRequired:false,telemetryAllowed:false};
 if(seed.materialSetRef) definition.materialSetRef=seed.materialSetRef;
 const check=validateExperienceDefinition(definition);if(!check.valid) fail("invalid experience candidate: "+check.errors.join(","));
 return definition;
}
