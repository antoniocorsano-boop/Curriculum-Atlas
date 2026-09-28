import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const manifestPath = path.join(root, "content/smart-activities/sistema-tecnologico/material-set.v1.json");
const requiredFiles = [
  "scripts/register-smart-asset.mjs",
  "scripts/build-smart-material-publication.mjs",
  "scripts/verify-smart-public-asset.mjs",
  "scripts/verify-smart-published-materialset.mjs",
  "scripts/apply-smart-asset-receipt.mjs",
  "scripts/validate-smart-materialset.mjs",
  "docs/contracts/ATLAS-SMART-ASSET-01.md",
  "docs/contracts/ATLAS-SMART-PUBLISH-ADAPTER-01.md"
];
const errors = [];
for (const rel of requiredFiles) if (!fs.existsSync(path.join(root, rel))) errors.push(`missing workflow component: ${rel}`);
if (!fs.existsSync(manifestPath)) errors.push("missing SP-01 canonical JSON material set");

let manifest = null;
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); }
  catch (error) { errors.push(`SP-01 material set is not valid JSON: ${error.message}`); }
}
const resources = Array.isArray(manifest?.resources) ? manifest.resources : [];
const requiredResources = resources.filter((resource) => resource.required === true);
if (requiredResources.length === 0) errors.push("SP-01 must contain required resources");
for (const resource of requiredResources) {
  if (!/^sha256:[a-f0-9]{64}$/.test(resource.digest || "")) errors.push(`${resource.resourceId}: missing verified digest`);
  if (!Number.isInteger(resource.byteSize) || resource.byteSize < 0) errors.push(`${resource.resourceId}: missing byteSize`);
  if (typeof resource.publicationPath !== "string" || !resource.publicationPath.startsWith("/materials/")) errors.push(`${resource.resourceId}: missing canonical publicationPath`);
  if (!resource.publicRef && resource.verificationState !== "BYTES_VERIFIED_PUBLICATION_PENDING") errors.push(`${resource.resourceId}: unresolved publicRef must remain publication pending`);
  if (!resource.provenanceRef && resource.verificationState !== "BYTES_VERIFIED_PUBLICATION_PENDING") errors.push(`${resource.resourceId}: unresolved provenance must remain publication pending`);
}
if (manifest?.readiness?.packageReady !== false) errors.push("SP-01 must remain packageReady=false while required publication is unresolved");
const blockers = new Set(manifest?.readiness?.blockingReasons || []);
if (!blockers.has("REQUIRED_PUBLIC_REFS_UNRESOLVED")) errors.push("missing REQUIRED_PUBLIC_REFS_UNRESOLVED blocker");
if (!blockers.has("REQUIRED_BINARY_PUBLICATION_PENDING")) errors.push("missing REQUIRED_BINARY_PUBLICATION_PENDING blocker");
if (manifest?.publication?.humanDecisionRequired !== true) errors.push("human publication decision must remain required");
if (manifest?.crossSystem?.runtimeAdapterAuthorized !== false) errors.push("cross-system runtime adapter must remain unauthorized");

for (const [args, label] of [
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/valid/draft.json"], "valid draft"],
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/invalid/false-ready.json", "--expect-invalid"], "false-ready negative"],
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/invalid/publication-path.json", "--expect-invalid"], "publication-path negative"],
  [["scripts/validate-smart-materialset.mjs", manifestPath], "canonical SP-01"]
]) {
  const run = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (run.status !== 0) errors.push(`${label} validator failed: ${(run.stderr || run.stdout).trim()}`);
}

// Adversarial pre-network boundary: a required resource without provenance must
// fail before any fetch is attempted.
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-smart-boundary-"));
try {
  const missingProvenance = {
    schemaVersion: "atlas.smart.materialset/v1", materialSetId: "negative-missing-provenance", version: 1,
    resources: [{ resourceId: "required", required: true, publicationPath: "/materials/x.bin", digest: `sha256:${"0".repeat(64)}`, byteSize: 1, provenanceRef: null }]
  };
  const negativePath = path.join(tmp, "missing-provenance.json");
  fs.writeFileSync(negativePath, JSON.stringify(missingProvenance));
  const negative = spawnSync(process.execPath, ["scripts/verify-smart-published-materialset.mjs", "--manifest", negativePath, "--base-url", "https://example.invalid", "--out-dir", path.join(tmp, "receipts")], { cwd: root, encoding: "utf8" });
  if (negative.status === 0 || !`${negative.stderr}${negative.stdout}`.includes("required resource missing provenanceRef")) errors.push("publication verifier must fail closed for required resource missing provenanceRef");

  // Static adversarial assertions for the network verifier: it must hash fetched
  // response bytes, fail on mismatch, and write a receipt only after the match.
  const verifierSource = fs.readFileSync(path.join(root, "scripts/verify-smart-public-asset.mjs"), "utf8");
  const hashPos = verifierSource.indexOf('crypto.createHash("sha256").update(bytes)');
  const mismatchPos = verifierSource.indexOf("if (actual !== expectedDigest) fail");
  const receiptPos = verifierSource.indexOf("fs.writeFileSync(out");
  if (hashPos < 0 || mismatchPos < 0 || receiptPos < 0 || !(hashPos < mismatchPos && mismatchPos < receiptPos)) {
    errors.push("network verifier must hash fetched bytes, reject digest mismatch, then emit receipt");
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (errors.length) {
  console.error("SP-01 SMART FLOW QUALIFICATION: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`SP-01 SMART FLOW QUALIFICATION: PASS — ${requiredResources.length} required resources checked from canonical JSON; adversarial fail-closed publication boundary preserved.`);
