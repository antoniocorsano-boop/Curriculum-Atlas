import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const validator = new URL('./validate-percorsi-g2-runtime-qualification.mjs', import.meta.url).pathname;
const sha = '700e91bd38ae8543335ab0c96f28d3495229c72e';
const gate = (status='PASS') => ({status,evidenceRefs:status==='PASS'?['evidence:test']:[],reviewerClass:'AUTOMATED',checkedAt:'2026-09-27T09:30:00Z'});
const base = () => ({
  schemaVersion:'percorsi-g2-runtime-qualification/v1',
  candidate:{runtimeExactHead:sha,pathwayId:'pw-test',contentVersion:'v1',publicationId:'pub-1',publicationState:'QUALIFIED',authorityRef:'issue-44',qualificationContractVersion:'v1'},
  gates:Object.fromEntries(['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'].map(q=>[q,gate()])),
  decision:{status:'RUNTIME_AUTHORIZED',authorityRef:'human-publication-authority:test',decidedAt:'2026-09-27T09:31:00Z'}
});
const clone = x => JSON.parse(JSON.stringify(x));
const cases = [];
const add = (id, mutate) => { const r=base(); mutate(r); cases.push([id,r]); };

// Contract negative cases 1–10. Some real-world conditions are represented by the gate
// that owns their evidence; the validator must refuse authorization whenever that gate is non-PASS.
add('N1-missing-receipt', r => { delete r.gates; });
add('N2-exact-head-mismatch', r => { r.candidate.runtimeExactHead='mismatch'; });
add('N3-content-publication-unapproved', r => { r.candidate.publicationState='LAB'; });
add('N4-learner-write-detected', r => { r.gates.Q2=gate('FAIL'); });
add('N5-telemetry-detected', r => { r.gates.Q7=gate('FAIL'); });
add('N6-withdrawn-offline-start', r => { r.candidate.publicationState='WITHDRAWN'; r.gates.Q3=gate('FAIL'); });
add('N7-accessibility-matrix-incomplete', r => { r.gates.Q4=gate('BLOCKED'); });
add('N8-kill-switch-failure', r => { r.gates.Q8=gate('FAIL'); });
add('N9-authority-missing', r => { r.candidate.authorityRef=''; });
add('N10-gate-not-run', r => { r.gates.Q6=gate('NOT_RUN'); });

let failures=0;
for (const [id, receipt] of cases) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'g2q-'));
  const file=path.join(dir,`${id}.json`);
  fs.writeFileSync(file,JSON.stringify(receipt));
  const result=spawnSync(process.execPath,[validator,file],{encoding:'utf8'});
  fs.rmSync(dir,{recursive:true,force:true});
  if (result.status === 0) { console.error(`FAIL ${id}: validator accepted forbidden authorization`); failures++; }
  else console.log(`PASS ${id}: fail-closed`);
}

// Positive control proves the harness is not passing merely because the validator crashes.
const ok=base();
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'g2q-ok-'));
const file=path.join(dir,'positive-control.json');
fs.writeFileSync(file,JSON.stringify(ok));
const result=spawnSync(process.execPath,[validator,file],{encoding:'utf8'});
fs.rmSync(dir,{recursive:true,force:true});
if (result.status !== 0) { console.error('FAIL positive-control'); failures++; }
else console.log('PASS positive-control');

if (failures) process.exit(1);
console.log('PASS all 10 mandatory negative cases');
