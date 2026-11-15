export const lamps = Object.freeze({A:100,B:50,C:40});
export const useful = 20;
export const initial = () => ({prediction:null, trials:[], active:null, revision:null, explanation:null});
export function measure(id) {
  if (!Object.hasOwn(lamps,id)) throw new Error("Lampada non valida");
  const input=lamps[id];
  return {id,input,useful,thermal:input-useful,efficiency:100*useful/input};
}
export function act(state, action) {
  switch(action.type) {
    case "predict":
      if(state.trials.length || !Object.hasOwn(lamps,action.id)) return state;
      return {...state,prediction:action.id};
    case "test":
      if(!state.prediction || !Object.hasOwn(lamps,action.id)) return state;
      return {...state,active:action.id,trials:state.trials.includes(action.id)?state.trials:[...state.trials,action.id],revision:null,explanation:null};
    case "revise":
      if(state.trials.length!==3 || !Object.hasOwn(lamps,action.id)) return state;
      return {...state,revision:action.id,explanation:null};
    case "explain":
      if(state.trials.length!==3 || !state.revision || !["same-light","thermal-loss","input-only"].includes(action.reason))return state;
      return {...state,explanation:action.reason};
    case "reset": return initial();
    default: return state;
  }
}

/** Compact, canonical evidence. No identity, free text, scoring or persisted data. */
export function evidenceTrace(state) {
  if(!state.prediction||state.trials.length!==3||!state.revision||!state.explanation)return null;
  return [{type:"predict",id:state.prediction},...state.trials.map(id=>({type:"test",id})),{type:"revise",id:state.revision},{type:"explain",reason:state.explanation}];
}
export function verifyEvidence(trace) {
  if(!Array.isArray(trace)||trace.length!==6)return false;
  let state=initial();
  for(const [i,action] of trace.entries()){
    const type=i===0?"predict":i<4?"test":i===4?"revise":"explain";
    const key=type==="explain"?"reason":"id";
    if(!action||typeof action!=="object"||Array.isArray(action)||Object.keys(action).length!==2||action.type!==type||!Object.hasOwn(action,key)||typeof action[key]!=="string")return false;
    const next=act(state,action);
    if(next===state)return false;
    state=next;
  }
  return evidenceTrace(state)!==null&&state.trials.length===3;
}
