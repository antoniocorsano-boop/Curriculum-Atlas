import fs from 'node:fs';

const file = process.argv[2];
if (!file) throw new Error('usage: node scripts/validate-percorsi-g2-runtime-qualification.mjs <receipt.json>');
const r = JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (m) => { console.error(`FAIL ${m}`); process.exit(1); };
const isSha = (v) => typeof v === 'string' && /^[0-9a-f]{40}$/.test(v);
const nonEmpty = (v) => typeof v === 'string' && v.length > 0;
const gates = ['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'];

if (r.schemaVersion !== 'percorsi-g2-runtime-qualification/v1') fail('schemaVersion');
const c = r.candidate ?? {};
if (!isSha(c.runtimeExactHead)) fail('runtimeExactHead');
for (const k of ['pathwayId','contentVersion','publicationId','authorityRef']) if (!nonEmpty(c[k])) fail(`candidate.${k}`);
if (c.qualificationContractVersion !== 'v1') fail('qualificationContractVersion');
if (!['LAB','QUALIFIED','PUBLISHED','WITHDRAWN'].includes(c.publicationState)) fail('publicationState');
if (!r.gates || gates.some((q) => !r.gates[q])) fail('Q1-Q8 completeness');

for (const q of gates) {
  const g = r.gates[q];
  if (!['NOT_RUN','PASS','FAIL','BLOCKED'].includes(g.status)) fail(`${q}.status`);
  if (!Array.isArray(g.evidenceRefs)) fail(`${q}.evidenceRefs`);
  if (!nonEmpty(g.reviewerClass) || !nonEmpty(g.checkedAt)) fail(`${q}.review metadata`);
}

const d = r.decision ?? {};
if (!['NOT_RUNTIME_AUTHORIZED','RUNTIME_AUTHORIZED'].includes(d.status)) fail('decision.status');

if (d.status === 'RUNTIME_AUTHORIZED') {
  if (c.publicationState !== 'QUALIFIED') fail('authorization requires QUALIFIED candidate');
  if (gates.some((q) => r.gates[q].status !== 'PASS')) fail('authorization requires Q1-Q8 PASS');
  if (gates.some((q) => r.gates[q].evidenceRefs.length === 0)) fail('authorization requires evidence for Q1-Q8');
  if (!nonEmpty(d.authorityRef) || !nonEmpty(d.decidedAt)) fail('authorization requires authority and timestamp');
}

if (c.publicationState === 'LAB' && d.status === 'RUNTIME_AUTHORIZED') fail('LAB cannot be authorized');
if (c.publicationState === 'WITHDRAWN' && d.status === 'RUNTIME_AUTHORIZED') fail('WITHDRAWN cannot be authorized');

console.log(`PASS qualification receipt ${c.pathwayId} ${c.runtimeExactHead}`);
