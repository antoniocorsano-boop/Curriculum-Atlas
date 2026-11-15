import assert from "node:assert/strict";
import fs from "node:fs";
import { specializedSnapshotToExperience } from "../src/features/pathways/specialized-preview-adapter.ts";
import { studioAtlasSnapshotToExperience } from "../src/features/pathways/studio-atlas-preview-adapter.ts";
import {validateExperienceDefinition} from "./lib/experience-contracts.mjs";
const source=process.argv[2];
if(!source)throw Error("Expected actual Studio Atlas compiled snapshot path");
const s=JSON.parse(fs.readFileSync(source,"utf8"));
const binding={rendererId:"energy-lamp",version:1};
const d=specializedSnapshotToExperience(s,binding);
assert.equal(validateExperienceDefinition(d).valid,true);
assert.equal(d.graph.entryNodeId,"lab");
assert.equal(d.graph.nodes[0].interaction,"specialized");
assert.deepEqual(d.graph.nodes[0].specialized,binding);
assert.equal(d.graph.nodes[0].transitions[0].targetNodeId,"transfer");
assert.equal(d.graph.nodes[1].primitive,"TRANSFER");
assert.equal(d.runtime.statePolicy,"VOLATILE_MEMORY");
assert.throws(()=>studioAtlasSnapshotToExperience(s),/STUDIO_ATLAS_PREVIEW_INVALID/);
for(const b of [undefined,{rendererId:"unknown",version:1},{rendererId:"energy-lamp",version:2}])assert.throws(()=>specializedSnapshotToExperience(s,b),/AXF_SPECIALIZED_SNAPSHOT_INVALID/);
for(const change of [
 x=>{x.studentAuthorized=true},
 x=>{x.runtimeAuthorized=true},
 x=>{x.edutwinMedia={}},
 x=>{x.scenes[0].stage={}},
 x=>{x.scenes[0].specialized.url="https://example.com"},
 x=>{x.scenes[0].nextSceneRefs=[]},
 x=>{x.scenes[0].interaction="SUMMARY"},
 x=>{x.scenes[1].kind="SCENE"},
 x=>{x.scenes[1].sceneId=x.scenes[0].sceneId}
]){const bad=structuredClone(s);change(bad);assert.throws(()=>specializedSnapshotToExperience(bad,binding),/AXF_SPECIALIZED_SNAPSHOT_INVALID/)}
console.log("PASS F1 actual Studio compiler → Atlas adapter, existing contract, v0.1 rejection and negative cases");
