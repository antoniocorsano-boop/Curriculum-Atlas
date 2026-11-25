// Preview-only transfer of original local WebP images. No external URLs, storage or publication.
const MAX_FILE=4*1024*1024,MAX_TOTAL=16*1024*1024,MAX_PIXELS=12_000_000,MAX_TOTAL_PIXELS=24_000_000;
const hex=/^[a-f0-9]{64}$/;
const id=/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,99}$/;
export type PreviewIllustrationBinding={sceneId:string;assetId:string;alt:string;role:"SETTING"|"CHARACTER"|"SCENE"};
export type PreviewImage={assetId:string;sha256:string;pixelWidth:number;pixelHeight:number;base64:string};
export type PreviewIllustratedMedia={revisionDigest:string;mediaDigest:string;bindings:PreviewIllustrationBinding[];images:PreviewImage[]};
export type VerifiedSceneIllustration={src:string;alt:string;role:PreviewIllustrationBinding["role"];width:number;height:number};
type Snapshot={snapshotId:string;packageDigest:string;pathwayId:string;version:string;title:string;description:string;scenes:Array<{sceneId:string;stage?:{evidence?:Array<{id:string;hotspot?:{x:number;y:number}}>}}>;edutwinMedia?:unknown;sceneMedia?:unknown};
const fail=():never=>{throw new Error("EDUTWIN_PREVIEW_MEDIA_INVALID");};
function record(x:unknown,keys:string[]):Record<string,unknown>{
 if(!x||typeof x!=="object"||Array.isArray(x)||Object.keys(x).length!==keys.length||keys.some(k=>!Object.hasOwn(x,k)))return fail();
 return x as Record<string,unknown>;
}
function str(x:unknown,pattern:RegExp){if(typeof x!=="string"||!pattern.test(x))return fail();return x;}
function positive(x:unknown){if(typeof x!=="number"||!Number.isInteger(x)||x<1||x>16384)return fail();return x;}
async function sha(bytes:Uint8Array<ArrayBuffer>){
 return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),b=>b.toString(16).padStart(2,"0")).join("");
}
// Fixed field order shared with Studio; images are represented by verified SHA-256
// and dimensions. The digest is an integrity binding, not an approval or signature.
export function mediaDigestInput(snapshot:Snapshot,media:Omit<PreviewIllustratedMedia,"mediaDigest">){
 return JSON.stringify({snapshotId:snapshot.snapshotId,packageDigest:snapshot.packageDigest,pathwayId:snapshot.pathwayId,version:snapshot.version,title:snapshot.title,description:snapshot.description,
  scenes:snapshot.scenes,revisionDigest:media.revisionDigest,
  bindings:media.bindings.map(b=>[b.sceneId,b.assetId,b.alt,b.role]),
  images:media.images.map(i=>[i.assetId,i.sha256,i.pixelWidth,i.pixelHeight])});
}
function decodeImage(base64:unknown){
 if(typeof base64!=="string"||base64.length===0||base64.length>4*Math.ceil(MAX_FILE/3)||
  base64.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))return fail();
 const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
 if(bytes.length>MAX_FILE||bytes.length<20)return fail();
 const tag=(at:number)=>String.fromCharCode(...bytes.subarray(at,at+4));
 const v=new DataView(bytes.buffer);
 if(tag(0)!=="RIFF"||tag(8)!=="WEBP"||v.getUint32(4,true)+8!==bytes.length)return fail();
 // Header validation before decoding prevents oversized or animated canvases.
 let offset=12,count=0,image:{width:number;height:number}|undefined,canvas:{width:number;height:number}|undefined;
 const u24=(i:number)=>bytes[i]+256*bytes[i+1]+65536*bytes[i+2];
 while(offset<bytes.length){
  if(++count>1024||offset+8>bytes.length)return fail();
  const name=tag(offset),n=v.getUint32(offset+4,true),start=offset+8,end=start+n,next=end+n%2;
  if(next>bytes.length||name==="ANIM"||name==="ANMF")return fail();
  if(name==="VP8X"){
   if(offset!==12||canvas||n!==10||(bytes[start]&0xc3)!==0||bytes[start+1]||bytes[start+2]||bytes[start+3])return fail();
   canvas={width:u24(start+4)+1,height:u24(start+7)+1};
  }
  if(name==="VP8 "||name==="VP8L"){
   if(image)return fail();
   if(name==="VP8 "){
    if(n<10||(bytes[start]&1)!==0||bytes[start+3]!==0x9d||bytes[start+4]!==1||bytes[start+5]!==0x2a)return fail();
    image={width:v.getUint16(start+6,true)&0x3fff,height:v.getUint16(start+8,true)&0x3fff};
   }else{
    if(n<5||bytes[start]!==0x2f)return fail();
    const bits=v.getUint32(start+1,true);if((bits>>>29)!==0)return fail();
    image={width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};
   }
  }
  offset=next;
 }
 if(!image||offset!==bytes.length||image.width<1||image.height<1||image.width>16384||image.height>16384||
  image.width*image.height>MAX_PIXELS||(canvas&&(canvas.width!==image.width||canvas.height!==image.height)))return fail();
 return {bytes,...image};
}
export async function verifyPreviewIllustrations(snapshot:Snapshot):Promise<ReadonlyMap<string,VerifiedSceneIllustration>>{
 const hotspots=snapshot.scenes.filter(s=>s.stage?.evidence?.some(e=>e.hotspot!==undefined));
 const generic=snapshot.sceneMedia!==undefined;
 if(snapshot.edutwinMedia===undefined&&!generic){if(hotspots.length)return fail();return new Map();}
 if(generic){
  if(snapshot.edutwinMedia!==undefined||snapshot.scenes[0]?.sceneId==="edutwin-opening")return fail();
 }else if(snapshot.scenes[0]?.sceneId!=="edutwin-opening"||snapshot.scenes.some(s=>s.stage))return fail();
 const m=record(generic?snapshot.sceneMedia:snapshot.edutwinMedia,["revisionDigest","mediaDigest","bindings","images"]);
 const revisionDigest=str(m.revisionDigest,hex),mediaDigest=str(m.mediaDigest,hex);
 if(generic&&revisionDigest!==snapshot.packageDigest)return fail();
 if(!Array.isArray(m.bindings)||!Array.isArray(m.images)||m.bindings.length>100||m.images.length>32||m.bindings.length===0||m.images.length===0)return fail();
 const bindings:PreviewIllustrationBinding[]=[],sceneIds=new Set<string>(),wanted=new Set<string>();
 for(const raw of m.bindings){
  const b=record(raw,["sceneId","assetId","alt","role"]);
  const sceneId=str(b.sceneId,id),assetId=str(b.assetId,id);
  if(!snapshot.scenes.some(s=>s.sceneId===sceneId)||sceneIds.has(sceneId)||typeof b.alt!=="string"||!b.alt.trim()||b.alt.length>300||
   (b.role!=="SETTING"&&b.role!=="CHARACTER"&&b.role!=="SCENE"))return fail();
  bindings.push({sceneId,assetId,alt:b.alt,role:b.role});sceneIds.add(sceneId);wanted.add(assetId);
 }
 if(generic&&(hotspots.length!==bindings.length||hotspots.some(s=>!sceneIds.has(s.sceneId))||bindings.some(b=>b.role!=="SCENE")))return fail();
 const images:PreviewImage[]=[],verified=new Map<string,PreviewImage>();
 let total=0,pixels=0;
 for(const raw of m.images){
  const i=record(raw,["assetId","sha256","pixelWidth","pixelHeight","base64"]);
  const assetId=str(i.assetId,id),digest=str(i.sha256,hex),pixelWidth=positive(i.pixelWidth),pixelHeight=positive(i.pixelHeight);
  if(!wanted.has(assetId)||verified.has(assetId))return fail();
  const {bytes,width,height}=decodeImage(i.base64);
  total+=bytes.length;pixels+=width*height;
  if(total>MAX_TOTAL||pixels>MAX_TOTAL_PIXELS||width!==pixelWidth||height!==pixelHeight||await sha(bytes)!==digest)return fail();
  const image={assetId,sha256:digest,pixelWidth,pixelHeight,base64:i.base64 as string};
  images.push(image);verified.set(assetId,image);
 }
 if(verified.size!==wanted.size||await sha(new TextEncoder().encode(mediaDigestInput(snapshot,{revisionDigest,bindings,images})))!==mediaDigest)return fail();
 return new Map(bindings.map(b=>{
  const image=verified.get(b.assetId)!;
  return [b.sceneId,{src:"data:image/webp;base64,"+image.base64,alt:b.alt,role:b.role,width:image.pixelWidth,height:image.pixelHeight}];
 }));
}

/** Browser qualification: a valid header and hash do not guarantee decodable pixels. */
export async function verifyDecodedIllustrations(illustrations:ReadonlyMap<string,VerifiedSceneIllustration>){
 const seen=new Set<string>();
 for(const illustration of illustrations.values()){
  if(seen.has(illustration.src))continue;
  seen.add(illustration.src);
  const image=new Image();
  image.src=illustration.src;
  await image.decode();
  if(image.naturalWidth!==illustration.width||image.naturalHeight!==illustration.height)return fail();
 }
}
