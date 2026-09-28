import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {buildPathwayCandidate,buildDossier} from "./build-percorsi-pathway-candidate.mjs";

const seed=JSON.parse(fs.readFileSync("fixtures/percorsi-factory/valid/missing-information.seed.json","utf8"));
const a=buildPathwayCandidate(seed);
const b=buildPathwayCandidate(structuredClone(seed));
assert.deepEqual(a,b,"factory output must be deterministic");
assert.equal(a.governance.authorizationState,"NOT_RUNTIME_AUTHORIZED");
assert.equal(a.governance.learnerNetworkWrite,"forbidden");
assert.equal(a.governance.learnerTelemetry,"forbidden");
assert.equal(a.presentationGrammars.length,2);
assert.deepEqual(a.presentationGrammars[0].semanticCoverage,a.presentationGrammars[1].semanticCoverage);
assert.match(buildDossier(seed),/Decisioni ancora umane/);

const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"percorsi-factory-"));
const file=path.join(tmp,"candidate.json");
fs.writeFileSync(file,JSON.stringify(a,null,2));
const result=spawnSync(process.execPath,["scripts/validate-g2-pathway.mjs",file],{encoding:"utf8"});
if(result.status!==0){console.error(result.stdout,result.stderr);process.exit(1);}
const report=JSON.parse(result.stdout);
assert.equal(report.valid,true);

for(const mut of [
 s=>delete s.coreStrategy,
 s=>s.schemaVersion="foreign/v1",
 s=>delete s.cognitiveFunctions.transfer
]){
 const x=structuredClone(seed);mut(x);
 assert.throws(()=>buildPathwayCandidate(x));
}
console.log("PERCORSI-PORTFOLIO-FACTORY-01: PASS");
