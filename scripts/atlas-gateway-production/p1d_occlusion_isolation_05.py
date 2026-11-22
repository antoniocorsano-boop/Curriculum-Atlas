#!/usr/bin/env python3
"""ART-DIR-02 / P1D-VIS-05. Reversible oculus occluder ablation.
Runs four original Cycles/clay comparisons per qualified ARCH-A/B J3/J4,
plus original-material controls on J3. Never saves or edits source .blend.
"""
import bpy
import bmesh
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from collections import Counter
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def flag(k):
    if k not in args or args.index(k)+1>=len(args):raise RuntimeError("Missing "+k)
    return args[args.index(k)+1]
ARCH=flag("--arch").upper()
MODE=flag("--variant").upper()
OUT=Path(flag("--out")).resolve()
PRIOR=Path(flag("--receipt")).resolve()
VIS04=Path(flag("--vis04")).resolve()
if ARCH not in ("A","B") or MODE not in ("J3","J4"):raise RuntimeError("Invalid identity")
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
def digest(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for part in iter(lambda:f.read(1<<20),b""):h.update(part)
    return h.hexdigest()
old=json.loads(PRIOR.read_text(encoding="utf-8"))
last=json.loads(VIS04.read_text(encoding="utf-8"))
if SOURCE.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend":
    raise RuntimeError("Unexpected input model filename")
if old["arch"]!=ARCH or old["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1":
    raise RuntimeError("Original topology receipt invalid")
if digest(SOURCE)!=old["variants"][MODE]["editable_blend"]["sha256"]:
    raise RuntimeError("P1D-OCULUS-03 qualified binary mismatch")
if last["schema"]!="atlas.artdir02.p1d-visibility/v1" or last["arch"]!=ARCH:
    raise RuntimeError("Previous optical study identity invalid")
if last["structural_variant"]!=MODE or last["source_sha256"]!=digest(SOURCE):
    raise RuntimeError("P1D-VIS-04 receipt not associated with this model")
if old["art_approved"] or not old["no_merge"] or not old["no_deploy"]:
    raise RuntimeError("Source art governance invariant violated")
scene=bpy.context.scene
view=bpy.context.view_layer
def required(name):
    ob=bpy.data.objects.get(name)
    if ob is None:raise RuntimeError("Missing original object: "+name)
    return ob
camera=required("CAM_HERO_ARCH04")
rim=required(f"ARCH {ARCH} raised oculus rim")
roof=required(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
sky=required(f"ARCH {ARCH} raised sky opening")
collar=required("ATLAS R7 • one dark skylight collar")
if any(o.hide_render for o in [camera,sky,collar,roof]):
    raise RuntimeError("One or more candidate occluders unexpectedly hidden")
if not rim.hide_render:
    raise RuntimeError("The immutable original rim should be hidden in J3/J4")
if view.material_override is None:
    raise RuntimeError("Expected qualified neutral-clay material override")
original_scene_camera=scene.camera
original_settings=(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
                   scene.render.resolution_percentage,scene.render.image_settings.file_format,
                   scene.render.filepath,scene.cycles.samples)
overridden=view.material_override
initial_visibility={ob.name:bool(ob.hide_render) for ob in scene.objects}
original_camera_matrix=tuple(tuple(row) for row in camera.matrix_world)
original_camera_lens=(camera.data.lens,camera.data.shift_x,camera.data.shift_y,camera.data.sensor_width)
original_lights={o.name:(tuple(tuple(row) for row in o.matrix_world),o.data.energy) for o in scene.objects if o.type=="LIGHT"}
scene.camera=camera
scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.cycles.samples=14
scene.render.film_transparent=False
# World-space BVH snapshot of actually rendered original objects.
deps=bpy.context.evaluated_depsgraph_get()
all_bvh=[]
retained=[]
for ob in scene.objects:
    if ob.type not in ("MESH","CURVE","FONT","SURFACE") or ob.hide_render:
        continue
    if not ob.visible_get(view_layer=view):
        continue
    evaluated=ob.evaluated_get(deps)
    mesh=evaluated.to_mesh()
    if mesh is None:continue
    try:
        if not len(mesh.polygons):continue
        bm=bmesh.new()
        bm.from_mesh(mesh)
        bm.transform(evaluated.matrix_world)
        bm.normal_update()
        all_bvh.append((ob,BVHTree.FromBMesh(bm,epsilon=0.)))
        retained.append(bm)
    finally:
        evaluated.to_mesh_clear()
visible_names={o.name for o,_ in all_bvh}
for target in (sky,collar,roof):
    if target.name not in visible_names:
        raise RuntimeError("Target not represented by the actual visible geometry BVH "+target.name)
def trace(origin,direction,excluded):
    best=None
    distance=1.e12
    for ob,bvh in all_bvh:
        if ob.name in excluded:continue
        location,normal,face,d=bvh.ray_cast(origin,direction,distance)
        if location is not None and d is not None and d>1.e-6 and d<distance:
            best=ob.name
            distance=d
    return best
frame=camera.data.view_frame(scene=scene)
xmin=min(p.x for p in frame);xmax=max(p.x for p in frame)
ymin=min(p.y for p in frame);ymax=max(p.y for p in frame)
zplane=sum(p.z for p in frame)/len(frame)
matrix=camera.matrix_world.copy()
origin=matrix.translation.copy()
rotation=matrix.to_3x3()
def camera_ray(u,v):
    p=Vector((xmin+u*(xmax-xmin),ymin+v*(ymax-ymin),zplane))
    if camera.data.type=="ORTHO":
        return matrix@Vector((p.x,p.y,0)),(rotation@Vector((0,0,-1))).normalized()
    return origin,(rotation@p).normalized()
def bezier(a,b,c,d,t):
    q=1-t
    return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d
points=[]
for spline in rim.data.splines:
    if spline.type=="BEZIER":
        ps=list(spline.bezier_points)
        for i in range(len(ps) if spline.use_cyclic_u else len(ps)-1):
            a=ps[i];b=ps[(i+1)%len(ps)]
            for k in range(32):
                points.append(rim.matrix_world@bezier(a.co,a.handle_right,b.handle_left,b.co,k/32))
    elif spline.type in ("POLY","NURBS"):
        for p in spline.points:points.append(rim.matrix_world@Vector(p.co[:3]))
if len(points)<32:raise RuntimeError("Oculus polygon contour missing")
cx=statistics.mean(p.x for p in points)
cy=statistics.mean(p.y for p in points)
z=statistics.median(p.z for p in points)
if max(abs(p.z-z) for p in points)>.08:raise RuntimeError("Oculus plane not horizontal")
interior=[(cx+(p.x-cx)*.88,cy+(p.y-cy)*.88) for p in points]
def inside(px,py,poly):
    ok=False
    j=len(poly)-1
    for i in range(len(poly)):
        xi,yi=poly[i];xj,yj=poly[j]
        if (yi>py)!=(yj>py) and px<(xj-xi)*(py-yi)/(yj-yi)+xi:
            ok=not ok
        j=i
    return ok
def opening(u,v):
    o,d=camera_ray(u,v)
    if abs(d.z)<1.e-8:return False
    t=(z-o.z)/d.z
    if t<=1.e-5:return False
    p=o+t*d
    return inside(p.x,p.y,interior)
width,height=128,72
rays=[]
for y in range(height):
    v=(y+.5)/height
    for x in range(width):
        u=(x+.5)/width
        if opening(u,v):
            o,d=camera_ray(u,v)
            rays.append((u,v,o,d))
if len(rays)<24:raise RuntimeError("Sampling found no useful visible interior of oculus")
cases={
 "BASE":frozenset(),
 "SKY_HIDDEN":frozenset({sky.name}),
 "COLLAR_HIDDEN":frozenset({collar.name}),
 "BOTH_HIDDEN":frozenset({sky.name,collar.name}),
}
ray_results={}
for case,exclusion in cases.items():
    hits=[trace(o,d,exclusion) for u,v,o,d in rays]
    counts=Counter(name for name in hits if name is not None)
    clear=sum(item is None for item in hits)
    ray_results[case]={"sample_count":len(rays),"clear_count":clear,
      "clear_fraction":clear/len(rays),
      "hit_objects":dict(counts.most_common(16))}
    print("VIS05_RAY_CASE",ARCH,MODE,case,"CLEAR",clear,"TOTAL",len(rays),
          "HITS",dict(counts.most_common(6)),flush=True)
base=ray_results["BASE"]
expected=last["oculus"]
if base["sample_count"]!=expected["samples_in_image"] or base["clear_count"]!=round(expected["sky_unobstructed_fraction"]*len(rays)):
    raise RuntimeError("Baseline optical ablation differs from independently qualified P1D-VIS-04")
if base["hit_objects"]!=expected["first_hit_object_counts"]:
    raise RuntimeError("Baseline first-hit object evidence diverges from qualified study")
if ray_results["BOTH_HIDDEN"]["clear_count"]<ray_results["SKY_HIDDEN"]["clear_count"] or ray_results["BOTH_HIDDEN"]["clear_count"]<ray_results["COLLAR_HIDDEN"]["clear_count"]:
    raise RuntimeError("Removing more occluders unexpectedly reduces unobstructed sky")
if ray_results["SKY_HIDDEN"]["clear_count"]<base["clear_count"] or ray_results["COLLAR_HIDDEN"]["clear_count"]<base["clear_count"]:
    raise RuntimeError("Monotonic occlusion invariant violated")
# A provenance audit: which materials are intended for these two shapes?
def material_info(ob):
    ms=[]
    for slot in ob.material_slots:
        m=slot.material
        if m is None:continue
        item={"name":m.name,"use_nodes":m.use_nodes,"diffuse_color":list(m.diffuse_color),
              "surface_render_method":getattr(m,"surface_render_method",None),
              "node_types":sorted({n.bl_idname for n in m.node_tree.nodes}) if m.use_nodes and m.node_tree else []}
        ms.append(item)
    return {"name":ob.name,"object_type":ob.type,"materials":ms,
       "render_visibility_initial":not initial_visibility[ob.name],
       "dimensions_world_approx":list(ob.dimensions)}
def output_image(case,materials):
    for o in (sky,collar):
        o.hide_render=o.name in cases[case]
    view.material_override=overridden if materials=="CLAY" else None
    view.update()
    label=f"atlas-p1d-vis-05-{ARCH}-{MODE}-{case}-{materials}.png"
    outfile=OUT/label
    scene.render.filepath=str(outfile)
    bpy.ops.render.render(write_still=True)
    if not outfile.is_file() or outfile.stat().st_size<1200:
        raise RuntimeError("Missing real Cycles image "+label)
    img=bpy.data.images.load(str(outfile),check_existing=False)
    try:
        if tuple(img.size)!=(960,540):raise RuntimeError("Unexpected image resolution")
        pixel=img.pixels
        val=[]
        for u,v,o,d in rays:
            x=min(959,max(0,int(u*960)))
            y=min(539,max(0,int(v*540)))
            k=4*(y*960+x)
            val.append(.2126*pixel[k]+.7152*pixel[k+1]+.0722*pixel[k+2])
        photometry={"mean_linear_rgb_proxy":statistics.mean(val),
             "median_linear_rgb_proxy":statistics.median(val),
             "min_linear_rgb_proxy":min(val),
             "max_linear_rgb_proxy":max(val),
             "sample_count":len(val)}
    finally:
        bpy.data.images.remove(img)
    return {"file":label,"sha256":digest(outfile),"bytes":outfile.stat().st_size,
            "photometry":photometry}
pictures={}
for case in cases:
    pictures[case]={"CLAY":output_image(case,"CLAY")}
# On J3, test original materials without altering any source shader, camera,
# lights or world. Only clear the view-layer override temporarily.
if MODE=="J3":
    for case in ("BASE","BOTH_HIDDEN"):
        pictures[case]["ORIGINAL_MATERIALS"]=output_image(case,"ORIGINAL_MATERIALS")
for ob in (sky,collar):ob.hide_render=initial_visibility[ob.name]
view.material_override=overridden
view.update()
if any(bool(o.hide_render)!=initial_visibility[o.name] for o in scene.objects):
    raise RuntimeError("Temporary object visibility was not restored")
if tuple(tuple(row) for row in camera.matrix_world)!=original_camera_matrix:
    raise RuntimeError("Camera was changed")
if (camera.data.lens,camera.data.shift_x,camera.data.shift_y,camera.data.sensor_width)!=original_camera_lens:
    raise RuntimeError("Camera optics were changed")
if original_lights!={o.name:(tuple(tuple(row) for row in o.matrix_world),o.data.energy) for o in scene.objects if o.type=="LIGHT"}:
    raise RuntimeError("Lights were changed")
if digest(SOURCE)!=old["variants"][MODE]["editable_blend"]["sha256"]:
    raise RuntimeError("Original immutable Blender file changed")
report={
 "schema":"atlas.artdir02.p1d-isolation/v1",
 "arch":ARCH,"variant":MODE,
 "source_blend_sha256":digest(SOURCE),
 "parent_vis04_schema":last["schema"],
 "parent_vis04_run_id":45009992250,
 "reference_art_sha256":old["canonical_art_sha256"],
 "camera_unchanged":True,"world_unchanged":True,
 "lights_unchanged":True,"materials_original_unchanged":True,
 "original_scene_not_saved":True,"target_objects_only_hidden_temporarily":True,
 "source_files_untouched":True,"sky_surface":material_info(sky),
 "dark_collar":material_info(collar),
 "sample_definition":"Camera-perspective 128 x 72 centers intersect the genuine original oculus inner 0.88 XY contour at median Z",
 "clay_comparison_ray_cases":ray_results,
 "renderings":pictures,
 "prior_vis04_baseline_reproduced":True,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "interpretation":"Reversible diagnostic isolation: disappearing sky-cap geometry is not approval for permanent removal; original-material images are uncalibrated."
}
outfile=OUT/f"atlas-p1d-vis-05-{ARCH}-{MODE}-receipt.json"
outfile.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
for bm in retained:bm.free()
print("VIS05_ISOLATION_COMPLETE",ARCH,MODE,
      json.dumps({k:v["clear_count"] for k,v in ray_results.items()}),flush=True)
