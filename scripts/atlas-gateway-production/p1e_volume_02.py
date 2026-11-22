#!/usr/bin/env python3
"""P1E-VOLUME-02: coherent, reversible, height-only atrium deformation.
Run on four SHA-qualified original .blend in headless Cycles. NEVER save source.
Architecture tiers transform by the SAME continuous world-Z field; all original
blue-glass portal components, floor, podium, camera, and lamps remain fixed.
"""
import bpy, sys, json, hashlib, math, statistics
from pathlib import Path
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(k):
 if k not in args or args.index(k)+1>=len(args):raise ValueError("Missing "+k)
 return args[args.index(k)+1]
ARCH=arg("--arch").upper();MODE=arg("--variant").upper()
OUT=Path(arg("--out"));OUT.mkdir(parents=True,exist_ok=True)
RECEIPT=Path(arg("--oculus-receipt"))
PARENT=Path(arg("--framing-receipt"))
INVENTORY=Path(arg("--inventory"))
if ARCH not in ("A","B") or MODE not in ("J3","J4"):raise RuntimeError("Unrecognised A/B J3/J4")
SRC=Path(bpy.data.filepath)
def sha(p):
 h=hashlib.sha256()
 with open(p,"rb") as f:
  for buf in iter(lambda:f.read(1<<20),b""):h.update(buf)
 return h.hexdigest()
rec=json.loads(RECEIPT.read_text());parent=json.loads(PARENT.read_text());inv=json.loads(INVENTORY.read_text())
checksum=sha(SRC)
if SRC.name!=f"atlas-p1d-oculus-03-{ARCH}-{MODE}.blend" or checksum!=rec["variants"][MODE]["editable_blend"]["sha256"]:
 raise RuntimeError("Missing qualified source model")
