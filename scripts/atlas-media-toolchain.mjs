import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
export function verifyMediaToolchain(run=execFileSync){
 const call=(tool,args)=>{try{return run(tool,args,{encoding:"utf8",maxBuffer:2*1024*1024});}catch(error){throw Error("ATLAS_MEDIA_TOOLCHAIN:"+tool+":"+(error.code||error.status||"failed"),{cause:error});}};
 const ffmpeg=call("ffmpeg",["-version"]).split("\n")[0];
 const ffprobe=call("ffprobe",["-version"]).split("\n")[0];
 if(!ffmpeg.startsWith("ffmpeg version ")||!ffprobe.startsWith("ffprobe version "))throw Error("ATLAS_MEDIA_TOOLCHAIN:invalid version receipt");
 const encoders=call("ffmpeg",["-hide_banner","-encoders"]);
 for(const name of ["libvpx","png"])if(!encoders.split("\n").some(line=>line.trim().split(/\s+/)[1]===name))throw Error("ATLAS_MEDIA_TOOLCHAIN:missing encoder "+name);
 // Exercise the actual encoder, not just its advertised capability.
 call("ffmpeg",["-hide_banner","-loglevel","error","-f","lavfi","-i","color=c=black:s=32x32:r=15","-frames:v","2","-an","-c:v","libvpx","-threads","1","-f","null","-"]);
 return {ffmpeg,ffprobe,encoders:["libvpx","png"],vp8Smoke:"PASS"};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))console.log(JSON.stringify(verifyMediaToolchain(),null,2));
