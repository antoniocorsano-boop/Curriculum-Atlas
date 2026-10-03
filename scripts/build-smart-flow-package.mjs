import fs from "node:fs";
import path from "node:path";

const stageKeys=Array.from({length:11},(_,i)=>`F${i}`);
const nonEmpty=x=>typeof x==="string"&&x.trim().length>0;
const read=(root,ref)=>JSON.parse(fs.readFileSync(path.resolve(root,ref),"utf8"));
const requiredResolved=r=>Boolean(r.publicRef&&r.provenanceRef&&r.digest&&r.publicationReceiptRef&&((r.audience!=="STUDENT"&&r.audience!=="BOTH")||r.anonymousReachabilityVerified===true));

function validateIntent(intent){const e=[];if(intent?.schemaVersion!=="atlas.smart.intent/v1")e.push("intent.schemaVersion");for(const k of ["intentId","activityId","topic","sourceRef"])if(!nonEmpty(intent?.[k]))e.push("intent."+k);if(!["NEW_ACTIVITY","ADD_MATERIAL","REPLACE_MATERIAL","MATERIAL_ONLY"].includes(intent?.requestType))e.push("intent.requestType");if(!Array.isArray(intent?.audience)||!intent.audience.length)e.push("intent.audience");if(!Array.isArray(intent?.useModes)||!intent.useModes.length)e.push("intent.useModes");return e;}
function validatePlan(plan,intent){const e=[];if(plan?.schemaVersion!=="atlas.smart.plan/v1")e.push("plan.schemaVersion");for(const k of ["planId","intentRef","activityId","objective"])if(!nonEmpty(plan?.[k]))e.push("plan."+k);if(plan?.activityId!==intent?.activityId)e.push("plan.activityId");if(!Array.isArray(plan?.materialNeeds))e.push("plan.materialNeeds");return e;}

export function deriveSmartFlowStages({intent,plan,experience,materialSet}){
 const required=(materialSet?.resources||[]).filter(r=>r.required===true);
 const registered=required.length>0&&required.every(r=>/^sha256:[a-f0-9]{64}$/.test(r.digest||"")&&Number.isInteger(r.byteSize)&&Boolean(r.provenanceRef));
 const published=required.length>0&&required.every(requiredResolved);
 const packageReady=materialSet?.readiness?.packageReady===true&&published;
 const linked=experience?.materialSetRef===undefined||experience.materialSetRef===materialSet?.materialSetId||experience.materialSetRef===materialSet?.materialSetRef;
 const runtimeAuthorized=materialSet?.crossSystem?.runtimeAdapterAuthorized===true;
 const f9=published&&packageReady;
 const teacherStatus=!registered?"Da rivedere":!published||!packageReady?"Da completare":!f9?"Da verificare":"Pronto";
 return {
  F0:{state:"PASS",output:"SmartActivityIntent"},
  F1:{state:"PASS",output:"SmartActivityPlan"},
  F2:{state:"PASS",output:"AssetCandidate[]"},
  F3:{state:"PASS",output:"MaterialSet draft"},
  F4:{state:registered?"PASS":"FAIL",output:"AssetRecord[]"},
  F5:{state:published?"PASS":"PENDING",output:"AssetPublicationReceipt[]"},
  F6:{state:packageReady?"PASS":"BLOCKED",output:"MaterialSet readiness"},
  F7:{state:linked?"PASS":"FAIL",output:"SmartActivity binding"},
  F8:{state:runtimeAuthorized?"PASS":"DEFERRED_NOT_AUTHORIZED",output:"LessonPreparation projection"},
  F9:{state:f9?"PASS":"PENDING",output:"SMART_FAST_V1 evidence"},
  F10:{state:teacherStatus==="Pronto"?"PASS":"ACTION_REQUIRED",teacherStatus}
 };
}

export function buildSmartFlowPackage({intent,plan,experience,materialSet,refs,qualificationProfileRef="SMART_FAST_V1"}){
 const stages=deriveSmartFlowStages({intent,plan,experience,materialSet});
 return {schemaVersion:"atlas.smart.flow-package/v1",activityId:intent.activityId,intentRef:refs.intentRef,planRef:refs.planRef,experienceRef:refs.experienceRef,materialSetRef:refs.materialSetRef,qualificationProfileRef,stages};
}

export function validateSmartFlowPackage(flow,{root=process.cwd()}={}){
 const errors=[];
 if(flow?.schemaVersion!=="atlas.smart.flow-package/v1")errors.push("flow.schemaVersion");
 if(flow?.qualificationProfileRef!=="SMART_FAST_V1")errors.push("flow.qualificationProfileRef");
 for(const key of ["activityId","intentRef","planRef","experienceRef","materialSetRef"])if(!nonEmpty(flow?.[key]))errors.push("flow."+key);
 if(!flow?.stages||stageKeys.some(k=>!Object.hasOwn(flow.stages,k))||Object.keys(flow.stages).join("|")!==stageKeys.join("|"))errors.push("flow.stages");
 let intent,plan,experience,materialSet;
 try{intent=read(root,flow.intentRef);plan=read(root,flow.planRef);experience=read(root,flow.experienceRef);materialSet=read(root,flow.materialSetRef);}catch(e){errors.push("flow.refs:"+e.message);return {valid:false,errors};}
 errors.push(...validateIntent(intent),...validatePlan(plan,intent));
 if(flow.activityId!==intent.activityId)errors.push("flow.activityId");
 if(experience?.schema!=="atlas.experience/v1"||experience?.mode!=="SMART")errors.push("experience");
 if(materialSet?.schemaVersion!=="atlas.smart.materialset/v1")errors.push("materialSet");
 const expected=buildSmartFlowPackage({intent,plan,experience,materialSet,refs:{intentRef:flow.intentRef,planRef:flow.planRef,experienceRef:flow.experienceRef,materialSetRef:flow.materialSetRef},qualificationProfileRef:flow.qualificationProfileRef});
 for(const k of stageKeys)if(JSON.stringify(flow.stages?.[k])!==JSON.stringify(expected.stages[k]))errors.push(`stage.${k}`);
 return {valid:errors.length===0,errors};
}
