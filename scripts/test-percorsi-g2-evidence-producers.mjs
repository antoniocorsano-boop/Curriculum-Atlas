import assert from 'node:assert/strict';
import {produceQ5,produceQ6,produceQ1,executeSealedPreauthProbe,validateConsumableEvidence,mapEvidenceProducerResultToGateReceipt,executeProducerSafely} from './percorsi-g2-evidence-producers.mjs';

const binding={runtimeExactHead:'4887c4306ff062734d34b9dc82ca53832efacf05',pathwayId:'pw-test',contentVersion:'v1',publicationId:'pub-1'};
const foreign={...binding,publicationId:'pub-foreign'};
const transition={eventId:'evt-1',previousState:'LAB',requestedTransition:'LAB>QUALIFIED',resultingState:'QUALIFIED',publicationId:'pub-1',candidateBinding:binding,authorityRef:'authority:test',authorityEvidenceRef:'evidence:authority',transitionAt:'2026-09-27T13:00:00Z'};
const artifact={id:'artifact-1',kind:'QUALIFIED_CONTENT',publicationState:'QUALIFIED',publicationId:'pub-1',candidateBinding:binding,authorityRef:'authority:test',receiptRef:'receipt:test',receiptCandidateBinding:binding,receiptAuthorityRef:'authority:test'};
const authorization={status:'RUNTIME_AUTHORIZED',candidateBinding:binding,authorityRef:'authority:test'};

function makeAdapter(overrides={}){
  const calls=[];
  return {
    calls,
    async discoverReachableRoutes(){
      calls.push({op:'discover'});
      return overrides.routes??['/percorsi'];
    },
    async isPubliclyExposed(){
      calls.push({op:'exposure'});
      return overrides.publicExposure??false;
    },
    async request(input){
      calls.push({op:'request',input});
      if(input.route==='/percorsi/__probe_unknown__') return {outcome:overrides.unknownRouteBehavior??'DENY'};
      if(input.authorityPresent===false) return {outcome:overrides.missingAuthorityBehavior??'DENY'};
      if(input.receiptPresent===false) return {outcome:overrides.missingReceiptBehavior??'DENY'};
      if(input.publicationState!=='QUALIFIED') return {outcome:overrides.nonPublishableBehavior??'DENY'};
      if(input.route==='/percorsi') return {outcome:overrides.entrypointOutcome??'ALLOW'};
      if(input.route?.startsWith('/percorsi/lab/')) return {outcome:overrides.labOutcome??'ALLOW'};
      return {outcome:'DENY'};
    }
  };
}

let q5=produceQ5(binding,transition);
assert.equal(q5.status,'PASS');
assert.equal(q5.authorityRef,'authority:test');

let q6=produceQ6(binding,artifact,q5);
assert.equal(q6.status,'PASS');
assert.equal(q6.dependencyLineage[0].runId,q5.runId);

const target={id:'surface-1',publicationId:'pub-1',candidateBinding:binding,q6RunId:q6.runId,publicationState:'QUALIFIED',probeMode:'SEALED_PREAUTH',surfaceArtifactDigest:'sha256:test-surface',entrypoint:'/percorsi'};
const adapter=makeAdapter();
const probeReceipt=await executeSealedPreauthProbe(binding,target,q6,adapter);
assert.ok(adapter.calls.some(c=>c.op==='discover'));
assert.ok(adapter.calls.filter(c=>c.op==='request').length>=5);
assert.ok(adapter.calls.some(c=>c.op==='exposure'));

let q1=produceQ1(binding,probeReceipt,q6);
assert.equal(q1.status,'PASS');
assert.equal(q1.dependencyLineage[0].runId,q6.runId);
assert.ok(q1.evidenceRefs.includes(`probe-run:${probeReceipt.probeRunId}`));

for(const gateResult of [q5,q6,q1]){
  const receipt=mapEvidenceProducerResultToGateReceipt(gateResult.gateId,binding,gateResult);
  assert.equal(receipt.status,'PASS');
  assert.equal(receipt.producerTrace.runId,gateResult.runId);
}
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,null).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,candidateBinding:foreign}).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,evidenceRefs:['x','x']}).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,checkedAt:'bad'}).status,'NOT_RUN');
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,{...q5,authorityRef:''}).status,'NOT_RUN');

const q5Fail=produceQ5(binding,{...transition,publicationId:'foreign'});
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,q5Fail).status,'FAIL');
const q5Blocked=produceQ5(binding,{...transition,eventId:''});
assert.equal(mapEvidenceProducerResultToGateReceipt('Q5',binding,q5Blocked).status,'BLOCKED');
const crashed=executeProducerSafely('Q5',binding,{case:'crash'},()=>{throw new Error('synthetic');});
assert.equal(crashed.status,'BLOCKED');

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
assert.equal(produceQ5(binding,{...publish,q9Authorization:{...authorization,authorityRef:'authority:foreign'}}).status,'FAIL');

