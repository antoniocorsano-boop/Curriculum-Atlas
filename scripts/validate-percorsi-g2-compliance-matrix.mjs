import fs from 'node:fs';
const matrix=JSON.parse(fs.readFileSync('governance/percorsi-g2-q5-q6-q1-compliance-matrix.json','utf8'));
const allowed=new Set(['IMPLEMENTED_TESTED','PARTIAL_EXISTING']);
const bad=matrix.rows.filter(r=>!allowed.has(r.status));
if(bad.length){console.error('NOT READY:',bad.map(r=>`${r.requirementId}:${r.status}`).join(','));process.exit(1);}
if(matrix.impactAssessment?.decision!=='SAFE_TO_MATERIALIZE_LOCALLY_WITH_REVIEW'){console.error('BLOCKED impact assessment');process.exit(1);}
console.log(`PASS compliance matrix review readiness: ${matrix.rows.length} governed requirements`);
