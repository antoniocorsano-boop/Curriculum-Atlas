#!/usr/bin/env python3
"""ATLAS ART-DIR-02: compose genuine independent R6C/D Blender contributions
onto the REAL previously-qualified integrated R6AB .blend. Preserve authorship.
"""
import bpy,hashlib,json,sys,math
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def opt(x):
    if x not in args:raise RuntimeError("Missing "+x)
    return Path(args[args.index(x)+1]).resolve()
OUT=opt("--out");OUT.mkdir(parents=True,exist_ok=True)
C=opt("--cblend");D=opt("--dblend")
CR=json.loads(opt("--creceipt").read_text())
DR=json.loads(opt("--dreceipt").read_text())
BASE=Path(bpy.data.filepath)
if BASE.name!="atlas-art-dir02-r6ab-integrated.blend":
    raise RuntimeError("Must start with the REAL archived R6AB integrated master")
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):h.update(block)
    return h.hexdigest()
R5="e97dcf65e7cd6a97f031cef99d2d81398c5d42d6493807b4e29cf35e5236b278"
if sha(BASE)!="3d0bd18967c37d91025d1d2bd2abea3119aaf7da6f098a61d761566e88fd2cc4":
    raise RuntimeError("Integrated R6AB baseline SHA changed")
if sha(C)!=CR["candidate_blend_sha256"] or sha(D)!=DR["candidate_blend_sha256"]:
    raise RuntimeError("R6C/R6D qualified artifact mismatch")
if CR["source_r5_sha256"]!=R5 or DR["source_r5_sha256"]!=R5:
    raise RuntimeError("Specialist contributions have different original R5 lineages")
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise RuntimeError("R6AB original camera missing")
originalcamera=(list(hero.location),list(hero.rotation_euler),hero.data.lens)
names=("Curricolo","Esplora","Percorsi","Esperienze")
roots={n:bpy.data.objects.get("Portale • "+n) for n in names}
if not all(roots.values()):raise RuntimeError("Missing one of four original portals")
transforms={n:(list(o.location),list(o.rotation_euler),list(o.scale)) for n,o in roots.items()}
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
if not sky or not sky.active_material or not sky.active_material.name.startswith("ATLAS R6A"):
    raise RuntimeError("R6A sky contribution absent on R6AB base")

def link_objects(imported):
    n=0
    for o in imported:
        if not o:continue
        if not o.users_collection:
            scene.collection.objects.link(o)
            n+=1
    return n
# C: append professional author-owned asset collections and only objects C created.
# Keep CC0 source meshes *inside* their collections; they do not appear separately.
with bpy.data.libraries.load(str(C),link=False) as (src,dst):
    sources=[name for name in src.collections if name.startswith("ATLAS R6C • CC0 source ")]
    objects=[name for name in src.objects if name.startswith("ATLAS R6C • ")]
    materials=[name for name in src.materials if name.startswith("ATLAS R6C • ")]
    if len(sources)!=3 or len(objects)<12 or len(materials)<3:
        raise RuntimeError("C library lacks real prefab sources or furniture")
    dst.collections=sources
    dst.objects=objects
    dst.materials=materials
c_linked=link_objects(dst.objects)
if c_linked<12:raise RuntimeError("Real R6C furnishings not linked to integrated scene")
for name in CR["hidden_old_foliage_and_vases"]:
    o=bpy.data.objects.get(name)
    if not o:raise RuntimeError("Inherited R5 planter/plant missing: "+name)
    o.hide_render=True
banner_mat=bpy.data.materials.get("ATLAS R6C • deep indigo banner fabric")
if not banner_mat:raise RuntimeError("C banner fabric not imported")
for name in CR["existing_banners_finished"]:
    o=bpy.data.objects.get(name)
    if not o or o.type!="MESH":raise RuntimeError("C banner original missing "+name)
    o.data=o.data.copy()
    o.data.materials.clear();o.data.materials.append(banner_mat)

# D: append only created bases and their optical rim curves. Re-parent to REAL
# four source roots, not to any automatically imported parent copy.
with bpy.data.libraries.load(str(D),link=False) as (src,dst2):
    objects=[name for name in src.objects if name.startswith("ATLAS R6D • ")]
    materials=[name for name in src.materials if name.startswith("ATLAS R6D • ")]
    if len(objects)!=8 or len(materials)<4:
        raise RuntimeError("D library lacks four physical basements and their warm rims")
    dst2.objects=objects
    dst2.materials=materials
for obj in dst2.objects:
    if not obj:raise RuntimeError("Missing imported D object")
    match=next((n for n in names if obj.name.endswith(" "+n)),None)
    if not match:raise RuntimeError("Cannot identify D portale assembly: "+obj.name)
    local=obj.matrix_basis.copy()
    obj.parent=roots[match]
    obj.matrix_basis=local
