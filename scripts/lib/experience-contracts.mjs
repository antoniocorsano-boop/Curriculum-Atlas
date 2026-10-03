const PRIMITIVES=new Set(["EXPLORE","CHOOSE","CONNECT","BUILD","INVESTIGATE","REFRAME","TRANSFER"]);
const FEEDBACK=new Set(["EVIDENCE_SUPPORTED","EVIDENCE_INCOMPLETE","DECISION_PREMATURE","ALTERNATIVE_PLAUSIBLE","MODEL_NEEDS_REVISION","TRANSFER_SUCCESSFUL"]);
const MODES=new Set(["SMART","PATHWAY"]);
const STATE_POLICIES=new Set(["VOLATILE_MEMORY","LOCAL_DEVICE"]);
const nonEmpty=(x)=>typeof x==="string"&&x.trim().length>0;
const arr=(x)=>Array.isArray(x)&&x.length>0;
const result=(errors)=>({valid:errors.length===0,errors});

export function validateChallengeKernel(value){
 const e=[];
 if(value?.schema!=="atlas.challenge-kernel/v1") e.push("schema");
 for(const k of ["kernelId","title","situation","generativeQuestion","transferPrinciple"]) if(!nonEmpty(value?.[k])) e.push(k);
 if(!arr(value?.competenceTargets)) e.push("competenceTargets");
 if(!arr(value?.evidenceModel?.availableEvidence)) e.push("evidenceModel.availableEvidence");
 if(!arr(value?.decisionModel?.decisions)) e.push("decisionModel.decisions");
 if(!["EXPLANATORY","BRANCHING","CONSTRUCTIVE"].includes(value?.decisionModel?.consequencePolicy)) e.push("decisionModel.consequencePolicy");
 if(typeof value?.decisionModel?.revisionAllowed!=="boolean") e.push("decisionModel.revisionAllowed");
 if(!arr(value?.completionEvidence)) e.push("completionEvidence");
 if(!arr(value?.provenanceRefs)||value.provenanceRefs.some(x=>!nonEmpty(x))) e.push("provenanceRefs");
 return result(e);
}
export function validateExperienceGraph(graph,{mode}={}){
 const e=[];
 if(!MODES.has(mode)) e.push("mode");
 if(!nonEmpty(graph?.entrySceneId)||!Array.isArray(graph?.scenes)||graph.scenes.length===0) return result([...e,"sceneGraph"]);
 const ids=new Set();
 for(const s of graph.scenes){
  if(!nonEmpty(s?.id)||ids.has(s.id)) e.push("scene.id"); else ids.add(s.id);
  if(!PRIMITIVES.has(s?.primitive)) e.push(`scene.${s?.id||"?"}.primitive`);
  if(s?.feedback?.category&&!FEEDBACK.has(s.feedback.category)) e.push(`scene.${s?.id||"?"}.feedback.category`);
 }
 if(!ids.has(graph.entrySceneId)) e.push("entrySceneId");
 for(const s of graph.scenes){
  const transitions=Array.isArray(s.transitions)?s.transitions:[];
  if(s.terminal===true&&transitions.length) e.push(`scene.${s.id}.terminalTransitions`);
  if(s.terminal!==true&&transitions.length===0) e.push(`scene.${s.id}.deadEnd`);
  for(const t of transitions) if(!ids.has(t?.targetSceneId)) e.push(`scene.${s.id}.target`);
 }
 if(mode==="PATHWAY"&&!graph.scenes.some(s=>s.primitive==="TRANSFER")) e.push("pathway.transfer");
 const map=new Map(graph.scenes.map(s=>[s.id,s]));const seen=new Set();
 const walk=(id)=>{if(seen.has(id)||!map.has(id))return;seen.add(id);for(const t of map.get(id).transitions||[])walk(t.targetSceneId);};
 walk(graph.entrySceneId);if(seen.size!==graph.scenes.length)e.push("sceneGraph.unreachable");
 return result(e);
}
export function validateExperienceDefinition(value,{registries}={}){
 const e=[];
 if(value?.schema!=="atlas.experience/v1") e.push("schema");
 if(!nonEmpty(value?.experienceId)) e.push("experienceId");
 if(!nonEmpty(value?.kernelRef)) e.push("kernelRef");
 if(!MODES.has(value?.mode)) e.push("mode");
 if(!nonEmpty(value?.presentationGrammarRef)) e.push("presentationGrammarRef");
 if(!nonEmpty(value?.qualificationProfileRef)) e.push("qualificationProfileRef");
 if(registries){
  if(!registries.presentationGrammarIds?.has(value?.presentationGrammarRef)) e.push("presentationGrammarRef.unregistered");
  if(!registries.qualificationProfileIds?.has(value?.qualificationProfileRef)) e.push("qualificationProfileRef.unregistered");
  for(const scene of value?.sceneGraph?.scenes||[]) if(!registries.experienceGrammarIds?.has(scene?.primitive)) e.push(`scene.${scene?.id||"?"}.primitive.unregistered`);
 }
 if(!STATE_POLICIES.has(value?.runtimeStatePolicy)) e.push("runtimeStatePolicy");
 if(value?.learnerIdentityRequired!==false) e.push("learnerIdentityRequired");
 if(value?.telemetryAllowed!==false) e.push("telemetryAllowed");
 const g=validateExperienceGraph(value?.sceneGraph,{mode:value?.mode});e.push(...g.errors);
 return result(e);
}
export const EXPERIENCE_PRIMITIVES=[...PRIMITIVES];
export const FEEDBACK_CATEGORIES=[...FEEDBACK];
