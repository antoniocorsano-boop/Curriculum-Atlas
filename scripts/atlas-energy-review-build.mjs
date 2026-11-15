import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const MARKER = "ATLAS_ENERGIA_REVIEW_ONLY_V1";
const REVIEW_ROUTE = "revisione/energia";
const SOURCE_SHA = "50d8ec149f24a21f81856403e3926f661eb87faae1de6f97bd9953a234094e13";
const ROUTES = ["libro", "energia", "laboratorio-energia", "mappa-energia", "scheda-energia"];
const SOURCE_NAME = "Atlas_Universo_Energia_F4.html";
const MANIFEST = "ATLAS-ENERGIA-REVIEW-MANIFEST.json";
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const readJSON = file => JSON.parse(fs.readFileSync(file, "utf8"));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
function once(text, needle, replacement) {
  assert(text.split(needle).length === 2, "Unexpected or duplicate integration anchor: " + needle);
  return text.replace(needle, () => replacement);
}
function checkedRoot(dir) {
  assert(dir, "Explicit directory required");
  const root = fs.realpathSync(dir);
  assert(fs.statSync(root).isDirectory(), "Directory required");
  return root;
}

// Only called in a disposable review checkout. Never add the overlay to the normal source tree.
export function prepareReview(root, env = process.env) {
  root = checkedRoot(root);
  assert(env.ATLAS_REVIEW_BUILD === "true" && env.ATLAS_PREVIEW_ROOT_SCOPED === "true" && env.ATLAS_GITHUB_PAGES !== "true", "Review build explicitly required; Pages is forbidden");
  assert(fs.existsSync(path.join(root, ".git")), "Disposable Git checkout required");
  const route = path.join(root, "src/app", REVIEW_ROUTE);
  const marker = path.join(root, ".atlas-energy-review-only");
  assert(!fs.existsSync(route) && !fs.existsSync(marker) && !fs.existsSync(path.join(root,"public", REVIEW_ROUTE)), "Review overlay already present");
  const plan = readJSON(path.join(root,"governance/atlas-energia-consolidamento.json"));
  const data = readJSON(path.join(root,"content/staging/biblioteca/energia/universo-energia-v1.json"));
  assert(plan.studentAuthorized === false && data.studentAuthorized === false && data.status === "HUMAN_REVIEW_REQUIRED", "Unrecognized review authorization state");
  assert(Array.isArray(data.resources) && data.resources.length === ROUTES.length && ROUTES.every((id,i)=>data.resources[i].route===id), "Unexpected resource routes");
  const homePath = path.join(root,"src/app/page.tsx");
  let home = fs.readFileSync(homePath,"utf8");
  home = once(home,"<AppShell>","<AppShell reviewMode>");
  home = once(home,'<h2 id="library-storie">Storie</h2>',`<h2 id="library-storie">Storie</h2>\n          <Link className="library-work" href="/revisione/energia/" data-review-boundary="${MARKER}"><span><small>Revisione docente · Non autorizzata alla distribuzione</small><strong>Universo Energia</strong></span><ArrowRight size={18} aria-hidden="true" /></Link>`);
  const page = fs.readFileSync(path.join(root,"review/energia/page.tsx.txt"),"utf8");
  assert(page.includes(MARKER), "Review marker missing");
  fs.mkdirSync(route,{recursive:true});
  fs.writeFileSync(path.join(route,"page.tsx"),page,{flag:"wx"});
  fs.copyFileSync(path.join(root,"review/energia/review.css"),path.join(route,"review.css"),fs.constants.COPYFILE_EXCL);
  const projected = { title:data.title,question:data.question,audience:data.audience,resources:data.resources.map(({action,title,route,type,description,duration})=>({action,title,route,type,description,duration})) };
  fs.writeFileSync(path.join(route,"review-data.json"),JSON.stringify(projected,null,2)+"\n",{flag:"wx"});
  fs.writeFileSync(homePath,home);
  fs.writeFileSync(marker,MARKER+"\n",{flag:"wx"});
  return {status:"PASS",mode:"review-overlay",studentAuthorized:false};
}

function walk(root, dir, visit) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const full = path.join(dir,entry.name);
    const rel = path.relative(root,full).split(path.sep).join("/");
    assert(!entry.isSymbolicLink(), "Unexpected symbolic link in export: "+rel);
    visit(full,rel,entry);
    if(entry.isDirectory()) walk(root,full,visit);
  }
}

