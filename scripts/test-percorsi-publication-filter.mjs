import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadPublicPathways } from "../src/features/pathways/load-public-pathways.ts";
import {
  filterUnauthorizedPathwayRoutes,
  routeDirectory,
  validateIntendedPublicPath,
} from "./filter-unauthorized-pathway-routes.mjs";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "atlas-pathway-filter-"));
const out = path.join(root, "out");
fs.mkdirSync(out, { recursive: true });

const portfolio = {
  pathways: [
    {
      pathwayId: "pw-hidden",
      runtimeAuthorization: "NOT_RUNTIME_AUTHORIZED",
      runtimeQualificationTarget: { intendedPublicPath: "/percorsi/pw-hidden" },
    },
    {
      pathwayId: "pw-authorized",
      runtimeAuthorization: "RUNTIME_AUTHORIZED",
      availability: "ACTIVE",
      runtimeQualificationTarget: { intendedPublicPath: "/percorsi/pw-authorized" },
    },
  ],
};
const portfolioPath = path.join(root, "portfolio.json");
fs.writeFileSync(portfolioPath, JSON.stringify(portfolio));

for (const route of ["/percorsi/pw-hidden", "/percorsi/pw-authorized"]) {
  const dir = routeDirectory(out, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), route);
}

const decisions = filterUnauthorizedPathwayRoutes({ exportDir: out, portfolioPath });
assert.equal(fs.existsSync(path.join(out, "percorsi", "pw-hidden")), false);
assert.equal(fs.existsSync(path.join(out, "percorsi", "pw-authorized", "index.html")), true);
assert.deepEqual(decisions.map((x) => x.action), ["REMOVED", "KEPT"]);

for (const bad of [
  "/percorsi/lab/pw-x",
  "/percorsi/../secret",
  "/percorsi/pw-x?debug=1",
  "/percorsi/pw-x#fragment",
  "/other/pw-x",
]) {
  assert.throws(() => validateIntendedPublicPath(bad));
}

const missingAuthorized = structuredClone(portfolio);
missingAuthorized.pathways[1].runtimeQualificationTarget.intendedPublicPath = "/percorsi/missing";
const missingPath = path.join(root, "missing.json");
fs.writeFileSync(missingPath, JSON.stringify(missingAuthorized));
assert.throws(
  () => filterUnauthorizedPathwayRoutes({ exportDir: out, portfolioPath: missingPath }),
  /AUTHORIZED_ROUTE_MISSING/,
);

console.log("PERCORSI PUBLICATION FILTER: PASS");


// Missing or malformed availability must not activate a catalog entry or retain export bytes.
const base = {
  pathwayId: "pw-example", title: "Synthetic example", version: "1.0.0",
  provenanceRef: "SYNTHETIC_TEST", publicPath: "/percorsi/pw-example",
  runtimeAuthorization: "RUNTIME_AUTHORIZED",
};
for (const availability of [undefined, null, "", "UNKNOWN", true]) {
  assert.deepEqual(loadPublicPathways([{ ...base, availability }]), []);
}
assert.equal(loadPublicPathways([{ ...base, availability: "ACTIVE" }])[0].launchHref, base.publicPath);
assert.equal(loadPublicPathways([{ ...base, availability: "WITHDRAWN" }])[0].launchHref, null);
assert.deepEqual(loadPublicPathways([{ ...base, availability: "ACTIVE", runtimeAuthorization: "NOT_RUNTIME_AUTHORIZED" }]), []);
for (const availability of [undefined, null, "", "UNKNOWN", true, "WITHDRAWN", "ACTIVE"]) {
  const localDir = routeDirectory(out, base.publicPath);
  fs.mkdirSync(localDir, { recursive: true });
  fs.writeFileSync(path.join(localDir, "index.html"), "synthetic bytes");
  const source = { ...base, availability, runtimeQualificationTarget: { intendedPublicPath: base.publicPath } };
  fs.writeFileSync(portfolioPath, JSON.stringify({ pathways: [source] }));
  const [decision] = filterUnauthorizedPathwayRoutes({ exportDir: out, portfolioPath });
  const active = availability === "ACTIVE";
  assert.equal(decision.action, active ? "KEPT" : "REMOVED");
  assert.equal(fs.existsSync(path.join(localDir, "index.html")), active);
}
const realPortfolio = JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json", "utf8"));
for (const summary of loadPublicPathways(realPortfolio.pathways)) {
  assert.ok(realPortfolio.pathways.some(entry => entry.pathwayId === summary.pathwayId && entry.runtimeAuthorization === "RUNTIME_AUTHORIZED" && entry.availability === summary.availability));
  if (summary.availability !== "ACTIVE") assert.equal(summary.launchHref, null);
}
console.log("PERCORSI EXPLICIT AVAILABILITY: PASS — catalog and export agree; withdrawn is visible only as a non-launchable summary.");