d_linked=link_objects(dst2.objects)
if d_linked!=8:raise RuntimeError("Not exactly 4 R6D basements and 4 optical lines")
# Remove loose duplicate roots pulled by Blender library's parent dependencies,
# preserving the references taken from real R6AB scene.
duplicates=[]
for o in list(bpy.data.objects):
    if any(o.name.startswith("Portale • "+n+".") for n in names) and o not in roots.values():
        if o.users_collection:duplicates.append(o.name)
        bpy.data.objects.remove(o,do_unlink=True)
glass=bpy.data.materials.get("ATLAS R6D • deep cobalt genuine glass")
warm=bpy.data.materials.get("ATLAS R6D • warm optical lip")
brass=bpy.data.materials.get("ATLAS R6D • brushed champagne bronze plate")
night=bpy.data.materials.get("ATLAS R6D • obsidian cobalt ellipsoid")
if not all((glass,warm,brass,night)):raise RuntimeError("No real source D PBR materials")
def assign(o,m):
    if not o or o.type!="MESH":raise RuntimeError("Missing source D target")
    o.data=o.data.copy();o.data.materials.clear();o.data.materials.append(m)
for n in names:
    assign(bpy.data.objects.get(n+" • vetro cobalto"),glass)
    assign(bpy.data.objects.get(n+" • cornice continua"),warm)
for n in DR["obsolete_slot_lips_hidden"]:
    o=bpy.data.objects.get(n)
    if not o:raise RuntimeError("Missing old R2 lip "+n)
    o.hide_render=True
canopy=bpy.data.objects.get(DR["podium_modified"])
assign(canopy,night)
for n in DR["podium_rings"]:
    obj=bpy.data.objects.get(n)
    assign(obj,warm if "light seam" in n or "bordo" in n else brass)

# Physically independent integrations A,B,C,D all present in the exact same
# Blender scene; don't claim success just because all four receipts exist.
def descendants(group):
    return [o for o in scene.objects if o.name.startswith(group)]
if not len(descendants("ATLAS R6C • satin metal planter"))==4:
    raise RuntimeError("C planters missing from integrated scene")
if not len(descendants("ATLAS R6D • sole luminous metal base"))==4:
    raise RuntimeError("D luminous metal bases missing from integrated scene")
if not len(descendants("ATLAS R6B • physical floor seam"))==4:
    raise RuntimeError("B actual floor joints missing")
for n,o in roots.items():
    now=(list(o.location),list(o.rotation_euler),list(o.scale))
    if any(any(abs(a-b)>1e-6 for a,b in zip(x,y))
           for x,y in zip(now,transforms[n])):
        raise RuntimeError("Portal root moved on integration "+n)
if (list(hero.location),list(hero.rotation_euler),hero.data.lens)!=originalcamera:
    raise RuntimeError("Master HERO camera modified on composition")
scene.camera=hero
bpy.context.view_layer.update()
bpy.ops.file.pack_all()
blend=OUT/"atlas-art-dir02-r6abcd-integrated.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
report={
    "schema":"atlas.art-dir02.r6abcd-integration/v1",
    "state":"REAL_COMBINED_3D_MODEL__ARTISTIC_REVIEW_REQUIRED",
    "master_r6ab_sha256":sha(BASE),"source_c_sha256":sha(C),
    "source_d_sha256":sha(D),"source_r5_sha256":R5,
    "integrated_sha256":sha(blend),"cc0_assets":CR["official_cc0_assets"],
    "c_collections":sources,"c_objects_linked":c_linked,"d_objects_linked":d_linked,
    "d_portal_parent_duplicates_removed":duplicates,
    "c_plant_families":{k:len(v) for k,v in CR["instances_by_family"].items()},
    "basement_count":len(descendants("ATLAS R6D • sole luminous metal base")),
    "original_roots":{n:[list(o.location),list(o.rotation_euler),list(o.scale)] for n,o in roots.items()},
    "no_merge":True,"no_publication":True,"human_art_approved":False,
    "renders":{}
}
oblique=bpy.data.objects.get("CAM_ART_PROOF_OBLIQUE_3D")
if not oblique:raise RuntimeError("Actual R6AB oblique camera missing")
detail=bpy.data.objects.new("CAM_ATLAS_R6ABCD_DETAIL",bpy.data.cameras.new("CAM_ATLAS_R6ABCD_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(1.65,-10.7,2.45)
detail.rotation_euler=(Vector((0,1.1,2.05))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=30
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,n in (("hero",hero,1152,648,26),
                         ("oblique",oblique,832,468,18),
                         ("detail",detail,832,468,18)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=n
    p=OUT/("atlas-r6abcd-"+label+".png")
    scene.render.filepath=str(p);bpy.ops.render.render(write_still=True)
    if not p.is_file() or p.stat().st_size<10000:raise RuntimeError("Missing genuine render "+label)
    report["renders"][label]={"file":p.name,"bytes":p.stat().st_size,"sha256":sha(p)}
(OUT/"atlas-r6abcd-receipt.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
print("ATLAS_R6ABCD_COMPLETE",json.dumps({"CC0_collections":len(sources),
 "C_objects":c_linked,"D_objects":d_linked,"4_portals":len(roots),"renders":list(report["renders"])}))
