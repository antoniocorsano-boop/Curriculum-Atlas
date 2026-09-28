import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const contentRoot = path.join(root, "content", "smart-activities");
const exportRoot = path.join(root, "out");
const fail = (message) => { console.error(message); process.exitCode = 2; };
const materialSetName = /^material-set\.v([1-9][0-9]*)\.json$/;
const allowedEligibility = new Set(["HISTORICAL_NON_PUBLISHABLE", "PUBLICATION_CANDIDATE"]);

const manifests = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && materialSetName.test(entry.name)) manifests.push(full);
  }
};
walk(contentRoot);
manifests.sort();

let candidates = 0;
for (const manifestPath of manifests) {
  const filename = path.basename(manifestPath);
  const filenameVersion = Number(filename.match(materialSetName)?.[1]);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== "atlas.smart.materialset/v1") {
    fail(`${manifestPath}: unsupported schemaVersion`);
    continue;
  }
  if (!Number.isInteger(manifest.version) || manifest.version !== filenameVersion) {
    fail(`${manifestPath}: manifest version must match versioned filename`);
    continue;
  }
  const eligibility = manifest.publication?.eligibility;
  if (!allowedEligibility.has(eligibility)) {
    fail(`${manifestPath}: publication.eligibility must be explicit`);
    continue;
  }
  if (eligibility === "HISTORICAL_NON_PUBLISHABLE") {
    if (manifest.readiness?.packageReady !== false) fail(`${manifestPath}: historical manifest cannot be packageReady`);
    console.log(`HISTORY v${manifest.version}: preserved; binary publication gate not applicable`);
    continue;
  }

  candidates += 1;
  for (const resource of manifest.resources || []) {
    if (resource.required !== true) continue;
    if (!resource.provenanceRef) {
      fail(`${resource.resourceId}: required resource missing provenanceRef`);
      continue;
    }
    if (typeof resource.publicationPath !== "string" || !resource.publicationPath.startsWith("/materials/") || resource.publicationPath.includes("..") || resource.publicationPath.includes("\\") || resource.publicationPath.includes("?") || resource.publicationPath.includes("#")) {
      fail(`${resource.resourceId}: invalid publicationPath`);
      continue;
    }
    if (!/^sha256:[a-f0-9]{64}$/.test(resource.digest || "")) {
      fail(`${resource.resourceId}: invalid digest`);
      continue;
    }
    const relative = resource.publicationPath.replace(/^\//, "");
    const exported = path.resolve(exportRoot, relative);
    if (!exported.startsWith(path.resolve(exportRoot) + path.sep)) {
      fail(`${resource.resourceId}: publicationPath escaped export root`);
      continue;
    }
    if (!fs.existsSync(exported)) {
      fail(`${resource.resourceId}: required asset missing from static export: ${relative}`);
      continue;
    }
    const bytes = fs.readFileSync(exported);
    const digest = `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
    const actualIdentity = `actualDigest=${digest} actualByteSize=${bytes.byteLength}`;
    if (digest !== resource.digest) {
      fail(`${resource.resourceId}: exported digest mismatch; expectedDigest=${resource.digest} ${actualIdentity}`);
      continue;
    }
    if (resource.byteSize != null && bytes.byteLength !== resource.byteSize) {
      fail(`${resource.resourceId}: exported byteSize mismatch; expectedByteSize=${resource.byteSize} ${actualIdentity}`);
      continue;
    }
    console.log(`PASS v${manifest.version} ${resource.resourceId}: ${relative} ${actualIdentity}`);
  }
}

if (manifests.length > 0 && candidates === 0) fail("No Smart material set is explicitly eligible as PUBLICATION_CANDIDATE");
if (process.exitCode) process.exit(process.exitCode);
console.log(`SMART EXPORT GATE: PASS — ${manifests.length} material set(s), ${candidates} publication candidate(s) checked.`);
