import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { reviewSources, withoutReviewSources, verifyCanonicalExport } from "./canonical-atlas-export.mjs";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-public-boundary-"));
const root = path.join(temp, "repo");
function put(base, rel, content) {
  const target = path.join(base, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}
try {
  for (const source of reviewSources) put(root, source + "/fixture.txt", "preserve");
  put(root, "src/app/esperienze/page.tsx", "public");
  put(root, "public/materials/lesson.svg", "lesson");
  assert.throws(() => withoutReviewSources(root, () => {
    for (const source of reviewSources) assert.equal(fs.existsSync(path.join(root, source)), false);
    assert.equal(fs.readFileSync(path.join(root, "public/materials/lesson.svg"), "utf8"), "lesson");
    throw new Error("synthetic build failure");
  }), /synthetic build failure/);
  for (const source of reviewSources) assert.equal(fs.readFileSync(path.join(root, source, "fixture.txt"), "utf8"), "preserve");
  withoutReviewSources(root, () => {
    for (const source of reviewSources) assert.equal(fs.existsSync(path.join(root, source)), false);
  });
  for (const source of reviewSources) assert.equal(fs.existsSync(path.join(root, source)), true);

  const out = path.join(root, "out");
  for (const rel of ["index.html", "esperienze/index.html", "percorsi/index.html", "materiali/index.html", "curricolo/index.html"]) put(out, rel, "public");
  put(out, "materials/lesson.svg", "lesson");
  assert.equal(verifyCanonicalExport(out).status, "PASS");
  for (const rel of ["experience-lab/biblioteca/index.html", "percorsi/lab/index.html", "media/museo-zero/scene.webp",
    "_next/static/chunks/app/experience-lab/page.js", "_next/static/chunks/app/percorsi/lab/page.js"]) {
    put(out, rel, "review");
    assert.throws(() => verifyCanonicalExport(out), /REVIEW_(OUTPUT|PATH)_PRESENT/);
    const top = rel.startsWith("_next/") ? "_next" : rel.startsWith("percorsi/") ? "percorsi/lab" : rel.startsWith("media/") ? "media/museo-zero" : "experience-lab";
    fs.rmSync(path.join(out, top), { recursive: true, force: true });
  }
  for (const marker of ["MZ-DID-0.1", "museo-zero-p3-review-27037f3af1e1", "educational-library-review"]) {
    put(out, "_next/static/chunks/shared.js", marker);
    assert.throws(() => verifyCanonicalExport(out), /REVIEW_PAYLOAD_PRESENT/);
  }
  fs.rmSync(path.join(out, "_next"), { recursive: true, force: true });
  assert.equal(verifyCanonicalExport(out).status, "PASS");
  assert.equal(fs.readFileSync(path.join(out, "materials/lesson.svg"), "utf8"), "lesson");
  fs.rmSync(path.join(out, "esperienze/index.html"));
  assert.throws(() => verifyCanonicalExport(out), /PUBLIC_ROUTE_MISSING/);
  console.log("ATLAS CANONICAL REVIEW BOUNDARY: PASS");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
