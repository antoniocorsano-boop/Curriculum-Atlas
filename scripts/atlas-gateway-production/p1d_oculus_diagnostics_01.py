#!/usr/bin/env python3
"""ATLAS ART-DIR-02 P1D-OCULUS-01
Five actual Cycles diagnostic renders per original A-S1/B-S1 .blend.
Do not delete sources; preserve camera, geometry and original CC0 collections.
Artistic approval is deliberately outside this script.
"""
import bpy
import hashlib
import json
import math
import struct
import sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args or "--arch" not in args:
    raise RuntimeError("Require --out <directory> --arch A|B")
OUT=Path(args[args.index("--out")+1]).resolve()
ARCH=args[args.index("--arch")+1].strip().upper()
if ARCH not in ("A","B"):
    raise RuntimeError("ARCH must be A or B")
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
OPT_SHA={
    "A":"aaa26dadd12db864ed29e2417c565e4b8888b86f0953378c63918b5aef7fcbb9",
    "B":"a6fa0e3ad34e55305eea3524a9cae652bb59df173da57e6680c79bc81583363f",
}
ART_SHA="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
def sha256(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for block in iter(lambda:f.read(1048576),b""):
            h.update(block)
    return h.hexdigest()

if SOURCE.name!="atlas-p1d-opt-"+ARCH+"-S1.blend" or sha256(SOURCE)!=OPT_SHA[ARCH]:
    raise RuntimeError("P1D-OCULUS-01 requires the exact verified P1D-OPT S1 source binary")
original_receipt=json.loads((SOURCE.parent/("atlas-p1d-opt-"+ARCH+"-receipt.json")).read_text(encoding="utf-8"))
if (original_receipt["schema"]!="atlas.artdir02.p1d-optical-shift/v1"
    or original_receipt["cases"]["S1"]["editable_model"]["sha256"]!=OPT_SHA[ARCH]):
    raise RuntimeError("Optical source receipt does not match binary")
scene=bpy.context.scene
def need(name):
    obj=bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError("Expected Blender object absent: "+name)
    return obj

hero=need("CAM_HERO_ARCH04")
rim=need("ARCH "+ARCH+" raised oculus rim")
vault=need("ARCH "+ARCH+" custom lofted vault")
sky=need("ARCH "+ARCH+" raised sky opening")
upper=need("ARCH "+ARCH+" upper parapet")
lower=need("P1D • B lower railing")
podium=need("ATLAS ARCH04 • low elliptical convex canopy")
portal_names=("Curricolo","Esplora","Percorsi","Esperienze")
panes=[need(n+" • vetro cobalto") for n in portal_names]
portals=[need("Portale • "+n) for n in portal_names]
bases=[ob for ob in scene.objects if ob.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0=[c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
radial_prefix="OCULUS ARCH04 • delicate radial mullion"
radials=sorted([o for o in scene.objects if o.name.startswith(radial_prefix)],key=lambda o:o.name)
active_radials=[o for o in radials if not o.hide_render]
if len(bases)!=4 or len(cc0)!=3 or len(radials)!=12 or len(active_radials)!=4:
    raise RuntimeError("Unexpected P1D-OPT v1 object inventory: need four visible original mullions")
if not bpy.context.view_layer.material_override:
    raise RuntimeError("Neutral scene shading was not preserved")

cam_matrix=hero.matrix_world.copy()
cam_values=(float(hero.data.lens),float(hero.data.shift_x),
            float(hero.data.shift_y),float(hero.data.sensor_width))
original_objects=list(scene.objects)
orig_object_count=len(scene.objects)
orig_mesh_count=len(bpy.data.meshes)
original_hides={o.name:bool(o.hide_render) for o in original_objects}
protected=portals+panes+bases+[rim,vault,sky,upper,lower,podium]+radials
def fingerprint(o):
    h=hashlib.sha256()
    h.update(o.type.encode("utf-8"))
    if o.type=="MESH":
        h.update(str(len(o.data.polygons)).encode("utf-8"))
        for v in o.data.vertices:
            h.update(struct.pack("<ddd",float(v.co.x),float(v.co.y),float(v.co.z)))
    elif o.type=="CURVE":
        for spline in o.data.splines:
            if spline.type=="BEZIER":
                for p in spline.bezier_points:
                    h.update(struct.pack("<ddd",*(float(v) for v in p.co)))
            else:
                for p in spline.points:
                    h.update(struct.pack("<dddd",*(float(v) for v in p.co)))
    return h.hexdigest()
protected_state={
    o.name:{"matrix":tuple(tuple(float(v) for v in row) for row in o.matrix_world),
            "fingerprint":fingerprint(o)}
    for o in protected
}

def verify_protected(expected_hides=None,allow_extra=0):
    bpy.context.view_layer.update()
    if (tuple(tuple(float(v) for v in row) for row in hero.matrix_world)
        !=tuple(tuple(float(v) for v in row) for row in cam_matrix)):
        raise RuntimeError("Camera rotation or position drift")
    if (float(hero.data.lens),float(hero.data.shift_x),
        float(hero.data.shift_y),float(hero.data.sensor_width))!=cam_values:
        raise RuntimeError("Camera lens or shift was modified")
    if len(scene.objects)!=orig_object_count+allow_extra:
        raise RuntimeError("Unexpected scene object count")
    if len([c for c in bpy.data.collections
            if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
        raise RuntimeError("CC0 source collection count changed")
    for ob in protected:
        state=protected_state[ob.name]
        if tuple(tuple(float(v) for v in row) for row in ob.matrix_world)!=state["matrix"]:
            raise RuntimeError("Protected object transform changed: "+ob.name)
        if fingerprint(ob)!=state["fingerprint"]:
            raise RuntimeError("Protected object's mesh/curve changed: "+ob.name)
    for ob in original_objects:
        prior=original_hides[ob.name]
        expected=(expected_hides or {}).get(ob.name,prior)
        if bool(ob.hide_render)!=expected:
            raise RuntimeError("Unexpected original hide_render changed: "+ob.name)

def sample_points(ob,limit=600):
    if ob.type=="MESH":
        verts=list(ob.data.vertices)
        return [ob.matrix_world@v.co for v in verts[::max(1,len(verts)//limit)]]
    if ob.type=="CURVE":
        pts=[]
        for sp in ob.data.splines:
            if sp.type=="BEZIER":
                pts.extend(ob.matrix_world@p.co for p in sp.bezier_points)
            else:
                pts.extend(ob.matrix_world@Vector(p.co[:3]) for p in sp.points)
        return pts[::max(1,len(pts)//limit)]
    return [ob.matrix_world@Vector(p) for p in ob.bound_box]

def bounds(ob):
    pts=sample_points(ob)
    if not pts:
        return None
    box_screen=[world_to_camera_view(scene,hero,p) for p in pts]
    return {
      "world_z_range_bu":[min(p.z for p in pts),max(p.z for p in pts)],
      "screen_bounds":[min(q.x for q in box_screen),
                       min(1-q.y for q in box_screen),
                       max(q.x for q in box_screen),
                       max(1-q.y for q in box_screen)],
    }

inventory=[]
for ob in sorted(scene.objects,key=lambda x:x.name):
    name=ob.name.lower()
    if any(key in name for key in ("oculus","vault","radial","lucern","corona","rib","ARCH "+ARCH.lower()+" raised".lower())):
        inventory.append({
          "name":ob.name,
          "type":ob.type,
          "hide_render":bool(ob.hide_render),
          "visible_from_object_flag":not ob.hide_render,
          "collections":[c.name for c in ob.users_collection],
          "bounds":bounds(ob),
        })

scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.cycles.samples=16
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=hero
verify_protected()

def take_render(label):
    p=OUT/("atlas-p1d-oculus-"+ARCH+"-"+label+".png")
    scene.render.filepath=str(p)
    bpy.ops.render.render(write_still=True)
    if not p.exists() or p.stat().st_size<12000:
        raise RuntimeError("Invalid Cycles render "+str(p))
    return {"file":p.name,"sha256":sha256(p),"bytes":p.stat().st_size,
            "size":[960,540]}

def put_model(label):
    # Only the controlled diagnostic state is saved; original source remains.
    scene["ATLAS_OCULUS_STAGE"]="non_destructive_diagnostic"
    scene["ATLAS_OCULUS_CASE"]=ARCH+"/"+label
    scene["ATLAS_OCULUS_SOURCE_SHA256"]=OPT_SHA[ARCH]
    scene["ATLAS_OCULUS_ART_APPROVED"]=0
    p=OUT/("atlas-p1d-oculus-"+ARCH+"-"+label+".blend")
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(p))
    if not p.exists() or p.stat().st_size<1000000:
        raise RuntimeError("Missing editable diagnostic blend")
    return {"file":p.name,"sha256":sha256(p),"bytes":p.stat().st_size}

rise=float(scene.get("ARCH_HEIGHT_oculus_z_delta_BU",-1.))
expected_rise=.52 if ARCH=="A" else 1.
if abs(rise-expected_rise)>1e-4:
    raise RuntimeError("Source oculus-rise provenance differs from expected candidate")

cases={}
sequence=("BASE","LEGACY_OFF","LEGACY_RAISED","RIM_OFF","VAULT_OFF")
for scenario in sequence:
    for ob in original_objects:
        ob.hide_render=original_hides[ob.name]
    newcol=None
    clones=[]
    expected_hides={}
    try:
        if scenario in ("LEGACY_OFF","LEGACY_RAISED"):
            for ob in active_radials:
                ob.hide_render=True
                expected_hides[ob.name]=True
        elif scenario=="RIM_OFF":
            rim.hide_render=True
            expected_hides[rim.name]=True
        elif scenario=="VAULT_OFF":
            vault.hide_render=True
            expected_hides[vault.name]=True
        if scenario=="LEGACY_RAISED":
            newcol=bpy.data.collections.new("OCULUS "+ARCH+" adapted radial diagnostics")
            scene.collection.children.link(newcol)
            for original in active_radials:
                obj=original.copy()
                if original.data:
                    obj.data=original.data.copy()
                obj.name="OCULUS "+ARCH+" raised mullion copy from "+original.name
                obj.parent=None
                newcol.objects.link(obj)
                mx=original.matrix_world.copy()
                mx.translation.z+=rise
                obj.matrix_world=mx
                obj.hide_render=False
                clones.append(obj)
            if len(clones)!=4:
                raise RuntimeError("Expected four raised copied mullions")
        verify_protected(expected_hides,allow_extra=len(clones))
        image=take_render(scenario)
        info={"render":image,"hidden_original_names":sorted(expected_hides),
              "created_copy_count":len(clones),
              "original_source_unchanged":True,
              "art_approved":False}
        if scenario in ("LEGACY_OFF","LEGACY_RAISED"):
            info["editable_model"]=put_model(scenario)
        cases[scenario]=info
    finally:
        for obj in clones:
            data=obj.data
            bpy.data.objects.remove(obj,do_unlink=True)
            if data is not None and data.users==0:
                if isinstance(data,bpy.types.Mesh):
                    bpy.data.meshes.remove(data)
                elif isinstance(data,bpy.types.Curve):
                    bpy.data.curves.remove(data)
        if newcol is not None:
            bpy.data.collections.remove(newcol)
        for ob in original_objects:
            ob.hide_render=original_hides[ob.name]
        scene.camera=hero
        verify_protected()

if set(cases)!=set(sequence):
    raise RuntimeError("Missing diagnostic scenario")
if len(scene.objects)!=orig_object_count or len(bpy.data.meshes)!=orig_mesh_count:
    raise RuntimeError("Temporary clones leaked into the original scene")
report={
  "schema":"atlas.artdir02.p1d-oculus-diagnostic/v1",
  "architecture":ARCH,
  "source_opt_s1_sha256":OPT_SHA[ARCH],
  "art_reference_sha256":ART_SHA,
  "camera_preserved":True,
  "geometry_original_preserved":True,
  "source_original_hide_render_restored":True,
  "visible_legacy_radials":[ob.name for ob in active_radials],
  "total_legacy_radial_objects":len(radials),
  "applied_raised_copy_delta_z_bu":rise,
  "original_oculus_rim_world_z":bounds(rim)["world_z_range_bu"],
  "active_legacy_radial_bounds":[{"name":ob.name,"bounds":bounds(ob)}
                                 for ob in active_radials],
  "inventoried_architectural_objects":inventory,
  "cases":cases,
  "candidate_isolation_only":True,
  "no_automatic_artistic_winner":True,
  "human_art_approved":False,"no_merge":True,"no_deploy":True,
  "interpretation":"Geometry-preserving visibility and cloned-geometry diagnostic only; visual approval and engineering join checks required."
}
(OUT/("atlas-p1d-oculus-"+ARCH+"-receipt.json")).write_text(
  json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_OCULUS_TRUE_BLENDER_DIAGNOSTICS_PASS",json.dumps({
    "arch":ARCH,"real_source_sha":OPT_SHA[ARCH],
    "cases":list(cases),"original_radials_active":len(active_radials),
    "radial_copy_rise_bu":rise,"human_art_approved":False}))
