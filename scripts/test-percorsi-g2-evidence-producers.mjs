import assert from 'node:assert/strict';
import {produceQ5,produceQ6,produceQ1,validateConsumableEvidence,mapEvidenceProducerResultToGateReceipt,executeProducerSafely} from './percorsi-g2-evidence-producers.mjs';
const binding={runtimeExactHead:'4887c4306ff062734d34b9dc82ca53832efacf05',pathwayId:'pw-test',contentVersion:'v1',publicationId:'pub-1'};
const foreign={...binding,publicationId:'pub-foreign'};
const transition={eventId:'evt-1',previousState:'LAB',requestedTransition:'LAB>QUALIFIED',resultingState:'QUALIFIED',publicationId:'pub-1',candidateBinding:binding,authorityRef:'authority:test',authorityEvidenceRef:'evidence:authority',transitionAt:'2026-09-27T13:00:00Z'};
const artifact={id:'artifact-1',kind:'QUALIFIED_CONTENT',publicationState:'QUALIFIED',publicationId:'pub-1',candidateBinding:binding,authorityRef:'authority:test',receiptRef:'receipt:test',receiptCandidateBinding:binding,receiptAuthorityRef:'authority:test'};
const authorization={status:'RUNTIME_AUTHORIZED',candidateBinding:binding,authorityRef:'authority:test'};
let q5=produceQ5(binding,transition); assert.equal(q5.status,'PASS');
let q6=produceQ6(binding,artifact,q5); assert.equal(q6.status,'PASS'); assert.equal(q6.dependencyLineage[0].runId,q5.runId);
const surface={id:'surface-1',publicationId:'pub-1',candidateBinding:binding,q6RunId:q6.runId,publicationState:'PUBLISHED',runtimeAuthorization:authorization,reachableRoutes:['/percorsi'],entrypoint:'/percorsi',publicEntrypoint:true,missingAuthorityBehavior:'DENY',missingReceiptBehavior:'DENY',nonPublishableBehavior:'DENY',unknownRouteBehavior:'DENY'};
let q1=produceQ1(binding,surface,q6); assert.equal(q1.status,'PASS'); assert.equal(q1.dependencyLineage[0].runId,q6.runId);

// Aggregator mapping: malformed/missing is NOT_RUN; executed states are preserved.
for(const gateResult of [q5,q6,q1]){
  const receipt=mapEvidenceProducerResultToGateReceipt(gateResult.gateId,binding,gateResult);
  assert.equal(receipt.status,'PASS'); assert.equal(receipt.producerTrace.runId,gateResult.runId);
}
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,null).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,candidateBinding:foreign}).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,evidenceRefs:['x','x']}).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,checkedAt:'bad'}).status,'NOT_RUN');
const q5Fail=produceQ5(binding,{...transition,publicationId:'foreign'});
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,q5Fail).status,'FAIL');
const q5Blocked=produceQ5(binding,{...transition,eventId:''});
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,q5Blocked).status,'BLOCKED');
const crashed=executeProducerSafely('Q5',binding,{case:'crash'},()=>{throw new Error('synthetic');});
assert.equal(crashed.status,'BLOCKED'); assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,crashed).status,'BLOCKED');

