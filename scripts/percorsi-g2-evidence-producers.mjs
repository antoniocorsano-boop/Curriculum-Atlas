import crypto from 'node:crypto';

export const CONTRACT_VERSION='percorsi-g2-evidence-producer/v1';
const gates={Q5:'publication-provenance',Q6:'editorial-admission',Q1:'public-surface-reachability'};
const iso=()=>new Date().toISOString();
const runId=(gate,binding,input)=>crypto.createHash('sha256').update(JSON.stringify([gate,binding,input])).digest('hex');
const obs=(assertionId,outcome,evidenceRef,absenceReason)=>({assertionId,outcome,...(evidenceRef?{evidenceRef}:{absenceReason})});
const result=(gate,binding,input,observations,deps=[])=>{
  const status=observations.some(o=>o.outcome==='FAIL')?'FAIL':observations.some(o=>o.outcome==='BLOCKED')?'BLOCKED':'PASS';
  return {contractVersion:CONTRACT_VERSION,producerId:`percorsi-g2-${gates[gate]}`,producerVersion:'v1',runId:runId(gate,binding,input),gateId:gate,candidateBinding:binding,status,observations,evidenceRefs:[...new Set(observations.flatMap(o=>o.evidenceRef?[o.evidenceRef]:[]))],checkedAt:iso(),policyVersion:'v1',dependencyLineage:deps};
};
const ev=(prefix,id)=>`${prefix}:${id}`;

export function produceQ5(binding,transition){
  const allowed=new Set(['LAB>QUALIFIED','QUALIFIED>PUBLISHED','PUBLISHED>WITHDRAWN']);
  const complete=['eventId','previousState','requestedTransition','resultingState','publicationId','authorityRef','authorityEvidenceRef','transitionAt'].every(k=>typeof transition?.[k]==='string'&&transition[k]);
  const observations=[];
  observations.push(obs('q5.transition.complete',complete?'PASS':'BLOCKED',complete?ev('transition',transition.eventId):null,complete?null:'TRANSITION_PROVENANCE_INCOMPLETE'));
  if(complete){
    const edge=`${transition.previousState}>${transition.resultingState}`;
    observations.push(obs('q5.transition.allowed',allowed.has(edge)&&transition.requestedTransition===edge?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.publication.binding',transition.publicationId===binding.publicationId?'PASS':'FAIL',ev('transition',transition.eventId)));
    observations.push(obs('q5.authority.present',transition.authorityRef&&transition.authorityEvidenceRef?'PASS':'FAIL',transition.authorityEvidenceRef));
  }
  return result('Q5',binding,transition,observations);
}

export function produceQ6(binding,artifact,q5){
  const dep=q5?[{producerId:q5.producerId,producerVersion:q5.producerVersion,runId:q5.runId,gateId:q5.gateId,candidateBinding:q5.candidateBinding,checkedAt:q5.checkedAt}]:[];
  const observations=[];
  if(!q5) observations.push(obs('q6.q5.required','BLOCKED',null,'Q5_EVIDENCE_MISSING'));
  else observations.push(obs('q6.q5.pass',q5.status==='PASS'?'PASS':'BLOCKED',`producer-run:${q5.runId}`));
  const admissible=artifact?.kind==='QUALIFIED_CONTENT'&&artifact?.publicationId===binding.publicationId&&artifact?.authorityRef&&artifact?.receiptRef;
  observations.push(obs('q6.editorial.admission',admissible?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  return result('Q6',binding,artifact,observations,dep);
}

export function produceQ1(binding,surface,q6){
  const dep=q6?[{producerId:q6.producerId,producerVersion:q6.producerVersion,runId:q6.runId,gateId:q6.gateId,candidateBinding:q6.candidateBinding,checkedAt:q6.checkedAt}]:[];
  const observations=[];
  if(!q6) observations.push(obs('q1.q6.required','BLOCKED',null,'Q6_EVIDENCE_MISSING'));
  else observations.push(obs('q1.q6.pass',q6.status==='PASS'?'PASS':'BLOCKED',`producer-run:${q6.runId}`));
  const routes=Array.isArray(surface?.reachableRoutes)?surface.reachableRoutes:[];
  observations.push(obs('q1.lab.unreachable',routes.some(r=>r.startsWith('/percorsi/lab/'))?'FAIL':'PASS',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.public.entrypoint',surface?.publicEntrypoint===true?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  observations.push(obs('q1.fail.closed',surface?.missingAuthorityBehavior==='DENY'&&surface?.missingReceiptBehavior==='DENY'?'PASS':'FAIL',ev('surface',surface?.id??'unknown')));
  return result('Q1',binding,surface,observations,dep);
}
