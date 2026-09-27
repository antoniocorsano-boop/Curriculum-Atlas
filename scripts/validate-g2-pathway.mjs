import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node scripts/validate-g2-pathway.mjs <fixture.json> [--expect-invalid]'); process.exit(2); }
const expectInvalid = process.argv.includes('--expect-invalid');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const checks = [];
const check = (id, ok, evidence='') => checks.push({ id, status: ok ? 'PASS' : 'FAIL', evidence });

const units = new Set((d.semanticUnits ?? []).map(x => x.id));
const nodes = new Map((d.nodes ?? []).map(x => [x.id, x]));
const grammars = new Map((d.presentationGrammars ?? []).map(x => [x.id, x]));
const refs = [];
for (const n of d.nodes ?? []) {
  refs.push(n.contentRef);
  for (const c of n.choices ?? []) refs.push(c.labelRef, c.feedbackRef);
  if (n.terminal) refs.push(n.terminal.contentRef);
}

check('G2-SCHEMA', d.schemaVersion === '2.0', d.schemaVersion);
check('G2-ENTRY', nodes.has(d.entryNodeId), d.entryNodeId);
check('G2-SEMANTIC-UNIQUE', units.size === (d.semanticUnits ?? []).length);
check('G2-PROVENANCE', (d.semanticUnits ?? []).every(x => typeof x.provenanceRef === 'string' && x.provenanceRef.length > 0));
check('G2-CONTENT-REFS', refs.every(r => r && r.resourceKey && r.locale && Array.isArray(r.semanticUnitIds) && r.semanticUnitIds.every(id => units.has(id))));
check('G2-COGNITIVE-REGISTRY', (d.nodes ?? []).every(n => n.cognitiveFunction?.registry === 'TRAMA_COGNITIVE_FUNCTIONS' && n.cognitiveFunction?.registryVersion === '1' && n.cognitiveFunction?.id));
check('G2-TARGETS', (d.nodes ?? []).every(n => (n.choices ?? []).every(c => nodes.has(c.targetNodeId))));
check('G2-NODE-SHAPE', (d.nodes ?? []).every(n => n.terminal ? (n.choices ?? []).length === 0 : (n.choices ?? []).length > 0));
check('G2-CYCLE-POLICY', (d.nodes ?? []).every(n => n.cyclePolicy?.mode === 'forbidden' || (n.cyclePolicy?.mode === 'bounded' && Number.isInteger(n.cyclePolicy.maxVisitsPerNode) && n.cyclePolicy.maxVisitsPerNode >= 1)));

// Reachability from entry.
const reachable = new Set();
const walk = id => { if (reachable.has(id) || !nodes.has(id)) return; reachable.add(id); for (const c of nodes.get(id).choices ?? []) walk(c.targetNodeId); };
walk(d.entryNodeId);
check('G2-REACHABLE', reachable.size === nodes.size, `${reachable.size}/${nodes.size}`);

// Every reachable node must have a path to a terminal.
const memo = new Map();
const canReachTerminal = (id, stack = new Set()) => {
  if (memo.has(id)) return memo.get(id);
  const n = nodes.get(id); if (!n) return false; if (n.terminal) return true; if (stack.has(id)) return false;
  const next = new Set(stack); next.add(id);
  const ok = (n.choices ?? []).some(c => canReachTerminal(c.targetNodeId, next)); memo.set(id, ok); return ok;
};
check('G2-TERMINAL-REACHABILITY', [...reachable].every(id => canReachTerminal(id)));

// Detect cycles and require every node in a detected back-edge stack to be bounded.
let cycleOk = true; const visiting = new Set(); const done = new Set();
function dfs(id, path=[]) { if (visiting.has(id)) { const i=path.indexOf(id); const cyc=path.slice(i); if (!cyc.every(x => nodes.get(x)?.cyclePolicy?.mode === 'bounded')) cycleOk=false; return; } if(done.has(id))return; visiting.add(id); for(const c of nodes.get(id)?.choices??[]) dfs(c.targetNodeId,[...path,id]); visiting.delete(id); done.add(id); }
dfs(d.entryNodeId); check('G2-CYCLES', cycleOk);

const required = [...units].sort().join('|');
const allowed = d.governance?.allowedPresentationGrammarIds ?? [];
check('G2-GRAMMARS', allowed.length > 0 && allowed.every(id => grammars.has(id)));
check('G2-PARITY', allowed.every(id => [...new Set(grammars.get(id)?.semanticCoverage ?? [])].sort().join('|') === required));
check('G2-GOVERNANCE', d.governance?.authorizationState === 'NOT_RUNTIME_AUTHORIZED' && d.governance?.learnerNetworkWrite === 'forbidden' && d.governance?.learnerTelemetry === 'forbidden' && d.governance?.localPersistence === 'forbidden');
check('G2-A11Y-CONTRACT', d.accessibilityContract?.semanticControls === true && d.accessibilityContract?.focusManaged === true && d.accessibilityContract?.announcedFeedback === true && d.accessibilityContract?.notColorOnly === true && d.accessibilityContract?.reducedMotion === true);

const valid = checks.every(x => x.status === 'PASS');
const out = { schemaVersion:d.schemaVersion, pathwayId:d.pathwayId, pathwayVersion:d.version, exactHead:process.env.GITHUB_SHA ?? 'local', validatorVersion:'0.1.0', checks, timestamp:new Date().toISOString(), valid };
console.log(JSON.stringify(out,null,2));
if (expectInvalid ? valid : !valid) process.exit(1);
