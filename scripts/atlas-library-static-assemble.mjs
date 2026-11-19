import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,statSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const [nativeDir,exportDir]=process.argv.slice(2).map(x=>resolve(x));
if(!nativeDir||!exportDir)throw Error("Usage: nativeDir exportDir");
const head=process.env.ATLAS_EXACT_HEAD;
if(!/^[a-f0-9]{40}$/.test(head||"")||process.env.ATLAS_LIBRARY_STATIC_PREVIEW!=="true"||
   process.env.ATLAS_PREVIEW_ROOT_SCOPED!=="true"||process.env.ATLAS_GITHUB_PAGES==="true")throw Error("Static preview identity/boundary");
const sha=x=>createHash("sha256").update(readFileSync(x)).digest("hex");
const read=x=>JSON.parse(readFileSync(x,"utf8"));
const receipt=read(join(nativeDir,"native-build-receipt.json")),manifest=read(join(nativeDir,"native-manifest.json"));
if(receipt.profile!=="M2-micro-integrated"||receipt.materialDetailApplied!==true||
   receipt.sceneSha256!==sha(join(nativeDir,"scene.html"))||
   receipt.manifestSha256!==sha(join(nativeDir,"native-manifest.json"))||
   manifest.schema!=="atlas.gateway.native-assets/v1"||manifest.studentAuthorized!==false||
   manifest.assets.length!==8)throw Error("Invalid full native browser package");
const ids=["shell","scenography","cupola","portals","bays","stars","sky","ambient"];
const actual=manifest.assets.reduce((sum,a,i)=>{
  if(a.id!==ids[i]||a.bytes<1||!Number.isSafeInteger(a.bytes)||
     !/^[a-f0-9]{64}$/.test(a.sha256)||a.file!==a.id+"-"+a.sha256+"."+({sky:"png",ambient:"hdr"}[a.id]||"glb"))throw Error("Native asset identity");
  const path=join(exportDir,"atlas-gateway-native",a.file);
  if(!existsSync(path)||statSync(path).size!==a.bytes||sha(path)!==a.sha256)throw Error("Static asset identity "+a.id);
  return sum+a.bytes;
},0);
if(actual!==receipt.totalBytes||actual>40000000)throw Error("Asset size drift");
for(const path of ["index.html","curricolo/index.html","esperienze/index.html"]){
  if(!existsSync(join(exportDir,path)))throw Error("Static route missing: "+path);
}
const destination=join(exportDir,"biblioteca");
if(existsSync(destination))throw Error("Library route must be new, not overwritten");
mkdirSync(destination,{recursive:true});
const sources=["index.html","host.js","host.css"];
for(const file of sources)copyFileSync(join("scripts","atlas-library-static",file),join(destination,file));
for(const [src,dest] of [["scene.html","scene.html"],["native-manifest.json","native-manifest.json"],["native-build-receipt.json","native-build-receipt.json"]]){
  copyFileSync(join(nativeDir,src),join(destination,dest));
}
writeFileSync(join(exportDir,"_headers"),"/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n");
writeFileSync(join(exportDir,"robots.txt"),"User-agent: *\nDisallow: /\n");
writeFileSync(join(exportDir,"EXACT_HEAD.txt"),head+"\n");
writeFileSync(join(exportDir,"PREVIEW-MANIFEST.json"),JSON.stringify({exactHead:head,channel:"artifact-only",studentAuthorized:false,
  product:"atlas-library-full-web",materialProfile:receipt.profile,sceneSha256:receipt.sceneSha256,assetsSha256:receipt.manifestSha256},null,2)+"\n");
const proof={status:"READY_FOR_CLOUDFLARE_PREVIEW",exactHead:head,studentAuthorized:false,route:"/biblioteca/",
  assetCount:manifest.assets.length,assetBytes:actual,sceneSha256:receipt.sceneSha256,standaloneBrowser:true,
  staticPages:["/","/curricolo/","/esperienze/","/biblioteca/"],publicationPerformed:false};
writeFileSync(join(destination,"delivery-receipt.json"),JSON.stringify(proof,null,2)+"\n");
console.log("ATLAS_LIBRARY_STATIC",JSON.stringify(proof));
