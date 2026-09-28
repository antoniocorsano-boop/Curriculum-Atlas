import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const has = (flag) => argv.includes(flag);

const file = value("--file");
const assetId = value("--asset-id");
const version = Number(value("--version") || "1");
const audience = value("--audience");
const provenanceRef = value("--provenance-ref");
const publicRef = value("--public-ref");
const mediaType = value("--media-type") || "application/octet-stream";
const out = value("--out");
const anonymousReachabilityVerified = has("--anonymous-verified");

const fail = (message) => { console.error(message); process.exit(2); };
if (!file || !assetId || !audience || !provenanceRef || !out) fail("Required: --file --asset-id --audience --provenance-ref --out");
if (!Number.isInteger(version) || version < 1) fail("--version must be a positive integer");
if (!["STUDENT", "TEACHER", "BOTH"].includes(audience)) fail("--audience must be STUDENT, TEACHER or BOTH");
if (!fs.existsSync(file)) fail(`Source file not found: ${file}`);
if ((audience === "STUDENT" || audience === "BOTH") && publicRef && !anonymousReachabilityVerified) {
  fail("Public STUDENT/BOTH asset requires --anonymous-verified before a publication receipt can be emitted");
}

const bytes = fs.readFileSync(file);
const sha256 = `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
const record = {
  schemaVersion: publicRef ? "atlas.smart.asset-receipt/v1" : "atlas.smart.asset-record/v1",
  assetId,
  version,
  sha256,
  byteSize: bytes.byteLength,
  mediaType,
  audience,
  provenanceRef,
  ...(publicRef ? { publicRef, anonymousReachabilityVerified, verifiedAt: new Date().toISOString() } : {}),
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(record, null, 2) + "\n");
console.log(`${publicRef ? "RECEIPT" : "RECORD"} ${assetId}@${version} ${sha256} ${bytes.byteLength}B -> ${out}`);
