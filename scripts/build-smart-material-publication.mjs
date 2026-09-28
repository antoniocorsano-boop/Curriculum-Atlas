import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const value = (flag) => { const i = argv.indexOf(flag); return i >= 0 ? argv[i + 1] : undefined; };
const recordPath = value("--record");
const lessonId = value("--lesson-id");
const disciplineId = value("--discipline-id");
const gradeLabel = value("--grade-label");
const schoolYear = value("--school-year");
const title = value("--title");
const kind = value("--kind");
const alt = value("--alt");
const publicPath = value("--public-path");
const out = value("--out");
const curriculumVersionRef = value("--curriculum-version-ref");
const authorityState = value("--authority-state");
const fail = (m) => { console.error(m); process.exit(2); };

if (!recordPath || !lessonId || !disciplineId || !gradeLabel || !schoolYear || !title || !kind || !alt || !publicPath || !out) {
  fail("Required: --record --lesson-id --discipline-id --grade-label --school-year --title --kind --alt --public-path --out");
}
if (!publicPath.startsWith("/materials/")) fail("--public-path must be under /materials/");
if (publicPath.includes("..")) fail("--public-path must not contain ..");

const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
if (record.schemaVersion !== "atlas.smart.asset-record/v1") fail("Input must be atlas.smart.asset-record/v1");
if (!/^sha256:[a-f0-9]{64}$/.test(record.sha256 || "")) fail("Asset record has invalid sha256");
if (!record.provenanceRef || !record.mediaType || !Number.isInteger(record.byteSize)) fail("Asset record is incomplete");

const publication = {
  schemaVersion: "1.0",
  publicationId: `smart-${record.assetId}-v${record.version}`,
  lessonId,
  disciplineId,
  classContext: { gradeLabel, schoolYear },
  ...(curriculumVersionRef && authorityState ? { curriculumBinding: { curriculumVersionRef, authorityState } } : {}),
  materials: [{
    materialId: record.assetId,
    title,
    kind,
    alt,
    mimeType: record.mediaType,
    filesize: record.byteSize,
    checksum: record.sha256,
    sourceProvenance: { sourceType: "smart-activity", sourceRef: record.provenanceRef },
    publicPath,
    publicationState: "CANDIDATE"
  }]
};

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(publication, null, 2) + "\n");
console.log(`MAT-PUB CANDIDATE ${record.assetId}@${record.version} -> ${publicPath}`);
