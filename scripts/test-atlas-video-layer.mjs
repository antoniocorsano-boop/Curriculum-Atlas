import assert from "node:assert/strict";
import {validMediaManifest,createVideoLayer} from "./atlas-gateway-foyer/video-layer.mjs";
const manifest={schema:"atlas.scene.media/v1",available:true,studentAuthorized:false,width:320,height:180,fps:15,duration:4,assets:["foyer-atmosphere.webm","foyer-atmosphere.png"].map(name=>({name,bytes:100,sha256:"a".repeat(64)}))};
assert(validMediaManifest(manifest));assert(!validMediaManifest({...manifest,studentAuthorized:true}));
assert(!validMediaManifest({...manifest,assets:[{...manifest.assets[0],name:"../bad.webm"},manifest.assets[1]]}));
assert(!validMediaManifest({...manifest,assets:[{...manifest.assets[0],bytes:400001},manifest.assets[1]]}));
class Video extends EventTarget{pause(){}async play(){this.dispatchEvent(new Event("playing"));}removeAttribute(){}load(){}}
class Texture{dispose(){this.disposed=true}}
class Material{constructor(o){Object.assign(this,o)}dispose(){this.disposed=true}}
const video=new Video(),original={},mesh={material:original},poster=new Texture(),trace=[];
const layer=createVideoLayer({VideoTexture:Texture,MeshBasicMaterial:Material},mesh,video,poster,()=>{},r=>trace.push(r));
assert.equal(layer.state,"poster");assert(await layer.play());assert.equal(layer.state,"playing");
video.dispatchEvent(new Event("timeupdate"));assert.equal(trace.at(-1).frames,1);
layer.setReduced(true);assert.equal(layer.state,"poster");assert.equal(await layer.play(),false);
layer.setReduced(false);assert(await layer.play());video.dispatchEvent(new Event("ended"));assert.equal(layer.state,"poster");
layer.dispose();assert.equal(mesh.material,original);assert(poster.disposed);
console.log("VF-MOTION-04 media contracts PASS");
