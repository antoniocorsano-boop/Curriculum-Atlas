import assert from "node:assert/strict";
import crypto from "node:crypto";
import {buildSmartPercorsiHandoff} from "./build-smart-percorsi-handoff.mjs";

const stable=v=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const clone=v=>structuredClone(v);
const expectCode=async(fn,code)=>{await assert.rejects(fn,e=>e?.code===code);};
const sha="a".repeat(40),digest="sha256:"+"b".repeat(64);
const manifest={schemaVersion:"atlas.smart.materialset/v1",materialSetId:"smart-set",version:2,activityId:"activity-1",publication:{eligibility:"PUBLICATION_CANDIDATE"},resources:[{resourceId:"r1",required:true,digest,byteSize:123,publicationPath:"/materials/smart/r1.bin",provenanceRef:"source:verified"}]};
const binding={runtimeExactHead:sha,pathwayId:"pathway-1",contentVersion:"v2",publicationId:"pub-1"};
const md=()=> "sha256:"+crypto.createHash("sha256").update(stable(manifest)).digest("hex");
const evidence=()=>({contractVersion:"atlas.smart.pathway-binding/v1",producerId:"atlas-smart-pathway-binding",producerVersion:"1",evidenceId:"bind-1",checkedAt:"2026-09-28T17:00:00Z",sourceRef:"governance:binding:1",materialSetId:"smart-set",materialSetVersion:2,manifestDigest:md(),candidateBinding:clone(binding),authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1"});
const context=()=>({candidateBinding:clone(binding),authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1",smartPathwayBindingRef:"governance:binding:1"});
const adapter=(mutate)=>({adapterId:"atlas-smart-pathway-binding-resolver",adapterVersion:"1",calls:[],async resolveBindingEvidence(ref){this.calls.push(ref);const e=evidence();if(mutate)mutate(e);return e;}});

const a=adapter(); const result=await buildSmartPercorsiHandoff(manifest,context(),a);
assert.deepEqual(a.calls,["governance:binding:1"]);
assert.equal(result.handoffState,"READY_FOR_Q5_INPUT");assert.equal(result.runtimeAuthorized,false);assert.equal(result.q5Produced,false);assert.deepEqual(result.candidateBinding,binding);

{const c=context();c.smartPathwayBindingEvidence=evidence();await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"PREBUILT_BINDING_EVIDENCE_FORBIDDEN");}
await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),null),"SMART_PATHWAY_BINDING_ADAPTER_INVALID");
await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),{adapterId:"foreign",adapterVersion:"1",resolveBindingEvidence:async()=>evidence()}),"SMART_PATHWAY_BINDING_ADAPTER_INVALID");
await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),{adapterId:"atlas-smart-pathway-binding-resolver",adapterVersion:"1",resolveBindingEvidence:async()=>{throw new Error("down");}}),"SMART_PATHWAY_BINDING_RESOLUTION_BLOCKED");

{const c=context();c.candidateBinding.extra="x";await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"CANDIDATE_BINDING_SHAPE_INVALID");}
for(const key of ["runtimeExactHead","pathwayId","contentVersion","publicationId"]){const c=context();c.candidateBinding[key]="";await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"CANDIDATE_BINDING_INCOMPLETE");}
for(const key of ["authorityRef","authorityEvidenceRef"]){const c=context();c[key]="";await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"AUTHORITY_INCOMPLETE");}
{const c=context();c.smartPathwayBindingRef="";await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"SMART_PATHWAY_BINDING_REF_MISSING");}

for(const mutate of [e=>e.contractVersion="foreign/v1",e=>e.producerId="foreign",e=>e.producerVersion="2",e=>e.evidenceId=""]){await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(mutate)),"SMART_PATHWAY_BINDING_EVIDENCE_INVALID");}
await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(e=>e.sourceRef="governance:foreign")),"SMART_PATHWAY_BINDING_SOURCE_MISMATCH");
for(const mutate of [e=>e.materialSetId="foreign",e=>e.materialSetVersion=99,e=>e.manifestDigest="sha256:"+"c".repeat(64)]) await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(mutate)),"SMART_PATHWAY_BINDING_MISMATCH");
for(const key of ["runtimeExactHead","pathwayId","contentVersion","publicationId"]) await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(e=>e.candidateBinding[key]="foreign")),"SMART_PATHWAY_BINDING_STALE");
for(const key of ["authorityRef","authorityEvidenceRef"]) await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(e=>e[key]="foreign")),"SMART_PATHWAY_BINDING_AUTHORITY_MISMATCH");
await expectCode(()=>buildSmartPercorsiHandoff(manifest,context(),adapter(e=>e.checkedAt="2999-01-01T00:00:00Z")),"SMART_PATHWAY_BINDING_FUTURE");

for(const forbidden of ["q5Evidence","q6Evidence","q1Evidence"]){const c=context();c[forbidden]={};await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"FORBIDDEN_EVIDENCE_INJECTION");}
{const c=context();c.runtimeAuthorized=true;await expectCode(()=>buildSmartPercorsiHandoff(manifest,c,adapter()),"RUNTIME_AUTHORIZATION_FORBIDDEN");}
for(const eligibility of ["HISTORICAL_NON_PUBLISHABLE","DRAFT"]){const m=clone(manifest);m.publication.eligibility=eligibility;await expectCode(()=>buildSmartPercorsiHandoff(m,context(),adapter()),"NOT_PUBLICATION_CANDIDATE");}

console.log("SMART-PERCORSI-BRIDGE-01: PASS");
