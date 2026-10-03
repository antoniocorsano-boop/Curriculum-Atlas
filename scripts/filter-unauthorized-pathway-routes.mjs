import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function fail(message) {
  throw new Error(message);
}

export function validateIntendedPublicPath(value) {
  if (typeof value !== "string" || !value.startsWith("/percorsi/")) fail("INVALID_INTENDED_PUBLIC_PATH");
  if (value.includes("/lab/") || value.includes("..") || value.includes("?") || value.includes("#")) {
    fail("UNSAFE_INTENDED_PUBLIC_PATH");
  }
  const clean = value.replace(/^\/+|\/+$/g, "");
  if (!clean || clean === "percorsi") fail("INVALID_INTENDED_PUBLIC_PATH");
  return clean;
}

export function routeDirectory(exportDir, publicPath) {
  return path.join(exportDir, validateIntendedPublicPath(publicPath));
}

export function filterUnauthorizedPathwayRoutes({
  exportDir,
  portfolioPath = "governance/percorsi-portfolio.json",
}) {
  const portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf8"));
  if (!Array.isArray(portfolio.pathways)) fail("PORTFOLIO_PATHWAYS_MISSING");

  const decisions = [];
  for (const entry of portfolio.pathways) {
    const target = entry.runtimeQualificationTarget;
    if (!target?.intendedPublicPath) continue;

    const dir = routeDirectory(exportDir, target.intendedPublicPath);
    const authorized = entry.runtimeAuthorization === "RUNTIME_AUTHORIZED";

    if (!authorized) {
      fs.rmSync(dir, { recursive: true, force: true });
      if (fs.existsSync(dir)) fail(`UNAUTHORIZED_ROUTE_REMAINS:${entry.pathwayId}`);
      decisions.push({ pathwayId: entry.pathwayId, action: "REMOVED", path: target.intendedPublicPath });
      continue;
    }

    if (!fs.existsSync(path.join(dir, "index.html"))) {
      fail(`AUTHORIZED_ROUTE_MISSING:${entry.pathwayId}`);
    }
    decisions.push({ pathwayId: entry.pathwayId, action: "KEPT", path: target.intendedPublicPath });
  }

  return decisions;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const exportDir = process.argv[2] ?? "out";
    const portfolioPath = process.argv[3] ?? "governance/percorsi-portfolio.json";
    const decisions = filterUnauthorizedPathwayRoutes({ exportDir, portfolioPath });
    console.log(JSON.stringify({ status: "PASS", decisions }));
  } catch (error) {
    console.error(error?.message ?? String(error));
    process.exit(1);
  }
}
