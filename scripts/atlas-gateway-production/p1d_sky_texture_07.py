#!/usr/bin/env python3
"""ART-DIR-02 | P1D-SKY-07. Subdivide and slightly curve the AUTHENTIC
sky texture screen while carrying all native mesh UV loops and shaders.
Every experiment is in-memory on qualified A/B J3/J4 .blend, never saved.
"""
import bpy
import bmesh
import hashlib
import json
import math
import statistics
import sys
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def required_arg(k):
    if k not in args or args.index(k)+1>=len(args):
        raise RuntimeError("Missing argument "+k)
    return args[args.index(k)+1]
ARCH=required_arg("--arch").upper()
MODE=required_arg("--variant").upper()
OUT=Path(required_arg("--out")).resolve()
GEO=Path(required_arg("--oculus-receipt")).resolve()
SKY06=Path(required_arg("--sky06-receipt")).resolve()
if ARCH not in ("A","B") or MODE not in ("J3","J4"):
    raise RuntimeError("Architecture or mode invalid")
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
def sha256(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for buf in iter(lambda:f.read(1<<20),b""):h.update(buf)
    return h.hexdigest()
rgeo=json.loads(GEO.read_text(encoding="utf8"))
rsky=json.loads(SKY06.read_text(encoding="utf8"))
if SOURCE.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend":
    raise RuntimeError("Wrong actual .blend")
if rgeo["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or rgeo["arch"]!=ARCH:
    raise RuntimeError("P1D-OCULUS-03 manifest mismatch")
if sha256(SOURCE)!=rgeo["variants"][MODE]["editable_blend"]["sha256"]:
    raise RuntimeError("Original qualifying binary changed")
if rsky["schema"]!="atlas.artdir02.p1d-sky-integration/v1" or rsky["arch"]!=ARCH or rsky["structural_variant"]!=MODE:
    raise RuntimeError("Missing qualified parent SKY06 evidence")
if rsky["source_sha256"]!=sha256(SOURCE) or not rsky["camera_and_exposure_original_unchanged"]:
    raise RuntimeError("Parent qualification not bound to source model")
if rgeo["art_approved"] or rsky["art_approved"] or not rsky["no_merge"] or not rsky["no_deploy"]:
    raise RuntimeError("Unexpected governance")
def ob(n):
    o=bpy.data.objects.get(n)
    if o is None:raise RuntimeError("Original architectural object missing: "+n)
    return o
scene=bpy.context.scene
view=bpy.context.view_layer
cam=ob("CAM_HERO_ARCH04")
rim=ob(f"ARCH {ARCH} raised oculus rim")
sky=ob(f"ARCH {ARCH} raised sky opening")
collar=ob("ATLAS R7 • one dark skylight collar")
roof=ob(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
if sky.type!="MESH" or rim.type!="CURVE" or cam.type!="CAMERA" or roof.type!="MESH":
    raise RuntimeError("Unexpected source geometry type")
if sky.hide_render or collar.hide_render or roof.hide_render or not rim.hide_render:
    raise RuntimeError("Qualified object initial visibility changed")
if view.material_override is None:
    raise RuntimeError("Expected original clay override, must disable only for source-color Cycles")
if not sky.material_slots or not sky.material_slots[0].material:
    raise RuntimeError("Original sky texture material missing")
mat=sky.material_slots[0].material
if not mat.use_nodes or not any(node.type=="EMISSION" for node in mat.node_tree.nodes):
    raise RuntimeError("Original sky lacks emission material")
images=[n.image.name for n in mat.node_tree.nodes if n.type=="TEX_IMAGE" and n.image]
if not images:
    raise RuntimeError("No image texture attached to sky screen material")
source_hash=sha256(SOURCE)
original_objects=set(scene.objects.keys())
original_meshes=set(bpy.data.meshes.keys())
original_materials=set(bpy.data.materials.keys())
original_lights={o.name:(o.data.energy,tuple(tuple(x) for x in o.matrix_world)) for o in scene.objects if o.type=="LIGHT"}
original_camera_data=(cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width)
camera_matrix=tuple(tuple(row) for row in cam.matrix_world)
original_vis={o.name:bool(o.hide_render) for o in scene.objects}
old_cam=scene.camera
old_world=scene.world
old_clay=view.material_override
old_render=(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
    scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
    scene.render.image_settings.file_format,scene.render.film_transparent)
scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
scene.cycles.samples=14
view.material_override=None
view.update()
# Reconstruct the original camera-perspective aperture ROI at original rim Z
# following the prior qualified P1D-VIS-04/05/06 sampler.
frame=cam.data.view_frame(scene=scene)
xmin=min(p.x for p in frame);xmax=max(p.x for p in frame)
ymin=min(p.y for p in frame);ymax=max(p.y for p in frame)
zfr=sum(p.z for p in frame)/len(frame)
matrix=cam.matrix_world.copy()
origin=matrix.translation.copy()
rot=matrix.to_3x3()
def ray(u,v):
    p=Vector((xmin+(xmax-xmin)*u,ymin+(ymax-ymin)*v,zfr))
    if cam.data.type=="ORTHO":
        return matrix@Vector((p.x,p.y,0)),(rot@Vector((0,0,-1))).normalized()
    return origin,(rot@p).normalized()
def bezier(a,b,c,d,t):
    s=1-t
    return s*s*s*a+3*s*s*t*b+3*s*t*t*c+t*t*t*d
ring=[]
for sp in rim.data.splines:
    if sp.type=="BEZIER":
        ps=list(sp.bezier_points)
        for i in range(len(ps) if sp.use_cyclic_u else len(ps)-1):
            a=ps[i];b=ps[(i+1)%len(ps)]
            for k in range(32):
                ring.append(rim.matrix_world@bezier(a.co,a.handle_right,b.handle_left,b.co,k/32))
    elif sp.type in ("POLY","NURBS"):
        ring.extend(rim.matrix_world@Vector(p.co[:3]) for p in sp.points)
if len(ring)<32:raise RuntimeError("Original rim spline too sparse")
cx=statistics.mean(p.x for p in ring)
cy=statistics.mean(p.y for p in ring)
rz=statistics.median(p.z for p in ring)
if max(abs(p.z-rz) for p in ring)>.08:
    raise RuntimeError("Oculus was not planar")
poly=[(cx+.88*(p.x-cx),cy+.88*(p.y-cy)) for p in ring]
def inside(x,y):
    answer=False;j=len(poly)-1
    for i in range(len(poly)):
        ax,ay=poly[i];bx,by=poly[j]
        if (ay>y)!=(by>y) and x<(bx-ax)*(y-ay)/(by-ay)+ax:
            answer=not answer
        j=i
    return answer
samples=[]
for y in range(72):
    v=(y+.5)/72
    for x in range(128):
        u=(x+.5)/128
        o,d=ray(u,v)
        if abs(d.z)<1e-8:continue
        t=(rz-o.z)/d.z
        if t<=1e-5:continue
        p=o+t*d
        if inside(p.x,p.y):
            samples.append((u,v,o,d,x,y))
if len(samples)!=rsky["render_cases"]["BASE"]["oculus_photometry"]["samples"]:
    raise RuntimeError("Sky ROI drift relative to verified P1D-SKY-06")
# Determine baseline screen coverage with correct evaluated world-space rays.
deps=bpy.context.evaluated_depsgraph_get()
def hits(ob):
    deps.update()
    eo=ob.evaluated_get(deps)
    bvh=BVHTree.FromObject(eo,deps)
    return sum(bvh.ray_cast(o,d)[0] is not None for u,v,o,d,x,y in samples)
baseline_hits=hits(sky)
if baseline_hits<.85*len(samples):
    raise RuntimeError("Original sky screen lacks expected visible footprint")
# Duplicate ORIGINAL mesh and UV: do not reconstruct a giant texture plane.
# Subdivide native polygons; BMesh preserves/interpolates UV loops where present.
screen_center=Vector((
    statistics.mean((sky.matrix_world@Vector(corner)).x for corner in sky.bound_box),
    statistics.mean((sky.matrix_world@Vector(corner)).y for corner in sky.bound_box),
    statistics.mean((sky.matrix_world@Vector(corner)).z for corner in sky.bound_box)))
def create_variant(label,depth):
    mesh=sky.data.copy()
    mesh.name=f"P1D-SKY-07 {ARCH} {MODE} original sky mesh duplicated {label}"
    original_v=len(mesh.vertices)
    original_f=len(mesh.polygons)
    original_uv=len(mesh.uv_layers)
    if len(mesh.polygons)<1:raise RuntimeError("Original sky screen has no surface")
    if len(mesh.vertices)<=800:
        bm=bmesh.new()
        try:
            bm.from_mesh(mesh)
            bm.verts.ensure_lookup_table()
            bm.edges.ensure_lookup_table()
            bmesh.ops.subdivide_edges(bm,edges=list(bm.edges),cuts=12,use_grid_fill=True)
            bm.to_mesh(mesh)
        finally:bm.free()
        mesh.update()
    if len(mesh.vertices)<=original_v:
        raise RuntimeError("Sky source surface could not be subdivided for continuity")
    # Only its Z-coordinates are altered. Each native source image UV and material
    # binding is interpolated; the XY footprint and outer boundary stay fixed.
    world=sky.matrix_world.copy()
    inv=world.inverted()
    xy=[world@v.co for v in mesh.vertices]
    radius=max(math.hypot(p.x-screen_center.x,p.y-screen_center.y) for p in xy)
    if radius<=1e-5:raise RuntimeError("Invalid original sky radius")
    displacement=[]
    for vert,wp in zip(mesh.vertices,xy):
        r=math.hypot(wp.x-screen_center.x,wp.y-screen_center.y)/radius
        local_lift=depth*(max(0.,1.-r*r)**2)
        vert.co=inv@(wp+Vector((0,0,local_lift)))
        displacement.append(local_lift)
    mesh.update()
    if original_uv and len(mesh.uv_layers)!=original_uv:
        raise RuntimeError("Original texture coordinate layer was lost")
    candidate=bpy.data.objects.new(f"P1D-SKY-07 {ARCH} {MODE} {label}",mesh)
    scene.collection.objects.link(candidate)
    candidate.matrix_world=world
    candidate.hide_render=True
    if len(candidate.data.materials)!=len(sky.data.materials):
        raise RuntimeError("Original material slots not preserved")
    for a,b in zip(candidate.data.materials,sky.data.materials):
        if a is not b:raise RuntimeError("Sky image emission shader changed")
    return candidate,{
        "depth_bu":depth,"source_vertex_count":original_v,
        "subdivided_vertex_count":len(mesh.vertices),
        "source_polygon_count":original_f,
        "subdivided_polygon_count":len(mesh.polygons),
        "original_uv_layer_count":original_uv,
        "retained_uv_layer_count":len(mesh.uv_layers),
        "max_abs_displacement_bu":max(abs(t) for t in displacement),
        "native_screen_extent_xy_bu":[sky.dimensions.x,sky.dimensions.y],
        "native_xy_footprint_preserved":True,
        "original_emission_shader_preserved":True}
# Depth choices use 0.025 and 0.060 Blender units only, versus
# SKY-06's overlarge 16–18 BU radius screen. No enlarged XY footprint.
variants={"SHALLOW_CURVE":0.025,"MEDIUM_CURVE":0.060,"FLAT_RECESS":-0.035}
created={}
metrics={}
for name,amount in variants.items():
    candidate,profile=create_variant(name,amount)
    profile["original_sky_ray_hits"]=baseline_hits
    profile["candidate_sky_ray_hits"]=hits(candidate)
    profile["ray_count"]=len(samples)
    created[name]=candidate
    metrics[name]=profile
    print("SKY07_NATIVE_MESH",ARCH,MODE,name,
        "SOURCE_VERTICES",profile["source_vertex_count"],
        "TESS_VERTICES",profile["subdivided_vertex_count"],
        "BASE_HITS",baseline_hits,
        "HITS",profile["candidate_sky_ray_hits"],
        "ORIGINAL_UV",profile["original_uv_layer_count"],flush=True)
    if profile["candidate_sky_ray_hits"]<baseline_hits*.88:
        raise RuntimeError(name+" lost more than 12% original sky coverage")
# Textural reproducibility: compare color spatial variation against BASE.
cases={"BASE":None,**created}
renderings={}
def render(name,candidate):
    for cname,obj in created.items():
        obj.hide_render=(obj is not candidate)
    sky.hide_render=candidate is not None
    view.update()
    fname=f"atlas-p1d-sky-07-{ARCH}-{MODE}-{name}.png"
    target=OUT/fname
    scene.render.filepath=str(target)
    bpy.ops.render.render(write_still=True)
    if not target.exists() or target.stat().st_size<1500:
        raise RuntimeError("Cycles image did not render "+fname)
    im=bpy.data.images.load(str(target),check_existing=False)
    try:
        if tuple(im.size)!=(960,540):raise RuntimeError("Resolution changed")
        pix=im.pixels
        lum={}
        for u,v,o,d,x,y in samples:
            xx=min(959,int(u*960));yy=min(539,int(v*540))
            i=4*(yy*960+xx)
            lum[(x,y)]=(.2126*pix[i]+.7152*pix[i+1]+.0722*pix[i+2])
        values=list(lum.values())
        diffs=[]
        for x,y in lum:
            if (x+1,y) in lum:diffs.append(abs(lum[x,y]-lum[x+1,y]))
            if (x,y+1) in lum:diffs.append(abs(lum[x,y]-lum[x,y+1]))
        photo={
            "sample_count":len(values),
            "mean_rgb_luminance_proxy":statistics.mean(values),
            "median_rgb_luminance_proxy":statistics.median(values),
            "stddev_rgb_luminance_proxy":statistics.pstdev(values),
            "adjacent_sample_contrast":statistics.mean(diffs) if diffs else 0,
            "adjacent_sample_pairs":len(diffs),
            "fraction_above_0_30":sum(v>.30 for v in values)/len(values)}
    finally:
        bpy.data.images.remove(im)
    return {"file":fname,"sha256":sha256(target),"bytes":target.stat().st_size,
            "photometry":photo}
for label,obj in cases.items():
    renderings[label]=render(label,obj)
    print("SKY07_CYCLES",ARCH,MODE,label,
          "MEAN",round(renderings[label]["photometry"]["mean_rgb_luminance_proxy"],5),
          "STDDEV",round(renderings[label]["photometry"]["stddev_rgb_luminance_proxy"],5),
          "CONTRAST",round(renderings[label]["photometry"]["adjacent_sample_contrast"],5),flush=True)
sky.hide_render=original_vis[sky.name]
for name,o in created.items():
    mesh=o.data
    bpy.data.objects.remove(o,do_unlink=True)
    if mesh.users==0:bpy.data.meshes.remove(mesh)
view.material_override=old_clay
scene.camera=old_cam
scene.world=old_world
(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)=old_render
view.update()
if set(scene.objects.keys())!=original_objects or set(bpy.data.meshes.keys())!=original_meshes:
    raise RuntimeError("Temporary sky geometry survived in scene")
if set(bpy.data.materials.keys())!=original_materials:
    raise RuntimeError("Original material database mutated")
if any(o.hide_render!=original_vis[o.name] for o in scene.objects):
    raise RuntimeError("Original visibility not restored")
if original_lights!={o.name:(o.data.energy,tuple(tuple(x) for x in o.matrix_world)) for o in scene.objects if o.type=="LIGHT"}:
    raise RuntimeError("Light positions or energies changed")
if (cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width)!=original_camera_data or tuple(tuple(row) for row in cam.matrix_world)!=camera_matrix:
    raise RuntimeError("Camera changed")
if scene.camera!=old_cam or scene.world!=old_world or view.material_override!=old_clay:
    raise RuntimeError("Scene camera world or clay override not restored")
if sha256(SOURCE)!=source_hash:raise RuntimeError("Qualified .blend modified")
parent_mean=rsky["render_cases"]["BASE"]["oculus_photometry"]["mean_linear_rgb_proxy"]
now_mean=renderings["BASE"]["photometry"]["mean_rgb_luminance_proxy"]
if abs(now_mean-parent_mean)>.025:
    raise RuntimeError(f"Original sky material/control not reproduced {now_mean} vs {parent_mean}")
receipt={
    "schema":"atlas.artdir02.p1d-sky-texture/v1",
    "arch":ARCH,"structural_variant":MODE,
    "canonical_art_sha256":rgeo["canonical_art_sha256"],
    "source_sha256":source_hash,
    "p1d_oculus_parent_receipt_schema":rgeo["schema"],
    "sky06_parent_receipt_schema":rsky["schema"],
    "sky06_parent_run":45021582963,
    "original_sky_material":mat.name,
    "original_cloud_images":images,
    "original_sky_mesh_vertices":len(sky.data.vertices),
    "original_sky_mesh_faces":len(sky.data.polygons),
    "original_uv_layers":[uv.name for uv in sky.data.uv_layers],
    "baseline_original_geometry_rays_hit":baseline_hits,
    "oculus_ray_sample_count":len(samples),
    "variant_geometry":metrics,
    "renderings":renderings,
    "camera_world_lamps_unchanged":True,
    "original_cloud_texture_and_uv_preserved":True,
    "original_xy_screen_footprint_preserved":True,
    "temporary_geometry_removed":True,
    "original_source_unmodified":True,
    "art_approved":False,"no_merge":True,"no_deploy":True,
    "interpretation":"Texture preservation and limited native-geometry deformation, not final artistic solution. Pixel RGB variance/contrast are relative only. No source file was saved."
}
outfile=OUT/f"atlas-p1d-sky-07-{ARCH}-{MODE}-receipt.json"
outfile.write_text(json.dumps(receipt,ensure_ascii=False,indent=2),encoding="utf8")
print("SKY07_NATIVE_TEXTURE_COMPARISON_COMPLETE",ARCH,MODE,flush=True)
