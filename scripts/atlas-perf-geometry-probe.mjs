// PERF-05A: paired actual-render probe in the same browser, same scene,
// same camera, same physical buffer. No synthetic meshes or art changes.
import assert from "node:assert/strict";
import {writeFileSync,mkdirSync} from "node:fs";
import {join} from "node:path";
export async function runGeometryProbe({page,frame,out,manifest}){
 mkdirSync(out,{recursive:true});
 const receipt={schema:"atlas.perf.geometry/v1",status:"PENDING",assets:manifest.assets.map(a=>({id:a.id,bytes:a.bytes,sha256:a.sha256})),views:[],studentAuthorized:false,publishable:false,artisticApproval:false};
 const save=()=>writeFileSync(join(out,"perf-geometry-probe.json"),JSON.stringify(receipt,null,2)+"\n");
 const originalViewport=page.viewportSize();assert(originalViewport);
 const views=[
  {id:"atrium",width:900,height:700,orbit:0,inventory:true},
  {id:"wide",width:1920,height:1080,orbit:0},
  {id:"wide-left",width:1920,height:1080,orbit:-.22},
  {id:"wide-right",width:1920,height:1080,orbit:.22},
  {id:"portrait",width:393,height:873,orbit:0}
 ];
 try{
  for(const view of views){
   await page.setViewportSize({width:view.width,height:view.height});
   await frame.waitForFunction(v=>innerWidth===v.width&&innerHeight===v.height,view,{timeout:15000});
   const evidence=await frame.evaluate(v=>{
    if(!ready||closing||motion||!visibility.setMode)throw Error("PERF-05A inactive");
    const old={angle,tilt,distance},gl=renderer.getContext();
    const count=()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,points:renderer.info.render.points});
    const hit=()=>NATIVE_PORTALS.map(p=>{const q=new THREE.Vector3(...toThree(p.anchorBlender)).project(camera);return {id:p.id,hit:hitPortal((q.x+1)*innerWidth/2,(1-q.y)*innerHeight/2)}});
    function shot(mode){
      visibility.setMode(mode);setCamera();render();
      const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,b=new Uint8Array(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b);
      if(gl.getError()!==gl.NO_ERROR||gl.isContextLost())throw Error("PERF-05A readback");
      return {stats:visibility.update(camera),counts:count(),buffer:[w,h],camera:camera.projectionMatrix.toArray().concat(camera.matrixWorld.toArray()),hits:hit(),pixels:b,image:canvas.toDataURL("image/png")};
    }
    function diff(a,b){
      if(a.length!==b.length)throw Error("Buffer mismatch");
      let changed=0,max=0,sum=0;for(let i=0;i<a.length;i+=4){let d=0;for(let k=0;k<3;k++){const x=Math.abs(a[i+k]-b[i+k]);sum+=x;d=Math.max(d,x)}if(d>0)changed++;max=Math.max(max,d)}
      return {changedPixels:changed,maxChannelDelta:max,meanAbsoluteRGBDelta:sum/(a.length/4*3*255)};
    }
    let ref,candidate,rollback,inventory=null;
    try{
      angle=v.orbit;tilt=0;distance=1;
      ref=shot("sphere");candidate=shot("box");rollback=shot("sphere");
      if(v.inventory){
       const roots=Object.entries(groupMap).filter(([id])=>id!=="bays");
       roots.push(["bay-instances",scene.children.find(o=>o.name==="Native bay visibility batches")]);
       roots.push(["astral-points",als.object]);
       inventory=[];
       for(const [id,root] of roots){
        if(!root)throw Error("Missing render root "+id);
        const full=count(),wasVisible=root.visible;
        let meshes=0,instances=0;const geometries=new Set(),materials=new Set();
        root.traverse(o=>{if(o.isMesh||o.isPoints){meshes++;if(o.isInstancedMesh)instances+=o.count;geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});
        try{root.visible=false;render();const without=count();inventory.push({id,meshes,instances,uniqueGeometries:geometries.size,uniqueMaterials:materials.size,trianglesAttributed:full.triangles-without.triangles,callsAttributed:full.calls-without.calls,pointsAttributed:full.points-without.points});}
        finally{root.visible=wasVisible;render()}
       }
      }
      const visual=diff(ref.pixels,candidate.pixels),restore=diff(ref.pixels,rollback.pixels);
      const images={sphere:ref.image,box:candidate.image,restored:rollback.image};
      for(const x of [ref,candidate,rollback]){delete x.pixels;delete x.image}
      return {reference:ref,candidate,rollback,visual,restore,inventory,images};
    }finally{angle=old.angle;tilt=old.tilt;distance=old.distance;visibility.setMode("box");setCamera();render()}
   },view);
   for(const [id,uri] of Object.entries(evidence.images)){assert(uri.startsWith("data:image/png;base64,"));writeFileSync(join(out,view.id+"-"+id+".png"),Buffer.from(uri.slice("data:image/png;base64,".length),"base64"))}
   delete evidence.images;
   receipt.views.push({id:view.id,...evidence});save();
   const a=evidence.reference,b=evidence.candidate,r=evidence.rollback;
   assert.deepEqual(a.buffer,b.buffer);assert.deepEqual(a.camera,b.camera);assert.deepEqual(a.hits,b.hits);assert(a.hits.every(p=>p.id===p.hit)||view.orbit!==0,"centered portal hit regression");
   assert.deepEqual(a.counts,r.counts);assert.equal(evidence.restore.changedPixels,0,"Rollback not pixel exact");
   assert.equal(evidence.visual.changedPixels,0,"Candidate not pixel exact");
   assert.equal(b.stats.total,495);assert(b.stats.visible<=a.stats.visible);assert.equal(b.stats.boxRejected,a.stats.visible-b.stats.visible);
   assert(b.counts.triangles<=a.counts.triangles&&b.counts.calls<=a.counts.calls,"Unexpected draw cost increase");
  }
  receipt.status=receipt.views.some(v=>v.candidate.counts.triangles<v.reference.counts.triangles)?"PASS_EXACT_VISUAL_REDUCTION":"PASS_NO_GEOMETRY_GAIN";
  save();console.log("PERF_05_GEOMETRY "+JSON.stringify(receipt));
  return receipt;
 }catch(e){receipt.status="FAIL_OR_INCOMPLETE";receipt.error=String(e);save();throw e}
 finally{await page.setViewportSize(originalViewport);await frame.waitForFunction(v=>innerWidth===v.width&&innerHeight===v.height,originalViewport,{timeout:15000});}
}
