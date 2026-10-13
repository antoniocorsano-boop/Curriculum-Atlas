import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import {
  produceQ1,
  produceQ2,
  produceQ3,
  produceQ5,
  produceQ6,
  produceQ7,
} from "./percorsi-g2-evidence-producers.mjs";
import { createStaticSealedPreauthAdapter } from "./lib/percorsi-sealed-preauth-static-adapter.mjs";

function routeUrl(baseUrl, route) {
  const root = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  return new URL(route.replace(/^\//, "") + "/", root).toString();
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

async function driveRepresentativeSession(page) {
  for (let step = 0; step < 12; step += 1) {
    const terminal = page.getByRole("link", { name: "Esci" });
    if (await terminal.count()) break;

    const choices = page.locator('.experience-runtime input[type="radio"]');
    if (await choices.count()) {
      await choices.first().check();
    }

    const next = page.getByRole("button", { name: "Continua" });
    if (!(await next.count()) || !(await next.isEnabled())) break;
    await next.click();
  }
}

async function probeBrowserState({ browser, sealedBaseUrl, publicBaseUrl, candidate, definition }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const requests = [];
  let learnerWriteCount = 0;
  let telemetryCount = 0;
  const sealedOrigin = new URL(sealedBaseUrl).origin;

  page.on("request", (request) => {
    const parsed = new URL(request.url());
    const method = request.method().toUpperCase();
    const record = {
      method,
      origin: parsed.origin,
      requestClass: request.resourceType(),
    };
    requests.push(record);
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) learnerWriteCount += 1;
    if (parsed.origin !== sealedOrigin || /(analytics|telemetry|beacon|track)/i.test(parsed.pathname)) telemetryCount += 1;
  });

  const sealedUrl = routeUrl(sealedBaseUrl, candidate.intendedPublicPath);
  await page.goto(sealedUrl, { waitUntil: "networkidle" });
  const initialHeading = (await page.locator(".experience-runtime h1").first().textContent())?.trim();
  assert.ok(initialHeading, "runtime entry heading missing");

  const accountSurfaceObserved = (await page.locator('input[type="email"], input[type="password"], [data-account], [data-login]').count()) > 0;

  await driveRepresentativeSession(page);

  const state = await page.evaluate(async () => ({
    localStorageEmpty: localStorage.length === 0,
    sessionStorageEmpty: sessionStorage.length === 0,
    indexedDbEmpty: typeof indexedDB.databases === "function" ? (await indexedDB.databases()).length === 0 : true,
    cacheStorageEmpty: "caches" in window ? (await caches.keys()).length === 0 : true,
    serviceWorkerRegistrationCount: "serviceWorker" in navigator ? (await navigator.serviceWorker.getRegistrations()).length : 0,
  }));

  await page.reload({ waitUntil: "networkidle" });
  const reloadedHeading = (await page.locator(".experience-runtime h1").first().textContent())?.trim();
  const reloadReset = reloadedHeading === initialHeading;

  const publicResponse = await fetch(routeUrl(publicBaseUrl, candidate.intendedPublicPath), { redirect: "follow" });
  const withdrawnEntrypointUnavailable = !publicResponse.ok;
  const labFallbackObserved = publicResponse.url.includes("/percorsi/lab/");

  const offlineContext = await browser.newContext({ offline: true });
  const offlinePage = await offlineContext.newPage();
  let offlineFreshStartBlocked = false;
  try {
    await offlinePage.goto(sealedUrl, { waitUntil: "domcontentloaded", timeout: 5000 });
  } catch {
    offlineFreshStartBlocked = true;
  }
  await offlineContext.close();

  await context.close();

  const q2Input = {
    sessionId: "q2-" + candidate.candidateBinding.pathwayId,
    origin: sealedOrigin,
    requests,
    learnerWriteCount,
    telemetryCount,
  };
  const q3Input = {
    sessionId: "q3-" + candidate.candidateBinding.pathwayId,
    statePolicy: definition.runtime.statePolicy,
    ...state,
    reloadReset,
    offlineFreshStartBlocked,
    withdrawnEntrypointUnavailable,
    labFallbackObserved,
  };
  const securityContract = {
    learnerIdentityRequired: definition.runtime.learnerIdentityRequired,
    telemetryAllowed: definition.runtime.telemetryAllowed,
    statePolicy: definition.runtime.statePolicy,
    accountSurfaceObserved,
    persistentIdentifierObserved:
      !state.localStorageEmpty || !state.sessionStorageEmpty || !state.indexedDbEmpty,
  };

  return { q2Input, q3Input, securityContract };
}

const inputPath = path.resolve(process.argv[2] ?? "evidence/percorsi-runtime/rrt04-inputs-2026-10-03.json");
const sealedRoot = path.resolve(process.argv[3] ?? ".rrt04/sealed");
const candidateSource = path.resolve(process.argv[4] ?? ".rrt04/candidate-source");
const sealedBaseUrl = process.argv[5] ?? "http://127.0.0.1:4173";
const outputDir = path.resolve(process.argv[6] ?? ".rrt04/results");

const inputs = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const sealedManifestPath = path.join(sealedRoot, ".rrt03", "PREAUTH-MANIFEST.json");
const sealedExportDir = path.join(sealedRoot, "out");
const sealedManifest = JSON.parse(fs.readFileSync(sealedManifestPath, "utf8"));

assert.equal(sealedManifest.exactHead, inputs.runtimeExactHead);
assert.equal(sealedManifest.studentAuthorized, false);
assert.equal(sealedManifest.publicExposure, false);

const browser = await chromium.launch({ headless: true });
const bundle = {
  schemaVersion: "atlas.percorsi.rrt04-result-bundle/v1",
  runtimeExactHead: inputs.runtimeExactHead,
  runtimeAuthorization: "NOT_RUNTIME_AUTHORIZED",
  candidates: [],
};

try {
  for (const candidate of inputs.candidates) {
    const binding = candidate.candidateBinding;
    assert.equal(binding.runtimeExactHead, inputs.runtimeExactHead);

    const manifestCandidate = sealedManifest.candidates.find((entry) => entry.pathwayId === binding.pathwayId);
    assert.ok(manifestCandidate, binding.pathwayId + " missing from sealed manifest");
    assert.equal(manifestCandidate.publicationId, binding.publicationId);
    assert.equal(manifestCandidate.contentVersion, binding.contentVersion);
    assert.equal(manifestCandidate.authorityRef, candidate.authorityRef);
    assert.equal(manifestCandidate.surfaceArtifactDigest, candidate.surfaceArtifactDigest);

    const definitionPath = path.join(
      candidateSource,
      "content",
      "experiences",
      "pathways",
      binding.pathwayId + ".v1.json",
    );
    const definition = JSON.parse(fs.readFileSync(definitionPath, "utf8"));
    assert.equal(definition.experienceId, binding.pathwayId);
    assert.equal(definition.version, binding.contentVersion);
    assert.equal(definition.runtime.learnerIdentityRequired, false);
    assert.equal(definition.runtime.telemetryAllowed, false);
    assert.equal(definition.runtime.statePolicy, "VOLATILE_MEMORY");

    const transition = {
      ...candidate.q5Transition,
      publicationId: binding.publicationId,
      candidateBinding: binding,
      authorityRef: candidate.authorityRef,
      authorityEvidenceRef: candidate.authorityEvidenceRef,
    };
    const q5 = produceQ5(binding, transition);

    const qualifiedArtifact = {
      id: "rrt04-qualified-content:" + binding.publicationId,
      kind: "QUALIFIED_CONTENT",
      publicationState: "QUALIFIED",
      publicationId: binding.publicationId,
      candidateBinding: binding,
      authorityRef: candidate.authorityRef,
      receiptRef: "sealed-run:" + inputs.sealedArtifact.workflowRunId + "#surface:" + candidate.surfaceArtifactDigest,
      receiptCandidateBinding: binding,
      receiptAuthorityRef: candidate.authorityRef,
    };
    const q6 = produceQ6(binding, qualifiedArtifact, q5);

    const adapter = createStaticSealedPreauthAdapter({
      exportDir: sealedExportDir,
      intendedPublicPath: candidate.intendedPublicPath,
      sealedBaseUrl,
      publicBaseUrl: inputs.publicBoundaryEvidence.baseUrl,
    });
    const q1Target = {
      candidateBinding: binding,
      publicationId: binding.publicationId,
      q6RunId: q6.runId,
      publicationState: "QUALIFIED",
      probeMode: "SEALED_PREAUTH",
      surfaceArtifactDigest: candidate.surfaceArtifactDigest,
      entrypoint: candidate.intendedPublicPath,
    };
    const q1 = await produceQ1(binding, q1Target, q6, adapter);

    const browserEvidence = await probeBrowserState({
      browser,
      sealedBaseUrl,
      publicBaseUrl: inputs.publicBoundaryEvidence.baseUrl,
      candidate,
      definition,
    });
    const q2 = produceQ2(binding, browserEvidence.q2Input);
    const q3 = produceQ3(binding, browserEvidence.q3Input);
    const q7 = produceQ7(binding, browserEvidence.securityContract, q2, q3);

    const results = { Q1: q1, Q2: q2, Q3: q3, Q5: q5, Q6: q6, Q7: q7 };
    for (const [gate, result] of Object.entries(results)) {
      writeJson(path.join(outputDir, binding.pathwayId, gate.toLowerCase() + ".json"), result);
      if (result.status !== "PASS") {
        throw new Error(binding.pathwayId + ":" + gate + ":" + result.status);
      }
    }

    bundle.candidates.push({
      candidateBinding: binding,
      authorityRef: candidate.authorityRef,
      surfaceArtifactDigest: candidate.surfaceArtifactDigest,
      gateStatus: {
        Q1: q1.status,
        Q2: q2.status,
        Q3: q3.status,
        Q4: "NOT_RUN_HUMAN_REQUIRED",
        Q5: q5.status,
        Q6: q6.status,
        Q7: q7.status,
        Q8: "NOT_RUN_POLICY_REQUIRED",
        Q9: "NOT_ELIGIBLE",
      },
    });
  }
} finally {
  await browser.close();
}

writeJson(path.join(outputDir, "rrt04-result-bundle.json"), bundle);
console.log(JSON.stringify(bundle));
