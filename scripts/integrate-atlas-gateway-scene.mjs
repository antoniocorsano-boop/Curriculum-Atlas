// Local candidate only. The verified R2 asset is parsed from memory in the
// existing sandbox; no fetch, blob navigation, CDN or additional engine.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {atlasAnchors,OPTICS} from "./als01/core.mjs";
const R2_SHA="684849b72dfc3314c6383e3a0864fa244145811f3d27fb9bdc76d7fbfd7f92e0";
const sha=b=>createHash("sha256").update(b).digest("hex");
function once(s,a,b){if(s.split(a).length!==2)throw Error("Gateway integration anchor: "+a);return s.replace(a,()=>b)}
export function integrateGateway(scene,glb,loader){
  if(sha(glb)!==R2_SHA||glb.length!==424708)throw Error("Unverified R2");
  if(glb.readUInt32LE(0)!==0x46546c67||glb.readUInt32LE(4)!==2||glb.readUInt32LE(8)!==glb.length||glb.readUInt32LE(16)!==0x4e4f534a)throw Error("GLB header");
  const g=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString("utf8"));
  if(g.buffers?.length!==1||g.buffers.some(b=>"uri" in b)||g.images?.length||g.textures?.length||g.extensionsRequired?.length||g.meshes?.flatMap(m=>m.primitives).length!==3)throw Error("R2 must be self-contained");
  const composition=JSON.parse(readFileSync("scripts/atlas-gateway-c3/knowledge-composition.json","utf8"));
  const anchors=atlasAnchors(composition);
  if(OPTICS.revision!=="ALS-01-R4"||anchors.length!==4)throw Error("Unexpected ALS revision");
  const core=readFileSync("scripts/als01/core.mjs","utf8").replace(/^export /gm,"");
  const adapter=readFileSync("scripts/als01/three-adapter.mjs","utf8").replace(/^import .* from "\.\/core\.mjs";\n/m,"").replace(/^export /gm,"");
  const runtime=readFileSync("scripts/atlas-gateway-integration/runtime.js","utf8");
  const script=loader+"\n;const ATLAS_ASTRAL=(()=>{\n"+core+"\n"+adapter+"\nreturn {createAstralLights,resolveOptics};})();\nconst ATLAS_R2_BASE64="+JSON.stringify(glb.toString("base64"))+";\nconst ATLAS_R2_ANCHORS="+JSON.stringify(anchors)+";\n"+runtime;
  if(/<\/script/i.test(script))throw Error("Unsafe inline payload");
  scene=once(scene,"function init() {","async function init() {");
  scene=once(scene,"buildSkylightAndVolumetricRays();","buildSkylightAndVolumetricRays();\n                await installAtlasAstral(scene,renderer);");
  scene=once(scene,"            camera.lookAt(currentLookAt);\n            renderer.render(scene, camera);","            camera.lookAt(currentLookAt);\n            updateAtlasAstral(renderer,elapsed);\n            renderer.render(scene, camera);");
  scene=once(scene,"<body>","<body><button type=\"button\" id=\"atlas-astral-toggle\" aria-pressed=\"false\" hidden>Anima luci</button>");
  scene=once(scene,"</head>","<style>#atlas-astral-toggle{position:fixed;z-index:30;right:8px;bottom:8px;min-height:44px;min-width:100px;padding:4px 10px;border:1px solid #bda77b;border-radius:10px;background:#142634;color:#fff;font:12px system-ui;cursor:pointer}#atlas-astral-toggle:focus-visible{outline:3px solid #fff}</style></head>");
  scene=once(scene,"</head>","<script>"+script+"</script></head>");
  return {scene,identity:{modelSha256:R2_SHA,modelBytes:glb.length,lightRevision:OPTICS.revision,anchors:anchors.map(a=>a.id),architecture:"existing-procedural-gateway",translationY:1.2,studentAuthorized:false}};
}
