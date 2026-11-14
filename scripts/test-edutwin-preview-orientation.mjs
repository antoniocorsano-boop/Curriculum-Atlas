import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { studioAtlasSnapshotToExperience } from "../src/features/pathways/studio-atlas-preview-adapter.ts";

const fixture = JSON.parse(readFileSync(new URL("../fixtures/studio-atlas-preview/valid/edutwin-orientation.json", import.meta.url), "utf8"));
const definition = studioAtlasSnapshotToExperience(fixture);
assert.equal(definition.graph.entryNodeId, "edutwin-opening");
assert.deepEqual(definition.runtime, {statePolicy:"VOLATILE_MEMORY",learnerIdentityRequired:false,telemetryAllowed:false});
const node = (id) => definition.graph.nodes.find((n)=>n.id===id);
assert.equal(node("edutwin-opening").transitions[0].label, "Raggiungi il punto di incontro");
assert.equal(node("document").transitions[0].label, "Apri il documento originale");
assert.deepEqual(node("document").facts, [fixture.scenes[1].visibleSituation]);
assert.match(node("document").transitions[0].feedback, /chiusura temporanea/);
assert.deepEqual(node("choice").facts, [fixture.scenes[2].visibleSituation]);
assert.match(node("choice").transitions[1].feedback, /contesto completo/);
assert.equal(node("choice").transitions[1].targetNodeId, "repair");
assert.equal(node("choice").transitions[1].worldAfter.status, "Avviso ancora incompleto");
assert.equal(node("finish").terminal, true);
assert.equal(node("finish").facts[1], "Il problema è risolto.");
assert.equal(node("finish").facts[2], "Verificare la fonte prima di agire.");
const legacy = structuredClone(fixture);
legacy.scenes[0].sceneId="legacy-opening";
const old = studioAtlasSnapshotToExperience(legacy);
assert.equal(old.graph.nodes[0].transitions[0].label,"Continua");
assert.equal(old.graph.nodes[1].facts.length,2);
console.log("EduTwin preview orientation: PASS (authored actions, deferred revelations, branching, terminal closure, legacy compatibility).");

for(const [stage,reason] of [
 [{visualMode:"CINEMATIC_EDITORIAL",workbench:{prompt:"Test",minEvidence:0}},/workbenchModes/],
 [{visualMode:"CINEMATIC_EDITORIAL",characterBeat:{role:"Curatrice",line:"Test"}},/characterBeat/],
 [{visualMode:"CINEMATIC_EDITORIAL",locations:"invalid"},/locations/],
 [{visualMode:"CINEMATIC_EDITORIAL",evidence:[{id:"a",label:"Test",detail:"Test",kind:"TRACE",locationId:"missing"}]},/evidenceLocation/]
]){
 const bad=structuredClone(fixture);bad.scenes[0].stage=stage;
 assert.throws(()=>studioAtlasSnapshotToExperience(bad),reason);
}
console.log("Stage validation: PASS.");

for(const target of ["world","worldAfter"]){
 const bad=structuredClone(fixture);
 const choice=bad.scenes.find(scene=>scene.interaction==="CHOICE");
 const world=target==="world"?choice.world:choice.choices[0].worldAfter;
 world.signals[0].detail={text:"not a string"};
 assert.throws(()=>studioAtlasSnapshotToExperience(bad),/signalDetail/);
}
console.log("World signal detail validation: PASS.");
