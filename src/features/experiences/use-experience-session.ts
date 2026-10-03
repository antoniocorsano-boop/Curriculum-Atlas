"use client";
import { useEffect, useMemo, useState } from "react";
import type { RuntimeStatePolicy } from "./model";

type StoredSession = {
  currentNodeId: string;
  responses: Record<string,string>;
  visitedNodeIds: string[];
  completion: boolean;
};

export function useExperienceSession({
  experienceId,
  entryNodeId,
  statePolicy,
}: {
  experienceId:string;
  entryNodeId:string;
  statePolicy:RuntimeStatePolicy;
}) {
  const storageKey = useMemo(() => `atlas:experience:${experienceId}`, [experienceId]);
  const initial = ():StoredSession => ({
    currentNodeId:entryNodeId,
    responses:{},
    visitedNodeIds:[entryNodeId],
    completion:false,
  });
  const [session,setSession] = useState<StoredSession>(initial);
  const [sessionVersion,setSessionVersion] = useState(1);
  const [ready,setReady] = useState(statePolicy === "VOLATILE_MEMORY");

  useEffect(() => {
    if (statePolicy !== "LOCAL_DEVICE") {
      setReady(true);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed.currentNodeId === "string" &&
          parsed.responses &&
          Array.isArray(parsed.visitedNodeIds)
        ) setSession(parsed);
      }
    } catch {
      localStorage.removeItem(storageKey);
      setSession(initial());
    } finally {
      setReady(true);
    }
  }, [statePolicy,storageKey,entryNodeId]);

  useEffect(() => {
    if (ready && statePolicy === "LOCAL_DEVICE") {
      localStorage.setItem(storageKey,JSON.stringify(session));
    }
  }, [ready,statePolicy,storageKey,session]);

  const choose = (targetNodeId:string) => setSession((current) => ({
    ...current,
    currentNodeId:targetNodeId,
    visitedNodeIds:[...current.visitedNodeIds,targetNodeId],
  }));
  const writeResponse = (nodeId:string,value:string) => setSession((current) => ({
    ...current,
    responses:{...current.responses,[nodeId]:value},
  }));
  const complete = () => setSession((current) => ({...current,completion:true}));
  const restart = () => {
    if (statePolicy === "LOCAL_DEVICE") localStorage.removeItem(storageKey);
    setSession(initial());
    setSessionVersion((value) => value + 1);
  };

  return {...session,ready,sessionVersion,choose,writeResponse,complete,restart};
}
