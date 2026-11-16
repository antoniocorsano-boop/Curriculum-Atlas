"""C3.3A2 acceptance: shell + linked bay placement contract, not browser qualification."""
import pathlib,sys,hashlib,math,json,struct
p=pathlib.Path(sys.argv[1]);m=json.loads((p/"library-manifest.json").read_text())
assert m["phase"]=="C3.3A2" and m["studentAuthorized"] is False and m["portalsIntegrated"] is False
assert m["levels"]==3 and m["sectors"]==18 and m["openSectors"]==[0,1,17] and m["sharedBayMeshCount"]==25 and m["bookVariants"]==3 and m["variantGLBsProduced"] is False
assert m["bayCount"]==45 and len(m["placements"])==45
assert {(q["sector"],q["level"]) for q in m["placements"]}=={(i,j) for i in range(2,17) for j in range(3)}
for q in m["placements"]:
    x,y,z=q["positionBlender"];t=2*math.pi*q["sector"]/18
    assert math.isclose(x,10.6*math.sin(t),abs_tol=1e-5) and math.isclose(y,10.6*math.cos(t),abs_tol=1e-5)
    assert math.isclose(z,q["level"]*3.63,abs_tol=1e-5) and math.isclose(q["rotationZ"],-t)
    assert q["detailVariant"]==(q["sector"]*2+q["level"])%3
ao=p.parent/"atlas-c32b"/"campata-ao.glb";assert hashlib.sha256(ao.read_bytes()).hexdigest()==m["qualifiedBayGlbSha256"]
assert hashlib.sha256((p.parent/"atlas-c32"/"campata.blend").read_bytes()).hexdigest()==m["sourceBlendSha256"]
for name,item in m["files"].items():
    b=(p/name).read_bytes();assert len(b)==item["bytes"] and hashlib.sha256(b).hexdigest()==item["sha256"],name
for name,dimensions in (("atrium.png",(1200,750)),("vertical.png",(640,960)),("detail.png",(900,700))):
    b=(p/name).read_bytes();assert b.startswith(b"\x89PNG\r\n\x1a\n") and struct.unpack_from(">II",b,16)==dimensions and len(b)>30000,name
b=(p/"library-shell.glb").read_bytes();assert struct.unpack_from("<4sII",b)==(b"glTF",2,len(b))
n,t=struct.unpack_from("<I4s",b,12);assert t==b"JSON";d=json.loads(b[20:20+n])
assert d["asset"]["version"]=="2.0" and not d.get("extensionsRequired")
assert all("uri" not in item for k in ("buffers","images") for item in d.get(k,[]))
primitives=sum(len(q["primitives"]) for q in d["meshes"])
assert 1<=primitives<=18 and len(b)<=12*1024*1024,(primitives,len(b))
assert m["skySha256"]=="cf7220b7d6705577e772c28a75cfd67ef508b342904e24d20f227a38fe853130"
assert hashlib.sha256((p.parent/"atlas-c32/assets/kloppenheim_03.hdr").read_bytes()).hexdigest()==m["skySha256"]
assert len({q["detailVariant"] for q in m["placements"]})==3
assert all("Library bay " not in q.get("name","") for q in d["nodes"])
receipt={"status":"PASS","phase":"C3.3A2","bayPlacements":45,"sharedBayMeshes":25,"bookVariants":3,"shellPrimitives":primitives,"shellBytes":len(b),"bayBytes":ao.stat().st_size,"variantGLBsProduced":False,"renders":3,"browserQualified":False,"studentAuthorized":False}
(p/"library-verification.json").write_text(json.dumps(receipt,indent=2)+"\n");print(json.dumps(receipt,indent=2))
