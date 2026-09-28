import assert from "node:assert/strict";
import crypto from "node:crypto";
import { buildSmartPercorsiHandoff } from "./build-smart-percorsi-handoff.mjs";

const stableStringify=(value)=>value===null||typeof value!=="object"?JSON.stringify(value):Array.isArray(value)?"["+value.map(stableStringify).join(",")+"]":"{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+stableStringify(value[k])).join(",")+"}";
const clone=(v)=>structuredClone(v);
const expectCode=(fn,code)=>assert.throws(fn,(e)=>e?.code===code);
const sha="a".repeat(40), digest="sha256:"+"b".repeat(64);
const baseManifest={schemaVersion:"atlas.smart.materialset/v1",materialSetId:"smart-set",version:2,activityId:"activity-1",publication:{eligibility:"PUBLICATION_CANDIDATE"},resources:[{resourceId:"r1",required:true,digest,byteSize:123,publicationPath:"/materials/smart/r1.bin",provenanceRef:"source:verified"}]};
const binding={runtimeExactHead:sha,pathwayId:"pathway-1",contentVersion:"v2",publicationId:"pub-1"};
const manifestDigest=()=> "sha256:"+crypto.createHash("sha256").update(stableStringify(baseManifest)).digest("hex");
const evidence=()=>({contractVersion:"atlas.smart.pathway-binding/v1",producerId:"atlas-smart-pathway-binding",producerVersion:"1",evidenceId:"bind-1",checkedAt:"2026-09-28T17:00:00Z",sourceRef:"governance:binding:1",materialSetId:"smart-set",materialSetVersion:2,manifestDigest:manifestDigest(),candidateBinding:clone(binding),authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1"});
const baseContext=()=>({candidateBinding:clone(binding),authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1",smartPathwayBindingEvidence:evidence()});

const result=buildSmartPercorsiHandoff(baseManifest,baseContext());
assert.equal(result.handoffState,"READY_FOR_Q5_INPUT");
assert.equal(result.runtimeAuthorized,false);
assert.equal(result.q5Produced,false);
assert.deepEqual(result.candidateBinding,binding);
assert.equal(Object.keys(result.candidateBinding).length,4);
assert.equal(result.smartPathwayBinding.evidenceId,"bind-1");

{const reordered={resources:clone(baseManifest.resources),publication:clone(baseManifest.publication),activityId:baseManifest.activityId,version:baseManifest.version,materialSetId:baseManifest.materialSetId,schemaVersion:baseManifest.schemaVersion}; assert.equal(buildSmartPercorsiHandoff(reordered,baseContext()).manifestDigest,result.manifestDigest);}

for(const eligibility of ["HISTORICAL_NON_PUBLISHABLE","DRAFT",undefined]){const m=clone(baseManifest);m.publication=eligibility===undefined?{}:{eligibility};expectCode(()=>buildSmartPercorsiHandoff(m,baseContext()),"NOT_PUBLICATION_CANDIDATE");}
for(const key of ["runtimeExactHead","pathwayId","contentVersion","publicationId"]){const c=baseContext();c.candidateBinding[key]="";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"CANDIDATE_BINDING_INCOMPLETE");}
{const c=baseContext();c.candidateBinding.extra="forbidden";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"CANDIDATE_BINDING_SHAPE_INVALID");}
for(const key of ["authorityRef","authorityEvidenceRef"]){const c=baseContext();c[key]="";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"AUTHORITY_INCOMPLETE");}
for(const key of ["provenanceRef","digest","publicationPath"]){const m=clone(baseManifest);m.resources[0][key]="";expectCode(()=>buildSmartPercorsiHandoff(m,baseContext()),key==="provenanceRef"?"RESOURCE_PROVENANCE_MISSING":key==="digest"?"RESOURCE_DIGEST_INVALID":"RESOURCE_PUBLICATION_PATH_INVALID");}
{const m=clone(baseManifest);m.resources[0].byteSize=-1;expectCode(()=>buildSmartPercorsiHandoff(m,baseContext()),"RESOURCE_SIZE_INVALID");}
for(const forbidden of ["q5Evidence","q6Evidence","q1Evidence"]){const c=baseContext();c[forbidden]={};expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"FORBIDDEN_EVIDENCE_INJECTION");}
{const c=baseContext();c.runtimeAuthorized=true;expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"RUNTIME_AUTHORIZATION_FORBIDDEN");}

for(const mutate of [
  e=>e.contractVersion="foreign/v1",
  e=>e.producerId="foreign-producer",
  e=>e.producerVersion="2",
  e=>e.evidenceId="",
  e=>e.sourceRef=""
]){const c=baseContext();mutate(c.smartPathwayBindingEvidence);expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"SMART_PATHWAY_BINDING_EVIDENCE_INVALID");}
for(const mutate of [
  e=>e.materialSetId="foreign-set",
  e=>e.materialSetVersion=99,
  e=>e.manifestDigest="sha256:"+"c".repeat(64)
]){const c=baseContext();mutate(c.smartPathwayBindingEvidence);expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"SMART_PATHWAY_BINDING_MISMATCH");}
for(const key of ["runtimeExactHead","pathwayId","contentVersion","publicationId"]){const c=baseContext();c.smartPathwayBindingEvidence.candidateBinding[key]="foreign";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"SMART_PATHWAY_BINDING_STALE");}
for(const key of ["authorityRef","authorityEvidenceRef"]){const c=baseContext();c.smartPathwayBindingEvidence[key]="foreign";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"SMART_PATHWAY_BINDING_AUTHORITY_MISMATCH");}
{const c=baseContext();c.smartPathwayBindingEvidence.checkedAt="2999-01-01T00:00:00Z";expectCode(()=>buildSmartPercorsiHandoff(baseManifest,c),"SMART_PATHWAY_BINDING_FUTURE");}

console.log("SMART-PERCORSI-BRIDGE-01: PASS");
