"use client";
import {ExperienceRuntime} from "@/features/experiences/experience-runtime";
import type {ExperienceDefinition} from "@/features/experiences/model";

const definition:ExperienceDefinition={schema:"atlas.experience/v1",experienceId:"text-conformance",kernelRef:"text-conformance-kernel",mode:"SMART",sceneGraph:{entrySceneId:"reason",scenes:[
{id:"reason",primitive:"REFRAME",title:"Text conformance",body:["Record a short reasoning note."],interaction:{kind:"text",prompt:"Your reasoning",placeholder:"Write your reasoning…"},transitions:[{id:"continue",targetSceneId:"done"}]},
{id:"done",primitive:"TRANSFER",title:"Completed",body:["Your local response was retained on this device."],interaction:{kind:"terminal"},transitions:[],terminal:true}
]},presentationGrammarRef:"reflective-notebook",qualificationProfileRef:"SMART_FAST_V1",runtimeStatePolicy:"LOCAL_DEVICE",learnerIdentityRequired:false,telemetryAllowed:false};

export default function TextConformancePage(){return <ExperienceRuntime definition={definition}/>;}
