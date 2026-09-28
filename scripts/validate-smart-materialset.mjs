import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const args = process.argv.slice(2);
const manifestPath = args.find((arg) => !arg.startsWith("--"));
const expectInvalid = args.includes("--expect-invalid");

if (!manifestPath) {
  console.error("Usage: node scripts/validate-smart-materialset.mjs <manifest.json> [--expect-invalid]");
  process.exit(2);
}

const allowedRoles = new Set([
  "TEACHER_BRIEF",
  "LIM_VIEW",
  "STUDENT_HANDOUT",
  "MINI_DECK",
  "VISUAL_AID",
  "ASSESSMENT",
]);
const allowedAudiences = new Set(["STUDENT", "TEACHER", "BOTH"]);
const errors = [];
const publicationPaths = new Set();

const validPublicationPath = (value) => {
  if (typeof value !== "string" || !value.startsWith("/materials/")) return false;
  if (value.includes("\\") || value.includes("?") || value.includes("#")) return false;
  const segments = value.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) return false;
  return segments.length >= 2;
};

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error(`Cannot read manifest ${manifestPath}: ${error.message}`);
  process.exit(2);
}

if (manifest.schemaVersion !== "atlas.smart.materialset/v1") errors.push("schemaVersion must be atlas.smart.materialset/v1");
if (!manifest.materialSetId) errors.push("materialSetId is required");
if (!Number.isInteger(manifest.version) || manifest.version < 1) errors.push("version must be a positive integer");
if (!manifest.activityId) errors.push("activityId is required");
if (!Array.isArray(manifest.resources) || manifest.resources.length === 0) errors.push("resources must be a non-empty array");

for (const [index, resource] of (manifest.resources || []).entries()) {
  const label = resource.resourceId || `resources[${index}]`;
  if (!resource.resourceId) errors.push(`${label}: resourceId is required`);
  if (!allowedAudiences.has(resource.audience)) errors.push(`${label}: invalid audience`);
  if (!Array.isArray(resource.materialSlotRoles) || resource.materialSlotRoles.length === 0) {
    errors.push(`${label}: at least one materialSlotRole is required`);
  } else {
    for (const role of resource.materialSlotRoles) if (!allowedRoles.has(role)) errors.push(`${label}: invalid materialSlotRole ${role}`);
  }
  if (resource.digest && !/^sha256:[a-f0-9]{64}$/.test(resource.digest)) errors.push(`${label}: digest must be sha256:<64 lowercase hex>`);
  if (resource.byteSize != null && (!Number.isInteger(resource.byteSize) || resource.byteSize < 0)) errors.push(`${label}: byteSize must be a non-negative integer`);

  if (!validPublicationPath(resource.publicationPath)) {
    errors.push(`${label}: publicationPath must be an absolute /materials/... path without traversal, query or fragment`);
  } else if (publicationPaths.has(resource.publicationPath)) {
    errors.push(`${label}: publicationPath must be unique within the material set`);
  } else {
    publicationPaths.add(resource.publicationPath);
  }

  if (resource.localPath) {
    const absolute = path.resolve(path.dirname(manifestPath), resource.localPath);
    if (!fs.existsSync(absolute)) {
      errors.push(`${label}: localPath does not exist`);
    } else {
      const bytes = fs.readFileSync(absolute);
      const digest = `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
      if (resource.digest && digest !== resource.digest) errors.push(`${label}: local bytes digest mismatch`);
      if (resource.byteSize != null && bytes.byteLength !== resource.byteSize) errors.push(`${label}: local byteSize mismatch`);
    }
  }

  if (resource.required === true && manifest.publication?.stage === "PUBLISHED") {
    if (!resource.publicRef) errors.push(`${label}: required published resource missing publicRef`);
    if (!resource.provenanceRef) errors.push(`${label}: required published resource missing provenanceRef`);
    if (!resource.digest) errors.push(`${label}: required published resource missing digest`);
    if (!resource.publicationReceiptRef) errors.push(`${label}: required published resource missing publicationReceiptRef`);
    if ((resource.audience === "STUDENT" || resource.audience === "BOTH") && resource.anonymousReachabilityVerified !== true) {
      errors.push(`${label}: public student resource requires anonymousReachabilityVerified=true`);
    }
  }
}

if (manifest.readiness?.packageReady === true) {
  for (const resource of (manifest.resources || []).filter((item) => item.required === true)) {
    if (!resource.publicRef || !resource.provenanceRef || !resource.digest || !resource.publicationReceiptRef || !validPublicationPath(resource.publicationPath)) {
      errors.push(`${resource.resourceId}: packageReady cannot be true with unresolved required resource`);
    }
  }
}

const valid = errors.length === 0;
if (expectInvalid ? valid : !valid) {
  console.error(expectInvalid ? "Expected invalid manifest, but validation passed." : "Smart material-set validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

if (expectInvalid) {
  console.log(`PASS expected-invalid (${errors.length} finding${errors.length === 1 ? "" : "s"})`);
} else {
  console.log(`PASS ${manifest.materialSetId}@${manifest.version}: ${manifest.resources.length} resources validated`);
}
