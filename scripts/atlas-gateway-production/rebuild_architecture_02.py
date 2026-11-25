#!/usr/bin/env python3
"""ART-DIR-02 / ARCH-02: geometric architectural candidate derived from the existing
Atlas foyer .blend. Does NOT modify the input master, runtime, public routes or
artistic approval. Run:
 blender -b ORIGINAL.blend --python rebuild_architecture_01.py -- --out DIRECTORY
The canonical JPEG is identified by SHA but is never synthesized or replaced.
"""
import bpy
import hashlib
import json
import math
import os
import sys
from mathutils import Vector

CANONICAL_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if "--out" not in ARGS or ARGS.index("--out") + 1 == len(ARGS):
    raise ValueError("Expected --out DIRECTORY")
OUT = os.path.abspath(ARGS[ARGS.index("--out") + 1])
os.makedirs(OUT, exist_ok=True)
SOURCE = bpy.data.filepath
if not SOURCE or not os.path.isfile(SOURCE):
    raise ValueError("Load the existing, real Atlas master .blend before this script")
SOURCE_SHA = hashlib.sha256(open(SOURCE, "rb").read()).hexdigest()
scene = bpy.context.scene
if not all(bpy.data.objects.get("Portale • " + n) for n in
           ("Curricolo", "Esplora", "Percorsi", "Esperienze")):
    raise ValueError("Existing master does not have the four Atlas portal roots")
if not bpy.data.materials.get("OCULUS • sky above real glass"):
    raise ValueError("Missing original packed sky material")

# Only the architecture and central sculpture are replaced. The portal meshes,
# materials, identifiers and text-authority contract stay in place.
REMOVE_PREFIXES = (
    "Atrio • parete di fondo semicircolare",
    "Atrio • pilastro esterno", "Atrio • pannello incassato",
    "Atrio • profilo balconata", "Atrio • copertura posteriore",
    "Atrio • costolone retrostante", "Atrio • arco frontale",
    "Atrio • corona lucernario", "OCULUS • cielo osservabile sopra i vetri",
    "OCULUS • nervatura vetrata", "ATLAS • podio ottagonale",
    "ATLAS • bordo del podio", "ATLAS • volume centrale",
    "ATLAS • logotipo approvato fisicamente curvo"
)
removed = []
for obj in tuple(scene.objects):
    if obj.name.startswith(REMOVE_PREFIXES):
        removed.append(obj.name)
        bpy.data.objects.remove(obj, do_unlink=True)

def existing(name):
    m = bpy.data.materials.get(name)
    if not m:
        raise ValueError("Required master material absent: " + name)
    return m

wall = existing("Atrium • pareti blu grafite")
recess = existing("Atrium • nicchia blu notte")
steel = existing("Atrium • metallo ossidato")
bronze = existing("Atrium • ottone satinato")
polished = existing("Atrium • grafite lucida")
warm = existing("Atrium • taglio luce bronzo")
sky = existing("OCULUS • sky above real glass")
sculpture_mat = existing("Atrium • metallo ossidato")
logo_mat = existing("ATLAS • marchio approvato aderente al podio")

def newmesh(name, vertices, faces, mat, smooth=False):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    return obj

