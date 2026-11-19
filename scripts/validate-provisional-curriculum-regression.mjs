import fs from "node:fs";
import vm from "node:vm";
import { stripTypeScriptTypes } from "node:module";

const read = (path) => fs.readFileSync(path, "utf8");
const errors = [];
const req = (ok, message) => { if (!ok) errors.push(message); };

const fixtures = read("src/features/curriculum/fixtures.ts");
const arenaProjected = read("src/features/curriculum/arena-projected.ts");
const staticFixtures = read("src/features/curriculum/fixtures.static.ts");
const curricoloTree = read("src/components/atlas/curriculum-tree.tsx");
const relationExplorer = read("src/components/atlas/relation-explorer.tsx");
const exploreGraph = read("src/features/explore/graph.ts");
const objectivePage = read("src/app/obiettivi/[id]/page.tsx");
const page = read("src/app/curricolo/page.tsx");
const validator = read("scripts/validate-arena-curriculum-authority.mjs");
const sync = read("scripts/sync-arena-curriculum.mjs");
const rule = read("docs/governance/ATLAS-CURR-PROVISIONAL-PUBLICATION-01.md");
const syncDoc = read("docs/ARENA_CURRICULUM_SYNC_V1.md");
const percorsiBoundary = read("docs/governance/ATLAS-PERCORSI-G1-BOUNDARY.md");
const optionalResourceAdapter = read("docs/contracts/OR10-T-OPTIONAL-RESOURCE-ADAPTER.md");
const readme = read("README.md");
const arenaExport = JSON.parse(read("src/features/curriculum/arena-curriculum-export.json"));

req(fixtures.includes("./arena-projected"),
  "REGRESSION: Atlas non proietta più lo snapshot del curricolo Arena");

req(arenaProjected.includes("CurricoloBand")
  && arenaProjected.includes("CurricoloDiscipline")
  && arenaProjected.includes("CurricoloObjective")
  && arenaProjected.includes("CurricoloIstituto"),
  "REGRESSION: Arena projection producer must use canonical Curricolo* domain types");
req(!/\b(?:CurriculumBand|CurriculumDiscipline|CurriculumObjective|InstituteCurriculum)\b/.test(arenaProjected),
  "REGRESSION: Arena projection producer must not import legacy Curriculum* domain types");
req(staticFixtures.includes("CurricoloIstituto"),
  "REGRESSION: static curricolo fixture must use canonical CurricoloIstituto type");
req(!/\bInstituteCurriculum\b/.test(staticFixtures),
  "REGRESSION: static curricolo fixture must not import legacy InstituteCurriculum type");

req(arenaProjected.includes("export const curricoloIstitutoFixture: CurricoloIstituto"),
  "REGRESSION: Arena projection must expose curricoloIstitutoFixture as canonical runtime name");
req(arenaProjected.includes("export const instituteCurriculumFixture = curricoloIstitutoFixture;"),
  "REGRESSION: Arena projection must preserve an explicit legacy fixture alias");
req((arenaProjected.match(/\binstituteCurriculumFixture\b/g) ?? []).length === 1,
  "REGRESSION: Arena projection may use the legacy fixture alias only in its compatibility declaration");
req(staticFixtures.includes("export const curricoloIstitutoFixture: CurricoloIstituto"),
  "REGRESSION: static fixture must expose curricoloIstitutoFixture as canonical runtime name");
req(staticFixtures.includes("export const instituteCurriculumFixture = curricoloIstitutoFixture;"),
  "REGRESSION: static fixture must preserve an explicit legacy fixture alias");
req((staticFixtures.match(/\binstituteCurriculumFixture\b/g) ?? []).length === 1,
  "REGRESSION: static fixture may use the legacy fixture alias only in its compatibility declaration");
req(fixtures.includes("curricoloIstitutoFixture") && fixtures.includes("instituteCurriculumFixture"),
  "REGRESSION: fixture facade must expose canonical name and legacy compatibility alias");
req(sync.includes("curricoloIstitutoFixture") && sync.includes("instituteCurriculumFixture"),
  "REGRESSION: Arena sync must regenerate canonical fixture export and legacy compatibility alias");

