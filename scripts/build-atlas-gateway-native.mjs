// Prepare a local-only native Gateway package. No public deployment.
import {readFileSync,writeFileSync,mkdirSync,existsSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {atlasAnchors,OPTICS} from "./als01/core.mjs";
const [master,r2,hdr,out]=process.argv.slice(2).map(x=>resolve(x));
if(process.env.ATLAS_GATEWAY_PREVIEW!=="true"||process.env.ATLAS_GATEWAY_NATIVE_PREVIEW!=="true"||process.env.ATLAS_GITHUB_PAGES==="true"||process.env.ATLAS_PREVIEW_ROOT_SCOPED==="true")throw Error("Native local preview only");
const stage=resolve("public/atlas-gateway-native");
if(existsSync(stage)||existsSync(out))throw Error("Native staging must be clean");
const sha=b=>createHash("sha256").update(b).digest("hex");
const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const read=(p)=>JSON.parse(readFileSync(p,"utf8"));
const receipt=read(join(master,"architecture-transport-receipt.json")),lighting=read(join(master,"lighting-study.json"));
if(receipt.status!=="DRAFT_ARCHITECTURE_TRANSPORT_PROBE"||receipt.bay.instances!==495||receipt.bay.uniqueMeshes!==25||receipt.portals.map(p=>p.id).join(",")!=="curricolo,esperienze,studio")throw Error("Master receipt");
const resources=[
 ["shell","glb",join(master,"library-shell.glb"),receipt.files["library-shell.glb"].sha256],
 ["scenography","glb",join(master,"library-scenography.glb"),receipt.files["library-scenography.glb"].sha256],
 ["cupola","glb",join(master,"library-cupola.glb"),receipt.files["library-cupola.glb"].sha256],
 ["portals","glb",join(master,"library-portals.glb"),receipt.files["library-portals.glb"].sha256],
 ["bays","glb",join(master,"library-bays.glb"),receipt.bay.nativePayload.sha256],
 ["stars","glb",join(r2,"four-stars.glb"),"684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0"],
 ["sky","png",join(master,"atlas-sky-clouds.png"),lighting.skyPanoramaSha256],
 ["ambient","hdr",hdr,"cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130"]
].map(([id,ext,path,expected])=>{
 const bytes=readFileSync(path);if(sha(bytes)!==expected)throw Error("Asset hash "+id);
 if(ext==="glb"){
  if(bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length||bytes.readUInt32LE(16)!==0x4e4f534a)throw Error("GLB header "+id);
  const g=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString("utf8"));
  if(g.buffers?.some(b=>"uri" in b)||g.images?.some(b=>"uri" in b)||g.extensionsRequired?.length)throw Error("Nonlocal GLB "+id);
 }
 return {bytes,record:{id,bytes:bytes.length,sha256:expected,file:id+"-"+expected+"."+ext}};
});
if(resources.reduce((n,r)=>n+r.bytes.length,0)>40000000)throw Error("Native asset budget");
const manifest={schema:"atlas.gateway.native-assets/v1",assets:resources.map(r=>r.record),studentAuthorized:false};
const composition=read("scripts/atlas-gateway-c3/knowledge-composition.json");
const anchors=atlasAnchors(composition);
if(OPTICS.revision!=="ALS-01-R4"||anchors.length!==4)throw Error("ALS identity");
const temp=mkdtempSync(join(tmpdir(),"atlas-native-engine-"));
try{
 const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
 if(pack.integrity!=="sha512-i0ap/E+OaSfzw7bD1TtYnPo3VEplkl70WX5fZqZnfZsE3k3aSFudqrrC9ldFZfYFkn1zwDmBcdGfiIm/hnbyZA==")throw Error("Three package identity");
 const extract=p=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+p],{maxBuffer:8*1024*1024});
 const engine=extract("build/three.min.js"),loader=extract("examples/js/loaders/GLTFLoader.js"),rgbe=extract("examples/js/loaders/RGBELoader.js"),license=extract("LICENSE");
 if(blob(engine)!=="b14f47c0908bab15e890b468d53bb07db0be3a18"||blob(loader)!=="cfa518ede1b0893f1da14347d78fcd19355f3686"||blob(license)!=="5303437e406ed22d8cb0b4c12398870792a25878")throw Error("Three source identity");
 const core=readFileSync("scripts/als01/core.mjs","utf8").replace(/^export /gm,"");
 const adapter=readFileSync("scripts/als01/three-adapter.mjs","utf8").replace(/^import .* from "\.\/core\.mjs";\n/m,"").replace(/^export /gm,"");
 const visibility=readFileSync("scripts/atlas-gateway-integration/bay-visibility.mjs","utf8").replace(/^export /gm,"");
 const runtime=readFileSync("scripts/atlas-gateway-integration/native-preview-runtime.js","utf8");
 const script=[engine,loader,rgbe].map(x=>x.toString("utf8")).join("\n;\n")+"\n;const ATLAS_PARENT_ORIGIN=__ATLAS_PARENT_ORIGIN_JSON__;const ATLAS_CHANNEL=__ATLAS_CHANNEL_JSON__;\n"+
 "const ATLAS_ASTRAL=(()=>{"+core+"\n"+adapter+"\nreturn {createAstralLights};})();\n"+
 "const ATLAS_VISIBILITY=(()=>{"+visibility+"\nreturn {createBayVisibility};})();\n"+
 "const NATIVE_CAMERAS="+JSON.stringify(receipt.cameras)+";const NATIVE_PORTALS="+JSON.stringify(receipt.portals)+";const NATIVE_LIGHTING="+JSON.stringify(lighting)+";const NATIVE_ANCHORS="+JSON.stringify(anchors)+";\n"+runtime;
 if(/<\/script/i.test(script))throw Error("Inline script boundary");
 const controls=[["left","Sinistra"],["right","Destra"],["up","Alto"],["down","Basso"],["near","Avvicina"],["far","Allontana"],["reset","Ripristina"]].map(([id,label])=>'<button type="button" data-action="'+id+'">'+label+'</button>').join("");
 const html='<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="atlas-gateway-local-scene-v1" content="prepared"><meta name="atlas-gateway-native-v1" content="P1-spatial"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; font-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'"><style>html,body{margin:0;overflow:hidden;background:#182634;height:100%}canvas{display:block;width:100%;height:100%;touch-action:none}#native-status{position:fixed;inset:0;display:grid;place-items:center;color:#fff;font:16px system-ui;background:#182634}#native-status[hidden],#native-controls[hidden]{display:none}#native-controls{position:fixed;bottom:6px;left:6px;right:6px;display:flex;justify-content:center;flex-wrap:wrap;gap:4px}button{min-height:44px;padding:4px 8px;border:1px solid #bda77b;border-radius:9px;background:#142634;color:#fff;font:12px system-ui;cursor:pointer}button:focus-visible{outline:3px solid #fff}</style></head><body><canvas aria-label="Biblioteca Atlas tridimensionale"></canvas><div id="native-status" role="status">Preparazione della biblioteca…</div><nav id="native-controls" aria-label="Controlli della visuale" hidden>'+controls+'<button id="atlas-astral-toggle" type="button" aria-pressed="false">Anima luci</button></nav><script>'+script+'</script></body></html>';
 if(html.length>4000000)throw Error("Scene HTML budget");
 mkdirSync(stage,{recursive:true});mkdirSync(out,{recursive:true});
 try{
  for(const r of resources)writeFileSync(join(stage,r.record.file),r.bytes,{flag:"wx"});
  writeFileSync(join(out,"scene.html"),html);
  writeFileSync(join(out,"native-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  writeFileSync(join(out,"THREE-LICENSE.txt"),license);
  const evidence={profile:"P1-spatial",materialDetailApplied:false,sceneSha256:sha(Buffer.from(html)),manifestSha256:sha(readFileSync(join(out,"native-manifest.json"))),assets:manifest.assets,totalBytes:resources.reduce((n,r)=>n+r.bytes.length,0),studentAuthorized:false,publishable:false};
  writeFileSync(join(out,"native-build-receipt.json"),JSON.stringify(evidence,null,2)+"\n");console.log(JSON.stringify(evidence));
 }catch(e){rmSync(stage,{recursive:true,force:true});throw e}
}finally{rmSync(temp,{recursive:true,force:true})}
