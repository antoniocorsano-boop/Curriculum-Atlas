import fs from "node:fs";
import {validateChallengeKernel,validateExperienceDefinition} from "./lib/experience-contracts.mjs";
const [kind,file]=process.argv.slice(2);
if(!kind||!file){console.error("usage: node scripts/validate-experience-contracts.mjs <kernel|experience> <file.json>");process.exit(2);}
const value=JSON.parse(fs.readFileSync(file,"utf8"));
const out=kind==="kernel"?validateChallengeKernel(value):kind==="experience"?validateExperienceDefinition(value):null;
if(!out){console.error("kind must be kernel or experience");process.exit(2);}
console.log(JSON.stringify(out,null,2));if(!out.valid)process.exit(1);
