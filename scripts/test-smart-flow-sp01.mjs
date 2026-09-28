import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const manifestPath = path.join(root, "content/smart-activities/sistema-tecnologico/material-set.v2.json");
const historicalManifestPath = path.join(root, "content/smart-activities/sistema-tecnologico/material-set.v1.json");
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
if (!fs.existsSync(manifestPath)) errors.push("missing SP-01 publication-candidate JSON material set");
if (!fs.existsSync(historicalManifestPath)) errors.push("missing SP-01 historical JSON material set");

let manifest = null;
if (fs.existsSync(manifestPath)) {
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")); }
  catch (error) { errors.push(`SP-01 material set is not valid JSON: ${error.message}`); }
}
const resources = Array.isArray(manifest?.resources) ? manifest.resources : [];
const requiredResources = resources.filter((resource) => resource.required === true);
if (requiredResources.length === 0) errors.push("SP-01 must contain required resources");
if (manifest?.publication?.eligibility !== "PUBLICATION_CANDIDATE") errors.push("SP-01 canonical material set must be an explicit publication candidate");
for (const resource of requiredResources) {
  if (!/^sha256:[a-f0-9]{64}$/.test(resource.digest || "")) errors.push(`${resource.resourceId}: missing verified digest`);
  if (!Number.isInteger(resource.byteSize) || resource.byteSize < 0) errors.push(`${resource.resourceId}: missing byteSize`);
  if (typeof resource.publicationPath !== "string" || !resource.publicationPath.startsWith("/materials/")) errors.push(`${resource.resourceId}: missing canonical publicationPath`);
  if (!resource.publicRef && resource.verificationState !== "BYTES_VERIFIED_PUBLICATION_PENDING") errors.push(`${resource.resourceId}: unresolved publicRef must remain publication pending`);
  if (!resource.provenanceRef) errors.push(`${resource.resourceId}: publication candidate required resource must have provenanceRef`);
}
if (manifest?.readiness?.packageReady !== false) errors.push("SP-01 must remain packageReady=false while required publication is unresolved");
const blockers = new Set(manifest?.readiness?.blockingReasons || []);
if (!blockers.has("REQUIRED_PUBLIC_REFS_UNRESOLVED")) errors.push("missing REQUIRED_PUBLIC_REFS_UNRESOLVED blocker");
if (!blockers.has("REQUIRED_BINARY_PUBLICATION_PENDING")) errors.push("missing REQUIRED_BINARY_PUBLICATION_PENDING blocker");
if (manifest?.publication?.humanDecisionRequired !== true) errors.push("human publication decision must remain required");
if (manifest?.crossSystem?.runtimeAdapterAuthorized !== false) errors.push("cross-system runtime adapter must remain unauthorized");

let historical = null;
if (fs.existsSync(historicalManifestPath)) {
  try { historical = JSON.parse(fs.readFileSync(historicalManifestPath, "utf8")); }
  catch (error) { errors.push(`historical SP-01 material set is not valid JSON: ${error.message}`); }
}
if (historical?.publication?.eligibility !== "HISTORICAL_NON_PUBLISHABLE") errors.push("v1 must remain explicitly historical and non-publishable");
if (historical?.readiness?.packageReady !== false) errors.push("historical v1 must remain packageReady=false");

for (const [args, label] of [
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/valid/draft.json"], "valid draft"],
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/invalid/false-ready.json", "--expect-invalid"], "false-ready negative"],
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/invalid/publication-path.json", "--expect-invalid"], "publication-path negative"],
  [["scripts/validate-smart-materialset.mjs", manifestPath], "canonical SP-01 candidate"],
  [["scripts/validate-smart-materialset.mjs", historicalManifestPath], "historical SP-01"]
]) {
  const run = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (run.status !== 0) errors.push(`${label} validator failed: ${(run.stderr || run.stdout).trim()}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-smart-boundary-"));
try {
  // A publication candidate with a required resource lacking provenance must
  // fail before any network fetch is attempted.
  const missingProvenance = {
    schemaVersion: "atlas.smart.materialset/v1", materialSetId: "negative-missing-provenance", version: 1,
    publication: { eligibility: "PUBLICATION_CANDIDATE" },
    resources: [{ resourceId: "required", required: true, publicationPath: "/materials/x.bin", digest: `sha256:${"0".repeat(64)}`, byteSize: 1, provenanceRef: null }]
  };
  const negativePath = path.join(tmp, "missing-provenance.json");
  fs.writeFileSync(negativePath, JSON.stringify(missingProvenance));
  const negative = spawnSync(process.execPath, ["scripts/verify-smart-published-materialset.mjs", "--manifest", negativePath, "--base-url", "https://example.invalid", "--out-dir", path.join(tmp, "receipts-negative")], { cwd: root, encoding: "utf8" });
  if (negative.status === 0 || !`${negative.stderr}${negative.stdout}`.includes("required resource missing provenanceRef")) errors.push("publication candidate verifier must fail closed for required resource missing provenanceRef");

  // Historical evidence may remain incomplete, but it must be explicitly
  // non-publishable and packageReady=false. It must not trigger network access.
  const historicalIncomplete = {
    schemaVersion: "atlas.smart.materialset/v1", materialSetId: "historical-incomplete", version: 1,
    publication: { eligibility: "HISTORICAL_NON_PUBLISHABLE" }, readiness: { packageReady: false },
    resources: [{ resourceId: "required", required: true, publicationPath: "/materials/missing.bin", digest: `sha256:${"0".repeat(64)}`, byteSize: 1, provenanceRef: null }]
  };
  const historicalPath = path.join(tmp, "historical.json");
  fs.writeFileSync(historicalPath, JSON.stringify(historicalIncomplete));
  const historicalRun = spawnSync(process.execPath, ["scripts/verify-smart-published-materialset.mjs", "--manifest", historicalPath, "--base-url", "https://example.invalid", "--out-dir", path.join(tmp, "receipts-historical")], { cwd: root, encoding: "utf8" });
  if (historicalRun.status !== 0 || !`${historicalRun.stderr}${historicalRun.stdout}`.includes("SKIP historical")) errors.push("historical non-publishable material set must be preserved without publication/network verification");

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
console.log(`SP-01 SMART FLOW QUALIFICATION: PASS — ${requiredResources.length} required candidate resources checked; historical/non-publishable lineage preserved; adversarial fail-closed publication boundary preserved.`);
