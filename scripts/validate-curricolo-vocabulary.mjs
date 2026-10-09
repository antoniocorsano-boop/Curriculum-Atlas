import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const VOCABULARY_REGISTRY_PATH = "docs/governance/TRAMA_TERM_01_CURRICOLO_VOCABULARY.json";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const assertNonEmptyString = (value, label) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Vocabulary registry ${label} must be a non-empty string.`);
  }
};

export function validateVocabularyRegistry(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new Error("Vocabulary registry must be an object.");
  }
  if (registry.canonicalTerm !== "curricolo") {
    throw new Error("Vocabulary registry canonicalTerm must be curricolo.");
  }
  assertNonEmptyString(registry.legacyToken, "legacyToken");
  if (!Array.isArray(registry.exceptions)) {
    throw new Error("Vocabulary registry exceptions must be an array.");
  }

  const seen = new Set();
  for (const [index, exception] of registry.exceptions.entries()) {
    if (!exception || typeof exception !== "object" || Array.isArray(exception)) {
      throw new Error(`Vocabulary registry exception ${index} must be an object.`);
    }
    assertNonEmptyString(exception.path, `exception ${index} path`);
    assertNonEmptyString(exception.contains, `exception ${index} contains`);
    assertNonEmptyString(exception.reason, `exception ${index} reason`);

    const key = `${exception.path}\u0000${exception.contains}`;
    if (seen.has(key)) {
      throw new Error(`Vocabulary registry contains duplicate exception ${exception.path} :: ${exception.contains}.`);
    }
    seen.add(key);
  }

  return registry;
}

const removeAllowedFragments = (line, registry, filePath) => {
  let residual = line;
  for (const exception of registry.exceptions) {
    if (exception.path !== filePath) continue;
    const allowed = new RegExp(escapeRegExp(exception.contains), "gi");
    residual = residual.replace(allowed, "");
  }
  return residual;
};

export function validateAddedVocabulary(diffText, registryInput, filePath) {
  const registry = validateVocabularyRegistry(registryInput);
  if (filePath === VOCABULARY_REGISTRY_PATH) return [];

  const forbidden = new RegExp(escapeRegExp(registry.legacyToken), "i");
  const violations = [];

  diffText.split(/\r?\n/).forEach((line, index) => {
    if (!line.startsWith("+") || line.startsWith("+++")) return;
    const added = line.slice(1);
    if (!forbidden.test(added)) return;

    const residual = removeAllowedFragments(added, registry, filePath);
    if (!forbidden.test(residual)) return;

    violations.push({
      path: filePath,
      diffLine: index + 1,
      text: added,
    });
  });

  return violations;
}

export function validateUnifiedDiff(diffText, registryInput) {
  const registry = validateVocabularyRegistry(registryInput);
  const violations = [];
  let currentPath = null;
  let fileAdditions = [];

  const flush = () => {
    if (!currentPath || fileAdditions.length === 0) return;
    violations.push(...validateAddedVocabulary(fileAdditions.join("\n"), registry, currentPath));
    fileAdditions = [];
  };

  for (const line of diffText.split(/\r?\n/)) {
    if (line.startsWith("+++ ")) {
      flush();
      const marker = line.slice(4).trim();
      currentPath = marker === "/dev/null" ? null : marker.replace(/^b\//, "");
      continue;
    }
    if (!currentPath) continue;
    if (line.startsWith("+") && !line.startsWith("+++")) fileAdditions.push(line);
  }
  flush();
  return violations;
}

const loadRegistry = () => JSON.parse(readFileSync(VOCABULARY_REGISTRY_PATH, "utf8"));

const buildDiff = (baseSha, headSha) => {
  assertNonEmptyString(baseSha, "base SHA");
  assertNonEmptyString(headSha, "head SHA");
  const zeroBase = /^0+$/.test(baseSha);
  const args = zeroBase
    ? ["show", "--format=", "--unified=0", "--no-ext-diff", headSha, "--"]
    : ["diff", "--unified=0", "--no-ext-diff", `${baseSha}...${headSha}`, "--"];
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
};

export function runVocabularyGuard(baseSha, headSha) {
  const registry = validateVocabularyRegistry(loadRegistry());
  const diff = buildDiff(baseSha, headSha);
  const violations = validateUnifiedDiff(diff, registry);

  if (violations.length > 0) {
    console.error("TRAMA_TERM_01_ATLAS_CURRICOLO_VOCABULARY_FAIL");
    for (const violation of violations) {
      console.error(`- ${violation.path}: ${violation.text.trim()}`);
    }
    return 1;
  }

  console.log(`TRAMA_TERM_01_ATLAS_CURRICOLO_VOCABULARY_PASS ${headSha}`);
  return 0;
}

const isDirectExecution = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const [baseSha, headSha] = process.argv.slice(2);
  try {
    process.exitCode = runVocabularyGuard(baseSha, headSha);
  } catch (error) {
    console.error("TRAMA_TERM_01_ATLAS_CURRICOLO_VOCABULARY_ERROR");
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
  }
}
