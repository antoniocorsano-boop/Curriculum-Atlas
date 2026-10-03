import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const required = [
  "scripts/build-smart-flow-package.mjs",
  "content/smart-activities/fonte-digitale/request.md",
  "content/smart-activities/fonte-digitale/intent.v1.json",
  "content/smart-activities/fonte-digitale/plan.v1.json",
  "content/smart-activities/fonte-digitale/flow-package.v1.json",
  "content/smart-activities/fonte-digitale/material-set.v1.json",
  "content/experience-kernels/smart/fonte-digitale.v1.json",
  "content/experiences/smart/fonte-digitale.v1.json",
  "public/materials/smart/fonte-digitale/v1/segnali-affidabilita.svg",
  "src/app/attivita/fonte-digitale/page.tsx"
];

const missing = required.filter((file) => !fs.existsSync(file));
assert.deepEqual(missing, [], `missing Smart generality artifacts: ${missing.join(", ")}`);

for (const flowPackage of [
  "content/smart-activities/sistema-tecnologico/flow-package.v1.json",
  "content/smart-activities/fonte-digitale/flow-package.v1.json",
]) {
  const run = spawnSync(process.execPath, ["scripts/test-smart-flow.mjs", "--flow-package", flowPackage], { encoding: "utf8" });
  assert.equal(run.status, 0, `${flowPackage} failed generic Smart qualification:\n${run.stdout}\n${run.stderr}`);
}

const genericFiles = [
  "scripts/build-smart-flow-package.mjs",
  "scripts/test-smart-flow.mjs",
  "scripts/lib/experience-contracts.mjs",
  "scripts/build-experience-candidate.mjs",
  ".github/workflows/experience-engine-tdd.yml",
];
for (const file of genericFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const forbidden of ["sistema-tecnologico", "fonte-digitale", "pw-missing-information-01", "pw-constraints-tradeoffs-01"]) {
    assert.equal(source.includes(forbidden), false, `${file} contains case-specific literal ${forbidden}`);
  }
}

const sourceFlow = JSON.parse(fs.readFileSync("content/smart-activities/fonte-digitale/flow-package.v1.json", "utf8"));
assert.equal(sourceFlow.readinessAuthority, "MATERIAL_SET");
assert.equal(sourceFlow.stages.F0.state, "COMPLETE");
assert.equal(sourceFlow.stages.F1.state, "COMPLETE");
assert.notEqual(sourceFlow.stages.F5.state, "COMPLETE");
assert.notEqual(sourceFlow.stages.F10.teacherStatus, "Pronto");

console.log("EXPERIENCE GENERALITY SMART: PASS — SP-01 + fonte-digitale use the same deterministic flow/runtime contracts.");
