import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.ATLAS_URL ?? 'http://127.0.0.1:3000';
const url = `${base}/percorsi/lab/pw-missing-information-01`;
const browser = await chromium.launch({headless:true});
const evidence=[]; const trace=[];
const assert=(ok,label)=>{if(!ok)throw new Error(label);evidence.push(`PASS ${label}`)};

async function snapshot(page,label){
 const state=await page.evaluate(()=>{const a=document.activeElement;return {tag:a?.tagName??null,type:a instanceof HTMLInputElement?a.type:null,name:a?.getAttribute('name')??null,value:a instanceof HTMLInputElement?a.value:null,checked:a instanceof HTMLInputElement?a.checked:null,disabled:a instanceof HTMLButtonElement?a.disabled:null,text:(a?.textContent??'').trim().slice(0,120),scrollY:window.scrollY}});
 trace.push({label,...state}); return state;
}
async function tabUntil(page,predicate,max=20){for(let i=0;i<max;i++){await page.keyboard.press('Tab');await snapshot(page,`tab-${i+1}`);if(await predicate())return i+1}return 0}

async function run(viewport, grammar){
 const page=await browser.newPage({viewportSize:viewport}); await page.goto(url,{waitUntil:'networkidle'}); trace.push({case:`${grammar}-${viewport.width}x${viewport.height}`,url:page.url()});
 assert((await page.getByText('PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI').count())===1,`${grammar} governance visible`); assert((await page.getByText(/Tappa \d+ di \d+/).count())===0,`${grammar} no false linear progress`); assert((await page.getByText(/^S\d/).count())===0,`${grammar} no technical scene id`);
 if(grammar==='N') await page.getByLabel('Narrativo').check();
 const start=await page.locator('main').getAttribute('data-session'); const radios=page.locator('.pathwayScene__options input[type=radio]'); const continueButton=page.getByRole('button',{name:'Continua'});
 assert((await radios.count())===2,`${grammar} choices use native radio semantics`); assert(await continueButton.isDisabled(),`${grammar} Continue disabled before a choice`); assert((await page.getByRole('button',{name:'Nuovo percorso'}).count())===0,`${grammar} no disruptive reset action during active scene`);
 await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur()}); await snapshot(page,'start-blurred');
 const reachedRadio=await tabUntil(page,async()=>await radios.first().evaluate(el=>el===document.activeElement)); assert(reachedRadio>0,`${grammar} real Tab traversal reaches first radio from document`);
 await page.keyboard.press('Space'); await snapshot(page,'after-space'); assert(await radios.first().isChecked(),`${grammar} Space selects focused radio after real Tab traversal`); assert((await page.locator('[role=status]').innerText()).length>20,`${grammar} announced feedback region`); assert(!(await continueButton.isDisabled()),`${grammar} Continue enabled after keyboard choice`);
 const beforeArrow=await snapshot(page,'before-arrow-down'); await page.keyboard.press('ArrowDown'); const afterArrow=await snapshot(page,'after-arrow-down');
 assert(afterArrow.scrollY===beforeArrow.scrollY,`${grammar} ArrowDown does not scroll while radio owns focus`); assert(await radios.nth(1).evaluate(el=>el===document.activeElement),`${grammar} ArrowDown moves focus inside radio group after real traversal`); assert(await radios.nth(1).isChecked(),`${grammar} ArrowDown changes native radio selection`);
 await page.keyboard.press('Tab'); await snapshot(page,'after-tab-to-continue'); assert(await continueButton.evaluate(el=>el===document.activeElement),`${grammar} Tab exits radio group to Continue`); await continueButton.press('Enter'); await snapshot(page,'after-continue'); assert(await page.getByRole('heading',{level:2}).evaluate(el=>el===document.activeElement),`${grammar} focus moves to new scene heading`);
 const sceneRadios=page.locator('.pathwayScene__options input[type=radio]'); await sceneRadios.first().check(); await page.getByRole('button',{name:'Continua'}).click(); assert((await page.getByRole('heading',{name:/nuovo contesto|nuova decisione/i}).count())===1,`${grammar} reaches transfer scene`); await page.locator('.pathwayScene__options input[type=radio]').first().check(); await page.getByRole('button',{name:'Continua'}).click(); assert((await page.getByRole('heading',{name:'Hai completato il percorso'}).count())===1,`${grammar} explicit terminal`); assert((await page.getByRole('link',{name:'Esci'}).count())===1&&(await page.getByRole('button',{name:'Nuovo percorso'}).count())===1,`${grammar} exit and new session distinct at terminal`); await page.getByRole('button',{name:'Nuovo percorso'}).click(); const fresh=await page.locator('main').getAttribute('data-session'); assert(fresh!==start,`${grammar} deterministic fresh session`); assert((await page.getByRole('heading',{name:/Quale informazione manca|Due materiali sul tavolo/}).count())===1,`${grammar} reset to entry`); const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth); assert(!overflow,`${grammar} no horizontal overflow ${viewport.width}px`); await page.close();
}

await run({width:390,height:844},'L'); await run({width:390,height:844},'N'); await run({width:1280,height:800},'L');
fs.mkdirSync('artifacts/g2-ux',{recursive:true}); fs.writeFileSync('artifacts/g2-ux/report.txt',evidence.join('\n')+'\n'); fs.writeFileSync('artifacts/g2-ux/focus-trace.json',JSON.stringify(trace,null,2)+'\n'); console.log(evidence.join('\n')); console.log(JSON.stringify(trace,null,2)); await browser.close();
