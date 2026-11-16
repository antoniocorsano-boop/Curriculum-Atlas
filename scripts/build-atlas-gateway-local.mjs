import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { hash } from "node:crypto";
import { createRequire } from "node:module";
import tailwind from "@tailwindcss/postcss";

const require = createRequire(import.meta.url);
const postcss = createRequire(require.resolve("@tailwindcss/postcss"))("postcss");
const out = resolve(process.argv[2] ?? ".atlas-gateway");
const version = "0.128.0";
// Upstream tag r128: verified blob identifiers for the actual build and MIT license.
const expected = { engine: "b14f47c0908bab15e890b468d53bb07db0be3a18", license: "5303437e406ed22d8cb0b4c12398870792a25878" };
const gitBlob = bytes => hash("sha1", Buffer.concat([Buffer.from("blob "+bytes.length+"\0"), bytes]), "hex");
const sha = bytes => hash("sha256", bytes, "hex");
const temp = mkdtempSync(join(tmpdir(), "atlas-gateway-deps-"));
if (existsSync(out)) throw Error("La cartella di destinazione esiste già: "+out);
try {
  const info = JSON.parse(execFileSync("npm", ["pack", "three@"+version, "--ignore-scripts", "--json", "--pack-destination", temp], { encoding:"utf8" }))[0];
  const archive = join(temp, info.filename);
  const extract = path => execFileSync("tar", ["-xOf", archive, "package/"+path], { maxBuffer: 8*1024*1024 });
  const engine = extract("build/three.min.js");
  const license = extract("LICENSE");
  const meta = JSON.parse(extract("package.json").toString("utf8"));
  if (meta.version !== version || meta.license !== "MIT" || gitBlob(engine) !== expected.engine || gitBlob(license) !== expected.license) {
    throw Error("Three.js: versione, licenza o sorgente differente dal riferimento verificato");
  }
  const css = await postcss([tailwind({base:process.cwd(),optimize:false})]).process(
    '@import "tailwindcss" source(none);\n@source "./docs/atlas-gateway/fonti/scene-threejs.html";',
    { from:resolve("atlas-gateway-input.css") }
  );
  if (!css.css.includes(".fixed") || !css.css.includes(".flex") || /@import\b|url\s*\(/i.test(css.css)) throw Error("CSS locale incompleto o con dipendenze esterne");
  const cssBytes = Buffer.from(css.css);
  mkdirSync(out,{recursive:true});
  const threePath = join(out,"three.min.js"), cssPath = join(out,"scene.css"), scene = join(out,"scene.html");
  writeFileSync(threePath,engine);
  writeFileSync(join(out,"THREE-LICENSE.txt"),license);
  writeFileSync(cssPath,cssBytes);
  const tailwindPackage = require.resolve("tailwindcss/package.json");
  const tailwindMeta = JSON.parse(readFileSync(tailwindPackage,"utf8"));
  const tailwindLicense = readFileSync(resolve(tailwindPackage,"../LICENSE"));
  if (tailwindMeta.license !== "MIT") throw Error("Licenza CSS non verificata");
  writeFileSync(join(out,"TAILWIND-LICENSE.txt"),tailwindLicense);
  execFileSync(process.execPath,["scripts/prepare-atlas-gateway-scene.mjs",threePath,sha(engine),cssPath,sha(cssBytes),scene],{stdio:"inherit"});
  const sceneSha = sha(readFileSync(scene));
  const manifest = {schemaVersion:"atlas.gateway.local-bundle/v1",three:{version,license:"MIT",upstreamTag:"r128",gitBlob:expected.engine,sha256:sha(engine),npmIntegrity:info.integrity},tailwind:{version:tailwindMeta.version,license:"MIT",sha256:sha(cssBytes)},scene:{sha256:sceneSha},studentAuthorized:false};
  writeFileSync(join(out,"manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  console.log(JSON.stringify(manifest,null,2));
} finally { rmSync(temp,{recursive:true,force:true}); }
