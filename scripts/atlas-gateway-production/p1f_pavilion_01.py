#!/usr/bin/env python3
"""ATLAS P1F: reinterpret the genuine qualified B/J4 atrium as a tall, softened
longitudinal pavilion. Produces a NEW .blend, Cycles PNG and diagnostic roof GLB.
Never overwrites the authenticated source. No deployment or art auto-approval.
"""
import bpy
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def require(key):
    if key not in argv or argv.index(key) + 1 == len(argv):
        raise RuntimeError("Required option " + key)
    return argv[argv.index(key) + 1]

out = Path(require("--out")).resolve()
out.mkdir(parents=True, exist_ok=True)
receipt = json.loads(Path(require("--oculus-receipt")).read_text(encoding="utf-8"))
source = Path(bpy.data.filepath)
def digest(p):
    h = hashlib.sha256()
    with Path(p).open("rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()

original_sha = digest(source)
if (source.name != "atlas-p1d-oculus-03-B-J4.blend"
        or receipt["schema"] != "atlas.artdir02.p1d-oculus-manifold/v1"
        or receipt["arch"] != "B"
        or receipt["canonical_art_sha256"] !=
           "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
        or original_sha != receipt["variants"]["J4"]["editable_blend"]["sha256"]):
    raise RuntimeError("Unqualified or altered B/J4 original: refusing modification")
scene, view = bpy.context.scene, bpy.context.view_layer
def need(n):
    ob = bpy.data.objects.get(n)
    if ob is None:
        raise RuntimeError("Missing source object " + n)
    return ob
cam = need("CAM_HERO_ARCH04")
rim = need("ARCH B raised oculus rim")
roof = need("ATLAS B J4 integrated structural crown and vault")
sky = need("ARCH B raised sky opening")
collar = need("ATLAS R7 • one dark skylight collar")
first = need("ARCH04 • first gallery deck")
upper = need("ARCH04 • upper gallery deck")
glass = [need(n + " • vetro cobalto") for n in
         ("Curricolo", "Esplora", "Percorsi", "Esperienze")]
if (cam.type != "CAMERA" or roof.type != "MESH"
        or sky.type != "MESH" or collar.type != "MESH"
        or rim.type != "CURVE" or len(glass) != 4):
    raise RuntimeError("Qualified object types have changed")
if roof.hide_render or sky.hide_render or not rim.hide_render:
    raise RuntimeError("Unexpected original visibility")
original_objects = set(o.name for o in scene.objects)
camera_before = cam.matrix_world.copy()
lens_before = cam.data.lens
original_lights = {o.name: o.data.energy for o in scene.objects if o.type == "LIGHT"}
def world_corners(o):
    return [o.matrix_world @ Vector(v) for v in o.bound_box]
def z_bounds(o):
    zs = [v.z for v in world_corners(o)]
    return min(zs), max(zs)
protected = {o.name: [tuple(v) for v in world_corners(o)]
             for o in [first] + glass}
upper_before = z_bounds(upper)[1]
roof_before = z_bounds(roof)[1]
# Use ORIGINAL actual rim coordinates to derive XY centre and longitudinal axis.
rim_points = []
for sp in rim.data.splines:
    if sp.type == "BEZIER":
        rim_points.extend(rim.matrix_world @ p.co for p in sp.bezier_points)
    else:
        rim_points.extend(rim.matrix_world @ Vector(p.co[:3]) for p in sp.points)
if len(rim_points) < 40:
    raise RuntimeError("Source oculus contour incomplete")
cx = statistics.mean(p.x for p in rim_points)
cy = statistics.mean(p.y for p in rim_points)
cam_xy = cam.matrix_world.translation
fwd = Vector((cx - cam_xy.x, cy - cam_xy.y))
if fwd.length < .1:
    raise RuntimeError("HERO camera aligned with skylight centre")
fwd.normalize()
side = Vector((-fwd.y, fwd.x))
# One coherent non-linear spatial mapping, tapered to ZERO at outer galleries.
# Superellipse n>2 has gently almost-straight sides and rounded ends.
SUPER_N = 2.8
LENGTH_SCALE = 1.24
WIDTH_SCALE = .84
FULL_WARP_R = 5.40
NO_WARP_R = 11.30
GALLERY_RISE = .65
CROWN_EXTRA = 1.10
def smooth(t):
    x = max(0., min(1., t))
    return x*x*(3.-2.*x)
def warp(point):
    dx, dy = point.x-cx, point.y-cy
    along = dx*fwd.x+dy*fwd.y
    across = dx*side.x+dy*side.y
    r = math.hypot(along, across)
    if r > 1e-8:
        theta = math.atan2(across, along)
        c, s = math.cos(theta), math.sin(theta)
        denom = ((abs(c)/LENGTH_SCALE)**SUPER_N +
                 (abs(s)/WIDTH_SCALE)**SUPER_N)**(1./SUPER_N)
        scale = 1./denom
        taper = 1.-smooth((r-FULL_WARP_R)/(NO_WARP_R-FULL_WARP_R))
        factor = 1.+taper*(scale-1.)
        along *= factor
        across *= factor
    z = point.z + GALLERY_RISE*smooth((point.z-3.25)/2.20)
    z += CROWN_EXTRA*smooth((point.z-5.80)/1.60)
    return Vector((cx+along*fwd.x+across*side.x,
                   cy+along*fwd.y+across*side.y, z))
# Same architecture selection as the measured P1E-VOLUME-02 experiment.
# Portal and podium entities are deliberately excluded.
def architectural(o):
    if o.type not in {"MESH", "CURVE"}:
        return False
    if o.name.startswith(("Curricolo", "Esplora", "Percorsi",
                          "Esperienze", "Portale", "PROOF")):
        return False
    if not o.name.startswith(("ARCH ", "ARCH04", "ATLAS ", "P1D ")):
        return False
    return z_bounds(o)[1] > 3.25
cohort = [o for o in scene.objects if architectural(o)]
cohort_names = {o.name for o in cohort}
if not {roof.name, sky.name, rim.name, collar.name, upper.name}.issubset(cohort_names):
    raise RuntimeError("Critical upper structures omitted from common deformation")
if first.name in cohort_names or any(o.name in cohort_names for o in glass):
    raise RuntimeError("Portal/first-floor geometry cannot be warped")
if not 40 <= len(cohort) <= 420:
    raise RuntimeError("Unexpected architecture cohort length: " + str(len(cohort)))
# Duplicate data: source mesh/curve datablocks are never edited.
for o in cohort:
    original_data = o.data
    o.data = original_data.copy()
    world = o.matrix_world.copy()
    inv = world.inverted()
    if o.type == "MESH":
        for vert in o.data.vertices:
            vert.co = inv @ warp(world @ vert.co)
        o.data.update()
    else:
        for sp in o.data.splines:
            if sp.type == "BEZIER":
                for bp in sp.bezier_points:
                    for attr in ("co", "handle_left", "handle_right"):
                        setattr(bp, attr, inv @ warp(world @ getattr(bp, attr)))
            else:
                for p in sp.points:
                    world_pt = world @ Vector(p.co[:3])
                    new_pt = inv @ warp(world_pt)
                    p.co = (new_pt.x, new_pt.y, new_pt.z, p.co.w)
view.update()
for o in [first] + glass:
    now = [tuple(v) for v in world_corners(o)]
    if now != protected[o.name]:
        raise RuntimeError("Protected portal or first gallery moved: " + o.name)
if z_bounds(upper)[1] <= upper_before + .50:
    raise RuntimeError("Upper gallery did not rise sufficiently")
if z_bounds(roof)[1] <= roof_before + 1.25:
    raise RuntimeError("Roof vertical gain insufficient")
if {o.name for o in scene.objects} != original_objects:
    raise RuntimeError("Source scene objects added/deleted")
if {o.name: o.data.energy for o in scene.objects if o.type == "LIGHT"} != original_lights:
    raise RuntimeError("Original lights unexpectedly altered")
if digest(source) != original_sha:
    raise RuntimeError("Original binary changed")
# Measure the true reshaped rim in its physical horizontal camera-aligned axes.
shape = []
for sp in rim.data.splines:
    if sp.type == "BEZIER":
        shape.extend(rim.matrix_world @ p.co for p in sp.bezier_points)
    else:
        shape.extend(rim.matrix_world @ Vector(p.co[:3]) for p in sp.points)
major = [((p.x-cx)*fwd.x+(p.y-cy)*fwd.y) for p in shape]
minor = [((p.x-cx)*side.x+(p.y-cy)*side.y) for p in shape]
major_span = max(major)-min(major)
minor_span = max(minor)-min(minor)
if not (major_span > minor_span*1.15):
    raise RuntimeError("Pavilion opening did not become clearly elongated")
# Restrained finishing on CANDIDATE material slots only. Native original
# datablocks and the four original portal panels remain unmodified.
def graphite(name, rgb, metallic=.18, roughness=.58):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*rgb, 1.)
    shader = m.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*rgb, 1.)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    return m
