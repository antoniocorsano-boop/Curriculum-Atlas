import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const RESIDUAL_INVENTORY_PATH = "docs/governance/TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY.json";
export const VOCABULARY_REGISTRY_PATH = "docs/governance/TRAMA_TERM_01_CURRICOLO_VOCABULARY.json";

const assertNonEmptyString = (value, label) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Residual inventory ${label} must be a non-empty string.`);
  }
};

export function validateResidualInventoryRegistry(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new Error("Residual inventory must be an object.");
  }
  if (registry.canonicalTerm !== "curricolo") {
    throw new Error("Residual inventory canonicalTerm must be curricolo.");
  }
  assertNonEmptyString(registry.legacyToken, "legacyToken");
  if (!Array.isArray(registry.categories) || registry.categories.length === 0) {
    throw new Error("Residual inventory categories must be a non-empty array.");
  }
  const categories = new Set();
  for (const [index, category] of registry.categories.entries()) {
    assertNonEmptyString(category, `category ${index}`);
    if (categories.has(category)) {
      throw new Error(`Residual inventory duplicate category: ${category}.`);
    }
    categories.add(category);
  }
  if (!Array.isArray(registry.residuals)) {
    throw new Error("Residual inventory residuals must be an array.");
  }

  const seen = new Set();
  for (const [index, residual] of registry.residuals.entries()) {
    if (!residual || typeof residual !== "object" || Array.isArray(residual)) {
      throw new Error(`Residual inventory entry ${index} must be an object.`);
    }
    assertNonEmptyString(residual.path, `entry ${index} path`);
    assertNonEmptyString(residual.contains, `entry ${index} contains`);
    assertNonEmptyString(residual.category, `entry ${index} category`);
    assertNonEmptyString(residual.reason, `entry ${index} reason`);
    if (!categories.has(residual.category)) {
      throw new Error(`Residual inventory entry ${index} category is not declared: ${residual.category}.`);
    }
    const key = `${residual.path}\u0000${residual.contains.toLowerCase()}\u0000${residual.category}`;
    if (seen.has(key)) {
      throw new Error(`Residual inventory contains duplicate rule ${residual.path} :: ${residual.contains}.`);
    }
    seen.add(key);
  }

  return registry;
}

export function classifyResidual(filePath, line, registryInput) {
  const registry = validateResidualInventoryRegistry(registryInput);
  const matches = registry.residuals.filter((residual) =>
    residual.path === filePath
      && line.toLowerCase().includes(residual.contains.toLowerCase())
  );
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    throw new Error(`Ambiguous residual classification for ${filePath}: ${line.trim()}`);
  }
  return matches[0];
}

const grepRepository = (legacyToken) => {
  try {
    const output = execFileSync(
      "git",
      ["grep", "-n", "-I", "-i", "--full-name", "-e", legacyToken, "--", "."],
      { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
    );
    return output.trim() ? output.trim().split(/\r?\n/) : [];
  } catch (error) {
    if (error && typeof error === "object" && error.status === 1) return [];
    throw error;
  }
};

const parseMatch = (raw) => {
  const match = raw.match(/^([^:]+):(\d+):(.*)$/);
  if (!match) throw new Error(`Unable to parse git grep result: ${raw}`);
  return { path: match[1], lineNumber: Number(match[2]), text: match[3] };
};

export function scanRepositoryResiduals(registryInput) {
  const registry = validateResidualInventoryRegistry(registryInput);
  const selfPaths = new Set([RESIDUAL_INVENTORY_PATH, VOCABULARY_REGISTRY_PATH]);
  const classified = [];
  const unclassified = [];
  const usedRules = new Set();

  for (const raw of grepRepository(registry.legacyToken)) {
    const occurrence = parseMatch(raw);
    if (selfPaths.has(occurrence.path)) continue;
    const classification = classifyResidual(occurrence.path, occurrence.text, registry);
    if (!classification) {
      unclassified.push(occurrence);
      continue;
    }
    usedRules.add(classification);
    classified.push({ ...occurrence, classification });
  }

  const unusedRules = registry.residuals.filter((rule) => !usedRules.has(rule));
  const countsByCategory = Object.fromEntries(registry.categories.map((category) => [category, 0]));
  for (const item of classified) countsByCategory[item.classification.category] += 1;

  return { classified, unclassified, unusedRules, countsByCategory };
}

const loadRegistry = () => JSON.parse(readFileSync(RESIDUAL_INVENTORY_PATH, "utf8"));

export function runResidualInventoryCheck() {
  const registry = validateResidualInventoryRegistry(loadRegistry());
  const report = scanRepositoryResiduals(registry);
  if (report.unclassified.length > 0 || report.unusedRules.length > 0) {
    console.error("TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY_FAIL");
    console.error(`classified=${report.classified.length} unclassified=${report.unclassified.length} unusedRules=${report.unusedRules.length}`);

    const grouped = new Map();
    for (const item of report.unclassified) {
      const items = grouped.get(item.path) ?? [];
      items.push(item);
      grouped.set(item.path, items);
    }
    for (const [filePath, items] of [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      const sample = items[0];
      console.error(`UNCLASSIFIED ${filePath} count=${items.length} sample=L${sample.lineNumber}: ${sample.text.trim()}`);
    }
    for (const rule of report.unusedRules) {
      console.error(`UNUSED ${rule.path} :: ${rule.contains} [${rule.category}]`);
    }
    return 1;
  }

  console.log("TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY_PASS");
  console.log(JSON.stringify({
    total: report.classified.length,
    countsByCategory: report.countsByCategory,
  }, null, 2));
  return 0;
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  try {
    process.exitCode = runResidualInventoryCheck();
  } catch (error) {
    console.error("TRAMA_TERM_01_ATLAS_RESIDUAL_INVENTORY_ERROR");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
