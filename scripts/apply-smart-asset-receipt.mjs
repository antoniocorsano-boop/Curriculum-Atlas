import fs from "node:fs";
import { pathToFileURL } from "node:url";

const fail = (message) => { throw new Error(message); };

function deriveReadiness(manifest) {
  const required = (manifest.resources || []).filter((resource) => resource.required === true);
  const unresolved = required.filter((resource) =>
    !resource.publicRef ||
    !resource.provenanceRef ||
    !resource.digest ||
    !resource.publicationReceiptRef ||
    ((resource.audience === "STUDENT" || resource.audience === "BOTH") && resource.anonymousReachabilityVerified !== true)
  );

  manifest.readiness ||= {};
  manifest.readiness.packageReady = unresolved.length === 0;
  manifest.readiness.blockingReasons = unresolved.length ? ["REQUIRED_RESOURCES_UNRESOLVED"] : [];
  manifest.publication ||= {};
  manifest.publication.stage = unresolved.length ? "DRAFT" : "PUBLISHED";
}

export function validateReceiptForResource(manifest, receipt, {
  resourceId = receipt?.assetId,
  strictIdentity = false,
} = {}) {
  if (receipt?.schemaVersion !== "atlas.smart.asset-receipt/v1") fail("Invalid receipt schemaVersion");
  if (!receipt.publicRef || !receipt.provenanceRef || !/^sha256:[a-f0-9]{64}$/.test(receipt.sha256 || "")) {
    fail("Receipt missing publicRef/provenanceRef/valid sha256");
  }
  if ((receipt.audience === "STUDENT" || receipt.audience === "BOTH") && receipt.anonymousReachabilityVerified !== true) {
    fail("Student-facing receipt is not anonymously verified");
  }

  const resource = (manifest.resources || []).find((candidate) => candidate.resourceId === resourceId);
  if (!resource) fail(`receipt mismatch: resource not found ${resourceId}`);

  if (strictIdentity) {
    if (receipt.materialSetId !== manifest.materialSetId) fail("receipt mismatch: materialSetId");
    if (receipt.version !== manifest.version) fail("receipt mismatch: version");
    if (receipt.assetId !== resource.resourceId) fail("receipt mismatch: assetId");
    if (resource.provenanceRef !== receipt.provenanceRef) fail("receipt mismatch: provenance");
    if (resource.publicRef && resource.publicRef !== receipt.publicRef) fail("receipt mismatch: publicRef");
  }

  if (resource.digest && resource.digest !== receipt.sha256) fail(`receipt mismatch: digest for ${resourceId}`);
  if (resource.byteSize != null && resource.byteSize !== receipt.byteSize) fail(`receipt mismatch: byteSize for ${resourceId}`);
  if (resource.audience && resource.audience !== receipt.audience) fail(`receipt mismatch: audience for ${resourceId}`);

  return resource;
}

export function receiptAlreadyApplied(manifest, receipt, options = {}) {
  const resource = validateReceiptForResource(manifest, receipt, options);
  return Boolean(
    resource.publicationReceiptRef &&
    resource.publicRef === receipt.publicRef &&
    resource.digest === receipt.sha256 &&
    resource.byteSize === receipt.byteSize &&
    resource.audience === receipt.audience &&
    resource.provenanceRef === receipt.provenanceRef &&
    resource.anonymousReachabilityVerified === (receipt.anonymousReachabilityVerified === true) &&
    resource.verificationState === "PUBLISHED_VERIFIED"
  );
}

export function applyReceiptToManifest(manifest, receipt, {
  resourceId = receipt?.assetId,
  receiptRef,
  strictIdentity = false,
} = {}) {
  if (!receiptRef) fail("Receipt reference is required");
  const next = structuredClone(manifest);
  const resource = validateReceiptForResource(next, receipt, { resourceId, strictIdentity });

  resource.digest = receipt.sha256;
  resource.byteSize = receipt.byteSize;
  resource.provenanceRef = receipt.provenanceRef;
  resource.publicRef = receipt.publicRef;
  resource.publicationReceiptRef = receiptRef;
  resource.anonymousReachabilityVerified = receipt.anonymousReachabilityVerified === true;
  resource.verificationState = "PUBLISHED_VERIFIED";

  deriveReadiness(next);
  return next;
}

function cliValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const manifestPath = cliValue(argv, "--manifest");
  const receiptPath = cliValue(argv, "--receipt");
  const resourceId = cliValue(argv, "--resource-id");
  const out = cliValue(argv, "--out") || manifestPath;
  if (!manifestPath || !receiptPath || !resourceId) {
    console.error("Required: --manifest --receipt --resource-id [--out]");
    process.exit(2);
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
    const next = applyReceiptToManifest(manifest, receipt, {
      resourceId,
      receiptRef: receiptPath,
      strictIdentity: false,
    });
    fs.writeFileSync(out, JSON.stringify(next, null, 2) + "\n");
    console.log(`APPLIED ${receipt.assetId}@${receipt.version} -> ${resourceId}; packageReady=${next.readiness.packageReady}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
