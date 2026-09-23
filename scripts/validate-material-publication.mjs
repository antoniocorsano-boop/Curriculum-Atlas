import fs from "node:fs";

const forbiddenKeys = new Set([
  "studentName",
  "studentId",
  "studentEmail",
  "registerId",
  "assessment",
  "grade",
  "personalNote",
  "location"
]);

const allowedTop = new Set([
  "schemaVersion",
  "publicationId",
  "lessonId",
  "disciplineId",
  "classContext",
  "curriculumBinding",
  "materials"
]);

const allowedClassContext = new Set(["gradeLabel", "schoolYear"]);
const allowedBinding = new Set(["curriculumVersionRef", "authorityState", "authorityReceiptRef"]);
const allowedMaterial = new Set([
  "materialId",
  "title",
  "kind",
  "alt",
  "mimeType",
  "width",
  "height",
  "filesize",
  "checksum",
  "sourceProvenance",
  "publicPath",
  "publicationState",
  "publishedAt",
  "commitSha",
  "publicUrl"
]);
const allowedProvenance = new Set(["sourceType", "sourceRef"]);

const allowedKinds = new Set(["infographic", "worksheet", "presentation", "image", "document"]);
const allowedMimeTypes = new Set([
  "image/svg+xml",
  "image/webp",
  "image/avif",
  "image/png",
  "image/jpeg",
  "application/pdf"
]);
const visualMimeTypes = new Set([
  "image/svg+xml",
  "image/webp",
  "image/avif",
  "image/png",
  "image/jpeg"
]);
const allowedStates = new Set(["CANDIDATE", "PUBLISHED", "WITHDRAWN"]);
const allowedAuthorityStates = new Set(["APPROVED", "PUBLISHED", "VERIFIED"]);
const allowedSourceTypes = new Set(["generated", "teacher-authored", "adapted", "atlas-reuse"]);

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function rejectUnknownKeys(obj, allowed, path, errors) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
  for (const key of Object.keys(obj)) {
    if (forbiddenKeys.has(key)) errors.push(`${path}.${key}: forbidden personal/sensitive publication field`);
    else if (!allowed.has(key)) errors.push(`${path}.${key}: unknown field`);
  }
}

