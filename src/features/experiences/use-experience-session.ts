"use client";
import { useEffect, useMemo, useState } from "react";
import type { RuntimeStatePolicy } from "./model";

type StoredSession = { currentNodeId: string; responses: Record<string,string>; visitedNodeIds: string[]; completion: boolean };

export function useExperienceSession({ experienceId, entryNodeId, statePolicy }:{experienceId:string;entryNodeId:string;statePolicy:RuntimeStatePolicy}) {
 const storageKey=useMemo(()=>`atlas:experience:${experienceId}`,[experienceId]);
 const initial=():StoredSession=>({currentNodeId:entryNodeId,responses:{},visitedNodeIds:[entryNodeId],completion:false});
 const [session,setSession]=useState<StoredSession>(initial);
 const [ready,setReady]=useState(statePolicy==="VOLATILE_MEMORY");
 useEffect(()=>{if(statePolicy!=="LOCAL_DEVICE"){setReady(true);return;} try{const raw=localStorage.getItem(storageKey); if(raw){const parsed=JSON.parse(raw); if(typeof parsed.currentNodeId==="string"&&parsed.responses&&Array.isArray(parsed.visitedNodeIds)) setSession(parsed);}}catch{localStorage.removeItem(storageKey);setSession(initial());}finally{setReady(true);}},[statePolicy,storageKey,entryNodeId]);
 useEffect(()=>{if(ready&&statePolicy==="LOCAL_DEVICE")localStorage.setItem(storageKey,JSON.stringify(session));},[ready,statePolicy,storageKey,session]);
 const choose=(targetNodeId:string)=>setSession(s=>({...s,currentNodeId:targetNodeId,visitedNodeIds:[...s.visitedNodeIds,targetNodeId]}));
 const writeResponse=(nodeId:string,value:string)=>setSession(s=>({...s,responses:{...s.responses,[nodeId]:value}}));
 const complete=()=>setSession(s=>({...s,completion:true}));
 const restart=()=>{if(statePolicy==="LOCAL_DEVICE")localStorage.removeItem(storageKey);setSession(initial());};
 return {...session,ready,choose,writeResponse,complete,restart};
}
