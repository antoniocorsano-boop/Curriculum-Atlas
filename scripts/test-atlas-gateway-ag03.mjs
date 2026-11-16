import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { PORTALS, resolvePortal, safePathwayHref, readSceneMessage } from "../src/features/atlas-gateway/gateway-policy.ts";
import { loadPublicPathways } from "../src/features/pathways/load-public-pathways.ts";

const hash = data => createHash("sha256").update(data).digest("hex");
test("only the three known portals, Studio has no destination", () => {
  assert.deepEqual(PORTALS.map(p => p.id), ["curricolo", "esperienze", "studio"]);
  assert.equal(resolvePortal("curricolo").href, "/curricolo");
  assert.equal(resolvePortal("esperienze").href, "/esperienze");
  assert.equal(resolvePortal("studio").href, null);
  for (const id of ["__proto__", "https://example.test", "/lab", null]) assert.equal(resolvePortal(id), null);
});
test("launch only canonical pathway routes", () => {
  assert.equal(safePathwayHref("/percorsi/pw-example-01"), true);
  assert.equal(safePathwayHref("/percorsi/pw-example-01/"), true);
  for (const path of [null, "/percorsi/lab", "/percorsi/lab/", "/percorsi/lab/a", "//evil.test", "/percorsi/../studio", "/percorsi/a?x=1", "/percorsi/a#x", "/percorsi/%2e%2e", "/percorsi/a/b"]) assert.equal(safePathwayHref(path), false, String(path));
});
test("publication filter excludes candidates, withdrawn items cannot launch", () => {
  const base = { pathwayId: "pw-example-01", title: "Example", version: "1", provenanceRef: "test", publicPath: "/percorsi/pw-example-01", availability: "ACTIVE" };
  assert.equal(loadPublicPathways([{...base,runtimeAuthorization:"NOT_RUNTIME_AUTHORIZED"}]).length, 0);
  assert.equal(loadPublicPathways([{...base,runtimeAuthorization:"RUNTIME_AUTHORIZED"}])[0].launchHref, base.publicPath);
  assert.equal(loadPublicPathways([{...base,runtimeAuthorization:"RUNTIME_AUTHORIZED",availability:"WITHDRAWN"}])[0].launchHref, null);
});
test("scene message requires exact channel and allowlisted action", () => {
  const valid = { type: "atlas-open", id: "curricolo", channel: "x" };
  assert.deepEqual(readSceneMessage(valid, "x"), { type: "atlas-open", id: "curricolo" });
  assert.equal(readSceneMessage(valid, "y"), null);
  assert.equal(readSceneMessage({...valid,id:"/lab"}, "x"), null);
  assert.equal(readSceneMessage({...valid,type:"navigate"}, "x"), null);
  assert.equal(readSceneMessage([], "x"), null);
  assert.deepEqual(readSceneMessage({type:"atlas-3d-ready",channel:"x"}, "x"), {type:"atlas-3d-ready"});
});
test("scene preparation with test stubs is offline and preserves the baseline", () => {
  const dir = mkdtempSync(join(tmpdir(),"atlas-gateway-"));
  try {
    const three = join(dir,"three.js"), css = join(dir,"style.css"), output = join(dir,"scene.html");
    writeFileSync(three,"var THREE = {};\n");
    writeFileSync(css,"body { color: white; }\n");
    const baseline = "docs/atlas-gateway/fonti/scene-threejs.html";
    const before = hash(readFileSync(baseline));
    const run = (threeHash,cssHash) => spawnSync(process.execPath,["scripts/prepare-atlas-gateway-scene.mjs",three,threeHash,css,cssHash,output],{encoding:"utf8"});
    assert.notEqual(run("0".repeat(64),hash(readFileSync(css))).status,0);
    writeFileSync(css,"@import 'https://example.test/style.css';");
    assert.notEqual(run(hash(readFileSync(three)),hash(readFileSync(css))).status,0);
    writeFileSync(css,"body { color: white; }\n");
    const result = run(hash(readFileSync(three)),hash(readFileSync(css)));
    assert.equal(result.status,0,result.stderr);
    const scene = readFileSync(output,"utf8");
    assert.match(scene,/atlas-gateway-local-scene-v1/);
    assert.match(scene,/connect-src 'none'/);
    assert.match(scene,/ATLAS_PARENT_ORIGIN/);
    assert.doesNotMatch(scene,/<script[^>]+src\s*=|<link[^>]+href\s*=/i);
    assert.equal(hash(readFileSync(baseline)),before);
    assert.notEqual(run(hash(readFileSync(three)),hash(readFileSync(css))).status,0);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
