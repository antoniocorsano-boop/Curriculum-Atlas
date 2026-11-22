#!/usr/bin/env python3
"""ART-DIR-02 P1D: constructive, reversible clay candidates from immutable P1B.
Build a new smooth vault and two real-depth galleries; never resculpt P1B meshes.
The canonical synthetic image is an artistic target, not a camera calibration.
"""
import bpy
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if "--out" not in argv:
    raise RuntimeError("P1D requires --out")
OUT = Path(argv[argv.index("--out") + 1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(bpy.data.filepath)
P1B_SHA = "e16fa837ea85d27eff225c3a4e4fc8ff63e00a298a597d8710d32d3536351c7c"
ART_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as stream:
        for part in iter(lambda: stream.read(1048576), b""):
            h.update(part)
    return h.hexdigest()

if SOURCE.name != "atlas-art-dir02-p1b-multianchor-clay.blend" or digest(SOURCE) != P1B_SHA:
    raise RuntimeError("P1D source must be exactly archived P1B Blender binary")

scene = bpy.context.scene
def required(name):
    obj = bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError("Required preserved P1B object missing: " + name)
    return obj

hero = required("CAM_HERO_ARCH04")
control = required("ATLAS_P1_PARAMETRIC_CONTROL")
rim = required("ATLAS R7 • ONE golden oculus light seam")
sky = required("OCULUS ARCH04 • visible open sky")
upper = required("ARCH04 • second gallery handrail")
lower = required("ARCH04 • first gallery handrail")
podium = required("ATLAS ARCH04 • low elliptical convex canopy")
names = ("Curricolo", "Esplora", "Percorsi", "Esperienze")
portals = [required("Portale • " + name) for name in names]
panes = [required(name + " • vetro cobalto") for name in names]
bases = [o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
sources = [c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases) != 4 or len(sources) != 3:
    raise RuntimeError("Four portal bases and three source collections required")
if not bpy.context.view_layer.material_override:
    raise RuntimeError("P1B clay override must be retained")
scene.camera = hero

def sample(obj, limit=1200):
    if obj.type == "MESH":
        vertices = list(obj.data.vertices)
        step = max(1, len(vertices) // limit)
        return [obj.matrix_world @ v.co for v in vertices[::step]]
    if obj.type == "CURVE":
        coords = []
        for spline in obj.data.splines:
            if spline.type == "BEZIER":
                coords.extend(obj.matrix_world @ p.co for p in spline.bezier_points)
            else:
                coords.extend(obj.matrix_world @ Vector(p.co[:3]) for p in spline.points)
        return coords[::max(1, len(coords) // limit)]
    return [obj.matrix_world @ Vector(v) for v in obj.bound_box]

rim_pts = sample(rim, 2000)
upper_pts = sample(upper, 2000)
lower_pts = sample(lower, 2000)
if min(len(rim_pts), len(upper_pts), len(lower_pts)) < 3:
    raise RuntimeError("No measured real ring or gallery control geometry")
cx = statistics.median(p.x for p in rim_pts)
cy = statistics.median(p.y for p in rim_pts)
ring_z = statistics.median(p.z for p in rim_pts)
ring_r = statistics.median(math.hypot(p.x - cx, p.y - cy) for p in rim_pts)
upper_z = statistics.median(p.z for p in upper_pts)
lower_z = statistics.median(p.z for p in lower_pts)
def median_radius(points):
    return statistics.median(math.hypot(p.x-cx, p.y-cy) for p in points)
upper_r = median_radius(upper_pts)
lower_r = median_radius(lower_pts)
if not (ring_r > .1 and ring_z > upper_z > lower_z and upper_r > .1 and lower_r > .1):
    raise RuntimeError("Invalid physical hierarchy in source scene")

camera_original = (tuple(hero.matrix_world), hero.data.lens, hero.data.shift_y)
all_locked = portals + panes + bases + [rim, sky, podium]
locked_matrices = {o.name: tuple(o.matrix_world) for o in all_locked}
locked_meshes = {o.name: (len(o.data.vertices), len(o.data.polygons))
                 for o in all_locked if o.type == "MESH"}
# These are only hidden in each derived P1D view: no source vertices are deleted.
hide_candidates = [
    o for o in scene.objects
    if o.name.startswith("ATLAS R7 • continuous dark rear vault")
    or o.name in (upper.name, lower.name)
]
hidden_before = {o.name: o.hide_render for o in hide_candidates}
for obj in hide_candidates:
    obj.hide_render = True

def collection(name):
    c = bpy.data.collections.new(name)
    scene.collection.children.link(c)
    return c

def mesh_obj(name, vertices, faces, target):
    mesh = bpy.data.meshes.new(name + " mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    target.objects.link(obj)
    for poly in mesh.polygons:
        poly.use_smooth = True
    return obj

def add_vault(target, drop, outer_radius):
    n_angle, n_radial = 128, 32
    inner = ring_r * 1.035
    verts, faces = [], []
    for j in range(n_radial + 1):
        t = j / n_radial
        radial = inner + (outer_radius - inner)*t
        # Genuine smooth domed profile, not straight roof slopes or z-warp.
        curvature = math.sin(.5*math.pi*t)**1.55
        for i in range(n_angle + 1):
            theta = 2*math.pi*i/n_angle
            x = cx + radial*math.cos(theta)
            y = cy + radial*math.sin(theta)*.92
            z = ring_z - drop*curvature
            z -= .055*drop*t*t*math.cos(2*theta)
            verts.append((x, y, z))
    for j in range(n_radial):
        for i in range(n_angle):
            a = j*(n_angle+1)+i
            faces.append((a, a+1, a+1+n_angle+1, a+n_angle+1))
    obj = mesh_obj("P1D • continuous curved vault", verts, faces, target)
    return obj, {"radial_sections": n_radial+1, "angular_sections": n_angle,
                 "inner_radius_bu": inner, "outer_radius_bu": outer_radius,
                 "oculus_join_z_bu": ring_z, "perimeter_z_bu": ring_z-drop,
                 "drop_bu": drop, "mesh_verts": len(verts), "faces": len(faces),
                 "profile_z_bu": [ring_z-drop*(math.sin(.5*math.pi*t)**1.55)
                                  for t in (.0, .25, .5, .75, 1.)]}

def ring_segment(target, name, radius, radial_thickness, bottom, height, aspect=.92):
    # A real 3D curved annular beam/parapet, with top, bottom and side faces.
    n = 80
    a0, a1 = 0., math.pi
    inner = radius - radial_thickness/2
    outer = radius + radial_thickness/2
    verts = []
    for ringradius, z in ((inner,bottom), (outer,bottom),
                          (inner,bottom+height), (outer,bottom+height)):
        for j in range(n+1):
            theta = a0 + (a1-a0)*j/n
            verts.append((cx+ringradius*math.cos(theta),
                          cy+aspect*ringradius*math.sin(theta),z))
    k = n+1
    faces = []
    for j in range(n):
        faces.extend([
            (j,j+1,k+j+1,k+j),
            (2*k+j,3*k+j,3*k+j+1,2*k+j+1),
            (j,2*k+j,2*k+j+1,j+1),
            (k+j,k+j+1,3*k+j+1,3*k+j)])
    faces.extend([(0,k,3*k,2*k),
                  (n,2*k+n,3*k+n,k+n)])
    return mesh_obj(name, verts, faces, target)

def gallery(target, code, label, source_radius, at_z, beam_depth):
    radial = max(ring_r*1.16, min(ring_r*1.85, source_radius))
    beam = ring_segment(target, "P1D • " + code + " " + label + " curved slab",
                        radial, beam_depth, at_z-.21, .21)
    glass = ring_segment(target, "P1D • " + code + " " + label + " railing",
                         radial-beam_depth*.42, .08, at_z, .65)
    return {"radius_bu": radial, "surface_z_bu":at_z,
            "depth_bu":beam_depth, "beam_vertices":len(beam.data.vertices),
            "railing_vertices":len(glass.data.vertices)}

def projections(obj):
    pts = [(v.x,1-v.y) for v in (world_to_camera_view(scene,hero,p)
                                for p in sample(obj,400))]
    return {"left":min(p[0] for p in pts), "right":max(p[0] for p in pts),
            "top":min(p[1] for p in pts), "bottom":max(p[1] for p in pts)}

portal_baseline = {name:projections(obj) for name,obj in zip(names,panes)}
rim_baseline = projections(rim)
podium_baseline = projections(podium)
scene.render.engine = "CYCLES"
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
bpy.context.view_layer.cycles.use_denoising = True
scene.cycles.samples = 12

def render(name, camera, width, height):
    scene.camera = camera
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    out = OUT / (name + ".png")
    scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    if out.stat().st_size < 12000:
        raise RuntimeError("Invalid actual Cycles rendering " + name)
    return {"name":out.name, "sha256":digest(out),
            "bytes":out.stat().st_size, "size":[width,height]}

def verify():
    bpy.context.view_layer.update()
    if (tuple(hero.matrix_world), hero.data.lens, hero.data.shift_y) != camera_original:
        raise RuntimeError("P1D camera drift")
    for ob in all_locked:
        if tuple(ob.matrix_world) != locked_matrices[ob.name]:
            raise RuntimeError("P1D changed locked anchor " + ob.name)
        if ob.name in locked_meshes:
            if (len(ob.data.vertices),len(ob.data.polygons)) != locked_meshes[ob.name]:
                raise RuntimeError("P1D changed locked anchor mesh " + ob.name)
    if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]) != 3:
        raise RuntimeError("P1D lost CC0 source collections")
    def drift(before,after):
        return max(abs(before[k]-after[k]) for k in ("left","right","top","bottom"))
    pdrift = max(drift(portal_baseline[n],projections(obj)) for n,obj in zip(names,panes))
    rdrift = drift(rim_baseline,projections(rim))
    ddrift = drift(podium_baseline,projections(podium))
    if max(pdrift,rdrift,ddrift) > 1e-7:
        raise RuntimeError("P1D projection drift of locked architectural anchors")
    return {"portal_max_drift":pdrift,"oculus_max_drift":rdrift,
            "podium_max_drift":ddrift,"four_bases":len(bases),
            "three_CC0_collections":len(sources),
            "camera_unchanged":True,"source_meshes_preserved":True}

# Create two independent editable candidates, without declaring either approved.
outer = max(ring_r*1.48, min(ring_r*2.0, max(upper_r,lower_r)*1.13))
clearance = ring_z-upper_z
variants = {}
for code, roof_ratio, gallery_lift, slab_depth in (
        ("A", .54, .26, .78), ("B", .72, .46, 1.08)):
    target = collection("P1D • " + code + " constructive geometry")
    drop = min(clearance*.75, max(1.15, (outer-ring_r)*roof_ratio))
    vault, vault_info = add_vault(target,drop,outer)
    new_upper_z = min(ring_z-.85, upper_z+gallery_lift)
    new_lower_z = lower_z
    levels = {
        "upper":gallery(target,code,"upper",upper_r,new_upper_z,slab_depth),
        "lower":gallery(target,code,"lower",lower_r,new_lower_z,slab_depth*.95)}
    if new_upper_z <= new_lower_z + .8 or drop <= 0.:
        raise RuntimeError("P1D gallery hierarchy or vault drop invalid")
    q = verify()
    cycled = render("atlas-p1d-"+code+"-HERO",hero,1152,648)
    control["P1D_last_variant"] = code
    control["P1D_vault_drop_bu"] = drop
    control["P1D_outer_radius_bu"] = outer
    control["P1D_upper_gallery_lift_bu"] = new_upper_z-upper_z
    control["P1D_gallery_slab_depth_bu"] = slab_depth
    control["P1D_state"] = "GEOMETRY_CANDIDATE__ART_APPROVAL_REQUIRED"
    control["P1D_source_p1b_sha256"] = P1B_SHA
    control["P1D_method"] = "constructive curved meshing; source P1B surfaces retained"
    scene.camera = hero
    model = OUT / ("atlas-art-dir02-p1d-"+code+"-constructive.blend")
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(model))
    variants[code] = {
        "vault":vault_info,"galleries":levels,
        "gallery_level_separation_bu":new_upper_z-new_lower_z,
        "integrity":q,"render":cycled,
        "blend":{"name":model.name,"sha256":digest(model),"bytes":model.stat().st_size},
        "rendered_from_real_blender":True}
    for ob in list(target.objects):
        mesh = ob.data
        bpy.data.objects.remove(ob,do_unlink=True)
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    bpy.data.collections.remove(target)

for obj in hide_candidates:
    obj.hide_render = hidden_before[obj.name]
scene.camera = hero
receipt = {
    "schema":"atlas.artdir02.p1d-constructive/v1",
    "state":"REAL_EDITABLE_CANDIDATES__ART_REVIEW_REQUIRED",
    "source_p1b_sha256":digest(SOURCE),
    "art_reference_sha256":ART_SHA,
    "ring":{"center":[cx,cy,ring_z],"radius_bu":ring_r},
    "source_galleries":{"upper_radius_bu":upper_r,"lower_radius_bu":lower_r,
                        "upper_z_bu":upper_z,"lower_z_bu":lower_z},
    "original_hidden_in_derived_render":[o.name for o in hide_candidates],
    "variants":variants,"human_art_approved":False,"no_merge":True,
    "no_deploy":True,"hotspot_revalidation_required":True,
    "synthetic_perspective_warning":True}
(OUT/"atlas-p1d-constructive-receipt.json").write_text(
    json.dumps(receipt,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_P1D_TRUE_BLENDER_COMPLETE", json.dumps({
    "variants":list(variants),"ring_radius_bu":ring_r,
    "source_gallery_difference_bu":upper_z-lower_z,
    "source_SHA":P1B_SHA, "human_art_approved":False}))
