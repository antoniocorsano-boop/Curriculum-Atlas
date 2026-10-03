import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
