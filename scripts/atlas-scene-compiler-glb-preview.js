/* ASC-P2C2-GLB: actual Three r128 / GLTFLoader probe, not application runtime. */
(async()=>{
  const T=window.THREE;
  const need=(ok,m)=>{if(!ok)throw Error("ASC-P2C2 "+m)};
  need(T&&T.REVISION==="128","Three revision");
  const binary=Uint8Array.from(atob("__ASC_P2C2_GLB_BASE64__"),ch=>ch.charCodeAt(0));
  const manager=new T.LoadingManager();
  manager.setURLModifier(url=>{need(url.startsWith("blob:"),"nonembedded texture request");return url;});
  const loader=new T.GLTFLoader(manager);
  loader.register(parser=>{
    parser.textureLoader=new T.TextureLoader(parser.options.manager);
    parser.textureLoader.setCrossOrigin(parser.options.crossOrigin);
    return {name:"ASC_embedded_texture_decoder"};
  });
  const decoded=await new Promise((resolve,reject)=>loader.parse(binary.buffer,"",resolve,reject));
  const json=decoded.parser.json;
  need(json.meshes?.length===1&&json.materials?.length===1&&json.images?.length===1,"single mesh/material/embedded image");
  need(json.materials[0].emissiveTexture?.texCoord===1,"emissive lightmap UV2 binding");
  need(!json.materials[0].extensions?.KHR_materials_unlit,"source must require explicit unlit adapter");
  const meshes=[];decoded.scene.updateMatrixWorld(true);
  decoded.scene.traverse(o=>{if(o.isMesh)meshes.push(o)});
  need(meshes.length===1,"mesh count");
  const src=meshes[0],uv0=src.geometry.getAttribute("uv"),uv2=src.geometry.getAttribute("uv2");
  need(uv0&&uv2&&uv0.count===uv2.count&&uv2.count>0,"UV0/UV2 geometry");
  let uvDifferent=0;
  for(let i=0;i<uv0.count;i++)if(Math.abs(uv0.getX(i)-uv2.getX(i))+Math.abs(uv0.getY(i)-uv2.getY(i))>1e-4)uvDifferent++;
  need(uvDifferent>0,"secondary UV not distinct");
  need(src.material.isMeshStandardMaterial&&src.material.emissiveMap,"standard material with emissive lightmap");
  const tex=src.material.emissiveMap;
  need(tex.image&&tex.image.width>0&&tex.image.height>0,"embedded image decoded");
  need(tex.flipY===false,"glTF texture orientation");
  tex.encoding=T.sRGBEncoding;tex.needsUpdate=true;
  // MeshBasicMaterial uses geometry.uv on Three r128. Explicitly copy UV2 to uv;
  // do not mutate source geometry or silently use the wrong primary channel.
  const geo=src.geometry.clone();geo.setAttribute("uv",uv2.clone());
  const mat=new T.MeshBasicMaterial({map:tex,color:0xffffff,side:T.DoubleSide,toneMapped:true});
  const mesh=new T.Mesh(geo,mat);mesh.matrixAutoUpdate=false;mesh.matrix.copy(src.matrixWorld);
  const scene=new T.Scene();scene.background=new T.Color(0x14191e);scene.add(mesh);
  const hemisphere=new T.HemisphereLight(0xffffff,0x192733,0.6);
  const sun=new T.DirectionalLight(0xffe6cb,1.4);sun.position.set(4,8,5);scene.add(hemisphere,sun);
  const canvas=document.querySelector("canvas");
  const renderer=new T.WebGLRenderer({canvas,alpha:false,antialias:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=.82;renderer.outputEncoding=T.sRGBEncoding;
  const size=new T.Vector3(),center=new T.Vector3();
  new T.Box3().setFromObject(mesh).getSize(size);
  new T.Box3().setFromObject(mesh).getCenter(center);
  const radius=Math.max(size.x,size.y,size.z);
  need(Number.isFinite(radius)&&radius>0,"object bounds");
  const camera=new T.PerspectiveCamera(45,640/440,.01,Math.max(100,radius*100));
  let yaw=.35,pitch=.18,zoom=1,drag=null;
  function setCamera(){
    const r=radius*2.3*zoom,cos=Math.cos(pitch);
    camera.position.set(center.x+r*cos*Math.cos(yaw),center.y+r*Math.sin(pitch),center.z+r*cos*Math.sin(yaw));
    camera.lookAt(center);camera.updateMatrixWorld(true);
  }
  function render(){
    renderer.render(scene,camera);
    const gl=renderer.getContext();
    need(!gl.isContextLost()&&gl.getError()===gl.NO_ERROR,"WebGL context");
  }
  function frame(){
    render();const gl=renderer.getContext(),w=canvas.width,h=canvas.height;
    const data=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);
    need(gl.getError()===gl.NO_ERROR,"readPixels");return data;
  }
  function diff(a,b){
    need(a.length===b.length,"pixel sample count");
    let changed=0,max=0;for(let i=0;i<a.length;i+=4){
      const d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);
      if(d)changed++;if(d>max)max=d;
    }
    return {changed,max,total:a.length/4};
  }
  function lit(a){
    let count=0;for(let i=0;i<a.length;i+=4)if(a[i]+a[i+1]+a[i+2]>70)count++;
    return count;
  }
  function resize(w,h){
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();setCamera();
  }
  const originalYaw=yaw,originalPitch=pitch;
  resize(640,440);
  canvas.addEventListener("pointerdown",e=>{
    drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove",e=>{
    if(!drag)return;yaw=Math.max(-1.2,Math.min(1.2,yaw+(e.clientX-drag[0])*.006));
    pitch=Math.max(-.5,Math.min(.7,pitch+(e.clientY-drag[1])*.004));
    drag=[e.clientX,e.clientY];setCamera();render();
  });
  canvas.addEventListener("pointerup",()=>drag=null);
  canvas.addEventListener("pointercancel",()=>drag=null);
  canvas.addEventListener("wheel",e=>{
    e.preventDefault();zoom=Math.max(.65,Math.min(1.6,zoom+e.deltaY*.001));setCamera();render();
  },{passive:false});
  document.querySelector("#reset").addEventListener("click",()=>{
    yaw=originalYaw;pitch=originalPitch;zoom=1;setCamera();render();
  });
  const result=()=>{
    const a=frame();need(lit(a)>200,"object visible");
    const h=hemisphere.intensity,d=sun.intensity;
    hemisphere.intensity=0;sun.intensity=0;const b=frame();
    hemisphere.intensity=4;sun.intensity=7;const c=frame();
    hemisphere.intensity=h;sun.intensity=d;
    const noLight=diff(a,b),moreLight=diff(a,c);
    need(noLight.changed===0&&moreLight.changed===0,"baked material double-lit");
    const exact=geo.getAttribute("uv");
    need(exact.count===uv2.count&&exact.array.every((v,i)=>Math.abs(v-uv2.array[i])<1e-7),"UV2 to uv adapter");
    const gl=renderer.getContext();
    const baseline={lightInvariance:noLight,highLightInvariance:moreLight,litPixels:lit(a),
      image:[tex.image.width,tex.image.height],uvDifferent,material:mat.type,
      originalMaterial:src.material.type,revision:T.REVISION,webglVersion:gl.getParameter(gl.VERSION),
      extensions:json.extensionsUsed||[],originalGeometryUntouched:src.geometry.getAttribute("uv")===uv0,
      embeddedImageCount:json.images.length,csp:"connect-src none"};
    return baseline;
  };
  window.__asc={status:"READY",run:result,resize,frame,mesh,camera};
  render();
})().catch(error=>{
  console.error("ASC-P2C2 ERROR",error);
  window.__asc={status:"FAIL",error:String(error)};
});
