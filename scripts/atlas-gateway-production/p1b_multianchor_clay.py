#!/usr/bin/env python3
"""ART-DIR-02 P1B — genuinely execute multi-anchor correction on preserved P1.
Single Blender scene, clay only. Simultaneous portal, sky rim, gallery and
podium image-space objectives; local top-volume warp is a declared scenic
compensation, not fake fSpy/metric reconstruction.
"""
import bpy, math, json, hashlib, sys, statistics
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args:raise RuntimeError("P1B requires --out")
OUT=Path(args[args.index("--out")+1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
SHA_P1="d35c42c2f4b50dafa01dfb7ab27a113ec9c954b09b6629e2239c54b589833a3b"
def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for buf in iter(lambda:f.read(1024*1024),b""):h.update(buf)
    return h.hexdigest()
if SOURCE.name!="atlas-art-dir02-p1-perceptual-clay.blend" or digest(SOURCE)!=SHA_P1:
    raise RuntimeError("The verified archival P1 .blend must be source")
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
control=bpy.data.objects.get("ATLAS_P1_PARAMETRIC_CONTROL")
rim=bpy.data.objects.get("ATLAS R7 • ONE golden oculus light seam")
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
upper=bpy.data.objects.get("ARCH04 • second gallery handrail")
lower=bpy.data.objects.get("ARCH04 • first gallery handrail")
podium=bpy.data.objects.get("ATLAS ARCH04 • low elliptical convex canopy")
names=("Curricolo","Esplora","Percorsi","Esperienze")
roots={n:bpy.data.objects.get("Portale • "+n) for n in names}
panes={n:bpy.data.objects.get(n+" • vetro cobalto") for n in names}
if not all([hero,control,rim,sky,upper,lower,podium]) or not all(roots.values()) or not all(panes.values()):
    raise RuntimeError("Real P1 reference geometry, controller, camera and 4 portals required")
if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source")])!=3:
    raise RuntimeError("Original professional CC0 source collections missing")
bases=[o.name for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
if len(bases)!=4:raise RuntimeError("Four original semantic portal bases required")
ref={
 "Curricolo":(.200,.195,.642),
 "Esplora":(.389,.226,.617),
 "Percorsi":(.616,.227,.612),
 "Esperienze":(.801,.198,.644)
}
def points(ob,maxn=240):
    if ob.type=="MESH":
        v=list(ob.data.vertices)
        step=max(1,len(v)//maxn)
        return [ob.matrix_world@p.co for p in v[::step]]
    if ob.type=="CURVE":
        result=[]
        for s in ob.data.splines:
            if s.type=="BEZIER":
                result.extend(ob.matrix_world@p.co for p in s.bezier_points)
            else:
                result.extend(ob.matrix_world@Vector(p.co[:3]) for p in s.points)
        return result
    return [ob.matrix_world@Vector(v) for v in ob.bound_box]
def project(coords,delta=0):
    result=[]
    for old in coords:
        v=old.copy();v.z-=delta*smooth(v.z)
        xy=world_to_camera_view(scene,hero,v)
        result.append((xy.x,1-xy.y))
    return result
def smooth(z):
    t=max(0.,min(1.,(z-4.35)/6.05))
    return t*t*(3-2*t)
def box(coords):
    xx=[p[0] for p in coords];yy=[p[1] for p in coords]
    return {"left":min(xx),"right":max(xx),"top":min(yy),"bottom":max(yy),
            "cx":(min(xx)+max(xx))/2,"cy":(min(yy)+max(yy))/2}
def on_screen(ob,delta=0):
    return box(project(points(ob,160),delta))
def portal_obs():
    return {n:box(project(points(panes[n],8))) for n in names}
def portal_gap(obs):
    return obs["Percorsi"]["left"]-obs["Esplora"]["right"]
def portal_error(obs):
    return sum(
        4.0*(obs[n]["cx"]-ref[n][0])**2+
        1.8*(obs[n]["top"]-ref[n][1])**2+
        1.8*(obs[n]["bottom"]-ref[n][2])**2
        for n in names)
def rail_y(ob,delta):
    pairs=project(points(ob,500),delta)
    central=sorted(pairs,key=lambda v:abs(v[0]-.5))[:max(12,len(pairs)//10)]
    return statistics.median(v[1] for v in central)
def within(value,a,b):
    return max(a-value,0,value-b)**2
camera_before={"location":list(hero.location),"rotation":list(hero.rotation_euler),
               "focal":hero.data.lens,"shift_y":hero.data.shift_y}
roots_before={n:{"location":list(o.location),"rotation":list(o.rotation_euler),
                 "scale":list(o.scale)} for n,o in roots.items()}
initial=portal_obs()
initial_rim=on_screen(rim)
initial_rails={"upper":rail_y(upper,0),"lower":rail_y(lower,0)}
initial_podium=on_screen(podium)
baseline_err=portal_error(initial)
# Source clay comparison: real P1 as loaded. Original P1 is NEVER overwritten.
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
def render(label,w,h,samples):
    scene.camera=hero;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    file=OUT/("atlas-p1b-"+label+".png")
    scene.render.filepath=str(file);bpy.ops.render.render(write_still=True)
    if not file.exists() or file.stat().st_size<12000:
        raise RuntimeError("Missing true Cycles render "+label)
    return {"file":file.name,"sha256":digest(file),"bytes":file.stat().st_size,
            "resolution":[w,h]}
source_image=render("P1-before",960,540,12)
# A narrow adjustment of source P1 portal roots, from its excess centre gap
# to the reference's visibly wider-than-R8 but smaller-than-P1 interval.
for n in ("Esplora","Percorsi"):
    roots[n].location.x=roots_before[n]["location"][0]*.944
bpy.context.view_layer.update()
sample_rim=points(rim,320)
sample_upper=points(upper,600)
sample_lower=points(lower,600)
sample_podium=points(podium,220)
# Keep original 3D source points constant while testing possible upper-shell
# changes; no geometry mutation in the camera-fitting loop.
best=None
for focal in (29.,31.,32.,33.):
 for camera_z in (3.35,3.55,3.75):
  for aim_z in (2.50,2.70,2.90,3.10):
   for shift_y in (-.11,-.075,-.04,0.0):
    hero.location=(0,-18.3,camera_z)
    hero.rotation_euler=(Vector((0,2.7,aim_z))-hero.location).to_track_quat("-Z","Y").to_euler()
    hero.data.lens=focal;hero.data.shift_y=shift_y
    bpy.context.view_layer.update()
    ps=portal_obs()
    err_port=portal_error(ps)
    gap=portal_gap(ps)
    # Recompute camera-only features once; delta is a local scenic roof warp.
    pb=box(project(sample_podium))
    for delta in (0.4,0.9,1.4,1.9,2.4,2.9,3.4):
        rb=box(project(sample_rim,delta))
        uy=statistics.median(v[1] for v in sorted(project(sample_upper,delta),
          key=lambda q:abs(q[0]-.5))[:35])
        ly=statistics.median(v[1] for v in sorted(project(sample_lower,delta),
          key=lambda q:abs(q[0]-.5))[:35])
        # Multi-anchor: 4 portals + centre gap + sky rim + both gallery
        # levels + podium; bounded scene warp is a deliberate scenic degree
        # of freedom for synthetic perspective, not a metric reconstruction.
        score=(err_port+
               13.0*(rb["bottom"]-.137)**2+
               12.0*within(rb["bottom"],.070,.225)+
               8.0*within(rb["top"],-.50,.035)+
               7.0*(gap-.061)**2+
               3.0*within(gap,.038,.092)+
               1.2*within(uy,.09,.34)+
               1.2*within(ly,.21,.57)+
               4.0*within(ly-uy,.085,.32)+
               .8*within(pb["top"],.37,.61)+
               .8*within(pb["bottom"],.56,.83)+
               .0018*delta**2+
               .0012*(focal-32)**2)
        if best is None or score<best["total_objective"]:
            best={"total_objective":score,"portal_objective":err_port,
             "gap":gap,"rim":rb,"gallery":{"upper":uy,"lower":ly},
             "podium":pb,"roof_warp_bu":delta,"focal_mm":focal,
             "camera":[0,-18.3,camera_z],"aim_z":aim_z,
             "shift_y":shift_y,"portals":ps}
hero.location=best["camera"]
hero.rotation_euler=(Vector((0,2.7,best["aim_z"]))-hero.location).to_track_quat("-Z","Y").to_euler()
hero.data.lens=best["focal_mm"];hero.data.shift_y=best["shift_y"]
bpy.context.view_layer.update()
# Apply one continuous z-warp above the bottom gallery to ALL structural
# objects, not only the oculus. This preserves edge continuity instead of
# lowering a free-floating skylight disc.
delta=best["roof_warp_bu"]
PREFIX=("ARCH04 •","ARCH04B •","OCULUS ARCH04 •",
 "ATLAS R7 • continuous dark rear vault","ATLAS R7 • one dark skylight collar",
 "ATLAS R7 • ONE golden oculus light seam")
warped=[]
for ob in list(scene.objects):
    if ob.type not in ("MESH","CURVE") or not ob.name.startswith(PREFIX):continue
    mw=ob.matrix_world.copy(); inv=mw.inverted_safe()
    if ob.type=="MESH":
        ob.data=ob.data.copy()
        for v in ob.data.vertices:
            w=mw@v.co
            w.z-=delta*smooth(w.z)
            v.co=inv@w
    else:
        ob.data=ob.data.copy()
        for spline in ob.data.splines:
            if spline.type=="BEZIER":
                for p in spline.bezier_points:
                    for key in ("co","handle_left","handle_right"):
                        old=getattr(p,key)
                        w=mw@old;w.z-=delta*smooth(w.z)
                        setattr(p,key,inv@w)
            else:
                for p in spline.points:
                    old=Vector(p.co[:3]);w=mw@old
                    w.z-=delta*smooth(w.z)
                    new=inv@w;p.co=(new.x,new.y,new.z,p.co.w)
    warped.append(ob.name)
if len(warped)<100:raise RuntimeError("Incomplete continuous structural warp")
# Reposition all inherited upper-gallery botanical/decorative instances
# within the compressed roof region, preserving their immutable CC0 meshes.
moved=[]
for ob in list(scene.objects):
    if ob.type=="EMPTY" and ob.name.startswith("ATLAS R6C • ") and ob.instance_type=="COLLECTION":
        old=ob.location.z;ob.location.z-=delta*smooth(old)
        moved.append(ob.name)
# Any original gallery handrail must still be physically above the lower rail.
bpy.context.view_layer.update()
final_portals=portal_obs();final_rim=on_screen(rim)
final_galleries={"upper":rail_y(upper,0),"lower":rail_y(lower,0)}
final_podium=on_screen(podium)
gap=portal_gap(final_portals)
# A gate in addition to technical receipt: do not falsely approve the
# perspective if oculus is missing or four portals collapse again.
image_gate={
 "oculus_visible":(.055<=final_rim["bottom"]<=.24 and final_rim["top"]<.09),
 "portal_centres_near_reference":all(abs(final_portals[n]["cx"]-ref[n][0])<.050 for n in names),
 "central_gap_plausible":(.038<=gap<=.095),
 "two_gallery_levels_ordered":final_galleries["upper"]<final_galleries["lower"],
 "portal_anchor_error_bounded":portal_error(final_portals)<.055,
 "podium_visible":(.28<final_podium["top"]<.70 and
                   .49<final_podium["bottom"]<.91)
}
perceptual_gate=all(image_gate.values())
for key,val in (("P1B_roof_warp_bu",delta),("P1B_focal_mm",best["focal_mm"]),
 ("P1B_camera_z",best["camera"][2]),("P1B_aim_z",best["aim_z"]),
 ("P1B_shift_y",best["shift_y"]),
 ("P1B_inner_portal_ratio",.944),
 ("P1B_perceptual_gate",int(perceptual_gate))):
    control[key]=val
control["P1B_method"]="multi-anchor clay; synthetic perspective, controlled roof scenic warp"
control["P1B_state"]="P1B_GEOMETRY_CANDIDATE__HUMAN_ART_APPROVAL_PENDING"
# Keep clay override in saved file, source materials retained and editable.
if not bpy.context.view_layer.material_override:
    raise RuntimeError("Neutral clay material override was lost")
if len([o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")])!=4:
    raise RuntimeError("Original four separate portal bases lost")
if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
    raise RuntimeError("Original CC0 source collections lost")
bpy.ops.file.pack_all()
master=OUT/"atlas-art-dir02-p1b-multianchor-clay.blend"
scene.camera=hero;bpy.ops.wm.save_as_mainfile(filepath=str(master))
candidate_image=render("P1B-multianchor",1152,648,20)
receipt={
 "schema":"atlas.artdir02.p1b-multianchor/v1",
 "state":"REAL_EDITABLE_P1B_CLAY__ART_REVIEW_REQUIRED",
 "source_p1_sha256":digest(SOURCE),"model_sha256":digest(master),
 "reference_sha256":"a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe",
 "camera_original":camera_before,"roots_original":roots_before,
 "manual_reference_anchors":{k:list(v) for k,v in ref.items()},
 "source_portals":initial,"source_rim":initial_rim,
 "source_gallery":initial_rails,"source_podium":initial_podium,
 "source_portal_anchor_error":baseline_err,
 "chosen_fitting_params":best,"final_portals":final_portals,
 "final_rim":final_rim,"final_gallery":final_galleries,
 "final_podium":final_podium,"final_gap_fraction":gap,
 "final_portal_anchor_error":portal_error(final_portals),
 "geometry_warped_objects":len(warped),
 "genuine_CC0_gallery_instances_repositioned":moved,
 "perceptual_gate_details":image_gate,
 "perceptual_gate_pass":perceptual_gate,
 "fspy_used":False,"synthetic_perspective_warning":True,
 "hotspot_revalidation_required_before_web":True,
 "human_art_approved":False,"no_merge":True,"no_deploy":True,
 "renders":{"P1":source_image,"P1B":candidate_image}}
(OUT/"atlas-p1b-multianchor-receipt.json").write_text(json.dumps(receipt,indent=2,ensure_ascii=False))
print("ATLAS_P1B_GENUINE_BLENDER_COMPLETE",json.dumps({
 "portal_error_before":round(baseline_err,5),
 "portal_error_after":round(portal_error(final_portals),5),
 "rim_lower":round(final_rim["bottom"],3),
 "gap":round(gap,3),"roof_warp_bu":delta,
 "perceptual_gate_pass":perceptual_gate,
 "gate_details":image_gate}))
