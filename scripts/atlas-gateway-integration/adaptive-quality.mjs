// PERF-04 deterministic quality policy. Elapsed wall-clock fence observation
// is NOT GPU execution time. No device fingerprint or network telemetry.
export const QUALITY_LIMITS=Object.freeze([1048576,786432,524288]);
export function createQualityController({adaptive=true}={}){
  let tier=0,slow=0,healthy=0,lastChange=-Infinity,samples=0;
  const transitions=[];
  return {
    observe({elapsedMs,skippedPolls,nowMs,eligible=true}){
      if(!Number.isFinite(elapsedMs)||elapsedMs<0||!Number.isInteger(skippedPolls)||skippedPolls<0||!Number.isFinite(nowMs))throw Error("Invalid quality observation");
      samples++;
      const pressured=elapsedMs>=220||skippedPolls>=2;
      const comfortable=elapsedMs<=140&&skippedPolls===0;
      slow=pressured?slow+1:0;healthy=comfortable?healthy+1:0;
      const before=tier;
      if(adaptive&&eligible&&nowMs-lastChange>=1500){
        if(slow>=3&&tier<QUALITY_LIMITS.length-1)tier++;
        else if(healthy>=8&&tier>0)tier--;
      }
      if(tier!==before){
        transitions.push({from:before,to:tier,reason:tier>before?"sustained-pressure":"sustained-recovery",atMs:Math.round(nowMs),elapsedMs:Math.round(elapsedMs),skippedPolls});
        // Bounded history; preserve a separate total in the browser receipt.
        if(transitions.length>32)transitions.shift();
        lastChange=nowMs;slow=0;healthy=0;
        return true;
      }
      return false;
    },
    limit(){return QUALITY_LIMITS[tier]},
    snapshot(){return {adaptive,tier,limit:QUALITY_LIMITS[tier],samples,slow,healthy,transitions:transitions.map(x=>({...x}))}}
  };
}
