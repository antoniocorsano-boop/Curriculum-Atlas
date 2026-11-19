// PERF-05B/P1: reversible one-batch textured spine impostor, test-only.
// No production binding, no new external image or service.
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";

export async function runBookProxyProbe({page,frame,out,manifest}){
  mkdirSync(out,{recursive:true});
  const receipt={schema:"atlas.perf.book-proxy/v1",status:"PENDING",scope:"single actual book-cover batch per fixed view; experimental local bake, not production LOD",assets:manifest.assets.map(a=>({id:a.id,sha256:a.sha256})),views:[],artisticApproval:false,publishable:false,studentAuthorized:false};
  const save=()=>writeFileSync(join(out,"perf-book-proxy.json"),JSON.stringify(receipt,null,2)+"\n");
  const old=page.viewportSize();assert(old);
  try{
    for(const v of [{id:"atrium",width:900,height:700,orbit:0},{id:"wide",width:1920,height:1080,orbit:0},{id:"wide-left",width:1920,height:1080,orbit:-.22},{id:"wide-right",width:1920,height:1080,orbit:.22},{id:"portrait",width:393,height:873,orbit:0}]){
      await page.setViewportSize({width:v.width,height:v.height});
      await frame.waitForFunction(q=>innerWidth===q.width&&innerHeight===q.height,v,{timeout:15000});
      const ev=await frame.evaluate(v=>{
        if(!ready||closing||motion)throw Error("Inactive scene");
        const oldPose={angle,tilt,distance},gl=renderer.getContext(),group=scene.children.find(o=>o.name==="Native bay visibility batches");
        if(!group)throw Error("Missing actual bay instances");
        const sourceNames=new Map();
        groupMap.bays.traverse(o=>{if(o.isMesh){const k=o.geometry.uuid+"/"+o.material.uuid;const a=sourceNames.get(k)||[];a.push(o.name);sourceNames.set(k,a)}});
        const count=()=>({triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,points:renderer.info.render.points});
        const hit=()=>NATIVE_PORTALS.map(p=>{const q=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);return {id:p.id,hit:hitPortal((q.x+1)*innerWidth/2,(1-q.y)*innerHeight/2)}});
        function shot(){
          render();
          const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,pixels=new Uint8Array(w*h*4);
          gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
          if(gl.isContextLost()||gl.getError()!==gl.NO_ERROR)throw Error("Native readback");
          return {counts:count(),buffer:[w,h],camera:camera.projectionMatrix.toArray().concat(camera.matrixWorld.toArray()),hits:hit(),pixels,image:canvas.toDataURL("image/png")};
        }
        function diff(a,b,rois=[]){
          if(a.pixels.length!==b.pixels.length)throw Error("Buffer drift");
          let changed=0,sum=0,roiSum=0,roiPixels=0,roiChanged=0,max=0;
          const [w,h]=a.buffer;
          for(let i=0;i<a.pixels.length;i+=4){
            let d=0,s=0;for(let c=0;c<3;c++){const x=Math.abs(a.pixels[i+c]-b.pixels[i+c]);s+=x;d=Math.max(d,x)}
            if(d)changed++;sum+=s;max=Math.max(max,d);
            const x=(i/4)%w,y=Math.floor(i/4/w);
            if(rois.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3])){roiPixels++;roiSum+=s;if(d)roiChanged++}
          }
          return {changedPixels:changed,maxChannelDelta:max,meanAbsoluteRGBDelta:sum/(a.pixels.length/4*3*255),roiPixels,roiChanged,roiMeanAbsoluteRGBDelta:roiPixels?roiSum/(roiPixels*3*255):null};
        }
        const axis=i=>new THREE.Vector3(i===0?1:0,i===1?1:0,i===2?1:0);
        const geometryTriangles=g=>(g.index?g.index.count:g.attributes.position.count)/3;
        let baseline,candidate,restored,selected=null,proxy=null,target=null,plane=null,material=null,inventory=[];
        let original=null,originalMatrices=[],originalVisible=false;
        try{
          angle=v.orbit;tilt=0;distance=1;setCamera();baseline=shot();
          const [w,h]=baseline.buffer,camPos=new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
          for(const inst of group.children.filter(o=>o.isInstancedMesh&&o.count>0)){
            const names=sourceNames.get(inst.geometry.uuid+"/"+inst.material.uuid)||[];
            const row={names:names.slice(0,3),visible:inst.count,trianglesPerInstance:geometryTriangles(inst.geometry),eligible:0};inventory.push(row);
            // Only named original book covers; never architecture or paper.
            if(!names.length||!names.every(n=>/book/i.test(n)&&!/paper/i.test(n))||row.trianglesPerInstance<=2)continue;
            const box=inst.geometry.boundingBox|| (inst.geometry.computeBoundingBox(),inst.geometry.boundingBox);
            const size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
            if(![...size.toArray(),...center.toArray()].every(Number.isFinite)||Math.min(...size.toArray())<=0)continue;
            const sets=new Map(),matrices=[];
            for(let i=0;i<inst.count;i++){
              const m=new THREE.Matrix4();inst.getMatrixAt(i,m);matrices.push(m);
              const worldCenter=center.clone().applyMatrix4(m),direction=camPos.clone().sub(worldCenter).normalize();
              const axes=[0,1,2].map(k=>({k,world:axis(k).transformDirection(m),extent:size.getComponent(k)*new THREE.Vector3().setFromMatrixColumn(m,k).length()}));
              const vertical=axes.reduce((a,b)=>Math.abs(a.world.y)>Math.abs(b.world.y)?a:b);
              const front=axes.filter(a=>a!==vertical).sort((a,b)=>a.extent-b.extent)[0];
              const facing=direction.dot(front.world),sign=Math.sign(facing);
              if(Math.abs(facing)<.82||!sign)continue;
              let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity,valid=true;
              for(let j=0;j<8;j++){
                const q=new THREE.Vector3(j&1?box.max.x:box.min.x,j&2?box.max.y:box.min.y,j&4?box.max.z:box.min.z).applyMatrix4(m).project(camera);
                if(![q.x,q.y,q.z].every(Number.isFinite)||q.z<=-1||q.z>=1){valid=false;break}
                const x=(q.x+1)*w/2,y=(q.y+1)*h/2;
                minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
              }
              if(!valid||minX<1||minY<1||maxX>w-1||maxY>h-1||Math.max(maxX-minX,maxY-minY)>240||Math.min(maxX-minX,maxY-minY)<3)continue;
              const key=front.k+"/"+vertical.k+"/"+sign;
              if(!sets.has(key))sets.set(key,{front:front.k,up:vertical.k,sign,items:[]});
              sets.get(key).items.push({i,roi:[Math.floor(minX),Math.floor(minY),Math.ceil(maxX),Math.ceil(maxY)]});
            }
            for(const set of sets.values()){
              row.eligible+=set.items.length;
              const saving=set.items.length*(row.trianglesPerInstance-2);
              if(!selected||saving>selected.saving)selected={inst,matrices,box,size,center,set,saving,names};
            }
          }
          if(selected){
            const {inst,matrices,box,size,center,set}=selected;
            const normal=axis(set.front).multiplyScalar(set.sign),up=axis(set.up);
            // Orient local vertical to actual world up in the representative instance.
            if(up.clone().transformDirection(matrices[set.items[0].i]).y<0)up.negate();
            const right=up.clone().cross(normal).normalize();
            const width=Math.abs(right.dot(size)),height=Math.abs(up.dot(size));
            if(!(width>0&&height>0))throw Error("Degenerate proxy plane");
            const depth=size.getComponent(set.front);
            const bakeScene=new THREE.Scene();bakeScene.environment=scene.environment;
            const mesh=new THREE.Mesh(inst.geometry,inst.material);bakeScene.add(mesh);
            // Fixed, documented local illumination; not a Cycles equivalence claim.
            bakeScene.add(new THREE.HemisphereLight(0xffffff,0x45454b,.65));
            const key=new THREE.DirectionalLight(0xffffff,1.1);key.position.copy(center).add(normal.clone().multiplyScalar(4)).add(up.clone().multiplyScalar(3));key.target.position.copy(center);bakeScene.add(key,key.target);
            const bakeCam=new THREE.OrthographicCamera(-width/2,width/2,height/2,-height/2,.001,Math.max(10,depth*8));
            bakeCam.position.copy(center).addScaledVector(normal,Math.max(1,depth*3));bakeCam.up.copy(up);bakeCam.lookAt(center);bakeCam.updateMatrixWorld(true);
            const resX=Math.max(32,Math.round(512*width/Math.max(width,height))),resY=Math.max(32,Math.round(512*height/Math.max(width,height)));
            target=new THREE.WebGLRenderTarget(resX,resY,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});
            const savedTarget=renderer.getRenderTarget(),clear=renderer.getClearColor(new THREE.Color()).clone(),alpha=renderer.getClearAlpha(),tone=renderer.toneMapping;
            try{
              renderer.setRenderTarget(target);renderer.setClearColor(0,0);renderer.toneMapping=THREE.NoToneMapping;renderer.clear();renderer.render(bakeScene,bakeCam);
              const sample=new Uint8Array(resX*resY*4);renderer.readRenderTargetPixels(target,0,0,resX,resY,sample);
              let opaque=0;for(let i=3;i<sample.length;i+=4)if(sample[i]>127)opaque++;
              if(!opaque)throw Error("Empty baked book texture");
              selected.texture={width:resX,height:resY,opaquePixels:opaque};
            }finally{renderer.setRenderTarget(savedTarget);renderer.setClearColor(clear,alpha);renderer.toneMapping=tone}
            plane=new THREE.PlaneGeometry(width,height);
            plane.applyMatrix4(new THREE.Matrix4().makeBasis(right,up,normal));
            plane.translate(...center.clone().addScaledVector(normal,depth/2).toArray());
            material=new THREE.MeshBasicMaterial({map:target.texture,alphaTest:.5,side:THREE.FrontSide});
            proxy=new THREE.InstancedMesh(plane,material,set.items.length);proxy.frustumCulled=false;proxy.raycast=()=>{};
            original=inst;originalMatrices=matrices;originalVisible=inst.visible;
            const replaced=new Set(set.items.map(x=>x.i));let n=0;
            matrices.forEach((m,i)=>{if(!replaced.has(i))inst.setMatrixAt(n++,m)});
            inst.count=n;inst.visible=n>0;inst.instanceMatrix.needsUpdate=true;
            set.items.forEach((x,i)=>proxy.setMatrixAt(i,matrices[x.i]));
            proxy.instanceMatrix.needsUpdate=true;group.add(proxy);candidate=shot();
            group.remove(proxy);matrices.forEach((m,i)=>inst.setMatrixAt(i,m));inst.count=matrices.length;inst.visible=originalVisible;inst.instanceMatrix.needsUpdate=true;
            restored=shot();
          }else{candidate=baseline;restored=shot()}
          const roi=selected?.set.items.map(x=>x.roi)||[];
          const result={baseline:{counts:baseline.counts,buffer:baseline.buffer,camera:baseline.camera,hits:baseline.hits},candidate:{counts:candidate.counts,buffer:candidate.buffer,camera:candidate.camera,hits:candidate.hits},restored:{counts:restored.counts,buffer:restored.buffer,camera:restored.camera,hits:restored.hits},visual:diff(baseline,candidate,roi),rollback:diff(baseline,restored),inventory,selection:selected?{names:selected.names.slice(0,5),instances:selected.set.items.length,expectedSavedTriangles:selected.saving,texture:selected.texture,rois:roi}:null,images:{baseline:baseline.image,candidate:candidate.image,restored:restored.image}};
          return result;
        }finally{
          if(proxy)group.remove(proxy);
          if(original){originalMatrices.forEach((m,i)=>original.setMatrixAt(i,m));original.count=originalMatrices.length;original.visible=originalVisible;original.instanceMatrix.needsUpdate=true}
          plane?.dispose();material?.dispose();proxy?.dispose?.();target?.dispose();
          angle=oldPose.angle;tilt=oldPose.tilt;distance=oldPose.distance;setCamera();render();
        }
      },v);
      for(const [k,u] of Object.entries(ev.images)){assert(u.startsWith("data:image/png;base64,"));writeFileSync(join(out,v.id+"-"+k+".png"),Buffer.from(u.split(",")[1],"base64"))}
      delete ev.images;receipt.views.push({id:v.id,...ev});save();
      assert.deepEqual(ev.candidate.camera,ev.baseline.camera);assert.deepEqual(ev.candidate.hits,ev.baseline.hits);assert.deepEqual(ev.candidate.buffer,ev.baseline.buffer);
      assert.deepEqual(ev.restored.counts,ev.baseline.counts);assert.deepEqual(ev.restored.hits,ev.baseline.hits);assert.equal(ev.rollback.changedPixels,0,"Rollback not pixel exact");
      if(ev.selection)assert.equal(ev.baseline.counts.triangles-ev.candidate.counts.triangles,ev.selection.expectedSavedTriangles,"Triangle accounting mismatch");
    }
    receipt.status=receipt.views.some(x=>x.selection)?"PASS_EXPERIMENT_ONLY":"NO_ELIGIBLE_BOOK_BATCH";
    save();console.log("PERF_05B_BOOK_PROXY "+JSON.stringify(receipt));return receipt;
  }catch(e){receipt.status="FAIL_OR_INCOMPLETE";receipt.error=String(e);save();throw e}
  finally{await page.setViewportSize(old);await frame.waitForFunction(v=>innerWidth===v.width&&innerHeight===v.height,old,{timeout:15000})}
}
