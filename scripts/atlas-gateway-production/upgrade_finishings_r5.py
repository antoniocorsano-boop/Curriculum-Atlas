#!/usr/bin/env python3
"""ATLAS ART-DIR-02 / FINISHINGS-FIRST R5
Upgrade gallery materials and real prefabricated plants IN A COPY of the
qualified R4 Blender scene. Do not move any portal or rebuild the rotunda.
Generate a quantitative side-section audit, not a claim of sectional approval.
"""
import bpy, math, json, sys, hashlib
from pathlib import Path
from mathutils import Vector

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def option(n):
    if n not in args or args.index(n)+1>=len(args):raise ValueError("Expected "+n)
    return args[args.index(n)+1]
OUT=Path(option("--out")).resolve();OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
if SOURCE.name!="atlas-art-dir02-finishings-r4-candidate.blend":
    raise RuntimeError("R5 must derive from the archived R4 .blend, never an empty master")
def digest(f):
    h=hashlib.sha256()
    with open(f,"rb") as stream:
        for block in iter(lambda:stream.read(1024*1024),b""):h.update(block)
    return h.hexdigest()
scene=bpy.context.scene
stone=bpy.data.materials.get("ATLAS R4 • Onyx013 blue polished stone CC0")
bronze=bpy.data.materials.get("ATLAS R4 • Metal010 satin gold CC0")
if not stone or not bronze:raise RuntimeError("Qualified R4 CC0 materials not in Blender")
def variant(source,name,tint,mix,rough_from,rough_to,metallic):
    m=source.copy();m.name=name
    mixnodes=[n for n in m.node_tree.nodes if n.bl_idname=="ShaderNodeMixRGB"]
    if not mixnodes:raise RuntimeError("CC0 PBR texture tint mixer absent")
    mixnode=mixnodes[0];mixnode.inputs[0].default_value=mix
    mixnode.inputs[1].default_value=(*tint,1.0)
    rangenodes=[n for n in m.node_tree.nodes if n.bl_idname=="ShaderNodeMapRange"]
    if not rangenodes:raise RuntimeError("CC0 PBR texture roughness absent")
    rangenodes[0].inputs["To Min"].default_value=rough_from
    rangenodes[0].inputs["To Max"].default_value=rough_to
    principled=m.node_tree.nodes.get("Principled BSDF")
    if not principled:raise RuntimeError("Material missing Principled BSDF")
    principled.inputs["Metallic"].default_value=metallic
    return m
wall=variant(stone,"ATLAS R5 • midnight gallery stone wall CC0",
             (.055,.082,.124),.11,.31,.55,.06)
deck=variant(stone,"ATLAS R5 • subdued mezzanine finish CC0",
             (.075,.093,.119),.10,.26,.45,.07)
railing=variant(bronze,"ATLAS R5 • thin satin bronze trim CC0",
             (.37,.26,.12),.10,.27,.48,.78)

def assign(ob,mat):
    if ob.type!="MESH":return
    ob.data=ob.data.copy()
    ob.data.materials.clear()
    ob.data.materials.append(mat)
groups={"gallery_bays":[],"decks":[],"rails":[]}
for ob in list(scene.objects):
    name=ob.name
    if name.startswith((
        "ARCH04 • recessed gallery bay",
        "ARCH04 • distant gallery interior",
        "Atrio • pannello incassato"
    )):
        assign(ob,wall);groups["gallery_bays"].append(name)
    elif name.startswith((
        "ARCH04 • first gallery deck",
        "ARCH04 • upper gallery deck"
    )):
        assign(ob,deck);groups["decks"].append(name)
    elif name.startswith((
        "ARCH04 • first gallery handrail",
        "ARCH04 • second gallery handrail",
        "ARCH04B • glass railing mechanical channel",
        "ARCH04 • gallery recessed soffit edge",
        "Atrio • profilo balconata",
        "ARCH04 • warm reveal within gallery"
    )):
        assign(ob,railing);groups["rails"].append(name)
