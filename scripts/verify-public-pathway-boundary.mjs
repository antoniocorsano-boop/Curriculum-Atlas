import fs from "node:fs";
import { validateIntendedPublicPath } from "./filter-unauthorized-pathway-routes.mjs";

const baseUrl = process.argv[2];
const portfolioPath = process.argv[3] ?? "governance/percorsi-portfolio.json";
if (!baseUrl) {
  console.error("usage: node scripts/verify-public-pathway-boundary.mjs <base-url> [portfolio.json]");
  process.exit(2);
}

const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf8"));
for (const entry of portfolio.pathways ?? []) {
  const target = entry.runtimeQualificationTarget;
  if (!target?.intendedPublicPath) continue;

  const clean = validateIntendedPublicPath(target.intendedPublicPath);
  const root = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const url = new URL(clean + "/", root).toString();
  const response = await fetch(url, { redirect: "follow" });
  const authorized = entry.runtimeAuthorization === "RUNTIME_AUTHORIZED";

  if (authorized && !response.ok) {
    throw new Error(`AUTHORIZED_ROUTE_UNREACHABLE:${entry.pathwayId}:${response.status}`);
  }
  if (!authorized && response.ok) {
    throw new Error(`UNAUTHORIZED_ROUTE_PUBLICLY_REACHABLE:${entry.pathwayId}`);
  }
}
console.log("PERCORSI PUBLIC BOUNDARY: PASS");
