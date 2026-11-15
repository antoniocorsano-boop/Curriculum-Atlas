import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { prepareReview, verifyPublic, verifyShell, attachEdition } from "./atlas-energy-review-build.mjs";

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const root=fs.mkdtempSync(path.join(os.tmpdir(),"atlas-energy-boundary-"));
const marker="ATLAS_ENERGIA_REVIEW_ONLY_V1";
const fakeHead="a".repeat(40);
const env={ATLAS_REVIEW_BUILD:"true",ATLAS_PREVIEW_ROOT_SCOPED:"true"};
const write=(base,rel,body)=>{const target=path.join(base,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,body);};
try{
 const review=path.join(root,"review");fs.mkdirSync(path.join(review,".git"),{recursive:true});
 const routes=["libro","energia","laboratorio-energia","mappa-energia","scheda-energia"];
 const contract={studentAuthorized:false,status:"HUMAN_REVIEW_REQUIRED",title:"Energia",question:"Dove va?",audience:"Terza",resources:routes.map((route,i)=>({route,action:String(i),title:route,type:"Test",description:"Fixture",duration:"1 min"}))};
 write(review,"content/staging/biblioteca/energia/universo-energia-v1.json",JSON.stringify(contract));
 write(review,"governance/atlas-energia-consolidamento.json",JSON.stringify({studentAuthorized:false}));
 const home='<AppShell><h2 id="library-storie">Storie</h2></AppShell>';
 write(review,"src/app/page.tsx",home);
 for(const name of ["page.tsx.txt","review.css"])write(review,"review/energia/"+name,fs.readFileSync(path.join(repo,"review/energia",name)));
 assert.throws(()=>prepareReview(review,{}),/explicitly/);
 assert.throws(()=>prepareReview(review,{...env,ATLAS_GITHUB_PAGES:"true"}),/forbidden/);
 assert.equal(fs.readFileSync(path.join(review,"src/app/page.tsx"),"utf8"),home);
 write(review,"governance/atlas-energia-consolidamento.json",JSON.stringify({studentAuthorized:true}));
 assert.throws(()=>prepareReview(review,env),/authorization/);
 write(review,"governance/atlas-energia-consolidamento.json",JSON.stringify({studentAuthorized:false}));
 assert.equal(prepareReview(review,env).status,"PASS");
 assert.ok(fs.readFileSync(path.join(review,"src/app/page.tsx"),"utf8").includes(marker));
 assert.ok(fs.existsSync(path.join(review,"src/app/revisione/energia/page.tsx")));
 assert.throws(()=>prepareReview(review,env),/already present/);
 const pub=path.join(root,"public");write(pub,"index.html","<h1>Atlas</h1>");
 assert.equal(verifyPublic(pub).status,"PASS");
 write(pub,"_next/static/test.js",`const candidate = '/revisione/energia/';`);
 assert.throws(()=>verifyPublic(pub),/Review reference/);
 fs.rmSync(path.join(pub,"_next"),{recursive:true});
 write(pub,"revisione/energia/index.html","unexpected");assert.throws(()=>verifyPublic(pub),/Review path/);
 const shell=path.join(root,"shell");write(shell,"index.html",`<a data-review="${marker}" href="/revisione/energia/">Energia</a>`);
 write(shell,"revisione/energia/index.html",`<h1>${marker} Revisione docente</h1>`+[...routes,"universo-energia","libro-docente"].map(id=>`<a href="esperienza.html#${id}">${id}</a>`).join(""));
 assert.equal(verifyShell(shell,fakeHead).status,"PASS");assert.throws(()=>verifyPublic(shell),/Review/);
 const wrong=path.join(root,"wrong.html");fs.writeFileSync(wrong,"wrong");assert.throws(()=>attachEdition(shell,wrong),/hash mismatch/);
 if(process.argv[2]){
  const attached=attachEdition(shell,process.argv[2]);assert.equal(attached.status,"PASS");
  const rendered=fs.readFileSync(path.join(shell,"revisione/energia/esperienza.html"),"utf8");assert.equal((rendered.match(/data-atlas-native-return="true"/g)||[]).length,3);
  assert.throws(()=>verifyPublic(shell),/Review/);
  console.log(JSON.stringify(attached));
 }
 console.log("PASS: review overlay denied by default, Pages denied, authorization checked, duplicate denied, public route/chunk leak rejected, shell and incorrect edition hash checked");
}finally{fs.rmSync(root,{recursive:true,force:true});}
