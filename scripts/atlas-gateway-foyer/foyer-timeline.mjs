import {compileTimeline} from "./scene-timeline.mjs";
// Data-only recipe. Replace the recipe, not the renderer, for other scenes.
export const FOYER_TIMELINE=compileTimeline({
  schema:"atlas.scene.timeline/v1",durationMs:4500,frames:[
    {at:0,cue:"arrival",values:{orbit:0,vertical:0,light:0,particles:0,rise:0}},
    {at:1200,cue:"reveal",values:{orbit:.075,vertical:.035,light:.85,particles:.65,rise:.08}},
    {at:2800,cue:"focus",values:{orbit:-.055,vertical:.02,light:1,particles:.85,rise:.18}},
    {at:4500,cue:"idle",values:{orbit:0,vertical:0,light:0,particles:0,rise:0}}
  ]
});
