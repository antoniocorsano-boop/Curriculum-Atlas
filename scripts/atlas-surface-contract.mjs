// Distinct surface contracts: the entrance is not the content shell.
import assert from "node:assert/strict";
export async function verifyGateway(page,base){
  const gateway=page.locator('[data-atlas-surface="gateway"]');
  assert.equal(await gateway.count(),1,"Missing gateway surface");
  assert.equal(await gateway.locator("[data-atlas-public]").isVisible(),true,"Public context must be visible");
  const routes=await gateway.locator("nav a").evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length>0&&getComputedStyle(n).visibility==="visible").map(n=>{
    const r=n.getBoundingClientRect();return {href:n.getAttribute("href").replace(/\/$/,""),name:n.getAttribute("aria-label"),w:r.width,h:r.height,left:r.left,right:r.right,top:r.top,bottom:r.bottom,viewport:innerWidth,height:innerHeight};
  }));
  const expectedRoutes=["/curricolo","/esplora","/esperienze","/percorsi"];
  assert.deepEqual(routes.map(x=>x.href).sort(),expectedRoutes.sort(),"Gateway destinations differ from the required routes");
  for(const r of routes){
    assert(r.name&&r.w>=44&&r.h>=44&&r.left>=-1&&r.right<=r.viewport+1&&r.top>=-1&&r.bottom<=r.height+1,"Unusable gateway portal "+JSON.stringify(r));
    const response=await page.request.get(base+r.href+"/");assert(response.ok(),"Gateway route unavailable "+r.href+" HTTP "+response.status());
  }
  const entry=gateway.getByRole("link",{name:/Entra in Atlas/});
  assert(await entry.isVisible(),"Missing entrance action");
  const box=await entry.boundingBox();assert(box&&box.width>=44&&box.height>=44,"Entrance target too small");
  assert.match(await entry.getAttribute("href"),/^\/esplora\/?$/);
}
