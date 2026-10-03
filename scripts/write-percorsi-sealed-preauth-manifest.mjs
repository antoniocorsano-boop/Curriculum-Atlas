import fs from "node:fs";
import path from "node:path";
import { digestCandidateSurface } from "./lib/percorsi-sealed-preauth-static-adapter.mjs";

const exportDir = path.resolve(process.argv[2] ?? "out");
const exactHead = process.argv[3] ?? process.env.GITHUB_SHA;
const outputPath = path.resolve(process.argv[4] ?? ".rrt03/PREAUTH-MANIFEST.json");

if (!/^[0-9a-f]{40}$/.test(exactHead ?? "")) throw new Error("EXACT_HEAD_REQUIRED");

const portfolio = JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json", "utf8"));
const candidates = (portfolio.pathways ?? [])
  .filter((entry) => entry.runtimeQualificationTarget?.intendedPublicPath)
  .map((entry) => ({
    pathwayId: entry.pathwayId,
    contentVersion: entry.runtimeQualificationTarget.contentVersion,
    publicationId: entry.runtimeQualificationTarget.publicationId,
    authorityRef: entry.authorityRef,
    intendedPublicPath: entry.runtimeQualificationTarget.intendedPublicPath,
    runtimeAuthorization: entry.runtimeAuthorization,
    surfaceArtifactDigest: digestCandidateSurface(exportDir, entry.runtimeQualificationTarget.intendedPublicPath),
  }));

if (candidates.length < 2) throw new Error("SEALED_PREAUTH_CANDIDATES_INCOMPLETE");
if (candidates.some((entry) => entry.runtimeAuthorization !== "NOT_RUNTIME_AUTHORIZED")) {
  throw new Error("RRT03_REQUIRES_NOT_RUNTIME_AUTHORIZED");
}

const manifest = {
  schemaVersion: "atlas.percorsi.sealed-preauth-manifest/v1",
  exactHead,
  channel: "SEALED_PREAUTH_ARTIFACT_ONLY",
  studentAuthorized: false,
  publicExposure: false,
  candidates,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ status: "PASS", outputPath, candidates: candidates.map((x) => x.pathwayId) }));
