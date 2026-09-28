import fs from "node:fs";
import crypto from "node:crypto";

const fail = (code, message) => {
  const error = new Error(message);
  error.code = code;
  throw error;
};

const stableStringify = (value) => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify).join(",") + "]";
  const keys = Object.keys(value).sort();
  return "{" + keys.map((key) => JSON.stringify(key) + ":" + stableStringify(value[key])).join(",") + "}";
};

export function buildSmartPercorsiHandoff(manifest, context) {
  if (!manifest || manifest.schemaVersion !== "atlas.smart.materialset/v1") fail("MANIFEST_INVALID", "unsupported Smart material set");
  if (manifest.publication?.eligibility !== "PUBLICATION_CANDIDATE") fail("NOT_PUBLICATION_CANDIDATE", "Smart material set is not a publication candidate");
  if (!Number.isInteger(manifest.version) || manifest.version < 1 || !manifest.materialSetId || !manifest.activityId) fail("MANIFEST_IDENTITY_INCOMPLETE", "material set identity is incomplete");

  const binding = context?.candidateBinding;
  if (!binding || !/^[a-f0-9]{40}$/.test(binding.runtimeExactHead || "") || !binding.pathwayId || !binding.contentVersion || !binding.publicationId) {
    fail("CANDIDATE_BINDING_INCOMPLETE", "Percorsi candidate binding is incomplete");
  }
  if (!context?.authorityRef || !context?.authorityEvidenceRef) fail("AUTHORITY_INCOMPLETE", "governed authority is required");
  if (!context?.smartPathwayBindingRef) fail("SMART_PATHWAY_BINDING_MISSING", "governed Smart to pathway binding is required");

  for (const forbidden of ["q5Evidence","q6Evidence","q1Evidence"]) {
    if (context?.[forbidden] != null) fail("FORBIDDEN_EVIDENCE_INJECTION", forbidden + " cannot be supplied to the bridge");
  }
  if (context?.runtimeAuthorized === true) fail("RUNTIME_AUTHORIZATION_FORBIDDEN", "bridge cannot authorize runtime");

  const required = (manifest.resources || []).filter((r) => r.required === true);
  if (required.length === 0) fail("REQUIRED_RESOURCES_MISSING", "publication candidate has no required resources");

  const resources = required.map((resource) => {
    if (!resource.resourceId) fail("RESOURCE_ID_MISSING", "required resource missing resourceId");
    if (!/^sha256:[a-f0-9]{64}$/.test(resource.digest || "")) fail("RESOURCE_DIGEST_INVALID", resource.resourceId + ": invalid digest");
    if (!Number.isInteger(resource.byteSize) || resource.byteSize < 0) fail("RESOURCE_SIZE_INVALID", resource.resourceId + ": invalid byteSize");
    if (!resource.provenanceRef) fail("RESOURCE_PROVENANCE_MISSING", resource.resourceId + ": missing provenanceRef");
    if (typeof resource.publicationPath !== "string" || !resource.publicationPath.startsWith("/materials/") || resource.publicationPath.includes("..") || resource.publicationPath.includes("\\") || resource.publicationPath.includes("?") || resource.publicationPath.includes("#")) {
      fail("RESOURCE_PUBLICATION_PATH_INVALID", resource.resourceId + ": invalid publicationPath");
    }
    return {
      resourceId: resource.resourceId,
      digest: resource.digest,
      byteSize: resource.byteSize,
      publicationPath: resource.publicationPath,
      provenanceRef: resource.provenanceRef
    };
  });

  const manifestDigest = "sha256:" + crypto.createHash("sha256").update(stableStringify(manifest)).digest("hex");

  return {
    schemaVersion: "atlas.smart.percorsi-handoff/v1",
    manifestDigest,
    materialSet: {
      materialSetId: manifest.materialSetId,
      version: manifest.version,
      activityId: manifest.activityId,
      eligibility: "PUBLICATION_CANDIDATE"
    },
    candidateBinding: { ...binding },
    authorityRef: context.authorityRef,
    authorityEvidenceRef: context.authorityEvidenceRef,
    smartPathwayBindingRef: context.smartPathwayBindingRef,
    resources,
    handoffState: "READY_FOR_Q5_INPUT",
    runtimeAuthorized: false,
    q5Produced: false
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [manifestPath, contextPath] = process.argv.slice(2);
  if (!manifestPath || !contextPath) {
    console.error("usage: node scripts/build-smart-percorsi-handoff.mjs <manifest.json> <context.json>");
    process.exit(2);
  }
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const context = JSON.parse(fs.readFileSync(contextPath, "utf8"));
    console.log(JSON.stringify(buildSmartPercorsiHandoff(manifest, context), null, 2));
  } catch (error) {
    console.error(`${error.code || "BRIDGE_ERROR"}: ${error.message}`);
    process.exit(2);
  }
}
