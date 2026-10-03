import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { buildPathwayCandidate } from "./build-percorsi-pathway-candidate.mjs";
import { buildExperienceCandidate } from "./build-experience-candidate.mjs";

const conformanceCases = Object.freeze([
  { lane: "SMART", id: "sistema-tecnologico", role: "SP-01 compatibility" },
  { lane: "SMART", id: "fonte-digitale", role: "second Smart generality proof" },
  { lane: "PATHWAY", id: "pw-missing-information-01", role: "PW-MISSING compatibility" },
  { lane: "PATHWAY", id: "pw-constraints-tradeoffs-01", role: "second Percorso generality proof" },
]);

assert.deepEqual(
  conformanceCases.map(({ lane, id }) => `${lane}:${id}`),
  [
    "SMART:sistema-tecnologico",
    "SMART:fonte-digitale",
    "PATHWAY:pw-missing-information-01",
    "PATHWAY:pw-constraints-tradeoffs-01",
  ],
  "Experience Engine qualification requires exactly the four governed conformance cases",
);
assert.equal(conformanceCases.length, 4, "Experience Engine qualification must not silently add or omit proof cases");

const required = [
  "scripts/build-smart-flow-package.mjs",
  "content/smart-activities/sistema-tecnologico/flow-package.v1.json",
  "content/smart-activities/fonte-digitale/request.md",
  "content/smart-activities/fonte-digitale/intent.v1.json",
  "content/smart-activities/fonte-digitale/plan.v1.json",
  "content/smart-activities/fonte-digitale/flow-package.v1.json",
  "content/smart-activities/fonte-digitale/material-set.v1.json",
  "content/experience-kernels/smart/fonte-digitale.v1.json",
  "content/experiences/smart/fonte-digitale.v1.json",
  "public/materials/smart/fonte-digitale/v1/segnali-affidabilita.svg",
  "src/app/attivita/fonte-digitale/page.tsx",
  "fixtures/percorsi-factory/valid/missing-information.seed.json",
  "content/experience-kernels/pathways/pw-missing-information-01.v1.json",
  "content/experiences/pathways/pw-missing-information-01.v1.json",
  "fixtures/percorsi-factory/valid/constraints-tradeoffs.seed.json",
  "content/experience-kernels/pathways/pw-constraints-tradeoffs-01.v1.json",
  "content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json",
];

const missing = required.filter((file) => !fs.existsSync(file));
assert.deepEqual(missing, [], `missing Experience Engine conformance artifacts: ${missing.join(", ")}`);

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
  "scripts/build-percorsi-pathway-candidate.mjs",
  ".github/workflows/experience-engine.yml",
];
for (const file of genericFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const forbidden of conformanceCases.map(({ id }) => id)) {
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

const firstPathwaySeed = JSON.parse(fs.readFileSync("fixtures/percorsi-factory/valid/missing-information.seed.json", "utf8"));
const firstPathwayCandidate = buildPathwayCandidate(firstPathwaySeed);
assert.equal(firstPathwayCandidate.governance.authorizationState, "NOT_RUNTIME_AUTHORIZED");
assert.equal(firstPathwayCandidate.governance.learnerNetworkWrite, "forbidden");
assert.equal(firstPathwayCandidate.governance.learnerTelemetry, "forbidden");

const firstPersistedExperience = JSON.parse(fs.readFileSync("content/experiences/pathways/pw-missing-information-01.v1.json", "utf8"));
const firstValidation = spawnSync(
  process.execPath,
  ["scripts/validate-experience-contracts.mjs", "experience", "content/experiences/pathways/pw-missing-information-01.v1.json"],
  { encoding: "utf8" },
);
assert.equal(firstValidation.status, 0, `PW-MISSING failed shared ExperienceDefinition validation:\n${firstValidation.stdout}\n${firstValidation.stderr}`);
assert.equal(firstPersistedExperience.mode, "PATHWAY");
assert.equal(firstPersistedExperience.runtime.statePolicy, "VOLATILE_MEMORY");
assert.equal(firstPersistedExperience.runtime.learnerIdentityRequired, false);
assert.equal(firstPersistedExperience.runtime.telemetryAllowed, false);
assert.ok(firstPersistedExperience.graph.nodes.some((node) => node.primitive === "TRANSFER"), "PW-MISSING compatibility case must exercise transfer");

const secondSeedPath = "fixtures/percorsi-factory/valid/constraints-tradeoffs.seed.json";
const secondKernelPath = "content/experience-kernels/pathways/pw-constraints-tradeoffs-01.v1.json";
const secondExperiencePath = "content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json";
const secondSeed = JSON.parse(fs.readFileSync(secondSeedPath, "utf8"));
const portfolio = JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json", "utf8"));
const registeredSecondPathway = portfolio.pathways.find((entry) => entry.pathwayId === "pw-constraints-tradeoffs-01");
assert.ok(registeredSecondPathway, "second pathway must be registered after exact-head Human Review");
assert.equal(registeredSecondPathway.state, "IMPLEMENTATION_CANDIDATE");
assert.equal(registeredSecondPathway.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(registeredSecondPathway.authorityRef, "antoniocorsano-boop/trama-ecosistema#217@81534e352396ad858c7cf5ee00c7ec3b0756ae64");
assert.deepEqual(registeredSecondPathway.territoryIds, ["design", "world"]);

const firstRegisteredPathway = portfolio.pathways.find((entry) => entry.pathwayId === "pw-missing-information-01");
assert.ok(firstRegisteredPathway, "PW-MISSING must remain registered");

assert.equal(firstRegisteredPathway.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.publicationId, "pw-missing-information-01@1.0.0");
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.targetPublicationState, "QUALIFIED");
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.qualificationContractVersion, "v1");
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.intendedPublicPath, "/percorsi/pw-missing-information-01");
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.runtimeExactHead, null);
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.surfaceArtifactDigest, null);
assert.equal(firstRegisteredPathway.runtimeQualificationTarget?.freezeState, "DEFERRED_UNTIL_RRT03_COMPLETE");
assert.equal(firstRegisteredPathway.authorityRef, "antoniocorsano-boop/trama-ecosistema#96@dfb5b106708bee88016907c13ee0d104c093e7ca");

