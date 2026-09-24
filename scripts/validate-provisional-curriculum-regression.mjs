import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const errors = [];
const req = (ok, message) => { if (!ok) errors.push(message); };

const fixtures = read("src/features/curriculum/fixtures.ts");
const page = read("src/app/curricolo/page.tsx");
const validator = read("scripts/validate-arena-curriculum-authority.mjs");
const sync = read("scripts/sync-arena-curriculum.mjs");
const rule = read("docs/governance/ATLAS-CURR-PROVISIONAL-PUBLICATION-01.md");
const arenaExport = JSON.parse(read("src/features/curriculum/arena-curriculum-export.json"));

req(fixtures.includes("./arena-projected"),
  "REGRESSION: Atlas no longer projects the Arena curriculum snapshot");

req(page.includes("Curriculum provvisorio — non vigente."),
  "REGRESSION: provisional non-vigente disclosure missing");
req(page.includes("approvazione del Collegio dei docenti"),
  "REGRESSION: Collegio pending disclosure missing");
req(page.includes('data-authority-state="PROVISIONAL_COMPLETE"'),
  "REGRESSION: machine-readable provisional authority marker missing");

req(validator.includes('input.authorityState === "PROVISIONAL_COMPLETE"'),
  "REGRESSION: validator no longer handles PROVISIONAL_COMPLETE explicitly");
req(validator.includes("provisional curriculum requires explicit non-vigente Collegio-pending disclosure"),
  "REGRESSION: validator no longer blocks missing provisional disclosure");
req(validator.includes('input.authorityState === "APPROVED"'),
  "REGRESSION: validator no longer handles APPROVED explicitly");
req(validator.includes("authorityReceiptRef missing"),
  "REGRESSION: APPROVED receipt requirement missing");
req(validator.includes("approved payload requires SHA-256 digest"),
  "REGRESSION: APPROVED SHA-256 requirement missing");

req(sync.includes('vigente: input.authorityState === "APPROVED"'),
  "REGRESSION: sync no longer distinguishes visibility from vigency");
req(sync.includes("./arena-projected"),
  "REGRESSION: sync no longer projects Arena data");

req(rule.includes("La visibilità pubblica di una versione provvisoria non equivale a vigenza."),
  "REGRESSION: governance invariant visibility != vigency missing");
req(rule.includes("approvazione del Collegio dei docenti"),
  "REGRESSION: governance rule no longer binds vigency to Collegio approval");

if (arenaExport.authorityState === "PROVISIONAL_COMPLETE") {
  req(arenaExport.authorityReceiptRef == null,
    "REGRESSION: provisional export must not claim authorityReceiptRef");
}
if (arenaExport.authorityState === "APPROVED") {
  req(arenaExport.authorityReceiptRef && typeof arenaExport.authorityReceiptRef === "object",
    "REGRESSION: approved export requires authorityReceiptRef");
  req(arenaExport.integrityDigest?.algorithm === "sha256"
    && /^[0-9a-f]{64}$/.test(arenaExport.integrityDigest?.hash || ""),
    "REGRESSION: approved export requires valid SHA-256 digest");
}

if (errors.length) {
  console.error(errors.map((error) => "ERROR: " + error).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  gate: "ATLAS-CURR-PROVISIONAL-PUBLICATION-01",
  authorityState: arenaExport.authorityState,
  visible: true,
  vigente: arenaExport.authorityState === "APPROVED",
  regressionProtection: "PASS"
}, null, 2));
