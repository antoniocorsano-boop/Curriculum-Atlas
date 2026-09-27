import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const base = JSON.parse(fs.readFileSync('fixtures/percorsi-g2/valid/minimal.json','utf8'));
const clone = () => structuredClone(base);
const cases = [
  ['entry-missing','G2-ENTRY', d => { d.entryNodeId='ghost'; }],
  ['semantic-ref-missing','G2-CONTENT-REFS', d => { d.nodes[0].contentRef.semanticUnitIds=['ghost']; }],
  ['cognitive-registry','G2-COGNITIVE-REGISTRY', d => { d.nodes[0].cognitiveFunction.registry='FREE_TEXT'; }],
  ['target-missing','G2-TARGETS', d => { d.nodes[0].choices[0].targetNodeId='ghost'; }],
  ['terminal-with-choice','G2-NODE-SHAPE', d => { d.nodes[1].choices=[structuredClone(d.nodes[0].choices[0])]; }],
  ['cycle-policy-invalid','G2-CYCLE-POLICY', d => { d.nodes[0].cyclePolicy={mode:'bounded',maxVisitsPerNode:0}; }],
  ['orphan-node','G2-REACHABLE', d => { d.nodes.push({...structuredClone(d.nodes[1]),id:'orphan',terminal:{...structuredClone(d.nodes[1].terminal),terminalId:'orphan-end'}}); }],
  ['terminal-unreachable','G2-TERMINAL-REACHABILITY', d => { d.nodes[0].choices[0].targetNodeId='start'; d.nodes[0].cyclePolicy={mode:'bounded',maxVisitsPerNode:2}; }],
  ['forbidden-cycle','G2-CYCLES', d => { d.nodes[0].choices[0].targetNodeId='start'; }],
  ['grammar-missing','G2-GRAMMARS', d => { d.governance.allowedPresentationGrammarIds=['X']; }],
  ['parity-omission','G2-PARITY', d => { d.presentationGrammars[1].semanticCoverage=['u1','u2']; }],
  ['governance-runtime','G2-GOVERNANCE', d => { d.governance.authorizationState='RUNTIME_AUTHORIZED'; }],
  ['accessibility-contract','G2-A11Y-CONTRACT', d => { d.accessibilityContract.announcedFeedback=false; }]
];

let failures=0;
for (const [name, expected, mutate] of cases) {
  const d=clone(); mutate(d);
  const file=path.join(os.tmpdir(),`g2-${name}.json`); fs.writeFileSync(file,JSON.stringify(d));
  const r=spawnSync(process.execPath,['scripts/validate-g2-pathway.mjs',file,'--expect-invalid'],{encoding:'utf8'});
  let out; try { out=JSON.parse(r.stdout); } catch { console.error(`FAIL ${name}: invalid validator output`); failures++; continue; }
  const failed=(out.checks??[]).filter(x=>x.status==='FAIL').map(x=>x.id);
  const ok=r.status===0 && failed.includes(expected);
  console.log(`${ok?'PASS':'FAIL'} ${name}: expected ${expected}; failed=${failed.join(',')}`);
  if(!ok) failures++;
}
if(failures) process.exit(1);
console.log(`PASS atomic matrix ${cases.length}/${cases.length}`);
