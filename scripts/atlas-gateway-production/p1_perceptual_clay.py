#!/usr/bin/env python3
"""ART-DIR-02/P1 — real editable Blender clay model from immutable R8.
Four portal silhouettes are fitted to approximate normalized image anchors;
fSpy/photogrammetric calibration is NOT claimed. No website publication.
"""
import bpy,math,hashlib,json,sys
from pathlib import Path
from mathutils import Vector,Matrix
from bpy_extras.object_utils import world_to_camera_view
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
OUT=Path(args[args.index("--out")+1]).resolve() if "--out" in args else None
if OUT is None:raise RuntimeError("--out required")
OUT.mkdir(parents=True,exist_ok=True)
SRC=Path(bpy.data.filepath)
R8="2d39c43e0690334ce40627266d083e78d4d4238d25a28d0aaec6be33ef6550f8"
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for c in iter(lambda:f.read(1048576),b""):h.update(c)
    return h.hexdigest()
if SRC.name!="atlas-art-dir02-r8-integrated-atmosphere.blend" or sha(SRC)!=R8:
    raise RuntimeError("Verified immutable R8 Blender master missing")
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
names=("Curricolo","Esplora","Percorsi","Esperienze")
roots={n:bpy.data.objects.get("Portale • "+n) for n in names}
panes={n:bpy.data.objects.get(n+" • vetro cobalto") for n in names}
if not hero or not all(roots.values()) or not all(panes.values()):
    raise RuntimeError("Real HERO and four semantic glass portal objects required")
