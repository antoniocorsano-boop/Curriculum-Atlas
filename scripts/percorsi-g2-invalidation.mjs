const ALL_Q=['Q1','Q2','Q3','Q4','Q5','Q6','Q7','Q8'];
const DOMAINS={
  runtimeExactHead:ALL_Q,
  pathwayId:ALL_Q,
  contentVersion:ALL_Q,
  publicationId:ALL_Q,
  route:['Q1','Q4','Q7','Q8'],
  storageOfflineNetwork:['Q2','Q3','Q7','Q8'],
  uiInteraction:['Q4','Q7'],
  authorityPublicationMetadata:['Q5','Q6','Q8','Q9'],
  buildIndex:['Q1','Q6'],
  producerPolicy:['Q1','Q5','Q6']
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
