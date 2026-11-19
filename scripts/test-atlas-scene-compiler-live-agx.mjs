import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [src,contextDir,agxDir,out,enginePath]=process.argv.slice(2).map(p=>resolve(p));
const sha=b=>createHash("sha256").update(b).digest("hex");
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const bindingRaw=readFileSync(join(src,"surface-binding.json")),texture=readFileSync(join(src,"binding.rgba32f"));
const oracleRaw=readFileSync(join(contextDir,"context-oracle.json")),occ=readFileSync(join(contextDir,"occluders.f32"));
const b=JSON.parse(bindingRaw),o=JSON.parse(oracleRaw);
assert.equal(o.revision,"2cde18aa558edbcf612de535491daa53049bb6cc");
const mraw=readFileSync(join(agxDir,"agx-lut.json")),m=JSON.parse(mraw);
const prior=JSON.parse(readFileSync(join(agxDir,"agx-browser.json")));
const lutRaw=readFileSync(join(agxDir,"lut.rgba8"));
const previousFrame=readFileSync(join(contextDir,"gpu.rgba32f"));
assert.equal(m.revision,"f2f8c4737ecf1af87565b68cef4171ec2db0ba05");
assert.equal(m.sourceRevision,o.revision);
assert.equal(prior.revision,m.revision);assert.equal(prior.status,"PASS_BOUNDED_AGX_GPU_APPROXIMATION");
assert.equal(prior.manifestSha256,sha(mraw));assert.equal(m.files["lut.rgba8"].sha256,sha(lutRaw));
assert.equal(m.files["frame.rgba32f"].sha256,sha(previousFrame));
assert.equal(m.lut.size,97);assert.deepEqual(m.lut.domain,[0,8]);assert.equal(m.lut.shaperK,64);
assert.equal(lutRaw.length,m.lut.width*m.lut.height*4);
assert.equal(m.masterSha256,o.masterSha256);assert(m.masterUnchanged);
assert.deepEqual(prior.externalRequests,[]);assert.deepEqual(prior.pageErrors,[]);
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
 // The original B2a oracle has been independently rechecked above.
 const m=await json("/agx");
 const lr=await fetch("/lut");check(lr.ok,"LUT fetch");
 const lut=new T.DataTexture(new Uint8Array(await lr.arrayBuffer()),m.lut.width,m.lut.height,T.RGBAFormat,T.UnsignedByteType);
 lut.encoding=T.LinearEncoding;lut.flipY=false;lut.generateMipmaps=false;lut.minFilter=T.NearestFilter;lut.magFilter=T.NearestFilter;lut.unpackAlignment=1;lut.needsUpdate=true;
 const shader=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,
 uniforms:{source:{value:null},lut:{value:lut},size:{value:m.lut.size},atlas:{value:new T.Vector2(m.lut.width,m.lut.height)},shaperK:{value:m.lut.shaperK},limit:{value:m.lut.domain[1]}},
 vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",
 fragmentShader:[
 "precision highp float;varying vec2 vUv;uniform sampler2D source;uniform sampler2D lut;uniform float size;uniform vec2 atlas;uniform float shaperK;uniform float limit;",
 "vec3 at(vec3 p){float i=p.x+size*(p.y+size*p.z);vec2 texel=vec2(mod(i,atlas.x),floor(i/atlas.x));return texture2D(lut,(texel+0.5)/atlas).rgb;}",
 "vec3 transform(vec3 linear){vec3 p=log(vec3(1.0)+shaperK*clamp(linear,0.0,limit))/log(1.0+shaperK*limit)*(size-1.0);",
 "vec3 a=floor(p),f=fract(p),b=min(a+1.0,vec3(size-1.0));",
 "vec3 l0=mix(mix(at(a),at(vec3(b.x,a.y,a.z)),f.x),mix(at(vec3(a.x,b.y,a.z)),at(vec3(b.x,b.y,a.z)),f.x),f.y);",
 "vec3 l1=mix(mix(at(vec3(a.x,a.y,b.z)),at(vec3(b.x,a.y,b.z)),f.x),mix(at(vec3(a.x,b.y,b.z)),at(b),f.x),f.y);return mix(l0,l1,f.z);}",
 "void main(){vec3 c=texture2D(source,vUv).rgb;gl_FragColor=vec4(transform(c),1.0);}"].join("\n")});

 const postScene=new T.Scene(),postCamera=new T.Camera(),plane=new T.PlaneGeometry(2,2);
 postScene.add(new T.Mesh(plane,shader));
 const original=camera.matrix.clone();
 const output=new T.WebGLRenderTarget(w,h,{type:T.UnsignedByteType,format:T.RGBAFormat,depthBuffer:false,stencilBuffer:false,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
 output.texture.encoding=T.LinearEncoding;
 window.__liveFrames={};window.__liveMetrics={};
 let baseline=null,baselineBytes=null;
 function renderCase(name,cw,ch,shift,yaw){
   renderer.setSize(cw,ch,false);rt.setSize(cw,ch);output.setSize(cw,ch);
   camera.matrix.copy(original).multiply(new T.Matrix4().makeTranslation(shift,0,0)).multiply(new T.Matrix4().makeRotationY(yaw));
   camera.matrixWorld.copy(camera.matrix);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
   renderer.setRenderTarget(rt);renderer.render(scene,camera);
   check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"live float framebuffer");
   // The post pass reads the actual scene render target directly. No data texture
   // made from a CPU readback is used as the source of the shader.
   shader.uniforms.source.value=rt.texture;
   renderer.setRenderTarget(output);renderer.render(postScene,postCamera);
   check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"live display framebuffer");
   const display=new Uint8Array(cw*ch*4);renderer.readRenderTargetPixels(output,0,0,cw,ch,display);
   renderer.setRenderTarget(null);renderer.render(postScene,postCamera);
   const screen=new Uint8Array(display.length);gl.readPixels(0,0,cw,ch,gl.RGBA,gl.UNSIGNED_BYTE,screen);
   check(gl.getError()===gl.NO_ERROR,"screen readback");
   const linear=new Float32Array(cw*ch*4);renderer.readRenderTargetPixels(rt,0,0,cw,ch,linear);
   check(gl.getError()===gl.NO_ERROR,"live float readback");
   let screenMax=0,min=Infinity,max=-Infinity,lit=0,changed=0,displayChanged=0;
   for(let i=0;i<linear.length;i+=4){
     let pixelChanged=false,pixelDisplayChanged=false;
     for(let j=0;j<3;j++){
       const x=linear[i+j];check(Number.isFinite(x)&&x>=0&&x<=m.lut.domain[1],"live domain");
       min=Math.min(min,x);max=Math.max(max,x);
       if(baseline&&baseline.length===linear.length&&Math.abs(x-baseline[i+j])>1e-6)pixelChanged=true;
       if(baselineBytes&&baselineBytes.length===display.length&&display[i+j]!==baselineBytes[i+j])pixelDisplayChanged=true;
     }
     linear[i+3]=1;
     if(Math.max(linear[i],linear[i+1],linear[i+2])>1e-6)lit++;
     if(pixelChanged)changed++;
     if(pixelDisplayChanged)displayChanged++;
     for(let j=0;j<4;j++)screenMax=Math.max(screenMax,Math.abs(screen[i+j]-display[i+j]));
     check(display[i+3]===255,"opaque display");
   }
   check(lit>=1000&&screenMax<=1,"live display coverage");
   if(name==="reference"){baseline=linear.slice();baselineBytes=display.slice();}
   if(name==="shifted")check(changed>=100&&displayChanged>=100,"camera did not change live output");
   if(name==="restored")check(changed===0&&displayChanged===0,"camera rollback drift");
   window.__liveMetrics[name]={width:cw,height:ch,shift,yaw,min,max,lit,changed,displayChanged,screenMax};
   window.__liveFrames[name]={linear:encode(linear),display:encode(display),image:canvas.toDataURL("image/png")};
 }
 renderCase("reference",w,h,0,0);
 renderCase("shifted",w,h,.08,.025);
 renderCase("mobile",320,240,.08,.025);
 renderCase("restored",w,h,0,0);
 window.__result={status:"PASS_LIVE_AGX_PASS",contextMetrics:metrics,frames:window.__liveMetrics,webglRevision:T.REVISION,
 gpuRenderTargetSource:true,fullBeautyRenderQualified:false,opticalTransparencyQualified:false,artisticApproval:false,physicalDeviceQualified:false,publishable:false};
 output.dispose();lut.dispose();shader.dispose();plane.dispose();rt.dispose();geo.dispose();cg.dispose();uvMat.dispose();occMat.dispose();mat.dispose();black.dispose();tex.dispose();renderer.dispose();
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__metrics||null,mismatches:window.__mismatches||[]});
`;
const files=new Map([
 ["/",["text/html; charset=utf-8",Buffer.from('<!doctype html><meta charset="utf-8"><script src="/three.js"></script><script src="/probe.js"></script>')]],
 ["/three.js",["application/javascript",engine]],["/probe.js",["application/javascript",Buffer.from(script)]],
 ["/binding",["application/json",bindingRaw]],["/oracle",["application/json",oracleRaw]],
 ["/texture",["application/octet-stream",texture]],["/occluders",["application/octet-stream",occ]],
 ["/agx",["application/json",mraw]],["/lut",["application/octet-stream",lutRaw]]
]);
const server=createServer((req,res)=>{
 res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'none'; object-src 'none'; base-uri 'none'");
 res.setHeader("X-Content-Type-Options","nosniff");
 const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}
 res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);
});
let browser;
const report={schema:"atlas.asc01.live-agx/v1",revision:process.env.ATLAS_EXACT_HEAD,sourceRevision:m.revision,oracleSha256:sha(oracleRaw),lutSha256:sha(lutRaw),engineSha256:sha(engine),externalRequests:[],pageErrors:[],status:"PENDING",arrays:{}};
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const c=await browser.newContext({viewport:{width:800,height:650}});
 await c.route("**/*",r=>{if(new URL(r.request().url()).origin!==origin){report.externalRequests.push(r.request().url());return r.abort();}return r.continue();});
 const page=await c.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));await page.goto(origin+"/");
 let result=null;for(let i=0;i<480&&!result;i++){result=await page.evaluate(()=>window.__result||null);if(!result)await new Promise(ok=>setTimeout(ok,250));}
 report.result=result;assert(result,"browser timeout");assert.equal(result.status,"PASS_LIVE_AGX_PASS",JSON.stringify(result));
 assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
 for(const name of ["reference","shifted","mobile","restored"]){
   const evidence=await page.evaluate(n=>window.__liveFrames[n],name);
   const entry={};
   for(const kind of ["linear","display","image"]){
     const raw=Buffer.from(kind==="image"?evidence[kind].split(",")[1]:evidence[kind],"base64");
     const file=name+(kind==="linear"?".rgba32f":kind==="display"?".rgba8":".png");
     writeFileSync(join(out,file),raw);entry[kind]={sha256:sha(raw),bytes:raw.length};
     if(name==="reference"&&kind==="linear")assert.equal(sha(raw),sha(previousFrame),"B2a original linear frame drift");
   }
   report.arrays[name]=entry;
 }
 assert.equal(report.arrays.reference.linear.sha256,report.arrays.restored.linear.sha256);
 assert.equal(report.arrays.reference.display.sha256,report.arrays.restored.display.sha256);
 report.status=result.status;
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{writeFileSync(join(out,"live-agx.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC-B2c live",JSON.stringify(report));if(browser)await browser.close();server.close();}
