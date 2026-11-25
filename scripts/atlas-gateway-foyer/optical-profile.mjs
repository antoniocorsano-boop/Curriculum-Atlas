// VF-MOTION-03: local, static optical recipe. No postprocessing, no extra meshes.
export const OPTICAL_PROFILE=Object.freeze({
  schema:"atlas.scene.optics/v1",environmentWidth:256,environmentHeight:128,
  surfaces:Object.freeze({
    stone:Object.freeze({metalness:.16,roughness:.38,envMapIntensity:.48}),
    bronze:Object.freeze({metalness:.78,roughness:.24,envMapIntensity:.82}),
    obsidian:Object.freeze({metalness:.38,roughness:.29,envMapIntensity:.55}),
    frame:Object.freeze({metalness:.45,roughness:.31,envMapIntensity:.52})
  })
});
export function makeEnvironment(width=256,height=128){
  if(width!==256||height!==128)throw Error("Optical texture budget exceeded");
  const data=new Uint8Array(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const u=(x+.5)/width,v=(y+.5)/height;
    const zenith=Math.exp(-((v-.18)**2)/.026);
    const d=Math.min(Math.abs(u-.27),1-Math.abs(u-.27));
    const warm=Math.exp(-(d*d)/.008-((v-.30)**2)/.025);
    const horizon=Math.exp(-((v-.52)**2)/.014);
    const i=(y*width+x)*4;
    data[i]=Math.min(255,Math.round(17+64*zenith+151*warm+18*horizon));
    data[i+1]=Math.min(255,Math.round(22+91*zenith+111*warm+24*horizon));
    data[i+2]=Math.min(255,Math.round(32+128*zenith+64*warm+33*horizon));
    data[i+3]=255;
  }
  return data;
}
export const OCULUS_VERTEX=`
varying vec2 vOpticUv;
void main(){
  vOpticUv=uv;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
}`;
export const OCULUS_FRAGMENT=`
varying vec2 vOpticUv;
void main(){
  vec2 p=vOpticUv*2.0-1.0;
  float r=length(p);
  float halo=exp(-5.0*dot(p,p));
  float rim=1.0-smoothstep(0.83,1.0,r);
  vec3 sky=mix(vec3(0.055,0.16,0.32),vec3(0.56,0.70,0.88),halo);
  gl_FragColor=vec4(sky,0.30+0.46*rim);
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`;
export function createOpticalProfile(T,renderer,surfaces){
  const source=new T.DataTexture(makeEnvironment(),256,128,T.RGBAFormat,T.UnsignedByteType);
  source.mapping=T.EquirectangularReflectionMapping;
  source.encoding=T.LinearEncoding;
  source.minFilter=source.magFilter=T.LinearFilter;
  source.needsUpdate=true;
  const generator=new T.PMREMGenerator(renderer);
  let target;
  try{target=generator.fromEquirectangular(source);}
  finally{source.dispose();generator.dispose();}
  const originals=[];
  let shader=null,previous=null,disposed=false;
  function dispose(){
    if(disposed)return;disposed=true;
    for(const {material,values} of originals){Object.assign(material,values);material.needsUpdate=true;}
    if(shader){surfaces.oculus.material=previous;shader.dispose();}
    target.dispose();
  }
  try{
    for(const [role,recipe] of Object.entries(OPTICAL_PROFILE.surfaces)){
      const material=surfaces[role];
      if(!material?.isMeshStandardMaterial)throw Error("Missing optical surface "+role);
      originals.push({material,values:{metalness:material.metalness,roughness:material.roughness,envMap:material.envMap,envMapIntensity:material.envMapIntensity}});
      Object.assign(material,recipe,{envMap:target.texture});material.needsUpdate=true;
    }
    previous=surfaces.oculus.material;
    shader=new T.ShaderMaterial({vertexShader:OCULUS_VERTEX,fragmentShader:OCULUS_FRAGMENT,
      side:T.DoubleSide,transparent:true,depthWrite:false,toneMapped:true});
    surfaces.oculus.material=shader;
    return {schema:OPTICAL_PROFILE.schema,dispose};
  }catch(error){dispose();throw error;}
}
