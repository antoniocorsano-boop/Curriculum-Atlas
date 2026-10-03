import fs from "node:fs";
import assert from "node:assert/strict";

const library = JSON.parse(fs.readFileSync("governance/percorsi-student-library.json", "utf8"));
const portfolio = JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json", "utf8"));
const missing = JSON.parse(fs.readFileSync("content/experiences/pathways/pw-missing-information-01.v1.json", "utf8"));

const canonicalTerritories = ["self","learning","others","problems","world","design"];
assert.equal(library.schemaVersion, "atlas.percorsi.student-library/v1");
assert.equal(library.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.deepEqual(portfolio.territories.map((item) => item.id), canonicalTerritories);
assert.deepEqual(library.territories.map((item) => item.id), canonicalTerritories);

const growthStages = [
  "BEGINNING_TO_RECOGNISE",
  "USES_WITH_SUPPORT",
  "USES_INDEPENDENTLY",
  "CHOOSES_WHEN_TO_USE",
  "TRANSFERS_TO_NEW_SITUATION",
];
assert.deepEqual(library.growthStages.map((item) => item.id), growthStages);

const registered = portfolio.pathways.find((item) => item.pathwayId === missing.experienceId);
assert.ok(registered, "PW-MISSING must remain registered");
assert.equal(registered.version, missing.version, "portfolio and experience version must match");
assert.equal(registered.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
assert.equal(registered.productState, "PRODUCT_RECOVERY_CANDIDATE");
assert.equal(registered.productRegistryRef, "governance/percorsi-student-library.json");

const requiredNodes = [
  "S1_ORIENT",
  "S2_MISSING_INFO",
  "S3_CHOOSE_PROCESS",
  "S4_CONSEQUENCE",
  "S5_REVISE",
  "S6_NAME_STRATEGY",
  "S7_CHANGED_CONTEXT",
  "S8_TRANSFER_PROBE",
  "S9_TRACE_CONTROL",
];
assert.deepEqual(missing.graph.nodes.map((node) => node.id), requiredNodes, "PW-MISSING product storyboard cannot be silently compressed");
assert.equal(missing.graph.entryNodeId, "S1_ORIENT");
assert.equal(missing.runtime.learnerIdentityRequired, false);
assert.equal(missing.runtime.telemetryAllowed, false);

const productEntry = library.pathways.find((item) => item.pathwayId === missing.experienceId);
assert.ok(productEntry?.dossierRef, "PW-MISSING dossier reference required");
assert.ok(productEntry?.implementationSpecRef, "PW-MISSING implementation spec reference required");

console.log("PERCORSI STUDENT PRODUCT REGISTRY: PASS");
