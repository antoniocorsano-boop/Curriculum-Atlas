import fs from "node:fs";
import crypto from "node:crypto";
import {createRequire} from "node:module";
import {buildSmartPercorsiHandoff} from "./build-smart-percorsi-handoff.mjs";

const require=createRequire(new URL("../.smart-percorsi-bridge-audit/package.json",import.meta.url));
const Ajv2020=require("ajv/dist/2020.js").default;
const addFormats=require("ajv-formats").default;
const schema=JSON.parse(fs.readFileSync("schemas/smart-percorsi-handoff.schema.json","utf8"));
const ajv=new Ajv2020({allErrors:true,strict:true}); addFormats(ajv); const validate=ajv.compile(schema);
const stable=(v)=>v===null||typeof v!=="object"?JSON.stringify(v):Array.isArray(v)?"["+v.map(stable).join(",")+"]":"{"+Object.keys(v).sort().map(k=>JSON.stringify(k)+":"+stable(v[k])).join(",")+"}";
const manifest={schemaVersion:"atlas.smart.materialset/v1",materialSetId:"schema-set",version:1,activityId:"activity",publication:{eligibility:"PUBLICATION_CANDIDATE"},resources:[{resourceId:"r",required:true,digest:"sha256:"+"b".repeat(64),byteSize:1,publicationPath:"/materials/r.bin",provenanceRef:"source:r"}]};
const binding={runtimeExactHead:"a".repeat(40),pathwayId:"pw",contentVersion:"v1",publicationId:"pub"};
const md="sha256:"+crypto.createHash("sha256").update(stable(manifest)).digest("hex");
const context={candidateBinding:binding,authorityRef:"authority:1",authorityEvidenceRef:"authority-evidence:1",smartPathwayBindingEvidence:{contractVersion:"atlas.smart.pathway-binding/v1",producerId:"atlas-smart-pathway-binding",producerVersion:"1",evidenceId:"bind",checkedAt:"2026-09-28T17:00:00Z",sourceRef:"governance:bind",materialSetId:"schema-set",materialSetVersion:1,manifestDigest:md,candidateBinding:binding,authorityRef:"authority:1",authorityEvidenceRef:"authority-evidence:1"}};
context.smartPathwayBindingRef="governance:bind"; delete context.smartPathwayBindingEvidence;
const adapter={adapterId:"atlas-smart-pathway-binding-resolver",adapterVersion:"1",async resolveBindingEvidence(ref){return {contractVersion:"atlas.smart.pathway-binding/v1",producerId:"atlas-smart-pathway-binding",producerVersion:"1",evidenceId:"bind",checkedAt:"2026-09-28T17:00:00Z",sourceRef:ref,materialSetId:"schema-set",materialSetVersion:1,manifestDigest:md,candidateBinding:binding,authorityRef:"authority:1",authorityEvidenceRef:"authority-evidence:1"};}};
const output=await buildSmartPercorsiHandoff(manifest,context,adapter);
if(!validate(output)){console.error("FAIL real builder output",validate.errors);process.exit(1);}
const mutations=[];
{const x=structuredClone(output);x.candidateBinding.extra="forbidden";mutations.push(["extra binding property",x]);}
{const x=structuredClone(output);delete x.manifestDigest;mutations.push(["missing required",x]);}
mutations.push(["malformed digest",{...output,manifestDigest:"bad"}]);
mutations.push(["runtime authorized",{...output,runtimeAuthorized:true}]);
mutations.push(["q5 produced",{...output,q5Produced:true}]);
mutations.push(["foreign handoff state",{...output,handoffState:"PUBLISHED"}]);
for(const [name,x] of mutations){if(validate(x)){console.error("FAIL schema accepted",name);process.exit(1);}}
console.log(`SMART-PERCORSI HANDOFF SCHEMA: PASS — real output valid; ${mutations.length} invalid mutations rejected`);
