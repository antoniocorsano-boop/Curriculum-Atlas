// Real Chromium qualification of Atlas P2C, isolated on 127.0.0.1.
// Never opens an external destination, publishes a page or uses student data.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const base=process.env.ATLAS_P2C_PREVIEW_URL||'http://127.0.0.1:8765/';
const out=resolve(process.env.ATLAS_P2C_EVIDENCE_DIR||'.atlas-p2c-evidence');
mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:[
 '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
 '--disable-gpu-sandbox','--enable-unsafe-swiftshader'
]});
const results=[];
try{
 for(const variant of [{name:'desktop',width:1280,height:720},
                        {name:'phone',width:390,height:844}]){
   const page=await browser.newPage({
     viewport:{width:variant.width,height:variant.height},
     deviceScaleFactor:variant.name==='phone'?2:1,reducedMotion:'reduce'
   });
   const logs=[],errors=[];
   page.on('console',m=>logs.push(m.type()+': '+m.text()));
   page.on('pageerror',e=>errors.push(e.message));
   const requests=[];
   page.on('request',r=>requests.push(new URL(r.url()).pathname));
   await page.goto(base,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.__ATLAS_P2C_PRIVATE_TEST__?.ready ||
     window.__ATLAS_P2C_PRIVATE_TEST__?.error,{timeout:60000});
   const state=await page.evaluate(()=>{
     const s=window.__ATLAS_P2C_PRIVATE_TEST__;
     return {ready:s.ready,error:s.error,portalCount:s.portalCount,
       camera:s.camera?.name,canvas:!!document.querySelector('canvas')};
   });
   if(!state.ready||state.portalCount!==4||state.camera!=='CAM_HERO_ARCH04'||!state.canvas){
     throw Error(variant.name+' failed to display genuine GLB: '+JSON.stringify({state,logs,errors}));
   }
   // Screenshot before interaction; otherwise the notice obscures the podium.
   await page.screenshot({path:resolve(out,'p2c-'+variant.name+'-chromium.png'),fullPage:true});
   const expected=['curricolo','esplora','percorsi','esperienze'];
   const intents=[];
   await page.evaluate(()=>{
     window.__ATLAS_P2C_INTENTS__=[];
     window.addEventListener('atlas-p2c-intent',e=>window.__ATLAS_P2C_INTENTS__.push(e.detail));
   });
   for(const id of expected){
     await page.locator('footer button[data-portal="'+id+'"]').click();
     intents.push(await page.evaluate(()=>window.__ATLAS_P2C_INTENTS__.at(-1)));
   }
   if(intents.map(x=>x?.id).join(',')!==expected.join(','))
     throw Error('Four accessible portal actions absent '+JSON.stringify(intents));
   if(intents.some(x=>x.href!=='/'+x.id+'/'))
     throw Error('Portal routes not canonical '+JSON.stringify(intents));
   const buttons=await page.locator('footer button').count();
   const canvas=await page.locator('canvas').boundingBox();
   if(buttons!==4||!canvas||canvas.width<350||canvas.height<650)
     throw Error('Viewport inaccessible '+JSON.stringify({buttons,canvas}));
   // Real 3D raycast, not merely the accessible text button contract.
   // The point is computed from the mesh's actual 3D bounding box.
   const panelHits=[];
   for(const id of expected){
      const hit=await page.evaluate(id=>{
        const s=window.__ATLAS_P2C_PRIVATE_TEST__;
        let mesh=null;
        s.scene.traverse(o=>{
          if(o.isMesh&&o.userData?.atlas_portal_id===id&&o.userData?.atlas_hit_target)mesh=o;
        });
        if(!mesh)return {error:'missing semantic pane '+id};
        const rect=s.renderer.domElement.getBoundingClientRect();
        const c=new THREE.Box3().setFromObject(mesh).getCenter().project(s.camera);
        const x=rect.left+(c.x+1)*rect.width/2,y=rect.top+(1-c.y)*rect.height/2;
        if(!Number.isFinite(x)||!Number.isFinite(y))return {error:'invalid projected geometry '+id};
        const count=window.__ATLAS_P2C_INTENTS__.length;
        s.renderer.domElement.dispatchEvent(new PointerEvent('pointerup',
            {bubbles:true,pointerType:'mouse',button:0,clientX:x,clientY:y}));
        const e=window.__ATLAS_P2C_INTENTS__[count];
        return {id,expectedRoute:'/'+id+'/',x,y,actual:e||null};
      },id);
      panelHits.push(hit);
   }
   if(panelHits.some(x=>x.error||x.actual?.id!==x.id||x.actual?.origin!=='pannello-3d'))
      throw Error('3D portal raycast not qualified: '+JSON.stringify(panelHits));
   await page.screenshot({path:resolve(out,'p2c-'+variant.name+'-interaction.png'),fullPage:true});
   results.push({device:variant.name,viewport:variant.width+'x'+variant.height,
     loaded:true,portalCount:state.portalCount,camera:state.camera,
     accessibleButtons:buttons,canonicalIntents:intents,actualThreeDimensionalPanelClicks:panelHits,
     requestPaths:[...new Set(requests)],runtimeErrors:errors});
   await page.close();
 }
 const report={schema:'atlas.p2c.chromium-private-preview/v1',
   webglGenuineModelVisible:true,desktopAndPhone:true,
   fourCanonicalPortalActions:true,
   studentAuthorized:false,published:false,results};
 writeFileSync(resolve(out,'p2c-browser-report.json'),JSON.stringify(report,null,2));
 console.log('ATLAS_P2C_CHROMIUM_DESKTOP_PHONE_4_PORTALS_PASS',JSON.stringify(report));
}finally{await browser.close();}
