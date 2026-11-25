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
const sources=["index.html","foyer.css","foyer.mjs","portal-contract.mjs","motion-layer.mjs"];
const logoFile="atlas-logo-approved-01.png";
const logoSource=resolve("public/atlas-gateway-entry",logoFile);
const sourceDir=resolve("scripts/atlas-gateway-foyer");
for(const file of sources)if(!existsSync(join(sourceDir,file)))throw Error("Missing foyer source: "+file);
if(!existsSync(logoSource))throw Error("Missing approved Atlas logo texture");
const temp=mkdtempSync(join(tmpdir(),"atlas-foyer-r128-"));
const sha=b=>createHash("sha256").update(b).digest("hex");
let engine,loader,license;
try{
  // Pin and verify the same Three.js r128 bytes as the existing native Gateway.
  const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],
    {encoding:"utf8"}))[0];
  if(pack.integrity!=="sha512-i0ap/E+OaSfzw7bD1TtYnPo3VEplkl70WX5fZqZnfZsE3k3aSFudqrrC9ldFZfYFkn1zwDmBcdGfiIm/hnbyZA==")
    throw Error("Three.js package identity changed");
  const unpack=path=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+path],
    {maxBuffer:8*1024*1024});
  engine=unpack("build/three.min.js");loader=unpack("examples/js/loaders/GLTFLoader.js");license=unpack("LICENSE");
  const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
  if(blob(engine)!=="b14f47c0908bab15e890b468d53bb07db0be3a18"||
     blob(loader)!=="cfa518ede1b0893f1da14347d78fcd19355f3686"||
     blob(license)!=="5303437e406ed22d8cb0b4c12398870792a25878")
    throw Error("Three.js source identity mismatch");
}finally{rmSync(temp,{recursive:true,force:true});}
mkdirSync(dest,{recursive:true});
for(const file of sources)copyFileSync(join(sourceDir,file),join(dest,file));
copyFileSync(logoSource,join(dest,logoFile));
writeFileSync(join(dest,"three.min.js"),engine);
writeFileSync(join(dest,"GLTFLoader.js"),loader);
writeFileSync(join(dest,"THREE-LICENSE.txt"),license);
// Optional original Visual Factory 3D master: verified GLB from Blender,
 // never a remote fetch nor a replacement for the four DOM destinations.
const modelPath=process.env.ATLAS_FOYER_ART_MASTER;
const visual={schema:"atlas.gateway.foyer-visual/v1",available:!!modelPath,
  source:"visual-factory-blender",studentAuthorized:false};
if(modelPath){
  const bytes=readFileSync(resolve(modelPath));
  if(bytes.length<1000||bytes.length>8000000||bytes.toString("ascii",0,4)!=="glTF"||
     bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length||
     bytes.readUInt32LE(16)!==0x4e4f534a)throw Error("Invalid Blender GLB header");
  const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString("utf8"));
  if((doc.meshes||[]).length<30||doc.buffers?.some(x=>"uri" in x)||
     doc.images?.some(x=>"uri" in x)||doc.extensionsRequired?.length)
    throw Error("Blender GLB is not self contained or complete");
  visual.file="foyer-master.glb";visual.bytes=bytes.length;visual.sha256=sha(bytes);
  visual.meshes=doc.meshes.length;
  writeFileSync(join(dest,visual.file),bytes);
}
writeFileSync(join(dest,"visual-manifest.json"),JSON.stringify(visual,null,2)+"\n");
const extra=visual.available?[visual.file]:[];
const files=[...sources,logoFile,"three.min.js","GLTFLoader.js","visual-manifest.json",...extra].map(file=>{
  const contents=readFileSync(join(dest,file));
  return {name:file,bytes:contents.length,sha256:sha(contents)};
});
const receipt={schema:FOYER_SCHEMA,studentAuthorized:false,publicRelease:false,
  route:"/atrio/",portals:PORTALS.map(({id,href})=>({id,href})),engine:"three@0.128.0",
  files,artMasterAttached:visual.available,artisticApproval:false,hardwareVerified:false};
writeFileSync(join(dest,"preview-receipt.json"),JSON.stringify(receipt,null,2)+"\n");
console.log("ATLAS_FOYER_PREVIEW",JSON.stringify({route:receipt.route,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0),artMasterAttached:visual.available,studentAuthorized:false}));
