import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validate } from "./validate-activity-intake.mjs";

const original = path.resolve("content/staging/missione-118");
const staging = path.resolve("content/staging");

test("original activity with eight embedded illustrations passes integrity", () => {
 const result = validate(path.join(original,"intake.json"));
 assert.equal(result.files,10);
 assert.equal(result.images,8);
 assert.equal(result.canPublish,false);
});

test("intake rejects unsafe promotion, tampered asset, missing file and traversal", () => {
 const temp=fs.mkdtempSync(path.join(staging,".intake-regression-"));
 try {
  fs.cpSync(original,temp,{recursive:true,force:true});
  const file=path.join(temp,"intake.json");
  const base=JSON.parse(fs.readFileSync(file,"utf8"));
  const mutations=[
    [m=>{m.authorization.atlasPublished=true;},/NO_PUBLICATION_AUTHORITY/],
    [m=>{m.assets[0].sha256="0".repeat(64);},/ASSET_SHA256/],
    [m=>{m.assets[0].path="../secret";},/PATH_TRAVERSAL/],
    [m=>{m.assets[0].path="media/nonexistent.webp";},/FILE_NOT_PRESENT/],
    [m=>{m.review.teacher="APPROVED";},/HUMAN_REVIEW_PENDING/]
  ];
  for(const [mutation,reason] of mutations){
   const candidate=structuredClone(base);
   mutation(candidate);
   fs.writeFileSync(file,JSON.stringify(candidate));
   assert.throws(()=>validate(file),reason);
  }
 }finally{
  fs.rmSync(temp,{recursive:true,force:true});
 }
});
