export function qualifyAudit(a){
  if(!a?.metadata?.vulnerabilities||typeof a.vulnerabilities!=='object') return {status:'BLOCKED',reason:'AUDIT_EVIDENCE_INVALID'};
  const entries=Object.entries(a.vulnerabilities);
  const high=entries.filter(([,v])=>v?.severity==='high');
  const critical=entries.filter(([,v])=>v?.severity==='critical');
  if(high.length||critical.length) return {status:'FAIL',reason:'HIGH_OR_CRITICAL_VULNERABILITY',high:high.map(([name])=>name),critical:critical.map(([name])=>name)};
  return {status:'PASS',high:[],critical:[]};
}

if(process.argv[1]&&import.meta.url===new URL(`file://${process.argv[1]}`).href){
  const fs=await import('node:fs');
  const a=JSON.parse(fs.readFileSync(process.argv[2]||'percorsi-g2-npm-audit.json','utf8'));
  const r=qualifyAudit(a);
  console.log(JSON.stringify(r));
  if(r.status!=='PASS') process.exit(1);
}