if rec["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or rec["arch"]!=ARCH:raise RuntimeError("Source receipt mismatch")
if parent["schema"]!="atlas.artdir02.p1e-framing/v1" or parent["source_sha256"]!=checksum:raise RuntimeError("Framing parent not source-bound")
if parent["arch"]!=ARCH or parent["structural_variant"]!=MODE:raise RuntimeError("Framing parent variant drift")
if inv["schema"]!="atlas.artdir02.p1e-volume-inventory/v1" or inv["source_sha256"]!=checksum:raise RuntimeError("Inventory not source-bound")
if inv["arch"]!=ARCH or inv["structural_variant"]!=MODE:raise RuntimeError("Inventory model drift")
if parent["art_approved"] or not parent["no_merge"] or not parent["no_deploy"]:raise RuntimeError("Invalid parent governance")
if rec["canonical_art_sha256"]!=parent["canonical_art_sha256"]:raise RuntimeError("ART-DIR-02 canonical mismatch")
scene=bpy.context.scene; view=bpy.context.view_layer
def obj(name):
 o=bpy.data.objects.get(name)
 if o is None:raise RuntimeError("Missing original geometry: "+name)
 return o
cam=obj("CAM_HERO_ARCH04");sky=obj(f"ARCH {ARCH} raised sky opening")
rim=obj(f"ARCH {ARCH} raised oculus rim")
roof=obj(f"ATLAS {ARCH} {MODE} integrated structural crown and vault")
collar=obj("ATLAS R7 • one dark skylight collar")
upper=obj(f"ARCH {ARCH} upper gallery slab")
upper_deck=obj("ARCH04 • upper gallery deck")
first=obj("ARCH04 • first gallery deck")
panels=[obj(f"{n} • vetro cobalto") for n in ("Curricolo","Esplora","Percorsi","Esperienze")]
if cam.type!="CAMERA" or sky.type!="MESH" or rim.type!="CURVE" or roof.type!="MESH":
 raise RuntimeError("Unexpected source types")
if any(x.hide_render for x in (sky,roof,upper,upper_deck,first)) or not rim.hide_render:
 raise RuntimeError("Original source visibility differs")
if view.material_override is None:raise RuntimeError("Original material override expected")
initial_matrix=cam.matrix_world.copy()
initial_lens=cam.data.lens
initial_shift=(cam.data.shift_x,cam.data.shift_y)
original_cam=scene.camera; original_world=scene.world;original_override=view.material_override
original_vis={x.name:x.hide_render for x in scene.objects}
original_objects=set(scene.objects.keys())
original_meshes=set(bpy.data.meshes.keys())
original_curves=set(bpy.data.curves.keys())
original_mats=set(bpy.data.materials.keys())
original_lamps={x.name:(x.data.energy,tuple(tuple(q) for q in x.matrix_world)) for x in scene.objects if x.type=="LIGHT"}
original_render=(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)
def world_corners(o):
 return [o.matrix_world@Vector(v) for v in o.bound_box]
def world_z(o):
 pts=world_corners(o)
 return [min(v.z for v in pts),max(v.z for v in pts)]
def projected_coords(points):
 vals=[]
 for x in points:
  q=world_to_camera_view(scene,cam,x)
  vals.append((float(q.x),float(q.y),float(q.z)))
 front=[x for x in vals if x[2]>0]
 if not front:return {"front_fraction":0,"bounds":None}
 return {"front_fraction":len(front)/len(vals),
         "bounds":{"left":min(q[0] for q in front),"right":max(q[0] for q in front),
                   "bottom":min(q[1] for q in front),"top":max(q[1] for q in front)},
         "on_screen_fraction":sum(0<=x<=1 and 0<=y<=1 for x,y,z in front)/len(vals),
         "above_frame_fraction":sum(y>1 for x,y,z in front)/len(front)}
def bez(a,b,c,d,t):
 s=1-t
 return a*s*s*s+b*3*s*s*t+c*3*s*t*t+d*t*t*t
def rim_points():
 coords=[]
 for sp in rim.data.splines:
  if sp.type=="BEZIER":
   pts=list(sp.bezier_points)
   for i in range(len(pts) if sp.use_cyclic_u else len(pts)-1):
    a=pts[i];b=pts[(i+1)%len(pts)]
    for k in range(20):coords.append(rim.matrix_world@bez(a.co,a.handle_right,b.handle_left,b.co,k/20))
  elif sp.type in ("POLY","NURBS"):
   coords.extend(rim.matrix_world@Vector(p.co[:3]) for p in sp.points)
 if len(coords)<30:raise RuntimeError("Original oculus spline too sparse")
 return coords
# Building-only deformation, exclusions explicit: four glass panels, their
# original artwork, texts, connections, podium/plinth and proof sources fixed.
PROTECTED_PREFIX=("Curricolo","Esplora","Esperienze","Percorsi","Portale","PROOF")
DEFORM_PREFIX=("ARCH ","ARCH04","ATLAS ","P1D ")
def architectural(o):
 if o.type not in ("MESH","CURVE"):return False
 if o.name.startswith(PROTECTED_PREFIX):return False
 if not o.name.startswith(DEFORM_PREFIX):return False
 return world_z(o)[1]>3.25
candidates=[x for x in scene.objects if architectural(x)]
names=[x.name for x in candidates]
for landmark in (sky,rim,roof,collar,upper,upper_deck):
 if landmark.name not in names:raise RuntimeError("Key upper structure omitted "+landmark.name)
if first.name in names:raise RuntimeError("First gallery must be untouched at pivot")
if any(p.name in names for p in panels):raise RuntimeError("Glass portal warped")
if len(candidates)<40 or len(candidates)>420:
 raise RuntimeError(f"Unexpected architectural object cohort {len(candidates)}")
# Duplicate only original DATA in memory and preserve complete original IDs.
# Never apply transforms or new materials; modifiers and metadata unchanged.
base={}
for o in candidates:
 old=o.data
 duplicate=old.copy()
 o.data=duplicate
 orig_matrix=o.matrix_world.copy()
 points=[]
 if o.type=="MESH":
  for v in duplicate.vertices:points.append((v,orig_matrix@v.co))
 else:
  for spline in duplicate.splines:
   if spline.type=="BEZIER":
    for bp in spline.bezier_points:
     points.extend([(bp,attr,orig_matrix@getattr(bp,attr)) for attr in ("co","handle_left","handle_right")])
   else:
    for pt in spline.points:points.append((pt,"co",orig_matrix@Vector(pt.co[:3])))
 base[o.name]={"object":o,"original_data":old,"temporary_data":duplicate,
               "orig_matrix":orig_matrix,"original_world_points":points}
def smooth(t):
 t=max(0.,min(1.,t))
 return t*t*(3-2*t)
def deform_z(z,dg,dc):
 # Lower storey and panel floor remain physically anchored.
 # Gallery rise is completed by z=5.45. Upper crown has separate rise
 # from 5.8 to 7.4, preserving monotonic field and all local joints.
 return z+dg*smooth((z-3.25)/(5.45-3.25))+dc*smooth((z-5.80)/(7.40-5.80))
def apply(dg,dc):
 for item in base.values():
  o=item["object"]; inv=item["orig_matrix"].inverted()
  if o.type=="MESH":
   for vertex,pt in item["original_world_points"]:
    vertex.co=inv@Vector((pt.x,pt.y,deform_z(pt.z,dg,dc)))
  else:
   for point,attr,pt in item["original_world_points"]:
    xyz=inv@Vector((pt.x,pt.y,deform_z(pt.z,dg,dc)))
    if attr=="co" and hasattr(point,"co") and len(point.co)==4:
     point.co=(xyz.x,xyz.y,xyz.z,point.co.w)
    else:setattr(point,attr,xyz)
  if o.type=="MESH":o.data.update()
 view.update()
# Snapshot of all protected world coordinates for cross-case invariance.
protected={o.name:(tuple(world_z(o)),tuple(tuple(round(float(z),7) for z in pt) for pt in world_corners(o)))
           for o in [first,*panels]}
roof_orig=world_z(roof); sky_orig=world_z(sky); upper_orig=world_z(upper_deck)
CASES={"BASE":{"gallery_rise_bu":0.,"crown_extra_bu":0.},
       "RISE_035":{"gallery_rise_bu":.35,"crown_extra_bu":.10},
       "RISE_065":{"gallery_rise_bu":.65,"crown_extra_bu":.20}}
ANGLES={"HERO_BASE":0.,"HERO_TILT_UP_3":3.}
scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=768
scene.render.resolution_y=432
scene.render.resolution_percentage=100
scene.cycles.samples=10
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
view.material_override=None
results={}
for case,params in CASES.items():
 apply(params["gallery_rise_bu"],params["crown_extra_bu"])
 for o in [first,*panels]:
  now=(tuple(world_z(o)),tuple(tuple(round(float(z),7) for z in pt) for pt in world_corners(o)))
  if now!=protected[o.name]:raise RuntimeError("Protected glass portal or first gallery moved")
 rise=world_z(upper_deck)[1]-upper_orig[1]
 if abs(rise-params["gallery_rise_bu"])>.01:raise RuntimeError("Upper gallery Z rise drift")
 if not world_z(sky)[1]>world_z(roof)[1]:raise RuntimeError("Sky image no longer behind crown")
 # Sample same source oculus points in both camera configurations.
 entries={}
 for camcase,angle in ANGLES.items():
  cam.matrix_world=initial_matrix @ Matrix.Rotation(math.radians(angle),4,"X")
  cam.data.lens=initial_lens
  view.update()
  occ=projected_coords(rim_points())
  portal_boxes={p.name:projected_coords(world_corners(p)) for p in panels}
  center_boxes=[((t["bounds"]["left"]+t["bounds"]["right"])/2,
                 (t["bounds"]["bottom"]+t["bounds"]["top"])/2) for t in portal_boxes.values()]
  centers_inside=all(0<x<1 and 0<y<1 for x,y in center_boxes)
  if not centers_inside:raise RuntimeError("One of 4 original portal centers left frame")
  gallery_boxes={o.name:projected_coords(world_corners(o)) for o in (first,upper_deck,upper,roof)}
  file=OUT/f"atlas-p1e-volume-02-{ARCH}-{MODE}-{case}-{camcase}.png"
  scene.render.filepath=str(file)
  bpy.ops.render.render(write_still=True)
  if not file.is_file() or file.stat().st_size<1800:raise RuntimeError("Cycles output not written "+file.name)
  im=bpy.data.images.load(str(file),check_existing=False)
  try:
   if tuple(im.size)!=(768,432):raise RuntimeError("PNG dimensions changed")
   pix=im.pixels
   vals=[]
   for y in range(25,432,11):
    for x in range(25,768,12):
     pos=4*(y*768+x)
     vals.append(.2126*pix[pos]+.7152*pix[pos+1]+.0722*pix[pos+2])
   photo={"sampled_rgb_luminance_proxy_mean":statistics.mean(vals),
          "sampled_rgb_luminance_proxy_stddev":statistics.pstdev(vals),
          "sample_count":len(vals)}
  finally:bpy.data.images.remove(im)
  entries[camcase]={
   "camera_tilt_degrees":angle,"oculus_rim_projection":occ,
   "portal_centers_all_inside":centers_inside,
   "portal_center_span_horizontal":max(x for x,y in center_boxes)-min(x for x,y in center_boxes),
   "portals_projected":portal_boxes,"galleries_projected":gallery_boxes,
   "render":{"file":file.name,"sha256":sha(file),"bytes":file.stat().st_size,
             "relative_photometry":photo}}
  print("VOLUME02_CYCLES",ARCH,MODE,case,camcase,
        "upper_gallery",round(world_z(upper_deck)[1],3),
        "oculus_top",round(occ["bounds"]["top"],3),
        "portals_inside",centers_inside,flush=True)
 results[case]={
  "parameters":params,
  "measured_bounds_world_z_bu":{
   "first_gallery":world_z(first),
   "upper_gallery":world_z(upper_deck),
   "upper_slab":world_z(upper),
   "structural_crown":world_z(roof),
   "oculus_rim":world_z(rim),
   "sky_texture_screen":world_z(sky),
   "dark_skylight_collar":world_z(collar)},
  "cameras":entries}
# Restore original geometry data and camera in current process without source save.
for item in base.values():
 o=item["object"];temp=item["temporary_data"]
 o.data=item["original_data"]
 if temp.users!=0:raise RuntimeError("Original data re-link failed for "+o.name)
 if o.type=="MESH":bpy.data.meshes.remove(temp)
 else:bpy.data.curves.remove(temp)
cam.matrix_world=initial_matrix
cam.data.lens=initial_lens
scene.camera=original_cam
view.material_override=original_override
scene.world=original_world
(scene.render.engine,scene.render.resolution_x,scene.render.resolution_y,
 scene.render.resolution_percentage,scene.cycles.samples,scene.render.filepath,
 scene.render.image_settings.file_format,scene.render.film_transparent)=original_render
view.update()
if sha(SRC)!=checksum:raise RuntimeError("Source .blend bytes changed")
if set(scene.objects.keys())!=original_objects:raise RuntimeError("Unexpected added object")
if set(bpy.data.meshes.keys())!=original_meshes or set(bpy.data.curves.keys())!=original_curves:
 raise RuntimeError("Experimental meshes or curves survived restoration")
if set(bpy.data.materials.keys())!=original_mats:raise RuntimeError("Material altered")
if max(abs(cam.matrix_world[i][j]-initial_matrix[i][j]) for i in range(4) for j in range(4))>1.e-7 or cam.data.lens!=initial_lens:
 raise RuntimeError("Camera not restored")
if (cam.data.shift_x,cam.data.shift_y)!=initial_shift:raise RuntimeError("Camera shift altered")
if scene.camera!=original_cam or scene.world!=original_world or view.material_override!=original_override:
 raise RuntimeError("Scene setup not restored")
if any(o.hide_render!=original_vis[o.name] for o in scene.objects):
 raise RuntimeError("Source object visibility changed")
if original_lamps!={x.name:(x.data.energy,tuple(tuple(q) for q in x.matrix_world)) for x in scene.objects if x.type=="LIGHT"}:
 raise RuntimeError("Original lamps altered")
result={
 "schema":"atlas.artdir02.p1e-volume-02/v1",
 "arch":ARCH,"structural_variant":MODE,
 "source_sha256":checksum,"canonical_art_sha256":rec["canonical_art_sha256"],
 "parent_framing_01_run":45028329659,
 "inventory_parent_run":45056688421,
 "gallery_vertical_pivot_bu":3.25,
 "upper_gallery_completion_z_bu":5.45,
 "upper_crown_deformation_range_bu":[5.80,7.40],
 "architecture_members_deformed":len(candidates),
 "protected_4_glass_panels_and_first_gallery_unchanged":True,
 "source_cameras_restored":True,
 "original_mesh_materials_world_lamps_unchanged":True,
 "geometry_experiments_undone":True,
 "original_source_saved":False,
 "rendering_approximate_diagnostic_not_artistic_approval":True,
 "no_merge":True,"no_deploy":True,"art_approved":False,
 "variants":results,
 "interpretation":"Monotonic world-Z architectural deformation preserves same-level joints and panel geometry. Does not certify constructive feasibility or unoccluded gallery visibility; art review is separate. Low sample Cycles diagnostic views."}
file=OUT/f"atlas-p1e-volume-02-{ARCH}-{MODE}-receipt.json"
file.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf8")
print("P1E_VOLUME02_6_REAL_CYCLES_AND_RECEIPT_COMPLETE",ARCH,MODE,flush=True)
