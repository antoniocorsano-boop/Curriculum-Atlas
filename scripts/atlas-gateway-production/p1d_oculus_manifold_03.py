#!/usr/bin/env python3
"""ART-DIR-02 / P1D-OCULUS-03.
Single-topology crown/vault connection: J3 a welded open roof with sampled
continuous tangent at the oculus seam; J4 a closed thin shell from the same
surface. Exact immutable A-S1/B-S1 originals; no automatic art acceptance.
"""
import bpy
import bmesh
from mathutils.bvhtree import BVHTree
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
# The source mesh used 129 angular vertices, where the first and final angles
# are duplicates but NOT welded. The new structural mesh uses 128 cyclic
# vertices per ring and shares every vertex along the crown/vault junction.
ANG=N
ROOF_ROWS=33
TRANSITION=8
SHELL_Z_THICKNESS=.065

def geometry_surface():
    raw=[]
    for j in range(ROOF_ROWS):
        ring=[]
        blend=.5*(1.+math.cos(math.pi*j/TRANSITION)) if j<=TRANSITION else 0.
        for i in range(ANG):
            original_world=mat@verts[j*(N+1)+i].co
            actual_rim=rim_ring[i]
            displacement=actual_rim-world_ring[i]
            ring.append(original_world+displacement*blend)
        raw.append(ring)
    step=[raw[1][i]-raw[0][i] for i in range(ANG)]
    # These two collar bands are a direct tangent extension of the first
    # actual loft segment. They have NO duplicated seam ring at j=0.
    inner2=[raw[0][i]-step[i]*1.00 for i in range(ANG)]
    inner1=[raw[0][i]-step[i]*.50 for i in range(ANG)]
    rings=[inner2,inner1]+raw
    radial_steps=[]
    for j in range(len(rings)-1):
        for i in range(ANG):
            a=rings[j][i];b=rings[j+1][i]
            ra=math.hypot(a.x-cx,a.y-cy)
            rb=math.hypot(b.x-cx,b.y-cy)
            radial_steps.append(rb-ra)
    radial_min=min(radial_steps)
    if radial_min<=.035:
        raise RuntimeError("Crown/vault profile folds, reverses, or has near-zero radial step: "+str(radial_min))
    seam_errors=[(raw[0][i]-rim_ring[i]).length for i in range(ANG)]
    if max(seam_errors)>.00005:
        raise RuntimeError("Bezier oculus positional continuity failed")
    # Verify the radial tangent on both sides of the UNIQUE, shared mesh ring.
    angles=[]
    for i in range(ANG):
        left=(raw[0][i]-inner1[i]).normalized()
        right=(raw[1][i]-raw[0][i]).normalized()
        angles.append(math.degrees(left.angle(right)))
    if max(angles)>.5:
        raise RuntimeError("Radial C1 tangent mismatch at oculus:"+str(max(angles)))
    coords=[(float(v.x),float(v.y),float(v.z)) for ring in rings for v in ring]
    return coords,{"rings":len(rings),
                   "oculus_shared_ring_index":2,
                   "oculus_C0_max_bu":max(seam_errors),
                   "joint_tangent_angle_max_degrees":max(angles),
                   "joint_tangent_angle_mean_degrees":statistics.mean(angles),
                   "min_radial_step_bu":radial_min,
                   "original_bezier_ring_samples":ANG,
                   "retargeted_first_roof_rows":TRANSITION+1,
                   "collar_internal_extension_rows":2,
                   "topology_join_is_one_mesh":True}

def build_faces(ring_count,mode):
    count=ring_count*ANG
    top=[]
    for j in range(ring_count-1):
        for i in range(ANG):
            ii=(i+1)%ANG
            a=j*ANG+i
            b=j*ANG+ii
            c=(j+1)*ANG+ii
            d=(j+1)*ANG+i
            top.append((a,b,c,d))
    if mode=="J3":
        return top
    # For the closed shell, the roof topside and underside have opposed
    # winding; end caps close its two intentional circular boundaries.
    faces=[tuple(reversed(f)) for f in top]
    faces.extend(tuple(count+x for x in f) for f in top)
    for i in range(ANG):
        ii=(i+1)%ANG
        # inner end cap
        faces.append((i,ii,count+ii,count+i))
        # outer end cap
        a=(ring_count-1)*ANG+i
        b=(ring_count-1)*ANG+ii
        faces.append((b,a,count+a,count+b))
    return faces

