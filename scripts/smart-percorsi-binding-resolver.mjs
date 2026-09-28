import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const CANONICAL_BINDING_REGISTRY = "governance/smart-percorsi-binding-registry.json";

const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const stable=v=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const bindingKeys=["runtimeExactHead","pathwayId","contentVersion","publicationId"];

function validateRegistry(registry){
  if(!registry||registry.schemaVersion!=="atlas.smart.pathway-binding-registry/v1"||registry.status!=="GOVERNED"||registry.authorityModel!=="HUMAN_REVIEWED_REPOSITORY_REGISTRY"||!Array.isArray(registry.bindings)){
    fail("BINDING_REGISTRY_INVALID","governed binding registry envelope is invalid");
  }
  const refs=new Set();
  for(const entry of registry.bindings){
    if(!entry||!entry.bindingRef||refs.has(entry.bindingRef)) fail("BINDING_REGISTRY_DUPLICATE_OR_MISSING_REF","bindingRef must be non-empty and unique");
    refs.add(entry.bindingRef);
    if(!["ACTIVE","REVOKED"].includes(entry.status)) fail("BINDING_REGISTRY_ENTRY_INVALID","unsupported binding status");
    if(!entry.materialSetId||!Number.isInteger(entry.materialSetVersion)||entry.materialSetVersion<1||!/^sha256:[a-f0-9]{64}$/.test(entry.manifestDigest||"")) fail("BINDING_REGISTRY_ENTRY_INVALID","Smart identity is invalid");
    if(!entry.candidateBinding||Object.keys(entry.candidateBinding).sort().join("|")!==[...bindingKeys].sort().join("|")) fail("BINDING_REGISTRY_ENTRY_INVALID","candidate binding shape is invalid");
    if(!/^[a-f0-9]{40}$/.test(entry.candidateBinding.runtimeExactHead||"")||!entry.candidateBinding.pathwayId||!entry.candidateBinding.contentVersion||!entry.candidateBinding.publicationId) fail("BINDING_REGISTRY_ENTRY_INVALID","candidate binding is incomplete");
    if(!entry.authorityRef||!entry.authorityEvidenceRef||!entry.governanceRef||!entry.checkedAt||Number.isNaN(Date.parse(entry.checkedAt))) fail("BINDING_REGISTRY_ENTRY_INVALID","authority/governance metadata is incomplete");
  }
  return registry;
}

export function loadGovernedSmartPercorsiRegistry(root=process.cwd()){
  const full=path.resolve(root,CANONICAL_BINDING_REGISTRY);
  const expectedRoot=path.resolve(root);
  if(!full.startsWith(expectedRoot+path.sep)) fail("BINDING_REGISTRY_PATH_INVALID","canonical registry escaped repository root");
  let parsed;
  try { parsed=JSON.parse(fs.readFileSync(full,"utf8")); }
  catch { fail("BINDING_REGISTRY_UNAVAILABLE","canonical binding registry cannot be read"); }
  return validateRegistry(parsed);
}

export function createGovernedSmartPercorsiBindingResolver({root=process.cwd()}={}){
  return {
    adapterId:"atlas-smart-pathway-binding-resolver",
    adapterVersion:"1",
    async resolveBindingEvidence(bindingRef){
      if(typeof bindingRef!=="string"||!bindingRef) fail("BINDING_REF_INVALID","bindingRef is required");
      const registry=loadGovernedSmartPercorsiRegistry(root);
      const entry=registry.bindings.find(x=>x.bindingRef===bindingRef);
      if(!entry) fail("BINDING_NOT_FOUND","no governed Smart Percorsi binding exists");
      if(entry.status!=="ACTIVE") fail("BINDING_NOT_ACTIVE","governed binding is not active");
      const evidenceId="binding-evidence:sha256:"+crypto.createHash("sha256").update(stable(entry)).digest("hex");
      return {
        contractVersion:"atlas.smart.pathway-binding/v1",
        producerId:"atlas-smart-pathway-binding",
        producerVersion:"1",
        evidenceId,
        checkedAt:entry.checkedAt,
        sourceRef:entry.bindingRef,
        materialSetId:entry.materialSetId,
        materialSetVersion:entry.materialSetVersion,
        manifestDigest:entry.manifestDigest,
        candidateBinding:Object.fromEntries(bindingKeys.map(k=>[k,entry.candidateBinding[k]])),
        authorityRef:entry.authorityRef,
        authorityEvidenceRef:entry.authorityEvidenceRef
      };
    }
  };
}
