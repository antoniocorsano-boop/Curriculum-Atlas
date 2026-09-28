import fs from 'node:fs';
import {createRequire} from 'node:module';
import {produceQ5,produceQ6,produceQ1} from './percorsi-g2-evidence-producers.mjs';

const require=createRequire(new URL('../.percorsi-g2-audit/package.json',import.meta.url));
const Ajv2020=require('ajv/dist/2020.js').default;
const addFormats=require('ajv-formats').default;
const schema=JSON.parse(fs.readFileSync('schemas/percorsi-g2-evidence-producer-result.schema.json','utf8'));
const ajv=new Ajv2020({allErrors:true,strict:true});
addFormats(ajv);
const validate=ajv.compile(schema);

const binding={runtimeExactHead:'4887c4306ff062734d34b9dc82ca53832efacf05',pathwayId:'pw-schema',contentVersion:'v1',publicationId:'pub-schema'};
const transition={eventId:'evt-schema',previousState:'LAB',requestedTransition:'LAB>QUALIFIED',resultingState:'QUALIFIED',publicationId:'pub-schema',candidateBinding:binding,authorityRef:'authority:test',authorityEvidenceRef:'evidence:authority',transitionAt:'2026-09-27T13:00:00Z'};
const artifact={id:'artifact-schema',kind:'QUALIFIED_CONTENT',publicationState:'QUALIFIED',publicationId:'pub-schema',candidateBinding:binding,authorityRef:'authority:test',receiptRef:'receipt:test',receiptCandidateBinding:binding,receiptAuthorityRef:'authority:test'};

const q5=produceQ5(binding,transition);
const q6=produceQ6(binding,artifact,q5);
const target={id:'surface-schema',publicationId:'pub-schema',candidateBinding:binding,q6RunId:q6.runId,publicationState:'QUALIFIED',probeMode:'SEALED_PREAUTH',surfaceArtifactDigest:'sha256:schema-surface',entrypoint:'/percorsi'};
const adapter={
  async discoverReachableRoutes(){return ['/percorsi'];},
  async isPubliclyExposed(){return false;},
  async request(input){
    if(input.route==='/percorsi/__probe_unknown__'||input.authorityPresent===false||input.receiptPresent===false||input.publicationState!=='QUALIFIED') return {outcome:'DENY'};
    return {outcome:input.route==='/percorsi'?'ALLOW':'DENY'};
  }
};
const q1=await produceQ1(binding,target,q6,adapter);

for(const r of [q5,q6,q1]){
  if(r.status!=='PASS'||!validate(r)){
    console.error('FAIL valid fixture',r.gateId,validate.errors);
    process.exit(1);
  }
}

const mutations=[];
{const x=structuredClone(q5); delete x.runId; mutations.push(['missing required',x]);}
mutations.push(['invalid checkedAt',{...q5,checkedAt:'not-rfc3339'}]);
mutations.push(['empty evidence ref',{...q5,evidenceRefs:['']}]);
mutations.push(['duplicate evidence ref',{...q5,evidenceRefs:['same','same']}]);
{const x=structuredClone(q5); x.observations[0]={...x.observations[0],absenceReason:'AMBIGUOUS'}; mutations.push(['ambiguous observation',x]);}
mutations.push(['producer NOT_RUN forbidden',{...q5,status:'NOT_RUN'}]);
mutations.push(['empty Q5 authority',{...q5,authorityRef:''}]);

for(const [name,x] of mutations){
  if(validate(x)){
    console.error('FAIL schema accepted',name);
    process.exit(1);
  }
}
console.log(`PASS Q5 authority-bound Q6 and active sealed-preauth Q1 outputs conform; ${mutations.length} malformed envelope/status mutations rejected`);