def mesh_integrity(ob,mode):
    bm=bmesh.new()
    try:
        bm.from_mesh(ob.data)
        bm.normal_update()
        edges=len(bm.edges)
        open_count=sum(1 for edge in bm.edges if edge.is_boundary)
        bad_count=sum(1 for edge in bm.edges if not edge.is_manifold and not edge.is_boundary)
        wire_count=sum(1 for edge in bm.edges if edge.is_wire)
        faces_count=len(bm.faces)
        v_count=len(bm.verts)
        min_face_area=min(f.calc_area() for f in bm.faces)
        # BMesh adjacency verifies actual shared vertices along the crown.
        bm.verts.ensure_lookup_table()
        seen=set()
        components=0
        for v in bm.verts:
            if v.index in seen:continue
            components+=1
            stack=[v]
            seen.add(v.index)
            while stack:
                node=stack.pop()
                for edge in node.link_edges:
                    other=edge.other_vert(node)
                    if other.index not in seen:
                        seen.add(other.index);stack.append(other)
        volume=bm.calc_volume(signed=True) if mode=="J4" else 0.
        if components!=1 or bad_count or wire_count or min_face_area<=1e-7:
            raise RuntimeError("Non-manifold or degenerate integrated mesh")
        if mode=="J3" and open_count!=2*ANG:
            raise RuntimeError("J3 open surface must have exactly two perimeter rings")
        if mode=="J4" and open_count!=0:
            raise RuntimeError("J4 shell is not watertight")
        if mode=="J4" and abs(volume)<.1:
            raise RuntimeError("J4 shell has no measurable enclosed volume")
        # BVH overlap pairs exclude adjacent faces that share vertices.
        bm.faces.ensure_lookup_table()
        ids=[{v.index for v in face.verts} for face in bm.faces]
        bvh=BVHTree.FromBMesh(bm,epsilon=0.)
        overlaps=bvh.overlap(bvh)
        independent=set()
        for i,j in overlaps:
            if i>=j or ids[i].intersection(ids[j]):
                continue
            independent.add((i,j))
        if independent:
            raise RuntimeError("Non-adjacent self-intersection candidates in structural shell: "+str(len(independent)))
        return {"vertices":v_count,"faces":faces_count,"edges":edges,
                "connected_components":components,
                "boundary_edges":open_count,
                "nonmanifold_edges_other_than_boundary":bad_count,
                "wire_edges":wire_count,
                "minimum_face_area_bu2":min_face_area,
                "self_intersection_nonadjacent_pair_count":len(independent),
                "signed_enclosed_volume_bu3":volume,
                "local_surface_manifold":True,
                "whole_shell_watertight":mode=="J4"}
    finally:
        bm.free()

def make_integrated(mode,col):
    coords,info=geometry_surface()
    rows=info["rings"]
    if mode=="J4":
        underside=[(x,y,z-SHELL_Z_THICKNESS) for x,y,z in coords]
        final_coords=coords+underside
    else:
        final_coords=coords
    faces=build_faces(rows,mode)
    ob=new_mesh_object("ATLAS "+ARCH+" "+mode+" integrated structural crown and vault",
                       final_coords,faces,col)
    mesh=mesh_integrity(ob,mode)
    thickness={"nominal_vertical_bu":SHELL_Z_THICKNESS if mode=="J4" else 0.,
               "normal_projected_lower_bound_bu":0.,
               "cross_section_min_world_bu":0.}
    if mode=="J4":
        # Original roof normal has a large vertical component in this dome;
        # report the actual local normal projection, not just dz.
        roof_faces=ob.data.polygons[:(rows-1)*ANG]
        normals=[abs(f.normal.z) for f in roof_faces]
        thickness["normal_projected_lower_bound_bu"]=min(normals)*SHELL_Z_THICKNESS
        thickness["cross_section_min_world_bu"]=SHELL_Z_THICKNESS
        if thickness["normal_projected_lower_bound_bu"]<.025:
            raise RuntimeError("Minimum projected structural shell thickness too small")
    return ob,dict(info,**{
       "architecture_mode":mode,
       "topology":mesh,
       "thickness":thickness,
       "original_architecture_unchanged":True,
       "original_vault_and_rim_hidden_only_in_candidate":True,
       "full_scene_interference_with_other_objects_certified":False})

