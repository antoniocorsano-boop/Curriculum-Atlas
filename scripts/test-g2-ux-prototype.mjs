import { chromium } from 'playwright';
import fs from 'node:fs';

const base = process.env.ATLAS_URL ?? 'http://127.0.0.1:3000';
const url = `${base}/percorsi/lab/pw-missing-information-01`;
const browser = await chromium.launch({headless:true});
const evidence=[];
const assert=(ok,label)=>{if(!ok)throw new Error(label);evidence.push(`PASS ${label}`)};

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
 const first=radios.first(); await first.focus(); assert(await first.evaluate(el=>el===document.activeElement),`${grammar} radio group keyboard focusable`);
 await first.press('Space');
 assert(await first.isChecked(),`${grammar} first choice selected with keyboard`);
 assert((await page.locator('[role=status]').innerText()).length>20,`${grammar} announced feedback region`);
 assert(!(await continueButton.isDisabled()),`${grammar} Continue enabled after choice`);
 await page.keyboard.press('ArrowDown');
 const second=radios.nth(1);
 assert(await second.evaluate(el=>el===document.activeElement),`${grammar} arrow key moves within radio group`);
 assert(await second.isChecked(),`${grammar} arrow key changes native radio selection`);
 await page.keyboard.press('Tab');
 assert(await continueButton.evaluate(el=>el===document.activeElement),`${grammar} Tab leaves radio group for Continue`);
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
