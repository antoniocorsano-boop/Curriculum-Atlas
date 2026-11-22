#!/usr/bin/env python3
"""P1D-ARCH-HEIGHT-01: reversible constructive vertical recovery.
Two independent Blender candidates from immutable P1D/B v2. Camera, portal
panes, podium and source mesh data are preserved. No artistic auto-approval.
"""
import bpy
import hashlib
import json
import math
import statistics
import struct
import sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args:
    raise RuntimeError("P1D-ARCH-HEIGHT requires --out")
OUT = Path(args[args.index("--out")+1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = Path(bpy.data.filepath)
B_SHA = "587cf7f84141ebc652a5a9d0382e5f7904ef4cfba749a9ec0274f521fc4adcfa"
ART_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"

def digest(p):
    h=hashlib.sha256()
    with open(p,"rb") as file:
        for chunk in iter(lambda:file.read(1048576),b""):
            h.update(chunk)
    return h.hexdigest()

if SOURCE.name != "atlas-art-dir02-p1d-B-constructive.blend" or digest(SOURCE)!=B_SHA:
    raise RuntimeError("P1D/B immutable source was not recovered correctly")
receipt_path=SOURCE.parent/"atlas-p1d-constructive-receipt.json"
receipt=json.loads(receipt_path.read_text(encoding="utf-8"))
if receipt.get("schema") != "atlas.artdir02.p1d-constructive/v2":
    raise RuntimeError("Unexpected original P1D receipt")
if receipt["variants"]["B"]["blend"]["sha256"]!=B_SHA:
    raise RuntimeError("Original model receipt has different checksum")

scene=bpy.context.scene
def required(name):
    obj=bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError("Missing preserved scene object: "+name)
    return obj

hero=required("CAM_HERO_ARCH04")
rim=required("ATLAS R7 • ONE golden oculus light seam")
sky=required("OCULUS ARCH04 • visible open sky")
podium=required("ATLAS ARCH04 • low elliptical convex canopy")
vault=required("P1D • continuous curved vault")
upper_beam=required("P1D • B upper curved slab")
upper_rail=required("P1D • B upper railing")
lower_beam=required("P1D • B lower curved slab")
lower_rail=required("P1D • B lower railing")
labels=("Curricolo","Esplora","Percorsi","Esperienze")
roots=[required("Portale • "+name) for name in labels]
panes=[required(name+" • vetro cobalto") for name in labels]
bases=[ob for ob in scene.objects
       if ob.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0=[c for c in bpy.data.collections
     if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases)!=4 or len(cc0)!=3:
    raise RuntimeError("Four bases and three CC0 collections required")
if not bpy.context.view_layer.material_override:
    raise RuntimeError("Neutral P1D clay material override missing")
scene.camera=hero

ring_c=receipt["ring"]["center"]
cx,cy,ring_z=(float(a) for a in ring_c)
ring_r=float(receipt["ring"]["radius_bu"])
inner=float(receipt["variants"]["B"]["vault"]["inner_radius_bu"])
outer=float(receipt["variants"]["B"]["vault"]["outer_radius_bu"])
upper_radius=float(receipt["variants"]["B"]["galleries"]["upper"]["radius_bu"])
upper_z=float(receipt["variants"]["B"]["galleries"]["upper"]["surface_z_bu"])
lower_z=float(receipt["variants"]["B"]["galleries"]["lower"]["surface_z_bu"])
parapet=float(receipt["variants"]["B"]["galleries"]["upper"]["parapet_height_bu"])
original_clearance=float(receipt["variants"]["B"]["min_roof_parapet_clearance_bu"])
if not (ring_z>upper_z>lower_z and original_clearance>.1):
    raise RuntimeError("Original ceiling-to-gallery hierarchy invalid")

camera_matrix=hero.matrix_world.copy()
camera_settings=(float(hero.data.lens),float(hero.data.shift_x),
                 float(hero.data.shift_y),float(hero.data.sensor_width))

def mesh_fingerprint(ob):
    hashval=hashlib.sha256()
    hashval.update(ob.type.encode("ascii"))
    if ob.type=="MESH":
        for v in ob.data.vertices:
            hashval.update(struct.pack("<ddd",float(v.co.x),float(v.co.y),float(v.co.z)))
        hashval.update(str(len(ob.data.polygons)).encode())
    elif ob.type=="CURVE":
        for spline in ob.data.splines:
            if spline.type=="BEZIER":
                for p in spline.bezier_points:
                    hashval.update(struct.pack("<ddd",*tuple(float(x) for x in p.co)))
            else:
                for p in spline.points:
                    hashval.update(struct.pack("<dddd",*tuple(float(x) for x in p.co)))
    return hashval.hexdigest()

protected=roots+panes+bases+[podium,lower_beam,lower_rail,rim,sky,upper_beam,upper_rail,vault]
preserved_data={o.name:(tuple(tuple(row) for row in o.matrix_world),
                         mesh_fingerprint(o)) for o in protected}
original_count=len(scene.objects)
original_mesh_count=len(bpy.data.meshes)
original_hides={o.name:o.hide_render for o in
                [rim,sky,upper_beam,upper_rail,vault]}

def same_geometry():
    bpy.context.view_layer.update()
    if tuple(tuple(row) for row in hero.matrix_world)!=tuple(tuple(row) for row in camera_matrix):
        raise RuntimeError("Camera location/rotation changed during architectural experiment")
    if (float(hero.data.lens),float(hero.data.shift_x),
            float(hero.data.shift_y),float(hero.data.sensor_width))!=camera_settings:
        raise RuntimeError("Camera lens/shift changed")
    for ob in protected:
        prior_matrix,prior_fingerprint=preserved_data[ob.name]
        if tuple(tuple(row) for row in ob.matrix_world)!=prior_matrix:
            raise RuntimeError("Original geometry transform edited: "+ob.name)
        if mesh_fingerprint(ob)!=prior_fingerprint:
            raise RuntimeError("Original geometry mesh edited: "+ob.name)
    if len([c for c in bpy.data.collections
            if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
        raise RuntimeError("Lost CC0 source data")

def samples(ob,limit=900):
    if ob.type=="MESH":
        vertices=list(ob.data.vertices)
        step=max(1,len(vertices)//limit)
        return [ob.matrix_world @ v.co for v in vertices[::step]]
    if ob.type=="CURVE":
        points=[]
        for spline in ob.data.splines:
            if spline.type=="BEZIER":
                points.extend(ob.matrix_world@p.co for p in spline.bezier_points)
            else:
                points.extend(ob.matrix_world@Vector(p.co[:3]) for p in spline.points)
        return points[::max(1,len(points)//limit)]
    return [ob.matrix_world@Vector(p) for p in ob.bound_box]

def bounding(ob):
    xy=[(q.x,1-q.y) for q in
        (world_to_camera_view(scene,hero,p) for p in samples(ob))]
    x=[p[0] for p in xy]
    y=[p[1] for p in xy]
    return {"left":min(x),"right":max(x),"top":min(y),"bottom":max(y),
            "height":max(y)-min(y),"width":max(x)-min(x),
            "centre_y":(min(y)+max(y))*.5}

def fraction_visible(b):
    area=max(b["height"]*b["width"],1e-12)
    visible=max(0.,min(1.,b["right"])-max(0.,b["left"])) * max(
        0.,min(1.,b["bottom"])-max(0.,b["top"]))
    return min(1.,visible/area)

def centre_y(ob):
    pts=[(p.x,1-p.y) for p in
         (world_to_camera_view(scene,hero,xyz) for xyz in samples(ob))]
    near=sorted(pts,key=lambda v:abs(v[0]-.5))[:max(6,len(pts)//10)]
    return statistics.median(p[1] for p in near)

def metrics(ring_obj, upper_obj):
    p={name:bounding(o) for name,o in zip(labels,panes)}
    ringbox=bounding(ring_obj)
    podbox=bounding(podium)
    gallery_top=centre_y(upper_obj)
    gallery_low=centre_y(lower_rail)
    return {
       "rim":ringbox,"portals":p,"podium":podbox,
       "headroom_fraction":statistics.median(v["top"] for v in p.values())-ringbox["bottom"],
       "gallery_separation_fraction":gallery_low-gallery_top,
       "gallery_upper_central_y":gallery_top,
       "gallery_lower_central_y":gallery_low,
       "oculus_visible_fraction":fraction_visible(ringbox),
       "portal_visibility":{name:fraction_visible(v) for name,v in p.items()},
       "podium_visible_fraction":fraction_visible(podbox),
    }

scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.cycles.samples=12
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero

def render(code,suffix="HERO",cam=None):
    scene.camera=cam or hero
    out=OUT/("atlas-p1d-arch-"+code+"-"+suffix+".png")
    scene.render.filepath=str(out)
    bpy.ops.render.render(write_still=True)
    if not out.is_file() or out.stat().st_size<12000:
        raise RuntimeError("No valid Blender Cycles render: "+str(out))
    return {"file":out.name,"sha256":digest(out),"bytes":out.stat().st_size}

baseline=metrics(rim,upper_rail)
baseline_image=render("BASE")
same_geometry()

def make_collection(name):
    col=bpy.data.collections.new(name)
    scene.collection.children.link(col)
    return col

def clone(ob,label,target):
    copy=ob.copy()
    if ob.data:
        copy.data=ob.data.copy()
    copy.name=label
    copy.parent=None
    target.objects.link(copy)
    copy.matrix_world=ob.matrix_world.copy()
    copy.hide_render=False
    return copy

def move_world_z(ob,dz):
    matrix=ob.matrix_world.copy()
    matrix.translation.z += dz
    ob.matrix_world=matrix

def vault_profile(delta_oculus,delta_edge,t):
    # Continuous height interpolation; profile radius and curvature stay real.
    return delta_edge*(t**.8)+delta_oculus*((1-t)**1.15)

def elevate_vault(target_obj,oculus_delta,edge_delta):
    world=target_obj.matrix_world.copy()
    inv=world.inverted()
    deltas=[]
    for v in target_obj.data.vertices:
        wp=world@v.co
        dist=math.hypot(wp.x-cx,(wp.y-cy)/.92)
        t=min(1.,max(0.,(dist-inner)/(outer-inner)))
        dz=vault_profile(oculus_delta,edge_delta,t)
        wp.z+=dz
        v.co=inv@wp
        deltas.append(dz)
    target_obj.data.update()
    return {"min_added_z_bu":min(deltas),
            "max_added_z_bu":max(deltas),
            "profile_deltas_bu":[vault_profile(oculus_delta,edge_delta,i/4)
                                 for i in range(5)],
            "changed_vertices":len(deltas)}

def section_render(code,target,ring_copy,upper_copy):
    cd=bpy.data.cameras.new("ARCH section camera "+code)
    cd.type="ORTHO"
    cd.ortho_scale=outer*2.3
    cam=bpy.data.objects.new("ARCH section camera "+code,cd)
    scene.collection.objects.link(cam)
    focus=Vector((cx,cy,(ring_z+lower_z)/2))
    cam.location=(cx+outer*2.75,cy,focus.z)
    cam.rotation_euler=(focus-Vector(cam.location)).to_track_quat("-Z","Y").to_euler()
    show={o.as_pointer() for o in target.objects}
    show.update([lower_beam.as_pointer(),lower_rail.as_pointer()])
    prev={o.name:o.hide_render for o in scene.objects
          if o.type in ("MESH","CURVE","FONT")}
    for ob in scene.objects:
        if ob.type in ("MESH","CURVE","FONT") and ob.as_pointer() not in show:
            ob.hide_render=True
    try:
        return render(code,"SECTION",cam)
    finally:
        for ob in scene.objects:
            if ob.name in prev:
                ob.hide_render=prev[ob.name]
        scene.camera=hero
        bpy.data.objects.remove(cam,do_unlink=True)
        if cd.users==0:
            bpy.data.cameras.remove(cd)

variants={}
for code,oculus_dz,edge_dz,upper_dz in (
    ("A",.52,.24,.18),
    ("B",1.00,.49,.35),
):
    target=make_collection("ARCH-HEIGHT "+code+" constructive extension")
    existing=[rim,sky,upper_beam,upper_rail,vault]
    hidden_before={o.name:o.hide_render for o in existing}
    try:
        for ob in existing:
            ob.hide_render=True
        elevated_rim=clone(rim,"ARCH "+code+" raised oculus rim",target)
        elevated_sky=clone(sky,"ARCH "+code+" raised sky opening",target)
        elevated_upper=clone(upper_rail,"ARCH "+code+" upper parapet",target)
        elevated_slab=clone(upper_beam,"ARCH "+code+" upper gallery slab",target)
        elevated_vault=clone(vault,"ARCH "+code+" custom lofted vault",target)
        move_world_z(elevated_rim,oculus_dz)
        move_world_z(elevated_sky,oculus_dz)
        move_world_z(elevated_upper,upper_dz)
        move_world_z(elevated_slab,upper_dz)
        vault_result=elevate_vault(elevated_vault,oculus_dz,edge_dz)
        # Lower order stays exactly at the original world-space elevation.
        # Check the upper guardrail at the same rear radial section.
        t=max(0.,min(1.,(upper_radius-inner)/(outer-inner)))
        estimated_clearance=original_clearance+vault_profile(oculus_dz,edge_dz,t)-upper_dz
        if estimated_clearance<.10:
            raise RuntimeError("Upper gallery clashes with curved vaulted ceiling")
        same_geometry()
        projection=metrics(elevated_rim,elevated_upper)
        if projection["headroom_fraction"]<=baseline["headroom_fraction"]+.01:
            raise RuntimeError("Insufficient measurable increase of vertical headroom")
        if projection["gallery_separation_fraction"]<=baseline["gallery_separation_fraction"]+.004:
            raise RuntimeError("Upper gallery did not gain readable vertical separation")
        hero_image=render(code)
        profile_image=section_render(code,target,elevated_rim,elevated_upper)
        scene.camera=hero
        scene["ARCH_HEIGHT_candidate"]=code
        scene["ARCH_HEIGHT_source_SHA256"]=B_SHA
        scene["ARCH_HEIGHT_oculus_z_delta_BU"]=oculus_dz
        scene["ARCH_HEIGHT_upper_gallery_z_delta_BU"]=upper_dz
        scene["ARCH_HEIGHT_vault_skirt_z_delta_BU"]=edge_dz
        scene["ARCH_HEIGHT_art_approved"]=0
        path=OUT/("atlas-p1d-arch-height-"+code+".blend")
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(path))
        variants[code]={
           "oculus_rise_bu":oculus_dz,
           "outer_vault_rise_bu":edge_dz,
           "upper_gallery_rise_bu":upper_dz,
           "lower_gallery_rise_bu":0.,
           "real_gallery_separation_bu":upper_z+upper_dz-lower_z,
           "new_oculus_z_bu":ring_z+oculus_dz,
           "new_upper_gallery_z_bu":upper_z+upper_dz,
           "estimated_clearance_bu":estimated_clearance,
           "vault":vault_result,
           "projection":projection,
           "headroom_gain_fraction":projection["headroom_fraction"]-baseline["headroom_fraction"],
           "gallery_separation_gain_fraction":projection["gallery_separation_fraction"]-baseline["gallery_separation_fraction"],
           "oculus_crop_warning":projection["oculus_visible_fraction"]<.9,
           "hero":hero_image,"section":profile_image,
           "editable_blend":{"file":path.name,"sha256":digest(path),"bytes":path.stat().st_size},
           "art_approved":False,
        }
    finally:
        for ob in existing:
            ob.hide_render=hidden_before[ob.name]
        for ob in list(target.objects):
            data=ob.data
            bpy.data.objects.remove(ob,do_unlink=True)
            if data and data.users==0:
                if isinstance(data,bpy.types.Mesh):
                    bpy.data.meshes.remove(data)
                elif isinstance(data,bpy.types.Curve):
                    bpy.data.curves.remove(data)
        bpy.data.collections.remove(target)
        scene.camera=hero
        same_geometry()

if set(variants)!={"A","B"}:
    raise RuntimeError("Missing independent variants")
if not variants["B"]["headroom_gain_fraction"]>variants["A"]["headroom_gain_fraction"]+.008:
    raise RuntimeError("Monumental A/B height tests collapsed to near-identical projections")
if len(scene.objects)!=original_count or len(bpy.data.meshes)!=original_mesh_count:
    raise RuntimeError("Source scene objects leaked between experimental variants")
report={
 "schema":"atlas.artdir02.p1d-arch-height/v1",
 "base_source_sha256":B_SHA,
 "canonical_image_sha256":ART_SHA,
 "source_architecture":{"oculus_z_bu":ring_z,
    "upper_gallery_z_bu":upper_z,
    "lower_gallery_z_bu":lower_z,
    "original_min_clearance_bu":original_clearance,
    "inner_radius_bu":inner,"outer_radius_bu":outer},
 "camera":{"unchanged":True,"lens_mm":camera_settings[0],
   "location_xyz_bu":[float(x) for x in camera_matrix.translation]},
 "baseline":{"projection":baseline,"hero":baseline_image},
 "variants":variants,
 "source_originals_preserved":True,
 "portals_podium_source_geometry_locked":True,
 "synthetic_image_cannot_supply_unique_metric_reconstruction":True,
 "art_approved":False,"no_merge":True,"no_deploy":True,
 "interpretation":"Height parameter sensitivity only; image comparison and human art review required",
 "recommendation":"Assess crop of lifted oculus. If clipped, test Lens Shift separately after geometry review.",
}
report_file=OUT/"atlas-p1d-arch-height-01-receipt.json"
report_file.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_ARCH_HEIGHT_TRUE_BLENDER_PASS",json.dumps({
    "source":B_SHA,"candidates":list(variants),
    "headroom_gains":{k:round(v["headroom_gain_fraction"],5) for k,v in variants.items()},
    "oculus_visibility":{k:round(v["projection"]["oculus_visible_fraction"],4)
                         for k,v in variants.items()},
    "art_approved":False}))