assert.equal(registeredSecondPathway.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.publicationId, "pw-constraints-tradeoffs-01@1.0.0");
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.targetPublicationState, "QUALIFIED");
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.qualificationContractVersion, "v1");
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.intendedPublicPath, "/percorsi/pw-constraints-tradeoffs-01");
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.runtimeExactHead, null);
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.surfaceArtifactDigest, null);
assert.equal(registeredSecondPathway.runtimeQualificationTarget?.freezeState, "DEFERRED_UNTIL_RRT03_COMPLETE");

const unregisteredPortfolio = structuredClone(portfolio);
unregisteredPortfolio.pathways = unregisteredPortfolio.pathways.filter((entry) => entry.pathwayId !== "pw-constraints-tradeoffs-01");
const authorityGuardDir = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-pathway-authority-"));
const authorityGuardPortfolio = path.join(authorityGuardDir, "portfolio.json");
fs.writeFileSync(authorityGuardPortfolio, JSON.stringify(unregisteredPortfolio, null, 2));
assert.throws(
  () => buildPathwayCandidate(secondSeed, { portfolioPath: authorityGuardPortfolio }),
  /not registered in backlog-zero portfolio/,
  "factory must still fail closed when the governed registration is absent",
);

const secondG2Candidate = buildPathwayCandidate(secondSeed);
assert.equal(secondG2Candidate.governance.authorizationState, "NOT_RUNTIME_AUTHORIZED");
assert.equal(secondG2Candidate.governance.learnerNetworkWrite, "forbidden");
assert.equal(secondG2Candidate.governance.learnerTelemetry, "forbidden");

const persistedSecondExperience = JSON.parse(fs.readFileSync(secondExperiencePath, "utf8"));
const rebuiltSecondExperience = buildExperienceCandidate(secondSeed.experienceSeed);
assert.deepEqual(
  rebuiltSecondExperience,
  persistedSecondExperience,
  "second Percorso must be reproducible from the shared generic Experience builder",
);

const nodesById = Object.fromEntries(persistedSecondExperience.graph.nodes.map((node) => [node.id, node]));
for (const branch of [
  ["explore", "connect", "build-durable", "reframe-durable", "transfer"],
  ["explore", "connect", "build-economical", "reframe-economical", "transfer"],
]) {
  assert.deepEqual(
    branch.map((id) => nodesById[id].primitive),
    ["EXPLORE", "CONNECT", "BUILD", "REFRAME", "TRANSFER"],
    "second Percorso must exercise the governed materially different primitive sequence",
  );
}
assert.equal(persistedSecondExperience.runtime.statePolicy, "VOLATILE_MEMORY");
assert.equal(persistedSecondExperience.runtime.learnerIdentityRequired, false);
assert.equal(persistedSecondExperience.runtime.telemetryAllowed, false);

for (const [kind, file] of [["kernel", secondKernelPath], ["experience", secondExperiencePath]]) {
  const run = spawnSync(process.execPath, ["scripts/validate-experience-contracts.mjs", kind, file], { encoding: "utf8" });
  assert.equal(run.status, 0, `${file} failed shared contract validation:\n${run.stdout}\n${run.stderr}`);
}

console.log("PERCORSI AUTHORITY GUARD: PASS — registration is exact-head governed and still fails closed when authority is absent.");
console.log("PERCORSI GENERALITY: PASS — PW-MISSING compatibility + constraints/tradeoffs proof share governed factory/runtime contracts.");
console.log("EXPERIENCE ENGINE FOUR-CASE COMPLETENESS: PASS — exactly two Smart and two Percorsi conformance cases are present.");
