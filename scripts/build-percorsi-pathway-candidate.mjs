import fs from "node:fs";
import path from "node:path";

const fail=(m)=>{throw new Error(m);};
const ref=(ids,key)=>({semanticUnitIds:ids,resourceKey:key,locale:"it-IT"});
const cog=id=>({registry:"TRAMA_COGNITIVE_FUNCTIONS",registryVersion:"1",id});

export function buildPathwayCandidate(seed){
 if(seed?.schemaVersion!=="atlas.percorsi.seed/v1") fail("invalid seed schemaVersion");
 const required=["pathwayId","title","version","competence","coreStrategy","evidenceGoal","initialContext","transferContext","provenanceRef"];
 for(const k of required) if(typeof seed[k]!=="string"||!seed[k].trim()) fail("missing "+k);
 const cf=seed.cognitiveFunctions||{};
 for(const k of ["orient","practice","transfer","reflect"]) if(!cf[k]) fail("missing cognitiveFunctions."+k);

 const semanticUnits=[
  {id:"u-orient",kind:"question",canonicalMeaning:seed.initialContext,provenanceRef:seed.provenanceRef},
  {id:"u-strategy",kind:"choice_meaning",canonicalMeaning:seed.coreStrategy,provenanceRef:seed.provenanceRef},
  {id:"u-feedback",kind:"feedback_meaning",canonicalMeaning:seed.evidenceGoal,provenanceRef:seed.provenanceRef},
  {id:"u-transfer",kind:"question",canonicalMeaning:seed.transferContext,provenanceRef:seed.provenanceRef},
  {id:"u-reflect",kind:"terminal_meaning",canonicalMeaning:`Rifletti sulla strategia: ${seed.competence}`,provenanceRef:seed.provenanceRef}
 ];
 const all=semanticUnits.map(x=>x.id);
 const nodes=[
  {id:"orient",cognitiveFunction:cog(cf.orient),contentRef:ref(["u-orient"],"orient"),cyclePolicy:{mode:"forbidden"},choices:[
   {id:"continue",labelRef:ref(["u-strategy"],"orient-choice"),feedbackRef:ref(["u-feedback"],"orient-feedback"),targetNodeId:"practice"}
  ]},
  {id:"practice",cognitiveFunction:cog(cf.practice),contentRef:ref(["u-strategy"],"practice"),cyclePolicy:{mode:"forbidden"},choices:[
   {id:"apply",labelRef:ref(["u-strategy"],"practice-choice"),feedbackRef:ref(["u-feedback"],"practice-feedback"),targetNodeId:"transfer"}
  ]},
  {id:"transfer",cognitiveFunction:cog(cf.transfer),contentRef:ref(["u-transfer"],"transfer"),cyclePolicy:{mode:"forbidden"},choices:[
   {id:"transfer-apply",labelRef:ref(["u-strategy"],"transfer-choice"),feedbackRef:ref(["u-feedback"],"transfer-feedback"),targetNodeId:"reflect"}
  ]},
  {id:"reflect",cognitiveFunction:cog(cf.reflect),contentRef:ref(["u-reflect"],"reflect"),cyclePolicy:{mode:"forbidden"},choices:[],terminal:{
   terminalId:"done",contentRef:ref(["u-reflect"],"done"),postCompletionActions:["exit","new_session"]
  }}
 ];
 return {
  schemaVersion:"2.0",pathwayId:seed.pathwayId,version:seed.version,entryNodeId:"orient",
  semanticUnits,nodes,
  presentationGrammars:[
   {id:"L",renderer:"literal",semanticCoverage:all},
   {id:"N",renderer:"narrative",semanticCoverage:all}
  ],
  governance:{
   authorizationState:"NOT_RUNTIME_AUTHORIZED",
   learnerNetworkWrite:"forbidden",
   learnerTelemetry:"forbidden",
   localPersistence:"forbidden",
   allowedPresentationGrammarIds:["L","N"]
  },
  accessibilityContract:{
   semanticControls:true,focusManaged:true,announcedFeedback:true,notColorOnly:true,reducedMotion:true
  }
 };
}

export function buildDossier(seed){
 return `# ${seed.title}\n\n**Pathway:** \`${seed.pathwayId}\`  \n**Version:** ${seed.version}  \n**Factory state:** IMPLEMENTATION_CANDIDATE / NOT_RUNTIME_AUTHORIZED\n\n## Competenza trasversale\n${seed.competence}\n\n## Strategia centrale\n${seed.coreStrategy}\n\n## Evidenza attesa\n${seed.evidenceGoal}\n\n## Contesto iniziale\n${seed.initialContext}\n\n## Trasferimento\n${seed.transferContext}\n\n## Provenienza\n${seed.provenanceRef}\n\n## Decisioni ancora umane\nQualità pedagogica, adeguatezza per età, equivalenza L/N, accessibilità assistiva e Q9.\n`;
}

if(import.meta.url===`file://${process.argv[1]}`){
 const [seedPath,outDir]=process.argv.slice(2);
 if(!seedPath||!outDir){console.error("usage: node scripts/build-percorsi-pathway-candidate.mjs <seed.json> <out-dir>");process.exit(2);}
 try{
  const seed=JSON.parse(fs.readFileSync(seedPath,"utf8"));
  const candidate=buildPathwayCandidate(seed);
  fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,`${seed.pathwayId}.json`),JSON.stringify(candidate,null,2)+"\n");
  fs.writeFileSync(path.join(outDir,`${seed.pathwayId}.dossier.md`),buildDossier(seed));
  console.log(JSON.stringify({status:"PASS",pathwayId:seed.pathwayId,outDir}));
 }catch(e){console.error(e.message);process.exit(1);}
}
