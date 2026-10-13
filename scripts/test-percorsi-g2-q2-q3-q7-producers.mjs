import assert from "node:assert/strict";
import {
  produceQ2,
  produceQ3,
  produceQ7,
  validateConsumableEvidence,
  mapEvidenceProducerResultToGateReceipt,
} from "./percorsi-g2-evidence-producers.mjs";

const binding = {
  runtimeExactHead: "87512daaa3e09d8c48fda7de2c869e0a6d2e43e8",
  pathwayId: "pw-test",
  contentVersion: "1.0.0",
  publicationId: "pw-test@1.0.0",
};

const q2Input = {
  sessionId: "network-session-1",
  origin: "http://127.0.0.1:4173",
  requests: [
    { method: "GET", origin: "http://127.0.0.1:4173", requestClass: "navigation" },
    { method: "GET", origin: "http://127.0.0.1:4173", requestClass: "static-read" },
  ],
  learnerWriteCount: 0,
  telemetryCount: 0,
};

const q3Input = {
  sessionId: "state-session-1",
  statePolicy: "VOLATILE_MEMORY",
  localStorageEmpty: true,
  sessionStorageEmpty: true,
  indexedDbEmpty: true,
  cacheStorageEmpty: true,
  serviceWorkerRegistrationCount: 0,
  reloadReset: true,
  offlineFreshStartBlocked: true,
  withdrawnEntrypointUnavailable: true,
  labFallbackObserved: false,
};

const securityContract = {
  learnerIdentityRequired: false,
  telemetryAllowed: false,
  statePolicy: "VOLATILE_MEMORY",
  accountSurfaceObserved: false,
  persistentIdentifierObserved: false,
};

const q2 = produceQ2(binding, q2Input);
assert.equal(q2.status, "PASS");
assert.equal(validateConsumableEvidence("Q2", binding, q2).ok, true);

const q3 = produceQ3(binding, q3Input);
assert.equal(q3.status, "PASS");
assert.equal(validateConsumableEvidence("Q3", binding, q3).ok, true);

const q7 = produceQ7(binding, securityContract, q2, q3);
assert.equal(q7.status, "PASS");
assert.equal(q7.dependencyLineage.length, 2);
assert.equal(validateConsumableEvidence("Q7", binding, q7).ok, true);

for (const result of [q2, q3, q7]) {
  const receipt = mapEvidenceProducerResultToGateReceipt(result.gateId, binding, result);
  assert.equal(receipt.status, "PASS");
  assert.equal(receipt.producerTrace.runId, result.runId);
}

assert.equal(
  produceQ2(binding, { ...q2Input, requests: [...q2Input.requests, { method: "POST", origin: q2Input.origin }] }).status,
  "FAIL",
);
assert.equal(
  produceQ2(binding, { ...q2Input, requests: [{ method: "GET", origin: "https://telemetry.invalid" }] }).status,
  "FAIL",
);
assert.equal(produceQ2(binding, { ...q2Input, learnerWriteCount: 1 }).status, "FAIL");
assert.equal(produceQ2(binding, { ...q2Input, telemetryCount: 1 }).status, "FAIL");
assert.equal(produceQ2(binding, { ...q2Input, sessionId: "" }).status, "BLOCKED");

for (const [field, value] of [
  ["localStorageEmpty", false],
  ["sessionStorageEmpty", false],
  ["indexedDbEmpty", false],
  ["cacheStorageEmpty", false],
  ["serviceWorkerRegistrationCount", 1],
  ["reloadReset", false],
  ["offlineFreshStartBlocked", false],
  ["withdrawnEntrypointUnavailable", false],
  ["labFallbackObserved", true],
]) {
  assert.equal(produceQ3(binding, { ...q3Input, [field]: value }).status, "FAIL", field);
}
assert.equal(produceQ3(binding, { ...q3Input, statePolicy: "LOCAL_DEVICE" }).status, "FAIL");
assert.equal(produceQ3(binding, { ...q3Input, sessionId: "" }).status, "BLOCKED");

assert.equal(produceQ7(binding, { ...securityContract, learnerIdentityRequired: true }, q2, q3).status, "FAIL");
assert.equal(produceQ7(binding, { ...securityContract, telemetryAllowed: true }, q2, q3).status, "FAIL");
assert.equal(produceQ7(binding, { ...securityContract, statePolicy: "LOCAL_DEVICE" }, q2, q3).status, "FAIL");
assert.equal(produceQ7(binding, { ...securityContract, accountSurfaceObserved: true }, q2, q3).status, "FAIL");
assert.equal(produceQ7(binding, { ...securityContract, persistentIdentifierObserved: true }, q2, q3).status, "FAIL");

const foreignQ2 = { ...q2, candidateBinding: { ...binding, publicationId: "foreign" } };
assert.equal(produceQ7(binding, securityContract, foreignQ2, q3).status, "BLOCKED");
assert.equal(produceQ7(binding, securityContract, q2, null).status, "BLOCKED");

for (const result of [q2, q3, q7]) {
  assert.equal(JSON.stringify(result).includes('"RUNTIME_AUTHORIZED"'), false);
  assert.equal("decision" in result, false);
}

console.log("PASS Q2/Q3 -> Q7 exact-identity producer contract");
