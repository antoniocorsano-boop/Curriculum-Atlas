"use client";
import {useCallback,useEffect,useMemo,useState} from "react";
import type {RuntimeStatePolicy} from "./model";
type Snapshot={currentSceneId:string;responses:Record<string,string>;visitedNodeIds:string[];completion:{status:"in_progress"|"completed"};lastFeedback:string};
const fresh=(entrySceneId:string):Snapshot=>({currentSceneId:entrySceneId,responses:{},visitedNodeIds:[entrySceneId],completion:{status:"in_progress"},lastFeedback:""});
export function useExperienceSession({experienceId,entrySceneId,statePolicy}:{experienceId:string;entrySceneId:string;statePolicy:RuntimeStatePolicy}){
 const key=useMemo(()=>`atlas:experience:${experienceId}:v1`,[experienceId]);const [state,setState]=useState<Snapshot>(()=>fresh(entrySceneId));const [ready,setReady]=useState(statePolicy==="VOLATILE_MEMORY");
 useEffect(()=>{if(statePolicy!=="LOCAL_DEVICE"){setReady(true);return;}try{const raw=localStorage.getItem(key);if(raw){const parsed=JSON.parse(raw) as Snapshot;if(parsed&&typeof parsed.currentSceneId==="string"&&parsed.responses&&Array.isArray(parsed.visitedNodeIds))setState(parsed);}}catch{localStorage.removeItem(key);setState(fresh(entrySceneId));}finally{setReady(true);}},[entrySceneId,key,statePolicy]);
 useEffect(()=>{if(ready&&statePolicy==="LOCAL_DEVICE")localStorage.setItem(key,JSON.stringify(state));},[key,ready,state,statePolicy]);
 const writeResponse=useCallback((sceneId:string,value:string)=>setState(s=>({...s,responses:{...s.responses,[sceneId]:value}})),[]);
 const proceed=useCallback((targetSceneId:string,feedback:string,terminal=false)=>setState(s=>({...s,currentSceneId:targetSceneId,visitedNodeIds:[...s.visitedNodeIds,targetSceneId],lastFeedback:feedback,completion:terminal?{status:"completed"}:s.completion})),[]);
 const restart=useCallback(()=>{if(statePolicy==="LOCAL_DEVICE")localStorage.removeItem(key);setState(fresh(entrySceneId));},[entrySceneId,key,statePolicy]);
 return {ready,...state,writeResponse,proceed,restart};
}
