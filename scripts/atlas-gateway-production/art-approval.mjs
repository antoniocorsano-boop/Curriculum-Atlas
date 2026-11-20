#!/usr/bin/env node
// An artistic verdict must come from the authorized product owner.
// No SSIM, CLIP or CI green check can claim ART-DIR-02 approval.
import {readFileSync,existsSync,mkdirSync,writeFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {createHash} from "node:crypto";

const root=resolve(process.env.GITHUB_WORKSPACE||".");
const path=p=>resolve(root,p);
const approvalPath=path("docs/atlas-gateway/ART-DIR-02-APPROVAL.json");
const out=path("evidence/atlas-art-02/art-approval-status.json");
const masterPath=path("visual-factory/atlas-gateway/source/atlas-foyer-master.blend");
const renderPath=path("evidence/atlas-art-02/render/hero-cycles.png");
const expectedRef="7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336";
const sha=file=>createHash("sha256").update(readFileSync(file)).digest("hex");
let result={schema:"atlas.art-dir-02.art-approval/v1",
  status:"AWAITING_ARTISTIC_APPROVAL",approved:false,publicRelease:false,studentAuthorized:false,
  reason:"No valid signed-off comparison of the actual Blender render against ART-DIR-02."};
if(existsSync(approvalPath)&&existsSync(masterPath)&&existsSync(renderPath)){
  try{
    const rec=JSON.parse(readFileSync(approvalPath,"utf8"));
    const matching=rec.schema==="atlas.art-dir-02.owned-approval/v1" &&
      rec.decision==="APPROVED" && rec.artDirection==="ART-DIR-02" &&
      rec.referenceSha256===expectedRef &&
      rec.masterSha256===sha(masterPath) &&
      rec.heroRenderSha256===sha(renderPath) &&
      typeof rec.reviewer==="string"&&rec.reviewer.trim().length>=3 &&
      typeof rec.approvedAt==="string"&&/^\d{4}-\d{2}-\d{2}/.test(rec.approvedAt);
    if(matching)result={...result,status:"MASTER_ARTISTICALLY_APPROVED",
      approved:true,reviewer:rec.reviewer,approvedAt:rec.approvedAt,
      masterSha256:rec.masterSha256,heroRenderSha256:rec.heroRenderSha256,
      reason:"Matching accountable approval file; reviewer identity must be validated through normal GitHub governance."};
    else result.reason="Approval does not match current reference, master, render, or required decision fields.";
  }catch(error){result.reason="Invalid approval JSON: "+String(error.message);}
}
mkdirSync(dirname(out),{recursive:true});writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log("ATLAS_ART_DIR_02_APPROVAL",result.status,result.reason);
if(process.env.GITHUB_STEP_SUMMARY){
  const {appendFileSync}=await import("node:fs");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "### ART-DIR-02 approval: "+result.status+"\n"+result.reason+"\n");
}
if(!result.approved)process.exitCode=3;
