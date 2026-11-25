// Local media on a pre-existing mesh. The host owns rendering and navigation.
export function validMediaManifest(m){
 return !!m&&m.schema==="atlas.scene.media/v1"&&m.available===true&&m.studentAuthorized===false&&
 m.width===320&&m.height===180&&m.fps===15&&m.duration===4&&Array.isArray(m.assets)&&m.assets.length===2&&
 m.assets.every((a,i)=>a.name===["foyer-atmosphere.webm","foyer-atmosphere.png"][i]&&Number.isInteger(a.bytes)&&a.bytes>0&&a.bytes<=[400000,150000][i]&&/^[a-f0-9]{64}$/.test(a.sha256));
}
export function createVideoLayer(T,mesh,video,poster,redraw,notify){
 const original=mesh.material;
 const texture=new T.VideoTexture(video);texture.encoding=T.sRGBEncoding;
 const material=new T.MeshBasicMaterial({map:poster,side:T.DoubleSide,transparent:false});
 mesh.material=material;
 let state="poster",frames=0,disposed=false,reduced=false,epoch=0,callback=null;
 function emit(){notify({state,frames});redraw();}
 function clearFrame(){if(callback!==null&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(callback);callback=null;}
 function frame(){
  if(disposed||state!=="playing")return;
  frames++;emit();
  if(video.requestVideoFrameCallback)callback=video.requestVideoFrameCallback(()=>{callback=null;frame();});
 }
 function stop(next="poster"){
  epoch++;clearFrame();video.pause();state=next;material.map=poster;material.needsUpdate=true;emit();
 }
 function onPlaying(){
  if(disposed||state!=="starting")return;
  state="playing";material.map=texture;material.needsUpdate=true;
  emit();
  if(video.requestVideoFrameCallback)callback=video.requestVideoFrameCallback(()=>{callback=null;frame();});
 }
 const onTime=()=>{if(!video.requestVideoFrameCallback)frame();};
 const onEnd=()=>stop(),onError=()=>stop("unavailable");
 video.addEventListener("playing",onPlaying);video.addEventListener("timeupdate",onTime);
 video.addEventListener("ended",onEnd);video.addEventListener("error",onError);
 emit();
 return {
  get state(){return state;},
  async play(){
   if(disposed||reduced||state==="unavailable")return false;
   const current=++epoch;state="starting";emit();
   try{video.currentTime=0;await video.play();return current===epoch&&!disposed;}
   catch{if(current===epoch&&!disposed)stop("poster");return false;}
  },
  stop:()=>stop(),
  setReduced(value){reduced=Boolean(value);if(reduced)stop();},
  dispose(){if(disposed)return;stop();disposed=true;video.removeEventListener("playing",onPlaying);video.removeEventListener("timeupdate",onTime);video.removeEventListener("ended",onEnd);video.removeEventListener("error",onError);video.removeAttribute("src");video.load();mesh.material=original;texture.dispose();material.dispose();poster.dispose();}
 };
}
