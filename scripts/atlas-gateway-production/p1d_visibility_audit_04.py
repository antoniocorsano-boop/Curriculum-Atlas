#!/usr/bin/env python3
"""ART-DIR-02 P1D-VIS-04: camera-space sky aperture and gallery occlusion audit.
Read-only on immutable A/B-J3/J4 Blender models; no artistic approval.
"""
import bpy
import bmesh
import hashlib
import json
import math
import sys
from pathlib import Path
from collections import Counter
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from bpy_extras.object_utils import world_to_camera_view

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
def arg(name):
    if name not in argv or argv.index(name)+1 >= len(argv):
        raise RuntimeError("Missing required argument " + name)
    return argv[argv.index(name)+1]
ARCH = arg("--arch").upper()
MODE = arg("--variant").upper()
OUT = Path(arg("--out")).resolve()
RECEIPT = Path(arg("--receipt")).resolve()
if ARCH not in ("A","B") or MODE not in ("J3","J4"):
    raise RuntimeError("Invalid architecture or structural variant")
OUT.mkdir(parents=True,exist_ok=True)
SOURCE = Path(bpy.data.filepath)
if SOURCE.name != "atlas-p1d-oculus-03-"+ARCH+"-"+MODE+".blend":
    raise RuntimeError("Unexpected input .blend: "+SOURCE.name)
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for part in iter(lambda:f.read(1<<20),b""):
            h.update(part)
    return h.hexdigest()
previous=json.loads(RECEIPT.read_text(encoding="utf-8"))
if previous["schema"]!="atlas.artdir02.p1d-oculus-manifold/v1" or previous["arch"]!=ARCH:
    raise RuntimeError("Missing authoritative P1D-OCULUS-03 receipt")
if sha(SOURCE)!=previous["variants"][MODE]["editable_blend"]["sha256"]:
    raise RuntimeError("Qualified J3/J4 binary SHA-256 does not match receipt")
if previous["art_approved"] or not previous["no_merge"] or not previous["no_deploy"]:
    raise RuntimeError("Inconsistent source governance")
scene=bpy.context.scene
cam=bpy.data.objects.get("CAM_HERO_ARCH04")
rim=bpy.data.objects.get("ARCH "+ARCH+" raised oculus rim")
roof=bpy.data.objects.get("ATLAS "+ARCH+" "+MODE+" integrated structural crown and vault")
upper=bpy.data.objects.get("ARCH "+ARCH+" upper parapet")
lower=bpy.data.objects.get("P1D • B lower railing")
glass=[bpy.data.objects.get(n+" • vetro cobalto") for n in
       ("Curricolo","Esplora","Percorsi","Esperienze")]
if not all([cam,rim,roof,upper,lower]+glass):
    raise RuntimeError("Missing original camera, rim, connected roof or protected galleries/panels")
if cam.type!="CAMERA" or rim.type!="CURVE" or roof.type!="MESH":
    raise RuntimeError("Unexpected types of camera/rim/roof")
if roof.hide_render or not rim.hide_render:
    raise RuntimeError("Candidate/original display state differs from qualified J3/J4")
if bpy.context.view_layer.material_override is None:
    raise RuntimeError("Clay-material override absent; cannot interpret glass opacity as final")
scene.camera=cam
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
deps=bpy.context.evaluated_depsgraph_get()
bm_keep=[]
bvh_objects=[]
for ob in scene.objects:
    if ob.type not in ("MESH","CURVE","FONT","SURFACE") or ob.hide_render:
        continue
    # Exclude collection-hidden geometry and objects invisible to the active view layer.
    if not ob.visible_get(view_layer=bpy.context.view_layer):
        continue
    eo=ob.evaluated_get(deps)
    me=eo.to_mesh()
    if me is None:
        continue
    try:
        if len(me.polygons)==0:
            continue
        bm=bmesh.new()
        bm.from_mesh(me)
        bm.transform(eo.matrix_world)
        bm.normal_update()
        tree=BVHTree.FromBMesh(bm,epsilon=0.)
        bvh_objects.append((ob,tree))
        bm_keep.append(bm)
    finally:
        eo.to_mesh_clear()
