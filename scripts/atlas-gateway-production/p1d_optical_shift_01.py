#!/usr/bin/env python3
"""ATLAS ART-DIR-02 P1D-OPT-01 — lens shift only, measured on real ARCH .blend.
Do not change camera transforms, lens, or architecture. Preserve original source.
Technical metrics do not constitute an artistic approval.
"""
import bpy
import hashlib
import json
import math
import struct
import statistics
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
SHAS={
    "A":"5caa24317093be2dfe5d56c5984bc3d1c4d40ce0f638bea773dfc592b58197fc",
    "B":"653979b0a2c7f784552d03f3271e9d24a56e53dbdaacf0e73bbb8271e3ff9fcc",
}
ART_SHA="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as file:
        for data in iter(lambda:file.read(1048576),b""):
            h.update(data)
    return h.hexdigest()
if SOURCE.name!="atlas-p1d-arch-height-"+ARCH+".blend" or digest(SOURCE)!=SHAS[ARCH]:
    raise RuntimeError("Wrong actual immutable ARCH source Blender model")
parent_report=SOURCE.parent/"atlas-p1d-arch-height-01-receipt.json"
parent=json.loads(parent_report.read_text(encoding="utf-8"))
if parent["schema"]!="atlas.artdir02.p1d-arch-height/v1" or parent["variants"][ARCH]["editable_blend"]["sha256"]!=SHAS[ARCH]:
    raise RuntimeError("ARCH source report does not match Blender file")

scene=bpy.context.scene
def need(name):
    obj=bpy.data.objects.get(name)
    if obj is None:
        raise RuntimeError("Required preserved original object missing: "+name)
    return obj
