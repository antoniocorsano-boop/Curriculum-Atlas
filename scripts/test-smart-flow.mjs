import assert from "node:assert/strict";
import fs from "node:fs";
import {spawnSync} from "node:child_process";
import {validateSmartFlowPackage} from "./build-smart-flow-package.mjs";

const i=process.argv.indexOf("--flow-package");
const flowPath=i>=0?process.argv[i+1]:undefined;
assert.ok(flowPath,"--flow-package required");
const flow=JSON.parse(fs.readFileSync(flowPath,"utf8"));
const result=validateSmartFlowPackage(flow,{root:process.cwd()});
assert.equal(result.valid,true,result.errors.join("\n"));
assert.deepEqual(Object.keys(flow.stages),Array.from({length:11},(_,n)=>`F${n}`));
const material=JSON.parse(fs.readFileSync(flow.materialSetRef,"utf8"));
const validation=spawnSync(process.execPath,["scripts/validate-smart-materialset.mjs",flow.materialSetRef],{encoding:"utf8"});
assert.equal(validation.status,0,validation.stderr||validation.stdout);
if(material.readiness?.packageReady!==true) assert.notEqual(flow.stages.F10.teacherStatus,"Pronto");
if(flow.stages.F10.teacherStatus==="Pronto") {
 assert.equal(flow.stages.F5.state,"PASS");
 assert.equal(flow.stages.F6.state,"PASS");
 assert.equal(flow.stages.F9.state,"PASS");
}
const verifierSource=fs.readFileSync("scripts/verify-smart-public-asset.mjs","utf8");
const hashPos=verifierSource.indexOf('crypto.createHash("sha256").update(bytes)');
const mismatchPos=verifierSource.indexOf("if (actual !== expectedDigest) fail");
const receiptPos=verifierSource.indexOf("fs.writeFileSync(out");
assert.ok(hashPos>=0&&mismatchPos>hashPos&&receiptPos>mismatchPos,"public verifier must hash, reject mismatch, then write receipt");
console.log("SMART FLOW: PASS",flow.activityId,flow.stages.F10.teacherStatus);
