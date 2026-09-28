import crypto from 'node:crypto';

export const CONTRACT_VERSION='percorsi-g2-evidence-producer/v1';
export const POLICY_VERSION='v1';
const gates={Q5:'publication-provenance',Q6:'editorial-admission',Q1:'public-surface-reachability'};
const accepted={
  Q1:{gateId:'Q1',producerId:'percorsi-g2-public-surface-reachability',producerVersion:'v1'},
  Q5:{gateId:'Q5',producerId:'percorsi-g2-publication-provenance',producerVersion:'v1'},
  Q6:{gateId:'Q6',producerId:'percorsi-g2-editorial-admission',producerVersion:'v1'}
};
const allowedEdges=new Set(['LAB>QUALIFIED','QUALIFIED>PUBLISHED','PUBLISHED>WITHDRAWN']);
const iso=()=>new Date().toISOString();
const isRfc3339=v=>typeof v==='string'&&!Number.isNaN(Date.parse(v))&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v);
const sameBinding=(a,b)=>!!a&&!!b&&['runtimeExactHead','pathwayId','contentVersion','publicationId'].every(k=>typeof a[k]==='string'&&a[k]!==''&&a[k]===b[k]);
const runId=(gate,binding,input)=>crypto.createHash('sha256').update(JSON.stringify([gate,binding,input])).digest('hex');
const obs=(assertionId,outcome,evidenceRef,absenceReason)=>({assertionId,outcome,...(evidenceRef?{evidenceRef}:{absenceReason})});
const result=(gate,binding,input,observations,deps=[])=>{
  const status=observations.some(o=>o.outcome==='FAIL')?'FAIL':observations.some(o=>o.outcome==='BLOCKED')?'BLOCKED':'PASS';
  return {contractVersion:CONTRACT_VERSION,producerId:`percorsi-g2-${gates[gate]}`,producerVersion:'v1',runId:runId(gate,binding,input),gateId:gate,candidateBinding:binding,status,observations,evidenceRefs:[...new Set(observations.flatMap(o=>o.evidenceRef?[o.evidenceRef]:[]))],checkedAt:iso(),policyVersion:POLICY_VERSION,dependencyLineage:deps};
};
const ev=(prefix,id)=>`${prefix}:${id}`;
const lineage=d=>d?[{producerId:d.producerId,producerVersion:d.producerVersion,runId:d.runId,gateId:d.gateId,candidateBinding:d.candidateBinding,checkedAt:d.checkedAt}]:[];

function producerEnvelopeValid(expectedGate,binding,d){
  const exp=accepted[expectedGate];
  if(!d||!exp||d.gateId!==exp.gateId||d.producerId!==exp.producerId) return false;
  if(!sameBinding(d.candidateBinding,binding)) return false;
  if(d.contractVersion!==CONTRACT_VERSION||d.producerVersion!==exp.producerVersion||d.policyVersion!==POLICY_VERSION) return false;
  if(!['PASS','FAIL','BLOCKED'].includes(d.status)||typeof d.runId!=='string'||!d.runId||!isRfc3339(d.checkedAt)) return false;
  if(!Array.isArray(d.evidenceRefs)||d.evidenceRefs.some(x=>typeof x!=='string'||!x)||new Set(d.evidenceRefs).size!==d.evidenceRefs.length) return false;
  if(!Array.isArray(d.observations)||!d.observations.length||d.observations.some(o=>!o||typeof o.assertionId!=='string'||!o.assertionId||!['PASS','FAIL','BLOCKED'].includes(o.outcome)||((typeof o.evidenceRef==='string'&&o.evidenceRef.length>0)===(typeof o.absenceReason==='string'&&o.absenceReason.length>0)))) return false;
  return true;
}

export function validateConsumableEvidence(expectedGate,binding,dependency){
  if(!dependency) return {ok:false,reason:`${expectedGate}_EVIDENCE_MISSING`};
  if(!producerEnvelopeValid(expectedGate,binding,dependency)) return {ok:false,reason:`${expectedGate}_EVIDENCE_INCOMPATIBLE`};
  if(dependency.status!=='PASS') return {ok:false,reason:`${expectedGate}_NOT_PASS`};
  return {ok:true};
}

export function mapEvidenceProducerResultToGateReceipt(expectedGate,binding,producerResult){
  if(!producerEnvelopeValid(expectedGate,binding,producerResult)){
    return {status:'NOT_RUN',evidenceRefs:[],reviewerClass:'automatic',checkedAt:iso(),producerTrace:null};
  }
  return {status:producerResult.status,evidenceRefs:[...producerResult.evidenceRefs],reviewerClass:'automatic',checkedAt:producerResult.checkedAt,producerTrace:{producerId:producerResult.producerId,producerVersion:producerResult.producerVersion,runId:producerResult.runId}};
}

