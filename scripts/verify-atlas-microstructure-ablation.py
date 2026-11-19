"""Independent microstructure receipt checks; no Blender dependency."""
import json,sys,math,hashlib
from pathlib import Path
p=Path(sys.argv[1])
r=json.loads((p/"diffuse-bake.json").read_text())
a=json.loads((p/"material-ablation.json").read_text())
m=json.loads((p/"microstructure.json").read_text())
assert r["revision"]==a["revision"]==m["revision"]==sys.argv[2]
assert m["schema"]=="atlas.asc01.microstructure-ablation/v1" and m["status"]=="PASS_MICROSTRUCTURE_ABLATION"
assert m["masterSha256"]==a["masterSha256"]==r["masterSha256"] and m["target"]==a["target"]==r["target"]
assert m["geometryTriangles"]==108 and m["fixedDiffuse"]
assert not any(m[k] for k in ("artisticApproval","webglQualified","publishable"))
assert m["selection"]=="REVIEW_ONLY_NO_AUTOMATIC_SIMPLIFICATION"
s=m["uvSpacing"]
assert s["resolution"]==512 and s["triangles"]==108 and s["islands"]>0
assert s["crossIslandOverlap"]==0 and s["occupiedTexels"]>100 and s["edgeClearanceTexels"]>=0
assert not s["exactPolygonProof"] and not s["mipBleedQualified"]
assert set(s["squareDilation"])=={"1","2","4","8"}
last=0
for radius in (1,2,4,8):
    v=s["squareDilation"][str(radius)]
    assert last<=v["collisionTexels"]<=v["expandedTexels"]<=512**2
    last=v["collisionTexels"]
names={"micro-"+n+"-"+q for n in ("full","map","flat") for q in ("texture","constant")}
assert set(m["cases"])==names|{"micro-full-repeat"}
for name,v in m["cases"].items():
    assert v["imageSha256"]==r["renders"][name]["sha256"]==hashlib.sha256((p/(name+".png")).read_bytes()).hexdigest()
    for t in (v,v["differenceFromFull"]):
        assert t["samples"]==1068
        assert all(math.isfinite(t[k]) and 0<=t[k]<=1 for k in ("mean","p95","max","frameMean"))
        assert t["mean"]<=t["max"] and t["p95"]<=t["max"]
base=m["cases"]["micro-full-texture"]
assert base["differenceFromFull"]["max"]==0
assert abs(base["mean"]-a["material-hybrid-camera"]["mean"])<=.001
noise=m["cases"]["micro-full-repeat"]["differenceFromFull"]["mean"]
assert noise==m["repeatNoise"] and noise<=.001
margin=max(.001,3*noise)
assert margin==m["decisionMargin"]
assert set(m["comparisons"])==names-{"micro-full-texture"}
for name,v in m["comparisons"].items():
    d=m["cases"][name]["mean"]-base["mean"]
    assert math.isclose(v["errorIncrease"],d,abs_tol=1e-12)
    assert v["materialDifference"]==m["cases"][name]["differenceFromFull"]["mean"]
    assert v["classification"]==("WORSE" if d>margin else "BETTER" if d<-margin else "WITHIN_MARGIN")
assert m["inventory"]["normalMap"]["space"]=="TANGENT" and len(m["inventory"]["images"])==3
print("P2C3B microstructure diagnostic verified; no automatic simplification or artistic promotion.")
