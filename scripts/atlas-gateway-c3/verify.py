import json, struct, hashlib, pathlib, sys
p=pathlib.Path(sys.argv[1]); m=json.loads((p/"manifest.json").read_text())
for name,meta in m["files"].items():
    b=(p/name).read_bytes(); assert len(b)==meta["bytes"] and hashlib.sha256(b).hexdigest()==meta["sha256"],name
b=(p/"campata.glb").read_bytes()
magic,version,length=struct.unpack_from("<4sII",b); assert (magic,version,length)==(b"glTF",2,len(b))
n,kind=struct.unpack_from("<I4s",b,12);assert kind==b"JSON"
d=json.loads(b[20:20+n]);assert d["asset"]["version"]=="2.0" and d.get("meshes") and d.get("materials")
assert not d.get("extensionsRequired"),d.get("extensionsRequired")
assert all("uri" not in x for k in ("buffers","images") for x in d.get(k,[]))
assert len(b)<=3*1024*1024 and (p/"campata.png").stat().st_size<=3*1024*1024
assert (p/"campata.png").read_bytes().startswith(b"\x89PNG\r\n\x1a\n")
assert m["studentAuthorized"] is False
print(json.dumps({"status":"PASS","glbBytes":len(b),"meshCount":len(d["meshes"]),"materialCount":len(d["materials"]),"blender":m["blender"],"lightBake":m["lightBake"]},indent=2))
