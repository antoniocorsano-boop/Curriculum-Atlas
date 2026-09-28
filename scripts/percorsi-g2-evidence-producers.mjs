import crypto from 'node:crypto';

export const CONTRACT_VERSION='percorsi-g2-evidence-producer/v1';
export const POLICY_VERSION='v1';
export const PROBE_RECEIPT_VERSION='percorsi-g2-sealed-preauth-probe-receipt/v1';
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
const hash=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const runId=(gate,binding,input)=>hash([gate,binding,input]);
const obs=(assertionId,outcome,evidenceRef,absenceReason)=>({assertionId,outcome,...(evidenceRef?{evidenceRef}:{absenceReason})});
const result=(gate,binding,input,observations,deps=[],claims={})=>{
  const status=observations.some(o=>o.outcome==='FAIL')?'FAIL':observations.some(o=>o.outcome==='BLOCKED')?'BLOCKED':'PASS';
  return {contractVersion:CONTRACT_VERSION,producerId:`percorsi-g2-${gates[gate]}`,producerVersion:'v1',runId:runId(gate,binding,input),gateId:gate,candidateBinding:binding,status,observations,evidenceRefs:[...new Set(observations.flatMap(o=>o.evidenceRef?[o.evidenceRef]:[]))],checkedAt:iso(),policyVersion:POLICY_VERSION,dependencyLineage:deps,...claims};
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
  if(expectedGate==='Q5'&&d.status==='PASS'&&(typeof d.authorityRef!=='string'||!d.authorityRef)) return false;
  return true;
}

export function validateConsumableEvidence(expectedGate,binding,dependency){
  if(!dependency) return {ok:false,reason:`${expectedGate}_EVIDENCE_MISSING`};
  if(!producerEnvelopeValid(expectedGate,binding,dependency)) return {ok:false,reason:`${expectedGate}_EVIDENCE_INCOMPATIBLE`};
  if(dependency.status!=='PASS') return {ok:false,reason:`${expectedGate}_NOT_PASS`};
  return {ok:true};
}

export function mapEvidenceProducerResultToGateReceipt(expectedGate,binding,producerResult){
  if(!producerEnvelopeValid(expectedGate,binding,producerResult)) return {status:'NOT_RUN',evidenceRefs:[],reviewerClass:'automatic',checkedAt:iso(),producerTrace:null};
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
  return result('Q5',binding,transition,observations,[],complete?{authorityRef:transition.authorityRef}:{});
}