if roof.name not in [ob.name for ob,_ in bvh_objects]:
    raise RuntimeError("Qualified J3/J4 roof absent from camera-visible BVH set")
# Transform camera frame; respect perspective, shift and image aspect ratio.
frame=cam.data.view_frame(scene=scene)
xmin=min(v.x for v in frame);xmax=max(v.x for v in frame)
ymin=min(v.y for v in frame);ymax=max(v.y for v in frame)
zplane=sum(v.z for v in frame)/len(frame)
mat=cam.matrix_world.copy()
origin_camera=mat.translation.copy()
camrot=mat.to_3x3()
def camera_ray(u,v):
    point=Vector((xmin+(xmax-xmin)*u,ymin+(ymax-ymin)*v,zplane))
    if cam.data.type=="ORTHO":
        start=mat@Vector((point.x,point.y,0.0))
        direction=(camrot@Vector((0,0,-1))).normalized()
    else:
        start=origin_camera
        direction=(camrot@point).normalized()
    return start,direction
def trace(origin,direction,excluded=frozenset()):
    best=None
    distance=1.e12
    for ob,tree in bvh_objects:
        if ob.name in excluded:
            continue
        pos,normal,face_id,dist=tree.ray_cast(origin,direction,distance)
        if pos is not None and dist is not None and dist>1e-6 and dist<distance:
            distance=dist
            best=ob.name
    return best

def bezier(a,b,c,d,t):
    q=1.0-t
    return q*q*q*a+3*q*q*t*b+3*q*t*t*c+t*t*t*d
# Camera can lie inside the projected rim footprint: portions of a ring
# may be BEHIND the camera. A 2-D projection polygon is then invalid.
# Instead intersect each camera ray with the actual horizontal oculus plane,
# then test its world-space point against the real sampled Bezier footprint.
rim_world=[]
for sp in rim.data.splines:
    if sp.type=="BEZIER":
        pts=list(sp.bezier_points)
        n=len(pts) if sp.use_cyclic_u else len(pts)-1
        for i in range(n):
            aa=pts[i];bb=pts[(i+1)%len(pts)]
            for k in range(32):
                p=bezier(aa.co,aa.handle_right,bb.handle_left,bb.co,k/32.)
                rim_world.append(rim.matrix_world@p)
if len(rim_world)<32:
    raise RuntimeError("Insufficient actual Bezier oculus samples")
