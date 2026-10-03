import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reconcileReceiptDirectory } from "./reconcile-smart-publication-receipts.mjs";

const digestA = "sha256:" + "a".repeat(64);
const digestB = "sha256:" + "b".repeat(64);

function makeManifest(overrides = {}) {
  return {
    schemaVersion: "atlas.smart.materialset/v1",
    materialSetId: "test-set",
    version: 1,
    activityId: "test-activity",
    status: "DRAFT",
    resources: [{
      resourceId: "required-asset",
      kind: "INFOGRAPHIC",
      title: "Required",
      audience: "STUDENT",
      required: true,
      materialSlotRoles: ["VISUAL_AID"],
      publicationPath: "/materials/smart/test/v1/required.svg",
      publicRef: null,
      provenanceRef: "test:provenance",
      digest: digestA,
      byteSize: 12,
      verificationState: "BYTES_VERIFIED_PUBLICATION_PENDING",
    }],
    readiness: {
      derivedFromCanonicalLessonPreparation: true,
      localOverrideForbidden: true,
      packageReady: false,
      blockingReasons: ["REQUIRED_PUBLIC_REFS_UNRESOLVED"],
    },
    publication: {
      stage: "DRAFT",
      eligibility: "PUBLICATION_CANDIDATE",
      humanDecisionRequired: true,
      failClosedWhenRequiredResourceUnresolved: true,
    },
    ...overrides,
  };
}

function makeReceipt(overrides = {}) {
  return {
    schemaVersion: "atlas.smart.asset-receipt/v1",
    assetId: "required-asset",
    version: 1,
    sha256: digestA,
    byteSize: 12,
    audience: "STUDENT",
    provenanceRef: "test:provenance",
    publicRef: "https://example.test/materials/smart/test/v1/required.svg",
    anonymousReachabilityVerified: true,
    verifiedAt: "2026-10-03T17:00:00Z",
    materialSetId: "test-set",
    releaseSha: "deadbeef",
    ...overrides,
  };
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "smart-reconcile-"));
  const receiptDir = path.join(root, "receipts");
  fs.mkdirSync(receiptDir);
  const manifestPath = path.join(root, "material-set.v1.json");
  fs.writeFileSync(manifestPath, JSON.stringify(makeManifest(), null, 2) + "\n");
  return { root, receiptDir, manifestPath };
}

function writeReceipt(dir, receipt, name = "receipt.json") {
  const receiptPath = path.join(dir, name);
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
  return receiptPath;
}

// Matching receipt promotes the canonical MaterialSet, preserving the human-decision flag.
{
  const f = fixture();
  const receiptPath = writeReceipt(f.receiptDir, makeReceipt());
  const first = reconcileReceiptDirectory({ manifestPaths: [f.manifestPath], receiptDir: f.receiptDir });
  assert.deepEqual(first.changedManifests, [f.manifestPath]);
  assert.deepEqual(first.unchangedManifests, []);
  const updated = JSON.parse(fs.readFileSync(f.manifestPath, "utf8"));
  assert.equal(updated.resources[0].publicRef, "https://example.test/materials/smart/test/v1/required.svg");
  const canonicalReceiptPath = path.join(path.dirname(f.manifestPath), "publication-receipts", path.basename(receiptPath));
  assert.equal(updated.resources[0].publicationReceiptRef, canonicalReceiptPath);
  assert.equal(fs.existsSync(canonicalReceiptPath), true, "receipt proof must persist beside the canonical MaterialSet");
  assert.deepEqual(JSON.parse(fs.readFileSync(canonicalReceiptPath, "utf8")), makeReceipt());
  assert.equal(updated.resources[0].verificationState, "PUBLISHED_VERIFIED");
  assert.equal(updated.readiness.packageReady, true);
  assert.deepEqual(updated.readiness.blockingReasons, []);
  assert.equal(updated.publication.stage, "PUBLISHED");
  assert.equal(updated.publication.humanDecisionRequired, true);

  fs.writeFileSync(receiptPath, JSON.stringify(makeReceipt({ verifiedAt: "2026-10-03T18:00:00Z", releaseSha: "feedface" }), null, 2) + "\n");
  const second = reconcileReceiptDirectory({ manifestPaths: [f.manifestPath], receiptDir: f.receiptDir });
  assert.deepEqual(second.changedManifests, []);
  assert.deepEqual(second.unchangedManifests, [f.manifestPath], "equivalent later receipt must be idempotent");
  assert.deepEqual(JSON.parse(fs.readFileSync(canonicalReceiptPath, "utf8")), makeReceipt(), "equivalent later deploy must not rewrite the first canonical proof");
  fs.rmSync(f.root, { recursive: true, force: true });
}

