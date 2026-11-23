// The P3C browser gate measures visible motion and interaction, not only WebGL.
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const base=process.env.ATLAS_P3C_URL||'http://127.0.0.1:8765/atlas-p3c/';
const dir=resolve(process.env.ATLAS_P3C_EVIDENCE_DIR||'.atlas-p3c-evidence');
mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--disable-gpu-sandbox','--enable-unsafe-swiftshader'
]});
const results=[];
async function run(variant){
 const context=await browser.newContext({viewport:{width:variant.width,height:variant.height},
    deviceScaleFactor:variant.phone?2:1,reducedMotion:variant.reduce?'reduce':'no-preference',
    hasTouch:variant.phone});
 const page=await context.newPage(),errors=[],network=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 page.on('request',r=>network.push(r.url()));
 const response=await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
 if(response?.status()!==200)throw Error('HTTP '+response?.status());
 await page.waitForFunction(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__?.ready
   ||window.__ATLAS_P3C_EXPERIENCE_TEST__?.error,null,{timeout:90000});
 const init=await page.evaluate(()=>{
   const s=window.__ATLAS_P3C_EXPERIENCE_TEST__;
   return{ready:s.ready,error:s.error,phase:s.phase,portals:s.portalCount,art:s.art,
    camera:s.camera?.name,canvas:!!document.querySelector('#stage canvas')};
 });
 if(!init.ready||init.error||init.phase!=='welcome'||init.portals!==4
    ||!init.camera?.includes('P3A')||init.art.skyApplied!==1
    ||init.art.roofApplied!==1||init.art.floorApplied!==1||!init.canvas)
   throw Error('The scene is not authentic and ready '+JSON.stringify(init));
 await page.screenshot({path:resolve(dir,'p3c-'+variant.name+'-welcome.png')});
 const initial=await page.evaluate(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.camera.position.toArray());
 if(!await page.locator('#enter').isEnabled())throw Error('No entry control');
 await page.locator('#enter').click();
 await page.waitForFunction(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.phase==='exploring',null,{timeout:30000});
 const entered=await page.evaluate(()=>{
   const s=window.__ATLAS_P3C_EXPERIENCE_TEST__,p=s.camera.position;
   return{pos:[p.x,p.y,p.z],phase:s.phase,motion:s.motion,intro:s.intro,
     navButtons:document.querySelectorAll('#destinations button').length};
 });
 if(entered.navButtons!==4||!entered.intro.completed||entered.motion.enterTransitions!==1
    ||entered.motion.poseChanges<1||entered.pos[2]>14.3)
    throw Error('The guided entry did not move the camera '+JSON.stringify(entered));
 await page.screenshot({path:resolve(dir,'p3c-'+variant.name+'-entered.png')});
 const canvas=page.locator('#stage canvas'),box=await canvas.boundingBox();
 if(!box||box.width<330||box.height<620)throw Error('Canvas too small '+JSON.stringify(box));
 const q0=await page.evaluate(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.camera.quaternion.toArray());
 if(!variant.reduce){
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.43);
    await page.mouse.down();
    await page.mouse.move(box.x+box.width*.73,box.y+box.height*.48,{steps:9});
    await page.mouse.up();
    const turned=await page.evaluate(()=>{
      const s=window.__ATLAS_P3C_EXPERIENCE_TEST__;
      return{dragUpdates:s.motion.dragUpdates,q:s.camera.quaternion.toArray()};
    });
    const dot=Math.min(1,Math.abs(turned.q.reduce((v,x,i)=>v+x*q0[i],0)));
    if(turned.dragUpdates<4||2*Math.acos(dot)<.08)throw Error('Drag did not rotate the 3D camera '+JSON.stringify(turned));
    await page.screenshot({path:resolve(dir,'p3c-'+variant.name+'-dragged.png')});
 }
 await page.locator('#reset').click();
 await page.waitForFunction(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.phase==='exploring',null,{timeout:20000});
 await page.locator('#destinations button[data-portal="esplora"]').click();
 await page.waitForFunction(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.phase==='focused',null,{timeout:20000});
 const focused=await page.evaluate(()=>{
   const s=window.__ATLAS_P3C_EXPERIENCE_TEST__;
   return{phase:s.phase,selected:s.selected,pos:s.camera.position.toArray(),
     title:document.getElementById('card-title').textContent,
     cardVisible:document.getElementById('card').dataset.visible,
     transitions:s.motion.focusTransitions};
 });
 if(focused.selected!=='esplora'||focused.cardVisible!=='true'||focused.title!=='Esplora'
    ||focused.transitions!==1||Math.abs(focused.pos[2]-entered.pos[2])<1)
    throw Error('Focus transition was not actually performed '+JSON.stringify(focused));
 await page.screenshot({path:resolve(dir,'p3c-'+variant.name+'-focused.png')});
 await page.locator('#back').click();
 await page.waitForFunction(()=>window.__ATLAS_P3C_EXPERIENCE_TEST__.phase==='exploring',null,{timeout:20000});
 const back=await page.evaluate(()=>{
   const s=window.__ATLAS_P3C_EXPERIENCE_TEST__;
   return{phase:s.phase,resets:s.motion.resetTransitions,pos:s.camera.position.toArray()};
 });
 if(back.resets<2||Math.abs(back.pos[2]-entered.pos[2])>.01)
   throw Error('Return camera not restored '+JSON.stringify(back));
 if(errors.length)throw Error('Page JS errors '+JSON.stringify(errors));
 const origin=new URL(base).origin;
 const unexpected=network.filter(u=>!u.startsWith(origin+'/')&&!u.startsWith('blob:')&&!u.startsWith('data:'));
 if(unexpected.length)throw Error('Unapproved network requests '+JSON.stringify(unexpected));
 const result={device:variant.name,viewport:variant.width+'x'+variant.height,
   before:initial,afterEntry:entered.pos,motion:entered.motion,
   touchDrag:variant.reduce?'reduced motion':true,portalFocus:focused,restored:back,
   runtimeErrors:errors,externalNetwork:unexpected};
 await context.close();return result;
}
try{
 results.push(await run({name:'desktop',width:1280,height:720,phone:false,reduce:false}));
 results.push(await run({name:'phone',width:390,height:844,phone:true,reduce:false}));
 results.push(await run({name:'reduced-motion-phone',width:390,height:844,phone:true,reduce:true}));
 const report={schema:'atlas.p3c.guided-experience/v1',realCameraMotion:true,dragOnPhone:true,
   intentionalEntry:true,focusAndReturn:true,reducedMotionSupported:true,
   realAndroidHardwareQualified:false,artApproval:false,studentContentAuthorized:false,results};
 writeFileSync(resolve(dir,'atlas-p3c-immersive-qualification.json'),JSON.stringify(report,null,2));
 console.log('ATLAS_P3C_GUIDED_ENTRY_DRAG_FOCUS_RETURN_PASS',JSON.stringify(report));
}finally{await browser.close();}
