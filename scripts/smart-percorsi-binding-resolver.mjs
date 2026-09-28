import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

export const CANONICAL_BINDING_REGISTRY="governance/smart-percorsi-binding-registry.json";
export const CANONICAL_BINDING_REGISTRY_SCHEMA="schemas/smart-percorsi-binding-registry.schema.json";
const REPOSITORY_ROOT=path.resolve(fileURLToPath(new URL("../",import.meta.url)));
const fail=(code,message)=>{const e=new Error(message);e.code=code;throw e;};
const stable=v=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const bindingKeys=["runtimeExactHead","pathwayId","contentVersion","publicationId"];

function validateBySchema(value,schema,at="$"){
  if(schema.const!==undefined && value!==schema.const) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" must equal const");
  if(schema.enum && !schema.enum.includes(value)) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" has unsupported value");
  if(schema.type){
    const ok=schema.type==="object"?value!==null&&typeof value==="object"&&!Array.isArray(value):
      schema.type==="array"?Array.isArray(value):
      schema.type==="string"?typeof value==="string":
      schema.type==="integer"?Number.isInteger(value):
      schema.type==="number"?typeof value==="number"&&Number.isFinite(value):
      schema.type==="boolean"?typeof value==="boolean":true;
    if(!ok) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" has invalid type");
  }
  if(typeof value==="string"){
    if(schema.minLength!=null && value.length<schema.minLength) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" is too short");
    if(schema.pattern && !(new RegExp(schema.pattern)).test(value)) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" does not match pattern");
    if(schema.format==="date-time" && (Number.isNaN(Date.parse(value)) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value))) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" is not RFC3339 date-time");
  }
  if(Number.isInteger(value) && schema.minimum!=null && value<schema.minimum) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" is below minimum");
  if(Array.isArray(value)){
    if(schema.minItems!=null && value.length<schema.minItems) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" has too few items");
    if(schema.items) value.forEach((x,i)=>validateBySchema(x,schema.items,at+"["+i+"]"));
  } else if(value!==null&&typeof value==="object"){
    for(const key of schema.required||[]) if(!Object.prototype.hasOwnProperty.call(value,key)) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" missing required "+key);
    if(schema.additionalProperties===false){
      const allowed=new Set(Object.keys(schema.properties||{}));
      for(const key of Object.keys(value)) if(!allowed.has(key)) fail("BINDING_REGISTRY_SCHEMA_INVALID",at+" contains extra property "+key);
    }
    for(const [key,sub] of Object.entries(schema.properties||{})) if(Object.prototype.hasOwnProperty.call(value,key)) validateBySchema(value[key],sub,at+"."+key);
  }
}

function loadCanonicalSchema(){
  try{return JSON.parse(fs.readFileSync(path.join(REPOSITORY_ROOT,CANONICAL_BINDING_REGISTRY_SCHEMA),"utf8"));}
  catch{fail("BINDING_REGISTRY_SCHEMA_UNAVAILABLE","canonical registry schema cannot be read");}
}

function validateRegistry(registry){
  validateBySchema(registry,loadCanonicalSchema());
  const refs=new Set();
  for(const entry of registry.bindings){
    if(refs.has(entry.bindingRef)) fail("BINDING_REGISTRY_DUPLICATE_REF","bindingRef must be unique");
    refs.add(entry.bindingRef);
  }
  return registry;
}

function resolveFromRegistry(registry,bindingRef){
  if(typeof bindingRef!=="string"||!bindingRef) fail("BINDING_REF_INVALID","bindingRef is required");
  const validated=validateRegistry(registry);
  const entry=validated.bindings.find(x=>x.bindingRef===bindingRef);
  if(!entry) fail("BINDING_NOT_FOUND","no governed Smart Percorsi binding exists");
  if(entry.status!=="ACTIVE") fail("BINDING_NOT_ACTIVE","governed binding is not active");
  const evidenceId="binding-evidence:sha256:"+crypto.createHash("sha256").update(stable(entry)).digest("hex");
  return {
    contractVersion:"atlas.smart.pathway-binding/v1",producerId:"atlas-smart-pathway-binding",producerVersion:"1",
    evidenceId,checkedAt:entry.checkedAt,sourceRef:entry.bindingRef,materialSetId:entry.materialSetId,materialSetVersion:entry.materialSetVersion,
    manifestDigest:entry.manifestDigest,candidateBinding:Object.fromEntries(bindingKeys.map(k=>[k,entry.candidateBinding[k]])),
    authorityRef:entry.authorityRef,authorityEvidenceRef:entry.authorityEvidenceRef
  };
}

export function loadGovernedSmartPercorsiRegistry(){
  const full=path.join(REPOSITORY_ROOT,CANONICAL_BINDING_REGISTRY);
  let parsed;
  try{parsed=JSON.parse(fs.readFileSync(full,"utf8"));}catch{fail("BINDING_REGISTRY_UNAVAILABLE","canonical binding registry cannot be read");}
  return validateRegistry(parsed);
}

export function createGovernedSmartPercorsiBindingResolver(){
  return {
    adapterId:"atlas-smart-pathway-binding-resolver",adapterVersion:"1",
    async resolveBindingEvidence(bindingRef){return resolveFromRegistry(loadGovernedSmartPercorsiRegistry(),bindingRef);}
  };
}

export function __testOnlyResolveBindingEvidenceFromDocument(registry,bindingRef){return resolveFromRegistry(registry,bindingRef);}
export function __testOnlyValidateRegistryDocument(registry){return validateRegistry(registry);}
export function __testOnlyCanonicalRepositoryRoot(){return REPOSITORY_ROOT;}
