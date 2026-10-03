import type {ExperienceDefinition,ExperiencePrimitive,ExperienceScene} from "../model";
type GuidedStep={id:string;title:string;question:string;primitive?:ExperiencePrimitive};
export function adaptSmartGuidedActivity({activityId,kernelRef,steps,materialSetRef}:{activityId:string;kernelRef:string;steps:GuidedStep[];materialSetRef?:string}):ExperienceDefinition{
 const scenes:ExperienceScene[]=steps.map((step,index)=>({id:step.id,primitive:step.primitive||"EXPLORE",title:step.title,interaction:{kind:"text",prompt:step.question},transitions:index<steps.length-1?[{id:"continue",targetSceneId:steps[index+1].id}]:[{id:"finish",targetSceneId:"summary"}]}));
 scenes.push({id:"summary",primitive:"REFRAME",title:"Riepilogo",interaction:{kind:"terminal"},transitions:[],terminal:true});
 return {schema:"atlas.experience/v1",experienceId:activityId,kernelRef,mode:"SMART",sceneGraph:{entrySceneId:steps[0].id,scenes},presentationGrammarRef:"sequential-visual-narrative",materialSetRef,qualificationProfileRef:"SMART_FAST_V1",runtimeStatePolicy:"LOCAL_DEVICE",learnerIdentityRequired:false,telemetryAllowed:false};
}
