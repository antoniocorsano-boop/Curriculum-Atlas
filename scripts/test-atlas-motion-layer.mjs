import assert from "node:assert/strict";
import {motionEnvelope,createAtmosphereLayer,MOTION_PROFILE} from "./atlas-gateway-foyer/motion-layer.mjs";
assert.equal(motionEnvelope(0),0);assert.equal(motionEnvelope(1500),1);assert.equal(motionEnvelope(3000),0);
assert.equal(motionEnvelope(NaN),0);
class Obj{constructor(g,m){this.geometry=g;this.material=m;this.position={y:0,set(){}}}}
class Geometry{setAttribute(k,v){this.attribute=v}dispose(){this.disposed=true}}
class Attribute{constructor(a,size){this.count=a.length/size}}
class Material{constructor(p){Object.assign(this,p)}dispose(){this.disposed=true}}
class Light extends Obj{constructor(){super();this.intensity=0}}
const T={BufferGeometry:Geometry,BufferAttribute:Attribute,PointsMaterial:Material,Points:Obj,PointLight:Light};
const children=[];const scene={add(...xs){children.push(...xs)},remove(...xs){for(const x of xs)children.splice(children.indexOf(x),1)}};
const layer=createAtmosphereLayer(T,scene,{mobile:true});
assert.equal(children[0].geometry.attribute.count,MOTION_PROFILE.mobileParticles);
assert.equal(layer.play(100),true);assert.equal(layer.tick(1600),true);assert(children[1].intensity>0);
assert.equal(layer.tick(3100),false);assert.equal(children[1].intensity,0);
layer.setReduced(true);assert.equal(layer.play(4000),false);
layer.setReduced(false);assert.equal(layer.play(4000),true);layer.stop();assert.equal(layer.tick(4100),false);
layer.dispose();layer.dispose();assert.equal(children.length,0);assert.equal(layer.play(5000),false);
console.log("VF-MOTION-LAYER contracts PASS");
