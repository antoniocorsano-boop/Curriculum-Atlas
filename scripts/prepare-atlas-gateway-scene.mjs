import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const BASE = "docs/atlas-gateway/fonti/scene-threejs.html";
const BASE_SHA = "59b063bca75a102d4b808a0cac5c31f4bf57611ff462be5059514032dfba057f";
const digest = data => createHash("sha256").update(data).digest("hex");
function checked(path, expected) {
  if (!path || !/^[a-f0-9]{64}$/.test(expected ?? "")) throw new Error("File e SHA-256 approvati obbligatori");
  const data = readFileSync(path);
  if (digest(data) !== expected) throw new Error("Impronta non corrispondente: " + path);
  return data.toString("utf8");
}
function replaceOne(source, before, after) {
  if (source.split(before).length !== 2) throw new Error("Sostituzione ambigua: " + before);
  return source.replace(before, () => after);
}
const [threePath, threeSha, cssPath, cssSha, output] = process.argv.slice(2);
if (!output) throw new Error("Uso: node scripts/prepare-atlas-gateway-scene.mjs THREE SHA256 CSS SHA256 OUTPUT");
let scene = checked(BASE, BASE_SHA);
// AG-04/B: local, reversible art direction; never change the historical source.
const artDirection = [
  [
    "scene.background = new THREE.Color(0x050a14);",
    "scene.background = new THREE.Color(0x263e50);"
  ],
  [
    "scene.fog = new THREE.FogExp2(0x101924, 0.008);",
    "scene.fog = new THREE.FogExp2(0x667c85, 0.006);"
  ],
  [
    "renderer.toneMappingExposure = 1.05;",
    "renderer.toneMappingExposure = 1.12;"
  ],
  [
    "new THREE.HemisphereLight(0xd6e7ff,0x806044,.83)",
    "new THREE.HemisphereLight(0xf2f6ff,0xb28c62,.98)"
  ],
  [
    "new THREE.DirectionalLight(0xffe0aa,1.25)",
    "new THREE.DirectionalLight(0xffeed3,1.35)"
  ],
  [
    "new THREE.DirectionalLight(0xb9dfff,.55)",
    "new THREE.DirectionalLight(0xdcecff,.72)"
  ],
  [
    "new THREE.PointLight(0xffca82,.85,24,1)",
    "new THREE.PointLight(0xffd7a2,.92,24,1)"
  ],
  [
    "g.fillStyle='#26313c';",
    "g.fillStyle='#958678';"
  ],
  [
    "gr.addColorStop(0,'#394653');gr.addColorStop(.48,'#202a36');gr.addColorStop(1,'#3b4146');",
    "gr.addColorStop(0,'#b0a395');gr.addColorStop(.48,'#847a70');gr.addColorStop(1,'#b8a99a');"
  ],
  [
    "i%4===0?'#b2a48a26':'#a0b0c010'",
    "i%4===0?'#695d5225':'#e8e0d518'"
  ],
  [
    "g.strokeStyle='#ad94704a';g.lineWidth=2;g.strokeRect(1,1,510,510);",
    "g.strokeStyle='#88786a38';g.lineWidth=1;g.strokeRect(1,1,510,510);"
  ],
  [
    "tex.repeat.set(14,14);",
    "tex.repeat.set(7,7);"
  ],
  [
    "map:tex,color:0xc8c7bf,metalness:.24,roughness:.39",
    "map:tex,color:0xe4d6c5,metalness:.12,roughness:.32"
  ],
  [
    "color:0x654431,roughness:.65,metalness:.06",
    "color:0x845c3e,roughness:.62,metalness:.04"
  ],
  [
    "color:0x182b3b,roughness:.46,metalness:.22",
    "color:0x354c59,roughness:.48,metalness:.18"
  ],
  [
    "color:0x382d29,roughness:.78",
    "color:0x89705a,roughness:.78"
  ],
  [
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xdcd0bc}));",
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xf0e3cc}));\n            // AG-04/B: shallow physical shelf ledges, batched in one draw call.\n            const ledges=new THREE.InstancedMesh(new THREE.BoxGeometry(3.12,.095,.36),walnut,levels.length*bays*4);\n            const ledgeTransform=new THREE.Object3D();let ledgeIndex=0;"
  ],
  [
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);",
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);\n                    for(let k=0;k<4;k++){const rr=19.73;ledgeTransform.position.set(Math.sin(a)*rr,h+.22+k*.74,center-Math.cos(a)*rr);ledgeTransform.rotation.y=-a;ledgeTransform.updateMatrix();ledges.setMatrixAt(ledgeIndex++,ledgeTransform.matrix);}"
  ],
  [
    "for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const c=new THREE.Mesh(colGeo,navy);",
    "ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);\n            for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const c=new THREE.Mesh(colGeo,navy);"
  ],
  [
    "float c=sin(d.x*17.+sin(d.z*11.))*sin(d.z*13.+sin(d.x*9.));float cloud=smoothstep(.16,.75,c);vec3 sky=mix(vec3(.29,.51,.70),vec3(.71,.84,.93),cloud*.75);gl_FragColor=vec4(sky+sun*vec3(.25,.20,.12),1.);",
    "float horizon=pow(1.-clamp(d.y,0.,1.),2.);vec3 sky=mix(vec3(.37,.63,.84),vec3(.86,.91,.92),horizon);gl_FragColor=vec4(sky+sun*vec3(.24,.21,.16),1.);"
  ],
  [
    "color:0x394752,metalness:.35,roughness:.4",
    "color:0xa49175,metalness:.35,roughness:.4"
  ],
  [
    "color:0x233341,roughness:.46",
    "color:0xc0ac90,roughness:.62"
  ],
  [
    "g.fillText('A T L A S',512,118);",
    "g.fillText('A R E N A',512,118);"
  ],
  [
    "sign.position.set(Math.sin(a)*18.9,10.93,cz-Math.cos(a)*18.9);sign.lookAt(0,10.93,cz);",
    "sign.position.set(Math.sin(a)*12.0,10.86,cz-Math.cos(a)*12.0);sign.lookAt(0,10.86,cz);"
  ],
  [
    "// ATLAS wordmark on the architectural frieze, facing the hall from four sides.",
    "// AG-04/B: Arena provenance on the dome rim; ATLAS remains on podium and navigation."
  ],
  [
    "bgGrad.addColorStop(0, 'rgba(28, 53, 77, 0.91)');",
    "bgGrad.addColorStop(0, 'rgba(36, 65, 84, 0.96)');"
  ],
  [
    "bgGrad.addColorStop(0.5, 'rgba(12, 30, 48, 0.82)');",
    "bgGrad.addColorStop(0.5, 'rgba(15, 35, 50, 0.94)');"
  ],
  [
    "bgGrad.addColorStop(1, 'rgba(36, 70, 95, 0.92)');",
    "bgGrad.addColorStop(1, 'rgba(41, 77, 98, 0.96)');"
  ],
  [
    "ctx.font = '700 68px Inter, sans-serif';",
    "ctx.font = '700 76px Inter, sans-serif';"
  ],
  [
    "ctx.font = '400 30px Inter, sans-serif';",
    "ctx.font = '500 34px Inter, sans-serif';"
  ]
];
for (const [before, after] of artDirection) scene = replaceOne(scene, before, after);
// AG-04/B2.1: open oculus and rear view, local procedural assets only.
// Trace: PROTOCOLLO-PRODUZIONE-AMBIENTI-IMMERSIVI.md P4; approved reference AG-04/B2.
const architectureIncrement = [
  [
    "new THREE.CylinderGeometry(R,R,11.5,96,1,true)",
    "new THREE.CylinderGeometry(R,R,11.5,96,1,true,Math.PI+.32,Math.PI*2-.64)"
  ],
  [
    "const fasciaGeo=new THREE.CylinderGeometry(17.85,17.85,.37,96,1,true);",
    "const fasciaGeo=new THREE.CylinderGeometry(17.85,17.85,.37,96,1,true,Math.PI+.32,Math.PI*2-.64);"
  ],
  [
    "const a=(i+.5)*Math.PI*2/bays;const group=new THREE.Group();group.position.set(Math.sin(a)*19.95,h+1.68,center-Math.cos(a)*19.95);",
    "const a=(i+.5)*Math.PI*2/bays;if(Math.min(a,Math.PI*2-a)<.39)continue;const group=new THREE.Group();group.position.set(Math.sin(a)*20.02,h+1.68,center-Math.cos(a)*20.02);"
  ],
  [
    "new THREE.RingGeometry(17.8,R,96)",
    "new THREE.RingGeometry(17.8,R,96,1,Math.PI/2+.32,Math.PI*2-.64)"
  ],
  [
    "new THREE.TorusGeometry(17.85,.045,8,96),dy<0?warm:brass);rail.rotation.x=Math.PI/2;",
    "new THREE.TorusGeometry(17.85,.045,8,96,Math.PI*2-.64),dy<0?warm:brass);rail.rotation.set(Math.PI/2,0,Math.PI*1.5+.32);"
  ],
  [
    "new THREE.CylinderGeometry(17.88,17.88,.80,96,1,true)",
    "new THREE.CylinderGeometry(17.88,17.88,.80,96,1,true,Math.PI+.32,Math.PI*2-.64)"
  ],
  [
    "ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);",
    "ledges.count=ledgeIndex;ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);"
  ],
  [
    "for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const c=new THREE.Mesh(colGeo,navy);",
    "for(let i=0;i<32;i++){const a=i*Math.PI*2/32;if(Math.min(a,Math.PI*2-a)<.39)continue;const c=new THREE.Mesh(colGeo,navy);"
  ],
  [
    "const sky=new THREE.Mesh(new THREE.SphereGeometry(r,64,24,0,Math.PI*2,0,Math.PI/2),new THREE.ShaderMaterial({side:THREE.DoubleSide,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;void main(){vec3 d=normalize(p);float sun=pow(max(dot(d,normalize(vec3(-.3,.9,.2))),0.),30.);float horizon=pow(1.-clamp(d.y,0.,1.),2.);vec3 sky=mix(vec3(.37,.63,.84),vec3(.86,.91,.92),horizon);gl_FragColor=vec4(sky+sun*vec3(.24,.21,.16),1.);}`}));sky.scale.y=rise/r;sky.position.set(0,cy,cz);scene.add(sky);",
    "const sky=new THREE.Mesh(new THREE.SphereGeometry(65,64,32),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,vertexShader:`varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 p;\nfloat rnd(vec2 v){return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453);}\nfloat noise2(vec2 v){vec2 i=floor(v),f=fract(v);f=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1.,0.)),f.x),mix(rnd(i+vec2(0.,1.)),rnd(i+vec2(1.,1.)),f.x),f.y);}\nfloat fbm(vec2 v){float n=0.,w=.5;for(int i=0;i<5;i++){n+=w*noise2(v);v=v*2.03+vec2(7.3,3.1);w*=.5;}return n;}\nvoid main(){vec3 d=normalize(p);float h=max(d.y,0.);vec3 base=mix(vec3(.73,.84,.90),vec3(.21,.48,.77),pow(h,.48));vec2 uv=d.xz/max(.20,h+.25)*2.6;float n=fbm(uv);float cloud=smoothstep(.44,.67,n)*smoothstep(-.025,.16,d.y);float shade=smoothstep(.49,.78,fbm(uv+vec2(.09,-.10)));vec3 col=mix(base,mix(vec3(.67,.73,.79),vec3(1.,.98,.94),shade),cloud*.94);float sun=pow(max(dot(d,normalize(vec3(-.3,.9,.2))),0.),45.);gl_FragColor=vec4(col+sun*vec3(.12,.10,.07),1.);}`}));sky.position.set(0,0,cz);sky.renderOrder=-100;scene.add(sky);"
  ],
  [
    "for(let i=0;i<16;i++){const a=i*Math.PI/8,pts=[];for(let j=0;j<=16;j++){const u=j*Math.PI/32;pts.push(new THREE.Vector3(Math.sin(a)*r*Math.cos(u),cy+rise*Math.sin(u),cz-Math.cos(a)*r*Math.cos(u)));}tube(pts,.065,metal);}",
    "// Rear opening: a stone frame and distant layered landscape, not a flat room background.\n            const stone=new THREE.MeshStandardMaterial({color:0xc6b293,roughness:.84});\n            const archPts=[];for(let j=0;j<=24;j++){const a=j*Math.PI/24;archPts.push(new THREE.Vector3(6.05*Math.cos(a),4.8+5.75*Math.sin(a),cz-19.5));}tube(archPts,.38,stone);\n            for(const x of [-6.05,6.05]){const pillar=new THREE.Mesh(new THREE.BoxGeometry(.78,4.8,1.15),stone);pillar.position.set(x,2.4,cz-19.5);scene.add(pillar);}\n            const land=new THREE.Mesh(new THREE.PlaneGeometry(90,45),new THREE.MeshStandardMaterial({color:0x7f8f62,roughness:1}));land.rotation.x=-Math.PI/2;land.position.set(0,-.045,cz-41);scene.add(land);\n            for(let k=0;k<3;k++){const shape=new THREE.Shape();shape.moveTo(-46,-2);for(let j=0;j<=64;j++){const x=-46+j*92/64;const y=2.2+k*.85+1.1*Math.sin(j*.19+k*2.3)+.65*Math.sin(j*.43+k);shape.lineTo(x,y);}shape.lineTo(46,-2);shape.closePath();const hill=new THREE.Mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:[0x72885e,0x92a28a,0xaab8bb][k],side:THREE.DoubleSide}));hill.position.set(0,-.4,cz-29-k*8);scene.add(hill);}"
  ],
  [
    "for(const u of [0,.36,.77,1.14]){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*Math.cos(u),u===0?.095:.045,8,96),u===0?light:metal);ring.rotation.x=Math.PI/2;ring.position.set(0,cy+rise*Math.sin(u),cz);scene.add(ring);}",
    "const rim=new THREE.Mesh(new THREE.TorusGeometry(r,.22,12,96),metal);rim.rotation.x=Math.PI/2;rim.position.set(0,cy,cz);scene.add(rim);const innerLight=new THREE.Mesh(new THREE.TorusGeometry(r-.12,.045,8,96),light);innerLight.rotation.x=Math.PI/2;innerLight.position.set(0,cy-.17,cz);scene.add(innerLight);"
  ]
];
for (const [before, after] of architectureIncrement) scene = replaceOne(scene, before, after);
// AG-04/B2.2: material and indirect-light study, no external assets.
// Production protocol P4: recessed bays, opaque overhangs and integrated frieze.
const materialIncrement = [
  [
    "new THREE.HemisphereLight(0xf2f6ff,0xb28c62,.98)",
    "new THREE.HemisphereLight(0xf5f3eb,0x9c7956,.83)"
  ],
  [
    "new THREE.DirectionalLight(0xffeed3,1.35)",
    "new THREE.DirectionalLight(0xffeed3,.72)"
  ],
  [
    "new THREE.DirectionalLight(0xdcecff,.72)",
    "new THREE.DirectionalLight(0xe0edff,.48)"
  ],
  [
    "new THREE.PointLight(0xffd7a2,.92,24,1)",
    "new THREE.PointLight(0xffd7a2,.65,24,1)"
  ],
  [
    "renderer.toneMappingExposure = 1.12;",
    "renderer.toneMappingExposure = 1.06;"
  ],
  [
    "function buildRotundaRoom(){",
    "function atlasStoneTexture(){\n            const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const g=canvas.getContext('2d');const data=g.createImageData(256,256);\n            let seed=117;for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const v=(seed/4294967296-.5)*13+5*Math.sin(y*.15+Math.sin(x*.048)*2)+3*Math.sin(x*.09+y*.04);const i=(y*256+x)*4;data.data[i]=Math.max(0,Math.min(255,211+v));data.data[i+1]=Math.max(0,Math.min(255,194+v));data.data[i+2]=Math.max(0,Math.min(255,167+v));data.data[i+3]=255;}g.putImageData(data,0,0);\n            const t=new THREE.CanvasTexture(canvas);t.encoding=THREE.sRGBEncoding;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3,3);return t;\n        }\n        function buildRotundaRoom(){"
  ],
  [
    "const center=-1.6,R=20.4,levels=[0,3.8,7.6],bays=32;",
    "const center=-1.6,R=20.4,levels=[0,3.8,7.6],bays=32;\n            const stoneFinish=new THREE.MeshStandardMaterial({map:atlasStoneTexture(),color:0xe7d8c1,roughness:.83});\n            const shadeWood=new THREE.MeshStandardMaterial({color:0x4e3527,roughness:.84});\n            const concealedLight=new THREE.MeshBasicMaterial({color:0xffc983});"
  ],
  [
    "color:0x354c59,roughness:.48,metalness:.18,side:THREE.DoubleSide",
    "color:0x9a8267,roughness:.72,metalness:.06,side:THREE.DoubleSide"
  ],
  [
    "color:0x89705a,roughness:.78,side:THREE.BackSide",
    "map:atlasStoneTexture(),color:0xbba68d,roughness:.88,side:THREE.BackSide"
  ],
  [
    "lg.addColorStop(0,'#a37950');lg.addColorStop(.16,'#67503a');lg.addColorStop(1,'#271c19');",
    "lg.addColorStop(0,'#34231c');lg.addColorStop(.2,'#50382a');lg.addColorStop(.62,'#75563d');lg.addColorStop(1,'#38251e');"
  ],
  [
    "g.fillStyle='#ffd79a';g.fillRect(35,y+3,698,4);",
    "g.fillStyle='#c89b65';g.fillRect(35,y+5,698,3);"
  ],
  [
    "const wood=g.createLinearGradient(0,y+188,0,y+207);",
    "const occlusion=g.createLinearGradient(0,y,0,y+188);occlusion.addColorStop(0,'rgba(17,12,9,.58)');occlusion.addColorStop(.32,'rgba(19,13,9,.10)');occlusion.addColorStop(.78,'rgba(20,13,9,.02)');occlusion.addColorStop(1,'rgba(15,10,7,.34)');g.fillStyle=occlusion;g.fillRect(28,y,712,188);\n                    const wood=g.createLinearGradient(0,y+188,0,y+207);"
  ],
  [
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xf0e3cc}));",
    "const shelves=[1,17,81,194].map(seed=>new THREE.MeshBasicMaterial({map:shelfTexture(seed),color:0xdac8af}));\n            // Recessed bays and opaque horizontal overhangs; baked indirect shelf shading is deterministic.\n            const canopy=new THREE.InstancedMesh(new THREE.BoxGeometry(3.38,.21,1.15),stoneFinish,levels.length*bays);\n            const cheeks=new THREE.InstancedMesh(new THREE.BoxGeometry(.14,3.16,.92),shadeWood,levels.length*bays*2);\n            const lightStrips=new THREE.InstancedMesh(new THREE.BoxGeometry(3.0,.025,.045),concealedLight,levels.length*bays);\n            const bayTransform=new THREE.Object3D();let bayIndex=0,cheekIndex=0;"
  ],
  [
    "new THREE.BoxGeometry(3.12,.095,.36)",
    "new THREE.BoxGeometry(3.12,.11,.59)"
  ],
  [
    "const colGeo=new THREE.BoxGeometry(.34,11.45,.6);",
    "const colGeo=new THREE.CylinderGeometry(.24,.30,11.35,16);const capitalGeo=new THREE.CylinderGeometry(.38,.34,.18,16);"
  ],
  [
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);",
    "const shelf=new THREE.Mesh(shelfGeo,shelves[(i+j*3)%4]);group.add(shelf);\n                    function placeBay(mesh,index,lateral,y,rr){bayTransform.position.set(Math.sin(a)*rr+Math.cos(a)*lateral,y,center-Math.cos(a)*rr+Math.sin(a)*lateral);bayTransform.rotation.set(0,-a,0);bayTransform.updateMatrix();mesh.setMatrixAt(index,bayTransform.matrix);}\n                    placeBay(canopy,bayIndex,0,h+3.33,19.48);placeBay(lightStrips,bayIndex,0,h+3.19,19.22);bayIndex++;\n                    for(const lateral of [-1.56,1.56])placeBay(cheeks,cheekIndex++,lateral,h+1.68,19.61);"
  ],
  [
    "const rr=19.73;ledgeTransform.position.set",
    "const rr=19.65;ledgeTransform.position.set"
  ],
  [
    "ledges.count=ledgeIndex;ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);",
    "ledges.count=ledgeIndex;ledges.instanceMatrix.needsUpdate=true;scene.add(ledges);\n            for(const [mesh,count] of [[canopy,bayIndex],[cheeks,cheekIndex],[lightStrips,bayIndex]]){mesh.count=count;mesh.instanceMatrix.needsUpdate=true;scene.add(mesh);}"
  ],
  [
    "const c=new THREE.Mesh(colGeo,navy);c.position.set(Math.sin(a)*19.55,5.75,center-Math.cos(a)*19.55);c.rotation.y=-a;scene.add(c);",
    "const c=new THREE.Mesh(colGeo,stoneFinish);c.position.set(Math.sin(a)*18.95,5.75,center-Math.cos(a)*18.95);c.rotation.y=-a;scene.add(c);for(const y of [.15,3.7,7.5,11.32]){const cap=new THREE.Mesh(capitalGeo,stoneFinish);cap.position.set(c.position.x,y,c.position.z);scene.add(cap);}"
  ],
  [
    "new THREE.MeshStandardMaterial({color:0xc0ac90,roughness:.62,side:THREE.DoubleSide})",
    "new THREE.MeshStandardMaterial({map:atlasStoneTexture(),color:0xe1ceb1,roughness:.83,side:THREE.DoubleSide})"
  ],
  [
    "new THREE.MeshStandardMaterial({color:0xc6b293,roughness:.84})",
    "new THREE.MeshStandardMaterial({map:atlasStoneTexture(),color:0xe0cdb0,roughness:.84})"
  ],
  [
    "const c=document.createElement('canvas');c.width=1024;c.height=180;const g=c.getContext('2d');g.fillStyle='#182838';g.fillRect(0,0,1024,180);g.strokeStyle='#d5ad73';g.lineWidth=3;g.strokeRect(3,3,1018,174);g.font='600 95px Georgia,serif';g.textAlign='center';g.fillStyle='#ffe0a5';g.fillText('A R E N A',512,118);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const mat=new THREE.MeshBasicMaterial({map:t});",
    "const c=document.createElement('canvas');c.width=2048;c.height=128;const g=c.getContext('2d');g.fillStyle='#b9a083';g.fillRect(0,0,2048,128);g.fillStyle='#d7c1a2';g.fillRect(0,0,2048,7);g.fillStyle='#8c7258';g.fillRect(0,118,2048,10);g.font='600 72px Georgia,serif';g.textAlign='center';g.textBaseline='middle';for(const x of [510,1534]){g.save();g.translate(x,64);g.scale(-1,1);g.fillStyle='#79532d';g.fillText('A R E N A',0,2);g.fillStyle='#f0d7a1';g.fillText('A R E N A',0,-1);g.restore();}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;const mat=new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide});"
  ],
  [
    "for(let i=0;i<4;i++){const a=i*Math.PI/2;const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.02),mat);sign.position.set(Math.sin(a)*12.0,10.86,cz-Math.cos(a)*12.0);sign.lookAt(0,10.86,cz);scene.add(sign);}",
    "const frieze=new THREE.Mesh(new THREE.CylinderGeometry(r+.10,r+.10,.78,96,1,true),mat);frieze.position.set(0,cy-.39,cz);frieze.rotation.y=Math.PI/2;scene.add(frieze);"
  ],
  [
    "float cloud=smoothstep(.44,.67,n)*smoothstep(-.025,.16,d.y);",
    "float cloud=smoothstep(.40,.61,n)*smoothstep(-.025,.12,d.y);"
  ],
  [
    "vec3(.67,.73,.79),vec3(1.,.98,.94),shade",
    "vec3(.53,.62,.72),vec3(1.,.99,.96),smoothstep(.10,.82,shade)"
  ]
];
for (const [before, after] of materialIncrement) scene = replaceOne(scene, before, after);
// AG-04/B2.3: semantic portal art and central medallion, navigation unchanged.
// Production protocol P4: separate typography, materials and interaction.
const identityIncrement = [
  [
    "const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');const bg=g.createRadialGradient(512,420,20,512,512,720);bg.addColorStop(0,'#30465b');bg.addColorStop(1,'#101d2b');g.fillStyle=bg;g.fillRect(0,0,1024,1024);g.strokeStyle='#c8a16b';g.lineWidth=3;g.beginPath();g.arc(512,512,475,0,Math.PI*2);g.stroke();g.fillStyle='#ffe1a5';g.font='600 115px Georgia,serif';g.textAlign='center';g.fillText('A T L A S',512,590);g.font='500 35px system-ui,sans-serif';g.fillText('MONDI DELLA CONOSCENZA',512,650);g.beginPath();g.moveTo(512,272);g.lineTo(425,430);g.lineTo(462,430);g.lineTo(512,337);g.lineTo(562,430);g.lineTo(599,430);g.closePath();g.fill();const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;",
    "const c=document.createElement('canvas');c.width=c.height=1024;const g=c.getContext('2d');\n            const bg=g.createRadialGradient(512,410,25,512,512,640);bg.addColorStop(0,'#25404d');bg.addColorStop(1,'#091923');g.fillStyle=bg;g.fillRect(0,0,1024,1024);\n            g.save();g.beginPath();g.arc(512,512,481,0,Math.PI*2);g.clip();let seed=381;for(let i=0;i<95;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const y=seed/4294967296*1024;g.strokeStyle=i%5===0?'rgba(159,185,186,.14)':'rgba(166,192,190,.045)';g.lineWidth=i%5===0?2:1;g.beginPath();g.moveTo(0,y);g.bezierCurveTo(290,y-75,670,y+65,1024,y-40);g.stroke();}g.restore();\n            for(const [r,w] of [[475,5],[450,2]]){g.strokeStyle='#d3ae70';g.lineWidth=w;g.beginPath();g.arc(512,512,r,0,Math.PI*2);g.stroke();}\n            const lettering=g.createLinearGradient(0,350,0,640);lettering.addColorStop(0,'#fff3cd');lettering.addColorStop(.55,'#e9cc8e');lettering.addColorStop(1,'#b68542');\n            g.textAlign='center';g.textBaseline='middle';g.font='600 220px Georgia,serif';g.fillStyle='#08151b';g.fillText('ATLAS',512,504,815);g.fillStyle=lettering;g.fillText('ATLAS',512,494,815);\n            g.strokeStyle='#d7b67c';g.lineWidth=4;g.beginPath();g.moveTo(230,622);g.quadraticCurveTo(512,586,794,622);g.stroke();\n            g.font='500 31px system-ui,sans-serif';g.fillStyle='#dac59c';g.fillText('BIBLIOTECA DELLA CONOSCENZA',512,685,720);\n            const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;"
  ],
  [
    "disc(3.42,3.55,.13,.065,gold);disc(3.25,3.4,.14,.19,navy);disc(3.10,3.20,.08,.29,gold);",
    "disc(3.86,4.02,.13,.065,gold);disc(3.70,3.83,.12,.19,navy);disc(3.58,3.69,.08,.29,gold);"
  ],
  [
    "new THREE.CircleGeometry(3.07,96)",
    "new THREE.CircleGeometry(3.55,96)"
  ],
  [
    "for(const r of [3.12,3.43])",
    "for(const r of [3.60,3.89])"
  ],
  [
    "edge.position.y=r<3.2?.33:.12;",
    "edge.position.y=r<3.7?.33:.12;"
  ],
  [
    "const pad = 22;\n            const rad = 50;",
    "const pad = 26;\n            const rad = 64;"
  ],
  [
    "bgGrad.addColorStop(0, 'rgba(36, 65, 84, 0.96)');",
    "bgGrad.addColorStop(0, index===1?'rgba(30,64,81,0.99)':'rgba(25,47,60,0.98)');"
  ],
  [
    "bgGrad.addColorStop(0.5, 'rgba(15, 35, 50, 0.94)');",
    "bgGrad.addColorStop(0.5, 'rgba(9,25,35,0.99)');"
  ],
  [
    "bgGrad.addColorStop(1, 'rgba(41, 77, 98, 0.96)');",
    "bgGrad.addColorStop(1, index===1?'rgba(29,66,80,0.99)':'rgba(24,49,65,0.98)');"
  ],
  [
    "borderGrad.addColorStop(0.7, '#9DC4FF');",
    "borderGrad.addColorStop(0.7, '#B99C70');"
  ],
  [
    "ctx.lineWidth = 9;\n            ctx.shadowColor = \"#ffdf9e\"; ctx.shadowBlur = 22; ctx.stroke(); ctx.shadowBlur=0;",
    "ctx.lineWidth = index===1?12:7;\n            ctx.shadowColor = '#ffdf9e';ctx.shadowBlur=index===1?10:4;ctx.stroke();ctx.shadowBlur=0;"
  ],
  [
    "ctx.translate(W / 2, 160);",
    "ctx.translate(W / 2, 137);"
  ],
  [
    "ctx.font = '700 76px Inter, sans-serif';\n            ctx.textAlign = 'center';\n            ctx.fillText(pillar.title, W / 2, 320, W-78);",
    "ctx.font = '600 94px Georgia,serif';\n            ctx.textAlign = 'center';\n            const titleWords=pillar.title.split(' ');ctx.fillText(titleWords[0],W/2,282,W-95);ctx.fillText(titleWords.slice(1).join(' '),W/2,388,W-95);"
  ],
  [
    "ctx.font = '500 34px Inter, sans-serif';\n            ctx.fillText(pillar.subtitle, W / 2, 378, W-80);",
    "ctx.font='500 27px system-ui,sans-serif';\n            const subtitleParts=pillar.subtitle.split(' · ');const midpoint=Math.ceil(subtitleParts.length/2);ctx.fillText(subtitleParts.slice(0,midpoint).join(' · '),W/2,445,W-96);ctx.fillText(subtitleParts.slice(midpoint).join(' · '),W/2,482,W-96);"
  ],
  [
    "ctx.lineWidth=5;ctx.strokeStyle='#9ecfff';ctx.fillStyle='rgba(114,188,240,.18)';",
    "ctx.lineWidth=5;ctx.strokeStyle='#e5c88f';ctx.fillStyle='rgba(221,187,126,.08)';"
  ],
  [
    "ctx.fillStyle=\"#f6d78e\";ctx.font=\"600 32px Inter,sans-serif\";ctx.textAlign=\"center\";ctx.fillText(index===2?\"ACCESSO PROFESSIONALE  →\":\"ENTRA  →\",W/2,1000);",
    "ctx.fillStyle=index===1?'#f2d491':'#e4c58e';ctx.font='600 36px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(index===2?'ACCESSO PROFESSIONALE':'ENTRA  →',W/2,997,W-100);"
  ],
  [
    "g.fillStyle='#79532d';g.fillText('A R E N A',0,2);g.fillStyle='#f0d7a1';g.fillText('A R E N A',0,-1);",
    "g.fillStyle='#ebd4b4';g.fillText('A R E N A',0,3);g.fillStyle='#5e412b';g.fillText('A R E N A',0,-1);"
  ]
];
for (const [before, after] of identityIncrement) scene = replaceOne(scene, before, after);




