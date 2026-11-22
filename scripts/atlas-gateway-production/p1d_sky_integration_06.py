#!/usr/bin/env python3
"""P1D-SKY-06 — Controlled, reversible original-texture vaulted sky vs procedural atmosphere.
Qualifies authentic A/B x J3/J4 .blend assets without persisting any source changes.
"""
import bpy
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from collections import Counter
from mathutils import Vector
from mathutils.bvhtree import BVHTree

argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def opt(name):
    if name not in argv or argv.index(name)+1>=len(argv):
        raise RuntimeError("Missing argument "+name)
    return argv[argv.index(name)+1]
ARCH=opt("--arch").upper()
MODE=opt("--variant").upper()
OUT=Path(opt("--out")).resolve()
P1D=Path(opt("--oculus-receipt")).resolve()
P5=Path(opt("--vis05-receipt")).resolve()
if ARCH not in ("A","B") or MODE not in ("J3","J4"):
    raise RuntimeError("Unknown qualified architecture/structural mode")
OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
def digest(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):h.update(chunk)
    return h.hexdigest()
o=json.loads(P1D.read_text(encoding="utf8"))
p=json.loads(P5.read_text(encoding="utf8"))
if SRC.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend":
    raise RuntimeError("Not a qualified source file")
if o["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or o["arch"]!=ARCH:
    raise RuntimeError("Invalid geometric parent evidence")
if digest(SRC)!=o["variants"][MODE]["editable_blend"]["sha256"]:
    raise RuntimeError("P1D-OCULUS-03 source SHA does not match")
if p["schema"]!="atlas.artdir02.p1d-isolation/v1" or p["arch"]!=ARCH or p["variant"]!=MODE:
    raise RuntimeError("Invalid optical parent evidence")
if p["source_blend_sha256"]!=digest(SRC) or not p["prior_vis04_baseline_reproduced"]:
    raise RuntimeError("Optical evidence belongs to a different binary")
if not p["no_merge"] or not p["no_deploy"] or p["art_approved"]:
    raise RuntimeError("Parent governance inconsistent")
scene=bpy.context.scene
view=bpy.context.view_layer
def obj(name):
    o=bpy.data.objects.get(name)
    if o is None:raise RuntimeError("Missing original component "+name)
    return o
cam=obj("CAM_HERO_ARCH04")
rim=obj(f"ARCH {ARCH} raised oculus rim")
sky=obj(f"ARCH {ARCH} raised sky opening")
collar=obj("ATLAS R7 • one dark skylight collar")
roof=obj(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
if cam.type!="CAMERA" or rim.type!="CURVE" or sky.type!="MESH":
    raise RuntimeError("Unexpected original architectural object types")
if sky.hide_render or collar.hide_render or roof.hide_render or not rim.hide_render:
    raise RuntimeError("Wrong source rendering state")
if view.material_override is None:
    raise RuntimeError("Neutral inherited source view layer expected")
if not sky.material_slots or not sky.material_slots[0].material:
    raise RuntimeError("No original emission sky material")
sourcemat=sky.material_slots[0].material
if not sourcemat.use_nodes or not any(n.type=="EMISSION" for n in sourcemat.node_tree.nodes):
    raise RuntimeError("Existing sky is not an emissive original-image screen")
if not any(n.type=="TEX_IMAGE" and n.image is not None for n in sourcemat.node_tree.nodes):
    raise RuntimeError("Existing sky texture not packed in .blend")
original_sha=digest(SRC)
original_camera=scene.camera
camera_matrix=tuple(tuple(row) for row in cam.matrix_world)
camera_settings=(cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width)
original_lights={x.name:(x.data.energy,tuple(tuple(row) for row in x.matrix_world)) for x in scene.objects if x.type=="LIGHT"}
old_world=scene.world
old_override=view.material_override
old_visibility={x.name:bool(x.hide_render) for x in scene.objects}
original_objects=set(scene.objects.keys())
original_settings={
 "engine":scene.render.engine,
 "resolution_x":scene.render.resolution_x,
 "resolution_y":scene.render.resolution_y,
 "resolution_pct":scene.render.resolution_percentage,
 "samples":scene.cycles.samples,
 "filepath":scene.render.filepath,
 "file_format":scene.render.image_settings.file_format,
 "transparent":scene.render.film_transparent
}
scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.cycles.samples=14
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
view.material_override=None
view.update()
# Sample original aperture exactly as the qualified VIS-04 and VIS-05 cameras did.
frame=cam.data.view_frame(scene=scene)
xmin=min(v.x for v in frame);xmax=max(v.x for v in frame)
ymin=min(v.y for v in frame);ymax=max(v.y for v in frame)
zfr=sum(v.z for v in frame)/len(frame)
origin=cam.matrix_world.translation.copy()
camera_rot=cam.matrix_world.to_3x3()
def camera_ray(u,v):
    q=Vector((xmin+u*(xmax-xmin),ymin+v*(ymax-ymin),zfr))
    if cam.data.type=="ORTHO":
        return cam.matrix_world@Vector((q.x,q.y,0)),(camera_rot@Vector((0,0,-1))).normalized()
    return origin,(camera_rot@q).normalized()
def bz(a,b,c,d,t):
    s=1-t
    return s*s*s*a+3*s*s*t*b+3*s*t*t*c+t*t*t*d
rimpts=[]
for sp in rim.data.splines:
    if sp.type=="BEZIER":
        x=list(sp.bezier_points)
        for i in range(len(x) if sp.use_cyclic_u else len(x)-1):
            aa=x[i];bb=x[(i+1)%len(x)]
            for k in range(32):
                rimpts.append(rim.matrix_world@bz(aa.co,aa.handle_right,bb.handle_left,bb.co,k/32))
    elif sp.type in ("POLY","NURBS"):
        for pt in sp.points:rimpts.append(rim.matrix_world@Vector(pt.co[:3]))
if len(rimpts)<32:raise RuntimeError("Unable to reconstruct original oculus silhouette")
cx=statistics.mean(pt.x for pt in rimpts)
cy=statistics.mean(pt.y for pt in rimpts)
rimz=statistics.median(pt.z for pt in rimpts)
if max(abs(pt.z-rimz) for pt in rimpts)>.08:
    raise RuntimeError("Oculus rim moved unexpectedly")
contour=[(cx+(pt.x-cx)*.88,cy+(pt.y-cy)*.88) for pt in rimpts]
def inpoly(x,y,poly):
    inside=False;j=len(poly)-1
    for i in range(len(poly)):
        xa,ya=poly[i];xb,yb=poly[j]
        if (ya>y)!=(yb>y) and x<(xb-xa)*(y-ya)/(yb-ya)+xa:
            inside=not inside
        j=i
    return inside
rays=[]
for row in range(72):
    v=(row+.5)/72
    for col in range(128):
        u=(col+.5)/128
        start,unit=camera_ray(u,v)
        if abs(unit.z)<1e-9:continue
        t=(rimz-start.z)/unit.z
        if t<=1e-5:continue
        inter=start+t*unit
        if inpoly(inter.x,inter.y,contour):
            rays.append((u,v,start,unit))
assert len(rays)==p["clay_comparison_ray_cases"]["BASE"]["sample_count"],"Original aperture sampling no longer matches"
# Build a new procedurally tessellated shallow dome at a recessed depth, mapping
# the *same original cloud image emission material* to a curved surface.
# The original sky disk is hidden temporarily; no source mesh data is altered.
worldpoints=[sky.matrix_world@Vector(corner) for corner in sky.bound_box]
skycenter=Vector((statistics.mean(x.x for x in worldpoints),
                  statistics.mean(x.y for x in worldpoints),
                  statistics.mean(x.z for x in worldpoints)))
sky_extent=max(sky.dimensions.x,sky.dimensions.y)/2
if abs(skycenter.x-cx)>1.0 or abs(skycenter.y-cy)>1.0:
    raise RuntimeError("Sky screen not co-registered with original oculus")
R=sky_extent*1.55
base_z=max(skycenter.z,rimz)+1.3
lift=1.65
S=80;N=14
verts=[(cx,cy,base_z+lift)]
faces=[]
uvsets=[]
for ring in range(1,N+1):
    r=R*ring/N
    for a in range(S):
        theta=2*math.pi*a/S
        verts.append((cx+r*math.cos(theta),cy+r*math.sin(theta),
                      base_z+lift*(1-(r/R)**2)))
for a in range(S):
    faces.append((0,1+(a+1)%S,1+a))
for ring in range(1,N):
    inner=1+(ring-1)*S
    outer=1+ring*S
    for a in range(S):
        j=(a+1)%S
        faces.append((inner+a,inner+j,outer+j,outer+a))
mesh=bpy.data.meshes.new("P1D-SKY-06 generated curved sky mesh")
mesh.from_pydata(verts,[],faces)
mesh.update(calc_edges=True)
mesh.materials.append(sourcemat)
uv=mesh.uv_layers.new(name="CloudImageUV")
for poly in mesh.polygons:
    for loop_index in poly.loop_indices:
        co=mesh.vertices[mesh.loops[loop_index].vertex_index].co
        uv.data[loop_index].uv=((co.x-cx)/(2*R)+.5,(co.y-cy)/(2*R)+.5)
dome=bpy.data.objects.new(f"ATLAS {ARCH} {MODE} SKY06 curved original emission sky",mesh)
bpy.context.scene.collection.objects.link(dome)
dome.hide_render=True
# Atmospheric alternative: use a separate copy of the world with a
# physically-based Nishita sky; this changes world illumination *by design*.
atmos=(old_world.copy() if old_world else bpy.data.worlds.new("P1D SKY06 atmosphere"))
atmos.name=f"ATLAS {ARCH} {MODE} SKY06 atmospheric test world"
atmos.use_nodes=True
nodes=atmos.node_tree.nodes
nodes.clear()
s=nodes.new("ShaderNodeTexSky")
s.sky_type="HOSEK_WILKIE"
s.sun_elevation=math.radians(28)
s.sun_rotation=math.radians(155)
s.turbidity=2.4
s.ground_albedo=0.25
background=nodes.new("ShaderNodeBackground")
background.inputs["Strength"].default_value=0.8
output=nodes.new("ShaderNodeOutputWorld")
atmos.node_tree.links.new(s.outputs["Color"],background.inputs["Color"])
atmos.node_tree.links.new(background.outputs["Background"],output.inputs["Surface"])
# Control image derived from each case with identical camera, optics,
# exposure and render samples. No new lamp or material modification.
cases={
 "BASE":{"original_sky":True,"curved_sky":False,"collar":True,"atmosphere":False},
 "CURVED_CLOUD":{"original_sky":False,"curved_sky":True,"collar":True,"atmosphere":False},
 "ATMOSPHERE_RING":{"original_sky":False,"curved_sky":False,"collar":True,"atmosphere":True},
 "ATMOSPHERE_OPEN":{"original_sky":False,"curved_sky":False,"collar":False,"atmosphere":True}
}
def bvh_from_object(ob):
    deps=bpy.context.evaluated_depsgraph_get()
    eval_ob=ob.evaluated_get(deps)
    return BVHTree.FromObject(eval_ob,deps)
curved_tree=bvh_from_object(dome)
dome_hits=sum(curved_tree.ray_cast(start,direction)[0] is not None
              for u,v,start,direction in rays)
if dome_hits/len(rays)<.9:
    raise RuntimeError(f"Recessed cloud dome missed oculus sample rays: {dome_hits}/{len(rays)}")
# Render plus reproducible comparison photometry: read actual completed PNG.
results={}
for tag,cfg in cases.items():
    sky.hide_render=not cfg["original_sky"]
    collar.hide_render=not cfg["collar"]
    dome.hide_render=not cfg["curved_sky"]
    scene.world=atmos if cfg["atmosphere"] else old_world
    view.update()
    filename=f"atlas-p1d-sky-06-{ARCH}-{MODE}-{tag}.png"
    file=OUT/filename
    scene.render.filepath=str(file)
    bpy.ops.render.render(write_still=True)
    if not file.is_file() or file.stat().st_size<1200:
        raise RuntimeError("Cycles rendering was not saved: "+filename)
    image=bpy.data.images.load(str(file),check_existing=False)
    try:
        if tuple(image.size)!=(960,540):
            raise RuntimeError("Cycles resolution mismatch")
        pixels=image.pixels
        vals=[]
        for u,v,start,direction in rays:
            px=min(959,max(0,int(u*960)))
            py=min(539,max(0,int(v*540)))
            i=4*(py*960+px)
            vals.append(.2126*pixels[i]+.7152*pixels[i+1]+.0722*pixels[i+2])
        mean=statistics.mean(vals)
        median=statistics.median(vals)
        std=statistics.pstdev(vals)
        bright=sum(x>.3 for x in vals)/len(vals)
        phot={"samples":len(vals),"mean_linear_rgb_proxy":mean,
              "median_linear_rgb_proxy":median,
              "stddev_linear_rgb_proxy":std,"fraction_above_0_3":bright}
    finally:
        bpy.data.images.remove(image)
    results[tag]={"image":filename,"sha256":digest(file),"bytes":file.stat().st_size,
                  "configuration":cfg,"oculus_photometry":phot}
    print("SKY06_CYCLES_CASE",ARCH,MODE,tag,
          "SAMPLES",len(rays),"LUMINANCE",round(mean,5),
          "STD",round(std,5),flush=True)
# Strict provenance: no permanent changes to four source .blend files or
# original geometry/material data. Clear test objects and restore the view.
sky.hide_render=old_visibility[sky.name]
collar.hide_render=old_visibility[collar.name]
view.material_override=old_override
scene.world=old_world
scene.camera=original_camera
scene.render.engine=original_settings["engine"]
scene.render.resolution_x=original_settings["resolution_x"]
scene.render.resolution_y=original_settings["resolution_y"]
scene.render.resolution_percentage=original_settings["resolution_pct"]
scene.cycles.samples=original_settings["samples"]
scene.render.filepath=original_settings["filepath"]
scene.render.image_settings.file_format=original_settings["file_format"]
scene.render.film_transparent=original_settings["transparent"]
bpy.data.objects.remove(dome,do_unlink=True)
bpy.data.meshes.remove(mesh)
bpy.data.worlds.remove(atmos)
view.update()
if set(scene.objects.keys())!=original_objects:
    raise RuntimeError("The test left a new object in the original scene")
if any(bool(ob.hide_render)!=old_visibility[ob.name] for ob in scene.objects):
    raise RuntimeError("Original object rendering visibility changed")
if tuple(tuple(row) for row in cam.matrix_world)!=camera_matrix or (
    cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width)!=camera_settings:
    raise RuntimeError("Camera or optics modified")
if original_lights!={x.name:(x.data.energy,tuple(tuple(row) for row in x.matrix_world)) for x in scene.objects if x.type=="LIGHT"}:
    raise RuntimeError("Original lamps modified")
if scene.world!=old_world or view.material_override!=old_override:
    raise RuntimeError("Original world or original clay override not restored")
if digest(SRC)!=original_sha:
    raise RuntimeError("Original on-disk .blend mutated")
refmean=p["renderings"]["BASE"].get("ORIGINAL_MATERIALS")
baseline_reference=(refmean["photometry"]["mean_linear_rgb_proxy"] if refmean else None)
if baseline_reference is not None and abs(results["BASE"]["oculus_photometry"]["mean_linear_rgb_proxy"]-baseline_reference)>.10:
    raise RuntimeError("BASE rendering has not reproduced the prior material study")
report={
 "schema":"atlas.artdir02.p1d-sky-integration/v1",
 "arch":ARCH,"structural_variant":MODE,
 "source_sha256":original_sha,
 "parent_vis05_run":45013050852,
 "parent_vis05_receipt_schema":p["schema"],
 "canonical_art_sha256":o["canonical_art_sha256"],
 "camera_and_exposure_original_unchanged":True,
 "fixed_original_lamps":True,
 "world_altered_only_in_atmosphere_cases":True,
 "test_mesh_created_and_removed":True,
 "original_source_saved":False,
 "original_sky_emission_shader_untouched":True,
 "original_collar_untouched":True,
 "J3_J4_original_roof_untouched":True,
 "cloud_shader":sourcemat.name,
 "cloud_texture_images":[n.image.name for n in sourcemat.node_tree.nodes if n.type=="TEX_IMAGE" and n.image],
 "curved_sky":{"radius_bu":R,"base_z_bu":base_z,"zenith_z_bu":base_z+lift,
   "center_xy":[cx,cy],"sample_rays_hitting_curved_sky_geometry":dome_hits,
   "total_sample_rays":len(rays)},
 "atmosphere":{"engine":"Hosek-Wilkie procedural sky", "sky_type":"HOSEK_WILKIE",
    "sun_elevation_degrees":28,"sun_rotation_degrees":155,
    "world_background_strength":0.8,
    "same_original_lamps":True},
 "render_cases":results,
 "baseline_visual_mean_vis05":baseline_reference,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "interpretation":"Controlled comparison not final art; curved sky changes screen mesh/position, atmosphere cases change world radiance. Luminosity metrics compare render PNG, not physical lux."
}
jfile=OUT/f"atlas-p1d-sky-06-{ARCH}-{MODE}-receipt.json"
jfile.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
print("SKY06_FOUR_RENDERINGS_COMPLETE",ARCH,MODE,
      {k:round(v["oculus_photometry"]["mean_linear_rgb_proxy"],4) for k,v in results.items()},
      flush=True)
