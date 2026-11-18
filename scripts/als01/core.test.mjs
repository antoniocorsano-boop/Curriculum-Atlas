import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PROFILES,LIMITS,STATES,atlasAnchors,sample,validateAnchors,blenderToThree,OPTICS} from "./core.mjs";
const composition=JSON.parse(readFileSync(new URL("../atlas-gateway-c3/knowledge-composition.json",import.meta.url)));
const anchors=atlasAnchors(composition);
assert.deepEqual(anchors.map(a=>a.profile),["memoria","processo","orientamento","direzione"]);
assert.equal(sample(anchors).length,18);
assert.equal(Object.keys(PROFILES).length,5);
assert.equal(OPTICS.revision,"ALS-01-R3");
assert.deepEqual([OPTICS.minDiameterPx,OPTICS.maxDiameterPx,OPTICS.diameterScale,OPTICS.haloInner,OPTICS.haloOuter,OPTICS.haloWeight],[5,11,2,.12,1,.42]);
assert.deepEqual([OPTICS.coreInner,OPTICS.coreOuter],[.24,.72]);
// R3 increases the core footprint only. Peak alpha is unchanged.
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const curve=(a,b,x)=>Math.max(1-smooth(a,b,x),(1-smooth(OPTICS.haloInner,OPTICS.haloOuter,x))*OPTICS.haloWeight);
for(let i=0;i<=100;i++){const x=i/100;const r3=curve(OPTICS.coreInner,OPTICS.coreOuter,x);assert.ok(r3>=curve(.18,.64,x)-1e-12&&r3<=1);}
assert.equal(curve(OPTICS.coreInner,OPTICS.coreOuter,0),1);
assert.equal(curve(OPTICS.coreInner,OPTICS.coreOuter,1),0);
for(const p of Object.values(PROFILES)){
  assert.ok(p.count<=LIMITS.maxPointsPerAnchor&&p.period>=LIMITS.minPeriodSec&&p.amplitude<=LIMITS.maxAmplitude);
  assert.equal(p.angles.length,p.count);
}
const steady=sample(anchors,0,{paused:true});
assert.deepEqual(steady,sample(anchors,10000,{paused:true}));
assert.deepEqual(steady,sample(anchors,7,{reducedMotion:true}));
assert.deepEqual(sample(anchors,0),sample(anchors,0));
assert.notDeepEqual(sample(anchors,0),sample(anchors,1));
for(let t=0;t<=20;t+=.025){
  const points=sample(anchors,t);
  points.forEach((p,i)=>{
    const a=anchors.find(a=>a.id===p.anchorId),profile=PROFILES[a.profile];
    assert.deepEqual(p.position,steady[i].position);
    assert.ok(Math.hypot(...p.position.map((x,j)=>x-a.center[j]))<=a.radius*LIMITS.maxRadiusFraction);
    assert.ok(p.opacity>=profile.opacity*(1-profile.amplitude)-1e-9&&p.opacity<=LIMITS.maxOpacity);
    assert.ok(p.radius>0&&p.radius<=a.radius*.025);
  });
}
for(const state of Object.keys(STATES)){
  const a=anchors.map(x=>({...x,state}));
  assert.ok(sample(a,12).every(p=>p.opacity>0&&p.opacity<=LIMITS.maxOpacity));
  if(state==="quiet")assert.deepEqual(sample(a,12),sample(a,2));
}
assert.equal(sample(anchors.map(a=>({...a,enabled:false}))).length,0);
assert.throws(()=>validateAnchors([anchors[0],anchors[0]]));
assert.throws(()=>validateAnchors([{...anchors[0],profile:"flash"}]));
assert.throws(()=>validateAnchors([{...anchors[0],phase:NaN}]));
assert.throws(()=>validateAnchors(Array.from({length:14},(_,i)=>({...anchors[0],id:"a"+i}))));
assert.throws(()=>sample(anchors,Infinity));
assert.deepEqual(blenderToThree([1,2,3]),[1,3,-2]);
console.log("ALS-01 PASS: five profiles, four states, 18 Atlas points, bounded envelope, continuous slow intensity, no spatial motion, pause/reduced motion, invalid input rejection");
