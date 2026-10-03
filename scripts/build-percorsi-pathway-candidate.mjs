import fs from "node:fs";
import path from "node:path";
import {buildExperienceCandidate} from "./build-experience-candidate.mjs";
const fail=(m)=>{throw new Error(m);};
const ref=(ids,key)=>({semanticUnitIds:ids,resourceKey:key,locale:"it-IT"});
const cog=id=>({registry:"TRAMA_COGNITIVE_FUNCTIONS",registryVersion:"1",id});
function validateSeed(seed,{portfolioPath="governance/percorsi-portfolio.json"}={}){
 if(seed?.schemaVersion!=="atlas.percorsi.seed/v1") fail("invalid seed schemaVersion");
 for(const k of ["pathwayId","title","version","competence","coreStrategy","evidenceGoal","initialContext","transferContext","provenanceRef"]) if(typeof seed?.[k]!=="string"||!seed[k].trim()) fail("missing "+k);
 if(!/^pw-[a-z0-9-]+$/.test(seed.pathwayId)) fail("invalid pathwayId");
 if(!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(seed.version)) fail("invalid version");
 const allowed=new Set(["self","learning","others","problems","world","design"]);
 if(!Array.isArray(seed.territoryIds)||seed.territoryIds.length===0||new Set(seed.territoryIds).size!==seed.territoryIds.length||seed.territoryIds.some(x=>!allowed.has(x))) fail("invalid territoryIds");
 if(seed.experienceSeed){if(seed.cognitiveFunctions) fail("seed must use either cognitiveFunctions or experienceSeed");}
 else {const cf=seed.cognitiveFunctions||{};for(const k of ["orient","practice","transfer","reflect"]) if(typeof cf[k]!=="string"||!cf[k]) fail("missing cognitiveFunctions."+k);}
 let portfolio;try{portfolio=JSON.parse(fs.readFileSync(portfolioPath,"utf8"));}catch{fail("portfolio unavailable");}
 const registered=portfolio?.pathways?.find(x=>x.pathwayId===seed.pathwayId);if(!registered) fail("pathwayId not registered in backlog-zero portfolio");
 if(registered.title&&registered.title!==seed.title) fail("seed title does not match registered portfolio title");
 return seed;
}
function legacyExperienceSeed(seed){const cf=seed.cognitiveFunctions;return {schemaVersion:"atlas.experience.seed/v1",experienceId:seed.pathwayId,kernelRef:seed.pathwayId,mode:"PATHWAY",presentationGrammarRef:"branching-consequences",qualificationProfileRef:"PATHWAY_G2_PLUS_V1",runtimeStatePolicy:"VOLATILE_MEMORY",scenes:[
{id:"orient",primitive:"EXPLORE",cognitiveFunctionId:cf.orient,canonicalMeaning:seed.initialContext,interaction:{kind:"choice"},transitions:[{id:"continue",targetSceneId:"practice",label:seed.coreStrategy,feedback:seed.evidenceGoal}]},
{id:"practice",primitive:"CHOOSE",cognitiveFunctionId:cf.practice,canonicalMeaning:seed.coreStrategy,interaction:{kind:"choice"},transitions:[{id:"apply",targetSceneId:"transfer",label:seed.coreStrategy,feedback:seed.evidenceGoal}]},
{id:"transfer",primitive:"TRANSFER",cognitiveFunctionId:cf.transfer,canonicalMeaning:seed.transferContext,interaction:{kind:"choice"},transitions:[{id:"transfer-apply",targetSceneId:"reflect",label:seed.coreStrategy,feedback:seed.evidenceGoal}]},
{id:"reflect",primitive:"REFRAME",cognitiveFunctionId:cf.reflect,canonicalMeaning:`Rifletti sulla strategia: ${seed.competence}`,interaction:{kind:"terminal"},transitions:[],terminal:true}]};}
export function buildPathwayCandidate(seed,options={}){
 validateSeed(seed,options);const exp=buildExperienceCandidate(seed.experienceSeed||legacyExperienceSeed(seed));const semanticUnits=[],nodes=[];
 for(const scene of exp.sceneGraph.scenes){const nodeUnit=`u-${scene.id}`;semanticUnits.push({id:nodeUnit,kind:scene.terminal?"terminal_meaning":"question",canonicalMeaning:scene.canonicalMeaning||scene.id,provenanceRef:seed.provenanceRef});const choices=[];
  for(const tr of scene.transitions||[]){const lu=`u-${scene.id}-${tr.id}-label`,fu=`u-${scene.id}-${tr.id}-feedback`;semanticUnits.push({id:lu,kind:"choice_meaning",canonicalMeaning:tr.label||tr.id,provenanceRef:seed.provenanceRef},{id:fu,kind:"feedback_meaning",canonicalMeaning:tr.feedback||seed.evidenceGoal,provenanceRef:seed.provenanceRef});choices.push({id:tr.id,labelRef:ref([lu],`${scene.id}-${tr.id}-choice`),feedbackRef:ref([fu],`${scene.id}-${tr.id}-feedback`),targetNodeId:tr.targetSceneId});}
  nodes.push({id:scene.id,cognitiveFunction:cog(scene.cognitiveFunctionId||`experience_${scene.primitive.toLowerCase()}`),contentRef:ref([nodeUnit],scene.id),choices,cyclePolicy:{mode:"forbidden"},...(scene.terminal?{terminal:{terminalId:"done",contentRef:ref([nodeUnit],`${scene.id}-terminal`),postCompletionActions:["exit","new_session"]}}:{})});}
 const all=semanticUnits.map(x=>x.id);return {schemaVersion:"2.0",pathwayId:seed.pathwayId,version:seed.version,entryNodeId:exp.sceneGraph.entrySceneId,semanticUnits,nodes,presentationGrammars:[{id:"L",renderer:"literal",semanticCoverage:all},{id:"N",renderer:"narrative",semanticCoverage:all}],governance:{authorizationState:"NOT_RUNTIME_AUTHORIZED",learnerNetworkWrite:"forbidden",learnerTelemetry:"forbidden",localPersistence:"forbidden",allowedPresentationGrammarIds:["L","N"]},accessibilityContract:{semanticControls:true,focusManaged:true,announcedFeedback:true,notColorOnly:true,reducedMotion:true}};
}
export function buildDossier(seed){return `# ${seed.title}\n\n**Pathway:** \`${seed.pathwayId}\`  \n**Version:** ${seed.version}  \n**Factory state:** IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED\n\n## Competenza trasversale\n${seed.competence}\n\n## Strategia centrale\n${seed.coreStrategy}\n\n## Evidenza attesa\n${seed.evidenceGoal}\n\n## Contesto iniziale\n${seed.initialContext}\n\n## Trasferimento\n${seed.transferContext}\n\n## Provenienza\n${seed.provenanceRef}\n\n## Decisioni ancora umane\nQualità pedagogica, adeguatezza per età, equivalenza L/N, accessibilità assistiva e Q9.\n`;}
if(import.meta.url===`file://${process.argv[1]}`){const [seedPath,outDir]=process.argv.slice(2);if(!seedPath||!outDir){console.error("usage: node scripts/build-percorsi-pathway-candidate.mjs <seed.json> <out-dir>");process.exit(2);}try{const seed=JSON.parse(fs.readFileSync(seedPath,"utf8"));const candidate=buildPathwayCandidate(seed);fs.mkdirSync(outDir,{recursive:true});fs.writeFileSync(path.join(outDir,`${seed.pathwayId}.json`),JSON.stringify(candidate,null,2)+"\n");fs.writeFileSync(path.join(outDir,`${seed.pathwayId}.dossier.md`),buildDossier(seed));console.log(JSON.stringify({status:"PASS",pathwayId:seed.pathwayId,outDir}));}catch(e){console.error(e.message);process.exit(1);}}
