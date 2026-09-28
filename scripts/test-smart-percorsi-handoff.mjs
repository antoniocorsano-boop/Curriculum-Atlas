import assert from "node:assert/strict";
import { buildSmartPercorsiHandoff } from "./build-smart-percorsi-handoff.mjs";

const sha = "a".repeat(40);
const digest = "sha256:" + "b".repeat(64);
const baseManifest = {
  schemaVersion: "atlas.smart.materialset/v1",
  materialSetId: "smart-set",
  version: 2,
  activityId: "activity-1",
  publication: { eligibility: "PUBLICATION_CANDIDATE" },
  resources: [{
    resourceId: "r1",
    required: true,
    digest,
    byteSize: 123,
    publicationPath: "/materials/smart/r1.bin",
    provenanceRef: "source:verified"
  }]
};
const baseContext = {
  candidateBinding: {
    runtimeExactHead: sha,
    pathwayId: "pathway-1",
    contentVersion: "v2",
    publicationId: "pub-1"
  },
  authorityRef: "arena:authority:1",
  authorityEvidenceRef: "evidence:authority:1"
};

const clone = (v) => structuredClone(v);
const expectCode = (fn, code) => assert.throws(fn, (e) => e?.code === code);

const result = buildSmartPercorsiHandoff(baseManifest, baseContext);
assert.equal(result.handoffState, "READY_FOR_Q5_INPUT");
assert.equal(result.runtimeAuthorized, false);
assert.equal(result.q5Produced, false);
assert.equal(result.authorityRef, baseContext.authorityRef);
assert.deepEqual(result.candidateBinding, baseContext.candidateBinding);
assert.equal(result.resources.length, 1);

for (const eligibility of ["HISTORICAL_NON_PUBLISHABLE", "DRAFT", undefined]) {
  const m = clone(baseManifest);
  m.publication = eligibility === undefined ? {} : { eligibility };
  expectCode(() => buildSmartPercorsiHandoff(m, baseContext), "NOT_PUBLICATION_CANDIDATE");
}

for (const key of ["runtimeExactHead","pathwayId","contentVersion","publicationId"]) {
  const c = clone(baseContext);
  c.candidateBinding[key] = "";
  expectCode(() => buildSmartPercorsiHandoff(baseManifest, c), "CANDIDATE_BINDING_INCOMPLETE");
}

for (const key of ["authorityRef","authorityEvidenceRef"]) {
  const c = clone(baseContext);
  c[key] = "";
  expectCode(() => buildSmartPercorsiHandoff(baseManifest, c), "AUTHORITY_INCOMPLETE");
}

for (const key of ["provenanceRef","digest","publicationPath"]) {
  const m = clone(baseManifest);
  m.resources[0][key] = "";
  expectCode(() => buildSmartPercorsiHandoff(m, baseContext),
    key === "provenanceRef" ? "RESOURCE_PROVENANCE_MISSING" :
    key === "digest" ? "RESOURCE_DIGEST_INVALID" : "RESOURCE_PUBLICATION_PATH_INVALID");
}

{
  const m = clone(baseManifest);
  m.resources[0].byteSize = -1;
  expectCode(() => buildSmartPercorsiHandoff(m, baseContext), "RESOURCE_SIZE_INVALID");
}
for (const forbidden of ["q5Evidence","q6Evidence","q1Evidence"]) {
  const c = clone(baseContext);
  c[forbidden] = {};
  expectCode(() => buildSmartPercorsiHandoff(baseManifest, c), "FORBIDDEN_EVIDENCE_INJECTION");
}
{
  const c = clone(baseContext);
  c.runtimeAuthorized = true;
  expectCode(() => buildSmartPercorsiHandoff(baseManifest, c), "RUNTIME_AUTHORIZATION_FORBIDDEN");
}

console.log("SMART-PERCORSI-BRIDGE-01: PASS");
