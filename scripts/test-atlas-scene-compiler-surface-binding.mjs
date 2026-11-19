import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [dir,enginePath,out]=process.argv.slice(2).map(p=>resolve(p));
mkdirSync(out,{recursive:true});
const sha=b=>createHash("sha256").update(b).digest("hex");
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const binding=JSON.parse(readFileSync(join(dir,"surface-binding.json")));
const bake=JSON.parse(readFileSync(join(dir,"diffuse-bake.json")));
const raw=readFileSync(join(dir,"binding.rgba32f"));
assert.equal(binding.revision,process.env.ATLAS_EXACT_HEAD);
assert.equal(bake.revision,binding.revision);
assert.equal(bake.status,"PASS_DIFFUSE_BAKE_PROBE");
assert(bake.masterUnchanged&&bake.bindingsRestored);
assert.deepEqual(binding.target,bake.target);
assert.equal(binding.masterSha256,bake.masterSha256);
assert.equal(binding.texture.sourceExrSha256,sha(readFileSync(join(dir,"diffuse-linear.exr"))));
assert.equal(binding.texture.sha256,sha(raw));
assert.equal(raw.length,binding.texture.width*binding.texture.height*16);
const script=String.raw`
(async()=>{
 const T=window.THREE, check=(x,m)=>{if(!x)throw Error(m);};
 const b=await fetch("/binding.json").then(r=>r.json());
 const data=new Float32Array(await fetch("/texture").then(r=>r.arrayBuffer()));
 check(T.REVISION==="128","engine revision");
 check(new Uint8Array(new Uint32Array([1]).buffer)[0]===1,"little endian");
 const {width:w,height:h}=b.camera,tw=b.texture.width,th=b.texture.height;
 const canvas=document.createElement("canvas");document.body.appendChild(canvas);
 const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,preserveDrawingBuffer:true});
 check(gl&&gl.getExtension("EXT_color_buffer_float"),"float WebGL2");
 const renderer=new T.WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,preserveDrawingBuffer:true});
 renderer.setPixelRatio(1);renderer.setSize(w,h,false);
 renderer.toneMapping=T.NoToneMapping;renderer.outputEncoding=T.LinearEncoding;
 const matrix=a=>new T.Matrix4().set(...a.flat());
 const camera=new T.Camera();camera.matrixAutoUpdate=false;
 camera.matrix.copy(matrix(b.camera.world));camera.matrixWorld.copy(camera.matrix);
 camera.matrixWorldInverse.copy(matrix(b.camera.view));
 camera.projectionMatrix.copy(matrix(b.camera.projection));
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
 const geo=new T.BufferGeometry();
 geo.setAttribute("position",new T.Float32BufferAttribute(b.positions.flat(),3));
 geo.setAttribute("uv",new T.Float32BufferAttribute(b.uv.flat(),2));
 const scene=new T.Scene();
 const uvMaterial=new T.ShaderMaterial({side:T.DoubleSide,
 vertexShader:"varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
 fragmentShader:"varying vec2 vUv; void main(){gl_FragColor=vec4(vUv,1.0,1.0);}"});
 const mesh=new T.Mesh(geo,uvMaterial);scene.add(mesh);
 const target=new T.WebGLRenderTarget(w,h,{type:T.FloatType,format:T.RGBAFormat,depthBuffer:true,stencilBuffer:false,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
 target.texture.encoding=T.LinearEncoding;
 renderer.setClearColor(0,0);renderer.setRenderTarget(target);renderer.render(scene,camera);
 check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"float framebuffer");
 const actualUV=new Float32Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,actualUV);
 check(gl.getError()===gl.NO_ERROR,"UV readback");
 const texture=new T.DataTexture(data,tw,th,T.RGBAFormat,T.FloatType);
 texture.encoding=T.LinearEncoding;texture.flipY=false;texture.generateMipmaps=false;
 texture.minFilter=T.NearestFilter;texture.magFilter=T.NearestFilter;texture.needsUpdate=true;
 const colorMaterial=new T.MeshBasicMaterial({map:texture,toneMapped:false,side:T.DoubleSide});
 mesh.material=colorMaterial;renderer.render(scene,camera);
 const actual=new Float32Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,actual);
 check(gl.getError()===gl.NO_ERROR,"color readback");
 // Independent CPU raster reference, original camera clip coordinates.
 const mul=(m,v)=>m.map(row=>row.reduce((s,x,i)=>s+x*v[i],0));
 const projected=b.positions.map(p=>{
   const c=mul(b.camera.projection,mul(b.camera.view,[...p,1]));
   check(c[3]>0,"target crosses camera plane");
   return [(c[0]/c[3]+1)*w/2,(c[1]/c[3]+1)*h/2,c[2]/c[3],1/c[3]];
 });
 const depth=new Float64Array(w*h).fill(Infinity),expected=new Float64Array(w*h*2),interior=new Float64Array(w*h);
 for(let i=0;i<projected.length;i+=3){
   const [a,c,d]=projected.slice(i,i+3);
   const det=(c[1]-d[1])*(a[0]-d[0])+(d[0]-c[0])*(a[1]-d[1]);
   if(Math.abs(det)<1e-10)continue;
   const xmin=Math.max(0,Math.floor(Math.min(a[0],c[0],d[0]))),xmax=Math.min(w-1,Math.ceil(Math.max(a[0],c[0],d[0])));
   const ymin=Math.max(0,Math.floor(Math.min(a[1],c[1],d[1]))),ymax=Math.min(h-1,Math.ceil(Math.max(a[1],c[1],d[1])));
   for(let y=ymin;y<=ymax;y++)for(let x=xmin;x<=xmax;x++){
     const X=x+.5,Y=y+.5;
     const l=((c[1]-d[1])*(X-d[0])+(d[0]-c[0])*(Y-d[1]))/det;
     const m=((d[1]-a[1])*(X-d[0])+(a[0]-d[0])*(Y-d[1]))/det;
     const n=1-l-m, edge=Math.min(l,m,n);
     if(edge<0)continue;
     const z=l*a[2]+m*c[2]+n*d[2],k=y*w+x;
     if(z < -1 || z > 1 || z>=depth[k])continue;
     depth[k]=z;interior[k]=edge;
     const weights=[l*a[3],m*c[3],n*d[3]],sum=weights.reduce((s,v)=>s+v,0);
     for(let j=0;j<2;j++)expected[2*k+j]=weights.reduce((s,v,t)=>s+v*b.uv[i+t][j],0)/sum;
   }
 }
 let testedUV=0,badUV=0,maxUV=0,testedColor=0,badColor=0,maxColor=0,covered=0;
 for(let k=0;k<w*h;k++){
   if(!Number.isFinite(depth[k]))continue;
   covered++;
   // Edges and exact texture sample boundaries are excluded from numeric
   // equality, but counts remain recorded. No exclusion based on GPU output.
   if(interior[k]<.03)continue;
   testedUV++;
   const u=expected[k*2],v=expected[k*2+1];
   const err=Math.max(Math.abs(u-actualUV[k*4]),Math.abs(v-actualUV[k*4+1]));
   maxUV=Math.max(maxUV,err);
   if(!Number.isFinite(err)||err>2e-4||actualUV[k*4+2]<.99)badUV++;
   const sx=u*tw,sy=v*th;
   if(Math.abs(sx-Math.round(sx))<.15||Math.abs(sy-Math.round(sy))<.15)continue;
   const tx=Math.min(tw-1,Math.max(0,Math.floor(sx))),ty=Math.min(th-1,Math.max(0,Math.floor(sy)));
   const j=(ty*tw+tx)*4;
   testedColor++;
   let bad=false;
   for(let ch=0;ch<4;ch++){
     const e=Math.abs(actual[k*4+ch]-data[j+ch]);maxColor=Math.max(maxColor,e);
     if(!Number.isFinite(e)||e>2e-6+2e-6*Math.abs(data[j+ch]))bad=true;
   }
   if(bad)badColor++;
 }
 const metrics={covered,testedUV,badUV,maxUV,testedColor,badColor,maxColor};
 window.__metrics=metrics;
 check(testedUV>=100&&testedColor>=50,"insufficient interior samples");
 check(badUV===0&&badColor===0,"surface binding mismatch "+JSON.stringify(metrics));
 renderer.setRenderTarget(null);renderer.outputEncoding=T.sRGBEncoding;colorMaterial.needsUpdate=true;
 renderer.render(scene,camera);window.__image=canvas.toDataURL("image/png");
 window.__result={status:"PASS_ISOLATED_SURFACE_BINDING",metrics,webglRevision:T.REVISION,
 originalP2C1UvProven:false,fullSceneQualified:false,agxEquivalent:false,artisticApproval:false,physicalDeviceQualified:false,publishable:false};
 target.dispose();geo.dispose();uvMaterial.dispose();colorMaterial.dispose();texture.dispose();renderer.dispose();
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__metrics||null});
`;
const files=new Map([
 ["/",["text/html; charset=utf-8",Buffer.from('<!doctype html><meta charset="utf-8"><script src="/three.js"></script><script src="/probe.js"></script>')]],
 ["/three.js",["application/javascript",engine]],["/probe.js",["application/javascript",Buffer.from(script)]],
 ["/binding.json",["application/json",Buffer.from(JSON.stringify(binding))]],["/texture",["application/octet-stream",raw]]
]);
const server=createServer((req,res)=>{
 res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'none'; object-src 'none'; base-uri 'none'");
 res.setHeader("X-Content-Type-Options","nosniff");
 const file=files.get(req.url);if(!file){res.writeHead(404);res.end();return;}
 res.writeHead(200,{"Content-Type":file[0],"Cache-Control":"no-store"});res.end(file[1]);
});
let browser;
const report={schema:"atlas.asc01.surface-browser/v1",revision:binding.revision,bindingSha256:sha(readFileSync(join(dir,"surface-binding.json"))),textureSha256:sha(raw),engineSha256:sha(engine),externalRequests:[],pageErrors:[],status:"PENDING"};
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
 const origin="http://127.0.0.1:"+server.address().port;
 browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
 const context=await browser.newContext({viewport:{width:800,height:650}});
 await context.route("**/*",route=>{if(new URL(route.request().url()).origin!==origin){report.externalRequests.push(route.request().url());return route.abort();}return route.continue();});
 const page=await context.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));
 await page.goto(origin+"/");
 let result=null;for(let i=0;i<240&&!result;i++){result=await page.evaluate(()=>window.__result||null);if(!result)await new Promise(ok=>setTimeout(ok,250));}
 report.result=result;
 assert(result,"browser timeout");assert.equal(result.status,"PASS_ISOLATED_SURFACE_BINDING",JSON.stringify(result));
 assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
 const image=await page.evaluate(()=>window.__image);
 writeFileSync(join(out,"isolated-surface-gpu.png"),Buffer.from(image.split(",")[1],"base64"));
 report.status=result.status;
}catch(e){report.status="FAIL";report.error=String(e);throw e;}
finally{writeFileSync(join(out,"surface-browser.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC-P2C2B",JSON.stringify(report));if(browser)await browser.close();server.close();}
