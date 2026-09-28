import fs from "node:fs";
import crypto from "node:crypto";

const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const stableStringify=(value)=>value===null||typeof value!=="object"?JSON.stringify(value):Array.isArray(value)?"["+value.map(stableStringify).join(",")+"]":"{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+stableStringify(value[k])).join(",")+"}";
const bindingKeys=["runtimeExactHead","pathwayId","contentVersion","publicationId"];
const normalizeBinding=(binding)=>{
  if(!binding||Object.keys(binding).sort().join("|")!==[...bindingKeys].sort().join("|")) fail("CANDIDATE_BINDING_SHAPE_INVALID","candidate binding must contain exactly the four governed fields");
  if(!/^[a-f0-9]{40}$/.test(binding.runtimeExactHead||"")||!binding.pathwayId||!binding.contentVersion||!binding.publicationId) fail("CANDIDATE_BINDING_INCOMPLETE","Percorsi candidate binding is incomplete");
  return Object.fromEntries(bindingKeys.map(k=>[k,binding[k]]));
};
const sameBinding=(a,b)=>bindingKeys.every(k=>a?.[k]===b?.[k]);

export async function buildSmartPercorsiHandoff(manifest,context,bindingAdapter){
  if(!manifest||manifest.schemaVersion!=="atlas.smart.materialset/v1") fail("MANIFEST_INVALID","unsupported Smart material set");
  if(manifest.publication?.eligibility!=="PUBLICATION_CANDIDATE") fail("NOT_PUBLICATION_CANDIDATE","Smart material set is not a publication candidate");
  if(!Number.isInteger(manifest.version)||manifest.version<1||!manifest.materialSetId||!manifest.activityId) fail("MANIFEST_IDENTITY_INCOMPLETE","material set identity is incomplete");

  const binding=normalizeBinding(context?.candidateBinding);
  if(!context?.authorityRef||!context?.authorityEvidenceRef) fail("AUTHORITY_INCOMPLETE","governed authority is required");
  if(!context?.smartPathwayBindingRef) fail("SMART_PATHWAY_BINDING_REF_MISSING","governed Smart pathway binding reference is required");
  if(context?.smartPathwayBindingEvidence!=null) fail("PREBUILT_BINDING_EVIDENCE_FORBIDDEN","caller-supplied binding evidence is forbidden");
  for(const forbidden of ["q5Evidence","q6Evidence","q1Evidence"]) if(context?.[forbidden]!=null) fail("FORBIDDEN_EVIDENCE_INJECTION",forbidden+" cannot be supplied to the bridge");
  if(context?.runtimeAuthorized===true) fail("RUNTIME_AUTHORIZATION_FORBIDDEN","bridge cannot authorize runtime");

  if(!bindingAdapter||bindingAdapter.adapterId!=="atlas-smart-pathway-binding-resolver"||bindingAdapter.adapterVersion!=="1"||typeof bindingAdapter.resolveBindingEvidence!=="function") {
    fail("SMART_PATHWAY_BINDING_ADAPTER_INVALID","supported binding resolver adapter is required");
  }

  const required=(manifest.resources||[]).filter(r=>r.required===true);
  if(required.length===0) fail("REQUIRED_RESOURCES_MISSING","publication candidate has no required resources");
  const resources=required.map(resource=>{
    if(!resource.resourceId) fail("RESOURCE_ID_MISSING","required resource missing resourceId");
    if(!/^sha256:[a-f0-9]{64}$/.test(resource.digest||"")) fail("RESOURCE_DIGEST_INVALID",resource.resourceId+": invalid digest");
    if(!Number.isInteger(resource.byteSize)||resource.byteSize<0) fail("RESOURCE_SIZE_INVALID",resource.resourceId+": invalid byteSize");
    if(!resource.provenanceRef) fail("RESOURCE_PROVENANCE_MISSING",resource.resourceId+": missing provenanceRef");
    if(typeof resource.publicationPath!=="string"||!resource.publicationPath.startsWith("/materials/")||resource.publicationPath.includes("..")||resource.publicationPath.includes("\\")||resource.publicationPath.includes("?")||resource.publicationPath.includes("#")) fail("RESOURCE_PUBLICATION_PATH_INVALID",resource.resourceId+": invalid publicationPath");
    return {resourceId:resource.resourceId,digest:resource.digest,byteSize:resource.byteSize,publicationPath:resource.publicationPath,provenanceRef:resource.provenanceRef};
  });

  const manifestDigest="sha256:"+crypto.createHash("sha256").update(stableStringify(manifest)).digest("hex");
  let evidence;
  try { evidence=await bindingAdapter.resolveBindingEvidence(context.smartPathwayBindingRef); }
  catch { fail("SMART_PATHWAY_BINDING_RESOLUTION_BLOCKED","binding evidence resolution failed"); }

  if(!evidence||evidence.contractVersion!=="atlas.smart.pathway-binding/v1"||evidence.producerId!=="atlas-smart-pathway-binding"||evidence.producerVersion!=="1") fail("SMART_PATHWAY_BINDING_EVIDENCE_INVALID","supported structured Smart pathway binding evidence is required");
  if(!evidence.evidenceId||!evidence.sourceRef||!evidence.checkedAt||Number.isNaN(Date.parse(evidence.checkedAt))) fail("SMART_PATHWAY_BINDING_EVIDENCE_INVALID","binding evidence envelope is incomplete");
  if(evidence.sourceRef!==context.smartPathwayBindingRef) fail("SMART_PATHWAY_BINDING_SOURCE_MISMATCH","resolved evidence source does not match requested binding reference");
  if(Date.parse(evidence.checkedAt)>Date.now()+300000) fail("SMART_PATHWAY_BINDING_FUTURE","binding evidence checkedAt is in the future");
  if(evidence.materialSetId!==manifest.materialSetId||evidence.materialSetVersion!==manifest.version||evidence.manifestDigest!==manifestDigest) fail("SMART_PATHWAY_BINDING_MISMATCH","binding evidence does not match current Smart material set");
  if(!sameBinding(evidence.candidateBinding,binding)) fail("SMART_PATHWAY_BINDING_STALE","binding evidence does not match current Percorsi candidate identity");
  if(evidence.authorityRef!==context.authorityRef||evidence.authorityEvidenceRef!==context.authorityEvidenceRef) fail("SMART_PATHWAY_BINDING_AUTHORITY_MISMATCH","binding evidence authority does not match governed context");

  return {
    schemaVersion:"atlas.smart.percorsi-handoff/v1",manifestDigest,
    materialSet:{materialSetId:manifest.materialSetId,version:manifest.version,activityId:manifest.activityId,eligibility:"PUBLICATION_CANDIDATE"},
    candidateBinding:binding,authorityRef:context.authorityRef,authorityEvidenceRef:context.authorityEvidenceRef,
    smartPathwayBinding:{contractVersion:evidence.contractVersion,producerId:evidence.producerId,producerVersion:evidence.producerVersion,evidenceId:evidence.evidenceId,checkedAt:evidence.checkedAt,sourceRef:evidence.sourceRef},
    resources,handoffState:"READY_FOR_Q5_INPUT",runtimeAuthorized:false,q5Produced:false
  };
}

if(import.meta.url===`file://${process.argv[1]}`){
  console.error("SMART_PATHWAY_BINDING_ADAPTER_REQUIRED: CLI materialization requires a governed binding adapter; direct file-only execution is intentionally disabled");
  process.exit(2);
}