export function verifyPublic(dir) {
  const root = checkedRoot(dir);
  assert(fs.existsSync(path.join(root,"index.html")),"Static export missing index.html");
  const forbidden = [MARKER,REVIEW_ROUTE,SOURCE_SHA,SOURCE_NAME,MANIFEST,"index-v0.5.html"];
  let files = 0;
  walk(root,root,(full,rel,entry)=>{
    assert(!forbidden.some(value=>rel.includes(value)),"Review path in public export: "+rel);
    if(entry.isFile()){
      files++;
      if(/\.(html|js|mjs|json|txt|rsc|map|xml|css|svg)$/i.test(rel)){
        const content=fs.readFileSync(full,"utf8");
        assert(!forbidden.some(value=>content.includes(value)),"Review reference in public export: "+rel);
      }
    }
  });
  return {status:"PASS",mode:"public-negative",files,studentAuthorized:false};
}

export function verifyShell(dir, exactHead) {
  const root=checkedRoot(dir);
  assert(/^[a-f0-9]{40}$/.test(exactHead),"Exact commit required");
  const route=path.join(root,REVIEW_ROUTE);
  const home=fs.readFileSync(path.join(root,"index.html"),"utf8");
  const native=fs.readFileSync(path.join(route,"index.html"),"utf8");
  assert(home.includes(MARKER)&&home.includes("/revisione/energia/"),"Native home entry missing");
  assert(native.includes(MARKER)&&native.includes("Revisione docente"),"Native theme missing");
  for(const id of ROUTES)assert(native.includes(`esperienza.html#${id}`),"Native resource link missing: "+id);
  assert(native.includes("esperienza.html#universo-energia")&&native.includes("esperienza.html#libro-docente"),"Native overview or guide link missing");
  assert(!fs.existsSync(path.join(route,"esperienza.html")),"Full candidate must not be in shell-only export");
  assert(!fs.existsSync(path.join(root,MANIFEST)),"Manifest already exists");
  fs.writeFileSync(path.join(root,MANIFEST),JSON.stringify({schemaVersion:1,channel:"local-review-shell",exactHead,studentAuthorized:false,sourceSha256:SOURCE_SHA},null,2)+"\n",{flag:"wx"});
  return {status:"PASS",mode:"review-shell-only",exactHead,studentAuthorized:false};
}

// Attach the exact qualified edition only on the local assembled review copy.
// The source is never written to a normal build, nor included in the CI shell artifact.
export function attachEdition(dir, sourceFile) {
  const root=checkedRoot(dir);
  const manifest=readJSON(path.join(root,MANIFEST));
  assert(manifest.channel==="local-review-shell"&&manifest.studentAuthorized===false&&manifest.sourceSha256===SOURCE_SHA&&/^[a-f0-9]{40}$/.test(manifest.exactHead),"Not a qualified review shell");
  const route=path.join(root,REVIEW_ROUTE);
  assert(fs.readFileSync(path.join(root,"index.html"),"utf8").includes(MARKER)&&fs.readFileSync(path.join(route,"index.html"),"utf8").includes(MARKER),"Native review marker missing");
  const bytes=fs.readFileSync(sourceFile);
  assert(sha256(bytes)===SOURCE_SHA,"F4 source hash mismatch");
  let html=bytes.toString("utf8");
  const bridge='<a class="back" data-atlas-native-return="true" href="./">← Atlas · revisione</a>';
  const theme='<section aria-labelledby="heading-universo-energia" class="view energy-view" hidden="" id="universo-energia"><a class="back" href="#home">← Biblioteca</a>';
  html=once(html,theme,theme+bridge);
  const footer='<footer class="reader-footer"><a class="back" href="#storie">← Torna alla raccolta Storie</a>';
  html=once(html,footer,footer+bridge);
  const global='<a href="#home">Torna alla biblioteca</a></footer>';
  html=once(html,global,'<a href="#home">Torna alla biblioteca</a>'+bridge+'</footer>');
  assert((html.match(/data-atlas-native-return="true"/g)||[]).length===3,"Native bridge count mismatch");
  const output=path.join(route,"esperienza.html");
  fs.writeFileSync(output,html,{flag:"wx"});
  fs.writeFileSync(path.join(root,MANIFEST),JSON.stringify({...manifest,channel:"local-review-assembled",derivedSha256:sha256(html),bridgeLinks:3},null,2)+"\n");
  return {status:"PASS",mode:"review-assembled",sourceSha256:SOURCE_SHA,derivedSha256:sha256(html),studentAuthorized:false};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const [mode,dir,extra]=process.argv.slice(2);
  try{
    const result=mode==="prepare"?prepareReview(dir):mode==="verify-public"?verifyPublic(dir):mode==="verify-shell"?verifyShell(dir,extra):mode==="attach"?attachEdition(dir,extra):null;
    assert(result,"Use prepare | verify-public | verify-shell | attach with explicit directory");
    console.log(JSON.stringify(result));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
