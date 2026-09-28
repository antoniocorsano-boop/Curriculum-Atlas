import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

const out=fs.mkdtempSync(path.join(os.tmpdir(),"percorsi-batch-"));
const r=spawnSync(process.execPath,["scripts/run-percorsi-factory-batch.mjs",`--out=${out}`],{encoding:"utf8"});
if(r.status!==0){console.error(r.stdout,r.stderr);process.exit(1);}
const report=JSON.parse(fs.readFileSync(path.join(out,"factory-report.json"),"utf8"));
assert.equal(report.schemaVersion,"atlas.percorsi.factory-batch-report/v1");
assert.equal(report.totalSlots,8);
assert.equal(report.builtValid,1);
assert.equal(report.blocked,0);
assert.equal(report.recoveryPending,7);
assert.ok(fs.existsSync(path.join(out,"pw-missing-information-01.json")));
assert.ok(fs.existsSync(path.join(out,"pw-missing-information-01.dossier.md")));
console.log("PERCORSI FACTORY BATCH RUNNER: PASS");
