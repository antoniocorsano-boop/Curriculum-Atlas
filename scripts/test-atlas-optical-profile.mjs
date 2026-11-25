import assert from "node:assert/strict";
import {makeEnvironment,OPTICAL_PROFILE,createOpticalProfile,OCULUS_FRAGMENT} from "./atlas-gateway-foyer/optical-profile.mjs";
const pixels=makeEnvironment();
assert.equal(pixels.length,131072);
assert.deepEqual(pixels,makeEnvironment());
assert.throws(()=>makeEnvironment(512,256));
assert(pixels.some((v,i)=>i%4!==3&&v>100));
assert.match(OCULUS_FRAGMENT,/gl_FragColor/);
const counters={source:0,generator:0,target:0,shader:0};
class DataTexture{dispose(){counters.source++}}
class PMREMGenerator{fromEquirectangular(){return {texture:{id:"env"},dispose(){counters.target++}}}dispose(){counters.generator++}}
class ShaderMaterial{constructor(o){Object.assign(this,o)}dispose(){counters.shader++}}
const T={DataTexture,PMREMGenerator,ShaderMaterial};
const standard=()=>({isMeshStandardMaterial:true,metalness:.2,roughness:.7,envMap:null,envMapIntensity:1});
const original={id:"oculus"};
const s={stone:standard(),bronze:standard(),obsidian:standard(),frame:standard(),oculus:{material:original}};
const p=createOpticalProfile(T,{},s);
for(const [role,recipe] of Object.entries(OPTICAL_PROFILE.surfaces)){
 assert.equal(s[role].roughness,recipe.roughness);assert.equal(s[role].envMap.id,"env");
}
assert.notEqual(s.oculus.material,original);
p.dispose();p.dispose();
for(const role of Object.keys(OPTICAL_PROFILE.surfaces)){assert.equal(s[role].roughness,.7);assert.equal(s[role].envMap,null);}
assert.equal(s.oculus.material,original);
assert.deepEqual(counters,{source:1,generator:1,target:1,shader:1});
assert.throws(()=>createOpticalProfile(T,{}, {...s,frame:null}),/Missing optical surface/);
assert.equal(s.stone.envMap,null);assert.equal(counters.target,2);
console.log("VF-MOTION-03 optical contracts PASS");
