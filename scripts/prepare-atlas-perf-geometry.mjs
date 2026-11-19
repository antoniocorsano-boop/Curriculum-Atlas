// PERF-05A local derivative: refine the conservative sphere test using
// a transformed enclosing box. No change to assets, material, raster or master.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {join} from "node:path";
assert.equal(process.env.ATLAS_GATEWAY_PREVIEW,"true");
assert.equal(process.env.ATLAS_GATEWAY_NATIVE_PREVIEW,"true");
assert.notEqual(process.env.ATLAS_GITHUB_PAGES,"true");
const out=process.argv[2],path="scripts/atlas-gateway-integration/bay-visibility.mjs";
const before=readFileSync(path,"utf8"),sha=s=>createHash("sha256").update(s).digest("hex");
let c=before;
function rep(a,b){assert.equal(c.split(a).length,2,"Unexpected source binding "+a.slice(0,90));c=c.replace(a,b)}
rep("    if(!inst.geometry.boundingSphere)inst.geometry.computeBoundingSphere();","    if(!inst.geometry.boundingSphere)inst.geometry.computeBoundingSphere();\n    if(!inst.geometry.boundingBox)inst.geometry.computeBoundingBox();");
rep("sphere:inst.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld)","sphere:inst.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld),box:inst.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld).expandByScalar(.02)");
rep("    if(items.some(q=>!Number.isFinite(q.sphere.radius)||q.sphere.radius<0))","    if(items.some(q=>q.box.isEmpty()||![...q.box.min.toArray(),...q.box.max.toArray()].every(Number.isFinite)||!Number.isFinite(q.sphere.radius)||q.sphere.radius<0))");
rep("let initialized=false,last=null;","let initialized=false,last=null,mode=\"box\";");
rep("    let visible=0,total=0,activeBatches=0;","    let visible=0,total=0,activeBatches=0,sphereVisible=0,boxRejected=0;");
rep("      for(const item of items)if(frustum.intersectsSphere(item.sphere))inst.setMatrixAt(n++,item.matrix);",`      for(const item of items)if(frustum.intersectsSphere(item.sphere)){
        sphereVisible++;
        if(mode==="box"&&!frustum.intersectsBox(item.box)){boxRejected++;continue}
        inst.setMatrixAt(n++,item.matrix);
      }`);
rep("last={visible,total,culled:total-visible,activeBatches,recomputed:true};","last={visible,total,culled:total-visible,activeBatches,recomputed:true,mode,sphereVisible,boxRejected};");
rep("return {update,restoreAll,batches:batches.length};",`// Internal comparison hook, confined to the experiment's opaque scene.
  // No message handler or public command is introduced.
  function setMode(value){if(value!=="sphere"&&value!=="box")throw Error("Unknown visibility mode");if(mode!==value){mode=value;initialized=false}}
  return {update,restoreAll,setMode,batches:batches.length};`);
writeFileSync(path,c);
mkdirSync(out,{recursive:true});
writeFileSync(join(out,"perf-geometry-variant.json"),JSON.stringify({schema:"atlas.perf.geometry.variant/v1",referenceSha256:sha(before),candidateSha256:sha(c),scope:"local CI only; conservative box after sphere; padding .02 scene units",studentAuthorized:false,publishable:false},null,2)+"\n");
