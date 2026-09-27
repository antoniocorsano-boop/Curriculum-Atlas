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
 const first=page.locator('.pathwayScene__options button').first(); await first.focus(); assert(await first.evaluate(el=>el===document.activeElement),`${grammar} keyboard focusable choice`); await first.click();
 assert((await page.locator('[role=status]').innerText()).length>20,`${grammar} announced feedback region`);
 await page.getByRole('button',{name:'Continua'}).click();
 assert(await page.getByRole('heading',{level:2}).evaluate(el=>el===document.activeElement),`${grammar} focus moves to new scene heading`);
 // Branch-specific consequence then transfer.
 await page.locator('.pathwayScene__options button').first().click(); await page.getByRole('button',{name:'Continua'}).click();
 assert((await page.getByRole('heading',{name:/nuovo contesto|nuova decisione/i}).count())===1,`${grammar} reaches transfer scene`);
 await page.locator('.pathwayScene__options button').first().click(); await page.getByRole('button',{name:'Continua'}).click();
 assert((await page.getByRole('heading',{name:'Hai completato il percorso'}).count())===1,`${grammar} explicit terminal`);
 assert((await page.getByRole('link',{name:'Esci'}).count())===1 && (await page.getByRole('button',{name:'Nuovo percorso'}).count())===1,`${grammar} exit and new session distinct`);
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
