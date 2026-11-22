#!/usr/bin/env python3
"""P1E-OCULUS-SECTION-03: authenticated read-only radial section profile.
Inspect sky, dark collar, architectural rim, integrated J3/J4 crown and
native image/radial ribs. Read data only: no scene modifications or saved blends.
"""
import bpy,json,sys,math,hashlib,statistics,collections
from mathutils import Vector
from pathlib import Path
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def required(s):
 if s not in args or args.index(s)+1>=len(args):raise ValueError(s)
 return args[args.index(s)+1]
ARCH=required("--arch");MODE=required("--variant")
SOURCE=Path(bpy.data.filepath);R=Path(required("--receipt"));OUT=Path(required("--out"));OUT.mkdir(parents=True,exist_ok=True)
source_receipt=json.loads(R.read_text())
assert source_receipt["schema"]=="atlas.artdir02.p1d-oculus-manifold/v1" and source_receipt["arch"]==ARCH
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
original=source_receipt["variants"][MODE]["editable_blend"]["sha256"]
assert SOURCE.name==f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend" and sha(SOURCE)==original
def get(n):
 o=bpy.data.objects.get(n)
 if not o:raise ValueError(n)
 return o
sky=get(f"ARCH {ARCH} raised sky opening")
rim=get(f"ARCH {ARCH} raised oculus rim")
collar=get("ATLAS R7 • one dark skylight collar")
roof=get(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
if not all(o.type=="MESH" for o in (sky,collar,roof)) or rim.type!="CURVE":raise ValueError("Unexpected types")
# Both the rim and sky share a well-defined center; use sky footprint as canonical.
skyverts=[sky.matrix_world@v.co for v in sky.data.vertices]
cx=statistics.mean(p.x for p in skyverts);cy=statistics.mean(p.y for p in skyverts)
def obs(o):
 if o.type=="MESH":
  verts=[o.matrix_world@v.co for v in o.data.vertices]
 else:
  verts=[]
  for sp in o.data.splines:
   if sp.type=="BEZIER":
    verts.extend(o.matrix_world@p.co for p in sp.bezier_points)
   else:verts.extend(o.matrix_world@Vector(p.co[:3]) for p in sp.points)
 records=[{"r":math.hypot(p.x-cx,p.y-cy),"z":p.z,"theta":math.atan2(p.y-cy,p.x-cx)} for p in verts]
 bins=collections.defaultdict(list)
 for p in records: bins[round(p["r"],2)].append(p["z"])
 hist=sorted(({"r":r,"count":len(v),"zmin":min(v),"zmax":max(v)} for r,v in bins.items()),key=lambda v:-v["count"])
 zs=[v["z"] for v in records];rad=[v["r"] for v in records]
 return {"name":o.name,"type":o.type,"render_visible":not o.hide_render,
         "vertices":len(verts),"faces":len(o.data.polygons) if o.type=="MESH" else None,
         "radius_min":min(rad),"radius_max":max(rad),"zmin":min(zs),"zmax":max(zs),
         "radial_clusters":hist[:22],
         "materials":[m.name for m in o.data.materials if m],
         "native_uv_names":[u.name for u in o.data.uv_layers] if o.type=="MESH" else [],
         "radius_z_sample":[(round(x["r"],5),round(x["z"],5)) for x in records[:30]]}
section={o.name:obs(o) for o in (sky,rim,collar,roof)}
# Record active architectural rays while avoiding texture intervention.
report={
 "schema":"atlas.artdir02.p1e-oculus-section-profile/v1",
 "arch":ARCH,"structural_variant":MODE,"source_sha256":original,
 "canonical_art_sha256":source_receipt["canonical_art_sha256"],
 "center_xy":[cx,cy],"objects":section,
 "collar_to_rim_z_mean_gap":statistics.mean([section[rim.name]["zmin"],section[rim.name]["zmax"]])
    -statistics.mean([section[collar.name]["zmin"],section[collar.name]["zmax"]]),
 "source_saved":False,"no_merge":True,"no_deploy":True}
filename=OUT/f"atlas-p1e-oculus-section-03-profile-{ARCH}-{MODE}.json"
filename.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
print("SECTION03_PROFILE",ARCH,MODE,"CENTER",cx,cy,
 "GAP",round(report["collar_to_rim_z_mean_gap"],5),flush=True)
for o in section.values():
 print("SECTION03_OBJECT",o["name"],"r",round(o["radius_min"],4),round(o["radius_max"],4),
       "z",round(o["zmin"],4),round(o["zmax"],4),
       "radial clusters",[(q["r"],q["count"]) for q in o["radial_clusters"][:8]],flush=True)
assert sha(SOURCE)==original
print("SECTION03_DIAGNOSTIC_PASS",ARCH,MODE,flush=True)
