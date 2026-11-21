import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PORTALS,verifyPortalContract,FOYER_SCHEMA} from "./atlas-gateway-foyer/portal-contract.mjs";
const read=name=>readFileSync("scripts/atlas-gateway-foyer/"+name,"utf8");
const html=read("index.html"),js=read("foyer.mjs"),css=read("foyer.css");
assert.equal(FOYER_SCHEMA,"atlas.gateway.foyer/v1");
assert.equal(verifyPortalContract(),true);
assert.deepEqual(PORTALS.map(p=>p.href),["/curricolo/","/esplora/","/percorsi/","/esperienze/"]);
for(const p of PORTALS){
  assert.ok(html.includes('data-portal="'+p.id+'" href="'+p.href+'"'),p.id+" destination");
  assert.ok(js.includes("portalPanels")&&js.includes("Raycaster"),"mesh hit-testing");
}
assert.match(html,/id="foyer-canvas"/);
assert.match(html,/name="viewport"/);
assert.match(html,/connect-src [^"]*blob:/,"verified GLB embedded textures require blob URLs");
assert.match(html,/type="module" src="\.\/foyer.mjs"/);
assert.match(js,/WebGLRenderer/);
assert.match(js,/CylinderGeometry/);
assert.match(js,/atlas-logo-approved-01\.png/);
assert.match(js,/logoGeometry\.computeVertexNormals/);
assert.match(js,/Math\.sqrt\(radial\)/);
assert.ok(!js.includes("ctx.fillText(\"ATLAS\""),"no generic wordmark plane");
assert.match(js,/TubeGeometry/);
assert.match(js,/roundedPortalShape/,"physical 3D panels must use rounded geometry");
assert.match(js,/ExtrudeGeometry/,"portal frames must have depth");
assert.match(js,/ctx.fillText\\(portal.label,256,285/,"single embedded portal title raised to readable position");
const landmarkReport=JSON.parse(readFileSync("docs/atlas-gateway/PORTALS-LIGHT-01-REFERENCE-LANDMARKS.json","utf8"));
assert.equal(landmarkReport.portals.length,4,"exactly four image-measured portal silhouettes");
assert.deepEqual(landmarkReport.portals.map(p=>p.id),PORTALS.map(p=>p.id));
assert.ok(landmarkReport.portals.every(p=>p.bbox_normalized.every(v=>v>=0&&v<=1)),"normalized reference geometry");

assert.match(js,/Math\.sqrt\(maxPixels\/\(w\*h\)\)/);
assert.match(js,/camera-reset/);
assert.match(js,/fallback\(/);
assert.match(css,/@media\(max-width:650px\)/);
assert.match(css,/focus-visible/);
assert.match(js,/portalTextureCache/,"four portal graphics share a cached authored design");
assert.match(js,/labelTexture\(portal,true\)/,"Blender GLB signage must be transparent");
assert.ok(!js.includes("ctx.fillText(line,"),"no descriptive subtitles inside portal surfaces");
assert.ok(!js.includes("new T.Points(starsGeo"),"no floating star effects");
assert.ok(!js.includes("new T.ConeGeometry(2.25,5.6"),"no fake volumetric light cones");
assert.match(css,/grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/,"compact four-link navigation");
assert.match(css,/\.destinations span\{display:none\}/,"subtitle labels not repeatedly displayed");

assert.ok(!/https?:\/\//.test(html+js+css),"no external resources");
assert.ok(!/\/biblioteca\//.test(html+js+css),"foyer is not the library");
console.log("ATLAS_GATEWAY_FOYER_CONTRACT_PASS",PORTALS.length);
