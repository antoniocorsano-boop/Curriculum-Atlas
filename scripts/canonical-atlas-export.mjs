import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Only these known review surfaces are staged out of the canonical build.
// Do not change the root-scoped preview contract or publish from this script.
export const reviewSources = [
  "src/app/experience-lab",
  "src/app/percorsi/lab",
  "public/media/museo-zero",
];
const forbiddenOutput = ["experience-lab", "percorsi/lab", "media/museo-zero",
  "_next/static/chunks/app/experience-lab", "_next/static/chunks/app/percorsi/lab"];
const forbiddenMarkers = [
  "museo-zero-p3-review-27037f3af1e1",
  "MZ-DID-0.1",
  "educational-library-review",
  "museo-zero-p3-review",
];
const requiredRoutes = ["index.html", "esperienze/index.html", "percorsi/index.html",
  "materiali/index.html", "curricolo/index.html"];
const textExtensions = new Set([".html", ".js", ".mjs", ".json", ".txt", ".rsc", ".css", ".map", ".xml"]);

export function withoutReviewSources(root, build) {
  const staging = fs.mkdtempSync(path.join(path.dirname(root), ".atlas-canonical-"));
  const moved = [];
  try {
    for (const rel of reviewSources) {
      const original = path.join(root, rel);
      if (!fs.existsSync(original)) continue;
      const parked = path.join(staging, rel);
      fs.mkdirSync(path.dirname(parked), { recursive: true });
      fs.renameSync(original, parked);
      moved.push([original, parked]);
    }
    return build();
  } finally {
    // Preserve authored files even on build failure. Never remove the staging
    // directory if restoration fails.
    for (const [original, parked] of moved.reverse()) {
      if (fs.existsSync(original)) throw new Error("RESTORE_COLLISION:" + original);
      fs.mkdirSync(path.dirname(original), { recursive: true });
      fs.renameSync(parked, original);
    }
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

export function verifyCanonicalExport(out) {
  for (const rel of requiredRoutes) {
    if (!fs.statSync(path.join(out, rel), { throwIfNoEntry: false })?.isFile())
      throw new Error("PUBLIC_ROUTE_MISSING:" + rel);
  }
  for (const rel of forbiddenOutput) {
    if (fs.existsSync(path.join(out, rel))) throw new Error("REVIEW_OUTPUT_PRESENT:" + rel);
  }
  let scanned = 0;
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      const rel = path.relative(out, full).split(path.sep).join("/");
      if (item.isSymbolicLink()) throw new Error("UNEXPECTED_EXPORT_SYMLINK:" + rel);
      if (/(^|\/)(experience-lab|lab)(\/|$)/.test(rel))
        throw new Error("REVIEW_PATH_PRESENT:" + rel);
      if (item.isDirectory()) walk(full);
      else if (item.isFile() && textExtensions.has(path.extname(item.name))) {
        const content = fs.readFileSync(full, "utf8");
        for (const marker of forbiddenMarkers) {
          if (content.includes(marker)) throw new Error("REVIEW_PAYLOAD_PRESENT:" + rel + ":" + marker);
        }
        scanned++;
      }
    }
  }
  walk(out);
  return { status: "PASS", scannedTextFiles: scanned, reviewRoutesExcluded: true };
}

function runCanonicalBuild() {
  if (process.env.CI !== "true" || process.env.ATLAS_GITHUB_PAGES !== "true" ||
      process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true")
    throw new Error("CANONICAL_BUILD_REQUIRES_EXPLICIT_CI_CHANNEL");
  const root = process.cwd();
  if (!fs.existsSync(path.join(root, "src/app/esperienze/page.tsx")) ||
      !fs.existsSync(path.join(root, "next.config.ts"))) throw new Error("INVALID_ATLAS_ROOT");
  return withoutReviewSources(root, () => {
    // Fresh compiler output prevents stale review chunks from being reused.
    for (const rel of [".next", "out"]) fs.rmSync(path.join(root, rel), { recursive: true, force: true });
    const result = spawnSync("pnpm", ["build"], { cwd: root, stdio: "inherit", env: process.env });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error("CANONICAL_BUILD_FAILED:" + result.status);
    console.log(JSON.stringify(verifyCanonicalExport(path.join(root, "out"))));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--build") runCanonicalBuild();
  else if (process.argv[2] === "--verify") console.log(JSON.stringify(verifyCanonicalExport(path.resolve(process.argv[3] ?? "out"))));
  else throw new Error("Use --build or --verify");
}
