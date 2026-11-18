import json, struct, hashlib, pathlib, sys
p=pathlib.Path(sys.argv[1]);m=json.loads((p/"manifest.json").read_text());a=json.loads((p/"assets/manifest.json").read_text())
assert hashlib.sha256((p/"assets/manifest.json").read_bytes()).hexdigest()==m["assetManifestSha256"]
assert a["license"]=="CC0-1.0" and len(a["files"])==7
for item in a["files"]:
    b=(p/"assets"/item["name"]).read_bytes()
    assert len(b)==item["bytes"] and hashlib.sha256(b).hexdigest()==item["sha256"],item["name"]
for name,meta in m["files"].items():
    b=(p/name).read_bytes();assert len(b)==meta["bytes"] and hashlib.sha256(b).hexdigest()==meta["sha256"],name
b=(p/"campata.glb").read_bytes();assert struct.unpack_from("<4sII",b)==(b"glTF",2,len(b))
n,kind=struct.unpack_from("<I4s",b,12);assert kind==b"JSON"
d=json.loads(b[20:20+n])
assert d["asset"]["version"]=="2.0" and not d.get("extensionsRequired")
assert all("uri" not in x for k in ("buffers","images") for x in d.get(k,[]))
assert 1<=len(d["meshes"])<=12 and m["originalObjects"]>=150
primitives=sum(len(mesh["primitives"]) for mesh in d["meshes"])
assert primitives<=12,primitives
assert len(d.get("images",[]))>=6
textured=[x for x in d["materials"] if x.get("pbrMetallicRoughness",{}).get("baseColorTexture") and x.get("normalTexture") and x.get("pbrMetallicRoughness",{}).get("metallicRoughnessTexture")]
assert len(textured)>=2,len(textured)
assert len(b)<=6*1024*1024 and (p/"campata.png").stat().st_size<=3*1024*1024
assert (p/"campata.png").read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
assert m["studentAuthorized"] is False and m["lightBake"] is False
print(json.dumps({"status":"PASS","glbBytes":len(b),"meshCount":len(d["meshes"]),"primitiveCount":primitives,"imageCount":len(d["images"]),"texturedMaterials":len(textured),"originalObjects":m["originalObjects"],"lightBake":False},indent=2))