for(const mutant of [
  {...q5,candidateBinding:{...binding,runtimeExactHead:'foreign-head'}},{...q5,candidateBinding:{...binding,pathwayId:'foreign-path'}},
  {...q5,candidateBinding:{...binding,contentVersion:'v2'}},{...q5,candidateBinding:foreign},{...q5,gateId:'Q6'},
  {...q5,producerId:'foreign'},{...q5,contractVersion:'v0'},{...q5,producerVersion:'v0'},{...q5,policyVersion:'v0'},
  {...q5,runId:''},{...q5,checkedAt:'bad'},{...q5,authorityRef:''}
]) assert.equal(validateConsumableEvidence('Q5',binding,mutant).ok,false);

for(const a of [
  {...artifact,kind:'LAB_FIXTURE'},{...artifact,kind:'PROTOTYPE'},{...artifact,candidateBinding:foreign},{...artifact,publicationId:'foreign'},
  {...artifact,receiptCandidateBinding:foreign},{...artifact,receiptAuthorityRef:'foreign'},
  {...artifact,authorityRef:'authority:foreign',receiptAuthorityRef:'authority:foreign'},
  {...artifact,publicationState:'LAB'},{...artifact,publicationState:'UNKNOWN'},{...artifact,publicationState:'PUBLISHED'},
  {...artifact,receiptRef:''},{...artifact,authorityRef:''}
]) assert.equal(produceQ6(binding,a,q5).status,'FAIL');
assert.equal(produceQ6(binding,artifact,{...q5,authorityRef:'authority:foreign'}).status,'FAIL');
assert.equal(produceQ6(binding,artifact,null).status,'BLOCKED');

await assert.rejects(()=>executeSealedPreauthProbe(binding,target,q6,null),/PROBE_ADAPTER_REQUIRED/);
await assert.rejects(()=>executeSealedPreauthProbe(binding,{...target,q6RunId:'stale-run'},q6,makeAdapter()),/PROBE_TARGET_INCOMPATIBLE/);

const legacySurface={...target,publicExposure:false,reachableRoutes:['/percorsi'],publicEntrypoint:true,missingAuthorityBehavior:'DENY',missingReceiptBehavior:'DENY',nonPublishableBehavior:'DENY',unknownRouteBehavior:'DENY'};
assert.equal(produceQ1(binding,legacySurface,q6).status,'BLOCKED');

const tampered={...probeReceipt,observations:{...probeReceipt.observations,publicExposure:true}};
assert.equal(produceQ1(binding,tampered,q6).status,'BLOCKED');

const staleReceipt=await executeSealedPreauthProbe(binding,target,q6,makeAdapter(),()=> '2026-09-27T12:00:00Z');
const staleResult=produceQ1(binding,staleReceipt,q6);
assert.equal(staleResult.status,'BLOCKED');
assert.equal(staleResult.observations[0].absenceReason,'PROBE_RECEIPT_STALE');

const foreignReceipt={...probeReceipt,candidateBinding:foreign};
assert.equal(produceQ1(binding,foreignReceipt,q6).status,'BLOCKED');

const q6Other={...q6,runId:'different-valid-run'};
const otherTarget={...target,q6RunId:q6Other.runId};
const mismatchedQ6Receipt=await executeSealedPreauthProbe(binding,otherTarget,q6Other,makeAdapter());
const mismatchedQ6Result=produceQ1(binding,mismatchedQ6Receipt,q6);
assert.equal(mismatchedQ6Result.status,'BLOCKED');
assert.equal(mismatchedQ6Result.observations[0].absenceReason,'PROBE_RECEIPT_BINDING_MISMATCH');

for(const bad of [
  {publicExposure:true},
  {routes:['/percorsi','/percorsi/lab/test']},
  {entrypointOutcome:'DENY'},
  {missingReceiptBehavior:'ALLOW'},
  {missingAuthorityBehavior:'ALLOW'},
  {nonPublishableBehavior:'ALLOW'},
  {unknownRouteBehavior:'ALLOW'}
]){
  const receipt=await executeSealedPreauthProbe(binding,target,q6,makeAdapter(bad));
  assert.equal(produceQ1(binding,receipt,q6).status,'FAIL');
}

assert.equal(produceQ1(binding,probeReceipt,null).status,'BLOCKED');
assert.equal(produceQ1(binding,probeReceipt,{...q6,policyVersion:'v0'}).status,'BLOCKED');
const q6Rerun={...q6,runId:'rerun-after-probe'};
assert.equal(produceQ1(binding,probeReceipt,q6Rerun).status,'BLOCKED');

for(const r of [q5,q6,q1,crashed]){
  assert.equal('decision' in r,false);
  assert.equal(JSON.stringify(r).includes('"RUNTIME_AUTHORIZED"'),false);
}
console.log('PASS governed Q5 authority continuity -> Q6 -> active sealed-preauth Q1 probe, including foreign authority and forged/stale/mismatched receipt cases');