// Missing receipt leaves canonical state untouched.
{
  const f = fixture();
  const before = fs.readFileSync(f.manifestPath, "utf8");
  const result = reconcileReceiptDirectory({ manifestPaths: [f.manifestPath], receiptDir: f.receiptDir });
  assert.deepEqual(result.changedManifests, []);
  assert.deepEqual(result.unchangedManifests, [f.manifestPath]);
  assert.equal(fs.readFileSync(f.manifestPath, "utf8"), before);
  fs.rmSync(f.root, { recursive: true, force: true });
}

// Receipts for another material set or version are not applicable and must not mutate this manifest.
for (const receipt of [
  makeReceipt({ materialSetId: "other-set" }),
  makeReceipt({ version: 2 }),
]) {
  const f = fixture();
  writeReceipt(f.receiptDir, receipt);
  const before = fs.readFileSync(f.manifestPath, "utf8");
  const result = reconcileReceiptDirectory({ manifestPaths: [f.manifestPath], receiptDir: f.receiptDir });
  assert.deepEqual(result.changedManifests, []);
  assert.equal(fs.readFileSync(f.manifestPath, "utf8"), before);
  fs.rmSync(f.root, { recursive: true, force: true });
}

// A receipt that targets the same canonical resource but disagrees on integrity/identity fails closed.
for (const receipt of [
  makeReceipt({ sha256: digestB }),
  makeReceipt({ audience: "BOTH" }),
  makeReceipt({ provenanceRef: "other:provenance" }),
  makeReceipt({ byteSize: 99 }),
]) {
  const f = fixture();
  writeReceipt(f.receiptDir, receipt);
  assert.throws(
    () => reconcileReceiptDirectory({ manifestPaths: [f.manifestPath], receiptDir: f.receiptDir }),
    /receipt mismatch/i,
  );
  const unchanged = JSON.parse(fs.readFileSync(f.manifestPath, "utf8"));
  assert.equal(unchanged.readiness.packageReady, false);
  assert.equal(unchanged.publication.humanDecisionRequired, true);
  fs.rmSync(f.root, { recursive: true, force: true });
}

console.log("SMART PUBLICATION RECONCILIATION: PASS");


const workflowPath = ".github/workflows/smart-publication-reconcile-pr.yml";
assert.equal(fs.existsSync(workflowPath), true, "SMART RECEIPT WORKFLOW: missing reconciliation workflow");
const workflow = fs.readFileSync(workflowPath, "utf8");
for (const required of [
  "workflow_run:",
  "Atlas Canonical Pages Deploy",
  "actions: read",
  "contents: write",
  "pull-requests: write",
  "github.event.workflow_run.head_sha",
  "scripts/reconcile-smart-publication-receipts.mjs",
  "gh pr create",
  "--draft",
]) {
  assert.equal(workflow.includes(required), true, `SMART RECEIPT WORKFLOW: missing ${required}`);
}
for (const forbidden of [
  "pull_request_target",
  "gh pr merge",
  "enable_auto_merge",
  "GitHub App",
  "--force",
]) {
  assert.equal(workflow.includes(forbidden), false, `SMART RECEIPT WORKFLOW: forbidden pattern ${forbidden}`);
}

const canonicalDeploy = fs.readFileSync(".github/workflows/s1-preview-launcher.yml", "utf8");
assert.equal(canonicalDeploy.includes("smart-publication-receipts-${{ github.sha }}"), true, "canonical deploy must emit SHA-bound Smart receipt artifact");
console.log("SMART RECEIPT WORKFLOW: PASS — draft-only, least-privilege, no auto-merge.");


assert.equal(workflow.includes("RECEIPT_DIR: .smart-receipts/"), true, "workflow must download receipts to scratch, not a tracked parallel evidence root");
assert.equal(workflow.includes('git add content/smart-activities "$RECEIPT_DIR"'), false, "workflow must commit canonical per-activity receipt copies only");
assert.equal(workflow.includes("`$DEPLOYED_SHA`"), false, "workflow PR body must not use shell command-substitution backticks");
