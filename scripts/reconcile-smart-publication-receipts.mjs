import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  applyReceiptToManifest,
  receiptAlreadyApplied,
  validateReceiptForResource,
} from "./apply-smart-asset-receipt.mjs";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function jsonText(value) {
  return JSON.stringify(value, null, 2) + "\n";
}

function walkJsonFiles(root) {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && entry.name.endsWith(".json")) files.push(full);
    }
  };
  visit(root);
  return files.sort();
}

export function findSmartManifestPaths(root = "content/smart-activities") {
  if (!fs.existsSync(root)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) visit(full);
      else if (entry.isFile() && /^material-set\.v[1-9][0-9]*\.json$/.test(entry.name)) files.push(full);
    }
  };
  visit(root);
  return files.sort();
}

export function reconcileReceiptDirectory({ manifestPaths, receiptDir }) {
  const receiptEntries = walkJsonFiles(receiptDir).map((file) => ({ file, receipt: readJson(file) }));
  const changedManifests = [];
  const unchangedManifests = [];

  for (const manifestPath of manifestPaths) {
    const originalText = fs.readFileSync(manifestPath, "utf8");
    let manifest = JSON.parse(originalText);
    const candidates = receiptEntries.filter(({ receipt }) =>
      receipt?.schemaVersion === "atlas.smart.asset-receipt/v1" &&
      receipt.materialSetId === manifest.materialSetId &&
      receipt.version === manifest.version
    );

    const seenAssets = new Set();
    let applied = false;

    for (const { file, receipt } of candidates) {
      if (seenAssets.has(receipt.assetId)) throw new Error(`receipt mismatch: duplicate receipt for ${receipt.assetId}`);
      seenAssets.add(receipt.assetId);

      // Validate every receipt that claims this exact MaterialSet/version.
      validateReceiptForResource(manifest, receipt, {
        resourceId: receipt.assetId,
        strictIdentity: true,
      });

      const canonicalReceiptPath = path.join(
        path.dirname(manifestPath),
        "publication-receipts",
        path.basename(file),
      );

      const alreadyApplied = receiptAlreadyApplied(manifest, receipt, {
        resourceId: receipt.assetId,
        strictIdentity: true,
      });
      const currentResource = (manifest.resources || []).find(
        (resource) => resource.resourceId === receipt.assetId,
      );

      // Equivalent later deploys must not rewrite the first canonical proof:
      // verifiedAt/releaseSha are deployment metadata, not readiness inputs.
      if (
        alreadyApplied &&
        currentResource?.publicationReceiptRef === canonicalReceiptPath &&
        fs.existsSync(canonicalReceiptPath)
      ) {
        continue;
      }

      if (fs.existsSync(canonicalReceiptPath)) {
        const canonicalReceipt = readJson(canonicalReceiptPath);
        const stableKeys = [
          "schemaVersion",
          "materialSetId",
          "version",
          "assetId",
          "sha256",
          "byteSize",
          "audience",
          "provenanceRef",
          "publicRef",
          "anonymousReachabilityVerified",
        ];
        for (const key of stableKeys) {
          if (canonicalReceipt[key] !== receipt[key]) {
            throw new Error(`receipt mismatch: canonical proof ${key} for ${receipt.assetId}`);
          }
        }
      } else {
        fs.mkdirSync(path.dirname(canonicalReceiptPath), { recursive: true });
        fs.writeFileSync(canonicalReceiptPath, jsonText(receipt));
      }

      manifest = applyReceiptToManifest(manifest, receipt, {
        resourceId: receipt.assetId,
        receiptRef: canonicalReceiptPath,
        strictIdentity: true,
      });
      applied = true;
    }

    const nextText = jsonText(manifest);
    if (applied && nextText !== originalText) {
      fs.writeFileSync(manifestPath, nextText);
      changedManifests.push(manifestPath);
    } else {
      unchangedManifests.push(manifestPath);
    }
  }

  return { changedManifests, unchangedManifests };
}

function value(argv, flag) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const receiptDir = value(argv, "--receipt-dir");
  const manifestRoot = value(argv, "--manifest-root") || "content/smart-activities";
  const summaryPath = value(argv, "--summary");
  if (!receiptDir) {
    console.error("usage: node scripts/reconcile-smart-publication-receipts.mjs --receipt-dir <dir> [--manifest-root <dir>] [--summary <file>]");
    process.exit(2);
  }

  try {
    const result = reconcileReceiptDirectory({
      manifestPaths: findSmartManifestPaths(manifestRoot),
      receiptDir,
    });
    if (summaryPath) fs.writeFileSync(summaryPath, jsonText(result));
    console.log(JSON.stringify(result));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
