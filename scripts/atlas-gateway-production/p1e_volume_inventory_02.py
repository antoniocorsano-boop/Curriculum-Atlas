#!/usr/bin/env python3
"""Read-only architectural inventory for P1E-VOLUME-02.
Never modifies/saves the source. Qualified by SHA against P1D-OCULUS-03.
"""
import bpy,sys,json,hashlib,math
from pathlib import Path
from mathutils import Vector

argv=sys.argv[sys.argv.index("--")+1:]
def arg(key):
    return argv[argv.index(key)+1]
arch=arg("--arch")
mode=arg("--variant")
out=Path(arg("--out"));out.mkdir(parents=True,exist_ok=True)
receipt=json.loads(Path(arg("--receipt")).read_text())
source=Path(bpy.data.filepath)
def digest(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
assert source.name==f"atlas-p1d-oculus-03-{arch}-{mode}.blend"
assert receipt["schema"]=="atlas.artdir02.p1d-oculus-manifold/v1"
assert receipt["variants"][mode]["editable_blend"]["sha256"]==digest(source)
scene=bpy.context.scene
original_camera=scene.camera.name if scene.camera else None
cam=bpy.data.objects["CAM_HERO_ARCH04"]
items=[]
for ob in sorted(bpy.data.objects,key=lambda x:x.name):
    points=[ob.matrix_world@Vector(c) for c in ob.bound_box] if ob.type in {"MESH","CURVE","FONT"} else []
    materialnames=[m.name for m in ob.data.materials if m] if hasattr(ob.data,"materials") else []
    item={
        "name":ob.name,"type":ob.type,
        "hide_render":bool(ob.hide_render),
        "parent":ob.parent.name if ob.parent else None,
        "collections":[c.name for c in ob.users_collection],
        "location":list(ob.location),"dimensions":list(ob.dimensions),
        "matrix_world":[list(row) for row in ob.matrix_world],
        "world_box":(
            {"min":[min(p[i] for p in points) for i in range(3)],
             "max":[max(p[i] for p in points) for i in range(3)]}
             if points else None
        ),
        "vertex_count":len(ob.data.vertices) if ob.type=="MESH" else None,
        "curve_splines":len(ob.data.splines) if ob.type=="CURVE" else None,
        "material_names":materialnames[:6],
    }
    items.append(item)
assert digest(source)==receipt["variants"][mode]["editable_blend"]["sha256"]
report={
 "schema":"atlas.artdir02.p1e-volume-inventory/v1",
 "arch":arch,"structural_variant":mode,"source_sha256":digest(source),
 "source_camera":original_camera,
 "hero_camera_matrix":[list(r) for r in cam.matrix_world],
 "hero_camera_lens":cam.data.lens,
 "scene_object_count":len(items),
 "objects":items,
 "source_binary_unchanged":True,
 "saved":False,
 "no_merge":True,"no_deploy":True,
}
(out/f"atlas-p1e-volume-02-{arch}-{mode}-inventory.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print("VOLUME02_INVENTORY_COMPLETE",arch,mode,len(items))
