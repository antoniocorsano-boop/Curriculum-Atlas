import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [src,out,enginePath]=process.argv.slice(2).map(p=>resolve(p));
const sha=b=>createHash("sha256").update(b).digest("hex");
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const bindingRaw=readFileSync(join(src,"surface-binding.json")),texture=readFileSync(join(src,"binding.rgba32f"));
const oracleRaw=readFileSync(join(out,"context-oracle.json")),occ=readFileSync(join(out,"occluders.f32"));
const b=JSON.parse(bindingRaw),o=JSON.parse(oracleRaw);
assert.equal(o.revision,process.env.ATLAS_EXACT_HEAD);
assert.equal(o.bindingSha256,sha(bindingRaw));assert.equal(o.textureSha256,sha(texture));
assert.equal(o.occluderSha256,sha(occ));assert.equal(occ.length,o.occluderTriangles*36);
assert.equal(o.sourceRevision,b.revision);
const script=String.raw`
(async()=>{
 const T=window.THREE,check=(x,m)=>{if(!x)throw Error(m);};
 const json=async u=>{const r=await fetch(u);check(r.ok,u);return r.json();};
 const floats=async u=>{const r=await fetch(u);check(r.ok,u);return new Float32Array(await r.arrayBuffer());};
 const b=await json("/binding"),o=await json("/oracle"),data=await floats("/texture"),occ=await floats("/occluders");
 check(T.REVISION==="128","engine revision");
 check(new Uint8Array(new Uint32Array([1]).buffer)[0]===1,"little endian");
 const {width:w,height:h}=b.camera,tw=b.texture.width,th=b.texture.height;
 const canvas=document.createElement("canvas");document.body.appendChild(canvas);
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,preserveDrawingBuffer:true});
 check(gl&&gl.getExtension("EXT_color_buffer_float"),"float WebGL2");
 const renderer=new T.WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(w,h,false);renderer.toneMapping=T.NoToneMapping;renderer.outputEncoding=T.LinearEncoding;
 const matrix=a=>new T.Matrix4().set(...a.flat());
 const camera=new T.Camera();camera.matrixAutoUpdate=false;
 camera.matrix.copy(matrix(b.camera.world));camera.matrixWorld.copy(camera.matrix);
 camera.matrixWorldInverse.copy(matrix(b.camera.view));camera.projectionMatrix.copy(matrix(b.camera.projection));
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 const geo=new T.BufferGeometry();
 geo.setAttribute("position",new T.Float32BufferAttribute(b.positions.flat(),3));
 geo.setAttribute("uv",new T.Float32BufferAttribute(b.uv.flat(),2));
 const cg=new T.BufferGeometry();cg.setAttribute("position",new T.BufferAttribute(occ,3));
 const scene=new T.Scene();
 const vertex="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
 const uvMat=new T.ShaderMaterial({side:T.DoubleSide,vertexShader:vertex,fragmentShader:"varying vec2 vUv;void main(){gl_FragColor=vec4(vUv,1.0,1.0);}"});
 const occMat=new T.ShaderMaterial({side:T.DoubleSide,vertexShader:"void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"void main(){gl_FragColor=vec4(0.0,0.0,0.5,1.0);}"});
 const mesh=new T.Mesh(geo,uvMat),context=new T.Mesh(cg,occMat);scene.add(mesh,context);
 const rt=new T.WebGLRenderTarget(w,h,{type:T.FloatType,format:T.RGBAFormat,depthBuffer:true,stencilBuffer:false,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
 rt.texture.encoding=T.LinearEncoding;
 renderer.setClearColor(0,0);renderer.setRenderTarget(rt);renderer.render(scene,camera);
 check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"float framebuffer");
 const mask=new Float32Array(w*h*4);renderer.readRenderTargetPixels(rt,0,0,w,h,mask);
 check(gl.getError()===gl.NO_ERROR,"mask readback");
 const tex=new T.DataTexture(data,tw,th,T.RGBAFormat,T.FloatType);tex.encoding=T.LinearEncoding;tex.flipY=false;tex.generateMipmaps=false;tex.minFilter=T.NearestFilter;tex.magFilter=T.NearestFilter;tex.needsUpdate=true;
 const mat=new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide});
 const black=new T.MeshBasicMaterial({color:0x000000,toneMapped:false,side:T.DoubleSide});
 mesh.material=mat;context.material=black;renderer.render(scene,camera);
 const pixels=new Float32Array(w*h*4);renderer.readRenderTargetPixels(rt,0,0,w,h,pixels);
 check(gl.getError()===gl.NO_ERROR,"color readback");
 const expectedChart=new Float32Array(o.samples.length*4),actualChart=new Float32Array(o.samples.length*4);
 const metrics={stable:0,stableTarget:0,stableOccluder:0,stableBackground:0,unstable:0,badVisibility:0,testedUV:0,badUV:0,maxUV:0,testedColor:0,badColor:0,maxColor:0};
 const mismatches=[];
 for(let i=0;i<o.samples.length;i++){
   const s=o.samples[i],k=(s.y*w+s.x)*4;
   expectedChart[4*i+3]=actualChart[4*i+3]=1;
   if(!s.stable){metrics.unstable++;continue;}
   metrics.stable++;
   metrics["stable"+s.kind[0].toUpperCase()+s.kind.slice(1)]++;
   const actual=mask[k+2]>.75?"target":mask[k+2]>.25?"occluder":"background";
   if(actual!==s.kind){metrics.badVisibility++;if(mismatches.length<20)mismatches.push({x:s.x,y:s.y,expected:s.kind,actual});}
   if(!s.stableUV)continue;
   metrics.testedUV++;
   const [u,v]=s.uv;
   const delta=Math.max(Math.abs(u-mask[k]),Math.abs(v-mask[k+1]));
   metrics.maxUV=Math.max(metrics.maxUV,delta);
   if(actual!=="target"||!Number.isFinite(delta)||delta>2e-4)metrics.badUV++;
   const sx=u*tw,sy=v*th;
   if(Math.abs(sx-Math.round(sx))<.2||Math.abs(sy-Math.round(sy))<.2)continue;
   const j=(Math.max(0,Math.min(th-1,Math.floor(sy)))*tw+Math.max(0,Math.min(tw-1,Math.floor(sx))))*4;
   metrics.testedColor++;let bad=false;
   for(let ch=0;ch<3;ch++){
     const expected=data[j+ch],got=pixels[k+ch],e=Math.abs(expected-got);
     expectedChart[i*4+ch]=expected;actualChart[i*4+ch]=got;
     metrics.maxColor=Math.max(metrics.maxColor,e);
     if(!Number.isFinite(e)||e>2e-6+2e-6*Math.abs(expected))bad=true;
   }
   if(bad)metrics.badColor++;
 }
 window.__metrics=metrics;window.__mismatches=mismatches;
 check(metrics.stableTarget>=100&&metrics.stableOccluder>=100&&metrics.testedUV>=100&&metrics.testedColor>=50,"sample coverage");
 check(metrics.badVisibility===0&&metrics.badUV===0&&metrics.badColor===0,"context mismatch "+JSON.stringify(metrics)+" "+JSON.stringify(mismatches));
 function encode(a){
   const bytes=new Uint8Array(a.buffer);let chunks=[];
   for(let i=0;i<bytes.length;i+=32768)chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));
   return btoa(chunks.join(""));
 }
 // Alpha is an explicit display policy, not a transparency test.
 for(let i=3;i<pixels.length;i+=4)pixels[i]=1;
 window.__arrays={gpu:encode(pixels),expectedChart:encode(expectedChart),actualChart:encode(actualChart)};
 renderer.setRenderTarget(null);renderer.outputEncoding=T.sRGBEncoding;mat.needsUpdate=true;black.needsUpdate=true;
 renderer.render(scene,camera);window.__image=canvas.toDataURL("image/png");
 window.__result={status:"PASS_OPAQUE_CONTEXT_BINDING",metrics,webglRevision:T.REVISION,agxRuntimeQualified:false,opticalTransparencyQualified:false,artisticApproval:false,physicalDeviceQualified:false,publishable:false};
 rt.dispose();geo.dispose();cg.dispose();uvMat.dispose();occMat.dispose();mat.dispose();black.dispose();tex.dispose();renderer.dispose();
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__metrics||null,mismatches:window.__mismatches||[]});
`;
const files=new Map([
 ["/",["text/html; charset=utf-8",Buffer.from('<!doctype html><meta charset="utf-8"><script src="/three.js"></script><script src="/probe.js"></script>')]],
 ["/three.js",["application/javascript",engine]],["/probe.js",["application/javascript",Buffer.from(script)]],
 ["/binding",["application/json",bindingRaw]],["/oracle",["application/json",oracleRaw]],
 ["/texture",["application/octet-stream",texture]],["/occluders",["application/octet-stream",occ]]
]);
const server=createServer((req,res)=>{
 res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'none'; object-src 'none'; base-uri 'none'");
 res.setHeader("X-Content-Type-Options","nosniff");
 const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}
 res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);
});
let browser;
const report={schema:"atlas.asc01.context-browser/v1",revision:o.revision,oracleSha256:sha(oracleRaw),engineSha256:sha(engine),externalRequests:[],pageErrors:[],status:"PENDING",arrays:{}};
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const c=await browser.newContext({viewport:{width:800,height:650}});
 await c.route("**/*",r=>{if(new URL(r.request().url()).origin!==origin){report.externalRequests.push(r.request().url());return r.abort();}return r.continue();});
 const page=await c.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));await page.goto(origin+"/");
 let result=null;for(let i=0;i<480&&!result;i++){result=await page.evaluate(()=>window.__result||null);if(!result)await new Promise(ok=>setTimeout(ok,250));}
 report.result=result;assert(result,"browser timeout");assert.equal(result.status,"PASS_OPAQUE_CONTEXT_BINDING",JSON.stringify(result));
 assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
 const arrays=await page.evaluate(()=>window.__arrays);
 for(const [name,value] of Object.entries(arrays)){
   const raw=Buffer.from(value,"base64");writeFileSync(join(out,name+".rgba32f"),raw);
   report.arrays[name]={sha256:sha(raw),bytes:raw.length};
 }
 const image=await page.evaluate(()=>window.__image);writeFileSync(join(out,"context-srgb.png"),Buffer.from(image.split(",")[1],"base64"));
 report.status=result.status;
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{writeFileSync(join(out,"context-browser.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC-B2a browser",JSON.stringify(report));if(browser)await browser.close();server.close();}
