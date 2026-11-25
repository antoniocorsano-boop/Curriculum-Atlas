// VF-MOTION-01A: bounded, opt-in atmosphere on an existing Three.js scene.
// Original procedural asset; no network, textures, timers or new renderer.
// The host owns requestAnimationFrame. All input times are monotonic milliseconds.
export const MOTION_PROFILE=Object.freeze({durationMs:3000,particles:36,mobileParticles:18});
export function motionEnvelope(elapsed,duration=MOTION_PROFILE.durationMs){
  if(!Number.isFinite(elapsed)||elapsed<=0||elapsed>=duration)return 0;
  return Math.sin(Math.PI*elapsed/duration)**2;
}
export function createAtmosphereLayer(T,scene,{mobile=false,reduced=false}={}){
  const count=mobile?MOTION_PROFILE.mobileParticles:MOTION_PROFILE.particles;
  const positions=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    positions[i*3]=Math.sin(i*2.39996)*(2.3+(i%7)*.51);
    positions[i*3+1]=1.3+(i%11)*.39;
    positions[i*3+2]=-1.1+Math.cos(i*2.39996)*(1.4+(i%5)*.58);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute("position",new T.BufferAttribute(positions,3));
  const material=new T.PointsMaterial({color:0xffd39b,size:.045,transparent:true,opacity:0,depthWrite:false});
  const points=new T.Points(geometry,material);
  const light=new T.PointLight(0xffc985,0,11,2);light.position.set(0,4.7,1.8);
  points.visible=false;scene.add(points,light);
  let start=null,disposed=false,reduce=reduced;
  function stop(){start=null;points.visible=false;material.opacity=0;light.intensity=0;points.position.y=0;}
  return {
    play(now){if(disposed||reduce||!Number.isFinite(now))return false;start=now;return true;},
    tick(now){
      if(disposed||start===null)return false;
      const elapsed=Math.max(0,now-start);
      if(elapsed>=MOTION_PROFILE.durationMs){stop();return false;}
      const envelope=motionEnvelope(elapsed);
      points.visible=true;points.position.y=.25*elapsed/MOTION_PROFILE.durationMs;
      material.opacity=.75*envelope;light.intensity=1.2*envelope;
      return true;
    },
    applySample(values){
      if(disposed||reduce)return;
      points.visible=values.particles>0;
      material.opacity=.75*values.particles;
      points.position.y=values.rise;
      light.intensity=1.2*values.light;
    },
    stop,
    setReduced(value){reduce=Boolean(value);if(reduce)stop();},
    dispose(){if(disposed)return;stop();disposed=true;scene.remove(points,light);geometry.dispose();material.dispose();},
  };
}