hero=need("CAM_HERO_ARCH04")
rim=need("ARCH "+ARCH+" raised oculus rim")
upper=need("ARCH "+ARCH+" upper parapet")
lower=need("P1D • B lower railing")
podium=need("ATLAS ARCH04 • low elliptical convex canopy")
vault=need("ARCH "+ARCH+" custom lofted vault")
sky=need("ARCH "+ARCH+" raised sky opening")
labels=("Curricolo","Esplora","Percorsi","Esperienze")
panes=[need(label+" • vetro cobalto") for label in labels]
portals=[need("Portale • "+label) for label in labels]
bases=[o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0=[c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases)!=4 or len(cc0)!=3:
    raise RuntimeError("Immutable four portal bases or CC0 sources missing")
if not bpy.context.view_layer.material_override:
    raise RuntimeError("Keep original neutral clay shading and lighting")
if scene.get("ARCH_HEIGHT_candidate")!=ARCH:
    raise RuntimeError("ARCH candidate mismatch in source file")

orig_cam_matrix=hero.matrix_world.copy()
orig_cam_lens=float(hero.data.lens)
orig_shift_x=float(hero.data.shift_x)
orig_shift_y=float(hero.data.shift_y)
orig_sensor=float(hero.data.sensor_width)
count_objects=len(scene.objects)
count_meshes=len(bpy.data.meshes)
locked=panes+portals+bases+[rim,upper,lower,podium,vault,sky]
def geom_signature(obj):
    h=hashlib.sha256()
    h.update(obj.type.encode())
    if obj.type=="MESH":
        h.update(str(len(obj.data.polygons)).encode())
        for v in obj.data.vertices:
            h.update(struct.pack("<ddd",float(v.co.x),float(v.co.y),float(v.co.z)))
    elif obj.type=="CURVE":
        for spline in obj.data.splines:
            if spline.type=="BEZIER":
                for p in spline.bezier_points:
                    h.update(struct.pack("<ddd",*(float(x) for x in p.co)))
            else:
                for p in spline.points:
                    h.update(struct.pack("<dddd",*(float(x) for x in p.co)))
    return h.hexdigest()
locked_state={o.name:(
    tuple(tuple(float(x) for x in row) for row in o.matrix_world),
    geom_signature(o),bool(o.hide_render)) for o in locked}
def assert_unchanged():
    bpy.context.view_layer.update()
    if tuple(tuple(float(x) for x in row) for row in hero.matrix_world)!=tuple(
        tuple(float(x) for x in row) for row in orig_cam_matrix):
        raise RuntimeError("Optical stage changed camera transform")
    if (float(hero.data.lens),float(hero.data.shift_x),float(hero.data.sensor_width)) != (
            orig_cam_lens,orig_shift_x,orig_sensor):
        raise RuntimeError("Optical stage changed lens, shift X, or camera sensor")
    if len(scene.objects)!=count_objects or len(bpy.data.meshes)!=count_meshes:
        raise RuntimeError("Optical stage altered original object/mesh count")
    if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
        raise RuntimeError("Optical stage altered CC0 collection count")
    for o in locked:
        matrix,signature,hidden=locked_state[o.name]
        if tuple(tuple(float(x) for x in row) for row in o.matrix_world)!=matrix:
            raise RuntimeError("Altered original mesh transform "+o.name)
        if geom_signature(o)!=signature or bool(o.hide_render)!=hidden:
            raise RuntimeError("Altered original mesh data or visibility "+o.name)

def sample(obj, limit=650):
    if obj.type=="MESH":
        verts=list(obj.data.vertices)
        return [obj.matrix_world @ v.co for v in verts[::max(1,len(verts)//limit)]]
    if obj.type=="CURVE":
        coords=[]
        for spline in obj.data.splines:
            if spline.type=="BEZIER":
                coords.extend(obj.matrix_world@p.co for p in spline.bezier_points)
            else:
                coords.extend(obj.matrix_world@Vector(p.co[:3]) for p in spline.points)
        return coords[::max(1,len(coords)//limit)]
    return [obj.matrix_world@Vector(p) for p in obj.bound_box]
def projected(obj):
    return [(p.x,1.-p.y) for p in (
        world_to_camera_view(scene,hero,v) for v in sample(obj))]
def bounds(obj):
    xy=projected(obj)
    xx=[x for x,_ in xy]; yy=[y for _,y in xy]
    return {"left":min(xx),"right":max(xx),"top":min(yy),"bottom":max(yy),
            "height":max(yy)-min(yy),"width":max(xx)-min(xx),
            "centre_y":.5*(min(yy)+max(yy))}
def visible_fraction(box):
    area=max(1e-12,box["width"]*box["height"])
    w=max(0.,min(1.,box["right"])-max(0.,box["left"]))
    h=max(0.,min(1.,box["bottom"])-max(0.,box["top"]))
    return min(1.,w*h/area)
def gallery_centre(obj):
    pts=projected(obj)
    near=sorted(pts,key=lambda pt:abs(pt[0]-.5))[:max(6,len(pts)//10)]
    return statistics.median(p[1] for p in near)
def observe():
    pr={label:bounds(o) for label,o in zip(labels,panes)}
    rb=bounds(rim)
    pd=bounds(podium)
    head=statistics.median(b["top"] for b in pr.values())-rb["bottom"]
    gall=gallery_centre(lower)-gallery_centre(upper)
    return {"rim":rb,"portals":pr,"podium":pd,
            "oculus_visible_fraction":visible_fraction(rb),
            "portal_visibility":{k:visible_fraction(v) for k,v in pr.items()},
            "podium_visible_fraction":visible_fraction(pd),
            "headroom_fraction":head,
            "gallery_separation_fraction":gall}
def safe(m):
    return (all(v>.98 for v in m["portal_visibility"].values())
            and m["podium_visible_fraction"]>.98
            and m["rim"]["left"]>-.02 and m["rim"]["right"]<1.02)

scene.camera=hero
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.image_settings.file_format="PNG"
scene.cycles.samples=12
bpy.context.view_layer.cycles.use_denoising=True

def render(tag):
    path=OUT/("atlas-p1d-opt-"+ARCH+"-"+tag+".png")
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    if not path.exists() or path.stat().st_size<12000:
        raise RuntimeError("Real Cycles output missing "+str(path))
    return {"file":path.name,"sha256":digest(path),"bytes":path.stat().st_size,
            "size":[960,540]}

hero.data.shift_y=orig_shift_y
baseline=observe()
assert_unchanged()
base_img=render("BASE")
# Use actual Blender camera projections to calibrate shift sign and magnitude.
# No assumption of +Y or -Y screen direction.
grid=[]
for i in range(-90,91):
    shift=orig_shift_y+i*.005
    hero.data.shift_y=shift
    bpy.context.view_layer.update()
    m=observe()
    if safe(m):
        grid.append((shift,m))
if not grid:
    raise RuntimeError("No optical shift candidate preserves panes, podium and rim width")

chosen={}
for tag,target in (("S1",-.035),("S2",.005)):
    shift,m=min(grid,key=lambda pair:abs(pair[1]["rim"]["top"]-target))
    if abs(m["rim"]["top"]-target)>.018:
        raise RuntimeError("No candidate shift reaches optical target for "+tag)
    chosen[tag]=(shift,m)
if abs(chosen["S1"][0]-chosen["S2"][0])<.01:
    raise RuntimeError("S1 and S2 are not independently distinguishable")
cases={}
for tag in ("S1","S2"):
    shift,_=chosen[tag]
    hero.data.shift_y=shift
    bpy.context.view_layer.update()
    assert_unchanged()
    measured=observe()
    if not safe(measured):
        raise RuntimeError("Render state lost visibility gate")
    if abs(measured["headroom_fraction"]-baseline["headroom_fraction"])>1e-5:
        raise RuntimeError("Optical shift unexpectedly changed apparent headroom")
    if abs(measured["gallery_separation_fraction"]-baseline["gallery_separation_fraction"])>1e-5:
        raise RuntimeError("Optical shift unexpectedly changed gallery separation")
    rendered=render(tag)
    scene["ATLAS_P1D_OPT_STAGE"]="optical_only"
    scene["ATLAS_P1D_OPT_CASE"]=ARCH+"/"+tag
    scene["ATLAS_P1D_OPT_SOURCE_SHA256"]=SHAS[ARCH]
    scene["ATLAS_P1D_OPT_ART_APPROVED"]=0
    path=OUT/("atlas-p1d-opt-"+ARCH+"-"+tag+".blend")
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=str(path))
    cases[tag]={
       "target_rim_top_fraction":-.035 if tag=="S1" else .005,
       "shift_y":shift,
       "delta_shift_y":shift-orig_shift_y,
       "camera_translation_unchanged":True,
       "camera_rotation_unchanged":True,
       "lens_unchanged":True,
       "physical_architecture_unchanged":True,
       "headroom_delta_fraction":measured["headroom_fraction"]-baseline["headroom_fraction"],
       "gallery_separation_delta_fraction":measured["gallery_separation_fraction"]-baseline["gallery_separation_fraction"],
       "composition":measured,
       "render":rendered,
       "editable_model":{"file":path.name,"sha256":digest(path),"bytes":path.stat().st_size},
       "art_approved":False,
    }
hero.data.shift_y=orig_shift_y
bpy.context.view_layer.update()
assert_unchanged()
candidates=[ob for ob in scene.objects
    if any(k in ob.name.lower() for k in ("oculus","vault","lucern","anello","rim"))]
report={
    "schema":"atlas.artdir02.p1d-optical-shift/v1",
    "architecture":ARCH,
    "source_arch_sha256":SHAS[ARCH],
    "canonical_art_sha256":ART_SHA,
    "camera_original":{"shift_y":orig_shift_y,"lens_mm":orig_cam_lens,
       "location":[float(x) for x in orig_cam_matrix.translation]},
    "base":{"composition":baseline,"render":base_img},
    "cases":cases,
    "potential_duplicate_contour_objects":[
      {"name":ob.name,"hidden_from_render":bool(ob.hide_render)}
      for ob in candidates],
    "source_architecture_intact":True,
    "optical_shift_only":True,
    "no_automatic_artistic_winner":True,
    "human_art_approved":False,
    "no_merge":True,"no_deploy":True,
    "comparison_warning":"Lens Shift only translates the perspective framing; it cannot increase height or fix overlapping architecture.",
}
(OUT/("atlas-p1d-opt-"+ARCH+"-receipt.json")).write_text(
    json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_OPTICAL_SHIFT_REAL_BLENDER_PASS",json.dumps({
    "arch":ARCH,"source":SHAS[ARCH],
    "initial_oculus_visible":round(baseline["oculus_visible_fraction"],4),
    "cases":{tag:{"shift":round(v["shift_y"],5),
                  "rim_top":round(v["composition"]["rim"]["top"],5),
                  "oculus_visible":round(v["composition"]["oculus_visible_fraction"],4)}
              for tag,v in cases.items()},
    "no_artistic_approval":True,
}))
