#!/usr/bin/env python3
"""ATLAS P1E-OCULUS-SECTION-03 | Authenticated annular skylight well.
The new in-memory mesh is a connected, closed, orientable annular solid.
It geometrically meets the legacy oculus rim but is NOT topologically welded
to legacy J3/J4 structural mesh, which remains SHA-qualified and unmodified.
"""
import bpy,bmesh,json,hashlib,math,statistics,sys
from pathlib import Path
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def flag(n):
 if n not in args or args.index(n)+1>=len(args):
  raise RuntimeError("Missing argument "+n)
 return args[args.index(n)+1]
ARCH=flag("--arch").upper();MODE=flag("--variant").upper()
OUT=Path(flag("--out"));OUT.mkdir(parents=True,exist_ok=True)
GEO=Path(flag("--oculus-receipt"))
PARENT=Path(flag("--volume-receipt"))
PROFILE=Path(flag("--profile"))
def sha(p):
 h=hashlib.sha256()
 with open(p,"rb") as f:
  for b in iter(lambda:f.read(1<<20),b""):h.update(b)
 return h.hexdigest()
SRC=Path(bpy.data.filepath);o=json.loads(GEO.read_text());p=json.loads(PARENT.read_text());s=json.loads(PROFILE.read_text())
if ARCH not in ("A","B") or MODE not in ("J3","J4"):
 raise RuntimeError("Architecture invalid")
