const DOMAINS={
  runtimeExactHead:['Q5','Q6','Q1'],
  pathwayId:['Q5','Q6','Q1'],
  contentVersion:['Q5','Q6','Q1'],
  publicationId:['Q5','Q6','Q1'],
  route:['Q1'],
  authority:['Q5','Q6','Q1'],
  buildIndex:['Q6','Q1'],
  producerPolicy:['Q5','Q6','Q1']
};
export function invalidatedGates(changes=[]){
  const out=new Set();
  for(const change of changes){
    if(!Object.hasOwn(DOMAINS,change)) return {status:'BLOCKED',reason:`UNCLASSIFIED_CHANGE:${change}`,gates:[]};
    for(const gate of DOMAINS[change]) out.add(gate);
  }
  return {status:'PASS',gates:[...out]};
}
export function evidenceRemainsEligible(gate,changes=[]){
  const r=invalidatedGates(changes);
  if(r.status!=='PASS') return {eligible:false,...r};
  return {eligible:!r.gates.includes(gate),...r};
}
