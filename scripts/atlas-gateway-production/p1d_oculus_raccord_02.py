#!/usr/bin/env python3
"""ART-DIR-02 / P1D-OCULUS-02.
Actual parametric connection from measured oculus Bezier perimeter to vault
inner ring. Produces candidate J1 (separate Hermite bridge) and J2 (retargeted
first five loft rings) from the qualified A-S1 or B-S1 .blend. Original meshes
and optical camera remain immutable. Technical C0 does NOT imply art approval.
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

args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args or "--arch" not in args:
    raise RuntimeError("Required: --out DIRECTORY --arch A|B")
OUT=Path(args[args.index("--out")+1]).resolve()
ARCH=args[args.index("--arch")+1].upper()
if ARCH not in ("A","B"):
    raise RuntimeError("Invalid architecture")
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
SHA={"A":"aaa26dadd12db864ed29e2417c565e4b8888b86f0953378c63918b5aef7fcbb9",
     "B":"a6fa0e3ad34e55305eea3524a9cae652bb59df173da57e6680c79bc81583363f"}
ART_SHA="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
def checksum(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1<<20),b""):
            h.update(block)
    return h.hexdigest()
if SOURCE.name!="atlas-p1d-opt-"+ARCH+"-S1.blend" or checksum(SOURCE)!=SHA[ARCH]:
    raise RuntimeError("Immutable source binary does not match ART-DIR-02 A-S1 / B-S1")
r=json.loads((SOURCE.parent/("atlas-p1d-opt-"+ARCH+"-receipt.json")).read_text(encoding="utf-8"))
if r["schema"]!="atlas.artdir02.p1d-optical-shift/v1" or r["cases"]["S1"]["editable_model"]["sha256"]!=SHA[ARCH]:
    raise RuntimeError("Original file and optical receipt are inconsistent")
scene=bpy.context.scene
def obj(name):
    o=bpy.data.objects.get(name)
    if o is None:
        raise RuntimeError("Required original object missing: "+name)
    return o
cam=obj("CAM_HERO_ARCH04")
rim=obj("ARCH "+ARCH+" raised oculus rim")
vault=obj("ARCH "+ARCH+" custom lofted vault")
upper=obj("ARCH "+ARCH+" upper parapet")
lower=obj("P1D • B lower railing")
podium=obj("ATLAS ARCH04 • low elliptical convex canopy")
panels=[obj(n+" • vetro cobalto") for n in ("Curricolo","Esplora","Percorsi","Esperienze")]
portals=[obj("Portale • "+n) for n in ("Curricolo","Esplora","Percorsi","Esperienze")]
bases=[o for o in scene.objects if o.name.startswith("ATLAS R6D • sole luminous metal base ")]
cc0=[c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")]
if len(bases)!=4 or len(cc0)!=3:
    raise RuntimeError("P1D source invariant missing CC0 or glass base")
if vault.type!="MESH" or rim.type!="CURVE":
    raise RuntimeError("Expected genuine mesh loft and Bezier oculus curve")
if not bpy.context.view_layer.material_override:
    raise RuntimeError("Clay rendering material override missing")
if vault.hide_render or rim.hide_render:
    raise RuntimeError("This stage requires both original candidate vault and rim visible")
if len(vault.data.vertices)!=33*129 or len(vault.data.polygons)!=32*128:
    raise RuntimeError("Unexpected P1D continuous vault mesh topology; do not silently remesh")
if vault.matrix_world.determinant()==0:
    raise RuntimeError("Noninvertible vault matrix")
original_objects=list(scene.objects)
original_count=len(scene.objects)
original_meshes=len(bpy.data.meshes)
original_hidden={o.name:bool(o.hide_render) for o in original_objects}
cam_matrix=cam.matrix_world.copy()
camera_params=(cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width)
protected=portals+panels+bases+[rim,vault,upper,lower,podium]
def fp(o):
    h=hashlib.sha256(o.type.encode())
    if o.type=="MESH":
        h.update(str(len(o.data.polygons)).encode())
        for v in o.data.vertices:
            h.update(struct.pack("<ddd",*tuple(float(x) for x in v.co)))
    elif o.type=="CURVE":
        for sp in o.data.splines:
            if sp.type=="BEZIER":
                for p in sp.bezier_points:
                    h.update(struct.pack("<ddd",*tuple(float(x) for x in p.co)))
                    h.update(struct.pack("<ddd",*tuple(float(x) for x in p.handle_left)))
                    h.update(struct.pack("<ddd",*tuple(float(x) for x in p.handle_right)))
            else:
                for p in sp.points:
                    h.update(struct.pack("<dddd",*tuple(float(x) for x in p.co)))
    return h.hexdigest()
snap={o.name:{"m":tuple(tuple(float(x) for x in row) for row in o.matrix_world),
              "sha":fp(o)} for o in protected}
def verify(hidden=None,extra=0):
    bpy.context.view_layer.update()
    if tuple(tuple(float(x) for x in row) for row in cam.matrix_world)!=tuple(
            tuple(float(x) for x in row) for row in cam_matrix):
        raise RuntimeError("Camera transform changed unexpectedly")
    if tuple((cam.data.lens,cam.data.shift_x,cam.data.shift_y,cam.data.sensor_width))!=camera_params:
        raise RuntimeError("Camera optical parameters changed")
    if len(scene.objects)!=original_count+extra:
        raise RuntimeError("Unintended source-scene objects created/deleted")
    for o in protected:
        if tuple(tuple(float(x) for x in row) for row in o.matrix_world)!=snap[o.name]["m"]:
            raise RuntimeError("Source matrix modified "+o.name)
        if fp(o)!=snap[o.name]["sha"]:
            raise RuntimeError("Source mesh/curve modified "+o.name)
    for o in original_objects:
        if bool(o.hide_render)!=(hidden or {}).get(o.name,original_hidden[o.name]):
            raise RuntimeError("Original visibility modified "+o.name)
    if len([c for c in bpy.data.collections if c.name.startswith("ATLAS R6C • CC0 source ")])!=3:
        raise RuntimeError("Lost source CC0 collection")

# Evaluate the actual original Bezier guide, not a guessed circular radius.
def eval_bezier(a,b,c,d,t):
    u=1-t
    return u*u*u*a+3*u*u*t*b+3*u*t*t*c+t*t*t*d
points=[]
for sp in rim.data.splines:
    if sp.type=="BEZIER":
        bp=list(sp.bezier_points)
        if len(bp)<2: continue
        count=len(bp) if sp.use_cyclic_u else len(bp)-1
        for i in range(count):
            left=bp[i];right=bp[(i+1)%len(bp)]
            for k in range(64):
                p=eval_bezier(left.co,left.handle_right,
                              right.handle_left,right.co,k/64.)
                points.append(rim.matrix_world@p)
    else:
        points.extend(rim.matrix_world@Vector(p.co[:3]) for p in sp.points)
if len(points)<60:
    raise RuntimeError("Unable to reconstruct real oculus ring contour")
cx=statistics.mean(p.x for p in points)
cy=statistics.mean(p.y for p in points)
ring_z=statistics.median(p.z for p in points)
curve_samples=[]
for p in points:
    theta=math.atan2(p.y-cy,p.x-cx)%(2*math.pi)
    rad=math.hypot(p.x-cx,p.y-cy)
    curve_samples.append((theta,rad,float(p.z)))
curve_samples.sort(key=lambda v:v[0])
if min(row[1] for row in curve_samples)<.1:
    raise RuntimeError("Invalid oculus ring profile")
def rim_for_angle(theta):
    # Periodic linear interpolation of real Bezier samples at a camera-independent azimuth.
    t=theta%(2*math.pi)
    for i in range(len(curve_samples)):
        a=curve_samples[i]
        b=curve_samples[(i+1)%len(curve_samples)]
        at=a[0]
        bt=b[0] if i<len(curve_samples)-1 else b[0]+2*math.pi
        tt=t
        if tt<at: tt+=2*math.pi
        if at<=tt<=bt:
            f=0 if abs(bt-at)<1e-12 else (tt-at)/(bt-at)
            return (a[1]*(1-f)+b[1]*f,
                    a[2]*(1-f)+b[2]*f)
    raise RuntimeError("Cannot interpolate oculus perimeter")
mat=vault.matrix_world.copy()
inverse=mat.inverted()
N=128
verts=list(vault.data.vertices)
world_ring=[mat@verts[i].co for i in range(N+1)]
rim_ring=[]
inner_rad=[]
delta_rad=[]
for i,p in enumerate(world_ring):
    theta=math.atan2(p.y-cy,p.x-cx)
    target_r,target_z=rim_for_angle(theta)
    source_r=math.hypot(p.x-cx,p.y-cy)
    target=Vector((cx+target_r*math.cos(theta),
                   cy+target_r*math.sin(theta),target_z))
    rim_ring.append(target)
    inner_rad.append(source_r)
    delta_rad.append(source_r-target_r)
# Force duplicated seam vertex into exactly the same world position.
rim_ring[-1]=rim_ring[0].copy()
world_ring[-1]=world_ring[0].copy()
if max(abs(p.z-ring_z) for p in rim_ring)>.08:
    raise RuntimeError("Actual rim curve has unexpected nonplanar geometry")
if max(abs(x) for x in delta_rad)>.75:
    raise RuntimeError("Measured radial mismatch too large for local raccord")
if statistics.median(abs(x) for x in delta_rad)<.015:
    raise RuntimeError("No measurable mismatch at original vault/rim seam")
radii_by_row=[]
for j in range(6):
    radii_by_row.append([
        math.hypot((mat@verts[j*(N+1)+i].co).x-cx,
                   (mat@verts[j*(N+1)+i].co).y-cy)
        for i in range(N)])
def stats(vals):
    return {"min":min(vals),"max":max(vals),"median":statistics.median(vals),
            "mean":statistics.mean(vals)}
# Record source contour gap before any intervention, including signed overlaps.
gap_before=stats(delta_rad[:N])
z_before=stats([world_ring[i].z-rim_ring[i].z for i in range(N)])
# Locate the actual outer boundary slope; J1 can blend to this tangent.
outer_neighbour=[mat@verts[(N+1)+i].co for i in range(N+1)]
outer_neighbour[-1]=outer_neighbour[0].copy()

scene.camera=cam
scene.render.engine="CYCLES"
scene.render.resolution_x=960
scene.render.resolution_y=540
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.cycles.samples=14
bpy.context.view_layer.cycles.use_denoising=True
def render(label,override_cam=None):
    scene.camera=override_cam or cam
    p=OUT/("atlas-p1d-oculus-raccord-"+ARCH+"-"+label+".png")
    scene.render.filepath=str(p)
    bpy.ops.render.render(write_still=True)
    if not p.exists() or p.stat().st_size<12000:
        raise RuntimeError("Missing actual Cycles render")
    return {"file":p.name,"sha256":checksum(p),"bytes":p.stat().st_size}

def new_collection(label):
    col=bpy.data.collections.new("ATLAS "+ARCH+" "+label+" oculus raccord")
    scene.collection.children.link(col)
    return col
def new_mesh_object(name,coords,faces,col):
    m=bpy.data.meshes.new(name+" mesh")
    m.from_pydata(coords,[],faces)
    m.update()
    o=bpy.data.objects.new(name,m)
    col.objects.link(o)
    for f in m.polygons:
        f.use_smooth=True
    return o
def make_J1(col):
    # Separate, reversible annular Hermite flange from the real Bezier
    # rim centerline to the actual inner vertex ring of the source vault.
    rows=5
    xyz=[]
    gaps=[]
    for j in range(rows+1):
        t=j/rows
        blend=t*t*(3-2*t)
        for i in range(N+1):
            p=rim_ring[i]
            q=world_ring[i]
            v=p.lerp(q,blend)
            xyz.append(tuple(v))
            gaps.append(float((q-p).length))
    faces=[]
    for j in range(rows):
        for i in range(N):
            k=j*(N+1)+i
            faces.append((k,k+1,k+N+2,k+N+1))
    ob=new_mesh_object("ATLAS "+ARCH+" J1 annular C0 bridge",xyz,faces,col)
    # Connector is a separate physical mesh object: not automatically
    # watertight with the original rim curve or vault.
    return ob,{"type":"annular_bridge",
               "seam_end_rms_world_bu":0.,
               "sample_count":N,"strip_rows":rows+1,
               "original_signed_radii_delta_bu":gap_before,
               "bridge_vertex_count":len(ob.data.vertices),
               "bridge_face_count":len(ob.data.polygons),
               "separate_mesh_from_source_vault":True,
               "full_watertight_claim":False}
def make_J2(col):
    # Transform only the first five rows of a *duplicate* mesh. Keep the
    # outer sections, gallery, and all original data exactly intact.
    cp=vault.copy()
    cp.data=vault.data.copy()
    cp.name="ATLAS "+ARCH+" J2 locally reparametrized vault"
    cp.parent=None
    col.objects.link(cp)
    cp.matrix_world=vault.matrix_world.copy()
    cp.hide_render=False
    rows=5
    for j in range(rows+1):
        fade=.5*(1+math.cos(math.pi*j/rows))
        for i in range(N+1):
            k=j*(N+1)+i
            orig=mat@verts[k].co
            seed=world_ring[i]
            target=rim_ring[i]
            new=orig+(target-seed)*fade
            cp.data.vertices[k].co=inverse@new
    cp.data.update()
    # The C0 seam matches the Bezier centreline precisely at sampled azimuths.
    differences=[]
    row_monotonic=[]
    for i in range(N):
        p=cp.matrix_world@cp.data.vertices[i].co
        differences.append((p-rim_ring[i]).length)
        prev=0.
        for j in range(rows+1):
            a=cp.matrix_world@cp.data.vertices[j*(N+1)+i].co
            dist=math.hypot(a.x-cx,a.y-cy)
            if j>0:
                row_monotonic.append(dist-prev)
            prev=dist
    if max(differences)>.0001:
        raise RuntimeError("J2 failed to meet oculus perimeter C0 tolerance")
    if min(row_monotonic)<.015:
        raise RuntimeError("J2 loft rings overlap/fold near oculus")
    return cp,{"type":"retargeted_vault_inner_rows",
               "seam_end_max_world_bu":max(differences),
               "seam_end_rms_world_bu":math.sqrt(
                   statistics.mean(x*x for x in differences)),
               "minimum_radial_step_world_bu":min(row_monotonic),
               "changed_rows":rows+1,
               "entire_source_vault_hidden_only_in_candidate":True,
               "full_watertight_claim":False}

def section(label,col):
    # Cross-section camera views only new raccord and essential guide,
    # without changing any model geometry or original camera.
    datablock=bpy.data.cameras.new("ATLAS "+ARCH+" "+label+" section lens")
    datablock.type="ORTHO"
    datablock.ortho_scale=14.
    ob=bpy.data.objects.new("ATLAS "+ARCH+" "+label+" section camera",datablock)
    scene.collection.children.link(ob)
    ob.location=(cx+15,cy,ring_z-.08)
    aim=Vector((cx,cy,ring_z-.2))
    ob.rotation_euler=(aim-Vector(ob.location)).to_track_quat("-Z","Y").to_euler()
    prior={o.name:o.hide_render for o in scene.objects}
    visible={o.as_pointer() for o in col.objects}
    visible.add(rim.as_pointer())
    if label=="J1":
        visible.add(vault.as_pointer())
    for original in scene.objects:
        if original.type in ("MESH","CURVE","FONT") and original.as_pointer() not in visible:
            original.hide_render=True
    try:
        picture=render(label+"-SECTION",ob)
    finally:
        for original in scene.objects:
            if original.name in prior:
                original.hide_render=prior[original.name]
        bpy.data.objects.remove(ob,do_unlink=True)
        if datablock.users==0: bpy.data.cameras.remove(datablock)
        scene.camera=cam
    return picture

def projection(o):
    xyz=[o.matrix_world@v.co for v in list(o.data.vertices)[:900]] if o.type=="MESH" else points
    proj=[world_to_camera_view(scene,cam,p) for p in xyz]
    return {"top":min(1-p.y for p in proj),"bottom":max(1-p.y for p in proj),
            "left":min(p.x for p in proj),"right":max(p.x for p in proj)}
verify()
baseline_render=render("BASE")
variants={}
for label in ("J1","J2"):
    col=new_collection(label)
    extra_objs=[]
    hidden={}
    try:
        if label=="J1":
            candidate,measure=make_J1(col)
        else:
            vault.hide_render=True
            hidden[vault.name]=True
            candidate,measure=make_J2(col)
        extra_objs.append(candidate)
        verify(hidden,extra=len(extra_objs))
        image=render(label)
        section_image=section(label,col)
        verify(hidden,extra=len(extra_objs))
        scene["P1D_OCULUS_RACCORD_STAGE"]="non_destructive"
        scene["P1D_OCULUS_RACCORD_METHOD"]=label
        scene["P1D_OCULUS_RACCORD_SOURCE_SHA256"]=SHA[ARCH]
        scene["P1D_OCULUS_RACCORD_ART_APPROVED"]=0
        model=OUT/("atlas-p1d-oculus-raccord-"+ARCH+"-"+label+".blend")
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(model))
        variants[label]={"method":label,"metrics":measure,
                         "render":image,"section":section_image,
                         "editable_blend":{"file":model.name,
                                           "sha256":checksum(model),
                                           "bytes":model.stat().st_size},
                         "originals_preserved":True,
                         "art_approved":False}
    finally:
        for x in extra_objs:
            data=x.data
            bpy.data.objects.remove(x,do_unlink=True)
            if data is not None and data.users==0:
                bpy.data.meshes.remove(data)
        bpy.data.collections.remove(col)
        for o in original_objects: o.hide_render=original_hidden[o.name]
        scene.camera=cam
        verify()
if set(variants)!={"J1","J2"}:
    raise RuntimeError("Incomplete diagnostic variants")
if len(scene.objects)!=original_count or len(bpy.data.meshes)!=original_meshes:
    raise RuntimeError("Raccord script leaked scene object or mesh")
manifest={
    "schema":"atlas.artdir02.p1d-oculus-raccord/v1",
    "arch":ARCH,
    "source_opt_s1_sha256":SHA[ARCH],
    "canonical_art_sha256":ART_SHA,
    "base":{"render":baseline_render,
            "oculus_z_bu":ring_z,
            "oculus_center_xy_bu":[cx,cy],
            "oculus_radius_distribution_bu":stats([p[1] for p in curve_samples]),
            "vault_inner_ring_radius_bu":stats(inner_rad[:N]),
            "signed_radial_gap_world_bu":gap_before,
            "seam_z_mismatch_world_bu":z_before,
            "source_bezier_evaluated_samples":len(points)},
    "variants":variants,
    "camera_and_all_original_meshes_unchanged":True,
    "source_cc0_collections":3,
    "real_join_geometry":True,
    "C0_position_measurements_only":True,
    "watertight_and_C1_not_certified":True,
    "synthetic_art_no_unique_metric_reconstruction":True,
    "art_approved":False,"no_merge":True,"no_deploy":True,
    "interpretation":"Measurable C0 local raccord only; manifold closure, tangent continuity, silhouette and human art review remain separate."
}
(OUT/("atlas-p1d-oculus-raccord-"+ARCH+"-receipt.json")).write_text(
    json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("OCULUS_RACCORD_TRUE_BLENDER_COMPLETE",json.dumps({
    "arch":ARCH,"source":SHA[ARCH],
    "signed_gap":gap_before,
    "base_z_gap":z_before,
    "candidate_methods":list(variants),
    "J2_C0_max":variants["J2"]["metrics"]["seam_end_max_world_bu"],
    "art_approved":False}))
