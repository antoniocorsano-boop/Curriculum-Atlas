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
assert.match(html,/type="module" src="\.\/foyer.mjs"/);
assert.match(js,/WebGLRenderer/);
assert.match(js,/CylinderGeometry/);
assert.match(js,/TubeGeometry/);
assert.match(js,/Math\.sqrt\(maxPixels\/\(w\*h\)\)/);
assert.match(js,/camera-reset/);
assert.match(js,/fallback\(/);
assert.match(css,/@media\(max-width:650px\)/);
assert.match(css,/focus-visible/);
assert.ok(!/https?:\/\//.test(html+js+css),"no external resources");
assert.ok(!/\/biblioteca\//.test(html+js+css),"foyer is not the library");
console.log("ATLAS_GATEWAY_FOYER_CONTRACT_PASS",PORTALS.length);
