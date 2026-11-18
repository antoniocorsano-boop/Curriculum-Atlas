// SP-07.5: actual isolated GLB on the pinned local Three.js runtime.
// Does not modify the Gateway route or imply application/publication acceptance.
import assert from "node:assert/strict";
import {chromium} from "playwright";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync} from "node:fs";
import {join,resolve} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync} from "node:child_process";
import {createHash} from "node:crypto";
import {createServer} from "node:http";

const input=resolve(process.argv[2]),out=resolve(process.argv[3]);
mkdirSync(out,{recursive:true});
const sha=b=>createHash("sha256").update(b).digest("hex");
const blob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
const readJson=p=>JSON.parse(readFileSync(p,"utf8"));
const proposal=readJson(join(input,"unified-receipt.json"));
const cyclePath=join(input,"cycle","photometric-receipt.json");
const cycle=readJson(cyclePath),glb=readFileSync(join(input,"cycle","proposal-stars.glb"));
assert.equal(proposal.status,"ADAPTIVE_PREVIEW_ONLY");
assert.equal(proposal.result,"PASS");
assert.equal(proposal.cycleReceiptSha256,sha(readFileSync(cyclePath)));
assert.deepEqual(proposal.moduleExport,cycle.moduleExport);
assert.equal(proposal.moduleExport.sha256,sha(glb));
assert.equal(proposal.moduleExport.bytes,glb.length);
assert.equal(proposal.moduleExport.primitives,3);
assert.ok(glb.length<=1048576);
for(const key of ["qualified","publishable","studentAuthorized","visualAcceptance","canonicalReviewReceipt"])assert.equal(proposal[key],false);
const stars=cycle.artEvidence.stars.map(s=>({id:s.id,center:[s.positionBlender[0],s.positionBlender[2],-s.positionBlender[1]],radius:s.radiusBound}));
assert.deepEqual(stars.map(s=>s.id),["storie","laboratori","scoperte","percorsi"]);
const temp=mkdtempSync(join(tmpdir(),"atlas-stars-webgl-"));
const results=[],details=[],failures=[];
let browser,server;
try {
  const pack=JSON.parse(execFileSync("npm",["pack","three@0.128.0","--ignore-scripts","--json","--pack-destination",temp],{encoding:"utf8"}))[0];
  const extract=path=>execFileSync("tar",["-xOf",join(temp,pack.filename),"package/"+path],{maxBuffer:8*1024*1024});
  const engine=extract("build/three.min.js"),loader=extract("examples/js/loaders/GLTFLoader.js"),license=extract("LICENSE");
  assert.equal(blob(engine),"b14f47c0908bab15e890b468d53bb07db0be3a18");
  assert.equal(blob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686");
  assert.equal(blob(license),"5303437e406ed22d8cb0b4c12398870792a25878");
  writeFileSync(join(out,"THREE-LICENSE.txt"),license);
  const html=Buffer.from('<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;overflow:hidden;background:#18232f}canvas{display:block;touch-action:none}nav{position:fixed;bottom:8px;left:0;right:0;display:flex;justify-content:center;gap:8px}button{min-height:44px;min-width:56px;font:16px system-ui;border:1px solid #b5a47e;border-radius:8px;background:#26394a;color:white;padding:0 12px}button:focus-visible{outline:3px solid white}</style></head><body><nav aria-label="Controlli di ispezione"><button id="left" aria-label="Ruota a sinistra">−</button><button id="reset">Ripristina</button><button id="right" aria-label="Ruota a destra">+</button></nav><script src="/three.js"></script><script src="/loader.js"></script></body></html>');
  const resources={"/":[html,"text/html"],"/three.js":[engine,"text/javascript"],"/loader.js":[loader,"text/javascript"],"/stars.glb":[glb,"model/gltf-binary"]};
  server=createServer((req,res)=>{if(req.url==="/favicon.ico"){res.writeHead(204);return res.end()}const item=resources[req.url];if(!item){res.writeHead(404);return res.end()}res.writeHead(200,{"Content-Type":item[1],"Cache-Control":"no-store"});res.end(item[0])});
  await new Promise(r=>server.listen(0,"127.0.0.1",r));
  const origin="http://127.0.0.1:"+server.address().port;
  browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
  async function setup(device){
    const context=await browser.newContext({viewport:{width:device.w,height:device.h},deviceScaleFactor:1,isMobile:!!device.touch,hasTouch:!!device.touch});
    const page=await context.newPage(),errors=[],external=[];
    page.on("pageerror",e=>errors.push(e.message));
    page.on("console",m=>{if(m.type()==="error")errors.push(m.text())});
    await page.route("**/*",route=>{const u=route.request().url();if(u.startsWith(origin+"/")||u.startsWith("blob:")||u.startsWith("data:"))return route.continue();external.push(u);return route.abort()});
    await page.goto(origin);
    const metrics=await page.evaluate(async({stars,expected})=>{
      const T=window.THREE;
      if(T.REVISION!=="128")throw Error("Unexpected Three.js revision");
      const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.setPixelRatio(1);renderer.setSize(innerWidth,innerHeight);renderer.outputEncoding=T.sRGBEncoding;
      renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
      document.body.insertBefore(renderer.domElement,document.body.firstChild);
      const scene=new T.Scene();scene.background=new T.Color(0x18232f);
      // Local, synthetic studio illumination. Not an assertion of Blender lighting parity.
      const studio=new T.Scene();studio.background=new T.Color(0x555c66);
      const softbox=(x,y,z,w,h,color)=>{
        const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color,side:T.DoubleSide}));
        p.position.set(x,y,z);p.lookAt(0,0,0);studio.add(p);
      };
      softbox(3,4,5,4,5,0xffffff);softbox(-4,1,2,3,5,0xc5d9ff);softbox(0,5,-4,5,3,0xffe1ae);
      const pmrem=new T.PMREMGenerator(renderer);const environment=pmrem.fromScene(studio,.05);scene.environment=environment.texture;
      scene.add(new T.HemisphereLight(0xffefd9,0x4d5c73,1.1));
      const key=new T.DirectionalLight(0xffe7c5,1.25);key.position.set(3,6,5);scene.add(key);
      const fill=new T.DirectionalLight(0xbcd9ff,.55);fill.position.set(-4,2,3);scene.add(fill);
      const start=performance.now();
      const gltf=await new T.GLTFLoader().loadAsync("/stars.glb");
      const loadMs=performance.now()-start;
      scene.add(gltf.scene);scene.updateMatrixWorld(true);
      const materials=new Set(),colored=[],coreBounds=Object.fromEntries(stars.map(s=>[s.id,new T.Box3()]));
      const counts=Object.fromEntries(stars.map(s=>[s.id,0]));
      let meshes=0,vertices=0;
      gltf.scene.traverse(o=>{
        if(!o.isMesh)return;meshes++;
        if(Array.isArray(o.material))throw Error("Unexpected multi-material mesh");
        const m=o.material,g=o.geometry,p=g.attributes.position,c=g.attributes.color;
        vertices+=p.count;materials.add(m);
        if(m.name==="Knowledge star satin orbit"){if(c)throw Error("Unexpected orbit colors");return}
        const family=m.name.replace("Knowledge finish ","");
        if(!["warm","cool"].includes(family)||!c||c.count!==p.count||!m.vertexColors)throw Error("Missing loaded vertex color binding");
        colored.push(m);
        for(let i=0;i<p.count;i++){
          const point=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
          const nearest=stars.map(s=>({s,d:point.distanceTo(new T.Vector3(...s.center))})).sort((a,b)=>a.d-b.d)[0];
          if(nearest.d>nearest.s.radius+.003)throw Error("Core outside locked envelope");
          const warm=["storie","scoperte"].includes(nearest.s.id);
          if((family==="warm")!==warm)throw Error("Core in incorrect material family");
          counts[nearest.s.id]++;coreBounds[nearest.s.id].expandByPoint(point);
          if(![c.getX(i),c.getY(i),c.getZ(i)].every(v=>Number.isFinite(v)&&v>=0&&v<=1))throw Error("Invalid decoded color");
        }
      });
      if(meshes!==3||materials.size!==3||colored.length!==2||vertices!==expected.vertices||Object.values(counts).some(n=>n<100))throw Error("Unexpected module topology");
      const bounds=new T.Box3().setFromObject(gltf.scene);
      const overall=bounds.getBoundingSphere(new T.Sphere());
      const camera=new T.PerspectiveCamera(40,innerWidth/innerHeight,.05,100);
      let target=overall.center.clone(),radius=overall.radius,angle=0;
      function position(){
        const halfV=T.MathUtils.degToRad(camera.fov/2);
        const halfH=Math.atan(Math.tan(halfV)*camera.aspect);
        const distance=radius/Math.sin(Math.min(halfV,halfH))*1.16;
        camera.position.copy(target).add(new T.Vector3(Math.sin(angle),-.16,Math.cos(angle)).normalize().multiplyScalar(distance));
        camera.lookAt(target);camera.updateMatrixWorld(true);
      }
      const gl=renderer.getContext();
      function capture(){
        position();renderer.render(scene,camera);
        const data=new Uint8Array(innerWidth*innerHeight*4);
        gl.readPixels(0,0,innerWidth,innerHeight,gl.RGBA,gl.UNSIGNED_BYTE,data);
        if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error("WebGL context error");
        return data;
      }
      function projected(box){
        const points=[];
        for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
          const q=new T.Vector3(x,y,z).project(camera);
          points.push([(q.x+1)*innerWidth/2,(q.y+1)*innerHeight/2]);
        }
        const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
        return [Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
      }
      function difference(a,b,box){
        let changed=0;
        const [x0,y0,x1,y1]=box||[0,0,innerWidth,innerHeight];
        for(let y=Math.max(0,Math.floor(y0));y<Math.min(innerHeight,Math.ceil(y1));y++)
          for(let x=Math.max(0,Math.floor(x0));x<Math.min(innerWidth,Math.ceil(x1));x++){
            const i=4*(y*innerWidth+x);
            if(Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2])>12)changed++;
          }
        return changed;
      }
      const visible=capture(),drawCalls=renderer.info.render.calls,triangles=renderer.info.render.triangles;
      const boxes=Object.fromEntries(stars.map(s=>[s.id,projected(coreBounds[s.id])]));
      for(const [id,b] of Object.entries(boxes)){
        if(b[0]<0||b[1]<0||b[2]>innerWidth||b[3]>innerHeight||b[2]-b[0]<12||b[3]-b[1]<12)throw Error("Unusable framing "+id+" "+b);
      }
      gltf.scene.visible=false;const empty=capture();gltf.scene.visible=true;
      for(const m of colored){m.vertexColors=false;m.needsUpdate=true}
      const flat=capture();
      for(const m of colored){m.vertexColors=true;m.needsUpdate=true}
      const restored=capture();
      const foreground={},colorEffect={};
      for(const [id,b] of Object.entries(boxes)){
        foreground[id]=difference(visible,empty,b);colorEffect[id]=difference(visible,flat,b);
        if(foreground[id]<40||colorEffect[id]<20)throw Error("Core not demonstrably rendered with vertex colors: "+id);
      }
      if(difference(visible,restored)>0)throw Error("Color restoration changed pixels");
      function move(a){angle=a;capture()}
      function reset(){target=overall.center.clone();radius=overall.radius;move(0)}
      document.querySelector("#left").addEventListener("click",()=>move(angle-.32));
      document.querySelector("#right").addEventListener("click",()=>move(angle+.32));
      document.querySelector("#reset").addEventListener("click",reset);
      window.atlasStars={state:()=>({angle,position:camera.position.toArray(),calls:renderer.info.render.calls}),
        focus:id=>{const s=stars.find(s=>s.id===id);target=new T.Vector3(...s.center);radius=s.radius;move(.18)},
        reset,render:()=>capture()};
      const debug=gl.getExtension("WEBGL_debug_renderer_info");
      return {loadMs,drawCalls,triangles,meshes,materials:materials.size,vertices,counts,boxes,foreground,colorEffect,canvas:[renderer.domElement.width,renderer.domElement.height],renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};
    },{stars,expected:proposal.moduleExport});
    return {context,page,errors,external,metrics};
  }
  for(const device of [{name:"small-phone",w:320,h:568,touch:true},{name:"phone",w:393,h:873,touch:true},{name:"landscape",w:873,h:393,touch:true},{name:"tablet",w:768,h:1024,touch:true},{name:"desktop",w:1440,h:1000},{name:"large-screen",w:1920,h:1080}]){
    let session;
    try{
      session=await setup(device);const {page,errors,external,metrics}=session;
      assert.equal(metrics.drawCalls,3);assert.ok(metrics.triangles>0);
      assert.deepEqual(metrics.canvas,[device.w,device.h]);
      const controls=await page.locator("nav button").evaluateAll(els=>els.map(e=>{const b=e.getBoundingClientRect();return {w:b.width,h:b.height,x:b.x,y:b.y,r:b.right,b:b.bottom,reachable:e.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2))}}));
      assert.equal(controls.length,3);
      for(const c of controls)assert.ok(c.w>=44&&c.h>=44&&c.x>=0&&c.y>=0&&c.r<=device.w&&c.b<=device.h&&c.reachable,JSON.stringify(c));
      const initial=await page.evaluate(()=>window.atlasStars.state());
      const save=async name=>{const file=device.name+"-"+name+".png";const bytes=await page.screenshot({path:join(out,file),animations:"disabled"});return {file,sha256:sha(bytes),bytes:bytes.length}};
      const front=await save("front");
      if(device.touch)await page.locator("#right").tap();else await page.locator("#right").click();
      const turned=await page.evaluate(()=>window.atlasStars.state());
      assert.ok(Math.abs(turned.angle-.32)<1e-9&&turned.position.some((v,i)=>Math.abs(v-initial.position[i])>.01));
      assert.equal(turned.calls,3);
      const rotated=await save("rotated");
      await page.locator("#reset").focus();await page.keyboard.press("Enter");
      const reset=await page.evaluate(()=>window.atlasStars.state());
      assert.equal(reset.angle,0);assert.ok(reset.position.every((v,i)=>Math.abs(v-initial.position[i])<1e-9));
      assert.equal(errors.length,0,errors.join("\n"));assert.equal(external.length,0,external.join("\n"));
      results.push({device:device.name,width:device.w,height:device.h,touch:!!device.touch,...metrics,rotation:true,keyboardReset:true,externalRequests:0,errors:0,images:[front,rotated]});
    }catch(e){failures.push({device:device.name,error:String(e)});if(session)await session.page.screenshot({path:join(out,device.name+"-failure.png")}).catch(()=>{});}
    finally{if(session)await session.context.close();}
  }
  // Close inspection of the actual exported geometry under the same WebGL lighting.
  let session;
  try{
    session=await setup({w:640,h:640});
    for(const s of stars){
      await session.page.evaluate(id=>window.atlasStars.focus(id),s.id);
      const file="detail-"+s.id+".png",b=await session.page.screenshot({path:join(out,file),animations:"disabled"});
      details.push({id:s.id,file,sha256:sha(b),bytes:b.length});
    }
    assert.equal(session.errors.length,0);assert.equal(session.external.length,0);
  }catch(e){failures.push({device:"details",error:String(e)});}
  finally{if(session)await session.context.close();}
  assert.equal(results.length+failures.filter(f=>f.device!=="details").length,6);
}finally{
  if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});
  const pass=results.length===6&&details.length===4&&failures.length===0;
  writeFileSync(join(out,"stars-webgl.json"),JSON.stringify({status:pass?"PASS":"FAIL",scope:"ISOLATED_MODULE_ONLY",engine:"r128",moduleSha256:sha(glb),proposalReceiptSha256:sha(readFileSync(join(input,"unified-receipt.json"))),candidateIdentity:proposal.candidateIdentity,changedFromCanonical:proposal.changedFromCanonical,softwareRenderer:true,fullGatewayQualified:false,artisticApproval:false,publishable:false,studentAuthorized:false,results,details,failures},null,2)+"\n");
  console.log(JSON.stringify({pass,results:results.map(r=>({device:r.device,drawCalls:r.drawCalls,vertices:r.vertices,foreground:r.foreground,colorEffect:r.colorEffect,loadMs:r.loadMs})),failures},null,2));
  assert.ok(pass,JSON.stringify(failures));
}
