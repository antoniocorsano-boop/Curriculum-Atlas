"use client";
import {ExperienceRuntime} from "@/features/experiences/experience-runtime";
import type {ExperienceDefinition} from "@/features/experiences/model";
const definition:ExperienceDefinition={schema:"atlas.experience/v1",experienceId:"conformance-smart",kernelRef:"conformance-kernel",mode:"SMART",sceneGraph:{entrySceneId:"start",scenes:[
{id:"start",primitive:"EXPLORE",title:"Conformance experience",body:["Inspect the information before deciding."],interaction:{kind:"choice",prompt:"What do you do?",choices:[{id:"inspect",label:"Inspect the evidence",targetSceneId:"transfer",feedback:{category:"EVIDENCE_SUPPORTED",text:"The evidence is now explicit."}}]},transitions:[{id:"inspect",targetSceneId:"transfer"}]},
{id:"transfer",primitive:"TRANSFER",title:"Transfer",body:["Apply the same principle in a changed context."],interaction:{kind:"choice",prompt:"What do you do next?",choices:[{id:"apply",label:"Apply the principle",targetSceneId:"done",feedback:{category:"TRANSFER_SUCCESSFUL",text:"The evidence principle transfers to the new context."}}]},transitions:[{id:"apply",targetSceneId:"done"}]},
{id:"done",primitive:"REFRAME",title:"Completed",body:["You completed the conformance experience."],interaction:{kind:"terminal"},transitions:[],terminal:true}
]},presentationGrammarRef:"sequential-visual-narrative",qualificationProfileRef:"SMART_FAST_V1",runtimeStatePolicy:"LOCAL_DEVICE",learnerIdentityRequired:false,telemetryAllowed:false};
export default function ConformanceExperiencePage(){return <ExperienceRuntime definition={definition}/>;}
