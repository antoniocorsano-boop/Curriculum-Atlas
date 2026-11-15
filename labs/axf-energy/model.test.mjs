import test from "node:test";
import assert from "node:assert/strict";
import {act,initial,measure,evidenceTrace,verifyEvidence} from "./model.mjs";
test("bilancio e servizio identico",()=>{const r=["A","B","C"].map(measure);assert.deepEqual(r.map(x=>x.thermal),[80,30,20]);assert.deepEqual(r.map(x=>x.efficiency),[20,40,50]);for(const x of r){assert.equal(x.useful,20);assert.equal(x.input,x.useful+x.thermal)}});
test("ipotesi prima della prova e dati validi",()=>{const s=initial();assert.equal(act(s,{type:"test",id:"A"}),s);assert.equal(act(s,{type:"predict",id:"X"}),s);assert.throws(()=>measure("X"));const p=act(s,{type:"predict",id:"A"});assert.equal(act(p,{type:"test",id:"X"}),p)});
test("prove distinte, revisione, spiegazione e reset",()=>{let s=act(initial(),{type:"predict",id:"A"});for(const id of ["A","A","B"]){s=act(s,{type:"test",id})}assert.deepEqual(s.trials,["A","B"]);assert.equal(act(s,{type:"revise",id:"C"}),s);s=act(s,{type:"test",id:"C"});assert.equal(act(s,{type:"explain",reason:"same-light"}),s);s=act(s,{type:"revise",id:"C"});s=act(s,{type:"explain",reason:"same-light"});assert.equal(s.explanation,"same-light");assert.equal(s.prediction,"A");assert.deepEqual(act(s,{type:"reset"}),initial())});

test("host verifies evidence, not a renderer completion flag",()=>{
  let s=initial();
  for(const action of [{type:"predict",id:"A"},{type:"test",id:"A"},{type:"test",id:"B"},{type:"test",id:"C"},{type:"revise",id:"A"},{type:"explain",reason:"input-only"}])s=act(s,action);
  const trace=evidenceTrace(s);
  assert(verifyEvidence(trace)); // Completion is not correctness or grading.
  for(const bad of [null,true,{complete:true},trace.slice(0,5),[...trace,{type:"reset"}],trace.map((a,i)=>i===2?{type:"test",id:"A"}:a),trace.map((a,i)=>i===5?{...a,studentId:"x"}:a),trace.map((a,i)=>i===0?{type:"test",id:"A"}:a)])assert.equal(verifyEvidence(bad),false);
  assert.equal(evidenceTrace(act(s,{type:"reset"})),null);
});
