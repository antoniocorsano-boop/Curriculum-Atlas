import assert from 'node:assert/strict';
import {invalidatedGates,evidenceRemainsEligible} from './percorsi-g2-invalidation.mjs';
assert.deepEqual(invalidatedGates([]),{status:'PASS',gates:[]});
assert.equal(evidenceRemainsEligible('Q5',['route']).eligible,true);
assert.equal(evidenceRemainsEligible('Q1',['route']).eligible,false);
assert.equal(evidenceRemainsEligible('Q6',['buildIndex']).eligible,false);
assert.equal(evidenceRemainsEligible('Q1',['buildIndex']).eligible,false);
for(const change of ['runtimeExactHead','pathwayId','contentVersion','publicationId','authority','producerPolicy']){
  const r=invalidatedGates([change]);
  for(const gate of ['Q5','Q6','Q1']) assert.equal(r.gates.includes(gate),true,`${change} must invalidate ${gate}`);
}
assert.equal(invalidatedGates(['unknownDomain']).status,'BLOCKED');
console.log('PASS governed invalidation/revalidation cases');
