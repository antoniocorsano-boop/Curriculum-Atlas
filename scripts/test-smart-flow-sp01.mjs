import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";

const flowPath="content/smart-activities/sistema-tecnologico/flow-package.v1.json";
const run=spawnSync(process.execPath,["scripts/test-smart-flow.mjs","--flow-package",flowPath],{encoding:"utf8"});
assert.equal(run.status,0,run.stderr||run.stdout);
const flow=JSON.parse(fs.readFileSync(flowPath,"utf8"));
assert.equal(flow.stages.F5.state,"PENDING");
assert.equal(flow.stages.F8.state,"DEFERRED_NOT_AUTHORIZED");
assert.equal(flow.stages.F10.teacherStatus,"Da completare");
const historical=JSON.parse(fs.readFileSync("content/smart-activities/sistema-tecnologico/material-set.v1.json","utf8"));
assert.equal(historical.publication?.eligibility,"HISTORICAL_NON_PUBLISHABLE");
assert.equal(historical.readiness?.packageReady,false);
console.log("SP-01 SMART FLOW QUALIFICATION: PASS — shared F0→F10 flow; historical lineage preserved.");