// Q5 provenance/state adversarial mutations.
for(const t of [
  {...transition,eventId:''},{...transition,transitionAt:'not-a-date'},{...transition,candidateBinding:foreign},{...transition,publicationId:'foreign'},
  {...transition,resultingState:'PUBLISHED',requestedTransition:'LAB>PUBLISHED'},
  {...transition,previousState:'QUALIFIED',resultingState:'WITHDRAWN',requestedTransition:'QUALIFIED>WITHDRAWN'},
  {...transition,requestedTransition:'QUALIFIED>PUBLISHED'},
  {...transition,previousState:'WITHDRAWN',resultingState:'QUALIFIED',requestedTransition:'WITHDRAWN>QUALIFIED'},
  {...transition,previousState:'UNKNOWN',resultingState:'QUALIFIED',requestedTransition:'UNKNOWN>QUALIFIED'}
]) assert.notEqual(produceQ5(binding,t).status,'PASS');
assert.equal(produceQ5(binding,{...transition,authorityEvidenceRef:''}).status,'BLOCKED');
const withdrawn={...transition,eventId:'evt-withdraw',previousState:'PUBLISHED',requestedTransition:'PUBLISHED>WITHDRAWN',resultingState:'WITHDRAWN'};
assert.equal(produceQ5(binding,withdrawn).status,'PASS');
const publish={...transition,eventId:'evt-publish',previousState:'QUALIFIED',requestedTransition:'QUALIFIED>PUBLISHED',resultingState:'PUBLISHED'};
assert.equal(produceQ5(binding,publish).status,'FAIL');
assert.equal(produceQ5(binding,{...publish,q9Authorization:authorization}).status,'PASS');
assert.equal(produceQ5(binding,{...publish,q9Authorization:{...authorization,candidateBinding:foreign}}).status,'FAIL');
assert.equal(produceQ5(binding,{...publish,q9Authorization:{...authorization,authorityRef:'deploy:technical'}}).status,'FAIL');

// Dependency identity/version/binding compatibility.
for(const mutant of [
  {...q5,candidateBinding:foreign},{...q5,gateId:'Q6'},{...q5,producerId:'foreign'},
  {...q5,contractVersion:'v0'},{...q5,producerVersion:'v0'},{...q5,policyVersion:'v0'},{...q5,runId:''},{...q5,checkedAt:'bad'}
]) assert.equal(validateConsumableEvidence('Q5',binding,mutant).ok,false);

// Q6 identity/provenance/state and prerequisite semantics.
for(const a of [
  {...artifact,kind:'LAB_FIXTURE'},{...artifact,kind:'PROTOTYPE'},{...artifact,candidateBinding:foreign},
  {...artifact,receiptCandidateBinding:foreign},{...artifact,receiptAuthorityRef:'foreign'},
  {...artifact,publicationState:'LAB'},{...artifact,publicationState:'UNKNOWN'},{...artifact,publicationState:'PUBLISHED'},
  {...artifact,receiptRef:''},{...artifact,authorityRef:''}
]) assert.equal(produceQ6(binding,a,q5).status,'FAIL');
assert.equal(produceQ6(binding,artifact,null).status,'BLOCKED');
assert.equal(produceQ6(binding,artifact,{...q5,candidateBinding:foreign}).status,'BLOCKED');
assert.equal(produceQ6(binding,{...artifact,publicationState:'LAB'},null).status,'BLOCKED');

// Q1 identity, publishability, exact Q6 handoff and fail-closed.
for(const s of [
  {...surface,candidateBinding:foreign},{...surface,publicationId:'foreign'},{...surface,q6RunId:'stale-run'},{...surface,publicationState:'QUALIFIED'},
  {...surface,runtimeAuthorization:{...authorization,candidateBinding:foreign}},{...surface,runtimeAuthorization:null},
  {...surface,reachableRoutes:['/percorsi/lab/test'],entrypoint:'/percorsi/lab/test'},
  {...surface,entrypoint:'/undeclared'},{...surface,missingReceiptBehavior:'ALLOW'},
  {...surface,missingAuthorityBehavior:'ALLOW'},{...surface,nonPublishableBehavior:'ALLOW'},{...surface,unknownRouteBehavior:'ALLOW'}
]) assert.notEqual(produceQ1(binding,s,q6).status,'PASS');
assert.equal(produceQ1(binding,surface,null).status,'BLOCKED');
assert.equal(produceQ1(binding,surface,{...q6,policyVersion:'v0'}).status,'BLOCKED');
const q6Rerun={...q6,runId:'different-valid-run'};
assert.equal(produceQ1(binding,surface,q6Rerun).status,'FAIL');

// Producer authority boundary: evidence producers never issue the final runtime decision.
for(const r of [q5,q6,q1,crashed]) { assert.equal('decision' in r,false); assert.equal(JSON.stringify(r).includes('"RUNTIME_AUTHORIZED"'),false); }
console.log('PASS governed Q5 -> Q6 -> Q1 invariants, receipt mapping and adversarial mutations');
