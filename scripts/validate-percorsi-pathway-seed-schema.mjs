import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(new URL("../.percorsi-factory-audit/package.json",import.meta.url));
const Ajv2020=require("ajv/dist/2020.js").default;
const schema=JSON.parse(fs.readFileSync("schemas/percorsi-pathway-seed.schema.json","utf8"));
const seed=JSON.parse(fs.readFileSync("fixtures/percorsi-factory/valid/missing-information.seed.json","utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true});
const validate=ajv.compile(schema);
if(!validate(seed)){console.error(validate.errors);process.exit(1);}
const mutations=[];
{const x=structuredClone(seed);x.extra=true;mutations.push(x);}
{const x=structuredClone(seed);x.pathwayId="BAD";mutations.push(x);}
{const x=structuredClone(seed);x.territoryIds=["unknown"];mutations.push(x);}
{const x=structuredClone(seed);delete x.cognitiveFunctions.reflect;mutations.push(x);}
for(const x of mutations) if(validate(x)){console.error("invalid seed accepted");process.exit(1);}
console.log("PERCORSI FACTORY SEED SCHEMA: PASS");
