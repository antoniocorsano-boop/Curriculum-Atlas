import assert from "node:assert/strict";
import {compileTimeline,sampleTimeline,createTimelinePlayer} from "./atlas-gateway-foyer/scene-timeline.mjs";
import {FOYER_TIMELINE as t} from "./atlas-gateway-foyer/foyer-timeline.mjs";
assert.equal(sampleTimeline(t,0).cue,"arrival");
assert.equal(sampleTimeline(t,1200).cue,"reveal");
assert.equal(sampleTimeline(t,2800).cue,"focus");
assert.equal(sampleTimeline(t,4500).active,false);
assert.equal(sampleTimeline(t,600).values.orbit,.0375);
assert.equal(sampleTimeline(t,600).values.light,.425);
assert.equal(sampleTimeline(t,NaN).active,false);
for(const bad of [
 {...t,durationMs:10001},
 {...t,frames:[t.frames[1],...t.frames]},
 {...t,frames:[{...t.frames[0],values:{...t.frames[0].values,orbit:.5}},...t.frames.slice(1)]},
 {...t,frames:[{...t.frames[0],values:{...t.frames[0].values,route:"/"}},...t.frames.slice(1)]},
 {...t,frames:[{...t.frames[0],cue:"bad cue"},...t.frames.slice(1)]},
 {...t,frames:[{...t.frames[0],values:{...t.frames[0].values,light:.2}},...t.frames.slice(1)]}
])assert.throws(()=>compileTimeline(bad));
const p=createTimelinePlayer(t);
assert.equal(p.play(100),true);assert.equal(p.tick(1300).cue,"reveal");
p.stop();assert.equal(p.tick(1500).active,false);
p.setReduced(true);assert.equal(p.play(1600),false);
p.setReduced(false);assert.equal(p.play(2000),true);assert.equal(p.tick(6500).active,false);
assert.equal(p.tick(6600).values.orbit,0);
console.log("VF-MOTION-02 timeline contracts PASS");
