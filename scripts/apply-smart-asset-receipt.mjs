import fs from "node:fs";

const argv = process.argv.slice(2);
const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
const manifestPath = value("--manifest");
const receiptPath = value("--receipt");
const resourceId = value("--resource-id");
const out = value("--out") || manifestPath;
const fail = (m) => { console.error(m); process.exit(2); };
if (!manifestPath || !receiptPath || !resourceId) fail("Required: --manifest --receipt --resource-id [--out]");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
if (receipt.schemaVersion !== "atlas.smart.asset-receipt/v1") fail("Invalid receipt schemaVersion");
if (!receipt.publicRef || !receipt.provenanceRef || !/^sha256:[a-f0-9]{64}$/.test(receipt.sha256 || "")) fail("Receipt missing publicRef/provenanceRef/valid sha256");
if ((receipt.audience === "STUDENT" || receipt.audience === "BOTH") && receipt.anonymousReachabilityVerified !== true) fail("Student-facing receipt is not anonymously verified");

const resource = (manifest.resources || []).find((r) => r.resourceId === resourceId);
if (!resource) fail(`Resource not found: ${resourceId}`);
if (resource.digest && resource.digest !== receipt.sha256) fail(`Digest mismatch for ${resourceId}`);
if (resource.byteSize != null && resource.byteSize !== receipt.byteSize) fail(`byteSize mismatch for ${resourceId}`);
if (resource.audience && resource.audience !== receipt.audience) fail(`Audience mismatch for ${resourceId}`);

resource.digest = receipt.sha256;
resource.byteSize = receipt.byteSize;
resource.provenanceRef = receipt.provenanceRef;
resource.publicRef = receipt.publicRef;
resource.publicationReceiptRef = receiptPath;
resource.anonymousReachabilityVerified = receipt.anonymousReachabilityVerified === true;
resource.verificationState = "PUBLISHED_VERIFIED";

const required = (manifest.resources || []).filter((r) => r.required === true);
const unresolved = required.filter((r) => !r.publicRef || !r.provenanceRef || !r.digest || !r.publicationReceiptRef || ((r.audience === "STUDENT" || r.audience === "BOTH") && r.anonymousReachabilityVerified !== true));
manifest.readiness ||= {};
manifest.readiness.packageReady = unresolved.length === 0;
manifest.readiness.blockingReasons = unresolved.length ? ["REQUIRED_RESOURCES_UNRESOLVED"] : [];
manifest.publication ||= {};
manifest.publication.stage = unresolved.length ? "DRAFT" : "PUBLISHED";

fs.writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
console.log(`APPLIED ${receipt.assetId}@${receipt.version} -> ${resourceId}; packageReady=${manifest.readiness.packageReady}`);
