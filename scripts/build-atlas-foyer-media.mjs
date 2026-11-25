// Original procedural clip, generated locally; no external source or audio.
import {execFileSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {createHash} from "node:crypto";
import {verifyMediaToolchain} from "./atlas-media-toolchain.mjs";
export function buildFoyerMedia(dest){
 const toolchain=verifyMediaToolchain();
 const width=320,height=180,fps=15,duration=4,n=fps*duration;
 const bytes=Buffer.alloc(width*height*3*n);
 for(let f=0;f<n;f++){
  const t=f/(n-1)*Math.PI*2;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const u=x/width-.5,v=y/height-.5;
   const d=(u-.17*Math.sin(t))**2+(v-.12*Math.cos(t))**2;
   const glow=Math.exp(-d*16),ring=Math.exp(-((Math.hypot(u,v)-.24-.045*Math.sin(t))**2)*420);
   const i=((f*height+y)*width+x)*3;
   bytes[i]=Math.round(12+115*glow+34*ring);
   bytes[i+1]=Math.round(24+136*glow+52*ring);
   bytes[i+2]=Math.round(48+153*glow+67*ring);
  }
 }
 const video="foyer-atmosphere.webm",poster="foyer-atmosphere.png";
 const input=["-hide_banner","-loglevel","error","-y","-f","rawvideo","-pixel_format","rgb24","-video_size",width+"x"+height,"-framerate",String(fps),"-i","pipe:0"];
 execFileSync("ffmpeg",[...input,"-an","-c:v","libvpx","-b:v","180k","-pix_fmt","yuv420p","-threads","1",join(dest,video)],{input:bytes});
 execFileSync("ffmpeg",[...input,"-frames:v","1","-threads","1",join(dest,poster)],{input:bytes.subarray(0,width*height*3)});
 const assets=[video,poster].map(name=>{const b=readFileSync(join(dest,name));return {name,bytes:b.length,sha256:createHash("sha256").update(b).digest("hex")}});
 if(assets[0].bytes>400000||assets[1].bytes>150000)throw Error("Media exceeds local budget");
 const probe=JSON.parse(execFileSync("ffprobe",["-v","error","-show_streams","-show_format","-of","json",join(dest,video)],{encoding:"utf8"}));
 if(probe.streams.length!==1||probe.streams[0].codec_name!=="vp8"||probe.streams[0].width!==width||probe.streams[0].height!==height||Math.abs(Number(probe.format.duration)-duration)>.15)throw Error("Unexpected generated media");
 return {schema:"atlas.scene.media/v1",available:true,width,height,fps,duration,assets,toolchain,source:"original-procedural",studentAuthorized:false};
}
