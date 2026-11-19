"""ASC-P1: observe exact master and existing candidate evidence; never save a blend."""
import bpy, hashlib, json, os, sys
from pathlib import Path
from collections import Counter
master, art, perf, out = map(lambda x: Path(x).resolve(), sys.argv[sys.argv.index("--")+1:])
MASTER = "f216e3158c055de0990cd5f36ce388fe4731847fce12f2c42619b03806b9c3ab"
ART = "aa7ee147ea65250543cafc16b060d788d4ea9a6e"
def require(ok, msg):
    if not ok: raise RuntimeError(msg)
def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for block in iter(lambda:f.read(1024*1024), b""): h.update(block)
    return h.hexdigest()
require(Path(bpy.data.filepath).resolve()==master and sha(master)==MASTER,"master identity")
a=json.loads(art.read_text())
g=json.loads(perf.read_text())
require(a["status"]=="PASS_IN_SITU_CANDIDATE" and a["revision"]==ART and a["masterSha256"]==MASTER,"05E identity")
require(a["sourceUnchanged"] and a["protectedStateUnchanged"] and a["sharedMeshesRestored"],"05E preservation")
require(len(a["bookInventory"])==77 and len(a["placements"])==8 and a["bays"]==["04-0"],"05E scope")
require(not any(a[k] for k in ("masterModified","artisticApproval","webglQualified","publishable","studentAuthorized")),"05E authority")
require(g["schema"]=="atlas.perf.geometry/v1" and g["status"]=="PASS_EXACT_VISUAL_REDUCTION","PERF evidence")
require(len(g["views"])==5 and all(v["visual"]["changedPixels"]==0 and v["restore"]["changedPixels"]==0 for v in g["views"]),"PERF visual parity")
atr=next(v for v in g["views"] if v["id"]=="atrium")
require(atr["candidate"]["counts"]["triangles"]==594842,"PERF baseline drift")
groups=atr["inventory"]
require(sum(x["trianglesAttributed"] for x in groups)==594842,"PERF attribution")
require(next(x for x in groups if x["id"]=="bay-instances")["trianglesAttributed"]==355212,"PERF bay contribution")
scene=bpy.context.scene
require(not bpy.data.libraries and scene.camera.name=="atrium","scene identity")
meshes=[o for o in scene.objects if o.type=="MESH"]
def mesh_stats(m):
    m.calc_loop_triangles()
    return {"mesh":m.name,"vertices":len(m.vertices),"polygons":len(m.polygons),"triangles":len(m.loop_triangles),
            "uvLayers":[x.name for x in m.uv_layers],"materials":[x.name if x else None for x in m.materials]}
stats={o.data.name:mesh_stats(o.data) for o in meshes}
def object_stats(o):
    return {"object":o.name,"mesh":o.data.name,"triangles":stats[o.data.name]["triangles"],
            "modifiers":[m.type for m in o.modifiers],"hideRender":o.hide_render,
            "collections":sorted(c.name for c in o.users_collection)}
collection=bpy.data.collections.get("02 Campate condivise")
require(collection is not None,"bay collection")
bays=[o for o in collection.all_objects if o.type=="MESH"]
counts=Counter(o.data.name for o in bays)
require(len(bays)==495 and len(counts)==25,"bay inventory drift")
ranking=sorted([dict(stats[n],instances=count,theoreticalInstancedTriangles=stats[n]["triangles"]*count) for n,count in counts.items()],key=lambda r:(-r["theoreticalInstancedTriangles"],r["mesh"]))
pilot=sorted([object_stats(o) for o in bays if o.name.startswith("Library bay 04-0-")],key=lambda r:r["object"])
required={"Library bay 04-0-Bay Book "+str(i) for i in range(6)}|{"Library bay 04-0-Bay Paper"}
require(required.issubset({o["object"] for o in pilot}),"pilot book objects")
lights=sorted(o.name for o in scene.objects if o.type=="LIGHT")
cameras=sorted(o.name for o in scene.objects if o.type=="CAMERA")
require(len(lights)==47 and len(cameras)==7,"camera/light inventory")
out.mkdir(parents=True,exist_ok=True)
report={"schema":"atlas.asc01.baseline/v1","status":"PASS_OBSERVATION_ONLY","revision":os.environ["ATLAS_EXACT_HEAD"],
        "masterSha256":MASTER,"masterBytesVerified":True,"masterUnchanged":sha(master)==MASTER,
        "artEvidence":{"revision":ART,"status":a["status"],"receiptSha256":sha(art),"books":77,"placements":8,"artisticApproval":False},
        "webglEvidence":{"receiptSha256":sha(perf),"status":g["status"],"views":[{"id":v["id"],"reference":v["reference"]["counts"],"candidate":v["candidate"]["counts"]} for v in g["views"]],
                         "groups":groups,"hardwareQualified":False},
        "sourceObjects":sorted([object_stats(o) for o in meshes],key=lambda r:r["object"]),
        "uniqueMeshStats":sorted(stats.values(),key=lambda r:r["mesh"]),
        "bayMeshRanking":ranking,"pilotObjects":pilot,"lights":lights,"cameras":cameras,
        "masterWrite":False,"runtimeWrite":False,"studentAuthorized":False,"publishable":False,"artisticApproval":False}
require(report["masterUnchanged"],"master changed")
(out/"asc-p1-baseline.json").write_text(json.dumps(report,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
print("ASC-P1 verified source observation; top five bay meshes:",json.dumps(ranking[:5],ensure_ascii=False))
