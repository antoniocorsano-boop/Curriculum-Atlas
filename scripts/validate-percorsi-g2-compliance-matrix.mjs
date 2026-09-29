import fs from 'node:fs';
const matrix=JSON.parse(fs.readFileSync('governance/percorsi-g2-q5-q6-q1-compliance-matrix.json','utf8'));
const bad=matrix.rows.filter(r=>r.status!=='IMPLEMENTED_TESTED');
if(bad.length){console.error('NOT READY:',bad.map(r=>`${r.requirementId}:${r.status}`).join(','));process.exit(1);}
if(matrix.impactAssessment?.decision!=='SAFE_TO_MATERIALIZE_LOCALLY_WITH_REVIEW'){console.error('BLOCKED impact assessment');process.exit(1);}
if(matrix.status!=='IMPLEMENTED_TESTED'){console.error(`NOT READY: matrix status ${matrix.status}`);process.exit(1);}
for(const row of matrix.rows){
  if(!Array.isArray(row.evidenceMapping)||row.evidenceMapping.length===0||row.evidenceMapping.some(ref=>typeof ref!=='string'||ref.trim()==='')){
    console.error(`NOT READY: ${row.requirementId} has no valid evidence mapping`);process.exit(1);
  }
}
console.log(`PASS compliance matrix review readiness: ${matrix.rows.length} governed requirements fully implemented, tested and evidence-mapped`);