export function produceQ6(binding,artifact,q5){
  const dep=validateConsumableEvidence('Q5',binding,q5);
  if(!dep.ok) return result('Q6',binding,{dependencyRunId:q5?.runId??null},[obs('q6.q5.consumable','BLOCKED',null,dep.reason)],lineage(q5));
  const observations=[obs('q6.q5.consumable','PASS',`producer-run:${q5.runId}`)];
  const identity=artifact?.candidateBinding&&sameBinding(artifact.candidateBinding,binding)&&artifact?.publicationId===binding.publicationId;
  const provenance=artifact?.authorityRef&&artifact?.receiptRef&&artifact?.receiptCandidateBinding&&sameBinding(artifact.receiptCandidateBinding,binding)&&artifact?.receiptAuthorityRef===artifact.authorityRef;
  const authorityContinuity=provenance&&artifact.authorityRef===q5.authorityRef;
  const state=artifact?.kind==='QUALIFIED_CONTENT'&&artifact?.publicationState==='QUALIFIED';
  observations.push(obs('q6.editorial.identity',identity?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  observations.push(obs('q6.editorial.provenance',provenance?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  observations.push(obs('q6.q5.authority-continuity',authorityContinuity?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  observations.push(obs('q6.editorial.state',state?'PASS':'FAIL',ev('artifact',artifact?.id??'unknown')));
  return result('Q6',binding,artifact,observations,lineage(q5));
}

function probeReceiptPayload(receipt){
  return {
    receiptVersion:receipt.receiptVersion,
    probeProducerId:receipt.probeProducerId,
    probeRunId:receipt.probeRunId,
    candidateBinding:receipt.candidateBinding,
    publicationId:receipt.publicationId,
    q6RunId:receipt.q6RunId,
    publicationState:receipt.publicationState,
    probeMode:receipt.probeMode,
    surfaceArtifactDigest:receipt.surfaceArtifactDigest,
    observedAt:receipt.observedAt,
    observations:receipt.observations
  };
}
const receiptDigest=receipt=>hash(probeReceiptPayload(receipt));

export function executeSealedPreauthProbe(binding,target,q6,probeExecutor){
  const dep=validateConsumableEvidence('Q6',binding,q6);
  if(!dep.ok) throw new Error(dep.reason);
  if(typeof probeExecutor!=='function') throw new TypeError('PROBE_EXECUTOR_REQUIRED');
  const targetValid=target?.candidateBinding&&sameBinding(target.candidateBinding,binding)&&target?.publicationId===binding.publicationId&&target?.q6RunId===q6.runId&&target?.publicationState==='QUALIFIED'&&target?.probeMode==='SEALED_PREAUTH'&&typeof target?.surfaceArtifactDigest==='string'&&target.surfaceArtifactDigest;
  if(!targetValid) throw new Error('PROBE_TARGET_INCOMPATIBLE');
  const observed=probeExecutor({
    candidateBinding:binding,
    publicationId:binding.publicationId,
    q6RunId:q6.runId,
    surfaceArtifactDigest:target.surfaceArtifactDigest,
    entrypoint:target.entrypoint
  });
  if(!observed||typeof observed!=='object') throw new Error('PROBE_OBSERVATION_MISSING');
  const observedAt=iso();
  const receipt={
    receiptVersion:PROBE_RECEIPT_VERSION,
    probeProducerId:'percorsi-g2-sealed-preauth-probe',
    probeRunId:hash(['sealed-preauth',binding,q6.runId,target.surfaceArtifactDigest,observedAt,observed]),
    candidateBinding:binding,
    publicationId:binding.publicationId,
    q6RunId:q6.runId,
    publicationState:'QUALIFIED',
    probeMode:'SEALED_PREAUTH',
    surfaceArtifactDigest:target.surfaceArtifactDigest,
    observedAt,
    observations:{
      reachableRoutes:Array.isArray(observed.reachableRoutes)?[...observed.reachableRoutes]:[],
      entrypoint:observed.entrypoint,
      publicEntrypoint:observed.publicEntrypoint,
      publicExposure:observed.publicExposure,
      missingAuthorityBehavior:observed.missingAuthorityBehavior,
      missingReceiptBehavior:observed.missingReceiptBehavior,
      nonPublishableBehavior:observed.nonPublishableBehavior,
      unknownRouteBehavior:observed.unknownRouteBehavior
    }
  };
  return {...receipt,receiptDigest:receiptDigest(receipt)};
}

function validateProbeReceipt(binding,receipt,q6){
  if(!receipt||receipt.receiptVersion!==PROBE_RECEIPT_VERSION||receipt.probeProducerId!=='percorsi-g2-sealed-preauth-probe') return {ok:false,reason:'PROBE_RECEIPT_INCOMPATIBLE'};
  if(typeof receipt.probeRunId!=='string'||!receipt.probeRunId||typeof receipt.receiptDigest!=='string'||receipt.receiptDigest!==receiptDigest(receipt)) return {ok:false,reason:'PROBE_RECEIPT_TAMPERED'};
  if(!sameBinding(receipt.candidateBinding,binding)||receipt.publicationId!==binding.publicationId||receipt.q6RunId!==q6.runId) return {ok:false,reason:'PROBE_RECEIPT_BINDING_MISMATCH'};
  if(receipt.publicationState!=='QUALIFIED'||receipt.probeMode!=='SEALED_PREAUTH'||typeof receipt.surfaceArtifactDigest!=='string'||!receipt.surfaceArtifactDigest) return {ok:false,reason:'PROBE_RECEIPT_TARGET_INVALID'};
  if(!isRfc3339(receipt.observedAt)||Date.parse(receipt.observedAt)<Date.parse(q6.checkedAt)||Date.parse(receipt.observedAt)>Date.now()+300000) return {ok:false,reason:'PROBE_RECEIPT_STALE'};
  if(!receipt.observations||typeof receipt.observations!=='object') return {ok:false,reason:'PROBE_RECEIPT_OBSERVATIONS_MISSING'};
  return {ok:true};
}

export function produceQ1(binding,probeReceipt,q6){
  const dep=validateConsumableEvidence('Q6',binding,q6);
  if(!dep.ok) return result('Q1',binding,{dependencyRunId:q6?.runId??null},[obs('q1.q6.consumable','BLOCKED',null,dep.reason)],lineage(q6));
  const receiptValidation=validateProbeReceipt(binding,probeReceipt,q6);
  if(!receiptValidation.ok) return result('Q1',binding,{dependencyRunId:q6.runId,probeRunId:probeReceipt?.probeRunId??null},[obs('q1.probe.receipt','BLOCKED',null,receiptValidation.reason)],lineage(q6));
  const observations=[obs('q1.q6.consumable','PASS',`producer-run:${q6.runId}`),obs('q1.probe.receipt','PASS',`probe-run:${probeReceipt.probeRunId}`)];
  const observed=probeReceipt.observations;
  const routes=Array.isArray(observed.reachableRoutes)?observed.reachableRoutes:[];
  observations.push(obs('q1.surface.sealed-preauth',observed.publicExposure===false?'PASS':'FAIL',`probe-run:${probeReceipt.probeRunId}`));
  observations.push(obs('q1.lab.unreachable',routes.some(r=>typeof r==='string'&&r.startsWith('/percorsi/lab/'))?'FAIL':'PASS',`probe-run:${probeReceipt.probeRunId}`));
  observations.push(obs('q1.public.entrypoint',observed.publicEntrypoint===true&&typeof observed.entrypoint==='string'&&routes.includes(observed.entrypoint)?'PASS':'FAIL',`probe-run:${probeReceipt.probeRunId}`));
  observations.push(obs('q1.fail.closed',observed.missingAuthorityBehavior==='DENY'&&observed.missingReceiptBehavior==='DENY'&&observed.nonPublishableBehavior==='DENY'&&observed.unknownRouteBehavior==='DENY'?'PASS':'FAIL',`probe-run:${probeReceipt.probeRunId}`));
  return result('Q1',binding,probeReceipt,observations,lineage(q6));
}
