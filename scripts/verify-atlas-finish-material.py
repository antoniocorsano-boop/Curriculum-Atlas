"""Validate the production-finish candidate and its immutable inputs."""
import sys,json,hashlib,math,struct
from pathlib import Path
p,revision,prior=Path(sys.argv[1]),sys.argv[2],Path(sys.argv[3])
def read(path):return json.loads(path.read_text())
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
r=read(p/"diffuse-bake.json")
a=read(p/"material-ablation.json")
f=read(p/"material-finish.json")
b=read(p/"surface-binding.json")
m=read(p/"material-package.json")
old=read(prior/"microstructure.json")
assert all(q["revision"]==revision for q in (r,a,f,b,m))
assert all(q["masterSha256"]==r["masterSha256"] for q in (a,f,b,m,old))
assert f["status"]=="PASS_FINISH_PACKAGE" and f["priorRevision"]==old["revision"]
assert old["revision"]=="aeeab27f48fc69b75d6fae2be68fa4ae215378db"
assert old["status"]=="PASS_MICROSTRUCTURE_ABLATION"
assert f["spacing"]==r["uv"]["productionSpacing"]
s=f["spacing"]
assert s["resolution"]==512 and s["triangles"]==108 and s["islands"]>0
assert s["crossIslandOverlap"]==0 and s["edgeClearanceTexels"]>=8
assert s["squareDilation"]["8"]["collisionTexels"]==0
assert s["occupiedTexels"]>=.65*old["uvSpacing"]["occupiedTexels"]
assert f["bakeSamples"]==r["bake"]["samples"]==128
assert r["masterUnchanged"] and r["bindingsRestored"]
assert m["schema"]=="atlas.asc01.material-package/v1"
assert b["triangles"]==m["triangles"]==108
assert m["bindingSha256"]==sha(p/"surface-binding.json")
assert f["packageSha256"]==sha(p/"material-package.json")
assert b["texture"]["sha256"]==sha(p/"binding.rgba32f")
assert b["texture"]["sourceExrSha256"]==sha(p/"diffuse-linear.exr")
assert b["texture"]["width"]==b["texture"]["height"]==512
assert (p/"binding.rgba32f").stat().st_size==512*512*16
assert len(b["positions"])==len(b["uv"])==len(m["materialUV"])==len(m["worldNormals"])==324
assert all(len(v)==2 and all(math.isfinite(x) for x in v) for v in m["materialUV"])
assert all(len(v)==3 and abs(sum(x*x for x in v)-1)<1e-5 for v in m["worldNormals"])
assert all(len(v)==2 and all(0<=x<=1 for x in v) for v in b["uv"])
rough=m["roughness"]
assert rough["width"]==rough["height"]==1024
assert rough["sha256"]==sha(p/"roughness.rgb8")
assert (p/"roughness.rgb8").stat().st_size==1024*1024*3
assert rough["sourcePackedSha256"]=="5cb9d78ec685155d2b66a1db01abc61049d00953d783d0c78d829512de9ab0b4"
assert rough["encoding"]=="non-color RGB8" and rough["rowOrder"]=="bottom-up"
assert 0<=rough["maxQuantizationDelta"]<=.5/255+1e-6
assert not m["distributionAuthorized"]
assert f["images"]==a["imageSha256"]
assert f["priorMean"]==old["cases"]["micro-full-texture"]["mean"]
assert f["newMean"]==a["material-hybrid-camera"]["mean"]
assert math.isclose(f["relativeGain"],(f["priorMean"]-f["newMean"])/f["priorMean"],abs_tol=1e-12)
assert f["decision"]==("CANDIDATE_FOR_VISUAL_REVIEW" if f["newMean"]<=f["priorMean"]*.90 else "REVIEW_REQUIRED_NO_10_PERCENT_GAIN")
assert not any(f[k] for k in ("artisticApproval","webglQualified","publishable"))
print("ASC finish package verified; decision:",f["decision"])