roof_finish = graphite("P1F • volta blu grafite", (.018, .036, .065), .12, .68)
deck_finish = graphite("P1F • balconate blu grafite", (.024, .047, .078), .16, .56)
roof.data.materials.clear()
roof.data.materials.append(roof_finish)
finish_members=[]
for o in list(scene.objects):
    if o.type != "MESH":
        continue
    if o.name in ("ARCH04 • first gallery deck", "ARCH04 • upper gallery deck",
                  "ARCH B upper gallery slab", "ARCH04 • upper cornice"):
        o.data = o.data.copy()
        o.data.materials.clear()
        o.data.materials.append(deck_finish)
        finish_members.append(o.name)
# HERO remains untouched in the source. A wider, upward-looking candidate camera
# retains the base perspective while admitting more of the tall skylight.
cam.matrix_world = camera_before @ Matrix.Rotation(math.radians(6.0), 4, "X")
cam.data.lens = lens_before*.86
scene.camera = cam
view.material_override = None
view.update()
def project(o):
    p = [world_to_camera_view(scene, cam, q) for q in world_corners(o)]
    return ((min(v.x for v in p)+max(v.x for v in p))/2.,
            (min(v.y for v in p)+max(v.y for v in p))/2.)
centres = {o.name: project(o) for o in glass}
if not all(0 < xy[0] < 1 and 0 < xy[1] < 1 for xy in centres.values()):
    raise RuntimeError("One of four glass portals no longer in HERO frame")
