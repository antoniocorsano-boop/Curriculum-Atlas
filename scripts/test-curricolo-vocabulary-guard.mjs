import assert from "node:assert/strict";
import fs from "node:fs";
import {
  VOCABULARY_REGISTRY_PATH,
  validateAddedVocabulary,
  validateUnifiedDiff,
  validateVocabularyRegistry,
} from "./validate-curricolo-vocabulary.mjs";

const registry = {
  schemaVersion: 1,
  canonicalTerm: "curricolo",
  legacyToken: "curriculum",
  legacyTokens: ["curriculum", "curricular"],
  exceptions: [],
};

assert.equal(
  validateAddedVocabulary("+Atlas curriculum authority", registry, "docs/current.md").length,
  1,
  "new legacy prose must be rejected",
);
assert.equal(
  validateAddedVocabulary("+Curriculum Atlas", registry, "README.md").length,
  1,
  "legacy token matching must be case-insensitive",
);
assert.equal(
  validateAddedVocabulary("+Atlas curricular authority", registry, "docs/current.md").length,
  1,
  "the curricular derivative must also be rejected",
);
assert.equal(
  validateAddedVocabulary("-old curriculum wording", registry, "docs/current.md").length,
  0,
  "deletions must not be rejected",
);

const compatibilityRegistry = {
  ...registry,
  exceptions: [{
    path: "src/contracts/legacy.ts",
    contains: "ARENA_ATLAS_CURRICULUM_EXPORT_V1",
    reason: "Published v1 contract identifier must remain stable until a separately governed v2 transition.",
  }],
};
assert.equal(
  validateAddedVocabulary(
    "+const contract = 'ARENA_ATLAS_CURRICULUM_EXPORT_V1';",
    compatibilityRegistry,
    "src/contracts/legacy.ts",
  ).length,
  0,
  "an exact path + fragment compatibility exception must be accepted",
);
assert.equal(
  validateAddedVocabulary(
    "+const contract = 'ARENA_ATLAS_CURRICULUM_EXPORT_V1';",
    compatibilityRegistry,
    "src/other.ts",
  ).length,
  1,
  "a compatibility exception must not leak to another path",
);

assert.throws(
  () => validateVocabularyRegistry({
    ...registry,
    exceptions: [{ path: "src/legacy.ts", contains: "curriculum", reason: "" }],
  }),
  /reason/,
  "every exception must carry a non-empty reason",
);

const unified = [
  "diff --git a/docs/a.md b/docs/a.md",
  "--- a/docs/a.md",
  "+++ b/docs/a.md",
  "@@ -0,0 +1 @@",
  "+curricolo di istituto",
  "diff --git a/docs/b.md b/docs/b.md",
  "--- a/docs/b.md",
  "+++ b/docs/b.md",
  "@@ -0,0 +1 @@",
  "+national curriculum wording",
].join("\n");
const unifiedViolations = validateUnifiedDiff(unified, registry);
assert.equal(unifiedViolations.length, 1);
assert.equal(unifiedViolations[0].path, "docs/b.md");

assert.equal(
  validateAddedVocabulary(
    "+\"legacyToken\": \"curriculum\"",
    registry,
    VOCABULARY_REGISTRY_PATH,
  ).length,
  0,
  "the registry must be able to declare the legacy token it governs",
);

assert.equal(
  validateAddedVocabulary(
    "+{\"path\":\"src/legacy.ts\",\"contains\":\"curriculum\",\"reason\":\"legacy curriculum contract\"}",
    registry,
    "docs/governance/TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY.json",
  ).length,
  0,
  "the separately validated residual inventory must be self-exempt governance metadata",
);

const workflow = fs.readFileSync(".github/workflows/curricolo-vocabulary.yml", "utf8");
assert.match(
  workflow,
  /pull_request:\s*[\r\n]+\s*push:\s*[\r\n]+\s*branches:\s*[\r\n]+\s*- main/,
  "vocabulary guard must run on pull requests and pushes to main",
);
assert.match(workflow, /github\.event\.pull_request\.base\.sha/,
  "pull-request validation must use the PR base SHA");
assert.match(workflow, /github\.event\.pull_request\.head\.sha/,
  "pull-request validation must use the PR head SHA");
assert.match(workflow, /github\.event\.before/,
  "push validation must use the pre-push SHA as its base");
assert.match(workflow, /github\.sha/,
  "push validation must use github.sha as its head");

console.log("TRAMA_TERM_01_ATLAS_VOCABULARY_TEST_PASS");
