import type { ExperienceDefinition } from "../experiences/model";
const record=(x:unknown):x is Record<string,unknown>=>!!x&&typeof x==="object"&&!Array.isArray(x);
const text=(x:unknown):x is string=>typeof x==="string"&&x.trim().length>0&&x.length<=128000;
const id=(x:unknown):x is string=>typeof x==="string"&&/^[a-z][a-z0-9-]{0,63}$/.test(x);
const fail=():never=>{throw Error("AXF_SPECIALIZED_SNAPSHOT_INVALID")};
const keys=(x:Record<string,unknown>,allowed:string[])=>Object.keys(x).every(k=>allowed.includes(k));
/** F1 adapter. Explicitly invoked in review tests only; v0.1 bridge remains unchanged. */
export function specializedSnapshotToExperience(value:unknown, trustedRenderer:{rendererId:string;version:1}|undefined):ExperienceDefinition {
  if(!record(value)||!keys(value,["schemaVersion","snapshotId","packageDigest","pathwayId","version","title","description","runtimeAuthorized","studentAuthorized","scenes"])||
     value.schemaVersion!=="studio-atlas.preview-snapshot/v0.2"||value.runtimeAuthorized!==false||value.studentAuthorized!==false||
     !text(value.snapshotId)||!id(value.pathwayId)||!text(value.version)||!text(value.title)||!text(value.description)||
     typeof value.packageDigest!=="string"||!/^[a-f0-9]{64}$/.test(value.packageDigest)||
     !Array.isArray(value.scenes)||value.scenes.length<2||value.scenes.length>32||!trustedRenderer)return fail();
  const scenes=value.scenes, seen=new Set<string>();
  let specializedCount=0;
  const nodes:ExperienceDefinition["graph"]["nodes"]=scenes.map((scene,i)=>{
    if(!record(scene)||!keys(scene,["sceneId","kind","interaction","title","visibleSituation","learnerAction","consequence","nextSceneRefs","specialized"])||
       !id(scene.sceneId)||seen.has(scene.sceneId)||!text(scene.title)||!text(scene.visibleSituation)||!text(scene.learnerAction)||!text(scene.consequence)||
       !Array.isArray(scene.nextSceneRefs)||!["SPECIALIZED","SUMMARY"].includes(String(scene.interaction))||
       scene.kind!==(i===scenes.length-1?"TRANSFER":"SCENE"))return fail();
    seen.add(scene.sceneId);
    const next=scenes[i+1];
    if(next?(!record(next)||scene.nextSceneRefs.length!==1||scene.nextSceneRefs[0]!==next.sceneId):scene.nextSceneRefs.length!==0)return fail();
    const special=scene.interaction==="SPECIALIZED";
    if(special){
      specializedCount++;
      if(!next||!record(scene.specialized)||Object.keys(scene.specialized).length!==2||
        scene.specialized.rendererId!=="energy-lamp"||scene.specialized.version!==1||
        trustedRenderer.rendererId!==scene.specialized.rendererId||trustedRenderer.version!==scene.specialized.version)return fail();
    }else if(scene.specialized!==undefined)return fail();
    return {id:scene.sceneId,primitive:scene.kind==="TRANSFER"?"TRANSFER":special?"INVESTIGATE":"EXPLORE",interaction:special?"specialized":"summary",
      ...(special?{specialized:{rendererId:"energy-lamp",version:1 as const}}:{}),title:scene.title,prompt:scene.learnerAction,
      facts:[scene.visibleSituation],feedbackCategory:scene.kind==="TRANSFER"?"ALTERNATIVE_PLAUSIBLE":"EVIDENCE_INCOMPLETE",
      terminal:!next||undefined,transitions:next?[{id:special?"evidence-collected":"continue",targetNodeId:scene.nextSceneRefs[0] as string,label:"Continua",feedback:scene.consequence}]:[]};
  });
  if(specializedCount!==1)return fail();
  return {schemaVersion:"atlas.experience/v1",experienceId:"studio-axf-"+value.pathwayId,version:value.version,mode:"PATHWAY",kernelRef:"studio-atlas:"+value.packageDigest,
    qualificationProfileId:"AXF_SPECIALIZED_PREVIEW_V1",runtime:{statePolicy:"VOLATILE_MEMORY",learnerIdentityRequired:false,telemetryAllowed:false},
    presentationGrammarIds:["axf-specialized-preview"],graph:{entryNodeId:nodes[0].id,nodes}};
}
