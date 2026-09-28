import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {spawnSync} from "node:child_process";
import {buildPathwayCandidate,buildDossier} from "./build-percorsi-pathway-candidate.mjs";

const args=process.argv.slice(2);
const outArg=args.find(x=>x.startsWith("--out="));
const outputDir=outArg?outArg.slice(6):path.join(os.tmpdir(),"percorsi-factory-build");
const portfolio=JSON.parse(fs.readFileSync("governance/percorsi-portfolio.json","utf8"));
const seedDir="content/percorsi/seeds";
fs.mkdirSync(outputDir,{recursive:true});

const results=[];
for(const item of portfolio.pathways){
  if(!item.pathwayId){
    results.push({portfolioSlot:item.portfolioSlot,title:item.title,state:item.state,status:"SKIPPED_UNIDENTIFIED"});
    continue;
  }
  const seedPath=path.join(seedDir,`${item.pathwayId}.seed.json`);
  if(!fs.existsSync(seedPath)){
    results.push({portfolioSlot:item.portfolioSlot,pathwayId:item.pathwayId,title:item.title,state:item.state,status:"BLOCKED_MISSING_SEED"});
    continue;
  }
  try{
    const seed=JSON.parse(fs.readFileSync(seedPath,"utf8"));
    const candidate=buildPathwayCandidate(seed);
    const candidatePath=path.join(outputDir,`${item.pathwayId}.json`);
    const dossierPath=path.join(outputDir,`${item.pathwayId}.dossier.md`);
    fs.writeFileSync(candidatePath,JSON.stringify(candidate,null,2)+"\n");
    fs.writeFileSync(dossierPath,buildDossier(seed));
    const v=spawnSync(process.execPath,["scripts/validate-g2-pathway.mjs",candidatePath],{encoding:"utf8"});
    if(v.status!==0) throw new Error("G2_VALIDATION_FAILED");
    const report=JSON.parse(v.stdout);
    if(report.valid!==true) throw new Error("G2_VALIDATION_NOT_VALID");
    results.push({portfolioSlot:item.portfolioSlot,pathwayId:item.pathwayId,title:item.title,state:item.state,status:"BUILT_VALID",candidatePath,dossierPath});
  }catch(error){
    results.push({portfolioSlot:item.portfolioSlot,pathwayId:item.pathwayId,title:item.title,state:item.state,status:"BLOCKED",reason:error.message});
  }
}

const summary={
  schemaVersion:"atlas.percorsi.factory-batch-report/v1",
  portfolioPolicy:portfolio.policy,
  totalSlots:portfolio.pathways.length,
  identified:results.filter(x=>x.pathwayId).length,
  builtValid:results.filter(x=>x.status==="BUILT_VALID").length,
  blocked:results.filter(x=>x.status.startsWith("BLOCKED")).length,
  recoveryPending:results.filter(x=>x.status==="SKIPPED_UNIDENTIFIED").length,
  results
};
fs.writeFileSync(path.join(outputDir,"factory-report.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary,null,2));
if(summary.blocked>0) process.exit(1);
