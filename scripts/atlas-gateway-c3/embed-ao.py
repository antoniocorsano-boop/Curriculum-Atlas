"""Embed the baked PNG in GLB and explicitly bind TEXCOORD_1 for occlusion."""
import pathlib,sys,json,struct,hashlib,copy
p=pathlib.Path(sys.argv[1])
def read_glb(path):
    b=path.read_bytes();assert struct.unpack_from("<4sII",b)==(b"glTF",2,len(b))
    n,t=struct.unpack_from("<I4s",b,12);assert t==b"JSON"
    doc=json.loads(b[20:20+n]);m,t=struct.unpack_from("<I4s",b,20+n);assert t==b"BIN\0" and 28+n+m==len(b)
    return doc,b[28+n:]
d,buf=read_glb(p/"geometry.glb")
assert len(d["buffers"])==1 and not d.get("extensionsRequired")
assert all("uri" not in x for k in ("buffers","images") for x in d.get(k,[]))
primitives=[q for mesh in d["meshes"] for q in mesh["primitives"]]
assert len(primitives)==11,len(primitives)
for q in primitives:
    assert "TEXCOORD_0" in q["attributes"] and "TEXCOORD_1" in q["attributes"],q["attributes"]
    a=d["accessors"][q["attributes"]["TEXCOORD_1"]]
    assert a["type"]=="VEC2" and a["count"]==d["accessors"][q["attributes"]["POSITION"]]["count"]
png=(p/"ao.png").read_bytes();assert png.startswith(b"\x89PNG\r\n\x1a\n")
assert struct.unpack_from(">II",png,16)==(2048,2048)
offset=len(buf);assert offset%4==0
view=len(d["bufferViews"]);d["bufferViews"].append({"buffer":0,"byteOffset":offset,"byteLength":len(png)})
image=len(d["images"]);d["images"].append({"name":"Atlas ambient occlusion","bufferView":view,"mimeType":"image/png"})
sampler=len(d.setdefault("samplers",[]));d["samplers"].append({"magFilter":9729,"minFilter":9987,"wrapS":33071,"wrapT":33071})
texture=len(d["textures"]);d["textures"].append({"source":image,"sampler":sampler})
for idx in {q["material"] for q in primitives}:d["materials"][idx]["occlusionTexture"]={"index":texture,"texCoord":1,"strength":1.0}
buf+=png;buf+=b"\0"*((-len(buf))%4);d["buffers"][0]["byteLength"]=len(buf)
j=json.dumps(d,separators=(",",":")).encode();j+=b" "*((-len(j))%4)
b=struct.pack("<4sII",b"glTF",2,28+len(j)+len(buf))+struct.pack("<I4s",len(j),b"JSON")+j+struct.pack("<I4s",len(buf),b"BIN\0")+buf
assert len(b)<=8*1024*1024,len(b)
(p/"campata-ao.glb").write_bytes(b)
verify,_=read_glb(p/"campata-ao.glb")
assert all(verify["materials"][q["material"]]["occlusionTexture"]=={"index":texture,"texCoord":1,"strength":1.0} for q in primitives)
bake=json.loads((p/"bake.json").read_text());assert bake["overlapPixels"]==0 and bake["studentAuthorized"] is False
receipt={"status":"PASS","glbBytes":len(b),"primitives":len(primitives),"aoTexture":texture,"aoTexCoord":1,"aoBake":True,"fullLightBake":False,"studentAuthorized":False,"files":{}}
for name in ("ao.png","campata-ao.glb","campata-ao.blend","bake.json"):
    data=(p/name).read_bytes();receipt["files"][name]={"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()}
(p/"ao-manifest.json").write_text(json.dumps(receipt,indent=2)+"\n");print(json.dumps(receipt,indent=2))
