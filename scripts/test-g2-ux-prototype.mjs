import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.ATLAS_URL ?? 'http://127.0.0.1:3000';
const url = `${base}/percorsi/lab/pw-missing-information-01`;
const browser = await chromium.launch({headless:true});
const evidence=[];
const assert=(ok,label)=>{if(!ok)throw new Error(label);evidence.push(`PASS ${label}`)};

async function tabUntil(page,predicate,max=20){
 for(let i=0;i<max;i++){
  await page.keyboard.press('Tab');
  if(await predicate()) return i+1;
 }
 return 0;
}

async function run(viewport, grammar){
 const page=await browser.newPage({viewportSize:viewport});
 await page.goto(url,{waitUntil:'networkidle'});
 assert((await page.getByText('PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI').count())===1,`${grammar} governance visible`);
 assert((await page.getByText(/Tappa \d+ di \d+/).count())===0,`${grammar} no false linear progress`);
 assert((await page.getByText(/^S\d/).count())===0,`${grammar} no technical scene id`);
 if(grammar==='N') await page.getByLabel('Narrativo').check();
 const start=await page.locator('main').getAttribute('data-session');
 const radios=page.locator('.pathwayScene__options input[type=radio]');
 const continueButton=page.getByRole('button',{name:'Continua'});
 assert((await radios.count())===2,`${grammar} choices use native radio semantics`);
 assert(await continueButton.isDisabled(),`${grammar} Continue disabled before a choice`);
 assert((await page.getByRole('button',{name:'Nuovo percorso'}).count())===0,`${grammar} no disruptive reset action during active scene`);

 // Critical H2 regression: reproduce a human keyboard path from the document,
 // never injecting focus with locator.focus().
 await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement) document.activeElement.blur()});
 const reachedRadio=await tabUntil(page,async()=>await radios.first().evaluate(el=>el===document.activeElement));
 assert(reachedRadio>0,`${grammar} real Tab traversal reaches first radio from document`);
 await page.keyboard.press('Space');
 assert(await radios.first().isChecked(),`${grammar} Space selects focused radio after real Tab traversal`);
 assert((await page.locator('[role=status]').innerText()).length>20,`${grammar} announced feedback region`);
 assert(!(await continueButton.isDisabled()),`${grammar} Continue enabled after keyboard choice`);
 await page.keyboard.press('ArrowDown');
 assert(await radios.nth(1).evaluate(el=>el===document.activeElement),`${grammar} ArrowDown moves focus inside radio group after real traversal`);
 assert(await radios.nth(1).isChecked(),`${grammar} ArrowDown changes native radio selection`);
 await page.keyboard.press('Tab');
 assert(await continueButton.evaluate(el=>el===document.activeElement),`${grammar} Tab exits radio group to Continue`);
 await continueButton.press('Enter');
 assert(await page.getByRole('heading',{level:2}).evaluate(el=>el===document.activeElement),`${grammar} focus moves to new scene heading`);

 const sceneRadios=page.locator('.pathwayScene__options input[type=radio]'); await sceneRadios.first().check(); await page.getByRole('button',{name:'Continua'}).click();
 assert((await page.getByRole('heading',{name:/nuovo contesto|nuova decisione/i}).count())===1,`${grammar} reaches transfer scene`);
 await page.locator('.pathwayScene__options input[type=radio]').first().check(); await page.getByRole('button',{name:'Continua'}).click();
 assert((await page.getByRole('heading',{name:'Hai completato il percorso'}).count())===1,`${grammar} explicit terminal`);
 assert((await page.getByRole('link',{name:'Esci'}).count())===1 && (await page.getByRole('button',{name:'Nuovo percorso'}).count())===1,`${grammar} exit and new session distinct at terminal`);
 await page.getByRole('button',{name:'Nuovo percorso'}).click();
 const fresh=await page.locator('main').getAttribute('data-session'); assert(fresh!==start,`${grammar} deterministic fresh session`);
 assert((await page.getByRole('heading',{name:/Quale informazione manca|Due materiali sul tavolo/}).count())===1,`${grammar} reset to entry`);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth); assert(!overflow,`${grammar} no horizontal overflow ${viewport.width}px`);
 await page.close();
}

await run({width:390,height:844},'L');
await run({width:390,height:844},'N');
await run({width:1280,height:800},'L');

fs.mkdirSync('artifacts/g2-ux',{recursive:true});
fs.writeFileSync('artifacts/g2-ux/report.txt',evidence.join('\n')+'\n');
console.log(evidence.join('\n'));
await browser.close();
