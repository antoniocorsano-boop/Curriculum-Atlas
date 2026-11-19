import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [src,ctx,agx,bayDir,out,enginePath,surroundDir]=process.argv.slice(2).map(resolvePath=>resolve(resolvePath));
const sha=b=>createHash("sha256").update(b).digest("hex");
const read=(d,n)=>readFileSync(join(d,n));
const json=(d,n)=>JSON.parse(read(d,n));
const engine=readFileSync(enginePath);
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const b=json(src,"surface-binding.json"),m=json(src,"material-package.json"),f=json(src,"material-finish.json");
const bay=json(bayDir,"bay.json"),oracle=json(ctx,"context-oracle.json"),lut=json(agx,"agx-lut.json"),prior=json(agx,"agx-browser.json");
const texture=read(src,"binding.rgba32f"),rough=read(src,"roughness.rgb8"),rows=read(bayDir,"bay.f32"),occ=read(ctx,"occluders.f32"),lutBytes=read(agx,"lut.rgba8");
const bakedManifest=surroundDir?json(surroundDir,"baked-surround.json"):null;
const bakedFiles=new Map();
const bakedReplay=bakedManifest&&process.env.ATLAS_BAKE_REPLAY==='1'?json(surroundDir,'replay.json'):null;
if(bakedManifest){
  assert.equal(bakedManifest.status,"PASS_BAY_SURROUND_PACKAGE");
  if(bakedReplay){
    assert.equal(bakedReplay.status,"PASS_EXACT_BAKE_REPLAY");
    assert.equal(bakedReplay.rebaked,false);
    assert.equal(bakedReplay.sourceRevision,bakedManifest.revision);
    assert.equal(bakedManifest.revision,"34bd5bbd3281abdcbc1a9fbe4c5de59dc750020e");
    assert.equal(bakedReplay.manifestSha256,sha(read(surroundDir,"baked-surround.json")));
  }else assert.equal(bakedManifest.revision,bay.revision);
  assert.equal(bakedManifest.baySha256,bay.sha256);
  assert.equal(bakedManifest.retainedTarget,bay.target);
  assert.equal(bakedManifest.objects.length,9);
  assert.equal(bakedManifest.retainedPaper.length,1);
  assert.deepEqual(new Set(bakedManifest.objects.map(x=>x.object)),new Set(bay.objects.map(x=>x.object).filter(n=>n!==bay.target&&!bakedManifest.retainedPaper.includes(n))));
  for(const item of bakedManifest.objects){
    assert.match(item.id,/^surface-\d{2}$/);
    assert.equal(item.state,"PASS_BAKED_SURFACE");
    assert.equal(item.transfer.outsideTolerance,0);
    const g=read(surroundDir,item.id+".f32"),t=read(surroundDir,item.id+".rgba32f");
    assert.equal(sha(g),item.geometrySha256);assert.equal(sha(t),item.textureSha256);
    assert.equal(g.length,item.vertices*5*4);assert.equal(t.length,item.width*item.height*16);
    bakedFiles.set("/"+item.id+".f32",["application/octet-stream",g]);
    bakedFiles.set("/"+item.id+".rgba32f",["application/octet-stream",t]);
  }
  bakedFiles.set("/baked-surround",["application/json",read(surroundDir,"baked-surround.json")]);
}
assert.equal(b.revision,"52804c49858aafb643f11bff10772a32a0c5e14f");
assert.equal(b.revision,m.revision);assert.equal(f.status,"PASS_FINISH_PACKAGE");
assert.equal(m.bindingSha256,sha(read(src,"surface-binding.json")));assert.equal(f.packageSha256,sha(read(src,"material-package.json")));
assert.equal(bay.materialPackageSha256,f.packageSha256);assert.equal(bay.sourceRevision,b.revision);assert.equal(bay.revision,process.env.ATLAS_EXACT_HEAD);
assert.equal(bay.sha256,sha(rows));assert.equal(bay.objects.length,11);assert.equal(rows.length,bay.triangles*3*11*4);
assert.equal(b.texture.sha256,sha(texture));assert.equal(m.roughness.sha256,sha(rough));
assert.equal(oracle.occluderSha256,sha(occ));assert.equal(oracle.masterSha256,b.masterSha256);
assert.equal(prior.status,"PASS_BOUNDED_AGX_GPU_APPROXIMATION");assert.equal(prior.manifestSha256,sha(read(agx,"agx-lut.json")));assert.equal(lut.files["lut.rgba8"].sha256,sha(lutBytes));
for(let i=0;i<rough.length;i+=3)assert(rough[i]===rough[i+1]&&rough[i]===rough[i+2],"roughness must be grayscale");
const html='<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atlas — Campata 04-0</title><link rel="stylesheet" href="/style.css"><body><header><strong>Atlas · Campata 04-0</strong><span>Anteprima locale · trascina per ruotare</span><button id="reset">Ripristina</button></header><main id="view"></main><script src="/three.js"></script><script src="/bay.js"></script></body></html>';
const css='body{margin:0;background:#191512;color:#f1e7d5;font:14px system-ui}header{display:flex;gap:16px;align-items:center;padding:12px;flex-wrap:wrap}header span{color:#cbbba4}button{background:#493c31;color:#fff;border:1px solid #a18a6d;border-radius:6px;padding:6px 12px}canvas{display:block;max-width:100%;height:auto;touch-action:none;cursor:grab}main{display:flex;justify-content:center}';
const js=String.raw`
(async()=>{
const T=window.THREE,check=(x,m)=>{if(!x)throw Error(m);};
const json=async u=>{const r=await fetch(u);check(r.ok,u);return r.json();};
const bytes=async u=>{const r=await fetch(u);check(r.ok,u);return new Uint8Array(await r.arrayBuffer());};
const floats=async u=>new Float32Array((await bytes(u)).buffer);
const b=await json("/binding"),m=await json("/package"),bay=await json("/bay"),o=await json("/oracle"),a=await json("/agx");
const data=await floats("/texture"),rgb=await bytes("/rough"),rows=await floats("/rows"),occ=await floats("/occ"),lutRaw=await bytes("/lut");
check(T.REVISION==="128","engine");const canvas=document.createElement("canvas");document.querySelector("#view").appendChild(canvas);
const gl=canvas.getContext("webgl2",{alpha:false,antialias:false,preserveDrawingBuffer:true});
check(gl&&gl.getExtension("EXT_color_buffer_float"),"float framebuffer");
const R=new T.WebGLRenderer({canvas,context:gl,alpha:false,antialias:false,preserveDrawingBuffer:true});
R.setPixelRatio(1);R.toneMapping=T.NoToneMapping;R.outputEncoding=T.LinearEncoding;R.setClearColor(0,1);
const {width:w,height:h}=b.camera,tw=b.texture.width,th=b.texture.height,rw=m.roughness.width,rh=m.roughness.height;
R.setSize(w,h,false);
const matrix=x=>new T.Matrix4().set(...x.flat());
const camera=new T.PerspectiveCamera();camera.matrixAutoUpdate=false;camera.matrix.copy(matrix(b.camera.world));camera.matrixWorld.copy(camera.matrix);camera.matrixWorldInverse.copy(matrix(b.camera.view));camera.projectionMatrix.copy(matrix(b.camera.projection));camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
function tex(d,w,h,type){const t=new T.DataTexture(d,w,h,T.RGBAFormat,type);t.encoding=T.LinearEncoding;t.flipY=false;t.generateMipmaps=false;t.minFilter=t.magFilter=T.NearestFilter;t.needsUpdate=true;return t;}
const lm=tex(data,tw,th,T.FloatType);
const gray=new Uint8Array(rw*rh*4);for(let i=0;i<rw*rh;i++){gray[4*i]=gray[4*i+1]=gray[4*i+2]=rgb[3*i];gray[4*i+3]=255;}
const rt=tex(gray,rw,rh,T.UnsignedByteType);
const targetGeo=new T.BufferGeometry();targetGeo.setAttribute("position",new T.Float32BufferAttribute(b.positions.flat(),3));targetGeo.setAttribute("uv",new T.Float32BufferAttribute(b.uv.flat(),2));targetGeo.setAttribute("materialUV",new T.Float32BufferAttribute(m.materialUV.flat(),2));targetGeo.setAttribute("normal",new T.Float32BufferAttribute(m.worldNormals.flat(),3));
const vertex="attribute vec2 materialUV;varying vec2 vUv,vMat;varying vec3 vP,vN;void main(){vUv=uv;vMat=materialUV;vP=position;vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const sampler=[
"uniform sampler2D lm,rough;uniform vec2 lmSize,roughSize;varying vec2 vUv,vMat;varying vec3 vP,vN;",
"vec2 coord(vec2 p,vec2 sz,bool wrap){return (wrap?mod(mod(p,sz)+sz,sz):clamp(p,vec2(0.0),sz-1.0))+.5;}",
"vec3 sampleLinear(sampler2D t,vec2 uv,vec2 sz,bool wrap){vec2 p=uv*sz-.5,i=floor(p),f=fract(p);vec3 a=texture2D(t,coord(i,sz,wrap)/sz).rgb,b=texture2D(t,coord(i+vec2(1,0),sz,wrap)/sz).rgb,c=texture2D(t,coord(i+vec2(0,1),sz,wrap)/sz).rgb,d=texture2D(t,coord(i+1.0,sz,wrap)/sz).rgb;return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
"vec3 diffuse(){return sampleLinear(lm,vUv,lmSize,false);}float roughness(){return sampleLinear(rough,vMat,roughSize,true).r;}"
].join("\n");
const u={lm:{value:lm},rough:{value:rt},lmSize:{value:new T.Vector2(tw,th)},roughSize:{value:new T.Vector2(rw,rh)}};
const debug=new T.ShaderMaterial({uniforms:u,side:T.DoubleSide,vertexShader:vertex,fragmentShader:sampler+"\nvoid main(){gl_FragColor=vec4(diffuse(),roughness());}"});
const maskMat=new T.ShaderMaterial({side:T.DoubleSide,vertexShader:vertex,fragmentShader:"varying vec2 vUv;void main(){gl_FragColor=vec4(vUv,1.0,1.0);}"});
const black=new T.ShaderMaterial({side:T.DoubleSide,vertexShader:"void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"void main(){gl_FragColor=vec4(0.0,0.0,.5,1.0);}"});
const cg=new T.BufferGeometry();cg.setAttribute("position",new T.BufferAttribute(occ,3));
const probe=new T.Scene(),target=new T.Mesh(targetGeo,maskMat),context=new T.Mesh(cg,black);probe.add(target,context);
const floatRT=new T.WebGLRenderTarget(w,h,{type:T.FloatType,format:T.RGBAFormat,minFilter:T.NearestFilter,magFilter:T.NearestFilter});
R.setRenderTarget(floatRT);R.render(probe,camera);check(gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE,"mask framebuffer");
const mask=new Float32Array(w*h*4);R.readRenderTargetPixels(floatRT,0,0,w,h,mask);
target.material=debug;R.render(probe,camera);const pix=new Float32Array(w*h*4);R.readRenderTargetPixels(floatRT,0,0,w,h,pix);
check(gl.getError()===gl.NO_ERROR,"probe readback");
function V(p){return new T.Vector3(...p);}
function ray(x,y){const ndc=new T.Vector3(2*(x+.5)/w-1,2*(y+.5)/h-1,-1);const near=ndc.clone().applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);ndc.z=1;const far=ndc.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);return new T.Ray(near,far.sub(near).normalize());}
const tri=[];for(let i=0;i<b.positions.length;i+=3)tri.push([V(b.positions[i]),V(b.positions[i+1]),V(b.positions[i+2])]);
function hitUV(x,y){const r=ray(x,y);let closest=Infinity,result=null;for(let j=0;j<tri.length;j++){const [p,q,s]=tri[j],hit=r.intersectTriangle(p,q,s,false,new T.Vector3());if(!hit)continue;const distance=hit.distanceToSquared(r.origin);if(distance>=closest)continue;closest=distance;const bc=T.Triangle.getBarycoord(hit,p,q,s,new T.Vector3());const weights=[bc.x,bc.y,bc.z];const mix=arr=>[0,1].map(k=>weights.reduce((v,t,i)=>v+t*arr[j*3+i][k],0));result={uv:mix(b.uv),mat:mix(m.materialUV)};}return result;}
function sample(arr,uv,w,h,stride,wrap,channel){const x=uv[0]*w-.5,y=uv[1]*h-.5,ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;const coord=(v,n)=>wrap?((v%n)+n)%n:Math.max(0,Math.min(n-1,v));const at=(a,b)=>arr[(coord(b,h)*w+coord(a,w))*stride+channel];return (at(ix,iy)*(1-fx)+at(ix+1,iy)*fx)*(1-fy)+(at(ix,iy+1)*(1-fx)+at(ix+1,iy+1)*fx)*fy;}
const metrics={stable:0,target:0,badVisibility:0,tested:0,maxUV:0,maxDiffuse:0,maxRoughness:0,badSamples:0};
for(const s of o.samples){if(!s.stable)continue;metrics.stable++;const k=(s.y*w+s.x)*4;const actual=mask[k+2]>.75?"target":mask[k+2]>.25?"occluder":"background";if(actual!==s.kind)metrics.badVisibility++;if(s.kind!=="target")continue;metrics.target++;if(!s.stableUV)continue;const hit=hitUV(s.x,s.y);check(hit,"CPU ray missing target");metrics.tested++;const du=Math.max(Math.abs(hit.uv[0]-mask[k]),Math.abs(hit.uv[1]-mask[k+1]));metrics.maxUV=Math.max(metrics.maxUV,du);let d=0;for(let ch=0;ch<3;ch++)d=Math.max(d,Math.abs(sample(data,hit.uv,tw,th,4,false,ch)-pix[k+ch]));const dr=Math.abs(sample(rgb,hit.mat,rw,rh,3,true,0)/255-pix[k+3]);metrics.maxDiffuse=Math.max(metrics.maxDiffuse,d);metrics.maxRoughness=Math.max(metrics.maxRoughness,dr);if(du>2e-4||d>.003||dr>.006)metrics.badSamples++;}
window.__metrics=metrics;check(metrics.tested>=100&&metrics.badVisibility===0&&metrics.badSamples===0,"binding/filter mismatch "+JSON.stringify(metrics));
probe.remove(context,target);cg.dispose();maskMat.dispose();black.dispose();debug.dispose();
const lights=bay.lights,lp=Array.from({length:8},(_,i)=>new T.Vector3(...(lights[i]?.position||[0,0,0]))),lc=Array.from({length:8},(_,i)=>new T.Vector3(...(lights[i]?.color||[0,0,0])).multiplyScalar((lights[i]?.energy||0)/12.5663706));
const lighting=[
"uniform vec3 lightPos[8],lightColor[8];uniform vec3 eye;",
"vec3 lightSpec(vec3 p,vec3 n,vec3 v,float r,vec3 f0){vec3 sum=vec3(0.0);float alpha=max(r*r,.025),a2=alpha*alpha,nv=max(dot(n,v),.001);for(int i=0;i<8;i++){vec3 d=lightPos[i]-p;vec3 l=normalize(d),h=normalize(l+v);float nl=max(dot(n,l),0.0),nh=max(dot(n,h),0.0),vh=max(dot(v,h),0.0);float den=nh*nh*(a2-1.0)+1.0,D=a2/(3.14159265*den*den);float k=(r+1.0)*(r+1.0)/8.0,G=nv/(nv*(1.0-k)+k)*nl/(nl*(1.0-k)+k);vec3 F=f0+(1.0-f0)*pow(1.0-vh,5.0);sum+=lightColor[i]/max(dot(d,d),.25)*F*D*G*nl/max(4.0*nl*nv,.001);}return sum;}",
"vec3 lightDiffuse(vec3 p,vec3 n){vec3 sum=vec3(.13);for(int i=0;i<8;i++){vec3 d=lightPos[i]-p;sum+=lightColor[i]/max(dot(d,d),.25)*max(dot(n,normalize(d)),0.0)/3.14159265;}return sum;}"
].join("\n");
const lightU={lightPos:{value:lp},lightColor:{value:lc},eye:{value:new T.Vector3()}};
const targetMat=new T.ShaderMaterial({uniforms:{...u,...lightU},side:T.DoubleSide,vertexShader:vertex,fragmentShader:sampler+"\n"+lighting+"\nvoid main(){vec3 n=normalize(vN)*(gl_FrontFacing?1.0:-1.0),v=normalize(eye-vP);gl_FragColor=vec4(clamp(diffuse()+lightSpec(vP,n,v,roughness(),vec3(.04)),0.0,8.0),1.0);}"});
const geom=new T.BufferGeometry(),p=[],n=[],c=[],props=[];
for(const obj of bay.objects){if(obj.object===bay.target)continue;for(let i=obj.firstVertex;i<obj.firstVertex+obj.vertexCount;i++){const k=i*11;p.push(...rows.slice(k,k+3));n.push(...rows.slice(k+3,k+6));c.push(...rows.slice(k+6,k+9));props.push(rows[k+9],rows[k+10]);}}
geom.setAttribute("position",new T.Float32BufferAttribute(p,3));geom.setAttribute("normal",new T.Float32BufferAttribute(n,3));geom.setAttribute("baseColor",new T.Float32BufferAttribute(c,3));geom.setAttribute("properties",new T.Float32BufferAttribute(props,2));
const surround=new T.ShaderMaterial({side:T.DoubleSide,uniforms:lightU,vertexShader:"attribute vec3 baseColor;attribute vec2 properties;varying vec3 vP,vN,vC;varying vec2 vProps;void main(){vP=position;vN=normal;vC=baseColor;vProps=properties;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec3 vP,vN,vC;varying vec2 vProps;\n"+lighting+"\nvoid main(){vec3 n=normalize(vN)*(gl_FrontFacing?1.0:-1.0),v=normalize(eye-vP);vec3 rgb=vC*(1.0-vProps.y)*lightDiffuse(vP,n)+lightSpec(vP,n,v,vProps.x,mix(vec3(.04),vC,vProps.y));gl_FragColor=vec4(clamp(rgb,0.0,8.0),1.0);}"});
const scene=new T.Scene();target.material=targetMat;
const approxMesh=new T.Mesh(geom,surround);scene.add(target,approxMesh);
const bakedGroup=new T.Group();bakedGroup.visible=false;scene.add(bakedGroup);
const bakedMeshes=[];
if(bay.bakedSurround){
  const bm=await json("/baked-surround");
  const paper=bay.objects.find(x=>bm.retainedPaper.includes(x.object));
  check(paper,"retained paper");
  const pg=new T.BufferGeometry(),pp=[],pn=[],pc=[],pr=[];
  for(let i=paper.firstVertex;i<paper.firstVertex+paper.vertexCount;i++){
    const k=i*11;pp.push(...rows.slice(k,k+3));pn.push(...rows.slice(k+3,k+6));pc.push(...rows.slice(k+6,k+9));pr.push(rows[k+9],rows[k+10]);
  }
  pg.setAttribute("position",new T.Float32BufferAttribute(pp,3));pg.setAttribute("normal",new T.Float32BufferAttribute(pn,3));pg.setAttribute("baseColor",new T.Float32BufferAttribute(pc,3));pg.setAttribute("properties",new T.Float32BufferAttribute(pr,2));
  const pm=new T.Mesh(pg,surround);pm.name=paper.object;bakedGroup.add(pm);
  for(const [surfaceIndex,item] of bm.objects.entries()){
    const [vertices,rgba]=await Promise.all([floats("/"+item.id+".f32"),floats("/"+item.id+".rgba32f")]);
    check(vertices.length===item.vertices*5&&rgba.length===item.width*item.height*4,"baked array sizes");
    const p=[],uv=[];for(let i=0;i<vertices.length;i+=5){p.push(...vertices.slice(i,i+3));uv.push(...vertices.slice(i+3,i+5));}
    const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(p,3));g.setAttribute("uv",new T.Float32BufferAttribute(uv,2));
    const faceIds=Float32Array.from({length:item.vertices},(_,i)=>Math.floor(i/3)+1);
    g.setAttribute("faceId",new T.BufferAttribute(faceIds,1));
    const texture=tex(rgba,item.width,item.height,T.FloatType);
    const mat=new T.ShaderMaterial({side:T.DoubleSide,toneMapped:false,uniforms:{map:{value:texture},sz:{value:new T.Vector2(item.width,item.height)}},
      vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:["varying vec2 vUv;uniform sampler2D map;uniform vec2 sz;",
      "vec3 at(vec2 p){return texture2D(map,(clamp(p,vec2(0.0),sz-1.0)+.5)/sz).rgb;}",
      "void main(){vec2 p=vUv*sz-.5,i=floor(p),f=fract(p);vec3 a=mix(at(i),at(i+vec2(1,0)),f.x),b=mix(at(i+vec2(0,1)),at(i+1.0),f.x);gl_FragColor=vec4(mix(a,b,f.y),1.0);}"].join("\n")});
    const mesh=new T.Mesh(g,mat);mesh.name=item.object;mesh.userData.bake={rgba,width:item.width,height:item.height,id:surfaceIndex+1};bakedMeshes.push(mesh);bakedGroup.add(mesh);
  }
  check(bakedMeshes.length===9,"baked mesh count");
}
const lut=tex(lutRaw,a.lut.width,a.lut.height,T.UnsignedByteType);
const shader=new T.ShaderMaterial({toneMapped:false,depthTest:false,depthWrite:false,uniforms:{source:{value:floatRT.texture},lut:{value:lut},size:{value:a.lut.size},atlas:{value:new T.Vector2(a.lut.width,a.lut.height)},shaperK:{value:a.lut.shaperK},limit:{value:a.lut.domain[1]}},vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",fragmentShader:[
"precision highp float;varying vec2 vUv;uniform sampler2D source,lut;uniform float size,shaperK,limit;uniform vec2 atlas;",
"vec3 at(vec3 p){float i=p.x+size*(p.y+size*p.z);return texture2D(lut,(vec2(mod(i,atlas.x),floor(i/atlas.x))+.5)/atlas).rgb;}",
"vec3 transform(vec3 linear){vec3 p=log(vec3(1.0)+shaperK*clamp(linear,0.0,limit))/log(1.0+shaperK*limit)*(size-1.0);vec3 a=floor(p),f=fract(p),b=min(a+1.0,vec3(size-1.0));vec3 l0=mix(mix(at(a),at(vec3(b.x,a.y,a.z)),f.x),mix(at(vec3(a.x,b.y,a.z)),at(vec3(b.x,b.y,a.z)),f.x),f.y);vec3 l1=mix(mix(at(vec3(a.x,a.y,b.z)),at(vec3(b.x,a.y,b.z)),f.x),mix(at(vec3(a.x,b.y,b.z)),at(b),f.x),f.y);return mix(l0,l1,f.z);}",
"void main(){gl_FragColor=vec4(transform(texture2D(source,vUv).rgb),1.0);}"
].join("\n")});
const post=new T.Scene(),pc=new T.Camera();post.add(new T.Mesh(new T.PlaneGeometry(2,2),shader));
const min=V(bay.bounds[0]),max=V(bay.bounds[1]),center=min.clone().add(max).multiplyScalar(.5),span=max.clone().sub(min);
const originalEye=new T.Vector3().setFromMatrixPosition(matrix(b.camera.world)),dir=originalEye.sub(center);dir.z=0;dir.normalize();
const cam=new T.PerspectiveCamera(42,w/h,.05,150);cam.up.set(0,0,1);
let yaw=0,pitch=.025,zoom=1,drag=null;const distance=Math.max(span.z,span.y,span.x)*1.7;
function render(cw=w,ch=h){R.setSize(cw,ch,false);floatRT.setSize(cw,ch);cam.aspect=cw/ch;cam.updateProjectionMatrix();const v=dir.clone().applyAxisAngle(new T.Vector3(0,0,1),yaw);cam.position.copy(center).addScaledVector(v,distance*zoom);cam.position.z+=pitch*distance;cam.lookAt(center);cam.updateMatrixWorld(true);lightU.eye.value.copy(cam.position);R.setRenderTarget(floatRT);R.render(scene,cam);shader.uniforms.source.value=floatRT.texture;R.setRenderTarget(null);R.render(post,pc);check(gl.getError()===gl.NO_ERROR,"bay rendering");}
const capture=()=>{const raw=new Uint8Array(canvas.width*canvas.height*4);gl.readPixels(0,0,canvas.width,canvas.height,gl.RGBA,gl.UNSIGNED_BYTE,raw);let lit=0;for(let i=0;i<raw.length;i+=4)if(Math.max(raw[i],raw[i+1],raw[i+2])>15)lit++;return {png:canvas.toDataURL("image/png"),lit,width:canvas.width,height:canvas.height};};
canvas.addEventListener("pointerdown",e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(!drag)return;yaw=Math.max(-.6,Math.min(.6,yaw+(e.clientX-drag[0])*.004));pitch=Math.max(-.3,Math.min(.3,pitch+(e.clientY-drag[1])*.003));drag=[e.clientX,e.clientY];render(canvas.width,canvas.height);});canvas.addEventListener("pointerup",()=>drag=null);canvas.addEventListener("pointercancel",()=>drag=null);
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.65,Math.min(1.5,zoom+e.deltaY*.001));render(canvas.width,canvas.height);},{passive:false});
document.querySelector("#reset").onclick=()=>{yaw=0;pitch=.025;zoom=1;render(canvas.width,canvas.height);};
window.__capture=capture;window.__resize=(cw,ch)=>render(cw,ch);
window.__setBaked=flag=>{check(bakedMeshes.length===9,"baked package unavailable");approxMesh.visible=!flag;bakedGroup.visible=flag;render(canvas.width,canvas.height);};
window.__checkBaked=()=>{
  check(bakedGroup.visible&&!approxMesh.visible,"baked mode");
  const w=canvas.width,h=canvas.height,pixels=new Float32Array(w*h*4);
  R.readRenderTargetPixels(floatRT,0,0,w,h,pixels);check(gl.getError()===gl.NO_ERROR,"baked framebuffer readback");
  // Second pass: identical geometry, order, camera, depth and vertex transform;
  // encode UV + object + face rather than texture color. Do not infer identity
  // from a color match. Retain the original independent CPU ray gate.
  const objects=[target,...bakedGroup.children],old=objects.map(o=>o.material);
  const ids=new Float32Array(w*h*4),masks=[];
  try{
    for(const o of objects){
      const q=o.userData.bake;
      const mat=new T.ShaderMaterial({side:T.DoubleSide,toneMapped:false,uniforms:{surfaceId:{value:q?q.id:-1}},
        vertexShader:q?"attribute float faceId;varying vec2 vUv;varying float vFace;void main(){vUv=uv;vFace=faceId;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}":"void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
        fragmentShader:q?"varying vec2 vUv;varying float vFace;uniform float surfaceId;void main(){gl_FragColor=vec4(vUv,surfaceId,vFace);}":"uniform float surfaceId;void main(){gl_FragColor=vec4(0.0,0.0,surfaceId,0.0);}"});
      masks.push(mat);o.material=mat;
    }
    R.setRenderTarget(floatRT);R.render(scene,cam);R.readRenderTargetPixels(floatRT,0,0,w,h,ids);
    check(gl.getError()===gl.NO_ERROR,"baked UV identity pass");
  }finally{
    objects.forEach((o,i)=>o.material=old[i]);masks.forEach(m=>m.dispose());render(w,h);
  }
  const raycaster=new T.Raycaster(),result={tested:0,bad:0,maxAbs:0,perObject:{},gpuSamples:0,gpuBad:0,gpuMaxAbs:0,identityMismatch:0,maxUV:0,anomalies:[],worst:null};
  for(const m of bakedMeshes)result.perObject[m.name]=0;
  const pt=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),bc=new T.Vector3();
  function sampled(q,uv){return [0,1,2].map(ch=>sample(q.rgba,uv,q.width,q.height,4,false,ch));}
  function delta(a,b){return Math.max(...a.map((v,i)=>Math.abs(v-b[i])));}
  for(let iy=0;iy<36;iy++)for(let ix=0;ix<48;ix++){
    const x=Math.floor((ix+.5)*w/48),y=Math.floor((iy+.5)*h/36),k=(y*w+x)*4;
    const gpuId=Math.round(ids[k+2]),gpuFace=Math.round(ids[k+3])-1,gpuUV=[ids[k],ids[k+1]],gpuRGB=Array.from(pixels.slice(k,k+3));
    const gm=bakedMeshes.find(m=>m.userData.bake.id===gpuId);
    let gpuExpected=null,gpuError=null;
    if(gm){
      check(gpuFace>=0&&gpuFace<gm.geometry.attributes.position.count/3&&gpuUV.every(v=>Number.isFinite(v)&&v>=0&&v<=1),"invalid raster identity");
      gpuExpected=sampled(gm.userData.bake,gpuUV);gpuError=delta(gpuExpected,gpuRGB);
      result.gpuSamples++;result.gpuMaxAbs=Math.max(result.gpuMaxAbs,gpuError);if(gpuError>.01)result.gpuBad++;
    }
    raycaster.setFromCamera(new T.Vector2(2*(x+.5)/w-1,2*(y+.5)/h-1),cam);
    const hits=raycaster.intersectObjects(objects,false),hit=hits[0];
    if(!hit||!hit.object.userData.bake||!hit.uv||!hit.face)continue;
    const g=hit.object.geometry.attributes.position;
    a.fromBufferAttribute(g,hit.face.a);b.fromBufferAttribute(g,hit.face.b);c.fromBufferAttribute(g,hit.face.c);
    pt.copy(hit.point);hit.object.worldToLocal(pt);T.Triangle.getBarycoord(pt,a,b,c,bc);
    if(Math.min(bc.x,bc.y,bc.z)<.025)continue;
    const q=hit.object.userData.bake,cpuUV=[hit.uv.x,hit.uv.y],cpuRGB=sampled(q,cpuUV),error=delta(cpuRGB,gpuRGB);
    const identity=q.id===gpuId&&hit.faceIndex===gpuFace;
    const uvError=identity?delta(cpuUV,gpuUV):null;
    if(identity)result.maxUV=Math.max(result.maxUV,uvError);else result.identityMismatch++;
    check(Number.isFinite(error),"non-finite baked sample");result.maxAbs=Math.max(result.maxAbs,error);
    result.tested++;result.perObject[hit.object.name]++;if(error>.01)result.bad++;
    if(error>.01||!identity||gpuError>.01||!result.worst||error>result.worst.error){
      const neighborIds=[];
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(x+dx<0||x+dx>=w||y+dy<0||y+dy>=h)continue;
        const j=((y+dy)*w+x+dx)*4;neighborIds.push({dx,dy,id:Math.round(ids[j+2]),face:Math.round(ids[j+3])-1});
      }
      const detail={x,y,object:hit.object.name,cpuId:q.id,cpuFace:hit.faceIndex,cpuUV,cpuRGB,barycentric:bc.toArray(),gpuId,gpuFace,gpuUV,gpuRGB,gpuExpected,gpuError,identity,uvError,error,neighborIds,rayHits:hits.slice(0,3).map(h=>({object:h.object.name,face:h.faceIndex,distance:h.distance}))};
      if(!result.worst||error>result.worst.error)result.worst=detail;
      if(error>.01||!identity||gpuError>.01)result.anomalies.push(detail);
    }
  }
  return result;
};
render();window.__result={status:"PASS_BAY_BINDING",metrics,triangles:bay.triangles,objects:bay.objects.length,actualBay:true,sourceRoughness:true,agxLive:true,geometryBudgetOnly:true,artisticApproval:false,physicalDeviceQualified:false,publishable:false};
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__metrics||null});`;
const files=new Map([["/",["text/html",Buffer.from(html)]],["/style.css",["text/css",Buffer.from(css)]],["/bay.js",["application/javascript",Buffer.from(js)]],["/three.js",["application/javascript",engine]],...[[ "/binding",src,"surface-binding.json"],["/package",src,"material-package.json"],["/bay",bayDir,"bay.json"],["/oracle",ctx,"context-oracle.json"],["/agx",agx,"agx-lut.json"]].map(([url,d,n])=>[url,["application/json",read(d,n)]]),...[[ "/texture",texture],["/rough",rough],["/rows",rows],["/occ",occ],["/lut",lutBytes]].map(([url,data])=>[url,["application/octet-stream",data]])]);
if(bakedManifest){files.set("/bay",["application/json",Buffer.from(JSON.stringify({...bay,bakedSurround:true}))]);for(const [url,value] of bakedFiles)files.set(url,value);}
const server=createServer((req,res)=>{res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self'; object-src 'none'; base-uri 'none'");res.setHeader("X-Content-Type-Options","nosniff");const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);});
let browser;const report={schema:"atlas.asc01.bay-browser/v1",revision:process.env.ATLAS_EXACT_HEAD,sourceRevision:b.revision,masterSha256:b.masterSha256,packageSha256:f.packageSha256,baySha256:bay.sha256,externalRequests:[],pageErrors:[],status:"PENDING",views:{}};
try{await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});const origin="http://127.0.0.1:"+server.address().port;
browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});const c=await browser.newContext({viewport:{width:800,height:650}});await c.route("**/*",r=>{if(new URL(r.request().url()).origin!==origin){report.externalRequests.push(r.request().url());return r.abort();}return r.continue();});const page=await c.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));await page.goto(origin+"/");await page.waitForFunction(()=>window.__result,{},{timeout:180000});report.result=await page.evaluate(()=>window.__result);assert.equal(report.result.status,"PASS_BAY_BINDING",JSON.stringify(report.result));
async function capture(name){const v=await page.evaluate(()=>window.__capture());const raw=Buffer.from(v.png.split(",")[1],"base64");writeFileSync(join(out,name+".png"),raw);report.views[name]={sha256:sha(raw),width:v.width,height:v.height,lit:v.lit};assert(v.lit>v.width*v.height*.04,"empty preview");}
if(bakedManifest){
  await capture("approximate");
  await page.evaluate(()=>window.__setBaked(true));
  report.surround={manifestSha256:sha(read(surroundDir,"baked-surround.json")),sourceRevision:bakedManifest.revision,replayed:!!bakedReplay,objects:bakedManifest.objects.length,retainedPaper:bakedManifest.retainedPaper,reference:await page.evaluate(()=>window.__checkBaked())};
}
await capture("reference");
if(bakedManifest)assert.notEqual(report.views.approximate.sha256,report.views.reference.sha256,"baked material has no visible effect");
const box=await page.locator("canvas").boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+10,{steps:4});await page.mouse.up();await capture("rotated");assert.notEqual(report.views.reference.sha256,report.views.rotated.sha256,"pointer navigation");
if(bakedManifest){
  report.surround.rotated=await page.evaluate(()=>window.__checkBaked());

  report.surround.visibleObjects=Object.keys(report.surround.reference.perObject).filter(k=>report.surround.reference.perObject[k]+report.surround.rotated.perObject[k]>0);
  assert(report.surround.visibleObjects.length>=3,"insufficient visible surface coverage");
}
await page.locator("#reset").click();await capture("restored");assert.equal(report.views.reference.sha256,report.views.restored.sha256,"camera restore");
await page.evaluate(()=>window.__resize(320,240));await capture("mobile");assert.equal(report.views.mobile.width,320);assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);
if(bakedManifest){
  for(const v of ["reference","rotated"]){
    const x=report.surround[v];
    assert(x.tested>=100&&x.gpuSamples>=100&&x.bad===0&&x.gpuBad===0,JSON.stringify({view:v,tested:x.tested,bad:x.bad,gpuBad:x.gpuBad,worst:x.worst,anomalies:x.anomalies}));
  }
}
report.status=bakedManifest?"PASS_BAKED_BAY_PREVIEW":"PASS_NAVIGABLE_BAY_PREVIEW";
}catch(e){report.status="FAIL";report.error=String(e);throw e;}finally{writeFileSync(join(out,"bay-browser.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC BAY BROWSER",JSON.stringify(report));if(browser)await browser.close();server.close();}
