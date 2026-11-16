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
// AG-04/B: local, reversible art direction; never change the historical source.
const artDirection = [
  [
    "scene.background = new THREE.Color(0x050a14);",
    "scene.background = new THREE.Color(0x263e50);"
  ],
  [
    "scene.fog = new THREE.FogExp2(0x101924, 0.008);",
    "scene.fog = new THREE.FogExp2(0x667c85, 0.006);"
  ],
  [
    "renderer.toneMappingExposure = 1.05;",
    "renderer.toneMappingExposure = 1.12;"
  ],
  [
    "new THREE.HemisphereLight(0xd6e7ff,0x806044,.83)",
    "new THREE.HemisphereLight(0xf2f6ff,0xb28c62,.98)"
  ],
  [
    "new THREE.DirectionalLight(0xffe0aa,1.25)",
    "new THREE.DirectionalLight(0xffeed3,1.35)"
  ],
  [
    "new THREE.DirectionalLight(0xb9dfff,.55)",
    "new THREE.DirectionalLight(0xdcecff,.72)"
  ],
  [
    "new THREE.PointLight(0xffca82,.85,24,1)",
    "new THREE.PointLight(0xffd7a2,.92,24,1)"
  ],
  [
    "g.fillStyle='#26313c';",
    "g.fillStyle='#958678';"
  ],
  [
    "gr.addColorStop(0,'#394653');gr.addColorStop(.48,'#202a36');gr.addColorStop(1,'#3b4146');",
    "gr.addColorStop(0,'#b0a395');gr.addColorStop(.48,'#847a70');gr.addColorStop(1,'#b8a99a');"
  ],
  [
    "i%4===0?'#b2a48a26':'#a0b0c010'",
    "i%4===0?'#695d5225':'#e8e0d518'"
  ],
  [
    "g.strokeStyle='#ad94704a';g.lineWidth=2;g.strokeRect(1,1,510,510);",
    "g.strokeStyle='#88786a38';g.lineWidth=1;g.strokeRect(1,1,510,510);"
  ],
  [
    "tex.repeat.set(14,14);",
    "tex.repeat.set(7,7);"
  ],
  [
    "map:tex,color:0xc8c7bf,metalness:.24,roughness:.39",
    "map:tex,color:0xe4d6c5,metalness:.12,roughness:.32"
  ],
  [
    "color:0x654431,roughness:.65,metalness:.06",
    "color:0x845c3e,roughness:.62,metalness:.04"
  ],
  [
    "color:0x182b3b,roughness:.46,metalness:.22",
    "color:0x354c59,roughness:.48,metalness:.18"
  ],
  [
    "color:0x382d29,roughness:.78",
    "color:0x89705a,roughness:.78"
  ],
  [
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xdcd0bc}));",
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xf0e3cc}));\n            // AG-04/B: shallow physical shelf ledges, batched in one draw call.\n            const ledges=new THREE.InstancedMesh(new THREE.BoxGeometry(3.12,.095,.36),walnut,levels.length*bays*4);\n            const ledgeTransform=new THREE.Object3D();let ledgeIndex=0;"
  ],
  [
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);",
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);\n                    for(let k=0;k<4;k++){const rr=19.73;ledgeTransform.position.set(Math.sin(a)*rr,h+.22+k*.74,center-Math.cos(a)*rr);ledgeTransform.rotation.y=-a;ledgeTransform.updateMatrix();ledges.setMatrixAt(ledgeIndex++,ledgeTransform.matrix);}"
  ],
  [
    "for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const c=new THREE.Mesh(colGeo,navy);",
    "ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);\n            for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const c=new THREE.Mesh(colGeo,navy);"
  ],
  [
    "float c=sin(d.x*17.+sin(d.z*11.))*sin(d.z*13.+sin(d.x*9.));float cloud=smoothstep(.16,.75,c);vec3 sky=mix(vec3(.29,.51,.70),vec3(.71,.84,.93),cloud*.75);gl_FragColor=vec4(sky+sun*vec3(.25,.20,.12),1.);",
    "float horizon=pow(1.-clamp(d.y,0.,1.),2.);vec3 sky=mix(vec3(.37,.63,.84),vec3(.86,.91,.92),horizon);gl_FragColor=vec4(sky+sun*vec3(.24,.21,.16),1.);"
  ],
  [
    "color:0x394752,metalness:.35,roughness:.4",
    "color:0xa49175,metalness:.35,roughness:.4"
  ],
  [
    "color:0x233341,roughness:.46",
    "color:0xc0ac90,roughness:.62"
  ],
  [
    "g.fillText('A T L A S',512,118);",
    "g.fillText('A R E N A',512,118);"
  ],
  [
    "sign.position.set(Math.sin(a)*18.9,10.93,cz-Math.cos(a)*18.9);sign.lookAt(0,10.93,cz);",
    "sign.position.set(Math.sin(a)*12.0,10.86,cz-Math.cos(a)*12.0);sign.lookAt(0,10.86,cz);"
  ],
  [
    "// ATLAS wordmark on the architectural frieze, facing the hall from four sides.",
    "// AG-04/B: Arena provenance on the dome rim; ATLAS remains on podium and navigation."
  ],
  [
    "bgGrad.addColorStop(0, 'rgba(28, 53, 77, 0.91)');",
    "bgGrad.addColorStop(0, 'rgba(36, 65, 84, 0.96)');"
  ],
  [
    "bgGrad.addColorStop(0.5, 'rgba(12, 30, 48, 0.82)');",
    "bgGrad.addColorStop(0.5, 'rgba(15, 35, 50, 0.94)');"
  ],
  [
    "bgGrad.addColorStop(1, 'rgba(36, 70, 95, 0.92)');",
    "bgGrad.addColorStop(1, 'rgba(41, 77, 98, 0.96)');"
  ],
  [
    "ctx.font = '700 68px Inter, sans-serif';",
    "ctx.font = '700 76px Inter, sans-serif';"
  ],
  [
    "ctx.font = '400 30px Inter, sans-serif';",
    "ctx.font = '500 34px Inter, sans-serif';"
  ]
];
for (const [before, after] of artDirection) scene = replaceOne(scene, before, after);

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
