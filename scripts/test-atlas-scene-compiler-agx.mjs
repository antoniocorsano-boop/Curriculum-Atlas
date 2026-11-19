import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [dir,enginePath]=process.argv.slice(2).map(p=>resolve(p));
const sha=b=>createHash("sha256").update(b).digest("hex");
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const manifestRaw=readFileSync(join(dir,"agx-lut.json")),m=JSON.parse(manifestRaw);
assert.equal(m.revision,process.env.ATLAS_EXACT_HEAD);
assert.equal(m.lut.size,97);assert.deepEqual(m.lut.domain,[0,8]);assert.equal(m.lut.shaperK,64);
assert.equal(m.lut.width,1024);assert.equal(m.lut.height,Math.ceil(97**3/1024));
assert.equal(m.lut.encoding,"display-sRGB RGB8");
const files=new Map();
for(const name of ["lut.rgba8","holdout.rgba32f","frame.rgba32f","holdout.rgb8","frame.rgb8"]){
 const raw=readFileSync(join(dir,name));assert.equal(sha(raw),m.files[name].sha256);assert.equal(raw.length,m.files[name].bytes);
 files.set("/"+name,["application/octet-stream",raw]);
}
const script=String.raw`
(async()=>{
 const T=window.THREE, check=(ok,msg)=>{if(!ok)throw Error(msg);};
 const get=async n=>{const r=await fetch("/"+n);check(r.ok,n);return r.arrayBuffer();};
 const m=JSON.parse(new TextDecoder().decode(await get("manifest")));
 check(T.REVISION==="128","engine revision");
 check(new Uint8Array(new Uint32Array([1]).buffer)[0]===1,"little endian");
 const canvas=document.createElement("canvas");document.body.appendChild(canvas);
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,preserveDrawingBuffer:true});
 check(gl,"WebGL2 unavailable");check(gl.getParameter(gl.MAX_TEXTURE_SIZE)>=Math.max(m.lut.width,m.lut.height),"atlas too large");
 const renderer=new T.WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.toneMapping=T.NoToneMapping;renderer.outputEncoding=T.LinearEncoding;
 const lut=new T.DataTexture(new Uint8Array(await get("lut.rgba8")),m.lut.width,m.lut.height,T.RGBAFormat,T.UnsignedByteType);
 function setup(t){t.encoding=T.LinearEncoding;t.flipY=false;t.generateMipmaps=false;t.minFilter=T.NearestFilter;t.magFilter=T.NearestFilter;t.unpackAlignment=1;t.needsUpdate=true;}
 setup(lut);
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
 const scene=new T.Scene(),camera=new T.Camera(),plane=new T.PlaneGeometry(2,2);scene.add(new T.Mesh(plane,shader));
 function summary(a){
   const hist=new Uint32Array(256);let sum=0,max=0;for(const v of a){hist[v]++;sum+=v;max=Math.max(max,v);}
   let count=0,p99=255;for(let i=0;i<256;i++){count+=hist[i];if(count>=Math.ceil(a.length*.99)){p99=i;break;}}
   return {count:a.length,max,p99,mean:sum/a.length};
 }
 function encode(a){const bytes=new Uint8Array(a.buffer);let chunks=[];for(let i=0;i<bytes.length;i+=32768)chunks.push(String.fromCharCode(...bytes.subarray(i,i+32768)));return btoa(chunks.join(""));}
 const results={};window.__results=results;window.__images={};window.__bytes={};
 for(const name of ["holdout","frame"]){
   const c=m.cases[name],w=c.width,h=c.height;
   const values=new Float32Array(await get(name+".rgba32f")),expected=new Uint8Array(await get(name+".rgb8"));
   check(values.length===w*h*4&&expected.length===w*h*3,"case length");
   for(let i=0;i<values.length;i++){check(Number.isFinite(values[i]),"nonfinite source");check(i%4===3?values[i]===1:values[i]>=0&&values[i]<=m.lut.domain[1],"outside bounded domain");}
   const input=new T.DataTexture(values,w,h,T.RGBAFormat,T.FloatType);setup(input);shader.uniforms.source.value=input;
   renderer.setSize(w,h,false);
   const target=new T.WebGLRenderTarget(w,h,{type:T.UnsignedByteType,format:T.RGBAFormat,depthBuffer:false,stencilBuffer:false,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
   target.texture.encoding=T.LinearEncoding;renderer.setRenderTarget(target);renderer.render(scene,camera);
   check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"byte framebuffer");
   const actual=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,actual);
   check(gl.getError()===gl.NO_ERROR,"GPU readback");
   const all=[],nonblack=[];
   for(let i=0;i<c.samples;i++){
     const lit=Math.max(values[i*4],values[i*4+1],values[i*4+2])>1e-6;
     for(let j=0;j<3;j++){const d=Math.abs(actual[i*4+j]-expected[i*3+j]);all.push(d);if(lit)nonblack.push(d);}
     check(actual[i*4+3]===255,"opaque output");
   }
   check(nonblack.length>100,"insufficient lit samples");
   renderer.setRenderTarget(null);renderer.render(scene,camera);
   const screen=new Uint8Array(actual.length);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,screen);
   check(gl.getError()===gl.NO_ERROR,"screen readback");
   let screenMax=0;for(let i=0;i<screen.length;i++)screenMax=Math.max(screenMax,Math.abs(screen[i]-actual[i]));
   const limits=name==="holdout"?{max:10,p99:3}:{max:4,p99:2};
   const a=summary(all),lit=summary(nonblack);
   results[name]={all:a,nonblack:lit,screenMaxByteDelta:screenMax,limits};
   window.__images[name]=canvas.toDataURL("image/png");window.__bytes[name]=encode(actual);
   check(a.max<=limits.max&&a.p99<=limits.p99&&lit.max<=limits.max&&lit.p99<=limits.p99&&screenMax<=1,"display mismatch "+name+" "+JSON.stringify(results[name]));
   input.dispose();target.dispose();
 }
 window.__result={status:"PASS_BOUNDED_AGX_GPU_APPROXIMATION",metrics:results,webglRevision:T.REVISION,outputEncoding:"display sRGB bytes; no additional transfer",fullBeautyRenderQualified:false,physicalDeviceQualified:false,opticalTransparencyQualified:false,artisticApproval:false,publishable:false};
 lut.dispose();shader.dispose();plane.dispose();renderer.dispose();
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__results||{}});
`;
files.set("/",["text/html; charset=utf-8",Buffer.from('<!doctype html><meta charset="utf-8"><script src="/three.js"></script><script src="/probe.js"></script>')]);
files.set("/three.js",["application/javascript",engine]);files.set("/probe.js",["application/javascript",Buffer.from(script)]);files.set("/manifest",["application/json",manifestRaw]);
const server=createServer((req,res)=>{
 res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'none'; object-src 'none'; base-uri 'none'");
 res.setHeader("X-Content-Type-Options","nosniff");const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}
 res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);
});
let browser;
const report={schema:"atlas.asc01.agx-browser/v1",revision:m.revision,manifestSha256:sha(manifestRaw),engineSha256:sha(engine),externalRequests:[],pageErrors:[],status:"PENDING",images:{}};
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const context=await browser.newContext({viewport:{width:800,height:650}});
 await context.route("**/*",r=>{if(new URL(r.request().url()).origin!==origin){report.externalRequests.push(r.request().url());return r.abort();}return r.continue();});
 const page=await context.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));await page.goto(origin+"/");
 let result=null;for(let i=0;i<480&&!result;i++){result=await page.evaluate(()=>window.__result||null);if(!result)await new Promise(ok=>setTimeout(ok,250));}
 report.result=result;assert(result,"browser timeout");
 const evidence=await page.evaluate(()=>({images:window.__images||{},bytes:window.__bytes||{}}));
 for(const [name,url] of Object.entries(evidence.images)){const b=Buffer.from(url.split(",")[1],"base64");writeFileSync(join(dir,name+"-gpu-agx.png"),b);report.images[name]={sha256:sha(b),bytes:b.length};}
 for(const [name,value] of Object.entries(evidence.bytes)){const b=Buffer.from(value,"base64");writeFileSync(join(dir,name+"-gpu.rgba8"),b);}
 assert.equal(result.status,"PASS_BOUNDED_AGX_GPU_APPROXIMATION",JSON.stringify(result));assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
 report.status=result.status;
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{writeFileSync(join(dir,"agx-browser.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC-B2b browser",JSON.stringify(report));if(browser)await browser.close();server.close();}
