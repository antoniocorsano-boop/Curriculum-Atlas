import fs from "node:fs";

const path = process.argv[2] || "src/features/curriculum/arena-curriculum-export.json";
const input = JSON.parse(fs.readFileSync(path, "utf8"));
const candidateOnly = process.argv.includes("--candidate-only");

const errors=[];
const req=(ok,msg)=>{ if(!ok) errors.push(msg); };

req(input.contract==="ARENA_ATLAS_CURRICULUM_EXPORT_V1","unsupported contract");
req(input.coverage?.infanziaFields===5,"Infanzia coverage incomplete");
req(input.coverage?.primaryDisciplines===11,"Primary discipline coverage incomplete");
req(input.coverage?.secondaryDisciplines===12,"Secondary discipline coverage incomplete");
req(input.coverage?.primaryGradeBands===55,"Primary grade coverage incomplete");
req(input.coverage?.secondaryGradeBands===36,"Secondary grade coverage incomplete");
req(input.coverage?.transversalAxes===3,"transversal coverage incomplete");

const facade = fs.readFileSync("src/features/curriculum/fixtures.ts", "utf8");
const promotesArenaSnapshot = facade.includes("./arena-projected");

if (!candidateOnly && promotesArenaSnapshot) {
  req(input.authorityState==="APPROVED","PUBLICATION BLOCKED: Arena authorityState is not APPROVED");
  req(input.authorityReceiptRef && typeof input.authorityReceiptRef==="object","PUBLICATION BLOCKED: authorityReceiptRef missing");
  req(input.integrityDigest?.algorithm==="sha256" && /^[0-9a-f]{64}$/.test(input.integrityDigest?.hash||""),"PUBLICATION BLOCKED: approved payload requires SHA-256 digest");
}

if(errors.length){
  console.error(errors.map(e=>"ERROR: "+e).join("\n"));
  process.exit(1);
}
console.log(JSON.stringify({
  mode:candidateOnly?"candidate":(promotesArenaSnapshot?"publication":"infrastructure"),
  authorityState:input.authorityState,
  fingerprint:input.structuralFingerprint.hash,
  coverage:input.coverage
},null,2));
