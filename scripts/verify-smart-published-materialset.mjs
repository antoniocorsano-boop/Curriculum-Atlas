import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const argv = process.argv.slice(2);
const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
const manifestPath = value("--manifest");
const baseUrlRaw = value("--base-url");
const outDir = value("--out-dir");
const fail = (message) => { console.error(message); process.exit(2); };

if (!manifestPath || !baseUrlRaw || !outDir) fail("Required: --manifest --base-url --out-dir");
if (!fs.existsSync(manifestPath)) fail(`Manifest not found: ${manifestPath}`);

let baseUrl;
try {
  baseUrl = new URL(baseUrlRaw);
} catch {
  fail("--base-url must be an absolute URL");
}
if (baseUrl.protocol !== "https:") fail("--base-url must use https");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.schemaVersion !== "atlas.smart.materialset/v1") fail("Unsupported Smart material-set schema");
if (!Array.isArray(manifest.resources)) fail("Manifest resources must be an array");

const validPath = (p) => typeof p === "string" && p.startsWith("/materials/") && !p.includes("..") && !p.includes("\\") && !p.includes("?") && !p.includes("#");
fs.mkdirSync(outDir, { recursive: true });

for (const resource of manifest.resources) {
  if (!validPath(resource.publicationPath)) fail(`${resource.resourceId}: invalid publicationPath`);
  if (!/^sha256:[a-f0-9]{64}$/.test(resource.digest || "")) fail(`${resource.resourceId}: invalid digest`);
  if (!resource.provenanceRef) {
    if (resource.required === true) fail(`${resource.resourceId}: required resource missing provenanceRef`);
    console.log(`SKIP optional ${resource.resourceId}: provenance unresolved`);
    continue;
  }
  if (resource.required !== true) {
    console.log(`SKIP optional ${resource.resourceId}: not required for readiness`);
    continue;
  }

  const publicUrl = new URL(resource.publicationPath.replace(/^\//, ""), baseUrl.href.endsWith("/") ? baseUrl : new URL(`${baseUrl.href}/`));
  if (publicUrl.origin !== baseUrl.origin || !publicUrl.pathname.includes("/materials/")) fail(`${resource.resourceId}: public URL escaped canonical Atlas base`);

  const response = await fetch(publicUrl, { redirect: "follow" });
  if (!response.ok) fail(`${resource.resourceId}: HTTP ${response.status} at ${publicUrl.href}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const digest = `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
  if (digest !== resource.digest) fail(`${resource.resourceId}: published digest mismatch`);
  if (resource.byteSize != null && bytes.byteLength !== resource.byteSize) fail(`${resource.resourceId}: published byteSize mismatch`);

  const receipt = {
    schemaVersion: "atlas.smart.asset-receipt/v1",
    assetId: resource.resourceId,
    version: manifest.version,
    sha256: digest,
    byteSize: bytes.byteLength,
    audience: resource.audience,
    provenanceRef: resource.provenanceRef,
    publicRef: publicUrl.href,
    anonymousReachabilityVerified: true,
    verifiedAt: new Date().toISOString(),
    materialSetId: manifest.materialSetId,
    releaseSha: process.env.GITHUB_SHA || null
  };
  const output = path.join(outDir, `${manifest.materialSetId}--${resource.resourceId}.receipt.json`);
  fs.writeFileSync(output, JSON.stringify(receipt, null, 2) + "\n");
  console.log(`PASS ${resource.resourceId} -> ${publicUrl.href}`);
}
