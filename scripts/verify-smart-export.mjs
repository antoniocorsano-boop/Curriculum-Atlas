import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const contentRoot = path.join(root, "content", "smart-activities");
const exportRoot = path.join(root, "out");
const fail = (message) => { console.error(message); process.exitCode = 2; };

const manifests = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name === "material-set.v1.json") manifests.push(full);
  }
};
walk(contentRoot);
manifests.sort();

for (const manifestPath of manifests) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.schemaVersion !== "atlas.smart.materialset/v1") {
    fail(`${manifestPath}: unsupported schemaVersion`);
    continue;
  }
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
    if (digest !== resource.digest) {
      fail(`${resource.resourceId}: exported digest mismatch`);
      continue;
    }
    if (resource.byteSize != null && bytes.byteLength !== resource.byteSize) {
      fail(`${resource.resourceId}: exported byteSize mismatch`);
      continue;
    }
    console.log(`PASS ${resource.resourceId}: ${relative}`);
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log(`SMART EXPORT GATE: PASS — ${manifests.length} material set(s) checked.`);