if min(len(groups["gallery_bays"]),len(groups["decks"]),len(groups["rails"]))==0:
    raise RuntimeError("No actual R4 gallery object found for one material group")

# Real prefabricated vegetation: extend the previously downloaded and imported
# Poly Haven model using collection instances; do not introduce new meshes.
plants=sorted((o for o in scene.objects if o.name.startswith(
     "ATLAS R4 • prefabricated CC0 plant")),key=lambda o:o.location.x)
if len(plants)!=2:raise RuntimeError("The two real R4 CC0 plants are absent")
source_coll=plants[0].instance_collection
if not source_coll or plants[1].instance_collection!=source_coll:
    raise RuntimeError("Plants do not share one traceable authored model")
mesh_sources=[ob for ob in source_coll.all_objects if ob.type=="MESH"]
if not mesh_sources:raise RuntimeError("Real CC0 tree source missing")
bounds=[]
for ob in mesh_sources:
    for corner in ob.bound_box:
        bounds.append(ob.matrix_world @ Vector(corner))
zmin=min(v.z for v in bounds)
zmax=max(v.z for v in bounds)
natural_height=zmax-zmin
if not .001<natural_height<30:raise RuntimeError("Suspicious plant model height")
for p in plants:
    # Elevate visible foliage above existing metal planter rim, no new pedestal.
    height=2.55
    scale=height/natural_height
    p.scale=(scale,scale,scale)
    p.location.z=.90-zmin*scale
# Two restrained extra instances on the upper deck, repeating the existing
# public-domain asset. Their source data are shared with the floor plant pair.
extra=[]
for sign in (-1,1):
    obj=bpy.data.objects.new(
        "ATLAS R5 • upper gallery reused CC0 plant "+("L" if sign<0 else "R"),
        None)
    scene.collection.objects.link(obj)
    obj.instance_type="COLLECTION";obj.instance_collection=source_coll
    h=1.35;sc=h/natural_height
    x=sign*7.8
    y=1.3+math.sqrt(10.85**2-x*x)
    obj.location=(x,y,5.40-zmin*sc)
    obj.scale=(sc,sc,sc)
    obj.rotation_euler.z=.20*sign
    extra.append(obj.name)

# Architectural portals, camera, and actual glass sources stay untouched.
portals={}
for name in ("Curricolo","Esplora","Percorsi","Esperienze"):
    root=bpy.data.objects.get("Portale • "+name)
    if not root:raise RuntimeError("Missing unique portal root "+name)
    portals[name]={"location":list(root.location),
                   "rotation":list(root.rotation_euler),
                   "scale":list(root.scale)}
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise RuntimeError("R4 camera missing")

# Section audit across local YZ at the Esplora pane: no invented dimensions.
name="Esplora"
root=bpy.data.objects["Portale • "+name]
pane=bpy.data.objects.get(name+" • vetro cobalto")
inlay=bpy.data.objects.get("PROOF R2 • dark recessed slot "+name)
lips=[ob for ob in scene.objects if ob.name.startswith(
    "PROOF R2 • fine slot lip "+name)]
