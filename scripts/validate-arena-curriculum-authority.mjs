import fs from "node:fs";

const args = process.argv.slice(2);
const candidateOnly = args.includes("--candidate-only");
const path = args.find((arg) => !arg.startsWith("--"))
  || "src/features/curriculum/arena-curriculum-export.json";
const input = JSON.parse(fs.readFileSync(path, "utf8"));

const errors = [];
const req = (ok, msg) => { if (!ok) errors.push(msg); };

req(input.contract === "ARENA_ATLAS_CURRICULUM_EXPORT_V1", "unsupported contract");
req(input.coverage?.infanziaFields === 5, "Infanzia coverage incomplete");
req(input.coverage?.primaryDisciplines === 11, "Primary discipline coverage incomplete");
req(input.coverage?.secondaryDisciplines === 12, "Secondary discipline coverage incomplete");
req(input.coverage?.primaryGradeBands === 55, "Primary grade coverage incomplete");
req(input.coverage?.secondaryGradeBands === 36, "Secondary grade coverage incomplete");
req(input.coverage?.transversalAxes === 3, "transversal coverage incomplete");

const facade = fs.readFileSync("src/features/curriculum/fixtures.ts", "utf8");
const projectsArenaSnapshot = facade.includes("./arena-projected");

if (!candidateOnly && projectsArenaSnapshot) {
  if (input.authorityState === "PROVISIONAL_COMPLETE") {
    const curriculumPage = fs.readFileSync("src/app/curricolo/page.tsx", "utf8");
    req(input.authorityReceiptRef == null, "PROVISIONAL_COMPLETE cannot claim authorityReceiptRef");
    req(
      curriculumPage.includes("Curriculum provvisorio — non vigente.")
        && curriculumPage.includes("approvazione del Collegio dei docenti")
        && curriculumPage.includes('data-authority-state="PROVISIONAL_COMPLETE"'),
      "PUBLICATION BLOCKED: provisional curriculum requires explicit non-vigente Collegio-pending disclosure"
    );
  } else if (input.authorityState === "APPROVED") {
    req(
      input.authorityReceiptRef && typeof input.authorityReceiptRef === "object",
      "PUBLICATION BLOCKED: authorityReceiptRef missing"
    );
    req(
      input.integrityDigest?.algorithm === "sha256"
        && /^[0-9a-f]{64}$/.test(input.integrityDigest?.hash || ""),
      "PUBLICATION BLOCKED: approved payload requires SHA-256 digest"
    );
  } else {
    req(false, "PUBLICATION BLOCKED: unsupported Arena authorityState");
  }
}

if (errors.length) {
  console.error(errors.map((e) => "ERROR: " + e).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  mode: candidateOnly ? "candidate" : (projectsArenaSnapshot ? "public-projection" : "infrastructure"),
  authorityState: input.authorityState,
  visibleInAtlas: projectsArenaSnapshot,
  vigente: projectsArenaSnapshot && input.authorityState === "APPROVED",
  fingerprint: input.structuralFingerprint.hash,
  coverage: input.coverage
}, null, 2));
