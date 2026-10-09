import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
const publicRef = value("--public-ref");
const expectedDigest = value("--sha256");
const assetId = value("--asset-id");
const version = Number(value("--version") || "1");
const audience = value("--audience");
const provenanceRef = value("--provenance-ref");
const mediaType = value("--media-type") || "application/octet-stream";
const out = value("--out");
const fail = (m) => { console.error(m); process.exit(2); };
if (!publicRef || !expectedDigest || !assetId || !audience || !provenanceRef || !out) fail("Required: --public-ref --sha256 --asset-id --audience --provenance-ref --out");
if (!/^sha256:[a-f0-9]{64}$/.test(expectedDigest)) fail("--sha256 must be sha256:<64 lowercase hex>");
if (!["STUDENT", "TEACHER", "BOTH"].includes(audience)) fail("Invalid audience");

const response = await fetch(publicRef, { redirect: "follow", headers: { "user-agent": "Atlas-Smart-Asset-Verifier/1" } });
if (!response.ok) fail(`Public asset unreachable: HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const actual = `sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`;
if (actual !== expectedDigest) fail(`Published bytes digest mismatch: expected ${expectedDigest}, got ${actual}`);

const contentType = (response.headers.get("content-type") || "").split(";")[0].trim();
if (mediaType !== "application/octet-stream" && contentType && contentType !== mediaType) fail(`mediaType mismatch: expected ${mediaType}, got ${contentType}`);

const receipt = {
  schemaVersion: "atlas.smart.asset-receipt/v1",
  assetId,
  version,
  sha256: actual,
  byteSize: bytes.byteLength,
  mediaType: contentType || mediaType,
  audience,
  provenanceRef,
  publicRef: response.url,
  anonymousReachabilityVerified: audience === "STUDENT" || audience === "BOTH" ? true : undefined,
  verifiedAt: new Date().toISOString()
};
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(receipt, null, 2) + "\n");
console.log(`VERIFIED ${assetId}@${version} ${actual} ${bytes.byteLength}B ${response.url}`);
