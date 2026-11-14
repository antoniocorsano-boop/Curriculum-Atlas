import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {mediaDigestInput,verifyPreviewIllustrations} from "../src/features/pathways/edutwin-preview-media.ts";
const sha=x=>createHash("sha256").update(x).digest("hex");
const base64="UklGRh4AAABXRUJQVlA4TBEAAAAvH8AHAAdQoMIUqv+BiOh/AAA=";
const bytes=Buffer.from(base64,"base64");
const fixture=JSON.parse(readFileSync(new URL("../fixtures/studio-atlas-preview/valid/edutwin-orientation.json",import.meta.url),"utf8"));
function seal(s){s.edutwinMedia.mediaDigest=sha(mediaDigestInput(s,s.edutwinMedia));return s;}
const fresh=()=>seal({...structuredClone(fixture),edutwinMedia:{revisionDigest:"b".repeat(64),mediaDigest:"",
 bindings:[{sceneId:"edutwin-opening",assetId:"city",alt:"Città sintetica",role:"SETTING"}],
 images:[{assetId:"city",sha256:sha(bytes),pixelWidth:32,pixelHeight:32,base64}]}});
assert.equal((await verifyPreviewIllustrations(fixture)).size,0);
const good=fresh(),v=await verifyPreviewIllustrations(good);
assert.equal(v.size,1);
assert.equal(v.get("edutwin-opening").src,"data:image/webp;base64,"+base64);
assert.equal(v.get("edutwin-opening").role,"SETTING");
for(const mutate of [
 s=>s.edutwinMedia.images[0].base64="AA==",
 s=>s.edutwinMedia.images[0].sha256="f".repeat(64),
 s=>s.edutwinMedia.images[0].pixelWidth=33,
 s=>s.edutwinMedia.bindings[0].sceneId="unknown",
 s=>s.edutwinMedia.bindings[0].assetId="missing",
 s=>s.edutwinMedia.bindings[0].url="https://example.invalid/art.webp",
 s=>s.edutwinMedia.bindings.push(s.edutwinMedia.bindings[0]),
 s=>s.edutwinMedia.images.push(s.edutwinMedia.images[0]),
 s=>s.scenes[0].stage={visualMode:"CINEMATIC_EDITORIAL"},
 s=>s.scenes[0].sceneId="legacy"
]){
 const s=fresh();mutate(s);seal(s);
 await assert.rejects(()=>verifyPreviewIllustrations(s),/EDUTWIN_PREVIEW_MEDIA_INVALID/);
}
for(const mutate of [
 s=>s.snapshotId="changed",
 s=>s.packageDigest="c".repeat(64),
 s=>s.scenes[0].visibleSituation="Changed",
 s=>s.edutwinMedia.revisionDigest="c".repeat(64),
 s=>s.edutwinMedia.bindings[0].alt="Changed"
]){
 const s=fresh();mutate(s);
 await assert.rejects(()=>verifyPreviewIllustrations(s),/EDUTWIN_PREVIEW_MEDIA_INVALID/);
}
console.log("EduTwin media binding: PASS (verified bytes, bounded structure, exact snapshot, legacy compatibility).");
