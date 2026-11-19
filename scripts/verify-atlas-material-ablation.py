"""Validate P2C3A evidence against an explicit revision, including historical replay.
No Blender dependency; no rendering or modification of evidence.
"""
import json,os,pathlib,hashlib,sys,math
p=pathlib.Path(sys.argv[1]).resolve()
expected_revision=sys.argv[2]
r=json.loads((p/"diffuse-bake.json").read_text())
assert r["status"]=="PASS_DIFFUSE_BAKE_PROBE" and r["revision"]==expected_revision
assert r["masterUnchanged"] and r["bindingsRestored"]
assert r["target"]["firstHits"]>0 and r["target"]["sampledRays"]==6144
assert r["uv"]["sampledOverlapTexels"]==0 and r["uv"]["sampledOccupiedTexels"]>100
assert r["bake"]["rgbMax"]>0 and r["bake"]["rgbStd"]>0
assert r["transferPreflight"]["passed"] and r["transferPreflight"]["explicit"]["outsideTolerance"]==0
assert r["transferPreflight"]["explicit"]["channels"]=={"R":2,"G":2,"B":2}
assert r["transfer"]["outsideTolerance"]==0 and r["transfer"]["channels"]=={"R":2,"G":2,"B":2}
assert "legacyTransfer" in r
assert hashlib.sha256((p/"canary-linear.exr").read_bytes()).hexdigest()==r["transferPreflight"]["explicit"]["sha256"]
assert hashlib.sha256((p/"diffuse-linear.exr").read_bytes()).hexdigest()==r["bake"]["sha256"]
assert set(r["renders"])=={"native-baseline","native-baked-preview","native-restored","material-control","material-diffuse-camera","material-hybrid-camera"}
for name,m in r["renders"].items():
    assert hashlib.sha256((p/(name+".png")).read_bytes()).hexdigest()==m["sha256"]
assert r["comparisons"]["restored"]["meanAbsoluteRGBDelta"]<.0002
assert not any(r[k] for k in ("masterModified","runtimeModified","artisticApproval","webglQualified","studentAuthorized","publishable","lightmapTransferQualified"))
a=json.loads((p/"material-ablation.json").read_text())
assert a["revision"]==r["revision"] and a["status"]=="PASS_MATERIAL_ABLATION"
assert a["masterSha256"]==r["masterSha256"] and a["target"]==r["target"]
assert a["geometryTriangles"]==r["uv"]["triangles"]==108
assert a["oracleSha256"]=="8bfb116e9e580c9c66a5601f79acf799f66ffa17b986e157486d102331e56973"
assert a["control"]["frameMean"]<=.0002 and a["control"]["mean"]<=.001
# Explicit receipt field -> image filename contract. The producer uses
# "control" for its statistics but "material-control" for the PNG.
image_to_stats={
    "material-control":"control",
    "material-diffuse-camera":"material-diffuse-camera",
    "material-hybrid-camera":"material-hybrid-camera",
}
assert set(a["imageSha256"])==set(image_to_stats)
for image,field in image_to_stats.items():
    assert a["imageSha256"][image]==r["renders"][image]["sha256"]
    stats=a[field]
    assert stats["samples"]==1068
    for metric in ("mean","p95","max","frameMean"):
        assert math.isfinite(stats[metric]) and 0<=stats[metric]<=1
    assert stats["mean"]<=stats["max"] and stats["p95"]<=stats["max"]
d,h=a["material-diffuse-camera"]["mean"],a["material-hybrid-camera"]["mean"]
assert math.isclose(a["improvementFraction"],(d-h)/d if d>1e-12 else 0,rel_tol=1e-12,abs_tol=1e-12)
assert a["decision"]==("CANDIDATE_FOR_VISUAL_REVIEW" if d>1e-12 and h<d*.95 else "NO_DEMONSTRATED_IMPROVEMENT")
assert not any(a[k] for k in ("artisticApproval","webglQualified","publishable"))
print("P2C3A diagnostic verified; material decision:",a["decision"])
