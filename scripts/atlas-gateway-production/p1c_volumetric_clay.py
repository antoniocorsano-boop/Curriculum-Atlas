#!/usr/bin/env python3
"""ART-DIR-02 P1C: a controlled, reversible volumetric experiment on P1B.
P1B .blend is immutable. Neither camera, portal transforms nor oculus meshes
are modified. This is scenic reconstruction, NOT photogrammetric truth.
"""
import bpy, hashlib, json, math, statistics, sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in argv: raise RuntimeError("P1C requires --out")
OUT=Path(argv[argv.index("--out")+1]).resolve()
OUT.mkdir(parents=True, exist_ok=True)
SOURCE=Path(bpy.data.filepath)
SOURCE_SHA="e16fa837ea85d27eff225c3a4e4fc8ff63e00a298a597d8710d32d3536351c7c"
def digest(path):
    h=hashlib.sha256()
    with open(path,"rb") as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b""):h.update(chunk)
    return h.hexdigest()
if SOURCE.name!="atlas-art-dir02-p1b-multianchor-clay.blend" or digest(SOURCE)!=SOURCE_SHA:
    raise RuntimeError("Use precisely the archived immutable P1B Blender model")
scene=bpy.context.scene
def obj(name):
    thing=bpy.data.objects.get(name)
    if thing is None: raise RuntimeError("P1B object missing: "+name)
    return thing
