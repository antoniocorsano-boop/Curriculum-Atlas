#!/usr/bin/env python3
"""ART-DIR-02 / ART-PROOF-01B — portal-reading corrective revision (not new project).

Load the existing cinematic proof scene .blend. Do not replace lights, dome,
architecture, portal illustrations, brand or reference image. Make the four
glass panels tangent to a circle centered on the podium and physically inset
into four actual cuts in the finished floor. Generate HERO / oblique / TOP.
All values are relative Blender units and PARAMETRIC CANDIDATES, not measurements
of the original synthetic reference.
"""
from __future__ import annotations
import bpy, math, json, os, sys, hashlib
from mathutils import Vector

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args: raise ValueError("Expected --out DIRECTORY")
out=os.path.abspath(args[args.index("--out")+1])
os.makedirs(out,exist_ok=True)
source=bpy.data.filepath
if not source.endswith("atlas-art-proof-01b-cinematic.blend"):
    raise ValueError("Must build on the current artistic proof scene, not a blank scene")
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1024*1024),b""): h.update(chunk)
    return h.hexdigest()
source_sha=sha(source)
scene=bpy.context.scene
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
CX,CY=0.0,-2.0
# Controlled geometric example: retain the original X layout, test a shared
# podium-centered circle R. Future variations are gated by comparing rendering.
RADIUS=7.30
xs=[(-5.95,"Curricolo"),(-2.40,"Esplora"),
    (2.40,"Percorsi"),(5.95,"Esperienze")]
if RADIUS<=max(abs(x) for x,_ in xs):raise RuntimeError("R must exceed |outer X|")
floor=bpy.data.objects.get("Atrio • pavimento lapideo")
if not floor or floor.type!="MESH":raise RuntimeError("Finished floor missing")
original_floor_polys=len(floor.data.polygons)
brass=bpy.data.materials.get("PROOF • brushed brass")
recess=bpy.data.materials.get("PROOF • dark cobalt inner panel")
glass_mat=bpy.data.materials.get("PROOF • narrative glass")
if not brass or not recess or not glass_mat:
    raise RuntimeError("Existing authored Cycles materials are required")