export function validateMaterialPublication(input) {
  const errors = [];

  assert(input && typeof input === "object" && !Array.isArray(input), "$: manifest must be an object", errors);
  if (!input || typeof input !== "object" || Array.isArray(input)) return errors;

  rejectUnknownKeys(input, allowedTop, "$", errors);

  assert(input.schemaVersion === "1.0", "$.schemaVersion: must equal 1.0", errors);
  assert(typeof input.publicationId === "string" && /^[a-z0-9][a-z0-9._-]{5,127}$/.test(input.publicationId), "$.publicationId: invalid identifier", errors);
  assert(typeof input.lessonId === "string" && /^[a-z0-9][a-z0-9._-]{2,127}$/.test(input.lessonId), "$.lessonId: invalid identifier", errors);
  assert(typeof input.disciplineId === "string" && /^[a-z0-9][a-z0-9._-]{1,63}$/.test(input.disciplineId), "$.disciplineId: invalid identifier", errors);

  assert(input.classContext && typeof input.classContext === "object" && !Array.isArray(input.classContext), "$.classContext: required object", errors);
  if (input.classContext && typeof input.classContext === "object") {
    rejectUnknownKeys(input.classContext, allowedClassContext, "$.classContext", errors);
    assert(typeof input.classContext.gradeLabel === "string" && input.classContext.gradeLabel.length > 0 && input.classContext.gradeLabel.length <= 64, "$.classContext.gradeLabel: required", errors);
    if (input.classContext.schoolYear !== undefined) {
      assert(/^20\d{2}-20\d{2}$/.test(input.classContext.schoolYear), "$.classContext.schoolYear: expected YYYY-YYYY", errors);
    }
  }

  if (input.curriculumBinding !== undefined) {
    assert(input.curriculumBinding && typeof input.curriculumBinding === "object" && !Array.isArray(input.curriculumBinding), "$.curriculumBinding: must be an object", errors);
    if (input.curriculumBinding && typeof input.curriculumBinding === "object") {
      rejectUnknownKeys(input.curriculumBinding, allowedBinding, "$.curriculumBinding", errors);
      assert(typeof input.curriculumBinding.curriculumVersionRef === "string" && input.curriculumBinding.curriculumVersionRef.length > 0, "$.curriculumBinding.curriculumVersionRef: required", errors);
      assert(allowedAuthorityStates.has(input.curriculumBinding.authorityState), "$.curriculumBinding.authorityState: invalid state", errors);
    }
  }

  assert(Array.isArray(input.materials) && input.materials.length >= 1 && input.materials.length <= 50, "$.materials: expected 1..50 items", errors);
  if (!Array.isArray(input.materials)) return errors;

  const seenMaterialIds = new Set();

  input.materials.forEach((material, index) => {
    const path = `$.materials[${index}]`;
    assert(material && typeof material === "object" && !Array.isArray(material), `${path}: must be an object`, errors);
    if (!material || typeof material !== "object" || Array.isArray(material)) return;

    rejectUnknownKeys(material, allowedMaterial, path, errors);

    assert(typeof material.materialId === "string" && /^[a-z0-9][a-z0-9._-]{2,127}$/.test(material.materialId), `${path}.materialId: invalid identifier`, errors);
    if (typeof material.materialId === "string") {
      assert(!seenMaterialIds.has(material.materialId), `${path}.materialId: duplicate materialId`, errors);
      seenMaterialIds.add(material.materialId);
    }

    assert(typeof material.title === "string" && material.title.length > 0 && material.title.length <= 180, `${path}.title: required`, errors);
    assert(allowedKinds.has(material.kind), `${path}.kind: invalid kind`, errors);
    assert(allowedMimeTypes.has(material.mimeType), `${path}.mimeType: unsupported mime type`, errors);
    assert(Number.isInteger(material.filesize) && material.filesize > 0 && material.filesize <= 10 * 1024 * 1024, `${path}.filesize: invalid byte size`, errors);
    assert(typeof material.checksum === "string" && /^sha256:[a-f0-9]{64}$/.test(material.checksum), `${path}.checksum: expected sha256:<64 lowercase hex>`, errors);
    assert(typeof material.publicPath === "string" && /^\/materials\/[A-Za-z0-9._/-]+$/.test(material.publicPath) && !material.publicPath.includes(".."), `${path}.publicPath: must stay under /materials/`, errors);
    assert(allowedStates.has(material.publicationState), `${path}.publicationState: invalid state`, errors);

    if (visualMimeTypes.has(material.mimeType)) {
      assert(typeof material.alt === "string" && material.alt.trim().length > 0 && material.alt.length <= 500, `${path}.alt: required for informative visual assets`, errors);
    }

    if (["image/webp", "image/avif", "image/png", "image/jpeg"].includes(material.mimeType)) {
      assert(Number.isInteger(material.width) && material.width > 0 && material.width <= 12000, `${path}.width: required for raster asset`, errors);
      assert(Number.isInteger(material.height) && material.height > 0 && material.height <= 12000, `${path}.height: required for raster asset`, errors);
    }

    assert(material.sourceProvenance && typeof material.sourceProvenance === "object" && !Array.isArray(material.sourceProvenance), `${path}.sourceProvenance: required object`, errors);
    if (material.sourceProvenance && typeof material.sourceProvenance === "object") {
      rejectUnknownKeys(material.sourceProvenance, allowedProvenance, `${path}.sourceProvenance`, errors);
      assert(allowedSourceTypes.has(material.sourceProvenance.sourceType), `${path}.sourceProvenance.sourceType: invalid source type`, errors);
    }

    if (material.publicationState === "PUBLISHED") {
      assert(typeof material.publishedAt === "string" && !Number.isNaN(Date.parse(material.publishedAt)), `${path}.publishedAt: required for PUBLISHED`, errors);
      assert(typeof material.commitSha === "string" && /^[a-f0-9]{40}$/.test(material.commitSha), `${path}.commitSha: required for PUBLISHED`, errors);
      assert(typeof material.publicUrl === "string" && /^https:\/\//.test(material.publicUrl), `${path}.publicUrl: required HTTPS URL for PUBLISHED`, errors);
    }
  });

  return errors;
}

function runFile(filePath, expectedValid) {
  const input = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const errors = validateMaterialPublication(input);
  const valid = errors.length === 0;

  if (valid !== expectedValid) {
    console.error(`MAT_PUB_A_FAIL ${filePath}`);
    for (const error of errors) console.error(` - ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`MAT_PUB_A_${valid ? "PASS" : "EXPECTED_REJECT"} ${filePath}`);
  if (!valid) {
    for (const error of errors) console.log(` - ${error}`);
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const mode = process.argv[2];
  const files = process.argv.slice(3);

  if (mode === "--valid") files.forEach(file => runFile(file, true));
  else if (mode === "--invalid") files.forEach(file => runFile(file, false));
  else {
    console.error("Usage: node scripts/validate-material-publication.mjs --valid|--invalid <file...>");
    process.exitCode = 2;
  }
}
