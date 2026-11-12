import {test} from "node:test";
import assert from "node:assert/strict";
import {completionReceipt} from "./missione118-completion-receipt.mjs";
const expected={notices:["show","show","show","pause","pause"],claims:["valid","fix","valid","fix"]};
const state={stage:4,phase:"code",won:true,solved:[true,true,true],digits:["3","2","4"],notices:expected.notices,claims:expected.claims,modules:["steps","verify"],traffic:4,focus:"verifica"};
test("valid local completion is nonofficial and contains only educational evidence",()=>{const r=completionReceipt(state,expected);assert.equal(r.evidence.length,3);assert.equal(r.official,false);assert.equal(r.identityVerified,false);assert.equal(r.learningCertified,false);assert.equal(r.principle.id,"verifica");assert.equal(Object.hasOwn(r,"errors"),false);});
test("reject incomplete or inconsistent state",()=>{for(const patch of [{won:false},{stage:3},{phase:"choose"},{solved:[true,true,false]},{digits:["3","2","?"]},{notices:[]},{claims:[]},{modules:["steps","steps"]},{traffic:3},{focus:"unknown"}])assert.equal(completionReceipt({...state,...patch},expected),null);});
test("restored origin never certifies learning",()=>{const r=completionReceipt({...state,restoredCheckpoint:true},expected);assert.equal(r.origin,"RIPRESO_DA_SALVATAGGIO");assert.equal(r.learningCertified,false);});
