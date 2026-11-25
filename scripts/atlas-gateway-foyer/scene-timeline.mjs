// VF-MOTION-02: renderer-neutral, declarative finite timeline. No timers, callbacks from data or navigation.
const LIMITS=Object.freeze({orbit:[-.10,.10],vertical:[-.08,.08],light:[0,1],particles:[0,1],rise:[0,.25]});
const keys=Object.keys(LIMITS);
const zero=()=>Object.fromEntries(keys.map(k=>[k,0]));
export function compileTimeline(input){
  if(!input||input.schema!=="atlas.scene.timeline/v1"||!Number.isInteger(input.durationMs)||input.durationMs<500||input.durationMs>10000)throw Error("Invalid timeline duration/schema");
  if(!Array.isArray(input.frames)||input.frames.length<2||input.frames.length>24)throw Error("Invalid frame count");
  let previous=-1;
  const frames=input.frames.map(f=>{
    if(!Number.isInteger(f.at)||f.at<=previous||f.at>input.durationMs||typeof f.cue!=="string"||!(/^[a-z][a-z0-9-]{0,31}$/).test(f.cue))throw Error("Invalid frame/cue");
    previous=f.at;
    if(!f.values||Object.keys(f.values).length!==keys.length)throw Error("Invalid channels");
    const values={};
    for(const k of keys){const v=f.values[k], [min,max]=LIMITS[k];if(!Number.isFinite(v)||v<min||v>max)throw Error("Invalid channel "+k);values[k]=v;}
    return Object.freeze({at:f.at,cue:f.cue,values:Object.freeze(values)});
  });
  if(frames[0].at!==0||frames.at(-1).at!==input.durationMs||keys.some(k=>frames[0].values[k]!==0||frames.at(-1).values[k]!==0))throw Error("Timeline must begin and end at rest");
  return Object.freeze({schema:input.schema,durationMs:input.durationMs,frames:Object.freeze(frames)});
}
export function sampleTimeline(timeline,elapsed){
  if(!Number.isFinite(elapsed)||elapsed<0||elapsed>=timeline.durationMs)return {active:false,cue:"idle",values:zero()};
  const i=timeline.frames.findIndex(f=>f.at>elapsed);
  const a=timeline.frames[i-1],b=timeline.frames[i];
  const t=(elapsed-a.at)/(b.at-a.at),e=t*t*(3-2*t);
  return {active:true,cue:a.cue,values:Object.fromEntries(keys.map(k=>[k,a.values[k]+(b.values[k]-a.values[k])*e]))};
}
export function createTimelinePlayer(timeline){
  let start=null,reduced=false;
  return {
    play(now){if(reduced||!Number.isFinite(now))return false;start=now;return true;},
    stop(){start=null;},
    setReduced(value){reduced=Boolean(value);if(reduced)start=null;},
    tick(now){if(start===null)return {active:false,cue:"idle",values:zero()};
      const result=sampleTimeline(timeline,Math.max(0,now-start));if(!result.active)start=null;return result;}
  };
}
