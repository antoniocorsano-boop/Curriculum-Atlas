import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { validateIntendedPublicPath } from "../filter-unauthorized-pathway-routes.mjs";

function walkFiles(root) {
  if (!fs.existsSync(root)) return [];
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(full));
    else if (entry.isFile()) output.push(full);
  }
  return output;
}

function routeDir(exportDir, publicPath) {
  return path.join(exportDir, validateIntendedPublicPath(publicPath));
}

export function digestCandidateSurface(exportDir, intendedPublicPath) {
  const roots = [
    routeDir(exportDir, intendedPublicPath),
    path.join(exportDir, "_next", "static"),
  ];
  const files = roots.flatMap(walkFiles).sort();
  if (files.length === 0) throw new Error("SEALED_SURFACE_EMPTY");

  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const rel = path.relative(exportDir, file).replaceAll(path.sep, "/");
    hash.update(rel);
    hash.update("\0");
    hash.update(fs.readFileSync(file));
    hash.update("\0");
  }
  return "sha256:" + hash.digest("hex");
}

function routeUrl(baseUrl, publicPath) {
  const base = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const clean = validateIntendedPublicPath(publicPath);
  return new URL(clean + "/", base).toString();
}

export function createStaticSealedPreauthAdapter({
  exportDir,
  intendedPublicPath,
  sealedBaseUrl,
  publicBaseUrl,
}) {
  const expectedPath = "/" + validateIntendedPublicPath(intendedPublicPath);

  return {
    async inspectSurface() {
      const digest = digestCandidateSurface(exportDir, expectedPath);
      const response = await fetch(routeUrl(sealedBaseUrl, expectedPath), { redirect: "manual" });
      return {
        reachableRoutes: response.ok ? [expectedPath] : [],
        surfaceArtifactDigest: digest,
      };
    },

    async request(input) {
      if (
        input?.route !== expectedPath ||
        input?.authorityPresent !== true ||
        input?.receiptPresent !== true ||
        input?.publicationState !== "QUALIFIED"
      ) {
        return { outcome: "DENY" };
      }
      const response = await fetch(routeUrl(sealedBaseUrl, expectedPath), { redirect: "manual" });
      return { outcome: response.ok ? "ALLOW" : "DENY" };
    },

    async isPubliclyExposed() {
      const response = await fetch(routeUrl(publicBaseUrl, expectedPath), { redirect: "manual" });
      return response.ok;
    },
  };
}
