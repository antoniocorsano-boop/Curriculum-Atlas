"use client";
import { ExperienceRuntime } from "@/features/experiences/experience-runtime";
import type { ExperienceDefinition } from "@/features/experiences/model";

const definition:ExperienceDefinition={
 schemaVersion:"atlas.experience/v1",experienceId:"conformance-smart",version:"1.0.0",mode:"SMART",kernelRef:"conformance-kernel",qualificationProfileId:"SMART_FAST_V1",
 runtime:{statePolicy:"LOCAL_DEVICE",learnerIdentityRequired:false,telemetryAllowed:false},presentationGrammarIds:["sequential-visual-narrative"],
 graph:{entryNodeId:"entry",nodes:[
  {id:"entry",title:"Experience Engine conformance",prompt:"Osserva il caso e formula una prima risposta.",primitive:"EXPLORE",interaction:"text",feedbackCategory:"EVIDENCE_INCOMPLETE",transitions:[{targetNodeId:"transfer"}]},
  {id:"transfer",title:"Trasferisci",prompt:"Applica la stessa strategia in un contesto diverso.",primitive:"TRANSFER",interaction:"summary",feedbackCategory:"TRANSFER_SUCCESSFUL",terminal:true,transitions:[]}
 ]}
};
export default function ConformancePage(){return <main><ExperienceRuntime definition={definition}/></main>;}