for (const [label, source] of [
  ["CurricoloTree", curricoloTree],
  ["RelationExplorer", relationExplorer],
  ["ExploreGraph", exploreGraph],
  ["ObjectivePage", objectivePage],
]) {
  req(source.includes("curricoloIstitutoFixture"),
    `REGRESSION: ${label} must consume curricoloIstitutoFixture`);
  req(!/\binstituteCurriculumFixture\b/.test(source),
    `REGRESSION: ${label} must not consume the legacy fixture alias`);
}

req(page.includes("Curricolo provvisorio — non vigente."),
  "REGRESSION: indicazione 'Curricolo provvisorio — non vigente' mancante");
req(page.includes("approvazione del Collegio dei docenti"),
  "REGRESSION: Collegio pending disclosure missing");
req(page.includes('data-authority-state="PROVISIONAL_COMPLETE"'),
  "REGRESSION: machine-readable provisional authority marker missing");

req(validator.includes('input.authorityState === "PROVISIONAL_COMPLETE"'),
  "REGRESSION: validator no longer handles PROVISIONAL_COMPLETE explicitly");
req(validator.includes("il curricolo provvisorio richiede indicazione esplicita non-vigente"),
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

req(rule.includes("Curricolo provvisorio — non vigente"),
  "REGRESSION: governance rule must use canonical curricolo terminology");
req(rule.includes("La visibilità pubblica di una versione provvisoria non equivale a vigenza."),
  "REGRESSION: governance invariant visibility != vigency missing");
req(rule.includes("approvazione del Collegio dei docenti"),
  "REGRESSION: governance rule no longer binds vigency to Collegio approval");

req(syncDoc.includes("sincronizzazione automatica del curricolo")
  && syncDoc.includes("autorità sul curricolo")
  && syncDoc.includes("modifica del curricolo"),
  "REGRESSION: documento di sincronizzazione Arena → Atlas deve usare il lessico canonico curricolo");
req(!syncDoc.includes("automatic curriculum synchronization")
  && !syncDoc.includes("curriculum authority")
  && !syncDoc.includes("No curriculum edit"),
  "REGRESSION: documento di sincronizzazione Arena → Atlas contiene ancora prosa legacy curriculum");
req(percorsiBoundary.includes("autorità curricolare di Arena"),
  "REGRESSION: boundary Percorsi G1 deve nominare l’autorità curricolare di Arena");
req(!percorsiBoundary.includes("Arena curriculum authority"),
  "REGRESSION: boundary Percorsi G1 contiene ancora prosa legacy curriculum");
req(optionalResourceAdapter.includes("nessuna rivendicazione di autorità sul curricolo"),
  "REGRESSION: OR10-T deve escludere rivendicazioni di autorità sul curricolo");
req(!optionalResourceAdapter.includes("curriculum authority claim"),
  "REGRESSION: OR10-T contiene ancora prosa legacy curriculum");

req(readme.startsWith("# Atlas\n"),
  "REGRESSION: product-facing README must use the canonical product name Atlas");
req(readme.includes("Atlas è la superficie pubblica di navigazione del curricolo"),
  "REGRESSION: README must describe Atlas with canonical curricolo terminology");

req(arenaExport.publicationPolicy?.atlasAutomaticSync === true,
  "REGRESSION: publication policy no longer enables Atlas automatic sync");
req(arenaExport.publicationPolicy?.atlasAutomaticMerge === false,
  "REGRESSION: publication policy no longer forbids automatic merge");
req(Array.isArray(arenaExport.publicationPolicy?.publicVisibilityAllowedAuthorityStates)
  && arenaExport.publicationPolicy.publicVisibilityAllowedAuthorityStates.includes("PROVISIONAL_COMPLETE")
  && arenaExport.publicationPolicy.publicVisibilityAllowedAuthorityStates.includes("APPROVED"),
  "REGRESSION: allowed public visibility states changed");
req(arenaExport.publicationPolicy?.provisionalPublicDisclosureRequired === true,
  "REGRESSION: provisional public disclosure requirement missing");
req(arenaExport.publicationPolicy?.vigencyRequiresAuthorityState === "APPROVED",
  "REGRESSION: vigency no longer requires APPROVED");
req(arenaExport.publicationPolicy?.humanApprovalRequired === true,
  "REGRESSION: human approval requirement missing");

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

// Execute the actual projection and graph (type erasure only, no dependencies).
// The authority workflow runs on Node 22.
const loadModel = (sourceText, bindings, exports) => {
  const stripped = stripTypeScriptTypes(sourceText, { mode: "strip" });
  const executable = stripped
    .replace(/^import[^;]+;\s*/gm, "")
    .replace(/\bexport\s+(?=(const|function)\b)/g, "");
  return vm.runInNewContext(executable + "\n({" + exports.join(",") + "})", bindings);
};
const projection = loadModel(arenaProjected, { arenaExport }, [
  "curricoloIstitutoFixture", "findObjective", "legacyObjectiveMatches", "legacyObjectiveRouteIds"
]);
const current = projection.curricoloIstitutoFixture.disciplines.flatMap(d =>
  d.bands.flatMap(b => b.topics.flatMap(t => t.objectives.map(o => ({ d, b, t, o })))));
const unique = (values) => new Set(values).size === values.length;
req(unique(current.map(x => x.o.id)), "duplicate projected objective IDs");
req(unique(current.map(x => x.o.code)), "duplicate projected objective codes");
req(unique(projection.curricoloIstitutoFixture.disciplines.flatMap(d => d.bands.flatMap(b => b.topics.map(t => t.id)))), "duplicate projected topic IDs");
req(current.every(x => {
  const match = projection.findObjective(x.o.id);
  return match?.objective === x.o && match.band === x.b && match.discipline === x.d;
}), "objective route does not resolve to exact band");
const legacyIds = projection.legacyObjectiveRouteIds();
req(unique([...current.map(x => x.o.id), ...legacyIds]), "duplicate static routes");
const ambiguous = legacyIds.filter(id => projection.legacyObjectiveMatches(id).length > 1);
req(ambiguous.every(id => projection.findObjective(id) === null), "ambiguous historical ID resolves silently");
req(legacyIds.every(id => projection.legacyObjectiveMatches(id).every(x => projection.findObjective(x.objective.id)?.band === x.band)), "historical route has dangling candidate");
const example = projection.legacyObjectiveMatches("tecnologia-classe-i-o1");
req(example.length === 2 && new Set(example.map(x => x.band.schoolStage)).size === 2, "Technology I primary/secondary regression");
req(projection.findObjective("tech-s2-1") === null, "unverified historical fixture linked silently");
req(objectivePage.includes("legacyObjectiveRouteIds()") && objectivePage.includes("legacyObjectiveMatches(id)") && objectivePage.includes("Possibili corrispondenze"), "historical route selector missing");
const catalog = read("src/components/atlas/resource-catalog.tsx");
req(catalog.includes("findObjective(id)") && catalog.includes("Raccordo da verificare"), "unresolved resource references rendered as links");
const graph = loadModel(exploreGraph, { curricoloIstitutoFixture: projection.curricoloIstitutoFixture }, ["exploreGraph"]).exploreGraph;
const graphNodes = new Set(graph.nodes.map(n => n.id));
req(graphNodes.size === graph.nodes.length, "duplicate graph nodes");
req(unique(graph.edges.map(e => e.id)), "duplicate graph edges");
req(graph.edges.every(e => graphNodes.has(e.source) && graphNodes.has(e.target)), "dangling graph edge");
req(graph.nodes.filter(n => n.kind === "objective").length === current.length, "graph objective coverage mismatch");
req(sync.includes("legacyObjectiveMatches,") && sync.includes("legacyObjectiveRouteIds,"), "sync loses historical route support");
console.log(JSON.stringify({gate:"CURR-REF-01/F-R0", objectives:current.length, distinct:new Set(current.map(x=>x.o.id)).size, legacyRoutes:legacyIds.length, ambiguousHistoricalRoutes:ambiguous.length, graphNodes:graph.nodes.length, graphEdges:graph.edges.length}));

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