def cube(name, location, dimensions, mat, angle=0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = dimensions
    obj.rotation_euler.z = angle
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return obj

def sector_band(name, ri, ro, z0, z1, mat, start=-math.pi/2,
                end=math.pi/2, segments=56):
    # Four real surfaces define a solid annular sector with physical thickness.
    verts, faces = [], []
    for i in range(segments + 1):
        a = start + (end-start)*i/segments
        for radius, z in ((ri,z0),(ro,z0),(ro,z1),(ri,z1)):
            verts.append((radius*math.sin(a),1.3+radius*math.cos(a),z))
    for i in range(segments):
        p=4*i
        for j in range(4):
            faces.append((p+j,p+4+j,p+4+(j+1)%4,p+(j+1)%4))
    faces.extend(((3,2,1,0),tuple(4*segments+j for j in range(4))))
    return newmesh(name,verts,faces,mat)

def curved_panel(name, radius, z0, z1, theta0, theta1, mat):
    sections=4
    verts=[]
    for i in range(sections+1):
        a=theta0+(theta1-theta0)*i/sections
        verts.extend(((radius*math.sin(a),1.3+radius*math.cos(a),z0),
                      (radius*math.sin(a),1.3+radius*math.cos(a),z1)))
    return newmesh(name,verts,[(2*i,2*i+1,2*i+3,2*i+2)
                              for i in range(sections)],mat)

def beam(name, a, b, thickness, mat):
    aa,bb=Vector(a),Vector(b)
    delta=bb-aa
    obj=cube(name,(aa+bb)*.5,(thickness,thickness,delta.length),mat)
    obj.rotation_euler=delta.to_track_quat("Z","Y").to_euler()
    return obj

def elliptical_ring(name, ax, ay, z, width, height, mat, count=112):
    verts=[]
    for i in range(count):
        t=math.tau*i/count
        for x,y,z2 in ((ax-width,ay-width,z-height),
                       (ax+width,ay+width,z-height),
                       (ax+width,ay+width,z+height),
                       (ax-width,ay-width,z+height)):
            verts.append((x*math.cos(t),-2.0+y*math.sin(t),z2))
    faces=[]
    for i in range(count):
        j=(i+1)%count
        for k in range(4):
            faces.append((4*i+k,4*j+k,4*j+(k+1)%4,4*i+(k+1)%4))
    return newmesh(name,verts,faces,mat)

# ARCH_ROTUNDA: separate deep bays and two mezzanine decks. The rear facade is
# not a single opaque cylindrical wall; there is actual depth between balustrade
# and back panels, and the entrance-facing half remains clear.
sector_band("ARCH02 • lower structural plinth",11.05,11.85,0.02,0.45,wall)
sector_band("ARCH02 • first gallery deck",10.17,11.86,2.45,2.63,wall)
sector_band("ARCH02 • upper gallery deck",10.17,11.86,5.20,5.38,wall)
sector_band("ARCH02 • upper cornice",11.16,11.92,7.03,7.21,steel)
sector_band("ARCH02 • first gallery handrail",10.10,10.21,3.35,3.41,bronze)
sector_band("ARCH02 • second gallery handrail",10.10,10.21,6.10,6.16,bronze)

# Glazed, semitransparent balustrades use one minimal material, not glow strips.
glass=bpy.data.materials.get("ARCH02 • architectural balustrade")
if glass is None:
    glass=bpy.data.materials.new("ARCH02 • architectural balustrade")
    glass.diffuse_color=(.22,.48,.68,.17)
    glass.use_nodes=True
    bsdf=glass.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value=(.16,.32,.45,1)
    bsdf.inputs["Roughness"].default_value=.23
    bsdf.inputs["Metallic"].default_value=.12
    bsdf.inputs["Alpha"].default_value=.17
    if hasattr(glass,"blend_method"):
        glass.blend_method="BLEND"
    elif hasattr(glass,"surface_render_method"):
        glass.surface_render_method="DITHERED"

bays=14
for k in range(bays+1):
    t=-math.pi/2+math.pi*k/bays
    for z0,z1 in ((.40,2.43),(2.64,5.18),(5.40,7.03)):
        x,y=11.52*math.sin(t),1.3+11.52*math.cos(t)
        cube("ARCH02 • full-depth structural pier", (x,y,(z0+z1)/2),
             (.25,.46,z1-z0),steel,angle=-t)
    if k==bays:
        continue
    a=-math.pi/2+math.pi*k/bays
    b=-math.pi/2+math.pi*(k+1)/bays
    center=(a+b)/2
    # Recessed window surfaces terminate behind the load-bearing piers.
    for z0,z1 in ((.64,2.23),(2.88,4.94),(5.64,6.92)):
        curved_panel("ARCH02 • recessed gallery bay",
                     12.32 if k%4 in (0,3) else 11.94,z0,z1,
                     a+.014,b-.014,recess)
    for z0,z1 in ((2.68,3.34),(5.43,6.09)):
        curved_panel("ARCH02 • genuine glass balustrade",10.13,z0,z1,
                     a+.019,b-.019,glass)
    for z in (2.70,5.45):
        x,y=10.12*math.sin(center),1.3+10.12*math.cos(center)
        cube("ARCH02 • discrete inner baluster", (x,y,z+.34),
             (.052,.065,.68),steel,angle=-center)
    # A small number of warm rear-light recesses for architectural depth.
    if k%4==0:
        x,y=11.81*math.sin(center),1.3+11.81*math.cos(center)
        cube("ARCH02 • distant gallery interior", (x,y,4.06),
             (.85,.08,.84),bronze,angle=-center)

# ARCH_OCULUS: replace miniature rear half-roof with a wide continuous annular
# vault framing an open, sky-bearing oculus. The front remains unroofed for
# first-person entry, but the rear vault is physically curved and has thickness.
r_inner,r_outer=7.05,11.55
radial_steps=12
angular_steps=64
def vault_z(r):
    q=(r-r_inner)/(r_outer-r_inner)
    return 8.91-1.69*q*q

verts=[]
for j in range(radial_steps+1):
    r=r_inner+(r_outer-r_inner)*j/radial_steps
    z=vault_z(r)
    for i in range(angular_steps+1):
        a=-math.pi/2+math.pi*i/angular_steps
        verts.append((r*math.sin(a),1.3+r*math.cos(a),z))
faces=[]
for j in range(radial_steps):
    for i in range(angular_steps):
        p=j*(angular_steps+1)+i
        faces.append((p,p+angular_steps+1,p+angular_steps+2,p+1))
vault=newmesh("ARCH02 • curved rear roof with actual opening",verts,faces,glass)
solid=vault.modifiers.new("ARCH02 • roof physical thickness","SOLIDIFY")
solid.thickness=.18
sector_band("ARCH02 • monumental oculus corona",6.96,7.20,8.68,8.88,bronze,
            start=-math.pi/2,end=math.pi/2)
# Sky circle is real textured geometry above, with unbroken sky visible.
n=96
disk_verts=[(0,1.3,9.01)]
disk_verts.extend((7.00*math.cos(math.tau*i/n),
                   1.3+7.00*math.sin(math.tau*i/n),9.01)
                  for i in range(n))
disk=newmesh("OCULUS ARCH02 • visible open sky",disk_verts,
             [(0,i+1,(i+1)%n+1) for i in range(n)],sky)
uv=disk.data.uv_layers.new(name="OCULUS_Sky_UV")
for poly in disk.data.polygons:
    for loop in poly.loop_indices:
        vertex=disk.data.vertices[disk.data.loops[loop].vertex_index].co
        uv.data[loop].uv=(.5+vertex.x/(2*7.00),
                          .5+(vertex.y-1.3)/(2*7.00))
for i in range(12):
    a=math.tau*i/12
    beam("OCULUS ARCH02 • delicate radial mullion",
         (0,1.3,9.00),(5.70*math.cos(a),1.3+5.70*math.sin(a),9.00),
         .030,steel)

# ATLAS_PODIUM: a shallow, wide half-ellipsoid, not a compressed sphere or
# cylindrical stack. Architectural floor rings use separate ellipse axes.
AX,AY,BASE,H=4.23,2.53,.58,1.44
elliptical_ring("ATLAS ARCH02 • low outer bronze base",4.89,3.13,.22,.075,.08,bronze)
elliptical_ring("ATLAS ARCH02 • shallow inner plinth",4.42,2.85,.44,.075,.055,polished)
elliptical_ring("ATLAS ARCH02 • one coherent light seam",4.37,2.80,.54,.040,.034,warm)
circ=112
radial=25
verts=[(0,-2.0,BASE+H)]
for k in range(1,radial+1):
    s=k/radial
    z=BASE+H*math.sqrt(max(0,1-s*s))
    for j in range(circ):
        t=math.tau*j/circ
        verts.append((AX*s*math.cos(t),-2.0+AY*s*math.sin(t),z))
faces=[(0,1+j,1+(j+1)%circ) for j in range(circ)]
for k in range(radial-1):
    ia=1+circ*k
    ib=ia+circ
    for j in range(circ):
        nxt=(j+1)%circ
        faces.append((ia+j,ib+j,ib+nxt,ia+nxt))
faces.append(tuple(range(1+circ*(radial-1),1+circ*radial))[::-1])
cap=newmesh("ATLAS ARCH02 • low elliptical convex canopy",verts,faces,
            sculpture_mat,True)

# Preserve the already approved logo image/material. Re-project it as a curved
# grid onto the newly authored ellipse, offset slightly towards the viewer.
columns,rows=64,18
logo_vertices=[]
for row in range(rows+1):
    z=.76+row/rows*.56
    for col in range(columns+1):
        x=-1.95+col/columns*3.90
        radicand=1-(x/AX)**2-((z-BASE)/H)**2
        if radicand<=0:
            raise ValueError("Approved logo outside ART-DIR-02 shallow ellipse")
        y=-2.0-AY*math.sqrt(radicand)-.018
        logo_vertices.append((x,y,z))
logo_faces=[]
for row in range(rows):
    for col in range(columns):
        p=row*(columns+1)+col
        logo_faces.append((p,p+1,p+columns+2,p+columns+1))
logo=newmesh("ATLAS ARCH02 • original logo on convex front",
             logo_vertices,logo_faces,logo_mat,True)
logo_uv=logo.data.uv_layers.new(name="Approved Logo UV")
for poly in logo.data.polygons:
    for loop in poly.loop_indices:
        index=logo.data.loops[loop].vertex_index
        logo_uv.data[loop].uv=((index%(columns+1))/columns,
                               (index//(columns+1))/rows)

# Real 3D diagnostic cameras, independent of the previously tested A/B fits.
def camera(name,position,target,lens):
    bpy.ops.object.camera_add(location=position)
    o=bpy.context.object
    o.name=name
    o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
    o.data.lens=lens
    o.data.clip_end=180
    return o

cameras={
    "hero":camera("CAM_HERO_ARCH02",(0,-16.4,3.45),(0,2.2,3.34),28.0),
    "side":camera("CAM_SIDE_ARCH02",(5.2,-13.5,3.55),(0,2.2,3.46),29.0),
    "mobile":camera("CAM_MOBILE_ARCH02",(0,-16.1,3.6),(0,2.4,3.61),25.0)
}
scene.render.engine="CYCLES"
scene.cycles.samples=8
scene.render.image_settings.file_format="PNG"
scene.render.resolution_percentage=100
scene.render.film_transparent=False
scene.camera=cameras["hero"]
candidate=os.path.join(OUT,"atlas-foyer-arch02-candidate.blend")
bpy.ops.wm.save_as_mainfile(filepath=candidate)
output_images={}
for label,cam in cameras.items():
    scene.camera=cam
    scene.render.resolution_x,scene.render.resolution_y=(
        (840,472) if label!="mobile" else (420,744))
    image_path=os.path.join(OUT,label+"-arch02-cycles.png")
    scene.render.filepath=image_path
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(image_path) or os.stat(image_path).st_size<5000:
        raise RuntimeError("Missing actual Cycles image for "+label)
    with open(image_path,"rb") as data:
        output_images[label]={"file":os.path.basename(image_path),
                              "sha256":hashlib.sha256(data.read()).hexdigest(),
                              "bytes":os.stat(image_path).st_size}
receipt={
    "schema":"atlas.gateway.art-dir02.architecture-candidate/v2",
    "status":"GEOMETRY_CANDIDATE_NOT_ART_APPROVED",
    "canonical_reference_sha256":CANONICAL_SHA,
    "original_master_sha256":SOURCE_SHA,
    "original_master_preserved":True,
    "candidate_master_sha256":hashlib.sha256(open(candidate,"rb").read()).hexdigest(),
    "removed_legacy_meshes":len(removed),
    "real_3d_mesh_count":sum(o.type=="MESH" for o in scene.objects),
    "four_original_portals_preserved":all(bpy.data.objects.get("Portale • "+n)
        for n in ("Curricolo","Esplora","Percorsi","Esperienze")),
    "architecture":{
        "podium_ellipse_semiaxes":[AX,AY],
        "podium_cap_base_and_height":[BASE,H],
        "oculus_inner_radius":r_inner,
        "oculus_geometry_height":8.91,
        "two_gallery_floors_z":[2.45,5.20],
        "gallery_bays":bays,
        "roof_front_open_for_navigation":True},
    "renders":output_images,
    "material_or_lighting_revision":False,
    "runtime_exported":False,
    "student_authorized":False,
    "public_release":False
}
with open(os.path.join(OUT,"architecture-receipt.json"),"w",encoding="utf8") as f:
    json.dump(receipt,f,ensure_ascii=False,indent=2)
print("ATLAS_ARCH02_GEOMETRY_RENDERED",json.dumps(receipt,ensure_ascii=False))
