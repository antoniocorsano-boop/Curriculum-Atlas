import fs from "node:fs";
import path from "node:path";
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
if (errors.length) {
  console.error("SP-01 SMART FLOW QUALIFICATION: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`SP-01 SMART FLOW QUALIFICATION: PASS — ${requiredResources.length} required resources checked from canonical JSON; fail-closed publication boundary preserved.`);
