import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chromium} from "playwright";
const base=process.env.BASE_URL||"http://127.0.0.1:3000";
const preview=process.env.ATLAS_GATEWAY_PREVIEW==="true";
const portfolio=JSON.parse(readFileSync("governance/percorsi-portfolio.json","utf8"));
const expected=portfolio.pathways.filter(p=>p.runtimeAuthorization==="RUNTIME_AUTHORIZED"&&p.availability==="ACTIVE"&&p.publicPath&&/^\/percorsi\/(?!lab\/?$)[a-z0-9][a-z0-9-]*\/?$/.test(p.publicPath)&&p.pathwayId&&p.title&&p.version&&p.provenanceRef);
const browser=await chromium.launch();
try{
 const page=await browser.newPage();
 const response=await page.goto(base+"/esperienze/");
 assert.equal(response.status(),200);
 const catalog=page.locator("[data-atlas-experience-catalog]");
 assert.equal(await catalog.getAttribute("data-atlas-experience-catalog"),preview?"preview":"public");
 const returnHref=await catalog.locator("[data-atlas-catalog-return]").getAttribute("href");
 assert.equal(returnHref.replace(/\/$/,"")||"/",preview?"/gateway":"/");
 const region=catalog.getByRole("region",{name:"Risultati della ricerca"});
 const links=await region.locator("a").evaluateAll(nodes=>nodes.map(n=>n.getAttribute("href").replace(/\/$/,"")).sort());
 assert.deepEqual(links,expected.map(p=>p.publicPath.replace(/\/$/,"")).sort());
 if(!expected.length)assert(await region.getByText("Non ci sono ancora esperienze autorizzate in questa sezione.").isVisible());
 const body=await catalog.innerText();
 for(const item of portfolio.pathways.filter(p=>p.runtimeAuthorization!=="RUNTIME_AUTHORIZED"))assert(!body.includes(item.title),"Unauthorized title exposed");
 assert.equal(await catalog.locator('a[href*="/lab/"]').count(),0);
 const gateway=await page.request.get(base+"/gateway/");
 assert.equal(gateway.status(),preview?200:404,"Technical gateway boundary");
 console.log("ATLAS_EXPERIENCE_ACCESS PASS "+(preview?"preview":"public"));
}finally{await browser.close();}
