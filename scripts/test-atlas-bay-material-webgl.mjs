import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";
const [src,ctx,agx,bayDir,out,enginePath]=process.argv.slice(2).map(resolvePath=>resolve(resolvePath));
const sha=b=>createHash("sha256").update(b).digest("hex");
const read=(d,n)=>readFileSync(join(d,n));
const json=(d,n)=>JSON.parse(read(d,n));
const engine=readFileSync(enginePath);
const bridgePath=process.argv[8],loaderPath=process.argv[9],bridgeReceiptPath=process.argv[10];
assert.equal(Boolean(bridgePath),Boolean(loaderPath),"loader must accompany isolated GLB");
assert.equal(Boolean(bridgePath),Boolean(bridgeReceiptPath),"receipt must accompany isolated GLB");
const bridge=bridgePath?(()=>{
  const bytes=readFileSync(resolve(bridgePath)),loader=readFileSync(resolve(loaderPath));
  const receipt=JSON.parse(readFileSync(resolve(bridgeReceiptPath),"utf8"));
  assert.equal(receipt.status,"PASS_ISOLATED_BAKE_AND_GLTF");
  assert.equal(receipt.revision,"4ad58f761246a317461c08dc7c78563a25fa2eda");
  assert.equal(receipt.surface.name,"Library bay 04-0-Bay Walnut");
  assert.equal(receipt.masterUnchanged,true);
  assert.equal(sha(bytes),receipt.export.sha256);
  const gitblob=b=>createHash("sha1").update(Buffer.concat([Buffer.from("blob "+b.length+"\0"),b])).digest("hex");
  assert.equal(gitblob(loader),"cfa518ede1b0893f1da14347d78fcd19355f3686");
  return {bytes,loader,receipt};
})():null;
assert.equal(createHash("sha1").update(Buffer.concat([Buffer.from("blob "+engine.length+"\0"),engine])).digest("hex"),"b14f47c0908bab15e890b468d53bb07db0be3a18");
const b=json(src,"surface-binding.json"),m=json(src,"material-package.json"),f=json(src,"material-finish.json");
const bay=json(bayDir,"bay.json"),oracle=json(ctx,"context-oracle.json"),lut=json(agx,"agx-lut.json"),prior=json(agx,"agx-browser.json");
const texture=read(src,"binding.rgba32f"),rough=read(src,"roughness.rgb8"),rows=read(bayDir,"bay.f32"),occ=read(ctx,"occluders.f32"),lutBytes=read(agx,"lut.rgba8");
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
const BRIDGE=__ASC_BAKED_BRIDGE__;
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
const BAKE_OBJECT="Library bay 04-0-Bay Walnut";
function geometryFor(predicate){
  const g=new T.BufferGeometry(),p=[],n=[],c=[],props=[];
  for(const obj of bay.objects){
    if(!predicate(obj))continue;
    for(let i=obj.firstVertex;i<obj.firstVertex+obj.vertexCount;i++){
      const k=i*11;
      p.push(...rows.slice(k,k+3));n.push(...rows.slice(k+3,k+6));
      c.push(...rows.slice(k+6,k+9));props.push(rows[k+9],rows[k+10]);
    }
  }
  g.setAttribute("position",new T.Float32BufferAttribute(p,3));
  g.setAttribute("normal",new T.Float32BufferAttribute(n,3));
  g.setAttribute("baseColor",new T.Float32BufferAttribute(c,3));
  g.setAttribute("properties",new T.Float32BufferAttribute(props,2));
  return g;
}
const geom=geometryFor(obj=>obj.object!==bay.target&&(!BRIDGE||obj.object!==BAKE_OBJECT));
const walnutGeom=BRIDGE?geometryFor(obj=>obj.object===BAKE_OBJECT):null;
if(BRIDGE)check(bay.objects.filter(obj=>obj.object===BAKE_OBJECT).length===1&&walnutGeom.attributes.position.count===864*3,"bound Walnut inventory");
const surround=new T.ShaderMaterial({side:T.DoubleSide,uniforms:lightU,vertexShader:"attribute vec3 baseColor;attribute vec2 properties;varying vec3 vP,vN,vC;varying vec2 vProps;void main(){vP=position;vN=normal;vC=baseColor;vProps=properties;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec3 vP,vN,vC;varying vec2 vProps;\n"+lighting+"\nvoid main(){vec3 n=normalize(vN)*(gl_FrontFacing?1.0:-1.0),v=normalize(eye-vP);vec3 rgb=vC*(1.0-vProps.y)*lightDiffuse(vP,n)+lightSpec(vP,n,v,vProps.x,mix(vec3(.04),vC,vProps.y));gl_FragColor=vec4(clamp(rgb,0.0,8.0),1.0);}"});
const scene=new T.Scene();target.material=targetMat;scene.add(target,new T.Mesh(geom,surround));
const walnutSource=BRIDGE?new T.Mesh(walnutGeom,surround):null;
if(walnutSource)scene.add(walnutSource);
let bakedRoot=null,bridgeInfo=null;
if(BRIDGE){
  check(T.GLTFLoader,"pinned GLTFLoader");
  const manager=new T.LoadingManager();
  manager.setURLModifier(url=>{check(url.startsWith("blob:"),"nonembedded glTF URI");return url;});
  const loader=new T.GLTFLoader(manager);
  loader.register(parser=>{
    parser.textureLoader=new T.TextureLoader(parser.options.manager);
    parser.textureLoader.setCrossOrigin(parser.options.crossOrigin);
    return {name:"ATLAS_BRIDGE_embedded_image_decoder"};
  });
  const payload=await bytes("/baked.glb");
  const gltf=await new Promise((res,rej)=>loader.parse(payload.buffer,"",res,rej));
  check(gltf.parser.json.materials?.length===1&&gltf.parser.json.meshes?.length===1&&gltf.parser.json.images?.length===1,"one surface GLB");
  check(gltf.parser.json.materials[0].emissiveTexture?.texCoord===1,"baked texture must use UV2");
  const meshes=[];gltf.scene.traverse(x=>{if(x.isMesh)meshes.push(x)});
  check(meshes.length===1,"one baked mesh");
  const original=meshes[0],uv0=original.geometry.attributes.uv,uv2=original.geometry.attributes.uv2;
  check(uv0&&uv2&&uv0.count===uv2.count&&original.material.emissiveMap,"embedded image and UV2");
  const bakedGeometry=original.geometry.clone();
  bakedGeometry.setAttribute("uv",uv2.clone());
  const texture=original.material.emissiveMap;
  texture.encoding=T.sRGBEncoding;texture.needsUpdate=true;
  const bakedMaterial=new T.MeshBasicMaterial({map:texture,color:0xffffff,side:T.DoubleSide,toneMapped:false});
  const bakedMesh=new T.Mesh(bakedGeometry,bakedMaterial);bakedMesh.matrixAutoUpdate=false;
  original.updateMatrixWorld(true);bakedMesh.matrix.copy(original.matrixWorld);
  bakedRoot=new T.Group();bakedRoot.rotation.x=Math.PI/2;
  bakedRoot.add(bakedMesh);scene.add(bakedRoot);bakedRoot.updateMatrixWorld(true);bakedRoot.visible=false;
  walnutGeom.computeBoundingBox();
  const expected=walnutGeom.boundingBox,actual=new T.Box3().setFromObject(bakedRoot);
  const centerDelta=expected.getCenter(new T.Vector3()).sub(actual.getCenter(new T.Vector3()));
  const sizeA=expected.getSize(new T.Vector3()),sizeB=actual.getSize(new T.Vector3());
  const sizeDelta=Math.max(...[0,1,2].map(i=>Math.abs(sizeA.getComponent(i)-sizeB.getComponent(i))));
  const bakedTriangles=bakedGeometry.index?bakedGeometry.index.count/3:bakedGeometry.attributes.position.count/3;
  check(bakedTriangles===864&&sizeDelta<.0005&&centerDelta.length()<.05,
    "GLB rigid registration failed "+JSON.stringify({sizeA:sizeA.toArray(),sizeB:sizeB.toArray(),centerDelta:centerDelta.toArray(),sizeDelta,bakedTriangles}));
  // Blender and glTF use different scene origins. Only a verified rigid translation
  // is permitted; reject changed silhouettes and changed source triangles.
  bakedRoot.position.add(centerDelta);bakedRoot.updateMatrixWorld(true);
  const aligned=new T.Box3().setFromObject(bakedRoot);
  const boundDelta=Math.max(...[0,1,2].flatMap(i=>[
    Math.abs(expected.min.getComponent(i)-aligned.min.getComponent(i)),
    Math.abs(expected.max.getComponent(i)-aligned.max.getComponent(i))
  ]));
  function canonicalTriangles(geometry,matrix){
    const positions=geometry.getAttribute("position"),indices=geometry.index;
    const n=indices?indices.count:positions.count;
    check(n%3===0&&n===864*3,"GLB indexed triangle coverage");
    const out=[],v=new T.Vector3();
    for(let i=0;i<n;i+=3){
      const tri=[];
      for(let j=0;j<3;j++){
        const k=indices?indices.getX(i+j):i+j;
        v.fromBufferAttribute(positions,k).applyMatrix4(matrix);
        tri.push(v.toArray().map(x=>Math.round(x*1e4)).join(","));
      }
      out.push(tri.sort().join("|"));
    }
    return out.sort();
  }
  const originals=canonicalTriangles(walnutGeom,new T.Matrix4());
  const imports=canonicalTriangles(bakedGeometry,bakedMesh.matrixWorld);
  const sameTriangles=originals.length===imports.length&&originals.every((x,i)=>x===imports[i]);
  check(boundDelta<.0005&&sameTriangles,"GLB triangle identity after rigid registration "+JSON.stringify({boundDelta,centerDelta:centerDelta.toArray(),sizeDelta,sameTriangles}));
  bridgeInfo={object:BAKE_OBJECT,sourceTriangles:864,bakedTriangles,boundDelta,sizeDelta,translation:centerDelta.toArray(),exactTriangleIdentity:sameTriangles,
    uv2Count:uv2.count,originalMaterial:original.material.type,
    bakedMaterial:bakedMaterial.type,textureSize:[texture.image.width,texture.image.height],
    sourceOtherObjectsUnmodified:true,bakedMaterialUnaffectedByDynamicLights:true};
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
if(BRIDGE){
  let baked=false;
  function show(value){
    check(typeof value==="boolean","bridge mode");
    baked=value;walnutSource.visible=!value;bakedRoot.visible=value;
    document.querySelector("#baked-switch").setAttribute("aria-pressed",String(value));
    render(canvas.width,canvas.height);
  }
  window.__bridge={show,info:bridgeInfo,get baked(){return baked;}};
  document.querySelector("#baked-switch").addEventListener("click",()=>show(!baked));
}
render();window.__result={status:"PASS_BAY_BINDING",metrics,triangles:bay.triangles,objects:bay.objects.length,actualBay:true,sourceRoughness:true,agxLive:true,geometryBudgetOnly:true,artisticApproval:false,physicalDeviceQualified:false,publishable:false};
})().catch(e=>window.__result={status:"FAIL",error:String(e),metrics:window.__metrics||null});`;
const actualJS=js.replace("__ASC_BAKED_BRIDGE__",bridge?"true":"false");
const candidateHtml=bridge?html.replace('<button id="reset">Ripristina</button>','<button id="reset">Ripristina</button><button id="baked-switch" type="button" aria-pressed="false">Luce precalcolata</button>').replace('<script src="/bay.js"></script>','<script src="/loader.js"></script><script src="/bay.js"></script>'):html;
const files=new Map([["/",["text/html",Buffer.from(candidateHtml)]],["/style.css",["text/css",Buffer.from(css)]],["/bay.js",["application/javascript",Buffer.from(actualJS)]],["/three.js",["application/javascript",engine]],...[[ "/binding",src,"surface-binding.json"],["/package",src,"material-package.json"],["/bay",bayDir,"bay.json"],["/oracle",ctx,"context-oracle.json"],["/agx",agx,"agx-lut.json"]].map(([url,d,n])=>[url,["application/json",read(d,n)]]),...[[ "/texture",texture],["/rough",rough],["/rows",rows],["/occ",occ],["/lut",lutBytes]].map(([url,data])=>[url,["application/octet-stream",data]])]);
if(bridge){
  files.set("/loader.js",["application/javascript",bridge.loader]);
  files.set("/baked.glb",["model/gltf-binary",bridge.bytes]);
}
const server=createServer((req,res)=>{res.setHeader("Content-Security-Policy","default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self' data: blob:; style-src 'self'; object-src 'none'; base-uri 'none'");res.setHeader("X-Content-Type-Options","nosniff");const f=files.get(req.url);if(!f){res.writeHead(404);res.end();return;}res.writeHead(200,{"Content-Type":f[0],"Cache-Control":"no-store"});res.end(f[1]);});
let browser;const report={schema:"atlas.asc01.bay-browser/v1",revision:process.env.ATLAS_EXACT_HEAD,sourceRevision:b.revision,masterSha256:b.masterSha256,packageSha256:f.packageSha256,baySha256:bay.sha256,externalRequests:[],pageErrors:[],status:"PENDING",views:{}};
try{await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});const origin="http://127.0.0.1:"+server.address().port;
browser=await chromium.launch({headless:true,args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});const c=await browser.newContext({viewport:{width:800,height:650}});await c.route("**/*",r=>{if(new URL(r.request().url()).origin!==origin){report.externalRequests.push(r.request().url());return r.abort();}return r.continue();});const page=await c.newPage();page.on("pageerror",e=>report.pageErrors.push(String(e)));await page.goto(origin+"/");await page.waitForFunction(()=>window.__result,{},{timeout:180000});report.result=await page.evaluate(()=>window.__result);assert.equal(report.result.status,"PASS_BAY_BINDING",JSON.stringify(report.result));
async function capture(name){const v=await page.evaluate(()=>window.__capture());const raw=Buffer.from(v.png.split(",")[1],"base64");writeFileSync(join(out,name+".png"),raw);report.views[name]={sha256:sha(raw),width:v.width,height:v.height,lit:v.lit};assert(v.lit>v.width*v.height*.04,"empty preview");}
await capture("reference");const box=await page.locator("canvas").boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+70,box.y+box.height/2+10,{steps:4});await page.mouse.up();await capture("rotated");assert.notEqual(report.views.reference.sha256,report.views.rotated.sha256,"pointer navigation");
await page.locator("#reset").click();await capture("restored");assert.equal(report.views.reference.sha256,report.views.restored.sha256,"camera restore");
await page.evaluate(()=>window.__resize(320,240));await capture("mobile");assert.equal(report.views.mobile.width,320);
if(bridge){
  await page.evaluate((w,h)=>window.__resize(w,h),b.camera.width,b.camera.height);
  report.bridge=await page.evaluate(()=>window.__bridge.info);
  await capture("bridge-original");
  await page.getByRole("button",{name:"Luce precalcolata"}).click();
  assert.equal(await page.evaluate(()=>window.__bridge.baked),true);
  await capture("bridge-baked");
  await page.getByRole("button",{name:"Luce precalcolata"}).click();
  await capture("bridge-restored");
  assert.equal(report.views["bridge-original"].sha256,report.views["bridge-restored"].sha256,"GLB rollback exact");
  report.bridge.changed=report.views["bridge-original"].sha256!==report.views["bridge-baked"].sha256;
  assert(report.bridge.changed,"baked material must change the full-bay pixels in a matched view");
  report.bridge.glbSha256=sha(bridge.bytes);
  report.bridge.unchangedScene=true;
  report.bridge.artisticApproval=false;
  report.bridge.publishable=false;
}
assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.pageErrors,[]);report.status="PASS_NAVIGABLE_BAY_PREVIEW";
}catch(e){report.status="FAIL";report.error=String(e);throw e;}finally{writeFileSync(join(out,"bay-browser.json"),JSON.stringify(report,null,2)+"\n");console.log("ASC BAY BROWSER",JSON.stringify(report));if(browser)await browser.close();server.close();}
