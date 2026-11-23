import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = path.join(root, "governance", "atlas-portal-capability-map.v1.json");
const knownPortals = ["esplora", "esperienze", "percorsi", "curricolo"];
const candidateKinds = new Set(["CONTENT_CANDIDATE", "PREVIEW_ONLY", "PRIVATE_RUNTIME_INFRASTRUCTURE"]);

function fail(message, errors) {
  errors.push(message);
}

export function validateCapabilityMap(registry, { checkFiles = true } = {}) {
  const errors = [];
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    return ["The capability map must be a JSON object"];
  }
  if (registry.schemaVersion !== "atlas.portal-capability-map/v1") fail("Unexpected schemaVersion", errors);
  if (registry.lifecycle !== "PLANNING_BASELINE_NOT_RUNTIME_AUTHORITY") fail("This registry cannot be runtime authority", errors);
  if (registry.governance?.release !== "NEVER_INFER_RUNTIME_AUTHORIZATION_FROM_CODE_OR_CI") fail("Runtime authorization policy absent", errors);
  if (!Array.isArray(registry.portals) || registry.portals.length !== 4) {
    fail("Exactly four portals required", errors);
  }
  if (!Array.isArray(registry.capabilities) || registry.capabilities.length < 1) {
    fail("At least one capability required", errors);
  }
  const portals = Array.isArray(registry.portals) ? registry.portals : [];
  const capabilities = Array.isArray(registry.capabilities) ? registry.capabilities : [];
  const ids = portals.map((p) => p?.id);
  if (JSON.stringify(ids) !== JSON.stringify(knownPortals)) fail("Canonical four portal IDs/order changed", errors);
  if (JSON.stringify(registry.decisions?.canonicalFourPortals) !== JSON.stringify(knownPortals)) {
    fail("Canonical portal decision mismatch", errors);
  }
  if (new Set(capabilities.map((c) => c?.id)).size !== capabilities.length) fail("Duplicate capability ID", errors);
  const capabilityById = new Map(capabilities.map((c) => [c?.id, c]));
  function checkPaths(paths, label) {
    if (!Array.isArray(paths)) {
      fail(label + ": sourcePaths must be an array", errors);
      return;
    }
    for (const source of paths) {
      if (typeof source !== "string" || !source || path.isAbsolute(source) || source.includes("\\") || source.split("/").includes("..")) {
        fail(label + ": invalid relative source path", errors);
        continue;
      }
      if (checkFiles && !fs.existsSync(path.join(root, source))) fail(label + ": missing source file " + source, errors);
    }
  }
  for (const portal of portals) {
    if (!portal?.id || typeof portal.label !== "string" || typeof portal.promise !== "string") fail("Invalid portal identity", errors);
    if (typeof portal.plannedRoute !== "string" || portal.plannedRoute !== "/" + portal.id + "/") fail("Portal route mismatch: " + portal?.id, errors);
    if (typeof portal.routeOnMain !== "boolean") fail("routeOnMain must be boolean: " + portal?.id, errors);
    if (portal.id === "esperienze" && portal.routeOnMain) {
      // If main gains this route, update the inventory and the release checks explicitly.
      if (checkFiles && !fs.existsSync(path.join(root, "src/app/esperienze/page.tsx"))) fail("Esperienze incorrectly described as implemented", errors);
    }
    if (portal.routeOnMain && checkFiles && !fs.existsSync(path.join(root, "src/app", portal.id, "page.tsx"))) {
      fail("Existing portal route file missing: " + portal?.id, errors);
    }
    checkPaths(portal.sourcePaths, "portal " + portal?.id);
    if (!Array.isArray(portal.capabilityIds) || portal.capabilityIds.length < 1) fail("Portal without capabilities: " + portal?.id, errors);
    else for (const capId of portal.capabilityIds) {
      const capability = capabilityById.get(capId);
      if (!capability) fail("Unknown capability " + capId + " on " + portal?.id, errors);
      else if (!capability.portals?.includes(portal.id)) fail("Reverse association missing for " + capId + " on " + portal?.id, errors);
    }
  }
  for (const cap of capabilities) {
    if (typeof cap?.id !== "string" || !/^[a-z][a-z0-9-]*$/.test(cap.id)) fail("Invalid capability ID", errors);
    if (typeof cap?.maturity !== "string" || !cap.maturity || typeof cap?.next !== "string") fail("Missing maturity or next step: " + cap?.id, errors);
    if (!Array.isArray(cap?.portals) || cap.portals.length < 1) fail("Capability without portals: " + cap?.id, errors);
    else for (const portal of cap.portals) {
      if (!knownPortals.includes(portal)) fail("Capability assigned to unknown portal: " + cap?.id, errors);
    }
    if (!["NOT_APPLICABLE", "NOT_AUTHORIZED"].includes(cap?.learnerRuntimeAuthorization)) {
      fail("Unknown or falsely granted student runtime authorization: " + cap?.id, errors);
    }
    if (candidateKinds.has(cap?.kind) && cap.learnerRuntimeAuthorization !== "NOT_AUTHORIZED") {
      fail("Unapproved candidate or preview exposed: " + cap?.id, errors);
    }
    checkPaths(cap?.sourcePaths, "capability " + cap?.id);
    if (cap.externalRefs && (!Array.isArray(cap.externalRefs) || cap.externalRefs.some(x => typeof x !== "string" || !x.startsWith("https://github.com/")))) {
      fail("Invalid external reference on " + cap?.id, errors);
    }
  }
  if (registry.decisions?.materialsRole !== "CROSS_PORTAL_CAPABILITY_NOT_FIFTH_PORTAL") fail("Materials must remain a shared capability", errors);
  if (registry.decisions?.studentLibrarySixTerritories !== "CANDIDATE_TAXONOMY_NOT_APPROVED") fail("Candidate territories must not be approved by this registry", errors);
  return errors;
}

const source = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const errors = validateCapabilityMap(source);
if (errors.length) {
  for (const error of errors) console.error("FAIL ATLAS-PORTALI-02: " + error);
  process.exitCode = 1;
} else {
  console.log("ATLAS-PORTALI-02: PASS — 4 portals, " + source.capabilities.length + " capabilities, source paths and fail-closed boundaries");
}

if (process.argv.includes("--self-test")) {
  const clone = () => structuredClone(source);
  const cases = [
    ["duplicate capability", x => x.capabilities.push(structuredClone(x.capabilities[0]))],
    ["fifth portal", x => x.portals.push({ id: "materiali", label: "Materiali" })],
    ["unknown capability", x => x.portals[0].capabilityIds.push("unknown-cap")],
    ["missing source", x => x.capabilities[0].sourcePaths.push("src/not-existing-capability.ts")],
    ["unsafe candidate", x => x.capabilities.find(c => c.id === "missione-118").learnerRuntimeAuthorization = "AUTHORIZED"],
    ["source authorization ignored", x => x.governance.release = "MAY_PUBLISH_WITH_GREEN_CI"],
    ["unapproved taxonomy promoted", x => x.decisions.studentLibrarySixTerritories = "APPROVED"],
    ["materials fifth portal", x => x.decisions.materialsRole = "FIFTH_PORTAL"]
  ];
  for (const [name, mutation] of cases) {
    const copy = clone();
    mutation(copy);
    if (!validateCapabilityMap(copy).length) {
      console.error("FAIL negative case: " + name);
      process.exitCode = 1;
    }
  }
  if (!process.exitCode) console.log("ATLAS-PORTALI-02: PASS — " + cases.length + " negative self-tests");
}
