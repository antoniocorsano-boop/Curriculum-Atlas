import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(new URL("../.smart-percorsi-first-binding-audit/package.json",import.meta.url));
const Ajv2020=require("ajv/dist/2020.js").default;
const addFormats=require("ajv-formats").default;
const schema=JSON.parse(fs.readFileSync("schemas/smart-percorsi-first-binding-decision.schema.json","utf8"));
const decision=JSON.parse(fs.readFileSync("governance/smart-percorsi-first-binding-decision.json","utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validate=ajv.compile(schema);
if(!validate(decision)){console.error(validate.errors);process.exit(1);}
const muts=[];
{const x=structuredClone(decision);x.extra=true;muts.push(x);}
{const x=structuredClone(decision);x.bindingRegistrationAuthorized=true;muts.push(x);}
{const x=structuredClone(decision);x.runtimeAuthorized=true;muts.push(x);}
{const x=structuredClone(decision);x.status="READY_FOR_BINDING_REGISTRATION";muts.push(x);}
{const x=structuredClone(decision);x.evaluatedExistingPathways[0].decision="BOUND";muts.push(x);}
for(const x of muts) if(validate(x)){console.error("invalid decision mutation accepted");process.exit(1);}
console.log("SMART PERCORSI FIRST BINDING DECISION SCHEMA: PASS");
