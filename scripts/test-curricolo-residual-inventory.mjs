import assert from "node:assert/strict";
import {
  classifyResidual,
  validateResidualInventoryRegistry,
} from "./validate-curricolo-residual-inventory.mjs";

const legacyToken = ["curric", "ulum"].join("");
const legacyContract = `ARENA_ATLAS_${legacyToken.toUpperCase()}_EXPORT_V1`;
const registry = {
  schemaVersion: 1,
  canonicalTerm: "curricolo",
  legacyToken,
  categories: [
    "contract-v1",
    "infrastructure-legacy",
    "compatibility-api",
    "test-governance",
    "historical-evidence",
  ],
  residuals: [{
    path: "src/contracts/legacy.ts",
    contains: legacyContract,
    category: "contract-v1",
    reason: "Published v1 contract identifier must remain stable until a separately governed v2 transition.",
  }],
};

validateResidualInventoryRegistry(registry);
assert.equal(
  classifyResidual("src/contracts/legacy.ts", `const contract = '${legacyContract}';`, registry)?.category,
  "contract-v1",
  "an exact classified residual must be recognized",
);
assert.equal(
  classifyResidual("src/other.ts", `const contract = '${legacyContract}';`, registry),
  null,
  "a residual classification must not leak to another path",
);
assert.equal(
  classifyResidual("src/new.ts", `Atlas ${legacyToken} authority`, registry),
  null,
  "unclassified legacy prose must remain unclassified",
);
assert.throws(
  () => validateResidualInventoryRegistry({
    ...registry,
    residuals: [{
      path: "src/contracts/legacy.ts",
      contains: legacyContract,
      category: "contract-v1",
      reason: "",
    }],
  }),
  /reason/,
  "every residual classification must have a non-empty reason",
);
assert.throws(
  () => validateResidualInventoryRegistry({
    ...registry,
    residuals: [{
      path: "src/contracts/legacy.ts",
      contains: legacyContract,
      category: "unknown-category",
      reason: "invalid category must be rejected",
    }],
  }),
  /category/,
  "residual categories must come from the declared category set",
);

console.log("TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY_TEST_PASS");