export function executeProducerSafely(gate,binding,input,producer){
  try{return producer();}
  catch(error){return result(gate,binding,input,[obs(`${gate.toLowerCase()}.execution`,'BLOCKED',null,`PRODUCER_ERROR:${error?.name||'Error'}`)]);}
}

export function produceQ5(binding,transition){
  const required=['eventId','previousState','requestedTransition','resultingState','publicationId','authorityRef','authorityEvidenceRef','transitionAt'];
  const complete=required.every(k=>typeof transition?.[k]==='string'&&transition[k])&&transition?.candidateBinding;
  const observations=[obs('q5.transition.complete',complete?'PASS':'BLOCKED',complete?ev('transition',transition.eventId):null,complete?null:'TRANSITION_PROVENANCE_INCOMPLETE')];
  if(complete){
    const edge=`${transition.previousState}>${transition.resultingState}`;
    observations.push(obs('q5.transition.timestamp',isRfc3339(transition.transitionAt)?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.transition.candidate-binding',sameBinding(transition.candidateBinding,binding)?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.transition.allowed',allowedEdges.has(edge)&&transition.requestedTransition===edge?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.publication.binding',transition.publicationId===binding.publicationId?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.authority.present',transition.authorityRef&&transition.authorityEvidenceRef?'PASS':'FAIL',transition.authorityEvidenceRef));
    if(edge==='QUALIFIED>PUBLISHED') observations.push(obs('q5.q9.authority',transition.q9Authorization?.status==='RUNTIME_AUTHORIZED'&&sameBinding(transition.q9Authorization?.candidateBinding,binding)&&transition.q9Authorization?.authorityRef===transition.authorityRef?'PASS':'FAIL',ev('transition',transition.eventId)));
  }
  return result('Q5',binding,transition,observations);
}

export function produceQ6(binding,artifact,q5){
  const dep=validateConsumableEvidence('Q5',binding,q5);
  if(!dep.ok) return result('Q6',binding,{dependencyRunId:q5?.runId??null},[obs('q6.q5.consumable','BLOCKED',null,dep.reason)],lineage(q5));
  const observations=[obs('q6.q5.consumable','PASS',`producer-run:${q5.runId}`)];
  const identity=artifact?.candidateBinding&&sameBinding(artifact.candidateBinding,binding)&&artifact?.publicationId===binding.publicationId;
  const provenance=artifact?.authorityRef&&artifact?.receiptRef&&artifact?.receiptCandidateBinding&&sameBinding(artifact.receiptCandidateBinding,binding)&&artifact?.receiptAuthorityRef===artifact.authorityRef;
  const state=artifact?.kind==='QUALIFIED_CONTENT'&&artifact?.publicationState==='QUALIFIED';
  observations.push(obs('q6.editorial.identity',identity?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  observations.push(obs('q6.editorial.provenance',provenance?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  observations.push(obs('q6.editorial.state',state?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  return result('Q6',binding,artifact,observations,lineage(q5));
}

export function produceQ1(binding,surface,q6){
  const dep=validateConsumableEvidence('Q6',binding,q6);
  if(!dep.ok) return result('Q1',binding,{dependencyRunId:q6?.runId??null},[obs('q1.q6.consumable','BLOCKED',null,dep.reason)],lineage(q6));
  const observations=[obs('q1.q6.consumable','PASS',`producer-run:${q6.runId}`)];
  const routes=Array.isArray(surface?.reachableRoutes)?surface.reachableRoutes:[];
  const identity=surface?.candidateBinding&&sameBinding(surface.candidateBinding,binding)&&surface?.publicationId===binding.publicationId&&surface?.q6RunId===q6.runId;
  const publishable=surface?.publicationState==='PUBLISHED'&&surface?.runtimeAuthorization?.status==='RUNTIME_AUTHORIZED'&&sameBinding(surface?.runtimeAuthorization?.candidateBinding,binding);
  observations.push(obs('q1.surface.identity',identity?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.surface.publishable',publishable?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.lab.unreachable',routes.some(r=>r.startsWith('/percorsi/lab/'))?'FAIL':'PASS',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.public.entrypoint',surface?.publicEntrypoint===true&&typeof surface?.entrypoint==='string'&&routes.includes(surface.entrypoint)?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.fail.closed',surface?.missingAuthorityBehavior==='DENY'&&surface?.missingReceiptBehavior==='DENY'&&surface?.nonPublishableBehavior==='DENY'&&surface?.unknownRouteBehavior==='DENY'?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  return result('Q1',binding,surface,observations,lineage(q6));
}
