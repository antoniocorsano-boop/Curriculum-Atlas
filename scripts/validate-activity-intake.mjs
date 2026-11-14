#!/usr/bin/env node
/** Intake safety + integrity gate. It NEVER authorizes publication. */
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const object = v => !!v && typeof v === "object" && !Array.isArray(v);
const requireOk = (ok, reason) => { if (!ok) throw new Error("INTAKE_REJECTED: " + reason); };

export function validate(file) {
  const manifestPath = path.resolve(file);
  const root = path.dirname(manifestPath);
  const staging = path.resolve("content/staging");
  requireOk(path.relative(staging, manifestPath).split(path.sep).length >= 2 &&
    !path.relative(staging, manifestPath).startsWith("..") &&
    path.basename(manifestPath) === "intake.json", "MANIFEST_LOCATION");
  const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  requireOk(m.contract === "trama.activity-intake/v0.1", "CONTRACT");
  requireOk(typeof m.activityId === "string" && /^[a-z0-9][a-z0-9._-]{2,127}$/.test(m.activityId), "ACTIVITY_ID");
  requireOk(m.version?.endsWith("-draft") && !!m.title && !!m.kind, "DRAFT_IDENTITY");
  requireOk(object(m.learning) && Array.isArray(m.learning.arenaObjectiveRefs) &&
    Array.isArray(m.learning.udaRefs), "REUSABLE_CURRICOLO_BINDING");
  requireOk(object(m.review) && Object.values(m.review).every(x => x !== "APPROVED" && x !== "PASS"), "HUMAN_REVIEW_PENDING");
  const a = m.authorization;
  requireOk(object(a) && a.atlasPublished === false && a.studentRuntimeAllowed === false &&
    a.docenteOsWriteAllowed === false && a.autoMergeAllowed === false, "NO_PUBLICATION_AUTHORITY");
  requireOk(object(m.experience) && m.experience.learnerPersonalData === false &&
    m.experience.telemetry === false &&
    m.experience.trustPolicy === "ISOLATED_HTML_SANDBOX_REQUIRED", "SANDBOX_AND_PRIVACY");
  requireOk(Array.isArray(m.assets) && m.assets.length > 0, "ASSET_CATALOG");
  const unique = new Set();
  let images = 0;
  for (const asset of m.assets) {
    requireOk(object(asset) && typeof asset.path === "string" &&
      typeof asset.sha256 === "string" && /^[a-f0-9]{64}$/.test(asset.sha256), "ASSET_METADATA");
    const segments = asset.path.split("/");
    requireOk(!path.isAbsolute(asset.path) && !asset.path.includes("\\") &&
      segments.every(x => x && x !== ".." && x !== "."), "PATH_TRAVERSAL");
    requireOk(!unique.has(asset.path), "DUPLICATE_ASSET");
    unique.add(asset.path);
    const target = path.resolve(root, asset.path);
    requireOk(target.startsWith(root + path.sep) && fs.existsSync(target) &&
      !fs.lstatSync(target).isSymbolicLink() && fs.statSync(target).isFile(), "FILE_NOT_PRESENT");
    const bytes = fs.readFileSync(target);
    requireOk(sha256(bytes) === asset.sha256, "ASSET_SHA256: "+asset.path);
    if (asset.type === "IMAGE") {
      images++;
      requireOk(bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP", "IMAGE_FORMAT");
    }
  }
  requireOk(unique.has(m.experience.entrypoint), "ENTRYPOINT_MISSING");
  const html = fs.readFileSync(path.resolve(root, m.experience.entrypoint), "utf8");
  const embedded = [...html.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)]
    .map(match => sha256(Buffer.from(match[1], "base64"))).sort();
  const catalogImages = m.assets.filter(a => a.type === "IMAGE").map(a => a.sha256).sort();
  requireOk(m.experience.embeddedImagesCount === embedded.length &&
    images === embedded.length &&
    JSON.stringify(embedded) === JSON.stringify(catalogImages), "EMBEDDED_IMAGES_MISMATCH");
  return { id: m.activityId, files: m.assets.length, images, status: "DRAFT_ONLY", canPublish: false };
}

if (process.argv[1]?.endsWith("validate-activity-intake.mjs")) {
  const file = process.argv[2] || "content/staging/missione-118/intake.json";
  try {
    const ok = validate(file);
    console.log(JSON.stringify(ok));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
