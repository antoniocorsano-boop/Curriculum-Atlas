#!/usr/bin/env python3
"""ATLAS ART-DIR-02 R6AB — non-destructive composition of actual R6A and R6B
qualified .blend artifacts. No source-script edits, no geometric re-authoring.
R6A's vault/sky is the base; the distinct R6B PBR material overrides and four
non-emissive floor joints are imported from the separately qualified R6B file.
"""
import bpy,hashlib,json,sys
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def opt(k):
    if k not in args:raise RuntimeError("Missing "+k)
    return Path(args[args.index(k)+1]).resolve()
OUT=opt("--out");OUT.mkdir(parents=True,exist_ok=True)
BFILE=opt("--bblend")
ARECEIPT=opt("--areceipt")
BRECEIPT=opt("--breceipt")
ASOURCE=Path(bpy.data.filepath)
if ASOURCE.name!="atlas-r6a-sky-vault.blend":
    raise RuntimeError("Must start from a real qualified R6A Blender file")
if BFILE.name!="atlas-r6b-gallery-materials.blend":
    raise RuntimeError("Second source must be a real qualified R6B Blender file")
def sha(f):
    h=hashlib.sha256()
    with open(f,"rb") as stream:
        for part in iter(lambda:stream.read(1024*1024),b""):h.update(part)
    return h.hexdigest()
a=json.loads(ARECEIPT.read_text())
b=json.loads(BRECEIPT.read_text())
if a["blend_sha256"]!=sha(ASOURCE) or b["blend_sha256"]!=sha(BFILE):
    raise RuntimeError("R6A/R6B genuine artifact integrity failure")
if a["base_r5_sha256"]!=b["source_r5_sha256"]:
    raise RuntimeError("The two variants do not share the same R5 master")
if not a["no_publication"] or not b["no_publication"]:
    raise RuntimeError("Source release scope mismatch")

# Dedicated import of ONLY B-specific data (five PBR materials and four curves).
# No architectural mesh from B replaces any mesh from A; both source files remain.
material_names=[
    "ATLAS R6B • transparent smoked gallery glass",
    "ATLAS R6B • nearly black balcony frame",
    "ATLAS R6B • deep-blue shaded stone columns",
    "ATLAS R6B • blue-black continuous gallery fascia",
    "ATLAS R6B • satin bronze natural stone joint",
    "ATLAS R6B • cool reflected joint",
]
curve_names=b["changed_objects"]["floor_seams"]
if len(curve_names)!=4:raise RuntimeError("No R6B floor-seam proof")
with bpy.data.libraries.load(str(BFILE),link=False) as (src,dst):
    if not set(material_names).issubset(set(src.materials)):
        raise RuntimeError("The separately authored R6B materials were not persisted")
    if not set(curve_names).issubset(set(src.objects)):
        raise RuntimeError("The separately authored R6B floor curves were not persisted")
    dst.materials=list(material_names)
    dst.objects=list(curve_names)

scene=bpy.context.scene
assignments={
    "glass_railings":material_names[0],
    "dark_columns":material_names[2],
    "dark_balcony_frames":material_names[1],
    "gallery_facings":material_names[3],
}
numbers={}
for category,material_name in assignments.items():
    mat=bpy.data.materials.get(material_name)
    if not mat:raise RuntimeError("Imported material is not retrievable "+material_name)
    names=b["changed_objects"][category]
    numbers[category]=len(names)
    if not names:raise RuntimeError("Empty B material assignment group "+category)
    for name in names:
        o=bpy.data.objects.get(name)
        if not o or o.type!="MESH":
            raise RuntimeError("Cannot compose R6B onto source A: "+name)
        o.data=o.data.copy()
        o.data.materials.clear();o.data.materials.append(mat)
for name in curve_names:
    o=bpy.data.objects.get(name)
    if not o or o.type!="CURVE":raise RuntimeError("R6B floor joint unavailable "+name)
    if not o.users_collection:scene.collection.objects.link(o)

# Confirm same baseline portal identity; no one touched the root transforms.
names=("Curricolo","Esplora","Percorsi","Esperienze")
for name in names:
    ob=bpy.data.objects.get("Portale • "+name)
    if not ob:raise RuntimeError("Missing portal "+name)
    v=a["portal_transforms_unchanged"][name]
    w=b["portals_untouched"][name]
    for key,alias in (("location","loc"),("rotation","rot"),("scale","scale")):
        here=list(getattr(ob,{"location":"location","rotation":"rotation_euler","scale":"scale"}[key]))
        if any(abs(t-u)>1e-5 for t,u in zip(here,v[key])):
            raise RuntimeError("A's portal root was altered on composition "+name)
        if any(abs(t-u)>1e-5 for t,u in zip(here,w[alias])):
            raise RuntimeError("B source does not match the expected portal root "+name)
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise RuntimeError("No unchanged R5 HERO")
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
if not sky or not sky.active_material or not sky.active_material.name.startswith("ATLAS R6A"):
    raise RuntimeError("Sky contribution A was lost when adding B")
if not all(bpy.data.objects.get(name) for name in curve_names):
    raise RuntimeError("Floor contribution B was lost when adding A")
scene.camera=hero
bpy.context.view_layer.update()
bpy.ops.file.pack_all()
blend=OUT/"atlas-art-dir02-r6ab-integrated.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
report={
 "schema":"atlas.art-dir02.r6ab-assembly/v1",
 "status":"REAL_COMBINED_BLENDER_CANDIDATE__HUMAN_ART_REVIEW_REQUIRED",
 "a_source_sha256":sha(ASOURCE),"b_source_sha256":sha(BFILE),
 "shared_r5_source_sha256":a["base_r5_sha256"],
 "integrated_blend_sha256":sha(blend),
 "material_assignments":numbers,"floor_seam_names":curve_names,
 "sky_from":"R6A","gallery_from":"R6B",
 "sky_radius_after_bu":a["sky_radius_after_bu"],
 "human_art_approved":False,"no_publication":True,"no_merge":True,
 "renders":{}
}
# Never claim visual acceptance from numeric checks alone.
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,samples in (
    ("hero",hero,1152,648,30),
    ("oblique",bpy.data.objects.get("CAM_ART_PROOF_OBLIQUE_3D"),832,468,20)):
    if cam is None:raise RuntimeError("Original R5 detail camera unavailable")
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    target=OUT/("atlas-r6ab-"+label+".png")
    scene.render.filepath=str(target)
    bpy.ops.render.render(write_still=True)
    if not target.is_file() or target.stat().st_size<10000:
        raise RuntimeError("No true Cycles render for "+label)
    report["renders"][label]={"file":target.name,"sha256":sha(target),
                               "bytes":target.stat().st_size,"size_px":[w,h]}
(OUT/"atlas-r6ab-receipt.json").write_text(json.dumps(report,ensure_ascii=False,indent=2))
print("ATLAS_R6AB_ASSEMBLY_PASS",json.dumps({
    "materials":numbers,"sky_source":"R6A","floor_seams":len(curve_names),
    "art_approval":False}))
