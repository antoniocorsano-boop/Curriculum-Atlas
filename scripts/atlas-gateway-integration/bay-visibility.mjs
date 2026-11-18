// Camera-space visibility compaction for immutable, shared opaque bay meshes.
// Three r128 does not compute per-instance bounds. Keep exact world matrices
// and apply the same conservative transformed bounding sphere as Mesh culling.
export function createBayVisibility(THREE, group, sources){
  const batches=[];
  const byKey=new Map();
  for(const o of sources){
    if(Array.isArray(o.material)||o.material.transparent||o.matrixWorld.determinant()<=0||o.isSkinnedMesh||o.morphTargetInfluences?.length)continue;
    const key=o.geometry.uuid+"/"+o.material.uuid;
    if(!byKey.has(key))byKey.set(key,[]);
    byKey.get(key).push(o);
  }
  const instances=group.children.filter(o=>o.isInstancedMesh);
  for(const inst of instances){
    const objects=byKey.get(inst.geometry.uuid+"/"+inst.material.uuid);
    if(!objects||objects.length!==inst.count)throw Error("Instance/source mapping mismatch");
    if(!inst.geometry.boundingSphere)inst.geometry.computeBoundingSphere();
    const items=objects.map(o=>({matrix:o.matrixWorld.clone(),sphere:inst.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld)}));
    if(items.some(q=>!Number.isFinite(q.sphere.radius)||q.sphere.radius<0))throw Error("Invalid bay bounds");
    inst.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    batches.push({inst,items});
  }
  if(batches.length===0)throw Error("No native bay batches");
  const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),previous=new THREE.Matrix4();
  let initialized=false,last=null;
  function restoreAll(){
    for(const {inst,items} of batches){
      for(let i=0;i<items.length;i++)inst.setMatrixAt(i,items[i].matrix);
      inst.count=items.length;inst.visible=true;inst.instanceMatrix.needsUpdate=true;
    }
    initialized=false;
  }
  function update(camera){
    camera.updateMatrixWorld(true);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if(initialized&&projection.equals(previous))return {...last,recomputed:false};
    frustum.setFromProjectionMatrix(projection);
    let visible=0,total=0,activeBatches=0;
    for(const {inst,items} of batches){
      let n=0;
      for(const item of items)if(frustum.intersectsSphere(item.sphere))inst.setMatrixAt(n++,item.matrix);
      inst.count=n;inst.visible=n>0;inst.instanceMatrix.needsUpdate=true;
      visible+=n;total+=items.length;if(n)activeBatches++;
    }
    previous.copy(projection);initialized=true;
    last={visible,total,culled:total-visible,activeBatches,recomputed:true};
    return {...last};
  }
  return {update,restoreAll,batches:batches.length};
}
