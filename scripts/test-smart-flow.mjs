import assert from "node:assert/strict";
import fs from "node:fs";

const args=process.argv.slice(2); const i=args.indexOf("--flow-package");
if(i<0||!args[i+1]){console.error("usage: node scripts/test-smart-flow.mjs --flow-package <file>");process.exit(2);}
const flow=JSON.parse(fs.readFileSync(args[i+1],"utf8"));
assert.equal(flow.schemaVersion,"atlas.smart.flow-package/v1");
for(const stage of ["F0","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10"]) assert.ok(flow.stages[stage],stage);
assert.ok(["Pronto","Da verificare","Da completare","Da rivedere"].includes(flow.stages.F10.teacherStatus));
if(flow.stages.F5.state!=="COMPLETE") assert.notEqual(flow.stages.F10.teacherStatus,"Pronto");
assert.equal(flow.readinessAuthority,"MATERIAL_SET");
assert.equal(flow.runtime?.learnerIdentityRequired,false);
assert.equal(flow.runtime?.telemetryAllowed,false);
console.log(`PASS Smart flow ${flow.activityId}: ${flow.stages.F10.teacherStatus}`);