hero=obj("CAM_HERO_ARCH04")
control=obj("ATLAS_P1_PARAMETRIC_CONTROL")
rim=obj("ATLAS R7 • ONE golden oculus light seam")
sky=obj("OCULUS ARCH04 • visible open sky")
upper=obj("ARCH04 • second gallery handrail")
lower=obj("ARCH04 • first gallery handrail")
podium=obj("ATLAS ARCH04 • low elliptical convex canopy")
names=("Curricolo","Esplora","Percorsi","Esperienze")
roots=[obj("Portale • "+n) for n in names]
panes=[obj(n+" • vetro cobalto") for n in names]
bases=[o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
sources=[c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases)!=4 or len(sources)!=3: raise RuntimeError("Missing original bases or CC0 source collections")
if not bpy.context.view_layer.material_override: raise RuntimeError("P1B neutral clay override missing")
scene.camera=hero
camera_before=(tuple(hero.matrix_world),hero.data.lens,hero.data.shift_y)
root_before={p.name:tuple(p.matrix_world) for p in roots}
def sample(ob,limit=500):
    if ob.type=="MESH":
        step=max(1,len(ob.data.vertices)//limit)
        return [ob.matrix_world @ p.co for p in list(ob.data.vertices)[::step]]
    if ob.type=="CURVE":
        p=[]
        for spl in ob.data.splines:
            if spl.type=="BEZIER":p.extend(ob.matrix_world@v.co for v in spl.bezier_points)
            else:p.extend(ob.matrix_world@Vector(v.co[:3]) for v in spl.points)
        return p[::max(1,len(p)//limit)]
    return [ob.matrix_world @ Vector(v) for v in ob.bound_box]
def projected(ob,limit=500):
    return [(p.x,1-p.y) for p in (world_to_camera_view(scene,hero,w) for w in sample(ob,limit))]
def screen_box(ob):
    pts=projected(ob)
    return dict(left=min(x for x,y in pts),right=max(x for x,y in pts),
                top=min(y for x,y in pts),bottom=max(y for x,y in pts))
def rail_y(ob):
    pts=projected(ob)
    center=sorted(pts,key=lambda q:abs(q[0]-0.5))[:max(12,len(pts)//10)]
    return statistics.median(q[1] for q in center)
def portals():
    return {n:screen_box(p) for n,p in zip(names,panes)}
def gap(port):return port["Percorsi"]["left"]-port["Esplora"]["right"]
def smooth(x):
    t=max(0.0,min(1.0,x))
    return t*t*(3.0-2.0*t)
p0=portals()
g0={"upper":rail_y(upper),"lower":rail_y(lower)}
r0=screen_box(rim);d0=screen_box(podium)
ring_pts=sample(rim,2000)
cx=statistics.median(p.x for p in ring_pts)
cy=statistics.median(p.y for p in ring_pts)
ring_z=statistics.median(p.z for p in ring_pts)
ring_r=statistics.median(math.hypot(p.x-cx,p.y-cy) for p in ring_pts)
upper_z=statistics.median(v.z for v in sample(upper,2000))
lower_z=statistics.median(v.z for v in sample(lower,2000))
if ring_r<=0.1 or upper_z<=lower_z:
    raise RuntimeError("Unexpected P1B ring radius or gallery elevations")
# Use a single smooth field across adjacent structural meshes and curves,
# then pin it to zero around the roof collar and on the lower gallery.
struct=tuple(o for o in scene.objects if o.type in ("MESH","CURVE") and
              o.name.startswith(("ARCH04 •","ARCH04B •",
              "OCULUS ARCH04 •","ATLAS R7 • continuous dark rear vault",
              "ATLAS R7 • one dark skylight collar",
              "ATLAS R7 • ONE golden oculus light seam")))
if len(struct)<100:raise RuntimeError("Incomplete real P1B structural geometry")
# Critical hard anchors. In particular, preserve sky, collar and illuminated rim.
locked={rim.name,sky.name}
locked.update(o.name for o in struct if "skylight collar" in o.name)
editable={}
for ob in struct:
    if ob.name in locked:continue
    ob.data=ob.data.copy()
    if ob.type=="MESH":
        editable[ob.name]=[(v, "co", v.co.copy()) for v in ob.data.vertices]
    else:
        entries=[]
        for spl in ob.data.splines:
            if spl.type=="BEZIER":
                for p in spl.bezier_points:
                    for attr in ("co","handle_left","handle_right"):
                        entries.append((p,attr,getattr(p,attr).copy()))
            else:
                for p in spl.points: entries.append((p,"co",p.co.copy()))
        editable[ob.name]=entries
instances=[o for o in scene.objects if o.type=="EMPTY" and
           o.name.startswith("ATLAS R6C • ") and o.instance_type=="COLLECTION"]
instance_orig={o.name:o.location.copy() for o in instances}

def shift(w,lift,depth):
    z=w.z
    # Upper gallery: local rise, gently tapered in both vertical directions.
    span=max(.55, (upper_z-lower_z)*.42)
    gallery=lift*math.exp(-((z-upper_z)/span)**2)
    gallery*=smooth((z-lower_z)/max(.4,upper_z-lower_z)*1.40)
    gallery*=1-smooth((z-(ring_z-.40))/.45)
    # Vault: more vertical relief at the perimeter while the ring remains fixed.
    radius=math.hypot(w.x-cx,w.y-cy)
    peripheral=smooth((radius-ring_r*1.02)/max(.85,ring_r*.65))
    top_band=smooth((z-upper_z-.12)/.90)
    ring_pin=1-smooth((z-(ring_z-.36))/.75)
    vault=-depth*peripheral*top_band*ring_pin
    return gallery+vault

def apply(label,lift_req,depth):
    # Do not bring the upper handrail through the anchored roof collar.
    clearance=max(0.0,ring_z-upper_z-.25)
    lift=min(lift_req,clearance*.75)
    n_changed=0; max_d=0.
    for ob in struct:
        if ob.name not in editable:continue
        mw=ob.matrix_world.copy(); inv=mw.inverted_safe()
        for v,attr,original in editable[ob.name]:
            vec=Vector(original[:3])
            world=mw@vec
            delta=shift(world,lift,depth)
            new=inv@Vector((world.x,world.y,world.z+delta))
            if len(original)==4:setattr(v,attr,(new.x,new.y,new.z,original[3]))
            else:setattr(v,attr,new)
            if abs(delta)>0.0001:n_changed+=1;max_d=max(max_d,abs(delta))
    for o in instances:
        o.location=instance_orig[o.name].copy()
        o.location.z+=shift(o.location,lift,depth)
    bpy.context.view_layer.update()
    pn=portals(); rn=screen_box(rim); dn=screen_box(podium)
    gn={"upper":rail_y(upper),"lower":rail_y(lower)}
    deviations={k:max(abs(pn[k][dim]-p0[k][dim]) for dim in ("left","right","top","bottom"))
                for k in names}
    ring_d=max(abs(rn[k]-r0[k]) for k in ("left","right","top","bottom"))
    podium_d=max(abs(dn[k]-d0[k]) for k in ("left","right","top","bottom"))
    invariants=(max(deviations.values())<.002 and ring_d<.002 and podium_d<.002 and
                all(tuple(p.matrix_world)==root_before[p.name] for p in roots) and
                (tuple(hero.matrix_world),hero.data.lens,hero.data.shift_y)==camera_before)
    if not invariants:raise RuntimeError(label+": portal, camera, skylight or podium drift")
    if n_changed<100 or max_d<.02:raise RuntimeError(label+": no real structural deformation")
    return {"lift_bu":lift,"depth_bu":depth,"changed_control_points":n_changed,
            "maximum_vertex_shift_bu":max_d,"gallery":gn,
            "gallery_separation_fraction":gn["lower"]-gn["upper"],
            "portals":pn,"central_gap_fraction":gap(pn),
            "rim":rn,"podium":dn,"camera_unchanged":True,
            "portal_max_drift_fraction":max(deviations.values()),
            "oculus_max_drift_fraction":ring_d,"podium_max_drift_fraction":podium_d,
            "gallery_gain_fraction":gn["lower"]-gn["upper"]-(g0["lower"]-g0["upper"]),
            "geometric_invariants_pass":invariants}
scene.render.engine="CYCLES"
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
def render(label,samples=12):
    scene.render.resolution_x=960;scene.render.resolution_y=540
    scene.cycles.samples=samples
    path=OUT/("atlas-p1c-"+label+".png")
    scene.render.filepath=str(path)
    bpy.ops.render.render(write_still=True)
    if not path.exists() or path.stat().st_size<12000:
        raise RuntimeError("Missing Blender preview "+label)
    return {"name":path.name,"sha256":digest(path),"bytes":path.stat().st_size,
            "resolution":[960,540]}
# A/B are real distinct clay scenes, not generated images or filters.
variants={}
for code,lift,depth in (("A",.38,.50),("B",.68,.90)):
    measured=apply(code,lift,depth)
    measured["render"]=render(code,12)
    variants[code]=measured
# B is an explicit candidate, NOT an artistic winner. Its .blend is editable.
chosen=apply("B-final",.68,.90)
if chosen["gallery_gain_fraction"]<=0:
    raise RuntimeError("P1C failed to restore any real gallery separation")
control["P1C_variant"]="B_CANDIDATE_NOT_ART_APPROVED"
control["P1C_gallery_lift_bu"]=chosen["lift_bu"]
control["P1C_vault_perimeter_depth_bu"]=chosen["depth_bu"]
control["P1C_original_P1B_SHA256"]=SOURCE_SHA
control["P1C_method"]="single smooth structural field; camera, portals and oculus fixed"
control["P1C_state"]="TECH_CANDIDATE__HUMAN_ART_REVIEW_PENDING"
bpy.ops.file.pack_all()
master=OUT/"atlas-art-dir02-p1c-volumetric-clay.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(master))
receipt={
    "schema":"atlas.artdir02.p1c-volumetry/v1",
    "state":"TECH_EXECUTED__ARTISTIC_REVIEW_PENDING",
    "source_p1b_sha256":SOURCE_SHA,"model_sha256":digest(master),
    "reference_art_dir02_sha256":"a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe",
    "ring_reference_geometry":{"centroid":[cx,cy,ring_z],"median_radius_bu":ring_r},
    "gallery_elevations_original_bu":{"upper":upper_z,"lower":lower_z},
    "P1B":{"portal_centres":{n:(p0[n]["left"]+p0[n]["right"])/2 for n in names},
           "central_gap_fraction":gap(p0),"rim":r0,"gallery":g0,"podium":d0,
           "gallery_separation_fraction":g0["lower"]-g0["upper"]},
    "variants":variants,"selected_candidate":"B","final_measurement":chosen,
    "original_CC0_collections":len(sources),"original_portal_bases":len(bases),
    "human_art_approved":False,"no_merge":True,"no_deploy":True,
    "hotspot_revalidation_required":True,
    "synthetic_perspective_warning":True}
(OUT/"atlas-p1c-volumetric-receipt.json").write_text(
    json.dumps(receipt,indent=2,ensure_ascii=False),encoding="utf-8")
print("ATLAS_P1C_REAL_BLENDER_FINISHED",json.dumps({
    "gallery_gain":round(chosen["gallery_gain_fraction"],4),
    "roof_vertex_shift":round(chosen["maximum_vertex_shift_bu"],3),
    "ring_drift":chosen["oculus_max_drift_fraction"],
    "portals_drift":chosen["portal_max_drift_fraction"],
    "artistic_approval":False}))
