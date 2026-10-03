import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.ATLAS_URL ?? "http://127.0.0.1:3000";
const url = `${base}/percorsi/lab/pw-missing-information-01`;
const browser = await chromium.launch({headless:true});
const evidence=[]; const trace=[];
const assert=(ok,label)=>{if(!ok)throw new Error(label);evidence.push(`PASS ${label}`)};
function persist(){fs.mkdirSync("artifacts/g2-ux",{recursive:true});fs.writeFileSync("artifacts/g2-ux/report.txt",evidence.join("\n")+"\n");fs.writeFileSync("artifacts/g2-ux/focus-trace.json",JSON.stringify(trace,null,2)+"\n")}
async function snapshot(page,label){const state=await page.evaluate(()=>{const a=document.activeElement;return {tag:a?.tagName??null,type:a instanceof HTMLInputElement?a.type:null,name:a?.getAttribute("name")??null,value:a instanceof HTMLInputElement?a.value:null,checked:a instanceof HTMLInputElement?a.checked:null,disabled:a instanceof HTMLButtonElement?a.disabled:null,text:(a?.textContent??"").trim().slice(0,120),scrollY:window.scrollY}});trace.push({label,...state});return state}
async function tabUntil(page,predicate,max=24){for(let i=0;i<max;i++){await page.keyboard.press("Tab");await snapshot(page,`tab-${i+1}`);if(await predicate())return i+1}return 0}

async function chooseAndContinue(page,label){
  const runtime=page.locator(".experience-runtime");
  await runtime.getByRole("radio",{name:label}).check();
  await runtime.getByRole("button",{name:"Continua"}).click();
}

async function run(viewport,grammar){
 const page=await browser.newPage({viewportSize:viewport});
 await page.goto(url,{waitUntil:"networkidle"});
 trace.push({case:`${grammar}-${viewport.width}x${viewport.height}`,url:page.url()});

 assert((await page.getByText("PROTOTIPO · NON AUTORIZZATO AGLI STUDENTI").count())===1,`${grammar} governance visible`);
 assert((await page.getByText(/Tappa \d+ di \d+/).count())===0,`${grammar} no false linear progress`);
 assert((await page.getByText(/^S\d/).count())===0,`${grammar} no technical scene id`);

 if(grammar==="N") await page.getByLabel("Narrativo").check();

 const runtime=page.locator(".experience-runtime");
 const start=await runtime.getAttribute("data-session");
 assert((await runtime.getByRole("heading",{name:grammar==="N"?"Il punto di partenza":"Una decisione da prendere"}).count())===1,`${grammar} authored orientation visible`);
 assert((await page.getByRole("button",{name:"Nuovo percorso"}).count())===0,`${grammar} no disruptive reset action during active scene`);

 // S1 is orientation, not a fake choice. Continue deliberately to the first decision.
 const orientContinue=runtime.getByRole("button",{name:"Continua"});
 assert(!(await orientContinue.isDisabled()),`${grammar} orientation can advance without fake answer`);
 await orientContinue.click();
 assert(await runtime.getByRole("heading",{name:grammar==="N"?"Un vuoto nella mappa":"Che cosa manca?"}).evaluate(el=>el===document.activeElement),`${grammar} focus moves to missing-information scene`);

 const radios=runtime.getByRole("radio");
 const continueButton=runtime.getByRole("button",{name:"Continua"});
 assert((await radios.count())===3,`${grammar} missing-information choices use native radio semantics`);
 assert(await continueButton.isDisabled(),`${grammar} Continue disabled before a choice`);

 await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur()});
 await snapshot(page,"decision-blurred");
 const reachedRadio=await tabUntil(page,async()=>await radios.first().evaluate(el=>el===document.activeElement));
 assert(reachedRadio>0,`${grammar} real Tab traversal reaches first radio`);
 await page.keyboard.press("Space");
 assert(await radios.first().isChecked(),`${grammar} Space selects focused radio`);
 assert((await page.locator("[role=status]").last().innerText()).length>20,`${grammar} announced feedback region`);
 assert(!(await continueButton.isDisabled()),`${grammar} Continue enabled after keyboard choice`);

 await page.keyboard.press("ArrowDown");
 assert(await radios.nth(1).evaluate(el=>el===document.activeElement),`${grammar} ArrowDown moves within native radio group`);
 assert(await radios.nth(1).isChecked(),`${grammar} ArrowDown changes selection`);
 await page.keyboard.press("Tab");
 assert(await continueButton.evaluate(el=>el===document.activeElement),`${grammar} Tab exits radio group to Continue`);
 await continueButton.press("Enter");
 const title = (literal, narrative) => grammar === "N" ? narrative : literal;
 assert(await runtime.getByRole("heading",{name:title("Come decidere?","Tre strade possibili")}).evaluate(el=>el===document.activeElement),`${grammar} focus moves to strategy-choice scene`);

 await chooseAndContinue(page,"Controllare prima le risorse disponibili");
 assert((await runtime.getByRole("heading",{name:title("Osserva la conseguenza","Guarda dove porta la scelta")}).count())===1,`${grammar} consequence scene reached`);
 await runtime.getByRole("button",{name:"Continua"}).click();

 assert((await runtime.getByRole("heading",{name:title("Puoi rivedere la scelta","Puoi tornare all’incrocio")}).count())===1,`${grammar} revision scene reached`);
 await chooseAndContinue(page,"Tengo la scelta");

 assert((await runtime.getByRole("heading",{name:title("Diamo un nome alla strategia","Hai trovato uno strumento")}).count())===1,`${grammar} strategy recognition reached`);
 await chooseAndContinue(page,"Individuare il dato mancante e controllarlo prima di decidere");

 assert((await runtime.getByRole("heading",{name:title("Una situazione diversa","La strada cambia, la strategia resta?")}).count())===1,`${grammar} changed context reached`);
 await chooseAndContinue(page,"Sì: prima controllo ciò che è disponibile");

 assert((await runtime.getByRole("heading",{name:title("Controllare una fonte","Un altro tipo di indizio")}).count())===1,`${grammar} transfer probe reached`);
 await chooseAndContinue(page,"Quali prove e fonti sostengono le informazioni");

 assert((await runtime.getByRole("heading",{name:title("La strategia resta tua","Che cosa vuoi portare con te?")}).count())===1,`${grammar} explicit terminal trace-control scene`);
 assert((await page.getByRole("link",{name:"Esci"}).count())===1&&(await page.getByRole("button",{name:"Nuovo percorso"}).count())===1,`${grammar} exit and new session distinct at terminal`);

 await page.getByRole("button",{name:"Nuovo percorso"}).click();
 const fresh=await runtime.getAttribute("data-session");
 assert(fresh!==start,`${grammar} deterministic fresh session`);
 assert((await runtime.getByRole("heading",{name:grammar==="N"?"Il punto di partenza":"Una decisione da prendere"}).count())===1,`${grammar} reset to authored entry`);

 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth);
 assert(!overflow,`${grammar} no horizontal overflow ${viewport.width}px`);
 await page.close();
}

try{
 await run({width:390,height:844},"L");
 await run({width:390,height:844},"N");
 await run({width:1280,height:800},"L");
}finally{
 persist();
 console.log(evidence.join("\n"));
 console.log(JSON.stringify(trace,null,2));
 await browser.close();
}
