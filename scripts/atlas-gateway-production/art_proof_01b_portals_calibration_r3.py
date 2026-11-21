#!/usr/bin/env python3
"""ART-DIR-02 / ART-PROOF-01B — R3 portal calibration on canonical cinematic scene.

Load the existing cinematic proof scene .blend. Do not replace lights, dome,
architecture, portal illustrations, brand or reference image. Make the four
glass panels tangent to a circle centered on the podium and physically inset
into four actual cuts in the finished floor. Generate HERO / oblique / TOP.
All values are relative Blender units and PARAMETRIC CANDIDATES, not measurements
of the original synthetic reference. R2 script and archived artifacts stay intact.
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
PROFILES={
 "A": {"radius":8.3,"outer_x":5.95,"inner_x":2.40,
       "width_factor":1.18,"height_factor":1.22,
       "camera_y":-14.6,"camera_z":4.02,"camera_target_y":2.70,
       "camera_target_z":3.23,"hero_lens":31.8},
 "B": {"radius":9.1,"outer_x":6.25,"inner_x":2.45,
       "width_factor":1.25,"height_factor":1.30,
       "camera_y":-14.2,"camera_z":4.09,"camera_target_y":3.00,
       "camera_target_z":3.30,"hero_lens":32.4},
 "C": {"radius":9.7,"outer_x":6.30,"inner_x":2.50,
       "width_factor":1.28,"height_factor":1.34,
       "camera_y":-13.9,"camera_z":4.14,"camera_target_y":3.10,
       "camera_target_z":3.38,"hero_lens":32.8}
}
profile=args[args.index("--profile")+1] if "--profile" in args else "A"
if profile not in PROFILES: raise ValueError("Unknown R3 calibration profile "+profile)
p=PROFILES[profile]
scene=bpy.context.scene
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
CX,CY=0.0,-2.0
# Controlled geometric example: retain the original X layout, test a shared
# podium-centered circle R. Future variations are gated by comparing rendering.
RADIUS=p["radius"]
WFACT=p["width_factor"]
HFACT=p["height_factor"]
xs=[(-p["outer_x"],"Curricolo"),(-p["inner_x"],"Esplora"),
    (p["inner_x"],"Percorsi"),(p["outer_x"],"Esperienze")]
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
    # A taller slab must still have its illuminated rim flush with the stone.
    # Local rim foot is z ~= 0.25 before scaling, hence the adaptive datum.
    root_z=-.24-(HFACT-1.0)*.25
    root.location=(x,y,root_z)
    root.rotation_euler.z=yaw
    root.scale=(WFACT,1.0,HFACT)  # Scale the entire assembled portal consistently
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
    target_glass_bottom_world=-.10  # inside the -0.14..0.03 physical slot
    lower_extension=(root_z+(pane.location.z+min_z)*HFACT-target_glass_bottom_world)/HFACT
    if lower_extension<=0:raise RuntimeError("Glass inset adjustment must be positive")
    actual_bottom=root_z+(pane.location.z+min_z-lower_extension)*HFACT
    if not (-.13<=actual_bottom<=-.065):
        raise RuntimeError("Glass does not enter the actual stone cut")
    for v in pane.data.vertices:
        # Move the pane's lower contour below the stone opening, preserving
        # the existing upper rounded silhouette and icon/title placement.
        if v.co.z < min_z+.60:
            v.co.z -= lower_extension
    # The slit has true negative volume, not a glow-only stripe.
    # A thin dark floor channel will remain visible through the opening.
    slot_width=3.94*WFACT;slot_depth=.18
    cutter=cuboid("PROOF R3 • cutter "+name,(x,y,-.055),
                  (slot_width,slot_depth,.17),None,yaw)
    bpy.context.view_layer.update()
    mod=floor.modifiers.new("PROOF R3 • actual stone cut "+name,"BOOLEAN")
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
    cuboid("PROOF R3 • dark recessed slot "+name,(x,y,-.117),
            (slot_width,.17,.014),recess,yaw)
    for side in (-1,1):
        offset=side*.105
        lip_x=x-offset*math.sin(yaw)
        lip_y=y+offset*math.cos(yaw)
        cuboid("PROOF R3 • fine slot lip "+name+" "+str(side),
               (lip_x,lip_y,.012),
               (slot_width+.04,.017,.024),brass,yaw)
    report[name]={
        "width_factor":WFACT,"height_factor":HFACT,
        "previous_center_world":before_xyz,
        "new_root":[x,y,root_z],"angle_from_rear_axis_rad":angle,
        "yaw_tangent_rad":yaw,"tangent_radial_abs_dot":error,
        "previous_independent_bases_removed":removed,
        "real_floor_boolean":True,"slot_width_bu":slot_width,
        "slot_depth_bu":slot_depth,"glass_lower_contour_extended_bu":lower_extension,
        "glass_bottom_world_z":actual_bottom,"rim_ground_datum_world_z":root_z+.25*HFACT,
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
# Keep all material/light/cupola objects. The HERO/OBLIQUE cameras are the
# explicitly changed variables of R3; R2 retained unmodified in Git and Drive.
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
oblique=bpy.data.objects.get("CAM_ART_PROOF_OBLIQUE_3D")
if not hero or not oblique:raise RuntimeError("Art proof cameras absent")
hero.location=(0,p["camera_y"],p["camera_z"])
hero.rotation_euler=(Vector((0,p["camera_target_y"],p["camera_target_z"]))-hero.location).to_track_quat("-Z","Y").to_euler()
hero.data.lens=p["hero_lens"]
oblique.location=(3.5,p["camera_y"],p["camera_z"]+.13)
oblique.rotation_euler=(Vector((0,p["camera_target_y"],p["camera_target_z"]-.12))-oblique.location).to_track_quat("-Z","Y").to_euler()
oblique.data.lens=p["hero_lens"]-.2
camera_data=bpy.data.cameras.new("PROOF R3 — true plan")
top=bpy.data.objects.new("CAM_ART_PROOF_PORTALS_TOP_ORTHO",camera_data)
bpy.context.collection.objects.link(top)
# Technical cutaway: the overhead sky/roof would obscure the portal arc at z=34.
# Place the orthographic plan camera INSIDE the rotunda, above the portals,
# below the oculus. This changes only the diagnostic camera, not geometry.
top.location=(0,0.5,7.25)
top.rotation_euler=(Vector((0,0.5,0))-top.location).to_track_quat("-Z","Y").to_euler()
camera_data.type="ORTHO";camera_data.ortho_scale=27.0
# Close viewing of the physical channel (not a cutaway, to be separately validated).
detail_data=bpy.data.cameras.new("PROOF R3 — floor-slot closeup")
detail=bpy.data.objects.new("CAM_ART_PROOF_PORTALS_SLOT_DETAIL",detail_data)
bpy.context.collection.objects.link(detail)
dx,dy=report["Curricolo"]["new_root"][:2]
detail.location=(dx+.75,dy-2.0,.90)
detail.rotation_euler=(Vector((dx,dy,-.055))-detail.location).to_track_quat("-Z","Y").to_euler()
detail_data.type="ORTHO";detail_data.ortho_scale=2.9
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.cycles.samples=12
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero
candidate=os.path.join(out,"atlas-art-proof-01b-portal-calibration-r3-"+profile.lower()+".blend")
bpy.ops.wm.save_as_mainfile(filepath=candidate)
receipt={
 "schema":"atlas.gateway.art-proof-01b.portal-calibration/v3",
 "profile_id":profile,"profile_parameters":p,
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
 "human_art_approval":False,"only_experimental_profile":True,
 "corrected_floor_polygon_count":len(floor.data.polygons),
 "portals":report,"renders":{}
}
for label,cam,size,samples in (
    ("hero",hero,(1152,648),18),
    ("oblique",oblique,(896,504),12),
    ("top_ortho",top,(900,900),8),
    ("slot_detail",detail,(720,540),10)):
    scene.camera=cam
    scene.cycles.samples=samples
    scene.render.resolution_x=size[0];scene.render.resolution_y=size[1]
    out_file=os.path.join(out,"art-proof-01b-portal-r3-"+profile.lower()+"-"+label+".png")
    scene.render.filepath=out_file
    bpy.ops.render.render(write_still=True)
    if os.stat(out_file).st_size<9000:raise RuntimeError("Render did not complete "+label)
    receipt["renders"][label]={
        "file":os.path.basename(out_file),"size_px":size,"sha256":sha(out_file),
        "bytes":os.stat(out_file).st_size,"camera":cam.name,
        "cycles_samples":samples}
# Coordinate check for portal spacing along the concentric curve.
outer=math.asin(p["outer_x"]/RADIUS)
inner=math.asin(p["inner_x"]/RADIUS)
receipt["minimum_adjacent_arc_gap_bu"]=min(
 RADIUS*(outer-inner)-3.07*WFACT,
 RADIUS*(2*inner)-3.07*WFACT)
receipt["positive_arc_gap"]=(receipt["minimum_adjacent_arc_gap_bu"]>0)
# Approximate outer-frame screen rectangles, independent of actual occlusion.
from bpy_extras.object_utils import world_to_camera_view
landmark_path="docs/atlas-gateway/ART-DIR-02-CANONICAL-LANDMARKS.json"
with open(landmark_path,encoding="utf8") as f:
    canonical=json.load(f)
if canonical["source"]["sha256"]!=CANON:
    raise RuntimeError("Canonical landmark provenance mismatch")
scene.camera=hero
scene.render.resolution_x=1152;scene.render.resolution_y=648
scene.render.resolution_percentage=100
bpy.context.view_layer.update()
projected={}
errors=[]
for entry in canonical["portals"]:
    n=next(k for k in report if k.lower()==entry["id"])
    obj=bpy.data.objects.get(n+" • cornice continua")
    if not obj:raise RuntimeError("Missing frame for "+n)
    bb=[world_to_camera_view(scene,hero,obj.matrix_world@Vector(v))
        for v in obj.bound_box]
    rect=[min(v.x for v in bb),1-max(v.y for v in bb),
          max(v.x for v in bb),1-min(v.y for v in bb)]
    target=entry["bbox_normalized"]
    errors.extend(abs(a-b) for a,b in zip(rect,target))
    projected[n]={"screen_bbox_normalized":rect,"target_bbox_normalized":target}
receipt["hero_portal_projected_frame_bboxes"]=projected
receipt["hero_portal_normalized_bbox_mae"]=sum(errors)/len(errors)
receipt["measurement_note"]="3D projected frame corners vs manually annotated synthetic JPEG; no occlusion or visual-quality assessment"
with open(os.path.join(out,"portal-calibration-r3-"+profile.lower()+"-receipt.json"),"w") as f:
    json.dump(receipt,f,indent=2,ensure_ascii=False)
print("ATLAS_ART_PROOF_01B_PORTAL_CALIBRATION_R3_COMPLETED",profile)