if not pane or not inlay or len(lips)!=2:raise RuntimeError("Physical section components missing")
bpy.context.view_layer.update()
inv=root.matrix_world.inverted()
pcoords=[inv @ (pane.matrix_world@v.co) for v in pane.data.vertices]
thick_min=min(v.y for v in pcoords)
thick_max=max(v.y for v in pcoords)
lowest=min((pane.matrix_world@v.co).z for v in pane.data.vertices)
center=(inv @ inlay.matrix_world.translation).y
half_slot=.18/2  # exact depth from R2 construction contract
gap=max(0.,center-half_slot-thick_max,thick_min-(center+half_slot))
has_xy_overlap=(thick_min<=center+half_slot and thick_max>=center-half_slot)
floor_top=-.04  # exact R4 inherited main floor top from master cylinder
section={
 "schema":"atlas.art-dir02.portal-floor-section-audit/v1",
 "portal":name,"section_plane":"Local portal YZ through root X=0",
 "coordinates":"Blender units, non-real-world construction dimensions",
 "current_pane_interval_y":[thick_min,thick_max],
 "current_slot_interval_y":[center-half_slot,center+half_slot],
 "current_pane_bottom_world_z":lowest,"floor_top_world_z":floor_top,
 "current_glass_slot_overlap":has_xy_overlap,
 "current_minimal_horizontal_gap_bu":gap,
 "current_recess_depth_bu":.18,
 "current_lip_y_local":[(inv @ ob.matrix_world.translation).y for ob in lips],
 "proposed_slot_center_y_local":(thick_min+thick_max)/2,
 "proposed_pane_bottom_world_z":-.10,
 "proposal_only":True,"r5_does_not_change_legacy_slot":True,
 "source_code":"scripts/atlas-gateway-production/art_proof_01b_portals_corrective.py",
 "correction_strategy":"shift ONLY floor slit, dark inlay and two lips to pane local Y, and extend glass lowest boundary 0.06 BU into dark channel; unchanged 4 portal roots and HERO"
}
if has_xy_overlap or gap<.09:raise RuntimeError(
 "Section disagreement with documented R2 geometry: "+str(section))
(OUT/"atlas-portal-section-r5-audit.json").write_text(
    json.dumps(section,ensure_ascii=False,indent=2))
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero
bpy.ops.file.pack_all()
candidate=OUT/"atlas-art-dir02-gallery-finishings-r5.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(candidate))
report={
 "schema":"atlas.art-dir02.finishings-r5/gallery-landscaping/v1",
 "status":"TECHNICAL_CANDIDATE__HUMAN_ART_APPROVAL_REQUIRED",
 "source_r4_sha256":digest(SOURCE),"candidate_blend_sha256":digest(candidate),
 "material_source_licenses":"ambientCG Onyx013/Metal010 CC0 (inherited from R4)",
 "external_model_license":"Poly Haven Potted Plant 04 CC0 (inherited from R4)",
 "gallery_objects_by_material":groups,"plant_model_source_meshes":len(mesh_sources),
 "plant_natural_height_bu":natural_height,
 "plant_floor_instances":[o.name for o in plants],
 "plant_upper_gallery_instances":extra,
 "portal_transforms_unchanged":portals,
 "portal_section":section,"human_art_approved":False,
 "no_publication":True,"no_merge":True,"renders":{}
}
def camera_target(camera,look):
    camera.rotation_euler=(Vector(look)-camera.location).to_track_quat("-Z","Y").to_euler()
view_data=bpy.data.cameras.new("ATLAS R5 gallery review")
gallery=bpy.data.objects.new("CAM_R5_GALLERY_DETAIL",view_data)
scene.collection.objects.link(gallery)
gallery.location=(5.7,-13.2,4.40)
camera_target(gallery,(7.0,6.8,4.1));view_data.lens=38
for label,cam,w,h,samples in (
    ("hero",hero,1152,648,26),
    ("gallery_detail",gallery,960,540,18)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    path=OUT/("atlas-finishings-r5-"+label+".png")
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    if not path.is_file() or path.stat().st_size<12000:
        raise RuntimeError("Cycles render missing: "+label)
    report["renders"][label]={"file":path.name,"sha256":digest(path),
                             "bytes":path.stat().st_size,"size_px":[w,h]}
(OUT/"atlas-finishings-r5-receipt.json").write_text(
    json.dumps(report,ensure_ascii=False,indent=2))
print("ATLAS_FINISHINGS_R5_COMPLETE",json.dumps(
 {"material_object_counts":{k:len(v) for k,v in groups.items()},
  "real_plant_instances":len(plants)+len(extra),
  "section_gap_bu":gap,"glass_physically_inset":has_xy_overlap}))