def cuboid(name,loc,dimensions,mat=None,yaw=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o=bpy.context.object
    o.name=name; o.dimensions=dimensions; o.rotation_euler.z=yaw
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if mat:o.data.materials.append(mat)
    return o
report={}
for x,name in xs:
    angle=math.asin(x/RADIUS)
    y=CY+math.sqrt(RADIUS*RADIUS-x*x)
    yaw=-angle  # Tangential to podium-centered circle, front toward its center
    tangent=Vector((math.cos(yaw),math.sin(yaw)))
    radial=Vector((x/RADIUS,(y-CY)/RADIUS))
    error=abs(tangent.dot(radial))
    if error>1e-8:raise RuntimeError("Non-tangential panel "+name)
    root=bpy.data.objects.get("Portale • "+name)
    if root is None:raise RuntimeError("Missing physical portal root "+name)
    before_xyz=tuple(root.location)
    root.location=(x,y,-.16)
    root.rotation_euler.z=yaw
    # Legacy raised podium / auxiliary rectangular foot: remove only in THIS
    # revision copy. Preserve the master and baseline proof on disk.
    removed=[]
    for old_name in (name+" • zoccolo","ARCH04B • portal physical foot "+name):
        old=bpy.data.objects.get(old_name)
        if old:
            removed.append(old.name)
            bpy.data.objects.remove(old,do_unlink=True)
    if len(removed)!=2:
        raise RuntimeError("Expected two old independent portal bases for "+name+": "+str(removed))
    pane=next((o for o in root.children
               if o.type=="MESH" and " • vetro cobalto" in o.name),None)
    if not pane:raise RuntimeError("Glass sheet missing "+name)
    pane.data=pane.data.copy()
    min_z=min(v.co.z for v in pane.data.vertices)
    for v in pane.data.vertices:
        # Move the pane's lower contour below the stone opening, preserving
        # the existing upper rounded silhouette and icon/title placement.
        if v.co.z < min_z+.60:
            v.co.z -= .30
    # The slit has true negative volume, not a glow-only stripe.
    # A thin dark floor channel will remain visible through the opening.
    slot_width=3.94;slot_depth=.18
    cutter=cuboid("PROOF R2 • cutter "+name,(x,y,-.055),
                  (slot_width,slot_depth,.17),None,yaw)
    bpy.context.view_layer.update()
    mod=floor.modifiers.new("PROOF R2 • actual stone cut "+name,"BOOLEAN")
    mod.operation="DIFFERENCE"
    mod.solver="EXACT"
    mod.object=cutter
    bpy.ops.object.select_all(action="DESELECT")
    floor.select_set(True)
    bpy.context.view_layer.objects.active=floor
    try:
        bpy.ops.object.modifier_apply(modifier=mod.name)
    except Exception as err:
        raise RuntimeError("Actual floor boolean failed for "+name) from err
    bpy.data.objects.remove(cutter,do_unlink=True)
    # Physical dark inlay at bottom of cut; two very low bronze lips.
    cuboid("PROOF R2 • dark recessed slot "+name,(x,y,-.117),
            (slot_width,.17,.014),recess,yaw)
    for side in (-1,1):
        offset=side*.105
        lip_x=x-offset*math.sin(yaw)
        lip_y=y+offset*math.cos(yaw)
        cuboid("PROOF R2 • fine slot lip "+name+" "+str(side),
               (lip_x,lip_y,.012),
               (slot_width+.04,.017,.024),brass,yaw)
    report[name]={
        "previous_center_world":before_xyz,
        "new_root":[x,y,-.16],"angle_from_rear_axis_rad":angle,
        "yaw_tangent_rad":yaw,"tangent_radial_abs_dot":error,
        "previous_independent_bases_removed":removed,
        "real_floor_boolean":True,"slot_width_bu":slot_width,
        "slot_depth_bu":slot_depth,"glass_lower_contour_extended_bu":.30,
        "slot_raised_lip_bu":.024}
bpy.context.view_layer.update()
if len(floor.data.polygons)<=original_floor_polys:
    raise RuntimeError("Floor mesh did not gain actual slit topology")
if abs(report["Curricolo"]["new_root"][1]-report["Esperienze"]["new_root"][1])>1e-6:
    raise RuntimeError("Outer paired symmetry broken")
if abs(report["Esplora"]["new_root"][1]-report["Percorsi"]["new_root"][1])>1e-6:
    raise RuntimeError("Inner paired symmetry broken")
if not report["Esplora"]["new_root"][1]>report["Curricolo"]["new_root"][1]:
    raise RuntimeError("Rearward depth relationship broken")
# Existing ART-PROOF visual rig is unchanged; explicitly preserve camera for
# an isolated before/after comparison and add one TOP diagnostic view.
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
oblique=bpy.data.objects.get("CAM_ART_PROOF_OBLIQUE_3D")
if not hero or not oblique:raise RuntimeError("Art proof cameras absent")
camera_data=bpy.data.cameras.new("PROOF R2 — true plan")
top=bpy.data.objects.new("CAM_ART_PROOF_PORTALS_TOP_ORTHO",camera_data)
bpy.context.collection.objects.link(top)
top.location=(0,0.5,34)
top.rotation_euler=(Vector((0,0.5,0))-top.location).to_track_quat("-Z","Y").to_euler()
camera_data.type="ORTHO";camera_data.ortho_scale=27.0
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.cycles.samples=12
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero
candidate=os.path.join(out,"atlas-art-proof-01b-portal-reading-r2.blend")
bpy.ops.wm.save_as_mainfile(filepath=candidate)
receipt={
 "schema":"atlas.gateway.art-proof-01b.portal-correction/v2",
 "status":"REAL_GEOMETRIC_CANDIDATE__ARTISTIC_HUMAN_REVIEW_REQUIRED",
 "canonical_image_sha256":CANON,
 "source_art_proof_blend_sha256":source_sha,
 "candidate_blend_sha256":sha(candidate),
 "old_artistic_scene_preserved":True,
 "modeling_basis":"same 01B scene; four previous portal roots reused",
 "podium_center_xy":[CX,CY],"candidate_arc_radius_bu":RADIUS,
 "archaeology":"Previous circle center Y=-6.3836 not concentric with podium Y=-2",
 "no_publication":True,"no_gltf_runtime":True,
 "original_floor_polygon_count":original_floor_polys,
 "corrected_floor_polygon_count":len(floor.data.polygons),
 "portals":report,"renders":{}
}
for label,cam,size,samples in (
    ("hero",hero,(1152,648),16),
    ("oblique",oblique,(896,504),12),
    ("top_ortho",top,(900,900),8)):
    scene.camera=cam
    scene.cycles.samples=samples
    scene.render.resolution_x=size[0];scene.render.resolution_y=size[1]
    out_file=os.path.join(out,"art-proof-01b-portal-r2-"+label+".png")
    scene.render.filepath=out_file
    bpy.ops.render.render(write_still=True)
    if os.stat(out_file).st_size<9000:raise RuntimeError("Render did not complete "+label)
    receipt["renders"][label]={
        "file":os.path.basename(out_file),"size_px":size,"sha256":sha(out_file),
        "bytes":os.stat(out_file).st_size,"camera":cam.name,
        "cycles_samples":samples}
with open(os.path.join(out,"portal-reading-r2-receipt.json"),"w") as f:
    json.dump(receipt,f,indent=2,ensure_ascii=False)
print("ATLAS_ART_PROOF_01B_PORTAL_READING_R2_COMPLETED")
