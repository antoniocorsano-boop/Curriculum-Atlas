// Assemble ATLAS-GATEWAY-01 in an already-exported preview, never deploy.
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync,rmSync,mkdtempSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {PORTALS,FOYER_SCHEMA,verifyPortalContract} from "./atlas-gateway-foyer/portal-contract.mjs";

if(process.env.ATLAS_GATEWAY_FOYER_PREVIEW!=="true"||process.env.ATLAS_STUDENT_AUTHORIZED==="true")
  throw Error("The foyer is available only in an authorized technical preview");
const output=resolve(process.argv[2]||"out"),dest=join(output,"atrio");
if(!existsSync(output)||existsSync(dest))throw Error("The preview export must exist and /atrio/ must be new");
verifyPortalContract();
for(const p of PORTALS){
  const route=join(output,p.href.slice(1),"index.html");
  if(!existsSync(route))throw Error("Target route not present in export: "+p.href);
}
const sources=["index.html","foyer.css","foyer.mjs","portal-contract.mjs"];
const sourceDir=resolve("scripts/atlas-gateway-foyer");
for(const file of sources)if(!existsSync(join(sourceDir,file)))throw Error("Missing foyer source: "+file);
const temp=mkdtempSync(join(tmpdir(),"atlas-foyer-r128-"));
const sha=b=>createHash("sha256").update(b).digest("hex");
let engine,license;
try{
  // Pin and verify the same Three.js r128 bytes as the existing native Gateway.
  const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],
    {encoding:"utf8"}))[0];
  if(pack.integrity!=="sha512-i0ap/E+OaSfzw7bD1TtYnPo3VEplkl70WX5fZqZnfZsE3k3aSFudqrrC9ldFZfYFkn1zwDmBcdGfiIm/hnbyZA==")
    throw Error("Three.js package identity changed");
  const unpack=path=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+path],
    {maxBuffer:8*1024*1024});
  engine=unpack("build/three.min.js");license=unpack("LICENSE");
  const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
  if(blob(engine)!=="b14f47c0908bab15e890b468d53bb07db0be3a18"||
     blob(license)!=="5303437e406ed22d8cb0b4c12398870792a25878")
    throw Error("Three.js source identity mismatch");
}finally{rmSync(temp,{recursive:true,force:true});}
mkdirSync(dest,{recursive:true});
for(const file of sources)copyFileSync(join(sourceDir,file),join(dest,file));
writeFileSync(join(dest,"three.min.js"),engine);
writeFileSync(join(dest,"THREE-LICENSE.txt"),license);
const files=[...sources,"three.min.js"].map(file=>{
  const contents=readFileSync(join(dest,file));
  return {name:file,bytes:contents.length,sha256:sha(contents)};
});
const receipt={schema:FOYER_SCHEMA,studentAuthorized:false,publicRelease:false,
  route:"/atrio/",portals:PORTALS.map(({id,href})=>({id,href})),engine:"three@0.128.0",
  files,artisticApproval:false,hardwareVerified:false};
writeFileSync(join(dest,"preview-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
console.log("ATLAS_FOYER_PREVIEW",JSON.stringify({route:receipt.route,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),studentAuthorized:false}));
