import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createStaticSealedPreauthAdapter, digestCandidateSurface } from "./lib/percorsi-sealed-preauth-static-adapter.mjs";
import { filterUnauthorizedPathwayRoutes } from "./filter-unauthorized-pathway-routes.mjs";

function createServer(root) {
  const resolvedRoot = path.resolve(root);
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? "/", "http://localhost").pathname);
    let candidate = path.resolve(resolvedRoot, "." + pathname);
    if (!candidate.startsWith(resolvedRoot + path.sep) && candidate !== resolvedRoot) {
      res.writeHead(404).end();
      return;
    }
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, "index.html");
    if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    fs.createReadStream(candidate).pipe(res);
  });
  return server;
}

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("SERVER_ADDRESS_UNAVAILABLE");
  return "http://127.0.0.1:" + address.port;
}

const exportDir = path.resolve(process.argv[2] ?? "out");
if (!fs.existsSync(exportDir)) throw new Error("STATIC_EXPORT_MISSING");

const portfolioPath = path.resolve("governance/percorsi-portfolio.json");
const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf8"));
const candidates = portfolio.pathways.filter((entry) => entry.runtimeQualificationTarget?.intendedPublicPath);
assert.ok(candidates.length >= 2, "RRT-03 requires both governed pathway targets");

const filteredRoot = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-public-filtered-"));
fs.cpSync(exportDir, filteredRoot, { recursive: true });
const decisions = filterUnauthorizedPathwayRoutes({ exportDir: filteredRoot, portfolioPath });
assert.equal(decisions.filter((x) => x.action === "REMOVED").length, candidates.length);

const sealedServer = createServer(exportDir);
const publicServer = createServer(filteredRoot);
const sealedBaseUrl = await listen(sealedServer);
const publicBaseUrl = await listen(publicServer);

try {
  for (const entry of candidates) {
    assert.equal(entry.runtimeAuthorization, "NOT_RUNTIME_AUTHORIZED");
    const route = entry.runtimeQualificationTarget.intendedPublicPath;
    const fullIndex = path.join(exportDir, route.replace(/^\//, ""), "index.html");
    const filteredIndex = path.join(filteredRoot, route.replace(/^\//, ""), "index.html");
    assert.equal(fs.existsSync(fullIndex), true, entry.pathwayId + " candidate route missing from sealed build");
    assert.equal(fs.existsSync(filteredIndex), false, entry.pathwayId + " leaked into public-filtered build");

    const digest = digestCandidateSurface(exportDir, route);
    assert.match(digest, /^sha256:[0-9a-f]{64}$/);

    const adapter = createStaticSealedPreauthAdapter({
      exportDir,
      intendedPublicPath: route,
      sealedBaseUrl,
      publicBaseUrl,
    });
    const inspected = await adapter.inspectSurface({});
    assert.deepEqual(inspected.reachableRoutes, [route]);
    assert.equal(inspected.surfaceArtifactDigest, digest);

    assert.deepEqual(
      await adapter.request({ route, authorityPresent: true, receiptPresent: true, publicationState: "QUALIFIED" }),
      { outcome: "ALLOW" },
    );
    assert.deepEqual(
      await adapter.request({ route, authorityPresent: false, receiptPresent: true, publicationState: "QUALIFIED" }),
      { outcome: "DENY" },
    );
    assert.deepEqual(
      await adapter.request({ route, authorityPresent: true, receiptPresent: false, publicationState: "QUALIFIED" }),
      { outcome: "DENY" },
    );
    assert.deepEqual(
      await adapter.request({ route, authorityPresent: true, receiptPresent: true, publicationState: "LAB" }),
      { outcome: "DENY" },
    );
    assert.deepEqual(
      await adapter.request({ route: "/percorsi/__probe_unknown__", authorityPresent: true, receiptPresent: true, publicationState: "QUALIFIED" }),
      { outcome: "DENY" },
    );
    assert.equal(await adapter.isPubliclyExposed({}), false);
  }
} finally {
  sealedServer.close();
  publicServer.close();
}

console.log("PERCORSI RRT-03 SEALED PREAUTH STATIC ADAPTER: PASS");