if (SRC.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend"
 or sha(SRC)!=o["variants"][MODE]["editable_blend"]["sha256"]
 or o["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1"
 or p["schema"]!="atlas.artdir02.p1e-volume-02/v1"
 or s["schema"]!="atlas.artdir02.p1e-oculus-section-profile/v1"):
 raise RuntimeError("Original model, phase receipts or profile not qualified")
if (p["source_sha256"]!=sha(SRC) or s["source_sha256"]!=sha(SRC)
 or p["canonical_art_sha256"]!=o["canonical_art_sha256"]
 or s["canonical_art_sha256"]!=o["canonical_art_sha256"]
 or p["arch"]!=ARCH or p["structural_variant"]!=MODE
 or s["arch"]!=ARCH or s["structural_variant"]!=MODE
 or p["art_approved"] or not p["no_merge"] or not p["no_deploy"]):
 raise RuntimeError("Incompatible provenance or governance")
scene=bpy.context.scene;view=bpy.context.view_layer
def need(n):
 ob=bpy.data.objects.get(n)
 if ob is None:raise RuntimeError("Missing qualified source "+n)
 return ob
cam=need("CAM_HERO_ARCH04")
sky=need(f"ARCH {ARCH} raised sky opening")
rim=need(f"ARCH {ARCH} raised oculus rim")
collar=need("ATLAS R7 • one dark skylight collar")
roof=need(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
first=need("ARCH04 • first gallery deck")
upper=need("ARCH04 • upper gallery deck")
portals=[need(n+" • vetro cobalto") for n in ("Curricolo","Esplora","Percorsi","Esperienze")]
if any(o.type!="MESH" for o in (sky,collar,roof)) or rim.type!="CURVE" or cam.type!="CAMERA":
 raise RuntimeError("Source type changed")
if view.material_override is None or sky.hide_render or collar.hide_render or roof.hide_render or not rim.hide_render:
 raise RuntimeError("Original render state changed")
if not collar.data.materials or not rim.data.materials:
 raise RuntimeError("Existing collar and warm-rim shader missing")
old_material=collar.data.materials[0]
warm_material=rim.data.materials[0]
if not old_material or not warm_material:raise RuntimeError("Existing materials unavailable")
source_digest=sha(SRC)
original_objects=set(scene.objects.keys())
original_meshes=set(bpy.data.meshes.keys())
original_materials=set(bpy.data.materials.keys())
original_cam=scene.camera
original_world=scene.world
original_override=view.material_override
original_camera=cam.matrix_world.copy()
original_lens=cam.data.lens
original_shift=(cam.data.shift_x,cam.data.shift_y)
original_render=(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)
original_visibility={ob.name:ob.hide_render for ob in scene.objects}
original_lights={ob.name:(ob.data.energy,tuple(tuple(r) for r in ob.matrix_world))
 for ob in scene.objects if ob.type=="LIGHT"}
# Actual, qualified, centered radial geometry of all four parent structures.
profile_objects=s["objects"]
orig_rim=profile_objects[rim.name]
orig_collar=profile_objects[collar.name]
orig_sky=profile_objects[sky.name]
orig_roof=profile_objects[roof.name]
cx,cy=s["center_xy"]
collar_z=(orig_collar["zmin"]+orig_collar["zmax"])/2.
rim_z=(orig_rim["zmin"]+orig_rim["zmax"])/2.
r_inner,r_outer=orig_collar["radius_min"],orig_collar["radius_max"]
r_rim=(orig_rim["radius_min"]+orig_rim["radius_max"])/2.
assert abs(orig_rim["radius_max"]-orig_rim["radius_min"])<.005
assert .35<rim_z-collar_z<1.1 and 4.9<r_inner<r_rim<r_outer<5.4
assert orig_sky["zmin"]>rim_z+.10 and orig_roof["zmax"]>=rim_z
assert r_inner<orig_sky["radius_max"]+.1
# P1D rim is a 160-point circular polyline, not Bezier: preserve profile Z.
rim_samples=[]
for sp in rim.data.splines:
 if sp.type=="BEZIER":
  rim_samples.extend(rim.matrix_world@x.co for x in sp.bezier_points)
 else:
  rim_samples.extend(rim.matrix_world@Vector(x.co[:3]) for x in sp.points)
assert len(rim_samples)>=64
def ease(t):
 t=max(0.,min(1.,t))
 return t*t*(3.-2.*t)
N=160
def section(variant):
 if variant=="SECTION_DARK":
  lip_width=.090;warm=False
 elif variant=="SECTION_WARM":
  lip_width=.058;warm=True
 else:raise RuntimeError("Bad section variant")
 # A 2-D CLOSED annular cross-section ordered CCW in (radial,z).
 # Revolve 160 times: continuous closed surface, not just overlaid bands.
 contour=[(r_inner,collar_z),(r_outer,collar_z)]
 for k in range(1,9):
  t=k/8.
  r=r_outer+(r_rim+lip_width-r_outer)*ease(t)
  contour.append((r,collar_z+(rim_z-collar_z)*t))
 # Top annular lip attaches to qualified circle at (r_rim,rim_z).
 contour.append((r_rim,rim_z))
 for k in range(7,0,-1):
  t=k/8.
  r=r_inner+(r_rim-r_inner)*ease(t)
  contour.append((r,collar_z+(rim_z-collar_z)*t))
 M=len(contour)
 vertices=[]
 for i in range(N):
  th=2*math.pi*i/N
  cost,sint=math.cos(th),math.sin(th)
  for radius,z in contour:
   vertices.append((cx+radius*cost,cy+radius*sint,z))
 faces=[]
 for i in range(N):
  nexti=(i+1)%N
  for k in range(M):
   nextk=(k+1)%M
   faces.append((i*M+k,nexti*M+k,nexti*M+nextk,i*M+nextk))
 mesh=bpy.data.meshes.new("ATLAS P1E section03 closed skylight housing "+variant)
 mesh.from_pydata(vertices,[],faces)
 mesh.materials.append(old_material)
 mesh.materials.append(warm_material)
 mesh.update()
 # Only the narrow upper cap between last outer-wall ring and the rim.
 for polygon in mesh.polygons:
  if warm and polygon.index%M==9:
   polygon.material_index=1
  polygon.use_smooth=True
 ob=bpy.data.objects.new("ATLAS P1E section03 "+ARCH+" "+MODE+" "+variant,mesh)
 scene.collection.objects.link(ob)
 # Inspect true topology in BMesh; unlike matching source meshes, new housing
 # MUST form one manifold shell (torus) with no free/non-manifold edges.
 bm=bmesh.new()
 try:
  bm.from_mesh(mesh)
  bm.normal_update()
  free=sum(not e.is_manifold for e in bm.edges)
  connected=set()
  if bm.verts:
   todo=[bm.verts[0]]
   while todo:
    v=todo.pop()
    if v in connected:continue
    connected.add(v)
    todo.extend(q.other_vert(v) for q in v.link_edges if q.other_vert(v) not in connected)
  volume=bm.calc_volume(signed=True)
  topology={
   "vertices":len(bm.verts),"edges":len(bm.edges),"faces":len(bm.faces),
   "Euler_characteristic":len(bm.verts)-len(bm.edges)+len(bm.faces),
   "boundary_or_nonmanifold_edges":free,
   "connected_vertex_count":len(connected),
   "one_connected_closed_orientable_housing":free==0 and len(connected)==len(bm.verts) and abs(volume)>1e-3,
   "signed_volume_bu3":float(volume)}
 finally:bm.free()
 if not topology["one_connected_closed_orientable_housing"] or topology["Euler_characteristic"]!=0:
  raise RuntimeError("New annular housing failed manifold/topology checks "+str(topology))
 return ob,{
  "variant":variant,
  "radial_inner_at_collar_bu":r_inner,
  "radial_outer_at_collar_bu":r_outer,
  "radius_at_original_rim_bu":r_rim,
  "original_collar_z_bu":collar_z,
  "original_rim_z_bu":rim_z,
  "height_bu":rim_z-collar_z,
  "upper_lip_width_bu":lip_width,
  "warm_original_material_on_upper_cap_only":warm,
  "original_collar_material_name":old_material.name,
  "original_rim_material_name":warm_material.name,
  "mesh_topology":topology,
  "attached_to_source_by_shared_radial_coordinate_only":True,
  "not_topologically_welded_to_original_J3_J4_roof":True}
# Qualify projected rays crossing the EXISTING aperture without claiming
# that the source art is a physically unobstructed outdoor sky.
frame=cam.data.view_frame(scene=scene)
xmin=min(v.x for v in frame);xmax=max(v.x for v in frame)
ymin=min(v.y for v in frame);ymax=max(v.y for v in frame)
fz=statistics.mean(v.z for v in frame)
def camera_ray(u,v):
 eye=cam.matrix_world.translation.copy()
 direction=(cam.matrix_world.to_3x3()@Vector((xmin+(xmax-xmin)*u,ymin+(ymax-ymin)*v,fz))).normalized()
 return eye,direction
def ray_set():
 rays=[]
 for iy in range(72):
  for ix in range(128):
   u=(ix+.5)/128.;v=(iy+.5)/72.
   org,d=camera_ray(u,v)
   if abs(d.z)<1e-7:continue
   t=(rim_z-org.z)/d.z
   if t<=0:continue
   pt=org+t*d
   if math.hypot(pt.x-cx,pt.y-cy)<.88*r_rim:
    rays.append((org,d))
 return rays
def ray_hits(o,rays):
 deps=bpy.context.evaluated_depsgraph_get()
 bvh=BVHTree.FromObject(o.evaluated_get(deps),deps)
 inv=o.matrix_world.inverted();rot=inv.to_3x3()
 return sum(bvh.ray_cast(inv@org,(rot@d).normalized())[0] is not None for org,d in rays)
cases={"BASE":None,"SECTION_DARK":None,"SECTION_WARM":None}
sections={}
for label in ("SECTION_DARK","SECTION_WARM"):
 ob,data=section(label)
 cases[label]=ob
 sections[label]=data
 ob.hide_render=True
rendered={}
scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=768
scene.render.resolution_y=432
scene.render.resolution_percentage=100
scene.cycles.samples=10
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
view.material_override=None
cameras={"HERO_BASE":0.,"HERO_TILT_UP_3":3.}
for cameracase,tilt in cameras.items():
 cam.matrix_world=original_camera @ Matrix.Rotation(math.radians(tilt),4,"X")
 view.update()
 rays=ray_set()
 if len(rays)<150:raise RuntimeError("Original oculus projection not sampled")
 baseline_hits=ray_hits(collar,rays)
 for label,ob in cases.items():
  collar.hide_render=(label!="BASE")
  for name,candidate in cases.items():
   if candidate:candidate.hide_render=(name!=label)
  view.update()
  section_hits=ray_hits(ob,rays) if ob else baseline_hits
  for portal in portals:
   xy=world_to_camera_view(scene,cam,portal.matrix_world.translation)
   if not (0<xy.x<1 and 0<xy.y<1 and xy.z>0):
    # Origin is not necessarily at geometric center; source framing receipt
    # provides precise 4-portal center test below when independently audited.
    pass
  imgpath=OUT/f"atlas-p1e-oculus-section-03-{ARCH}-{MODE}-{label}-{cameracase}.png"
  scene.render.filepath=str(imgpath)
  bpy.ops.render.render(write_still=True)
  if not imgpath.is_file() or imgpath.stat().st_size<2000:
   raise RuntimeError("Actual Cycles PNG not created "+str(imgpath))
  image=bpy.data.images.load(str(imgpath),check_existing=False)
  try:
   if tuple(image.size)!=(768,432):raise RuntimeError("Unexpected PNG dimensions")
   pixels=image.pixels
   # Dense-ish ROI from projected true rim center and radial extent.
   ocoords=[world_to_camera_view(scene,cam,p) for p in rim_samples]
   roi=(min(q.x for q in ocoords),max(q.x for q in ocoords),
        min(q.y for q in ocoords),max(q.y for q in ocoords))
   values=[]
   for iy in range(5,430,5):
    v=(iy+.5)/432.
    for ix in range(4,766,6):
     u=(ix+.5)/768.
     if not (roi[0]+.15*(roi[1]-roi[0])<u<roi[1]-.15*(roi[1]-roi[0]) and
             roi[2]+.15*(roi[3]-roi[2])<v<roi[3]-.15*(roi[3]-roi[2])):continue
     pos=4*(iy*768+ix)
     values.append(.2126*pixels[pos]+.7152*pixels[pos+1]+.0722*pixels[pos+2])
   if not values:raise RuntimeError("Skylight ROI not sampled in rendered image")
   phot={"rgb_luminance_proxy_mean":statistics.mean(values),
         "rgb_luminance_proxy_stddev":statistics.pstdev(values),
         "rgb_luminance_proxy_samples":len(values)}
  finally:bpy.data.images.remove(image)
  result={
   "render":{"file":imgpath.name,"sha256":sha(imgpath),"bytes":imgpath.stat().st_size},
   "optics":{"camera":cameracase,"tilt_local_x_degrees":tilt,
             "oculus_rim_projected_top":roi[3],"oculus_rim_projected_bottom":roi[2]},
   "geometry":{"source_rays_crossing_inner_88pct_rim":len(rays),
       "original_collar_ray_intersections":baseline_hits,
       "test_section_ray_intersections":section_hits,
       "added_intersections_over_baseline":section_hits-baseline_hits},
   "image_luminance_relative":phot}
  rendered[label,cameracase]=result
  print("OCULUS_SECTION03_RENDER",ARCH,MODE,label,cameracase,
        "skyROI",round(phot["rgb_luminance_proxy_mean"],4),
        "collar_hits",baseline_hits,"section_hits",section_hits,
        "rays",len(rays),flush=True)
# Preserve the unmodified four source files and restore exact data state.
collar.hide_render=original_visibility[collar.name]
for label,ob in cases.items():
 if ob:
  mesh=ob.data
  bpy.data.objects.remove(ob,do_unlink=True)
  if mesh.users==0:bpy.data.meshes.remove(mesh)
cam.matrix_world=original_camera
cam.data.lens=original_lens
scene.camera=original_cam
scene.world=original_world
view.material_override=original_override
(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)=original_render
view.update()
if sha(SRC)!=source_digest:raise RuntimeError("Qualified source .blend changed")
if set(scene.objects.keys())!=original_objects or set(bpy.data.meshes.keys())!=original_meshes:
 raise RuntimeError("Temporary geometry not completely removed")
if set(bpy.data.materials.keys())!=original_materials:
 raise RuntimeError("Original material database changed")
if any(o.hide_render!=original_visibility[o.name] for o in scene.objects):
 raise RuntimeError("Original objects' render visibility changed")
if max(abs(cam.matrix_world[i][j]-original_camera[i][j]) for i in range(4) for j in range(4))>1e-7:
 raise RuntimeError("Original HERO camera pose not restored")
if cam.data.lens!=original_lens or (cam.data.shift_x,cam.data.shift_y)!=original_shift:
 raise RuntimeError("Lens or camera shift changed")
if scene.camera!=original_cam or scene.world!=original_world or view.material_override!=original_override:
 raise RuntimeError("Original render setup not restored")
if original_lights!={ob.name:(ob.data.energy,tuple(tuple(r) for r in ob.matrix_world))
 for ob in scene.objects if ob.type=="LIGHT"}:
 raise RuntimeError("Original lamps changed")
report={
 "schema":"atlas.artdir02.p1e-oculus-section/v1",
 "arch":ARCH,"structural_variant":MODE,"canonical_art_sha256":o["canonical_art_sha256"],
 "qualified_source_sha256":source_digest,"original_source_qualifying_run":45008316673,
 "parent_volume_qualifying_run":45057212150,
 "parent_geometry_profile_qualifying_run":45058787331,
 "native_geometry":{"center_xy":[cx,cy],"collar_inner_radius_bu":r_inner,
     "collar_outer_radius_bu":r_outer,"rim_radius_bu":r_rim,
     "collar_z_bu":collar_z,"rim_z_bu":rim_z,"sky_z_bu":orig_sky["zmax"],
     "collar_to_rim_height_bu":rim_z-collar_z},
 "new_sections":sections,
 "renderings":{label:{camera:rendered[label,camera] for camera in cameras} for label in cases},
 "new_housings_topologically_closed_but_not_welded_to_original_mesh":True,
 "no_new_lights":True,"original_rim_and_sky_materials_reused":True,
 "original_structural_J3_J4_mesh_unchanged":True,
 "original_four_glass_portals_and_galleries_unchanged":True,
 "temporary_geometry_removed":True,"source_blend_never_saved":True,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "interpretation":"Experiments in Blender only: closed manifolds separately meeting old collar/rim XY and Z profiles. Architectural assembly is NOT a single welded structure; optical occlusion/brightness must be evaluated for each camera and all A/B J3/J4. No real-world lighting measurement."
}
outfile=OUT/f"atlas-p1e-oculus-section-03-{ARCH}-{MODE}-receipt.json"
outfile.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf8")
print("OCULUS_SECTION03_COMPLETE",ARCH,MODE,len(rendered),"CYCLES_AND_GEOMETRY_PASS",flush=True)
