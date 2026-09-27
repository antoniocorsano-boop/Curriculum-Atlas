import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const validator = new URL('./validate-percorsi-g2-runtime-qualification.mjs', import.meta.url).pathname;
const sha='700e91bd38ae8543335ab0c96f28d3495229c72e';
const otherSha='1111111111111111111111111111111111111111';
const binding=()=>({runtimeExactHead:sha,pathwayId:'pw-test',contentVersion:'v1',publicationId:'pub-1'});
const gate=(status='PASS')=>({status,evidenceRefs:status==='PASS'?['evidence:test']:[],reviewerClass:'AUTOMATED',checkedAt:'2026-09-27T09:30:00Z',candidateBinding:binding()});
const base=()=>({schemaVersion:'percorsi-g2-runtime-qualification/v1',candidate:{runtimeExactHead:sha,pathwayId:'pw-test',contentVersion:'v1',publicationId:'pub-1',publicationState:'QUALIFIED',authorityRef:'issue-44',qualificationContractVersion:'v1'},gates:Object.fromEntries(['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'].map(q=>[q,gate()])),decision:{status:'RUNTIME_AUTHORIZED',authorityRef:'human-publication-authority:test',decidedAt:'2026-09-27T09:31:00Z'}});
const cases=[]; const add=(id,mutate)=>{const r=base();mutate(r);cases.push([id,r]);};
add('N1-missing-receipt',r=>{delete r.gates;});
add('N2-valid-exact-head-mismatch',r=>{r.gates.Q5.candidateBinding.runtimeExactHead=otherSha;});
add('N3-content-publication-unapproved',r=>{r.candidate.publicationState='LAB';});
// N4-N8 test receipt aggregation. Detection of the real-world condition belongs to the
// corresponding Q2/Q3/Q4/Q7/Q8 evidence producer, not to this aggregation validator.
add('N4-Q2-learner-write-evidence-fail',r=>{r.gates.Q2=gate('FAIL');});
add('N5-Q7-telemetry-evidence-fail',r=>{r.gates.Q7=gate('FAIL');});
add('N6-Q3-withdrawal-offline-evidence-fail',r=>{r.candidate.publicationState='WITHDRAWN';r.gates.Q3=gate('FAIL');});
add('N7-Q4-accessibility-evidence-blocked',r=>{r.gates.Q4=gate('BLOCKED');});
add('N8-Q8-kill-switch-evidence-fail',r=>{r.gates.Q8=gate('FAIL');});
add('N9-authority-missing',r=>{r.candidate.authorityRef='';});
add('N10-gate-not-run',r=>{r.gates.Q6=gate('NOT_RUN');});
add('X1-malformed-checkedAt',r=>{r.gates.Q1.checkedAt='not-a-date';});
add('X2-malformed-decidedAt',r=>{r.decision.decidedAt='2026-99-99T99:99:99Z';});
add('X3-empty-evidence-ref',r=>{r.gates.Q1.evidenceRefs=[''];});
add('X4-duplicate-evidence-ref',r=>{r.gates.Q1.evidenceRefs=['same','same'];});
let failures=0;
for(const [id,receipt] of cases){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'g2q-'));const file=path.join(dir,`${id}.json`);fs.writeFileSync(file,JSON.stringify(receipt));const result=spawnSync(process.execPath,[validator,file],{encoding:'utf8'});fs.rmSync(dir,{recursive:true,force:true});if(result.status===0){console.error(`FAIL ${id}: accepted`);failures++;}else console.log(`PASS ${id}: fail-closed`);}
const ok=base();const dir=fs.mkdtempSync(path.join(os.tmpdir(),'g2q-ok-'));const file=path.join(dir,'positive-control.json');fs.writeFileSync(file,JSON.stringify(ok));const result=spawnSync(process.execPath,[validator,file],{encoding:'utf8'});fs.rmSync(dir,{recursive:true,force:true});if(result.status!==0){console.error('FAIL positive-control',result.stderr);failures++;}else console.log('PASS positive-control');
if(failures)process.exit(1);console.log('PASS mandatory negative cases plus schema-semantic regressions');