scene.render.engine = "CYCLES"
scene.render.resolution_x = 1024
scene.render.resolution_y = 576
scene.render.resolution_percentage = 100
scene.cycles.samples = 44
view.cycles.use_denoising = True
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
png = out/"atlas-p1f-pavilion-01-B-J4-HERO.png"
scene.render.filepath = str(png)
bpy.ops.render.render(write_still=True)
if not png.is_file() or png.stat().st_size < 4000:
    raise RuntimeError("Native Cycles render missing")
# Editable candidate, separate from the exact original bytes.
candidate = out/"atlas-p1f-pavilion-01-B-J4.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(candidate), compress=True)
if not candidate.is_file() or candidate.stat().st_size < 100000:
    raise RuntimeError("Editable .blend candidate missing")
if digest(source) != original_sha:
    raise RuntimeError("Authenticated source overwritten after saving candidate")
# Web proof contains ONLY transformed roof, not original textures/scene/CC0 assets.
# This is a size test, NOT a publishable final glTF scene.
for obj in scene.objects:
    obj.select_set(False)
roof.select_set(True)
view.objects.active = roof
glb = out/"atlas-p1f-pavilion-01-roof-web-diagnostic.glb"
bpy.ops.export_scene.gltf(filepath=str(glb), export_format="GLB",
                          use_selection=True, export_animations=False,
                          export_materials="NONE")
if not glb.is_file() or glb.stat().st_size < 1024:
    raise RuntimeError("GLB structural diagnostic not created")
result = {
    "schema": "atlas.artdir02.p1f-pavilion-01/v1",
    "canonical_art_sha256": receipt["canonical_art_sha256"],
    "source": {"name": source.name, "sha256": original_sha},
    "source_unmodified": digest(source) == original_sha,
    "architecture": "single elongated superelliptic skylight in actual J4 roof mesh",
    "modeled_on_existing_roof_not_new_empty_scene": True,
    "shaping": {"exponent": SUPER_N, "major_scale": LENGTH_SCALE,
                "minor_scale": WIDTH_SCALE, "full_warp_radius_bu": FULL_WARP_R,
                "zero_warp_radius_bu": NO_WARP_R,
                "aperture_span_long_bu": major_span,
                "aperture_span_transverse_bu": minor_span,
                "opening_aspect_ratio": major_span/minor_span},
    "heights": {"upper_gallery_rise_nominal_bu": GALLERY_RISE,
                "roof_additional_rise_nominal_bu": CROWN_EXTRA,
                "upper_gallery_top_before_bu": upper_before,
                "upper_gallery_top_after_bu": z_bounds(upper)[1],
                "roof_top_before_bu": roof_before,
                "roof_top_after_bu": z_bounds(roof)[1]},
    "architecture_deformed_objects": len(cohort),
    "four_portal_centres_in_frame": centres,
    "original_first_floor_four_glasses_podium_preserved": True,
    "lights_unchanged": True,
    "finishing": {"blue_graphite_roof": roof_finish.name,
                  "blue_graphite_balconies": finish_members,
                  "candidate_camera_tilt_degrees": 6.0,
                  "candidate_camera_lens_ratio": .86,
                  "cycles_samples": 44, "denoising": True},
    "file": {"blend": {"name": candidate.name, "sha256": digest(candidate), "bytes": candidate.stat().st_size},
             "cycles": {"name": png.name, "sha256": digest(png), "bytes": png.stat().st_size},
             "roof_glb_diagnostic": {"name": glb.name, "sha256": digest(glb), "bytes": glb.stat().st_size,
                                     "under_5mb_target": glb.stat().st_size <= 5*1024*1024}},
    "art_approved": False, "web_scene_approved": False,
    "no_merge": True, "no_deploy": True, "no_student_data": True,
    "note": "Artistic reinterpretation, not exact reconstruction; GLB is only a roof geometry size specimen."
}
(out/"atlas-p1f-pavilion-01-receipt.json").write_text(
    json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print("ATLAS_P1F_PAVILION_GENERATED", json.dumps({
    "source": original_sha, "ratio": round(major_span/minor_span, 3),
    "upper": round(z_bounds(upper)[1],3), "roof":round(z_bounds(roof)[1],3),
    "glb_bytes":glb.stat().st_size, "candidate_sha256":result["file"]["blend"]["sha256"]
}), flush=True)
