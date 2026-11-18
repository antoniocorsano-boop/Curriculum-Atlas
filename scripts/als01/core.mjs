// ALS-01 v1: renderer-independent light profiles and deterministic sampling.
// Coordinates are local to an object's anchor, in Blender XYZ (Z up).
export const VERSION=1;
// Optical revision R3: widen only the core response; R2 halo, diameter and timing are unchanged.
export const OPTICS=Object.freeze({revision:"ALS-01-R3",minDiameterPx:5,maxDiameterPx:11,diameterScale:2,coreInner:.24,coreOuter:.72,haloInner:.12,haloOuter:1,haloWeight:.42});
export const LIMITS=Object.freeze({maxPointsPerAnchor:7,maxPointsTotal:64,minPeriodSec:3.5,maxAmplitude:.10,maxRadiusFraction:.96,maxOpacity:.42});
const p=(color,count,period,amplitude,opacity,angles)=>Object.freeze({color:Object.freeze(color),count,period,amplitude,opacity,angles:Object.freeze(angles)});
export const PROFILES=Object.freeze({
  memoria:p([1,.68,.30],5,4.8,.08,.32,[.20,1.38,2.65,3.82,5.11]),
  processo:p([.48,.80,1],5,4.1,.09,.34,[.10,1.22,2.47,3.78,5.05]),
  orientamento:p([1,.85,.48],4,4.6,.08,.34,[.40,1.97,3.54,5.11]),
  direzione:p([.58,.80,1],4,5,.08,.33,[.10,.88,2.95,4.00]),
  soglia:p([1,.81,.53],4,5,.06,.26,[.40,1.97,3.54,5.11])
});
export const STATES=Object.freeze({idle:1,focus:1.12,active:1.15,quiet:.68});
const finite=x=>typeof x==="number"&&Number.isFinite(x);
function invariant(ok,msg){if(!ok)throw new RangeError(msg)}
export function validateAnchor(a){
  invariant(a&&typeof a.id==="string"&&/^[a-z0-9_-]{1,64}$/.test(a.id),"invalid anchor id");
  invariant(Object.hasOwn(PROFILES,a.profile),"invalid profile");
  invariant(Array.isArray(a.center)&&a.center.length===3&&a.center.every(finite),"invalid center");
  invariant(finite(a.radius)&&a.radius>0&&a.radius<=100,"invalid radius");
  invariant(finite(a.phase)&&a.phase>=0&&a.phase<1,"invalid phase");
  invariant(Object.hasOwn(STATES,a.state??"idle"),"invalid state");
  invariant(a.enabled===undefined||typeof a.enabled==="boolean","invalid enabled");
  return a;
}
export function validateAnchors(anchors){
  invariant(Array.isArray(anchors)&&anchors.length<=LIMITS.maxPointsTotal,"invalid anchors");
  const ids=new Set();let count=0;
  for(const a of anchors){validateAnchor(a);invariant(!ids.has(a.id),"duplicate anchor");ids.add(a.id);if(a.enabled!==false)count+=PROFILES[a.profile].count;}
  invariant(count<=LIMITS.maxPointsTotal,"point budget exceeded");return anchors;
}
// A smooth, bounded variation; never fully extinguishes a point. No spatial
// movement in v1: optical breathing only. Paused/quiet/reduced-motion uses
// a time-independent value and never changes a user's navigation state.
export function sample(anchors,seconds=0,{reducedMotion=false,paused=false}={}){
  validateAnchors(anchors);invariant(finite(seconds)&&seconds>=0,"invalid time");
  const points=[];
  for(const a of anchors){
    if(a.enabled===false)continue;
    const p=PROFILES[a.profile],state=a.state??"idle",still=paused||reducedMotion||state==="quiet";
    for(let i=0;i<p.count;i++){
      const angle=p.angles[i],r=a.radius*(.86+.04*(i%3)),depth=-a.radius*.14;
      const phase=(a.phase+i*.173)%1;
      const breath=still?1:1+p.amplitude*Math.sin(2*Math.PI*((seconds%p.period)/p.period+phase));
      const opacity=Math.min(LIMITS.maxOpacity,p.opacity*STATES[state]*breath);
      points.push({anchorId:a.id,index:i,position:[a.center[0]+r*Math.cos(angle),a.center[1]+depth,a.center[2]+r*Math.sin(angle)],
        color:p.color.slice(),opacity,radius:a.radius*.024,phase});
    }
  }
  return points;
}
export function atlasAnchors(composition){
  invariant(composition?.selected==="A"&&Array.isArray(composition.ids)&&composition.ids.join(",")==="storie,laboratori,scoperte,percorsi","unexpected Atlas layout");
  const profiles=["memoria","processo","orientamento","direzione"],phases=[.11,.38,.63,.87];
  return validateAnchors(composition.ids.map((id,i)=>({id,profile:profiles[i],center:composition.layouts.A[i].slice(0,3),radius:composition.layouts.A[i][3],phase:phases[i],state:"idle",enabled:true})));
}
export const blenderToThree=([x,y,z])=>[x,z,-y];
