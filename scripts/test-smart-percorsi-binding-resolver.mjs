import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {createGovernedSmartPercorsiBindingResolver,loadGovernedSmartPercorsiRegistry,CANONICAL_BINDING_REGISTRY} from "./smart-percorsi-binding-resolver.mjs";
import {buildSmartPercorsiHandoffFromGovernedRegistry} from "./build-smart-percorsi-handoff-from-registry.mjs";

const clone=v=>structuredClone(v);
const stable=v=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const expectCode=async(fn,code)=>{await assert.rejects(fn,e=>e?.code===code);};
const manifest={schemaVersion:"atlas.smart.materialset/v1",materialSetId:"set-1",version:2,activityId:"activity-1",publication:{eligibility:"PUBLICATION_CANDIDATE"},resources:[{resourceId:"r",required:true,digest:"sha256:"+"b".repeat(64),byteSize:1,publicationPath:"/materials/r.bin",provenanceRef:"source:r"}]};
const md="sha256:"+crypto.createHash("sha256").update(stable(manifest)).digest("hex");
const binding={runtimeExactHead:"a".repeat(40),pathwayId:"pw-1",contentVersion:"v2",publicationId:"pub-1"};
const entry={bindingRef:"binding:set-1:pw-1:v2",status:"ACTIVE",materialSetId:"set-1",materialSetVersion:2,manifestDigest:md,candidateBinding:binding,authorityRef:"arena:authority:1",authorityEvidenceRef:"evidence:authority:1",checkedAt:"2026-09-28T18:00:00Z",governanceRef:"review:test"};
const registry=(bindings=[entry])=>({schemaVersion:"atlas.smart.pathway-binding-registry/v1",status:"GOVERNED",authorityModel:"HUMAN_REVIEWED_REPOSITORY_REGISTRY",bindings});
const context={candidateBinding:binding,authorityRef:entry.authorityRef,authorityEvidenceRef:entry.authorityEvidenceRef,smartPathwayBindingRef:entry.bindingRef};

function withRegistry(value){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"smart-percorsi-resolver-"));
  const full=path.join(root,CANONICAL_BINDING_REGISTRY);
  fs.mkdirSync(path.dirname(full),{recursive:true});
  fs.writeFileSync(full,JSON.stringify(value,null,2));
  return root;
}

{
  const root=withRegistry(registry());
  const resolver=createGovernedSmartPercorsiBindingResolver({root});
  const evidence=await resolver.resolveBindingEvidence(entry.bindingRef);
  assert.equal(evidence.sourceRef,entry.bindingRef);
  assert.equal(evidence.manifestDigest,md);
  assert.ok(/^binding-evidence:sha256:[a-f0-9]{64}$/.test(evidence.evidenceId));
  const handoff=await buildSmartPercorsiHandoffFromGovernedRegistry(manifest,context,{root});
  assert.equal(handoff.handoffState,"READY_FOR_Q5_INPUT");
  assert.equal(handoff.runtimeAuthorized,false);
}

{
  const canonical=loadGovernedSmartPercorsiRegistry(process.cwd());
  assert.equal(canonical.bindings.length,0,"production registry must start with zero active or inactive bindings");
  const resolver=createGovernedSmartPercorsiBindingResolver();
  await expectCode(()=>resolver.resolveBindingEvidence("binding:not-registered"),"BINDING_NOT_FOUND");
}

{
  const root=withRegistry(registry([{...entry,status:"REVOKED"}]));
  await expectCode(()=>createGovernedSmartPercorsiBindingResolver({root}).resolveBindingEvidence(entry.bindingRef),"BINDING_NOT_ACTIVE");
}
{
  const root=withRegistry(registry([entry,{...entry}]));
  await expectCode(()=>createGovernedSmartPercorsiBindingResolver({root}).resolveBindingEvidence(entry.bindingRef),"BINDING_REGISTRY_DUPLICATE_OR_MISSING_REF");
}
{
  const bad=clone(entry);bad.candidateBinding.extra="x";
  const root=withRegistry(registry([bad]));
  await expectCode(()=>createGovernedSmartPercorsiBindingResolver({root}).resolveBindingEvidence(entry.bindingRef),"BINDING_REGISTRY_ENTRY_INVALID");
}
{
  const root=withRegistry({schemaVersion:"foreign/v1",status:"GOVERNED",authorityModel:"HUMAN_REVIEWED_REPOSITORY_REGISTRY",bindings:[]});
  await expectCode(()=>createGovernedSmartPercorsiBindingResolver({root}).resolveBindingEvidence("x"),"BINDING_REGISTRY_INVALID");
}
{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"smart-percorsi-missing-"));
  await expectCode(()=>createGovernedSmartPercorsiBindingResolver({root}).resolveBindingEvidence("x"),"BINDING_REGISTRY_UNAVAILABLE");
}

console.log("SMART-PERCORSI-BINDING-RESOLVER-01: PASS");
