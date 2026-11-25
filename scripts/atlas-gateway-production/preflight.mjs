#!/usr/bin/env node
// ART-DIR-02 — preflight for the *art-directed* pipeline, not an art generator.
import {existsSync,readFileSync,mkdirSync,writeFileSync,statSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {createHash} from "node:crypto";

const root=resolve(process.env.GITHUB_WORKSPACE||".");
const resolveFromRoot=p=>resolve(root,p);
const paths={
  reference:process.env.ATLAS_ART_REFERENCE||"visual-factory/atlas-gateway/reference/atlas-hero-approved.jpg",
  master:process.env.ATLAS_ART_MASTER_SOURCE||"visual-factory/atlas-gateway/source/atlas-foyer-master.blend",
  artdir:"docs/atlas-gateway/ATLAS-GATEWAY-ART-DIRECTION-02.md",
  plan:"docs/atlas-gateway/ATLAS-GATEWAY-PRODUCTION-WORKFLOW-01.md",
  report:process.env.ATLAS_ART_REPORT||"evidence/atlas-art-02/preflight.json"
};
// Single versioned source of truth: the user's explicit designation on 2026-11-21.
// Historical PNG 1672x941 remains in provenance; it is not the active gate.
const canonicalManifest=JSON.parse(readFileSync(resolveFromRoot(
  "docs/atlas-gateway/ART-REFERENCE-CANONICAL-2026-11-21.json"),"utf8"));
if(canonicalManifest.schema!=="atlas.art-dir-02.canonical-source/v2"||!canonicalManifest.active)
  throw Error("Invalid canonical ART-DIR-02 manifest");
const expected={...canonicalManifest.file};
if(expected.mime_type!=="image/jpeg"||!/^([a-f0-9]{64})$/.test(expected.sha256))
  throw Error("Canonical image identity invalid");

// Parse actual JPEG dimensions without adding dependencies or decoding pixels.
function jpegSize(buf){
  if(buf.length<8||buf[0]!==0xff||buf[1]!==0xd8) return null;
  let i=2;
  while(i+4<=buf.length){
    if(buf[i]!==0xff){i++;continue;}
    while(i<buf.length&&buf[i]===0xff)i++;
    const marker=buf[i++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
    if(i+2>buf.length)break;
    const size=buf.readUInt16BE(i);
    if(size<2||i+size>buf.length)break;
    if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)){
      if(size<7)break;
      return {w:buf.readUInt16BE(i+5),h:buf.readUInt16BE(i+3)};
    }
    i+=size;
  }
  return null;
}
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
  const dims=jpegSize(b);
  const valid=!!dims&&dims.w===expected.width&&dims.h===expected.height&&
    b.length===expected.bytes&&refSha===expected.sha256;
  checked("reference",valid,
    {jpeg:!!dims,width:dims?.w??null,height:dims?.h??null,
     bytes:b.length,sha256:refSha,expected:expected.sha256});
}else checked("reference",false,"Canonical ART-DIR-02 JPEG is archived in Drive but not mounted in this CI workspace; set ATLAS_ART_REFERENCE to the downloaded verified file. File is available from the Drive URL in the canonical manifest.");
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
