// Native asset contract. The parent owns all network access. The sandbox
// receives only verified, transferable bytes from a fixed local allowlist.
export const NATIVE_ASSET_IDS = ["shell","scenography","cupola","portals","bays","stars","sky","ambient"] as const;
export type NativeAssetId = typeof NATIVE_ASSET_IDS[number];
export type NativeAsset = { id: NativeAssetId; bytes: number; sha256: string; file: string };
export type NativeManifest = { schema: "atlas.gateway.native-assets/v1"; assets: NativeAsset[]; studentAuthorized: false };
export const NATIVE_ASSET_LIMIT = 40_000_000;
const hex = /^[a-f0-9]{64}$/;
const extensions: Record<NativeAssetId,string> = {shell:"glb",scenography:"glb",cupola:"glb",portals:"glb",bays:"glb",stars:"glb",sky:"png",ambient:"hdr"};
export function parseNativeManifest(value: unknown): NativeManifest | null {
 if(!value || typeof value!=="object" || Array.isArray(value))return null;
 const v=value as Record<string,unknown>;
 if(v.schema!=="atlas.gateway.native-assets/v1" || v.studentAuthorized!==false || !Array.isArray(v.assets)||v.assets.length!==NATIVE_ASSET_IDS.length)return null;
 const assets: NativeAsset[]=[];
 for(let i=0;i<NATIVE_ASSET_IDS.length;i++){
  const id=NATIVE_ASSET_IDS[i],a=v.assets[i];
  if(!a||typeof a!=="object"||Array.isArray(a)||a.id!==id||typeof a.sha256!=="string"||!hex.test(a.sha256)||!Number.isSafeInteger(a.bytes)||a.bytes<1||a.bytes>NATIVE_ASSET_LIMIT||a.file!==id+"-"+a.sha256+"."+extensions[id])return null;
  assets.push({id,sha256:a.sha256,bytes:a.bytes,file:a.file});
 }
 if(assets.reduce((sum,a)=>sum+a.bytes,0)>NATIVE_ASSET_LIMIT)return null;
 return {schema:"atlas.gateway.native-assets/v1",assets,studentAuthorized:false};
}
export function nativeRequest(data:unknown,channel:string,manifest:NativeManifest):NativeAsset|null {
 if(!data||typeof data!=="object"||Array.isArray(data))return null;
 const v=data as Record<string,unknown>;
 if(v.channel!==channel||v.type!=="atlas-native-asset-request")return null;
 return manifest.assets.find(a=>a.id===v.id)??null;
}
export async function verifiedNativeBytes(asset:NativeAsset,signal:AbortSignal):Promise<ArrayBuffer>{
 const response=await fetch("/atlas-gateway-native/"+asset.file,{signal,credentials:"omit",redirect:"error",cache:"no-store"});
 if(!response.ok||response.type==="opaque")throw Error("Native asset unavailable");
 const size=response.headers.get("content-length");
 if(size!==null&&Number(size)!==asset.bytes)throw Error("Native asset size mismatch");
 if(!response.body)throw Error("Native asset body missing");
 const reader=response.body.getReader(),buffer=new Uint8Array(asset.bytes);let offset=0;
 try{
  for(;;){
   const {done,value}=await reader.read();
   if(done)break;
   if(offset+value.length>buffer.length)throw Error("Native asset exceeds declared size");
   buffer.set(value,offset);offset+=value.length;
  }
 }catch(error){await reader.cancel().catch(()=>{});throw error;}
 finally{reader.releaseLock();}
 if(offset!==asset.bytes)throw Error("Native asset truncated");
 const actual=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",buffer)),b=>b.toString(16).padStart(2,"0")).join("");
 if(actual!==asset.sha256)throw Error("Native asset integrity mismatch");
 return buffer.buffer;
}
