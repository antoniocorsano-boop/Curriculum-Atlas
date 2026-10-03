import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { buildPathwayCandidate } from "./build-percorsi-pathway-candidate.mjs";

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

const { buildSmartFlowPackage } = await import("./build-smart-flow-package.mjs");

for (const flowPackage of [
  "content/smart-activities/sistema-tecnologico/flow-package.v1.json",
  "content/smart-activities/fonte-digitale/flow-package.v1.json",
]) {
  const run = spawnSync(process.execPath, ["scripts/test-smart-flow.mjs", "--flow-package", flowPackage], { encoding: "utf8" });
  assert.equal(run.status, 0, `${flowPackage} failed generic Smart qualification:\n${run.stdout}\n${run.stderr}`);

  const persisted = JSON.parse(fs.readFileSync(flowPackage, "utf8"));
  const readJson = (ref) => JSON.parse(fs.readFileSync(ref, "utf8"));
  const rebuilt = buildSmartFlowPackage({
    intent: readJson(persisted.intentRef),
    plan: readJson(persisted.planRef),
    experience: readJson(persisted.experienceRef),
    materialSet: readJson(persisted.materialSetRef),
    intentRef: persisted.intentRef,
    planRef: persisted.planRef,
    experienceRef: persisted.experienceRef,
    materialSetRef: persisted.materialSetRef,
    qualificationProfileId: persisted.qualificationProfileId,
    qualifiedImplementation: persisted.stages.F9.state === "QUALIFIED_IMPLEMENTATION",
  });
  assert.deepEqual(rebuilt, persisted, `${flowPackage} must be reproducible from the shared deterministic builder`);
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


const unregisteredSecondPathway = {
  schemaVersion: "atlas.percorsi.seed/v1",
  pathwayId: "pw-constraints-tradeoffs-01",
  title: "Una soluzione, molti vincoli",
  version: "2.0.0",
  territoryIds: ["design", "world"],
  competence: "Progettare una soluzione valutando vincoli e compromessi e rivederla quando cambia un requisito.",
  coreStrategy: "Rendere espliciti i vincoli, costruire una soluzione, osservare i compromessi e rivederla quando cambia un requisito.",
  evidenceGoal: "Il percorso mostra una revisione motivata e un trasferimento della strategia a un contesto differente.",
  initialContext: "Una soluzione deve soddisfare più vincoli che non possono essere massimizzati contemporaneamente.",
  transferContext: "Un secondo problema cambia dominio e insieme dei vincoli, mantenendo la stessa strategia di progetto.",
  provenanceRef: "TRAMA-PR-217-PENDING-HUMAN-REVIEW",
  cognitiveFunctions: {
    orient: "identify_constraints",
    practice: "construct_under_constraints",
    transfer: "transfer_constraint_strategy",
    reflect: "revise_tradeoffs",
  },
};
assert.throws(
  () => buildPathwayCandidate(unregisteredSecondPathway),
  /not registered in backlog-zero portfolio/,
  "Atlas must reject PW-CONSTRAINTS-TRADEOFFS-01 until exact-head TRAMA Human Review authorizes portfolio registration",
);
console.log("PERCORSI AUTHORITY GUARD: PASS — second pathway remains unregistered before TRAMA Human Review.");
