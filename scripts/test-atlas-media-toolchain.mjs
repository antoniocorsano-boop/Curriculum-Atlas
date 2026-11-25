import assert from "node:assert/strict";
import {verifyMediaToolchain} from "./atlas-media-toolchain.mjs";
function fake(tool,args){
 if(args.includes("-version"))return tool+" version 6.1\n";
 if(args.includes("-encoders"))return " V..... libvpx VP8\n V..... png PNG\n V..... libvpx-vp9 VP9\n";
 return "";
}
assert.equal(verifyMediaToolchain(fake).vp8Smoke,"PASS");
assert.throws(()=>verifyMediaToolchain((tool,args)=>{if(tool==="ffmpeg")throw Object.assign(Error("missing"),{code:"ENOENT"});return fake(tool,args);}),/ATLAS_MEDIA_TOOLCHAIN:ffmpeg:ENOENT/);
assert.throws(()=>verifyMediaToolchain((tool,args)=>args.includes("-encoders")?" V..... libvpx-vp9 VP9\n V..... png PNG\n":fake(tool,args)),/missing encoder libvpx/);
assert.throws(()=>verifyMediaToolchain((tool,args)=>args.includes("-encoders")?" V..... libvpx VP8\n":fake(tool,args)),/missing encoder png/);
assert.throws(()=>verifyMediaToolchain((tool,args)=>{if(args.includes("lavfi"))throw Object.assign(Error("encode failed"),{status:1});return fake(tool,args);}),/ATLAS_MEDIA_TOOLCHAIN:ffmpeg:1/);
console.log("ATLAS_MEDIA_TOOLCHAIN contracts PASS");
