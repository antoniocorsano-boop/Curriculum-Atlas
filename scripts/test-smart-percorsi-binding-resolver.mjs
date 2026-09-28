import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createGovernedSmartPercorsiBindingResolver,loadGovernedSmartPercorsiRegistry,__testOnlyResolveBindingEvidenceFromDocument,__testOnlyValidateRegistryDocument,__testOnlyCanonicalRepositoryRoot} from "./smart-percorsi-binding-resolver.mjs";

const stable=v=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const expectCode=async(fn,code)=>{await assert.rejects(async()=>fn(),e=>e?.code===code);};
const manifest={schemaVersion:"atlas.smart.materialset/v1",materialSetId:"set-1",version:2,activityId:"activity-1",publication:{eligibility:"PUBLICATION_CANDIDATE"},resources:[{resourceId:"r",required:true,digest:"sha256:"+"b".repeat(64),byteSize:1,publicationPath:"/materials/r.bin",provenanceRef:"source:r"}]};
const md="sha256:"+crypto.createHash("sha256").update(stable(manifest)).digest("hex");
const binding={runtimeExactHead:"a".repeat(40),pathwayId:"pw-1",contentVersion:"v2",publicationId:"pub-1"};
const entry={bindingRef:"binding:set-1:pw-1:v2",status:"ACTIVE",materialSetId:"set-1",materialSetVersion:2,manifestDigest:md,candidateBinding:binding,authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1",checkedAt:"2026-09-28T18:00:00Z",governanceRef:"review:test"};
const registry=(bindings=[entry])=>({schemaVersion:"atlas.smart.pathway-binding-registry/v1",status:"GOVERNED",authorityModel:"HUMAN_REVIEWED_REPOSITORY_REGISTRY",bindings});

{
 const canonical=loadGovernedSmartPercorsiRegistry();
 assert.equal(canonical.bindings.length,0,"canonical registry must remain empty in this tranche");
 const resolver=createGovernedSmartPercorsiBindingResolver();
 await expectCode(()=>resolver.resolveBindingEvidence("binding:not-registered"),"BINDING_NOT_FOUND");
 const expected=path.resolve(fileURLToPath(new URL("../",import.meta.url)));
 assert.equal(__testOnlyCanonicalRepositoryRoot(),expected);
 assert.equal(createGovernedSmartPercorsiBindingResolver.length,0,"canonical resolver exposes no root argument");
}

{
 const evidence=__testOnlyResolveBindingEvidenceFromDocument(registry(),entry.bindingRef);
 assert.equal(evidence.sourceRef,entry.bindingRef);
 assert.equal(evidence.manifestDigest,md);
 assert.ok(/^binding-evidence:sha256:[a-f0-9]{64}$/.test(evidence.evidenceId));
}
await expectCode(()=>__testOnlyResolveBindingEvidenceFromDocument(registry([{...entry,status:"REVOKED"}]),entry.bindingRef),"BINDING_NOT_ACTIVE");
await expectCode(()=>__testOnlyResolveBindingEvidenceFromDocument(registry([entry,{...entry}]),entry.bindingRef),"BINDING_REGISTRY_DUPLICATE_REF");

for(const mutate of [
 r=>r.extra=true,
 r=>r.bindings[0].extra=true,
 r=>r.bindings[0].candidateBinding.extra=true,
 r=>r.bindings[0].checkedAt="not-a-date",
 r=>r.bindings[0].checkedAt="2026-02-31T18:00:00Z",
 r=>r.bindings[0].manifestDigest="bad",
 r=>r.bindings[0].status="UNKNOWN"
]){
 const r=registry();mutate(r);
 await expectCode(()=>__testOnlyValidateRegistryDocument(r),"BINDING_REGISTRY_SCHEMA_INVALID");
}

console.log("SMART-PERCORSI-BINDING-RESOLVER-01: PASS");
