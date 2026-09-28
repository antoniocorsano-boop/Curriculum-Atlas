import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const manifestPath = path.join(root, "content/smart-activities/sistema-tecnologico/material-set.v1.yaml");
const requiredFiles = [
  "scripts/register-smart-asset.mjs",
  "scripts/build-smart-material-publication.mjs",
  "scripts/verify-smart-public-asset.mjs",
  "scripts/apply-smart-asset-receipt.mjs",
  "scripts/validate-smart-materialset.mjs",
  "docs/contracts/ATLAS-SMART-ASSET-01.md",
  "docs/contracts/ATLAS-SMART-PUBLISH-ADAPTER-01.md"
];
const errors = [];

for (const rel of requiredFiles) if (!fs.existsSync(path.join(root, rel))) errors.push(`missing workflow component: ${rel}`);
if (!fs.existsSync(manifestPath)) errors.push("missing SP-01 material set");

const text = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, "utf8") : "";
const requiredResources = [...text.matchAll(/- resourceId:\s*([^\n]+)[\s\S]*?required:\s*true[\s\S]*?(?=\n\s*- resourceId:|\nreadiness:)/g)].map((m) => ({ id: m[1].trim(), block: m[0] }));
if (requiredResources.length === 0) errors.push("SP-01 must contain required resources");

for (const resource of requiredResources) {
  if (!/digest:\s*sha256:[a-f0-9]{64}/.test(resource.block)) errors.push(`${resource.id}: missing verified digest`);
  if (!/byteSize:\s*\d+/.test(resource.block)) errors.push(`${resource.id}: missing byteSize`);
  const publicRef = resource.block.match(/publicRef:\s*([^\n]+)/)?.[1]?.trim();
  const provenance = resource.block.match(/provenanceRef:\s*([^\n]+)/)?.[1]?.trim();
  if (!publicRef || publicRef === "null") {
    if (!/verificationState:\s*BYTES_VERIFIED_PUBLICATION_PENDING/.test(resource.block)) errors.push(`${resource.id}: unresolved publicRef must remain publication pending`);
  }
  if (!provenance || provenance === "null") {
    if (!/verificationState:\s*BYTES_VERIFIED_PUBLICATION_PENDING/.test(resource.block)) errors.push(`${resource.id}: unresolved provenance must remain publication pending`);
  }
}

if (!/packageReady:\s*false/.test(text)) errors.push("SP-01 must remain packageReady=false while required publication is unresolved");
if (!/REQUIRED_PUBLIC_REFS_UNRESOLVED/.test(text)) errors.push("missing REQUIRED_PUBLIC_REFS_UNRESOLVED blocker");
if (!/REQUIRED_BINARY_PUBLICATION_PENDING/.test(text)) errors.push("missing REQUIRED_BINARY_PUBLICATION_PENDING blocker");
if (!/humanDecisionRequired:\s*true/.test(text)) errors.push("human publication decision must remain required");
if (!/runtimeAdapterAuthorized:\s*false/.test(text)) errors.push("cross-system runtime adapter must remain unauthorized");

// Reusable validator must prove both positive draft acceptance and false-ready rejection.
for (const [args, label] of [
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/valid/draft.json"], "valid draft"],
  [["scripts/validate-smart-materialset.mjs", "fixtures/smart-materialset/invalid/false-ready.json", "--expect-invalid"], "false-ready negative"]
]) {
  const run = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (run.status !== 0) errors.push(`${label} validator failed: ${(run.stderr || run.stdout).trim()}`);
}

if (errors.length) {
  console.error("SP-01 SMART FLOW QUALIFICATION: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`SP-01 SMART FLOW QUALIFICATION: PASS — ${requiredResources.length} required resources checked; fail-closed publication boundary preserved.`);
