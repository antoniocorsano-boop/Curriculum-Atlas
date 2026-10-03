"use client";
import { useEffect, useRef } from "react";
import type { ExperienceDefinition } from "./model";
import { useExperienceSession } from "./use-experience-session";
import "./experience-runtime.css";

export function ExperienceRuntime({definition}:{definition:ExperienceDefinition}) {
 const session=useExperienceSession({experienceId:definition.experienceId,entryNodeId:definition.graph.entryNodeId,statePolicy:definition.runtime.statePolicy});
 const node=definition.graph.nodes.find(n=>n.id===session.currentNodeId) ?? definition.graph.nodes.find(n=>n.id===definition.graph.entryNodeId);
 const headingRef=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{if(session.ready)headingRef.current?.focus();},[session.currentNodeId,session.ready]);
 if(!session.ready||!node)return <p>Preparazione esperienza…</p>;
 const next=node.transitions[0]?.targetNodeId;
 const title=(node as typeof node & {title?:string}).title ?? (node.primitive==="TRANSFER"?"Trasferisci":node.id);
 return <section className="experience-runtime" aria-labelledby="experience-heading">
  <p className="experience-kicker">{definition.mode==="SMART"?"Attività smart":"Percorso"}</p>
  <h1 id="experience-heading" ref={headingRef} tabIndex={-1}>{title}</h1>
  <p className="experience-prompt">{(node as typeof node & {prompt?:string}).prompt ?? "Osserva, ragiona e procedi."}</p>
  {node.interaction==="text"&&<label className="experience-field">La tua risposta<textarea value={session.responses[node.id]??""} onChange={e=>session.writeResponse(node.id,e.target.value)}/></label>}
  <p role="status" className="experience-feedback">{node.feedbackCategory.replaceAll("_"," ").toLowerCase()}</p>
  <div className="experience-actions">
   {next&&<button type="button" onClick={()=>session.choose(next)}>Continua</button>}
   {node.terminal&&<button type="button" onClick={session.complete}>Completa</button>}
   <button type="button" onClick={session.restart}>Ricomincia</button>
  </div>
 </section>;
}
