#!/usr/bin/env python3
"""ART-DIR-02 P1D-CAM-01 — measured camera-only optical experiments.
Runs on the exact archived P1D/B .blend. Neither geometry nor scene assets
are adjusted to manufacture apparent verticality. Art review is manual.
"""
import bpy
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from mathutils import Vector, Quaternion
from bpy_extras.object_utils import world_to_camera_view

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if "--out" not in args:
    raise RuntimeError("P1D-CAM requires --out")
OUT = Path(args[args.index("--out")+1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(bpy.data.filepath)
B_SHA = "587cf7f84141ebc652a5a9d0382e5f7904ef4cfba749a9ec0274f521fc4adcfa"
ART_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1048576), b""):
            h.update(block)
    return h.hexdigest()

if SOURCE.name != "atlas-art-dir02-p1d-B-constructive.blend" or digest(SOURCE) != B_SHA:
    raise RuntimeError("Only verified ART-DIR-02 P1D/B v2 original may be used")
scene = bpy.context.scene
def need(name):
    x = bpy.data.objects.get(name)
    if x is None:
        raise RuntimeError("Required original scene object missing: " + name)
    return x

hero = need("CAM_HERO_ARCH04")
rim = need("ATLAS R7 • ONE golden oculus light seam")
sky = need("OCULUS ARCH04 • visible open sky")
podium = need("ATLAS ARCH04 • low elliptical convex canopy")
upper = need("P1D • B upper railing")
lower = need("P1D • B lower railing")
vault = need("P1D • continuous curved vault")
labels = ("Curricolo", "Esplora", "Percorsi", "Esperienze")
roots = [need("Portale • " + label) for label in labels]
panes = [need(label+" • vetro cobalto") for label in labels]
bases = [o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0 = [c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases) != 4 or len(cc0) != 3:
    raise RuntimeError("Original portals and immutable CC0 source collections missing")
original_camera_world = hero.matrix_world.copy()
original_lens = float(hero.data.lens)
orig_quat = original_camera_world.to_quaternion()
right = (orig_quat @ Vector((1.,0.,0.))).normalized()
forwards = orig_quat @ Vector((0.,0.,-1.))
original_height = float(original_camera_world.translation.z)
original_counts = (len(scene.objects), len(bpy.data.meshes))
locked = roots + panes + bases + [rim,sky,podium,upper,lower,vault]
locked_matrices = {o.name:tuple(tuple(row) for row in o.matrix_world) for o in locked}
locked_meshes = {
  o.name:(len(o.data.vertices),len(o.data.polygons),
          round(sum(float(v.co.z) for v in o.data.vertices),5))
  for o in locked if o.type=="MESH"
}
if not bpy.context.view_layer.material_override:
    raise RuntimeError("P1D/B neutral clay override missing; do not change lighting")

def sample(obj, maximum=700):
    if obj.type=="MESH":
        vertices=list(obj.data.vertices)
        return [obj.matrix_world@v.co for v in vertices[::max(1,len(vertices)//maximum)]]
    if obj.type=="CURVE":
        pts=[]
        for spl in obj.data.splines:
            if spl.type=="BEZIER":
                pts.extend(obj.matrix_world@p.co for p in spl.bezier_points)
            else:
                pts.extend(obj.matrix_world@Vector(p.co[:3]) for p in spl.points)
        return pts[::max(1,len(pts)//maximum)]
    return [obj.matrix_world@Vector(p) for p in obj.bound_box]

def project(obj):
    return [(p.x,1-p.y,p.z) for p in
        (world_to_camera_view(scene,hero,v) for v in sample(obj))]

def bounds(obj):
    pts=project(obj)
    xx=[p[0] for p in pts]
    yy=[p[1] for p in pts]
    return {"left":min(xx),"right":max(xx),"top":min(yy),"bottom":max(yy),
            "centre_x":(min(xx)+max(xx))*.5,"centre_y":(min(yy)+max(yy))*.5,
            "width":max(xx)-min(xx),"height":max(yy)-min(yy)}

def central_rail(obj):
    pts=project(obj)
    near=sorted(pts,key=lambda v:abs(v[0]-.5))[:max(8,len(pts)//8)]
    return statistics.median(x[1] for x in near)

def coverage(box):
    full=max(1e-8,box["width"]*box["height"])
    overlap=max(0.,min(1.,box["right"])-max(0.,box["left"])) * max(
        0.,min(1.,box["bottom"])-max(0.,box["top"]))
    return min(1.,overlap/full)

def measure():
    pb={label:bounds(o) for label,o in zip(labels,panes)}
    ring=bounds(rim)
    pd=bounds(podium)
    upper_y=central_rail(upper)
    lower_y=central_rail(lower)
    tops=[v["top"] for v in pb.values()]
    bottoms=[v["bottom"] for v in pb.values()]
    portals_coverage={k:coverage(v) for k,v in pb.items()}
    gate={
      "all_four_portals_at_least_90pct_visible":
         all(v>=.90 for v in portals_coverage.values()),
      "oculus_intersects_frame":coverage(ring)>.03,
      "podium_at_least_90pct_visible":coverage(pd)>=.90,
      "galleries_in_expected_vertical_order":upper_y<lower_y,
    }
    forward=hero.matrix_world.to_quaternion() @ Vector((0.,0.,-1.))
    return {
      "camera":{"location":[float(x) for x in hero.matrix_world.translation],
                "focal_mm":float(hero.data.lens),
                "forward_unit":[float(x) for x in forward],
                "forward_elevation_deg":math.degrees(math.asin(max(-1.,min(1.,float(forward.z))))),
                "sensor_width_mm":float(hero.data.sensor_width)},
      "portals":pb,"oculus":ring,"podium":pd,
      "galleries":{"upper_central_y":upper_y,"lower_central_y":lower_y,
                   "vertical_separation_fraction":lower_y-upper_y},
      "ratios":{"median_portal_height_fraction":statistics.median(
                   v["height"] for v in pb.values()),
                "median_portal_top_fraction":statistics.median(tops),
                "median_portal_bottom_fraction":statistics.median(bottoms),
                "headroom_portal_top_minus_oculus_bottom_fraction":
                   statistics.median(tops)-ring["bottom"],
                "oculus_diameter_fraction":ring["width"],
                "podium_occupancy_height_fraction":pd["height"]},
      "visibility":{"portals_fully_visible_fraction":portals_coverage,
                    "oculus_frame_fraction":coverage(ring),
                    "podium_frame_fraction":coverage(pd),
                    "checks":gate,"composition_gate_pass":all(gate.values())}
    }

def verify_unchanged():
    bpy.context.view_layer.update()
    if (len(scene.objects),len(bpy.data.meshes)) != original_counts:
        raise RuntimeError("Camera-only experiment modified object/mesh counts")
    for o in locked:
        if tuple(tuple(row) for row in o.matrix_world)!=locked_matrices[o.name]:
            raise RuntimeError("Geometry transform drift: "+o.name)
        if o.name in locked_meshes:
            v=(len(o.data.vertices),len(o.data.polygons),
               round(sum(float(pt.co.z) for pt in o.data.vertices),5))
            if v!=locked_meshes[o.name]:
                raise RuntimeError("Geometry data drift: "+o.name)
    if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
        raise RuntimeError("Lost CC0 source collection")

scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.cycles.samples=12
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero

def take_picture(label):
    scene.render.filepath=str(OUT/("atlas-p1d-cam-"+label+".png"))
    bpy.ops.render.render(write_still=True)
    p=Path(scene.render.filepath)
    if not p.exists() or p.stat().st_size<=12000:
        raise RuntimeError("Missing genuine Cycles render for "+label)
    return {"file":p.name,"sha256":digest(p),
            "bytes":p.stat().st_size,"resolution":[960,540]}

variants={}
for label,drop,pitch_extra_deg,lens_factor in [
    ("BASE",0.,0.,1.),
    ("CAM-A",.25,0.,1.),
    ("CAM-B",.45,1.8,1.),
    ("CAM-C",.45,1.8,.94),
]:
    hero.matrix_world=original_camera_world.copy()
    # Apply world Z change without refitting the architectural targets.
    loc=hero.matrix_world.translation.copy()
    loc.z-=drop
    hero.location=loc
    if pitch_extra_deg:
        camera_rotation=Quaternion(right,math.radians(pitch_extra_deg))@orig_quat
        hero.rotation_mode="QUATERNION"
        hero.rotation_quaternion=camera_rotation
    else:
        hero.rotation_mode="QUATERNION"
        hero.rotation_quaternion=orig_quat
    hero.data.lens=original_lens*lens_factor
    bpy.context.view_layer.update()
    verify_unchanged()
    observed=measure()
    rendered=take_picture(label)
    current={"height_delta_bu":-drop,
             "tilt_up_delta_degrees":pitch_extra_deg,
             "focal_multiplier":lens_factor,
             "measurement":observed,"render":rendered,
             "geometry_changed":False,"human_art_approved":False}
    if label!="BASE":
        # Save an editable camera variant; source file is untouched.
        scene["P1D_CAM_variant"]=label
        scene["P1D_CAM_source_SHA256"]=B_SHA
        scene["P1D_CAM_human_art_approved"]=0
        bpy.ops.file.pack_all()
        path=OUT/("atlas-p1d-cam-"+label+".blend")
        bpy.ops.wm.save_as_mainfile(filepath=str(path))
        current["editable_model"]={"file":path.name,"sha256":digest(path),
                                   "bytes":path.stat().st_size}
    variants[label]=current

hero.matrix_world=original_camera_world.copy()
hero.data.lens=original_lens
bpy.context.view_layer.update()
verify_unchanged()

baseline=variants["BASE"]["measurement"]
def pair_metrics(m):
    return m["ratios"]
for label in ["CAM-A","CAM-B","CAM-C"]:
    o=variants[label]["measurement"]
    baseline_boxes=baseline["portals"]
    other_boxes=o["portals"]
    variants[label]["measured_projection_drift"]={
      "largest_portal_centre_fraction":max(
         abs(baseline_boxes[k]["centre_x"]-other_boxes[k]["centre_x"])
         for k in labels),
      "largest_portal_top_fraction":max(
         abs(baseline_boxes[k]["top"]-other_boxes[k]["top"]) for k in labels),
      "oculus_centre_y_fraction":
         o["oculus"]["centre_y"]-baseline["oculus"]["centre_y"],
      "podium_centre_y_fraction":
         o["podium"]["centre_y"]-baseline["podium"]["centre_y"]
    }
    variants[label]["headroom_delta_fraction"]=(
       o["ratios"]["headroom_portal_top_minus_oculus_bottom_fraction"]
       - baseline["ratios"]["headroom_portal_top_minus_oculus_bottom_fraction"]
    )
report={
    "schema":"atlas.artdir02.p1d-cam01/v1",
    "reference_sha256":ART_SHA,
    "source_p1d_b_sha256":B_SHA,
    "baseline_camera_height_bu":original_height,
    "baseline_lens_mm":original_lens,
    "camera_only_experiment":True,
    "no_geometry_edits":True,
    "source_image_is_synthetic_and_not_metric":True,
    "human_art_approved":False,
    "no_merge":True,"no_deploy":True,
    "variants":variants,
    "assessment":"TECHNICAL CAMERA EXPERIMENT ONLY; NO AUTOMATIC ARTISTIC SELECTION",
    "next_stage":"ARCH HEIGHT TEST ONLY IF CAMERA RESULTS PROVE INSUFFICIENT",
}
(OUT/"atlas-p1d-cam01-receipt.json").write_text(
    json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_P1D_CAM01_EXECUTED_REAL_BLENDER",json.dumps({
    "source":B_SHA,"camera_cases":list(variants),
    "headroom_fraction":{k:round(pair_metrics(v["measurement"])["headroom_portal_top_minus_oculus_bottom_fraction"],4)
                         for k,v in variants.items()},
    "composition_gates":{k:v["measurement"]["visibility"]["composition_gate_pass"]
                          for k,v in variants.items()},
    "human_art_approved":False}))