ring_z=sorted(p.z for p in rim_world)[len(rim_world)//2]
if max(abs(p.z-ring_z) for p in rim_world)>.08:
    raise RuntimeError("Oculus ring unexpectedly nonplanar")
cx=sum(p.x for p in rim_world)/len(rim_world)
cy=sum(p.y for p in rim_world)/len(rim_world)
inner_ring=[(cx+(p.x-cx)*.88,cy+(p.y-cy)*.88) for p in rim_world]
projected=[]
behind=0
for xyz in rim_world:
    pr=world_to_camera_view(scene,cam,xyz)
    if pr.z>1e-6:projected.append((float(pr.x),float(pr.y)))
    else:behind+=1
projected_bounds=({
    "left":min(p[0] for p in projected),"right":max(p[0] for p in projected),
    "bottom":min(p[1] for p in projected),"top":max(p[1] for p in projected)
} if projected else None)
center_u=(sum(p[0] for p in projected)/len(projected) if projected else None)
center_v=(sum(p[1] for p in projected)/len(projected) if projected else None)
def in_polygon(x,y,polygon):
    inside=False
    j=len(polygon)-1
    for i in range(len(polygon)):
        x1,y1=polygon[i];x2,y2=polygon[j]
        if ((y1>y)!=(y2>y)) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:
            inside=not inside
        j=i
    return inside
def in_opening(u,v):
    o,d=camera_ray(u,v)
    if abs(d.z)<1e-8:
        return False
    travel=(ring_z-o.z)/d.z
    if travel<=1e-5:
        return False
    pos=o+d*travel
    return in_polygon(pos.x,pos.y,inner_ring)
def category(name):
    if name is None:return "sky_unblocked"
    if name==roof.name:return "integrated_roof"
    if name in {o.name for o in glass}:return "glass_panel"
    if ("gallery" in name.lower() or "galler" in name.lower()
        or "parapet" in name.lower() or "railing" in name.lower()):
        return "gallery_structure"
    if "oculus" in name.lower() or "lucern" in name.lower():return "other_oculus"
    return "other_geometry"
COLORS={
  "outside":(.08,.09,.12,1),
  "sky_unblocked":(.63,.92,.98,1),
  "integrated_roof":(1.,.58,.17,1),
  "glass_panel":(.65,.36,.95,1),
  "gallery_structure":(.30,.70,.32,1),
  "other_oculus":(.97,.28,.31,1),
  "other_geometry":(.88,.24,.26,1)}
W,H=128,72
img=bpy.data.images.new("P1D-VIS-04 "+ARCH+MODE,width=W,height=H,alpha=True,float_buffer=False)
pixel_data=[]
mask_count=0
counts=Counter()
blockers=Counter()
roof_off_clear=0
glass_off_clear=0
upper_count=0
upper_open=0
glass_names={o.name for o in glass}
for y in range(H):
    v=(y+.5)/H
    for x in range(W):
        u=(x+.5)/W
        if not in_opening(u,v):
            pixel_data.extend(COLORS["outside"])
            continue
        mask_count+=1
        o,d=camera_ray(u,v)
        first=trace(o,d)
        cls=category(first)
        counts[cls]+=1
        if first is not None:blockers[first]+=1
        if trace(o,d,frozenset({roof.name})) is None:roof_off_clear+=1
        if trace(o,d,frozenset(glass_names)) is None:glass_off_clear+=1
        if v>=.65:
            upper_count+=1
            if first is None:upper_open+=1
        pixel_data.extend(COLORS[cls])
img.pixels[:]=pixel_data
img.filepath_raw=str(OUT/("atlas-p1d-vis-04-"+ARCH+"-"+MODE+"-APERTURE-MASK.png"))
img.file_format="PNG"
img.save()
mask_path=Path(img.filepath_raw)
if mask_path.stat().st_size<1000:
    raise RuntimeError("Mask rendering missing")
# Gallery object-space samples: compare actual first-hit vs a virtual panels-off pass.
def gallery_visibility(ob):
    if ob.type!="MESH":
        return {"sampled":0,"note":"not a mesh"}
    world=ob.matrix_world
    faces=ob.data.polygons
    stride=max(1,len(faces)//200)
    visible=0;uncovered=0;tested=0;blocking=Counter()
    for face in faces[::stride]:
        xyz=world@face.center
        pr=world_to_camera_view(scene,cam,xyz)
        if pr.z<=0 or not (0<pr.x<1 and 0<pr.y<1):continue
        direction=xyz-origin_camera
        if direction.length<1e-4:continue
        direction.normalize()
        first=trace(origin_camera,direction)
        second=trace(origin_camera,direction,frozenset(glass_names))
        tested+=1
        if first==ob.name:visible+=1
        else:blocking[first if first else "sky_unblocked"]+=1
        if second==ob.name:uncovered+=1
    return {"sampled":tested,"visible_first_hit":visible,
            "visible_without_glass":uncovered,
            "occluders":dict(blocking.most_common(10)),
            "visibility_fraction":(visible/tested if tested else None),
            "without_glass_fraction":(uncovered/tested if tested else None)}
gallery={}
gallery[upper.name]=gallery_visibility(upper)
gallery[lower.name]=gallery_visibility(lower)
# Supplement the known rails with other independently named gallery meshes.
extras=[o for o,_ in bvh_objects if o.name not in gallery
        and any(s in o.name.lower() for s in ("galler","balcon","parapet","railing"))]
for o in extras[:8]:
    gallery[o.name]=gallery_visibility(o)
# Integrate true Cycles HERO brightness for empty rays; geometry/photometry remain distinct.
hero_name=previous["variants"][MODE]["render"]["file"]
hero_file=SOURCE.parent/hero_name
photometry={"source_render":hero_name,"available":False}
if hero_file.exists():
    hero=bpy.data.images.load(str(hero_file),check_existing=False)
    if tuple(hero.size)==(960,540):
        p=list(hero.pixels)
        sums=Counter();nums=Counter()
        for y in range(H):
            for x in range(W):
                u=(x+.5)/W;v=(y+.5)/H
                if not in_opening(u,v):continue
                o,d=camera_ray(u,v)
                name=trace(o,d)
                cls=("clear_rays" if name is None else "blocked_rays")
                ix=min(959,int(u*960));iy=min(539,int(v*540))
                b=4*(iy*960+ix)
                l=.2126*p[b]+.7152*p[b+1]+.0722*p[b+2]
                sums[cls]+=l
                nums[cls]+=1
        photometry={"source_render":hero_name,"available":True,
                    "mean_linear_rgb_luminance_by_ray_class":{
                       cls:(sums[cls]/nums[cls] if nums[cls] else None)
                       for cls in ("clear_rays","blocked_rays")}}
    bpy.data.images.remove(hero)
report={
 "schema":"atlas.artdir02.p1d-visibility/v1",
 "arch":ARCH,"structural_variant":MODE,
 "source_sha256":sha(SOURCE),
 "source_qualifying_run_id":45008316673,
 "canonical_art_sha256":previous["canonical_art_sha256"],
 "camera":{"name":cam.name,"lens":cam.data.lens,
           "shift_x":cam.data.shift_x,"shift_y":cam.data.shift_y,
           "matrix_world":[list(row) for row in cam.matrix_world]},
 "oculus":{"projected_center_normalized":[center_u,center_v],
           "projected_rim_bounds_normalized":projected_bounds,
           "bezier_samples_behind_camera":behind,
           "sampling_method":"forward camera rays intersect real oculus XY footprint at median Z",
           "interior_sampling_factor":.88,
           "samples_in_image":mask_count,
           "coverage_of_image":mask_count/(W*H),
           "actual_first_hit_categories":dict(counts),
           "first_hit_object_counts":dict(blockers.most_common(20)),
           "sky_unobstructed_fraction":counts["sky_unblocked"]/mask_count if mask_count else None,
           "roof_hidden_sky_clear_fraction":roof_off_clear/mask_count if mask_count else None,
           "glass_hidden_sky_clear_fraction":glass_off_clear/mask_count if mask_count else None,
           "upper_band_sample_count":upper_count,
           "upper_band_sky_clear_fraction":upper_open/upper_count if upper_count else None,
           "measurable":mask_count>=24},
 "galleries":gallery,
 "photometry_of_prior_neutral_render":photometry,
 "material_override_is_clay":True,
 "glass_transparency_is_not_art_final":True,
 "roof_mesh_untouched":True,
 "global_interference_certified":False,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "mask":{"file":mask_path.name,"sha256":sha(mask_path)},
 "interpretation":"Camera-space first-hit visibility, not lighting design or artistic acceptance. The virtual exclusions alter ray tests only; the scene and four source Blender files are never saved."
}
jsonpath=OUT/("atlas-p1d-vis-04-"+ARCH+"-"+MODE+"-receipt.json")
jsonpath.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
for bm in bm_keep:bm.free()
print("VIS04_DIAGNOSTIC_COMPLETE",ARCH,MODE,"ROI",mask_count,
      "CLEAR",counts["sky_unblocked"],"BLOCKERS",dict(blockers.most_common(8)))
