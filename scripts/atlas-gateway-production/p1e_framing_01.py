#!/usr/bin/env python3
"""ART-DIR-02 P1E-FRAMING-01: reversible camera optical/pose study.
Compare authentic ARCH A/B, J3/J4, preserving skylight, portals,
gallery meshes, world, materials, source .blend, and visual canon.
"""
import bpy
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def flag(k):
    if k not in args or args.index(k)+1>=len(args):
        raise RuntimeError("Missing required "+k)
    return args[args.index(k)+1]
ARCH=flag("--arch").upper()
MODE=flag("--variant").upper()
OUT=Path(flag("--out")).resolve()
GEOMETRY=Path(flag("--oculus-receipt")).resolve()
SKY07=Path(flag("--sky07-receipt")).resolve()
if ARCH not in ("A","B") or MODE not in ("J3","J4"):
    raise RuntimeError("Unexpected architecture or J3/J4")
OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for x in iter(lambda:f.read(1<<20),b""):h.update(x)
    return h.hexdigest()
geo=json.loads(GEOMETRY.read_text(encoding="utf8"))
parent=json.loads(SKY07.read_text(encoding="utf8"))
if SRC.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend":
    raise RuntimeError("Input is not qualified J3/J4 .blend")
if geo["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or geo["arch"]!=ARCH:
    raise RuntimeError("P1D-OCULUS-03 receipt invalid")
if parent["schema"]!="atlas.artdir02.p1d-sky-texture/v1" or parent["arch"]!=ARCH or parent["structural_variant"]!=MODE:
    raise RuntimeError("P1D-SKY-07 receipt invalid")
source_digest=sha(SRC)
if (source_digest!=geo["variants"][MODE]["editable_blend"]["sha256"]
    or parent["source_sha256"]!=source_digest
    or not parent["camera_world_lamps_unchanged"]
    or not parent["original_source_unmodified"]
    or geo["art_approved"] or parent["art_approved"]
    or not parent["no_merge"] or not parent["no_deploy"]):
    raise RuntimeError("Qualified source or governance does not match")
scene=bpy.context.scene
view=bpy.context.view_layer
def object_required(n):
    obj=bpy.data.objects.get(n)
    if obj is None:raise RuntimeError("Missing required original object: "+n)
    return obj
camera=object_required("CAM_HERO_ARCH04")
rim=object_required(f"ARCH {ARCH} raised oculus rim")
sky=object_required(f"ARCH {ARCH} raised sky opening")
collar=object_required("ATLAS R7 • one dark skylight collar")
roof=object_required(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
upper=object_required(f"ARCH {ARCH} upper parapet")
lower=object_required("P1D • B lower railing")
panels=[object_required(n+" • vetro cobalto") for n in ("Curricolo","Esplora","Percorsi","Esperienze")]
if camera.type!="CAMERA" or rim.type!="CURVE" or roof.type!="MESH":
    raise RuntimeError("Camera, true rim or roof type does not match")
if sky.hide_render or collar.hide_render or roof.hide_render or not rim.hide_render:
    raise RuntimeError("Original rendering visibility differs from qualified source")
if view.material_override is None:
    raise RuntimeError("Original qualified neutral material override expected")
original_camera_matrix=camera.matrix_world.copy()
original_lens=camera.data.lens
original_shift=(camera.data.shift_x,camera.data.shift_y)
original_cam=scene.camera
original_override=view.material_override
original_world=scene.world
original_render=(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
                 scene.render.resolution_percentage,scene.cycles.samples,
                 scene.render.filepath,scene.render.image_settings.file_format,
                 scene.render.film_transparent)
original_vis={o.name:o.hide_render for o in scene.objects}
original_objects=set(scene.objects.keys())
original_meshes=set(bpy.data.meshes.keys())
original_lights={o.name:(o.data.energy,tuple(tuple(row) for row in o.matrix_world))
                 for o in scene.objects if o.type=="LIGHT"}
# Existing 3D observables, without flattening any object's actual geometry.
def bz(a,b,c,d,t):
    s=1-t
    return s*s*s*a+3*s*s*t*b+3*s*t*t*c+t*t*t*d
rim_points=[]
for spline in rim.data.splines:
    if spline.type=="BEZIER":
        pts=list(spline.bezier_points)
        for i in range(len(pts) if spline.use_cyclic_u else len(pts)-1):
            a=pts[i];b=pts[(i+1)%len(pts)]
            for j in range(32):
                rim_points.append(rim.matrix_world@bz(a.co,a.handle_right,b.handle_left,b.co,j/32.))
    elif spline.type in ("POLY","NURBS"):
        rim_points.extend(rim.matrix_world@Vector(p.co[:3]) for p in spline.points)
if len(rim_points)<32:
    raise RuntimeError("True original rim has too few spline samples")
world_center=sum(rim_points,Vector((0,0,0)))/len(rim_points)
def world_corners(o):
    return [o.matrix_world@Vector(c) for c in o.bound_box]
def project(p):
    q=world_to_camera_view(scene,camera,p)
    return [float(q.x),float(q.y),float(q.z)]
def stats(a):
    return {"min":min(a),"max":max(a),"mean":statistics.mean(a)}
def projected_bounds(points):
    vals=[project(pt) for pt in points]
    front=[v for v in vals if v[2]>0]
    if not front:
        return {"front_fraction":0.,"center":[None,None],"on_screen_fraction":0.,"bounds":None}
    xs=[v[0] for v in front];ys=[v[1] for v in front]
    return {
        "front_fraction":len(front)/len(vals),
        "on_screen_fraction":sum(0<=x<=1 and 0<=y<=1 for x,y,_ in front)/len(vals),
        "above_frame_fraction":sum(y>1 for y in ys)/len(front),
        "below_frame_fraction":sum(y<0 for y in ys)/len(front),
        "bounds":{"left":min(xs),"right":max(xs),"bottom":min(ys),"top":max(ys)},
        "center":[statistics.mean(xs),statistics.mean(ys)],
        "width_normalized":max(xs)-min(xs),
        "height_normalized":max(ys)-min(ys)}
# Camera experiments isolate optic/pitch/position effects.
CASES={
 "BASE":{"tilt_degrees":0.,"lens_factor":1.,"lower_z_bu":0.},
 "TILT_UP_3":{"tilt_degrees":3.,"lens_factor":1.,"lower_z_bu":0.},
 "TILT_UP_5":{"tilt_degrees":5.,"lens_factor":1.,"lower_z_bu":0.},
 "WIDE_8":{"tilt_degrees":0.,"lens_factor":.92,"lower_z_bu":0.},
 "TILT_4_WIDE_6":{"tilt_degrees":4.,"lens_factor":.94,"lower_z_bu":0.},
 "LOWER_035_TILT_4":{"tilt_degrees":4.,"lens_factor":1.,"lower_z_bu":.35},
}
scene.camera=camera
scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.cycles.samples=14
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
view.material_override=None
view.update()
results={}
for name,p in CASES.items():
    matrix=original_camera_matrix @ Matrix.Rotation(math.radians(p["tilt_degrees"]),4,"X")
    position=matrix.translation.copy()
    position.z-=p["lower_z_bu"]
    matrix.translation=position
    camera.matrix_world=matrix
    camera.data.lens=original_lens*p["lens_factor"]
    view.update()
    oculus=projected_bounds(rim_points)
    portals={o.name:projected_bounds(world_corners(o)) for o in panels}
    gallery={
        upper.name:projected_bounds(world_corners(upper)),
        lower.name:projected_bounds(world_corners(lower))
    }
    gallery_extras=[o for o in scene.objects if o.type=="MESH" and not o.hide_render
                    and o.name not in gallery and any(t in o.name.lower()
                    for t in ("gallery","galler","parapet","railing","balcon"))]
    for x in gallery_extras[:8]:
        gallery[x.name]=projected_bounds(world_corners(x))
    portal_centers={key:v["center"] for key,v in portals.items()}
    centroid_x=[v["center"][0] for v in portals.values()]
    centroid_y=[v["center"][1] for v in portals.values()]
    portal_spacing_span=max(centroid_x)-min(centroid_x)
    # All four portal centers and both framing goals must be considered.
    all_portal_centers_visible=all(0<x<1 and 0<y<1 for x,y in portal_centers.values())
    glass_panel_centers_y_range=[min(centroid_y),max(centroid_y)]
    roof_visible_fractions={x.name:projected_bounds(world_corners(x)) for x in (sky,roof,collar)}
    file=OUT/f"atlas-p1e-framing-01-{ARCH}-{MODE}-{name}.png"
    scene.render.filepath=str(file)
    bpy.ops.render.render(write_still=True)
    if not file.is_file() or file.stat().st_size<1500:
        raise RuntimeError("Camera Cycles image not created "+file.name)
    img=bpy.data.images.load(str(file),check_existing=False)
    try:
        if tuple(img.size)!=(960,540):
            raise RuntimeError("Wrong image resolution")
        pix=img.pixels
        total=0;count=0
        upper_total=0;upper_count=0
        for yy in range(24,540,9):
            for xx in range(16,960,10):
                index=4*(yy*960+xx)
                l=.2126*pix[index]+.7152*pix[index+1]+.0722*pix[index+2]
                total+=l;count+=1
                if yy>=.67*540:
                    upper_total+=l;upper_count+=1
        photometry={
            "whole_frame_sample_rgb_mean_proxy":total/count,
            "upper_third_sample_rgb_mean_proxy":upper_total/upper_count,
            "note":"Relative PNG luminance only; not physically calibrated."
        }
    finally:
        bpy.data.images.remove(img)
    results[name]={
        "configuration":p,"camera_matrix_world":[list(row) for row in camera.matrix_world],
        "lens_mm":camera.data.lens,
        "oculus_rim_projected":oculus,
        "oculus_world_center_projection":project(world_center),
        "oculus_sky_and_crown":roof_visible_fractions,
        "portals":portals,
        "portals_four_centers_inside_image":all_portal_centers_visible,
        "portal_center_horizontal_span_normalized":portal_spacing_span,
        "portal_center_vertical_range_normalized":glass_panel_centers_y_range,
        "galleries":gallery,
        "render":{"file":file.name,"sha256":sha(file),"bytes":file.stat().st_size,"photometry":photometry}}
    print("FRAMING01_CASE",ARCH,MODE,name,
        "OCULUS_TOP",round(oculus["bounds"]["top"],4),
        "OCULUS_ABOVE",round(oculus["above_frame_fraction"],4),
        "OCULUS_BOTTOM",round(oculus["bounds"]["bottom"],4),
        "PORTALS_INSIDE",all_portal_centers_visible,
        "PORTALS_SPAN",round(portal_spacing_span,4),flush=True)
# Restore all source state; no scene writes.
camera.matrix_world=original_camera_matrix
camera.data.lens=original_lens
scene.camera=original_cam
view.material_override=original_override
scene.world=original_world
(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)=original_render
view.update()
if sha(SRC)!=source_digest:
    raise RuntimeError("Qualified .blend bytes have changed")
if max(abs(camera.matrix_world[i][j]-original_camera_matrix[i][j])
       for i in range(4) for j in range(4))>1.e-6:
    raise RuntimeError("Camera pose was not restored")
if camera.data.lens!=original_lens or (camera.data.shift_x,camera.data.shift_y)!=original_shift:
    raise RuntimeError("Lens or shift were not restored")
if set(scene.objects.keys())!=original_objects or set(bpy.data.meshes.keys())!=original_meshes:
    raise RuntimeError("Experiment left new geometry")
if any(o.hide_render!=original_vis[o.name] for o in scene.objects):
    raise RuntimeError("Unexpected visibility changes")
if original_lights!={o.name:(o.data.energy,tuple(tuple(row) for row in o.matrix_world))
     for o in scene.objects if o.type=="LIGHT"}:
    raise RuntimeError("Original lights modified")
if scene.camera!=original_cam or view.material_override!=original_override or scene.world!=original_world:
    raise RuntimeError("Original view setup not restored")
if not results["BASE"]["portals_four_centers_inside_image"]:
    raise RuntimeError("Original qualified scene no longer shows four portal centers")
if not all(math.isfinite(result["oculus_rim_projected"]["center"][1]) for result in results.values()):
    raise RuntimeError("Missing oculus projection")
receipt={
 "schema":"atlas.artdir02.p1e-framing/v1",
 "arch":ARCH,"structural_variant":MODE,"canonical_art_sha256":geo["canonical_art_sha256"],
 "source_sha256":source_digest,"source_qualifying_run":45008316673,
 "parent_sky07_receipt_schema":parent["schema"],"parent_sky07_run":45025089124,
 "camera_original":{"lens_mm":original_lens,"matrix_world":[list(row) for row in original_camera_matrix],
                    "shift":[original_shift[0],original_shift[1]]},
 "true_oculus_rim_points":len(rim_points),
 "experiment_is_camera_pose_and_lens_only":True,
 "structure_sky_and_four_glass_panels_untouched":True,
 "original_lamps_world_materials_unchanged":True,
 "camera_restored_and_blend_not_saved":True,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "cases":results,
 "interpretation":"Same unchanged scene and Cycles materials per camera. Projection is from real 3-D curves and mesh bounding boxes, not a canonical-image geometry match. Gallery/portal boxes are on-screen proxies and not occlusion-aware."
}
out=OUT/f"atlas-p1e-framing-01-{ARCH}-{MODE}-receipt.json"
out.write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding="utf8")
print("P1E_FRAMING_01_COMPLETE",ARCH,MODE,len(results),"CAMERA_RECOVERED",flush=True)
