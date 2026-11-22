"""ATLAS ART-DIR-02 / P1E-VOLUME-02. Non-destructive real .blend scene inventory.
The outcome is a contract for subsequent parametric reconstruction, not an artistic approval.
"""
import bpy,json,hashlib,sys,math
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(k):
 if k not in args or args.index(k)+1>=len(args):raise ValueError("Missing "+k)
 return args[args.index(k)+1]
ARCH=arg("--arch").upper()
MODE=arg("--variant").upper()
OUT=Path(arg("--out"));OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
RECEIPT=Path(arg("--receipt"))
root=json.loads(RECEIPT.read_text())
if root["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or root["arch"]!=ARCH:raise RuntimeError("Wrong receipt")
expected=root["variants"][MODE]["editable_blend"]["sha256"]
def digest(p):
 h=hashlib.sha256()
 with open(p,"rb") as f:
  for b in iter(lambda:f.read(1048576),b""):h.update(b)
 return h.hexdigest()
if SRC.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend" or digest(SRC)!=expected:raise RuntimeError("Qualified source binary mismatch")
def bounds(o):
 pts=[o.matrix_world@Vector(c) for c in o.bound_box]
 return {"min":[min(p[i] for p in pts) for i in range(3)],
         "max":[max(p[i] for p in pts) for i in range(3)],
         "center":[sum(p[i] for p in pts)/len(pts) for i in range(3)]}
records=[]
for o in bpy.context.scene.objects:
 if o.type not in ("MESH","CURVE","CAMERA","LIGHT"):continue
 rec={"name":o.name,"type":o.type,"visible_render":not o.hide_render,
      "bounds":bounds(o),"dims_world":[round(float(v),5) for v in o.dimensions],
      "mesh_vertices":len(o.data.vertices) if o.type=="MESH" else 0,
      "mesh_faces":len(o.data.polygons) if o.type=="MESH" else 0,
      "linked_collection_names":[c.name for c in o.users_collection],
      "material_names":[m.name for m in o.data.materials if m] if o.type in ("MESH","CURVE") else []}
 records.append(rec)
names=[r["name"] for r in records]
need=["CAM_HERO_ARCH04",f"ARCH {ARCH} raised sky opening",f"ARCH {ARCH} raised oculus rim",
      f"ATLAS {ARCH} {MODE} integrated structural crown and vault",
      f"ARCH {ARCH} upper parapet","ARCH04 • upper gallery deck",
      "ARCH04 • first gallery deck","P1D • B lower railing"]
for n in need:
 if n not in names:raise RuntimeError("Missing architecture "+n)
def choose(name):
 r=next(x for x in records if x["name"]==name)
 return {k:r[k] for k in ("name","visible_render","bounds","dims_world","mesh_vertices","mesh_faces")}
upper_objects=[r for r in records if any(w in r["name"].lower() for w in
 ("gallery","galler","oculus","crown","vault","parapet","rib","dome","ceiling","sky opening","soffit","arch","collar"))]
out={
"schema":"atlas.artdir02.p1e-volume-inventory/v1",
"arch":ARCH,"structural_variant":MODE,
"source_sha256":expected,"canonical_art_sha256":root["canonical_art_sha256"],
"total_object_count":len(records),"upper_structure_candidates":upper_objects,
"landmarks":{n:choose(n) for n in need},
"all_objects":records,
"original_scene_modified":False,"original_source_saved":False,"no_merge":True,"no_deploy":True,"art_approved":False}
target=OUT/f"atlas-p1e-volume-02-inventory-{ARCH}-{MODE}.json"
target.write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding="utf8")
print("VOLUME02_INVENTORY",ARCH,MODE,"total",len(records),"upper candidates",len(upper_objects))
for rec in upper_objects:
 print("VOLUME02_OBJECT",ARCH,MODE,rec["name"],rec["type"],
       "visible",rec["visible_render"],
       "Z",*[round(x,3) for x in (rec["bounds"]["min"][2],rec["bounds"]["max"][2])],
       "verts",rec["mesh_vertices"])
assert digest(SRC)==expected
print("VOLUME02_INVENTORY_COMPLETE",ARCH,MODE,target.name)
