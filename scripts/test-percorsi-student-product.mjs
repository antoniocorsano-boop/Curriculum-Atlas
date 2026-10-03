import fs from "node:fs";
import assert from "node:assert/strict";

const library = JSON.parse(fs.readFileSync("governance/percorsi-student-library.json", "utf8"));
const portfolio = JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json", "utf8"));
const missing = JSON.parse(fs.readFileSync("content/experiences/pathways/pw-missing-information-01.v1.json", "utf8"));
const constraints = JSON.parse(fs.readFileSync("content/experiences/pathways/pw-constraints-tradeoffs-01.v1.json", "utf8"));

const candidateTerritories = ["self","learning","others","problems","world","design"];
assert.equal(library.schemaVersion, "atlas.percorsi.student-library/v1");
assert.equal(library.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(library.territoryGovernance, "CANDIDATE_NOT_APPROVED");
assert.deepEqual(portfolio.territories.map((item) => item.id), candidateTerritories);
assert.deepEqual(library.territories.map((item) => item.id), candidateTerritories);

const growthStages = [
  "BEGINNING_TO_RECOGNISE",
  "USES_WITH_SUPPORT",
  "USES_INDEPENDENTLY",
  "CHOOSES_WHEN_TO_USE",
  "TRANSFERS_TO_NEW_SITUATION",
];
assert.deepEqual(library.growthStages.map((item) => item.id), growthStages);

const firstRegistered = portfolio.pathways.find((item) => item.pathwayId === missing.experienceId);
assert.ok(firstRegistered, "PW-MISSING must remain registered");
assert.equal(firstRegistered.version, missing.version, "PW-MISSING portfolio and experience version must match");
assert.equal(firstRegistered.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(firstRegistered.productState, "PRODUCT_RECOVERY_CANDIDATE");
assert.equal(firstRegistered.productRegistryRef, "governance/percorsi-student-library.json");

const requiredMissingNodes = [
  "S1_ORIENT","S2_MISSING_INFO","S3_CHOOSE_PROCESS","S4_CONSEQUENCE","S5_REVISE",
  "S6_NAME_STRATEGY","S7_CHANGED_CONTEXT","S8_TRANSFER_PROBE","S9_TRACE_CONTROL",
];
assert.deepEqual(missing.graph.nodes.map((node) => node.id), requiredMissingNodes, "PW-MISSING product storyboard cannot be silently compressed");

const firstProduct = library.pathways.find((item) => item.pathwayId === missing.experienceId);
assert.ok(firstProduct?.dossierRef, "PW-MISSING dossier reference required");
assert.ok(firstProduct?.implementationSpecRef, "PW-MISSING implementation spec reference required");

const secondRegistered = portfolio.pathways.find((item) => item.pathwayId === constraints.experienceId);
assert.ok(secondRegistered, "PW-CONSTRAINTS must remain registered");
assert.equal(secondRegistered.version, constraints.version, "PW-CONSTRAINTS portfolio and experience version must match");
assert.equal(secondRegistered.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(secondRegistered.productState, "PRODUCT_AUTHORED_CANDIDATE");
assert.equal(secondRegistered.productRegistryRef, "governance/percorsi-student-library.json");
assert.equal(secondRegistered.territoryStatus, "CANDIDATE_NOT_APPROVED");
assert.ok(secondRegistered.productScreenplayRef?.includes("#223@"), "PW-CONSTRAINTS exact screenplay proposal reference required");

const requiredConstraintNodes = new Set([
  "C1_BRIEF","C2_COMPARE","C3A_TRADEOFF","C3B_TRADEOFF","C4A_BUILD","C4B_BUILD",
  "C5A_REFRAME","C5B_REFRAME","C6_METHOD","C7_TRANSFER","C8_TRACE",
]);
assert.equal(constraints.graph.entryNodeId, "C1_BRIEF");
assert.deepEqual(new Set(constraints.graph.nodes.map((node) => node.id)), requiredConstraintNodes, "PW-CONSTRAINTS authored storyboard cannot be silently compressed");
assert.equal(constraints.runtime.learnerIdentityRequired, false);
assert.equal(constraints.runtime.telemetryAllowed, false);

const secondProduct = library.pathways.find((item) => item.pathwayId === constraints.experienceId);
assert.equal(secondProduct?.productState, "PRODUCT_AUTHORED_CANDIDATE");
assert.equal(secondProduct?.version, constraints.version);
assert.ok(secondProduct?.dossierRef, "PW-CONSTRAINTS dossier reference required");
assert.ok(secondProduct?.screenplayRef?.includes("product-screenplay-v1.md#223@"), "PW-CONSTRAINTS screenplay reference required");

console.log("PERCORSI STUDENT PRODUCT REGISTRY: PASS");