scene = scene.replace(/(<(?:span|h2)\b[^>]*\bid="(?:inspect-title|card-title)"[^>]*>)[^<]*(<\/(?:span|h2)>)/g, "$1Curricolo Atlas$2");
const responsiveStyles = "\n/* Candidate-only responsive overlay: original model and geometry stay intact. */\n#atlas-quick{left:50%;right:auto;bottom:8px;transform:translateX(-50%);width:min(580px,calc(100% - 16px));max-width:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px}\n#atlas-quick button{min-width:0;min-height:44px;white-space:normal;overflow-wrap:anywhere;line-height:1.15;padding:5px 7px;font-size:clamp(11px,1.6vw,14px);cursor:pointer}\n#gesture-controls{width:max-content;max-width:calc(100% - 12px);gap:2px;padding:3px}\n#gesture-controls button{min-height:44px;min-width:44px;padding:3px 6px;font-size:12px}\n#gesture-controls .gesture-divider{display:none}\n#hero-footer{bottom:74px!important}\n@media(max-width:480px){#gesture-controls{width:calc(100% - 12px);display:grid;grid-template-columns:repeat(6,minmax(0,1fr));top:56px;gap:1px}#gesture-controls button{min-width:0;padding:2px;font-size:11px}header nav{display:none!important}#hero-footer p{font-size:12px}#atlas-quick button{font-size:11px;padding:4px 2px}}\n@media(max-height:460px){#hero-footer,#hover-badge,body>header{display:none!important}#gesture-controls{top:5px;width:min(420px,calc(100% - 12px));display:grid;grid-template-columns:repeat(6,minmax(0,1fr))}#gesture-controls button{min-width:0;min-height:44px}#atlas-quick{bottom:4px}}\n";
scene = replaceOne(scene, "</head>", "<style id=\"atlas-responsive-candidate\">"+responsiveStyles+"</style></head>");
const three = checked(threePath, threeSha);
const css = checked(cssPath, cssSha);
if (/<\/script/i.test(three) || /<\/style/i.test(css)) throw new Error("Dipendenza non incorporabile");
if (/@import\b|url\s*\(/i.test(css)) throw new Error("CSS con risorse esterne o import non consentito");
const bridge = 'const ATLAS_PARENT_ORIGIN=__ATLAS_PARENT_ORIGIN_JSON__; const ATLAS_CHANNEL=__ATLAS_CHANNEL_JSON__; function sendAtlas(data){window.parent.postMessage({...data,channel:ATLAS_CHANNEL},ATLAS_PARENT_ORIGIN);}';
scene = scene.replace(/^[ \t]*<link[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>\r?\n/gm, "");
scene = replaceOne(scene, '<script src="https://cdn.tailwindcss.com"></script>', '<style>'+css+'</style>');
scene = replaceOne(scene, '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>', '<script>'+three+'</script><script>'+bridge+'</script>');
scene = replaceOne(scene, '<head>', '<head><meta name="atlas-gateway-local-scene-v1" content="prepared"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data: blob:; connect-src \'none\'; font-src \'none\'; object-src \'none\'; base-uri \'none\'; form-action \'none\'">');
scene = replaceOne(scene, 'window.parent.postMessage({type:"atlas-3d-ready"}, "*");', 'sendAtlas({type:"atlas-3d-ready"});');
scene = replaceOne(scene, "window.parent.postMessage({type:'atlas-3d-error'}, '*');", "sendAtlas({type:'atlas-3d-error'});");
scene = replaceOne(scene, "window.parent.postMessage({type:'atlas-open',id},'*');", "sendAtlas({type:'atlas-open',id});");
scene = replaceOne(scene, "window.addEventListener('message',e=>{if(e.source!==window.parent)return;if(e.data?.type==='atlas-pause')paused=!!e.data.value;});", "// Parent unmounts the iframe when leaving the room.");
scene = replaceOne(scene, "setupNativeControls(renderer.domElement);", "setupNativeControls(renderer.domElement);\n                renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); paused = true; sendAtlas({type:'atlas-3d-error'}); }, {once:true});");
if (/<script[^>]+src\s*=|<link[^>]+href\s*=|postMessage\([^;\n]*['"]\*['"]/i.test(scene)) throw new Error("Sorgente non isolato");
writeFileSync(output, scene, { flag: "wx" });
console.log("Prepared local scene SHA256:", digest(scene));
