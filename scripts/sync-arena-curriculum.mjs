import fs from "node:fs/promises";

const sourceUrl = process.env.ARENA_CURRICULUM_EXPORT_URL
  || "https://raw.githubusercontent.com/antoniocorsano-boop/CurManLight_arena/main/exports/atlas-curriculum/current.json";
const target = process.env.ATLAS_CURRICULUM_TARGET
  || "src/features/curriculum/arena-curriculum-export.json";
const facadePath = "src/features/curriculum/fixtures.ts";

const response = await fetch(sourceUrl, { headers: { "User-Agent": "Curriculum-Atlas-sync" } });
if (!response.ok) {
  throw new Error(`Arena curriculum export fetch failed: ${response.status} ${response.statusText}`);
}
const input = await response.json();

const errors = [];
const req = (ok, message) => { if (!ok) errors.push(message); };

req(input.contract === "ARENA_ATLAS_CURRICULUM_EXPORT_V1", "unsupported Arena export contract");
req(input.contractVersion === 1, "unsupported Arena export version");
req(["PROVISIONAL_COMPLETE", "APPROVED"].includes(input.authorityState), "invalid authorityState");
req(input.structuralFingerprint?.algorithm === "fnv1a", "missing structural fingerprint");
req(/^[0-9a-f]{8}$/.test(input.structuralFingerprint?.hash || ""), "invalid structural fingerprint");
req(input.coverage?.infanziaFields === 5, "incomplete Infanzia coverage");
req(input.coverage?.primaryDisciplines === 11, "incomplete Primary discipline coverage");
req(input.coverage?.secondaryDisciplines === 12, "incomplete Secondary discipline coverage");
req(input.coverage?.primaryGradeBands === 55, "incomplete Primary grade coverage");
req(input.coverage?.secondaryGradeBands === 36, "incomplete Secondary grade coverage");
req(Array.isArray(input.curriculum?.disciplines), "missing curriculum disciplines");

if (input.authorityState === "APPROVED") {
  req(input.authorityReceiptRef && typeof input.authorityReceiptRef === "object", "APPROVED export requires authorityReceiptRef");
  req(input.integrityDigest?.algorithm === "sha256", "APPROVED export requires sha256 digest");
  req(/^[0-9a-f]{64}$/.test(input.integrityDigest?.hash || ""), "APPROVED export requires valid sha256 digest");
}
if (input.authorityState === "PROVISIONAL_COMPLETE") {
  req(input.authorityReceiptRef == null, "PROVISIONAL_COMPLETE cannot claim authorityReceiptRef");
}
if (errors.length) {
  throw new Error("Arena curriculum export rejected:\n" + errors.map((e) => "- " + e).join("\n"));
}

const projectedFacade = `export {
  instituteCurriculumFixture,
  arenaCurriculumAuthority,
  findObjective,
} from "./arena-projected";
`;

let previous = null;
try { previous = JSON.parse(await fs.readFile(target, "utf8")); } catch {}

let currentFacade = "";
try { currentFacade = await fs.readFile(facadePath, "utf8"); } catch {}

const samePayload =
  previous?.structuralFingerprint?.hash === input.structuralFingerprint.hash
  && previous?.authorityState === input.authorityState
  && previous?.curriculum?.sourceRevisionId === input.curriculum?.sourceRevisionId;

if (samePayload && currentFacade === projectedFacade) {
  console.log("Arena curriculum already current:", input.structuralFingerprint.hash, input.authorityState);
  process.exit(0);
}

await fs.writeFile(target, JSON.stringify(input, null, 2) + "\n", "utf8");
await fs.writeFile(facadePath, projectedFacade, "utf8");

console.log(JSON.stringify({
  changed: true,
  fingerprint: input.structuralFingerprint.hash,
  authorityState: input.authorityState,
  masterVersion: input.curriculum?.masterVersion,
  atlasVisible: true,
  vigente: input.authorityState === "APPROVED",
}, null, 2));