bases=[o.name for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0=[c.name for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases)!=4 or len(cc0)!=3:raise RuntimeError("Real R6C/R6D scene is incomplete")
original_roots={n:{"location":list(roots[n].location),
 "rotation":list(roots[n].rotation_euler),"scale":list(roots[n].scale)} for n in names}
original_camera={"location":list(hero.location),"focal_mm":hero.data.lens,
 "rotation":list(hero.rotation_euler),"shift_y":hero.data.shift_y}
targets={"Curricolo":(.200,.195,.642),"Esplora":(.389,.226,.617),
 "Percorsi":(.616,.227,.612),"Esperienze":(.801,.198,.644)}
def measured():
    result={}
    for n in names:
        o=panes[n]
        pts=[world_to_camera_view(scene,hero,o.matrix_world@Vector(p)) for p in o.bound_box]
        xx=[p.x for p in pts];yy=[1-p.y for p in pts]
        result[n]={"cx":round((min(xx)+max(xx))/2,5),
         "top":round(min(yy),5),"bottom":round(max(yy),5),
         "left":round(min(xx),5),"right":round(max(xx),5)}
    return result
def loss(obs):
    return sum(4*(obs[n]["cx"]-targets[n][0])**2+
        2*(obs[n]["top"]-targets[n][1])**2+
        2*(obs[n]["bottom"]-targets[n][2])**2 for n in names)
# Clay rendering remains reversible: no replacement of the author's PBR.
clay=bpy.data.materials.new("ATLAS P1 • neutral nonemissive clay")
clay.use_nodes=True
p=clay.node_tree.nodes.get("Principled BSDF")
p.inputs["Base Color"].default_value=(.46,.49,.52,1)
p.inputs["Metallic"].default_value=0;p.inputs["Roughness"].default_value=.86
bpy.context.view_layer.material_override=clay
muted=[]
for obj in scene.objects:
    if obj.name.startswith("PROOF • atmospheric volume "):
        obj.hide_render=True;muted.append(obj.name)
scene.camera=hero
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
def render(label,w,h,samples):
    scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    path=OUT/("atlas-p1-"+label+".png")
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    if not path.is_file() or path.stat().st_size<12000:
        raise RuntimeError("No Cycles image: "+label)
    return {"file":path.name,"sha256":sha(path),"bytes":path.stat().st_size,
            "size_px":[w,h]}
before=measured();before_loss=loss(before)
base_render=render("r8-neutral-baseline",960,540,12)
# Genuine parametric source object: editable Blender custom properties with
# fixed numerical recipe in this script, not an uneditable raster mockup.
control=bpy.data.objects.new("ATLAS_P1_PARAMETRIC_CONTROL",None)
scene.collection.objects.link(control)
control.hide_render=True;control.empty_display_type="CUBE"
control["source"]="ART-DIR-02 synthetic image; manual anchors, uncertain"
control["status"]="P1_CLAY_MODEL_NOT_ART_APPROVED"
control["atrium_width_scale"]=1.135
control["atrium_height_scale"]=1.22
control["portal_spread_inner"]=1.25
control["portal_spread_outer"]=1.14
control["reference_central_gap_fraction"]=.063
control["anchor_uncertainty_px"]=18
sx=float(control["atrium_width_scale"]);sz=float(control["atrium_height_scale"])
pivot=Vector((0,1.3,0))
T=Matrix.Translation(pivot)@Matrix.Diagonal((sx,sx,sz,1))@Matrix.Translation(-pivot)
prefixes=("ARCH04 •","ARCH04B •","OCULUS ARCH04 •",
 "ATLAS R7 • continuous dark rear vault","ATLAS R7 • one dark skylight collar",
 "ATLAS R7 • ONE golden oculus light seam")
changed=[]
for obj in scene.objects:
    if obj.type not in ("MESH","CURVE") or not obj.name.startswith(prefixes):continue
    if obj.parent and obj.parent.name.startswith(prefixes):continue
    obj.matrix_world=T@obj.matrix_world
    changed.append(obj.name)
if len(changed)<80:raise RuntimeError("Atrium spatial transform incomplete")
for n in names:
    roots[n].location.x=original_roots[n]["location"][0]*(
        float(control["portal_spread_inner"]) if n in ("Esplora","Percorsi")
        else float(control["portal_spread_outer"]))
placed=[]
for o in scene.objects:
    if o.name.startswith(("ATLAS R6C • satin metal planter ",
     "ATLAS R6C • CC0 indoor tree ","ATLAS R6C • CC0 decorative shrub ",
     "ATLAS R6C • CC0 modular shelving ")):
        o.location.x*=sx;o.location.y=1.3+(o.location.y-1.3)*sx
        placed.append(o.name)
bpy.context.view_layer.update()
# Fit camera to silhouettes, not to image pixels or light/color.
best=None
for lens in (26,29,32,35):
 for cy in (-18.3,-16.9,-15.6):
  for cz in (3.55,4.10,4.65):
   for aim in (1.0,1.85,2.7):
    for shift in (-.12,-.06,0,.06,.12):
        hero.location=(0,cy,cz)
        hero.rotation_euler=(Vector((0,2.7,aim))-hero.location).to_track_quat("-Z","Y").to_euler()
        hero.data.lens=lens;hero.data.shift_y=shift
        bpy.context.view_layer.update()
        obs=measured();err=loss(obs)+.005*abs(shift)
        if best is None or err<best["score"]:
            best={"score":err,"focal_mm":lens,"position":[0,cy,cz],
             "aim_z":aim,"shift_y":shift,"projected":obs}
hero.location=best["position"]
hero.rotation_euler=(Vector((0,2.7,best["aim_z"]))-hero.location).to_track_quat("-Z","Y").to_euler()
hero.data.lens=best["focal_mm"];hero.data.shift_y=best["shift_y"]
for key,value in (("focal_mm",best["focal_mm"]),("camera_y",best["position"][1]),
 ("camera_z",best["position"][2]),("aim_z",best["aim_z"]),
 ("shift_y",best["shift_y"])):control[key]=value
bpy.context.view_layer.update()
after=measured();after_loss=loss(after)
if not after_loss<before_loss:raise RuntimeError("P1 projected anchors did not improve")
bpy.ops.file.pack_all()
scene.camera=hero
master=OUT/"atlas-art-dir02-p1-perceptual-clay.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(master))
candidate=render("perceptual-clay",1152,648,20)
receipt={"schema":"atlas.artdir02.p1-clay/v1",
 "status":"REAL_EDITABLE_CLAY_CANDIDATE__ART_APPROVAL_REQUIRED",
 "source_r8_sha256":sha(SRC),"model_sha256":sha(master),
 "fspy_calibration_performed":False,"manual_anchor_warning":"approximate; not physical measurements",
 "reference_sha256":"a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe",
 "baseline_portals":before,"candidate_portals":after,
 "reference_targets":{n:list(targets[n]) for n in names},
 "baseline_score":before_loss,"candidate_score":after_loss,
 "best_camera":best,
 "portal_roots_before":original_roots,
 "portal_roots_after":{n:{"location":list(roots[n].location),
     "rotation":list(roots[n].rotation_euler)} for n in names},
 "parametric_control":{k:control[k] for k in control.keys()
     if isinstance(control[k],(int,float,str))},
 "architectural_objects_transformed":len(changed),
 "decorative_objects_repositioned":len(placed),
 "atmospheric_volumes_hidden_for_clay":muted,
 "cc0_collections":cc0,"single_metal_portal_bases":bases,
 "website_hotspots_must_be_revalidated_in_P2":True,
 "no_merge":True,"no_publication":True,"human_art_approved":False,
 "renders":{"baseline":base_render,"clay_candidate":candidate}}
(OUT/"atlas-p1-clay-receipt.json").write_text(json.dumps(receipt,indent=2,ensure_ascii=False))
print("ATLAS_P1_REAL_GEOMETRY_PASS",json.dumps({
 "score_old":round(before_loss,4),"score_new":round(after_loss,4),
 "camera":{k:v for k,v in best.items() if k!="projected"},
 "portals":after,"architecture":len(changed)}))
