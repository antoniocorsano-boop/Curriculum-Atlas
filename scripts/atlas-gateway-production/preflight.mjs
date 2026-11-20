#!/usr/bin/env node
// ART-DIR-02 — preflight for the *art-directed* pipeline, not an art generator.
import {existsSync,readFileSync,mkdirSync,writeFileSync,statSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {createHash} from "node:crypto";

const root=resolve(process.env.GITHUB_WORKSPACE||".");
const resolveFromRoot=p=>resolve(root,p);
const paths={
  reference:process.env.ATLAS_ART_REFERENCE||"visual-factory/atlas-gateway/reference/atlas-hero-approved.png",
  master:process.env.ATLAS_ART_MASTER_SOURCE||"visual-factory/atlas-gateway/source/atlas-foyer-master.blend",
  artdir:"docs/atlas-gateway/ATLAS-GATEWAY-ART-DIRECTION-02.md",
  plan:"docs/atlas-gateway/ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md",
  report:process.env.ATLAS_ART_REPORT||"evidence/atlas-art-02/preflight.json"
};
const expected={
  sha256:"7b3ffb9a355b89057acea02489020ad43d871e10b6cf5bbb29f8769ff3073336",
  width:1672,height:941,
  name:"atrio_futuristico_atlas_della_conoscenza.png"
};
const checks=[];
const checked=(name,pass,details)=>checks.push({name,status:pass?"PASS":"BLOCKED",details});
const hash=b=>createHash("sha256").update(b).digest("hex");
for(const name of ["artdir","plan"]){
  let ok=existsSync(resolveFromRoot(paths[name]));
  if(ok){const s=readFileSync(resolveFromRoot(paths[name]),"utf8");ok=name==="artdir"?s.includes("ART-DIR-02"):s.includes("ART-PROD-01");}
  checked(name,ok,ok?"Source-of-truth exists":"Missing or invalid source-of-truth");
}
let refSha=null,masterSha=null,masterSize=0;
if(existsSync(resolveFromRoot(paths.reference))){
  const b=readFileSync(resolveFromRoot(paths.reference));
  refSha=hash(b);
  const png=b.length>=24&&b.toString("ascii",1,4)==="PNG";
  const dims=png?{w:b.readUInt32BE(16),h:b.readUInt32BE(20)}:{w:null,h:null};
  checked("reference",png&&dims.w===expected.width&&dims.h===expected.height&&refSha===expected.sha256,
    {png,width:dims.w,height:dims.h,sha256:refSha,expected:expected.sha256});
}else checked("reference",false,"Original ART-DIR-02 image is not archived under the expected path.");
if(existsSync(resolveFromRoot(paths.master))){
  const b=readFileSync(resolveFromRoot(paths.master));
  masterSha=hash(b);masterSize=b.length;
  checked("master",b.length>1024&&b.toString("ascii",0,7)==="BLENDER",
    {size:masterSize,sha256:masterSha,blender:b.toString("ascii",0,7)==="BLENDER"});
}else checked("master",false,"Art-directed .blend master is missing: the procedural demo is NOT a substitute.");
const status=checks.every(c=>c.status==="PASS")?"READY_FOR_RENDER":"BLOCKED_INPUT";
const report={schema:"atlas.art-dir-02.preflight/v1",status,referenceExpected:expected,
  sourceFiles:paths,referenceSha256:refSha,masterSha256:masterSha,masterBytes:masterSize,
  checks,studentAuthorized:false,publicRelease:false};
const output=resolveFromRoot(paths.report);mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify(report,null,2)+"\n");
console.log("ATLAS_ART_DIR_02",status,JSON.stringify(checks));
if(process.env.GITHUB_STEP_SUMMARY){
  const {appendFileSync}=await import("node:fs");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY,
    "### Atlas ART-DIR-02 — "+status+"\n"+
    checks.map(c=>"- "+c.name+": "+c.status+"\n").join("")+
    "\nThe pipeline never substitutes the old procedural atrium for the approved artistic master.\n");
}
if(status!=="READY_FOR_RENDER")process.exitCode=2;