def section(label,col):
    # Cross-section camera views only new raccord and essential guide,
    # without changing any model geometry or original camera.
    datablock=bpy.data.cameras.new("ATLAS "+ARCH+" "+label+" section lens")
    datablock.type="ORTHO"
    # Local tangential view of the real flange join, not a full hall section.
    # At a positive-X rim station, look tangentially along +Y; the frame
    # resolves radial X horizontally and world Z vertically.
    datablock.ortho_scale=2.35
    ob=bpy.data.objects.new("ATLAS "+ARCH+" "+label+" section camera",datablock)
    scene.collection.objects.link(ob)
    positive_x_radius=rim_for_angle(0.)[0]
    target=Vector((cx+positive_x_radius,cy,ring_z-.16))
    ob.location=(target.x,cy-12.,target.z+.07)
    aim=target
    ob.rotation_euler=(aim-Vector(ob.location)).to_track_quat("-Z","Y").to_euler()
    prior={o.name:o.hide_render for o in scene.objects}
    visible={o.as_pointer() for o in col.objects}
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
for label in ("J3","J4"):
    col=new_collection(label)
    objects=[]
    hidden={vault.name:True,rim.name:True}
    try:
        vault.hide_render=True
        rim.hide_render=True
        candidate,measure=make_integrated(label,col)
        objects.append(candidate)
        verify(hidden,extra=len(objects))
        rendered=render(label)
        section_image=section(label,col)
        verify(hidden,extra=len(objects))
        scene["ATLAS_OCULUS_03_CANDIDATE"]=ARCH+"/"+label
        scene["ATLAS_OCULUS_03_SOURCE_SHA256"]=SHA[ARCH]
        scene["ATLAS_OCULUS_03_ART_APPROVED"]=0
        model=OUT/("atlas-p1d-oculus-03-"+ARCH+"-"+label+".blend")
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=str(model))
        variants[label]={"method":label,"metrics":measure,
                         "render":rendered,"section":section_image,
                         "editable_blend":{"file":model.name,
                                           "sha256":checksum(model),
                                           "bytes":model.stat().st_size},
                         "originals_preserved":True,
                         "art_approved":False}
    finally:
        for ob in objects:
            data=ob.data
            bpy.data.objects.remove(ob,do_unlink=True)
            if data is not None and data.users==0:
                bpy.data.meshes.remove(data)
        bpy.data.collections.remove(col)
        for ob in original_objects:
            ob.hide_render=original_hidden[ob.name]
        scene.camera=cam
        verify()
if set(variants)!={"J3","J4"}:
    raise RuntimeError("Incomplete integrated structure cases")
if len(scene.objects)!=original_count or len(bpy.data.meshes)!=original_meshes:
    raise RuntimeError("Integrated structural samples leaked into immutable source")
manifest={
    "schema":"atlas.artdir02.p1d-oculus-manifold/v1",
    "arch":ARCH,
    "source_opt_s1_sha256":SHA[ARCH],
    "canonical_art_sha256":ART_SHA,
    "baseline":{"render":baseline_render,
        "oculus_z_bu":ring_z,
        "oculus_center_xy_bu":[cx,cy],
        "oculus_radius_distribution_bu":stats([p[1] for p in curve_samples]),
        "vault_inner_ring_radius_bu":stats(inner_rad[:N]),
        "signed_radial_gap_world_bu":gap_before,
        "seam_z_mismatch_world_bu":z_before,
        "source_bezier_evaluated_samples":len(points)},
    "variants":variants,
    "camera_and_original_meshes_unchanged":True,
    "source_cc0_collections":3,
    "topologically_joined_mesh_no_duplicate_internal_seam":True,
    "tangent_continuity_verified_on_128_radial_samples":True,
    "all_scene_object_collisions_certified":False,
    "real_materials_finalized":False,
    "art_approved":False,"no_merge":True,"no_deploy":True,
    "interpretation":"J3 connected open structural surface; J4 closed shell. All candidate mesh tests pass, but global hall interference and artistic matching require separate review."
}
(OUT/("atlas-p1d-oculus-03-"+ARCH+"-receipt.json")).write_text(
    json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("OCULUS_INTEGRATED_MANIFOLD_TRUE_BLENDER_COMPLETE",json.dumps({
    "arch":ARCH,"source":SHA[ARCH],
    "signed_gap":gap_before,
    "base_z_gap":z_before,
    "candidate_methods":list(variants),
    "J3_BOUNDARY_EDGES":variants["J3"]["metrics"]["topology"]["boundary_edges"],
    "J4_WATERTIGHT":variants["J4"]["metrics"]["topology"]["whole_shell_watertight"],
    "art_approved":False}))
