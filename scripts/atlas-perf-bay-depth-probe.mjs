// PERF-05B/P3 — compare a planar and measured depth mesh for the same complete bay.
// Fixed-view experiment only. No production/runtime binding.
import assert from "node:assert/strict";
import {writeFileSync,mkdirSync} from "node:fs";
import {join} from "node:path";
export async function runBayDepthProbe({page,frame,out,manifest}){
 const receipt={schema:"atlas.perf.bay-depth/v1",status:"PENDING",assets:manifest.assets.map(a=>({id:a.id,sha256:a.sha256})),views:[],artisticApproval:false,publishable:false,studentAuthorized:false};
 mkdirSync(out,{recursive:true});const save=()=>writeFileSync(join(out,"bay-depth.json"),JSON.stringify(receipt,null,2)+"\n");
 const originalViewport=page.viewportSize();assert(originalViewport);
 try{
  for(const v of [{id:"atrium",width:900,height:700,orbit:0},{id:"wide-left",width:1920,height:1080,orbit:-.22},{id:"wide-right",width:1920,height:1080,orbit:.22},{id:"portrait",width:393,height:873,orbit:0}]){
   await page.setViewportSize({width:v.width,height:v.height});
   await frame.waitForFunction(q=>innerWidth===q.width&&innerHeight===q.height,v,{timeout:15000});
   const e=await frame.evaluate(v=>{
    if(!ready||closing||motion)throw Error("Native scene inactive");
    const old={angle,tilt,distance},gl=renderer.getContext(),group=scene.children.find(o=>o.name==="Native bay visibility batches");
    if(!group)throw Error("Missing real bay batches");
    const count=()=>({triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,points:renderer.info.render.points});
    const hit=()=>NATIVE_PORTALS.map(p=>{const q=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);return {id:p.id,hit:hitPortal((q.x+1)*innerWidth/2,(1-q.y)*innerHeight/2)}});
    const shot=()=>{
      render();const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw Error("Readback");
      return {counts:count(),buffer:[w,h],camera:camera.projectionMatrix.toArray().concat(camera.matrixWorld.toArray()),hits:hit(),pixels,image:canvas.toDataURL("image/png")};
    };
    const compare=(a,b,roi)=>{
      if(a.pixels.length!==b.pixels.length)throw Error("Buffer drift");
      let sum=0,changed=0,max=0,local=0,localN=0,localChanged=0;
      for(let i=0;i<a.pixels.length;i+=4){
        let d=0,s=0;for(let k=0;k<3;k++){const x=Math.abs(a.pixels[i+k]-b.pixels[i+k]);d=Math.max(x,d);s+=x}sum+=s;if(d)changed++;max=Math.max(max,d);
        const x=(i/4)%a.buffer[0],y=Math.floor(i/4/a.buffer[0]);
        if(roi&&x>=roi[0]&&x<=roi[2]&&y>=roi[1]&&y<=roi[3]){local+=s;localN++;if(d)localChanged++}
      }
      return {changedPixels:changed,meanAbsoluteRGBDelta:sum/(a.pixels.length/4*3*255),maxChannelDelta:max,roiPixels:localN,roiChanged:localChanged,roiMeanAbsoluteRGBDelta:localN?local/(localN*3*255):null};
    };
    const triangles=o=>(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
    const matches=(a,b)=>a.elements.every((x,i)=>Math.abs(x-b.elements[i])<1e-5*Math.max(1,Math.abs(x),Math.abs(b.elements[i])));
    const corners=o=>{
      if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
      return Array.from({length:8},(_,i)=>new THREE.Vector3(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).applyMatrix4(o.matrixWorld));
    };
    let target=null,depthTarget=null,depthMat=null,depthGeometry=null,plane=null,mat=null,proxy=null,depthProxy=null,selected=null;const mutations=[];
    const restore=()=>{if(proxy)group.remove(proxy);if(depthProxy)group.remove(depthProxy);for(const q of mutations){q.mats.forEach((m,i)=>q.batch.setMatrixAt(i,m));q.batch.count=q.mats.length;q.batch.visible=q.visible;q.batch.instanceMatrix.needsUpdate=true}};
    try{
      angle=v.orbit;tilt=0;distance=1;setCamera();const baseline=shot(),[w,h]=baseline.buffer;
      const batches=group.children.filter(o=>o.isInstancedMesh&&o.count>0).map(batch=>({batch,visible:batch.visible,mats:Array.from({length:batch.count},(_,i)=>{const m=new THREE.Matrix4();batch.getMatrixAt(i,m);return m})}));
      const bays=new Map();
      groupMap.bays.traverse(o=>{
        if(!o.isMesh)return;
        const m=o.name.match(/^(Library_bay_\d+-\d+-Bay)_(Book_[0-5]|Paper)$/i);
        if(!m)return;const key=m[1],a=bays.get(key)||[];a.push({o,part:m[2]});bays.set(key,a);
      });
      const candidates=[];
      for(const [id,parts] of bays){
        if(parts.length!==7||new Set(parts.map(p=>p.part)).size!==7)continue;
        const bound=parts.map(p=>{
          const q=batches.find(q=>q.batch.geometry===p.o.geometry&&q.batch.material===p.o.material);
          if(!q)return null;const indexes=q.mats.map((m,i)=>matches(m,p.o.matrixWorld)?i:-1).filter(i=>i>=0);
          return indexes.length===1?{...p,q,index:indexes[0]}:null;
        });
        if(bound.some(x=>!x)||new Set(bound.map(x=>x.q.batch)).size!==7)continue;
        const pts=bound.flatMap(x=>corners(x.o)),box=new THREE.Box3().setFromPoints(pts),center=box.getCenter(new THREE.Vector3());
        const direction=camera.position.clone().sub(center).normalize(),up=new THREE.Vector3(0,1,0);
        const axes=[0,1,2].map(k=>new THREE.Vector3().setFromMatrixColumn(parts[0].o.matrixWorld,k).normalize()).filter(a=>Math.abs(a.y)<.1);
        if(axes.length!==2)continue;
        const bounds=axis=>{const vs=pts.map(p=>p.clone().sub(center).dot(axis));return [Math.min(...vs),Math.max(...vs)]};
        const depthAxis=axes.sort((a,b)=>{const x=bounds(a),y=bounds(b);return (x[1]-x[0])-(y[1]-y[0])})[0];
        const normal=depthAxis.clone().multiplyScalar(Math.sign(depthAxis.dot(direction)));
        if(normal.dot(direction)<.88)continue;
        const right=up.clone().cross(normal).normalize(),realUp=normal.clone().cross(right).normalize();
        const X=bounds(right),Y=bounds(realUp),Z=bounds(normal);
        let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,valid=true;
        for(const p of pts){const q=p.clone().project(camera);if(q.z<=-1||q.z>=1||![q.x,q.y,q.z].every(Number.isFinite)){valid=false;break}const x=(q.x+1)*w/2,y=(q.y+1)*h/2;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}
        if(!valid||minX<2||minY<2||maxX>w-2||maxY>h-2||Math.max(maxX-minX,maxY-minY)>420||Math.min(maxX-minX,maxY-minY)<12)continue;
        const roi=[Math.floor(minX),Math.floor(minY),Math.ceil(maxX),Math.ceil(maxY)];
        const total=bound.reduce((s,p)=>s+triangles(p.o),0);
        candidates.push({id,bound,center,normal,right,up:realUp,X,Y,Z,roi,total,facing:normal.dot(direction)});
      }
      candidates.sort((a,b)=>b.facing-a.facing||b.total-a.total||a.id.localeCompare(b.id));selected=candidates[0]||null;
      let candidate=baseline,flat=baseline,restored=baseline,texture=null,depthEvidence=null;
      if(selected){
        const {bound,center,normal,right,up,X,Y,Z}=selected;
        // All seven original meshes in their world positions. Preserve native
        // lighting and environment instead of inventing a local studio light.
        const bake=new THREE.Scene();bake.environment=scene.environment;
        for(const o of scene.children.filter(o=>o.isLight)){
          const l=o.clone();l.position.setFromMatrixPosition(o.matrixWorld);bake.add(l);
          if(o.target){l.target.position.setFromMatrixPosition(o.target.matrixWorld);bake.add(l.target)}
        }
        const lightCount=bake.children.filter(x=>x.isLight).length;if(lightCount!==3)throw Error("Unexpected native light inventory");
        for(const p of bound){const m=new THREE.Mesh(p.o.geometry,p.o.material);m.matrixAutoUpdate=false;m.matrix.copy(p.o.matrixWorld);bake.add(m)}
        const width=X[1]-X[0],height=Y[1]-Y[0],depth=Z[1]-Z[0];
        if(!(width>0&&height>0&&depth>0))throw Error("Invalid bay bounds");
        const middle=center.clone().addScaledVector(right,(X[0]+X[1])/2).addScaledVector(up,(Y[0]+Y[1])/2);
        const cameraDistance=Math.max(2,depth*4);
        const bc=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.001,cameraDistance+Math.max(10,depth*5));
        bc.position.copy(middle).addScaledVector(normal,cameraDistance);bc.up.copy(up);bc.lookAt(middle);bc.updateMatrixWorld(true);
        const rx=Math.max(64,Math.round(1024*width/Math.max(width,height))),ry=Math.max(64,Math.round(1024*height/Math.max(width,height)));
        target=new THREE.WebGLRenderTarget(rx,ry,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:THREE.UnsignedByteType});
        // Linear target, original ACES response applied once by the final proxy.
        target.texture.encoding=THREE.LinearEncoding;target.texture.generateMipmaps=false;
        const oldTarget=renderer.getRenderTarget(),clear=renderer.getClearColor(new THREE.Color()).clone(),alpha=renderer.getClearAlpha(),tone=renderer.toneMapping;
        try{
          renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.toneMapping=THREE.NoToneMapping;renderer.clear();renderer.render(bake,bc);
          const bytes=new Uint8Array(rx*ry*4);renderer.readRenderTargetPixels(target,0,0,rx,ry,bytes);
          let opaque=0,clipped=0;for(let i=0;i<bytes.length;i+=4)if(bytes[i+3]>127){opaque++;if(Math.max(bytes[i],bytes[i+1],bytes[i+2])===255)clipped++}
          if(!opaque)throw Error("Empty bay bake");texture={width:rx,height:ry,opaquePixels:opaque,clippedPixels:clipped,lightCount,storage:"linear RGBA8; highlights may clip"};
        }finally{renderer.setRenderTarget(oldTarget);renderer.setClearColor(clear,alpha);renderer.toneMapping=tone}
        plane=new THREE.PlaneGeometry(width,height);plane.applyMatrix4(new THREE.Matrix4().makeBasis(right,up,normal));plane.translate(...middle.clone().addScaledVector(normal,Z[1]).toArray());
        mat=new THREE.MeshBasicMaterial({map:target.texture,alphaTest:.5,side:THREE.FrontSide,toneMapped:true});proxy=new THREE.Mesh(plane,mat);proxy.frustumCulled=false;proxy.raycast=()=>{};
        for(const p of bound){
          const q=p.q;mutations.push(q);let n=0;q.mats.forEach((m,i)=>{if(i!==p.index)q.batch.setMatrixAt(n++,m)});q.batch.count=n;q.batch.visible=n>0;q.batch.instanceMatrix.needsUpdate=true;
        }
        group.add(proxy);flat=shot();group.remove(proxy);
        // Bake physical depth separately from radiance. White background is
        // not a valid sample; alpha is an explicit occupancy flag.
        depthTarget=new THREE.WebGLRenderTarget(rx,ry,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,type:THREE.UnsignedByteType});
        depthTarget.texture.encoding=THREE.LinearEncoding;depthTarget.texture.generateMipmaps=false;
        depthMat=new THREE.ShaderMaterial({
          vertexShader:"void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
          fragmentShader:"void main(){float v=clamp(gl_FragCoord.z,0.0,0.9999999)*16777215.0;float r=floor(v/65536.0);float g=floor((v-r*65536.0)/256.0);float b=floor(v-r*65536.0-g*256.0);gl_FragColor=vec4(r,g,b,255.0)/255.0;}",
          toneMapped:false,depthWrite:true,depthTest:true,side:THREE.FrontSide
        });
        const oldOverride=bake.overrideMaterial,previous=renderer.getRenderTarget(),previousClear=renderer.getClearColor(new THREE.Color()).clone(),previousAlpha=renderer.getClearAlpha(),previousTone=renderer.toneMapping;
        const raw=new Uint8Array(rx*ry*4);
        try{
          bake.overrideMaterial=depthMat;renderer.toneMapping=THREE.NoToneMapping;renderer.setRenderTarget(depthTarget);renderer.setClearColor(0,0);renderer.clear();renderer.render(bake,bc);
          renderer.readRenderTargetPixels(depthTarget,0,0,rx,ry,raw);
        }finally{bake.overrideMaterial=oldOverride;renderer.setRenderTarget(previous);renderer.setClearColor(previousClear,previousAlpha);renderer.toneMapping=previousTone}
        const depthAt=(x,y)=>{
          if(x<0||y<0||x>=rx||y>=ry)return null;
          const i=(y*rx+x)*4;if(raw[i+3]<128)return null;
          return (raw[i]*65536+raw[i+1]*256+raw[i+2])/16777215;
        };
        // At most 64 cells along the long axis. Sample the closest occupied
        // depth within half a cell only for boundary vertices; texture alpha
        // still defines the silhouette. No fabricated rear surfaces.
        const nx=Math.max(8,Math.round(64*width/Math.max(width,height))),ny=Math.max(8,Math.round(64*height/Math.max(width,height)));
        const positions=[],uv=[],indices=[],grid=[],physicalDepth=[];
        let expanded=0,missing=0,omitted=0;
        const rad=Math.max(1,Math.ceil(Math.max(rx/nx,ry/ny)*.5));
        for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
          const u=i/nx,v=j/ny,x=Math.min(rx-1,Math.round(u*(rx-1))),y=Math.min(ry-1,Math.round(v*(ry-1)));
          let z=depthAt(x,y);
          if(z===null){
            let best=Infinity;
            for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){
              const ds=dx*dx+dy*dy;if(ds>rad*rad||ds>=best)continue;const d=depthAt(x+dx,y+dy);if(d!==null){z=d;best=ds}
            }
            if(z!==null)expanded++;
          }
          if(z===null){grid.push(-1);physicalDepth.push(null);missing++;continue}
          const p=new THREE.Vector3(u*2-1,v*2-1,z*2-1).unproject(bc);
          const d=p.clone().sub(center).dot(normal);if(!Number.isFinite(d)||d<Z[0]-.005||d>Z[1]+.005)throw Error("Depth outside actual bay bounds");
          grid.push(positions.length/3);physicalDepth.push(d);positions.push(...p.toArray());uv.push(u,v);
        }
        const add=(a,b,c)=>{
          if([a,b,c].some(k=>grid[k]<0)){omitted++;return}
          const ds=[physicalDepth[a],physicalDepth[b],physicalDepth[c]];
          if(Math.max(...ds)-Math.min(...ds)>Math.max(.02,depth*.22)){omitted++;return}
          indices.push(grid[a],grid[b],grid[c]);
        };
        for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
          const a=j*(nx+1)+i,b=a+1,d=a+nx+1,c=d+1;add(a,b,c);add(a,c,d);
        }
        if(!indices.length||indices.length/3>=selected.total)throw Error("No useful depth mesh");
        depthGeometry=new THREE.BufferGeometry();depthGeometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));depthGeometry.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));depthGeometry.setIndex(indices);depthGeometry.computeBoundingSphere();
        depthProxy=new THREE.Mesh(depthGeometry,mat);depthProxy.frustumCulled=false;depthProxy.raycast=()=>{};
        depthEvidence={grid:[nx,ny],triangles:indices.length/3,vertices:positions.length/3,expandedBoundaryVertices:expanded,missingVertices:missing,omittedTriangles:omitted,depthRange:[Math.min(...physicalDepth.filter(x=>x!==null)),Math.max(...physicalDepth.filter(x=>x!==null))],encoding:"RGB24 normalized orthographic depth, explicit occupancy alpha"};
        group.add(depthProxy);candidate=shot();restore();restored=shot();
      }
      const clean=x=>({counts:x.counts,buffer:x.buffer,camera:x.camera,hits:x.hits});
      return {baseline:clean(baseline),candidate:clean(candidate),flat:clean(flat),restored:clean(restored),selection:selected?{id:selected.id,parts:selected.bound.map(p=>({name:p.o.name,triangles:triangles(p.o)})),expectedSavedTriangles:selected.total-depthEvidence.triangles,flatExpectedSavedTriangles:selected.total-2,facing:selected.facing,roi:selected.roi,texture,depth:depthEvidence}:null,eligibleBays:candidates.length,visual:compare(baseline,candidate,selected?.roi),flatVisual:compare(baseline,flat,selected?.roi),rollback:compare(baseline,restored,null),images:{baseline:baseline.image,flat:flat.image,candidate:candidate.image,restored:restored.image}};
    }finally{restore();depthGeometry?.dispose();depthMat?.dispose();depthTarget?.dispose();plane?.dispose();mat?.dispose();target?.dispose();angle=old.angle;tilt=old.tilt;distance=old.distance;setCamera();render()}
   },v);
   for(const [name,uri] of Object.entries(e.images)){assert(uri.startsWith("data:image/png;base64,"));writeFileSync(join(out,v.id+"-"+name+".png"),Buffer.from(uri.split(",")[1],"base64"))}
   delete e.images;receipt.views.push({id:v.id,...e});save();
   assert.deepEqual(e.baseline.camera,e.flat.camera);assert.deepEqual(e.baseline.buffer,e.flat.buffer);assert.deepEqual(e.baseline.hits,e.flat.hits);assert.deepEqual(e.baseline.camera,e.candidate.camera);assert.deepEqual(e.baseline.buffer,e.candidate.buffer);assert.deepEqual(e.baseline.hits,e.candidate.hits);assert.deepEqual(e.baseline.counts,e.restored.counts);assert.equal(e.rollback.changedPixels,0);
   if(e.selection){assert.equal(e.selection.parts.length,7);assert.equal(e.baseline.counts.triangles-e.candidate.counts.triangles,e.selection.expectedSavedTriangles);assert.equal(e.baseline.counts.triangles-e.flat.counts.triangles,e.selection.flatExpectedSavedTriangles);assert(e.selection.depth.triangles>2&&e.selection.expectedSavedTriangles>0)}
  }
  receipt.status=receipt.views.some(v=>v.selection)?"PASS_EXPERIMENT_ONLY":"NO_ELIGIBLE_COMPLETE_BAY";save();console.log("PERF_05B_BAY_DEPTH "+JSON.stringify(receipt));return receipt;
 }catch(e){receipt.status="FAIL_OR_INCOMPLETE";receipt.error=String(e);save();throw e}
 finally{await page.setViewportSize(originalViewport);await frame.waitForFunction(v=>innerWidth===v.width&&innerHeight===v.height,originalViewport,{timeout:15000})}
}
