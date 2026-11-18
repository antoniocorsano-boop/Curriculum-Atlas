// ALS-01 adapter for a supplied Three.js r128+ namespace. No network, assets,
// extra light sources, postprocessing, event handlers, or autonomous animation.
import {sample,blenderToThree,validateAnchors,OPTICS,resolveOptics} from "./core.mjs";
export function createAstralLights(THREE,anchors){
  validateAnchors(anchors);
  // Snapshot topology and anchor coordinates; callers cannot mutate the allocated buffers.
  anchors=anchors.map(a=>({...a,center:a.center.slice()}));
  const initial=sample(anchors,0,{paused:true});
  const n=initial.length,positions=new Float32Array(n*3),colors=new Float32Array(n*3),opacity=new Float32Array(n),radius=new Float32Array(n);
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
  geometry.setAttribute("tint",new THREE.BufferAttribute(colors,3));
  geometry.setAttribute("alpha",new THREE.BufferAttribute(opacity,1).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("worldRadius",new THREE.BufferAttribute(radius,1));
  initial.forEach((p,i)=>{positions.set(blenderToThree(p.position),3*i);colors.set(p.color,3*i);opacity[i]=p.opacity;radius[i]=p.radius});
  geometry.computeBoundingSphere();
  const material=new THREE.ShaderMaterial({
    uniforms:{viewportHeight:{value:480},minDiameter:{value:5},maxDiameter:{value:11},diameterScale:{value:2}},
    vertexShader:`
      attribute vec3 tint; attribute float alpha; attribute float worldRadius;
      uniform float viewportHeight; uniform float minDiameter; uniform float maxDiameter; uniform float diameterScale; varying vec3 vTint; varying float vAlpha;
      void main(){
        vec4 mv=modelViewMatrix*vec4(position,1.);
        gl_Position=projectionMatrix*mv;
        float diameter=worldRadius*viewportHeight*projectionMatrix[1][1]/max(.1,-mv.z);
        gl_PointSize=clamp(diameter*diameterScale,minDiameter,maxDiameter);
        vTint=tint;vAlpha=alpha;
      }`,
    fragmentShader:`
      varying vec3 vTint;varying float vAlpha;
      void main(){
        float r=length(gl_PointCoord-vec2(.5))*2.;
        float core=1.-smoothstep(${OPTICS.coreInner.toFixed(2)},${OPTICS.coreOuter.toFixed(2)},r);
        float halo=(1.-smoothstep(${OPTICS.haloInner.toFixed(2)},${OPTICS.haloOuter.toFixed(2)},r))*${OPTICS.haloWeight.toFixed(2)};
        float a=vAlpha*max(core,halo);
        if(a<.003)discard;
        gl_FragColor=vec4(vTint,a);
      }`,
    transparent:true,depthTest:true,depthWrite:false,blending:THREE.NormalBlending,toneMapped:false
  });
  const object=new THREE.Points(geometry,material);
  object.name="ALS-01 decorative astral points";object.userData.decorative=true;
  object.raycast=()=>{}; // cannot steal a portal hit
  let disposed=false;
  function update(seconds,{viewportWidth=640,viewportHeight=480,backdrop="dark",pixelRatio=1,reducedMotion=false,paused=false}={}){
    if(disposed)throw Error("ALS-01 disposed");
    if(!Number.isFinite(pixelRatio)||pixelRatio<=0||pixelRatio>4)throw RangeError("pixel ratio");
    const o=resolveOptics({width:viewportWidth,height:viewportHeight,backdrop});
    material.uniforms.viewportHeight.value=viewportHeight*pixelRatio;
    material.uniforms.minDiameter.value=o.minDiameterPx*pixelRatio;
    material.uniforms.maxDiameter.value=o.maxDiameterPx*pixelRatio;
    material.uniforms.diameterScale.value=o.diameterScale;
    sample(anchors,seconds,{reducedMotion,paused}).forEach((p,i)=>{opacity[i]=p.opacity});
    geometry.attributes.alpha.needsUpdate=true;
  }
  function setState(id,state){
    if(disposed)throw Error("ALS-01 disposed");
    const a=anchors.find(a=>a.id===id);if(!a)throw RangeError("unknown anchor");
    validateAnchors(anchors.map(x=>x===a?{...x,state}:x));a.state=state;
  }
  return {object,update,setState,dispose(){if(disposed)return;disposed=true;object.parent?.remove(object);geometry.dispose();material.dispose();}};
}
