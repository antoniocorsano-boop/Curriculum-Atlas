// A5.4a WebGL material bridge. Original GLB buffers, maps, UVs and
// vertex colors are unchanged. Procedural relief is an approximation of
// the Blender world-space noise, not a Cycles bake or an identical shader.
const targets=["Warm limestone","Polished warm stone","Atlas blue marble","Walnut","Recessed walnut","Brushed brass","Reading upholstery linen"];
function replaceOnce(source,anchor,value){
 if(source.split(anchor).length!==2)throw Error("Material shader anchor changed: "+anchor);
 return source.replace(anchor,()=>value);
}
function num(n){if(!Number.isFinite(n))throw Error("Invalid material profile");return Number(n).toFixed(8);}
export function materialBridge(THREE,groups,study){
 if(study.phase!=="C3.3A5.4a"||study.proceduralMicrostructureExported!==false||Object.keys(study.offlineMicrostructure).length!==7)throw Error("Unexpected master material study");
 const records=[],seen=new Set();
 for(const [module,root] of Object.entries(groups)){
   if(!module.startsWith("library-"))continue;
   root.traverse(o=>{
    if(!o.isMesh)return;
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
     if(seen.has(m)||!targets.includes(m.name))continue;seen.add(m);
     if(!m.isMeshStandardMaterial&&!m.isMeshPhysicalMaterial)throw Error("Unsupported material "+m.name);
     const p=study.offlineMicrostructure[m.name];
     if(!(p.scale>=24&&p.scale<=145&&p.strength>0&&p.strength<=.3&&p.distance>0&&p.distance<=.012))throw Error("Invalid source profile "+m.name);
     if(p.roughnessRange&&(!(p.roughnessRange[0]>=0&&p.roughnessRange[1]<=1&&p.roughnessRange[0]<p.roughnessRange[1])||m.roughnessMap))throw Error("Refuse to replace photographic roughness map");
     const scalar=study.scalarProfiles[m.name];
     const rough=scalar?.Roughness;
     const corrected=rough!==undefined&&!m.roughnessMap&&Math.abs(m.roughness-rough)>1e-5;
     if(corrected&&!(module==="library-bays.glb"&&m.name==="Brushed brass"&&m.roughness===1&&Math.abs(rough-.34)<1e-5))throw Error("Unexpected scalar divergence "+module+" "+m.name);
     records.push({module,name:m.name,m,p,rough,originalRoughness:m.roughness,corrected,originalCompile:m.onBeforeCompile,originalKey:m.customProgramCacheKey,compiled:0,maps:{normal:!!m.normalMap,roughness:!!m.roughnessMap,base:!!m.map},refs:{normal:m.normalMap,roughness:m.roughnessMap,base:m.map}});
    }
   });
 }
 if(targets.some(name=>!records.some(r=>r.name===name))||records.filter(r=>r.corrected).length!==1)throw Error("Incomplete source material inventory");
 function apply(mode){
  if(!["control","scalar","micro"].includes(mode))throw Error("Invalid material bridge mode");
  for(const r of records){
   const {m,p}=r;
   if(m.normalMap!==r.refs.normal||m.roughnessMap!==r.refs.roughness||m.map!==r.refs.base)throw Error("Original texture changed");
   m.roughness=mode!=="control"&&r.corrected?r.rough:r.originalRoughness;
   m.onBeforeCompile=r.originalCompile;m.customProgramCacheKey=r.originalKey;
   if(mode==="micro"){
    m.onBeforeCompile=function(shader,renderer){
     r.originalCompile.call(this,shader,renderer);r.compiled++;
     shader.vertexShader=replaceOnce(shader.vertexShader,"#include <common>","#include <common>\nvarying vec3 atlasSurfacePosition;");
     shader.vertexShader=replaceOnce(shader.vertexShader,"#include <project_vertex>",`#include <project_vertex>
vec4 atlasSurfaceLocal=vec4(transformed,1.0);
#ifdef USE_INSTANCING
atlasSurfaceLocal=instanceMatrix*atlasSurfaceLocal;
#endif
atlasSurfacePosition=(modelMatrix*atlasSurfaceLocal).xyz;`);
     shader.fragmentShader=replaceOnce(shader.fragmentShader,"#include <common>",`#include <common>
varying vec3 atlasSurfacePosition;
float atlasSurfaceHash(vec3 p){
 p=fract(p*0.3183099+vec3(0.11,0.17,0.23));
 p*=17.0;
 return fract(p.x*p.y*p.z*(p.x+p.y+p.z));
}
float atlasSurfaceNoise(vec3 p){
 vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(mix(atlasSurfaceHash(i),atlasSurfaceHash(i+vec3(1,0,0)),f.x),
 mix(atlasSurfaceHash(i+vec3(0,1,0)),atlasSurfaceHash(i+vec3(1,1,0)),f.x),f.y),
 mix(mix(atlasSurfaceHash(i+vec3(0,0,1)),atlasSurfaceHash(i+vec3(1,0,1)),f.x),
 mix(atlasSurfaceHash(i+vec3(0,1,1)),atlasSurfaceHash(i+vec3(1,1,1)),f.x),f.y),f.z);
}`);
     // Filter both octaves at subpixel scale to avoid shimmer and preserve
     // base texture detail. Amplitude follows source strength*distance.
     const roughCode=p.roughnessRange?`roughnessFactor=mix(roughnessFactor,mix(${num(p.roughnessRange[0])},${num(p.roughnessRange[1])},atlasGrain),atlasFade);`:"";
     shader.fragmentShader=replaceOnce(shader.fragmentShader,"#include <roughnessmap_fragment>",`#include <roughnessmap_fragment>
vec3 atlasP=atlasSurfacePosition*${num(p.scale)};
float atlasFootprint=max(length(dFdx(atlasP)),length(dFdy(atlasP)));
float atlasFade=1.0-smoothstep(0.35,1.1,atlasFootprint);
float atlasFineFade=1.0-smoothstep(0.25,0.8,atlasFootprint*2.0);
float atlasGrain=0.5+(atlasSurfaceNoise(atlasP)-0.5)*0.72+0.28*atlasFineFade*(atlasSurfaceNoise(atlasP*2.0)-0.5);
float atlasHeight=(atlasGrain-0.5)*atlasFade*${num(p.strength*p.distance)};
${roughCode}`);
     shader.fragmentShader=replaceOnce(shader.fragmentShader,"#include <normal_fragment_maps>",`#include <normal_fragment_maps>
// Layer on the normal already decoded from the original photographic map.
vec3 atlasDx=dFdx(-vViewPosition),atlasDy=dFdy(-vViewPosition);
vec3 atlasR1=cross(atlasDy,normal),atlasR2=cross(normal,atlasDx);
float atlasDet=dot(atlasDx,atlasR1);
vec3 atlasGrad=sign(atlasDet)*(dFdx(atlasHeight)*atlasR1+dFdy(atlasHeight)*atlasR2);
normal=normalize(max(abs(atlasDet),1e-12)*normal-atlasGrad);`);
    };
    m.customProgramCacheKey=()=>["atlas-micro-v1",p.scale,p.strength,p.distance,JSON.stringify(p.roughnessRange)].join(":");
   }
   m.needsUpdate=true;
  }
 }
 function evidence(){return records.map(r=>({module:r.module,name:r.name,originalRoughness:r.originalRoughness,sourceRoughness:r.rough??null,corrected:r.corrected,compiled:r.compiled,maps:r.maps,scale:r.p.scale,strength:r.p.strength,distance:r.p.distance,roughnessRange:r.p.roughnessRange}));}
 return {apply,evidence};
}
