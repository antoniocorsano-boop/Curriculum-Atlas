import fs from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import {produceQ5,produceQ6,produceQ1} from './percorsi-g2-evidence-producers.mjs';

const schema=JSON.parse(fs.readFileSync('schemas/percorsi-g2-evidence-producer-result.schema.json','utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true}); addFormats(ajv);
const validate=ajv.compile(schema);
const binding={runtimeExactHead:'4887c4306ff062734d34b9dc82ca53832efacf05',pathwayId:'pw-schema',contentVersion:'v1',publicationId:'pub-schema'};
const transition={eventId:'evt-schema',previousState:'LAB',requestedTransition:'LAB>QUALIFIED',resultingState:'QUALIFIED',publicationId:'pub-schema',authorityRef:'authority:test',authorityEvidenceRef:'evidence:authority',transitionAt:'2026-09-27T13:00:00Z'};
const artifact={id:'artifact-schema',kind:'QUALIFIED_CONTENT',publicationId:'pub-schema',authorityRef:'authority:test',receiptRef:'receipt:test'};
const surface={id:'surface-schema',reachableRoutes:['/percorsi'],publicEntrypoint:true,missingAuthorityBehavior:'DENY',missingReceiptBehavior:'DENY'};
const q5=produceQ5(binding,transition), q6=produceQ6(binding,artifact,q5), q1=produceQ1(binding,surface,q6);
for(const r of [q5,q6,q1]) if(!validate(r)){console.error(r.gateId,validate.errors);process.exit(1);} 
const invalid=structuredClone(q5); invalid.evidenceRefs=['',''];
if(validate(invalid)){console.error('FAIL schema accepted invalid evidence refs');process.exit(1);}
console.log('PASS Q5 Q6 Q1 outputs conform to EvidenceProducerResult v1; invalid output rejected');
