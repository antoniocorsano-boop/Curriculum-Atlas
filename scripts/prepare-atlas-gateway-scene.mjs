import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const BASE = "docs/atlas-gateway/fonti/scene-threejs.html";
const BASE_SHA = "59b063bca75a102d4b808a0cac5c31f4bf57611ff462be5059514032dfba057f";
const digest = data => createHash("sha256").update(data).digest("hex");
function checked(path, expected) {
  if (!path || !/^[a-f0-9]{64}$/.test(expected ?? "")) throw new Error("File e SHA-256 approvati obbligatori");
  const data = readFileSync(path);
  if (digest(data) !== expected) throw new Error("Impronta non corrispondente: " + path);
  return data.toString("utf8");
}
function replaceOne(source, before, after) {
  if (source.split(before).length !== 2) throw new Error("Sostituzione ambigua: " + before);
  return source.replace(before, () => after);
}
const [threePath, threeSha, cssPath, cssSha, output] = process.argv.slice(2);
if (!output) throw new Error("Uso: node scripts/prepare-atlas-gateway-scene.mjs THREE SHA256 CSS SHA256 OUTPUT");
let scene = checked(BASE, BASE_SHA);
scene = scene.replace(/(<(?:span|h2)\b[^>]*\bid="(?:inspect-title|card-title)"[^>]*>)[^<]*(<\/(?:span|h2)>)/g, "$1Curricolo Atlas$2");
const responsiveStyles = "\n/* Candidate-only responsive overlay: original model and geometry stay intact. */\n#atlas-quick{left:50%;right:auto;bottom:8px;transform:translateX(-50%);width:min(580px,calc(100% - 16px));max-width:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px}\n#atlas-quick button{min-width:0;min-height:44px;white-space:normal;overflow-wrap:anywhere;line-height:1.15;padding:5px 7px;font-size:clamp(11px,1.6vw,14px);cursor:pointer}\n#gesture-controls{width:max-content;max-width:calc(100% - 12px);gap:2px;padding:3px}\n#gesture-controls button{min-height:44px;min-width:44px;padding:3px 6px;font-size:12px}\n#gesture-controls .gesture-divider{display:none}\n#hero-footer{bottom:74px!important}\n@media(max-width:480px){#gesture-controls{width:calc(100% - 12px);display:grid;grid-template-columns:repeat(6,minmax(0,1fr));top:56px;gap:1px}#gesture-controls button{min-width:0;padding:2px;font-size:11px}header nav{display:none!important}#hero-footer p{font-size:12px}#atlas-quick button{font-size:11px;padding:4px 2px}}\n@media(max-height:460px){#hero-footer,#hover-badge,body>header{display:none!important}#gesture-controls{top:5px;width:min(420px,calc(100% - 12px));display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}#gesture-controls button{min-width:0;min-height:44px}#atlas-quick{bottom:4px}}\n";
scene = replaceOne(scene, "</head>", "<style id=\"atlas-responsive-candidate\">"+responsiveStyles+"</style></head>");
const three = checked(threePath, threeSha);
const css = checked(cssPath, cssSha);
if (/<\/script/i.test(three) || /<\/style/i.test(css)) throw new Error("Dipendenza non incorporabile");
if (/@import\b|url\s*\(/i.test(css)) throw new Error("CSS con risorse esterne o import non consentito");
const bridge = 'const ATLAS_PARENT_ORIGIN=__ATLAS_PARENT_ORIGIN_JSON__; const ATLAS_CHANNEL=__ATLAS_CHANNEL_JSON__; function sendAtlas(data){window.parent.postMessage({...data,channel:ATLAS_CHANNEL},ATLAS_PARENT_ORIGIN);}';
scene = scene.replace(/^[ \t]*<link[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\r?\n/gm, "");
scene = replaceOne(scene, '<script src="https://cdn.tailwindcss.com"></script>', '<style>'+css+'</style>');
scene = replaceOne(scene, '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script>'+three+'</script><script>'+bridge+'</script>');
scene = replaceOne(scene, '<head>', '<head><meta name="atlas-gateway-local-scene-v1" content="prepared"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; font-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">');
scene = replaceOne(scene, 'window.parent.postMessage({type:"atlas-3d-ready"}, "*");', 'sendAtlas({type:"atlas-3d-ready"});');
scene = replaceOne(scene, "window.parent.postMessage({type:'atlas-3d-error'}, '*');", "sendAtlas({type:'atlas-3d-error'});");
scene = replaceOne(scene, "window.parent.postMessage({type:'atlas-open',id},'*');", "sendAtlas({type:'atlas-open',id});");
scene = replaceOne(scene, "window.addEventListener('message',e=>{if(e.source!==window.parent)return;if(e.data?.type==='atlas-pause')paused=!!e.data.value;});", "// Parent unmounts the iframe when leaving the room.");
scene = replaceOne(scene, "setupNativeControls(renderer.domElement);", "setupNativeControls(renderer.domElement);\n                renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); paused = true; sendAtlas({type:'atlas-3d-error'}); }, {once:true});");
if (/<script[^>]+src\s*=|<link[^>]+href\s*=|postMessage\([^;\n]*['"]\*['"]/i.test(scene)) throw new Error("Sorgente non isolato");
writeFileSync(output, scene, { flag: "wx" });
console.log("Prepared local scene SHA256:", digest(scene));
