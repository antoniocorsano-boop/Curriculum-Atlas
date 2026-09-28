import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(new URL("../.smart-percorsi-resolver-audit/package.json",import.meta.url));
const Ajv2020=require("ajv/dist/2020.js").default;
const addFormats=require("ajv-formats").default;
const schema=JSON.parse(fs.readFileSync("schemas/smart-percorsi-binding-registry.schema.json","utf8"));
const canonical=JSON.parse(fs.readFileSync("governance/smart-percorsi-binding-registry.json","utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validate=ajv.compile(schema);
if(!validate(canonical)){console.error(validate.errors);process.exit(1);}
const base={schemaVersion:"atlas.smart.pathway-binding-registry/v1",status:"GOVERNED",authorityModel:"HUMAN_REVIEWED_REPOSITORY_REGISTRY",bindings:[{bindingRef:"b",status:"ACTIVE",materialSetId:"set",materialSetVersion:1,manifestDigest:"sha256:"+"a".repeat(64),candidateBinding:{runtimeExactHead:"b".repeat(40),pathwayId:"pw",contentVersion:"v1",publicationId:"pub"},authorityRef:"authority",authorityEvidenceRef:"evidence",checkedAt:"2026-09-28T18:00:00Z",governanceRef:"review"}]};
if(!validate(base)){console.error("valid fixture rejected",validate.errors);process.exit(1);}
const mutations=[];
{const x=structuredClone(base);x.extra=true;mutations.push(x);}
{const x=structuredClone(base);x.bindings[0].extra=true;mutations.push(x);}
{const x=structuredClone(base);x.bindings[0].candidateBinding.extra=true;mutations.push(x);}
{const x=structuredClone(base);x.bindings[0].checkedAt="bad";mutations.push(x);}
{const x=structuredClone(base);x.bindings[0].manifestDigest="bad";mutations.push(x);}
{const x=structuredClone(base);x.bindings[0].status="UNKNOWN";mutations.push(x);}
for(const x of mutations) if(validate(x)){console.error("invalid mutation accepted");process.exit(1);}
console.log("SMART PERCORSI REGISTRY SCHEMA: PASS — canonical + valid fixture accepted; invalid mutations rejected");
