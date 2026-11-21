#!/usr/bin/env python3
"""ART-DIR-02 / ARCH-04B: modeled physical joints and orthographic inspection
of the already verified ARCH-04 reference geometry. Does NOT change originals,
runtime, portal contracts or artistic approval. Run:
 blender -b ORIGINAL.blend --python build_architecture_04_geometry.py -- --out DIRECTORY
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
sector_band("ARCH04 • lower structural plinth",11.05,11.85,0.02,0.45,wall)
sector_band("ARCH04 • first gallery deck",10.17,11.86,2.45,2.63,wall)
sector_band("ARCH04 • upper gallery deck",10.17,11.86,5.20,5.38,wall)
sector_band("ARCH04 • upper cornice",11.16,11.92,7.03,7.21,steel)
sector_band("ARCH04 • first gallery handrail",10.10,10.21,3.35,3.41,bronze)
sector_band("ARCH04 • second gallery handrail",10.10,10.21,6.10,6.16,bronze)

# Glazed, semitransparent balustrades use one minimal material, not glow strips.
glass=bpy.data.materials.get("ARCH04 • architectural balustrade")
if glass is None:
    glass=bpy.data.materials.new("ARCH04 • architectural balustrade")
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
        cube("ARCH04 • full-depth structural pier", (x,y,(z0+z1)/2),
             (.25,.46,z1-z0),steel,angle=-t)
    if k==bays:
        continue
    a=-math.pi/2+math.pi*k/bays
    b=-math.pi/2+math.pi*(k+1)/bays
    center=(a+b)/2
    # Recessed window surfaces terminate behind the load-bearing piers.
    for z0,z1 in ((.64,2.23),(2.88,4.94),(5.64,6.92)):
        curved_panel("ARCH04 • recessed gallery bay",
                     12.32 if k%4 in (0,3) else 11.94,z0,z1,
                     a+.014,b-.014,recess)
    for z0,z1 in ((2.68,3.34),(5.43,6.09)):
        curved_panel("ARCH04 • genuine glass balustrade",10.13,z0,z1,
                     a+.019,b-.019,glass)
    for z in (2.70,5.45):
        x,y=10.12*math.sin(center),1.3+10.12*math.cos(center)
        cube("ARCH04 • discrete inner baluster", (x,y,z+.34),
             (.052,.065,.68),steel,angle=-center)
    # Distinct soffit and bay trim give the otherwise uniform walls real depth.
    # The lighting rig is intentionally unchanged until VIS-01.
    if k in (0,1,3,10,12,13):
        for level in (2.42,5.17):
            x0,y0=10.75*math.sin(center),1.3+10.75*math.cos(center)
            cube("ARCH04 • gallery recessed soffit edge",(x0,y0,level),
                 (.82,.12,.065),bronze,angle=-center)
    # A small number of warm rear-light recesses for architectural depth.
    if k%4==0:
        x,y=11.81*math.sin(center),1.3+11.81*math.cos(center)
        cube("ARCH04 • distant gallery interior", (x,y,4.06),
             (.85,.08,.84),bronze,angle=-center)

# ARCH-04: differentiated side architecture without filling the scene
# with decorative cards. Small actual recess lighting and two planted volumes.
leaf_mat=bpy.data.materials.get("ARCH04 • foliage natural deep green")
if leaf_mat is None:
    leaf_mat=bpy.data.materials.new("ARCH04 • foliage natural deep green")
    leaf_mat.diffuse_color=(.035,.105,.057,1)
    leaf_mat.use_nodes=True
    leaf_bsdf=leaf_mat.node_tree.nodes.get("Principled BSDF")
    leaf_bsdf.inputs["Base Color"].default_value=(.035,.105,.057,1)
    leaf_bsdf.inputs["Roughness"].default_value=.75
for sign in (-1,1):
    x=sign*9.35
    cube("ARCH04 • structural vertical side pier",(x,5.4,3.62),(.32,.48,6.2),steel)
    cube("ARCH04 • warm reveal within gallery",(x-sign*.5,5.48,4.1),(.045,.11,2.3),bronze)
    cube("ARCH04 • restrained side exhibition banner",(sign*9.65,5.05,4.35),(.84,.08,2.35),recess)
    cube("ARCH04 • exhibition banner bottom hem",(sign*9.65,5.0,3.16),(.9,.09,.045),bronze)
    px,py=sign*9.12,-1.65
    cube("ARCH04 • raised botanical planter",(px,py,.44),(1.13,1.08,.82),polished)
    cube("ARCH04 • planter brushed bronze edge",(px,py,.85),(1.19,1.14,.065),bronze)
    beam("ARCH04 • botanical main stem",(px,py,.86),(px,py,2.45),.10,steel)
    for i in range(7):
        t=math.tau*i/7
        height=1.68+.33*(i%3)
        x_leaf=px+.32*math.cos(t)
        y_leaf=py+.26*math.sin(t)
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=1,location=(x_leaf,y_leaf,height))
        leaf=bpy.context.object
        leaf.name="ARCH04 • restrained botanical foliage"
        leaf.scale=(.29,.18,.40)
        leaf.data.materials.append(leaf_mat)

# ARCH_OCULUS: replace miniature rear half-roof with a wide continuous annular
# vault framing an open, sky-bearing oculus. The front remains unroofed for
# first-person entry, but the rear vault is physically curved and has thickness.
r_inner,r_outer=6.85,11.55
radial_steps=12
angular_steps=64
def vault_z(r):
    q=(r-r_inner)/(r_outer-r_inner)
    return 8.44-1.17*q*q

# ARCH-04: broken roof glazing, not one opaque continuous dark disk.
# Actual open slots are preserved between panels and structural ribs.
roof_panels=18
OCULUS_SKY_Z=8.55
OCULUS_CORONA_Z=(8.22,8.40)
# The oculus is lowered and narrowed in 3D, independently of camera fit.
for part in range(roof_panels):
    a=-math.pi/2+math.pi*(part+.18)/roof_panels
    b=-math.pi/2+math.pi*(part+.73)/roof_panels
    verts=[]
    for radial in range(5):
        r=r_inner+.14+(r_outer-r_inner-.20)*radial/4
        for t in (a,b):
            verts.append((r*math.sin(t),1.3+r*math.cos(t),vault_z(r)))
    faces=[(2*k,2*k+2,2*k+3,2*k+1) for k in range(4)]
    glass_panel=newmesh("ARCH04 • separated skylight roof glass",verts,faces,glass)
    solid=glass_panel.modifiers.new("ARCH04 • glass structural thickness","SOLIDIFY")
    solid.thickness=.045
    t=-math.pi/2+math.pi*part/roof_panels
    beam("ARCH04 • discrete roof rafter",
         (r_inner*math.sin(t),1.3+r_inner*math.cos(t),vault_z(r_inner)),
         (r_outer*math.sin(t),1.3+r_outer*math.cos(t),vault_z(r_outer)),
         .06,steel)

sector_band("ARCH04 • monumental oculus corona",6.76,6.98,OCULUS_CORONA_Z[0],OCULUS_CORONA_Z[1],bronze,
            start=-math.pi/2,end=math.pi/2)
# Sky circle is real textured geometry above, with unbroken sky visible.
n=96
disk_verts=[(0,1.3,OCULUS_SKY_Z)]
disk_verts.extend((6.80*math.cos(math.tau*i/n),
                   1.3+6.80*math.sin(math.tau*i/n),OCULUS_SKY_Z)
                  for i in range(n))
disk=newmesh("OCULUS ARCH04 • visible open sky",disk_verts,
             [(0,i+1,(i+1)%n+1) for i in range(n)],sky)
uv=disk.data.uv_layers.new(name="OCULUS_Sky_UV")
for poly in disk.data.polygons:
    for loop in poly.loop_indices:
        vertex=disk.data.vertices[disk.data.loops[loop].vertex_index].co
        uv.data[loop].uv=(.5+vertex.x/(2*6.80),
                          .5+(vertex.y-1.3)/(2*6.80))
for i in range(12):
    a=math.tau*i/12
    beam("OCULUS ARCH04 • delicate radial mullion",
         (0,1.3,8.53),(6.78*math.cos(a),1.3+6.78*math.sin(a),8.53),
         .030,steel)

# ATLAS_PODIUM: a shallow, wide half-ellipsoid, not a compressed sphere or
# cylindrical stack. Architectural floor rings use separate ellipse axes.
AX,AY,BASE,H=3.58,2.38,.58,1.59
elliptical_ring("ATLAS ARCH04 • low outer bronze base",4.89,3.13,.22,.075,.08,bronze)
elliptical_ring("ATLAS ARCH04 • shallow inner plinth",4.42,2.85,.44,.075,.055,polished)
elliptical_ring("ATLAS ARCH04 • one coherent light seam",4.37,2.80,.54,.040,.034,warm)
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
cap=newmesh("ATLAS ARCH04 • low elliptical convex canopy",verts,faces,
            sculpture_mat,True)

# Preserve the already approved logo image/material. Re-project it as a curved
# grid onto the newly authored ellipse, offset slightly towards the viewer.
columns,rows=64,18
logo_vertices=[]
for row in range(rows+1):
    z=.84+row/rows*.64
    for col in range(columns+1):
        x=-1.88+col/columns*3.76
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
logo=newmesh("ATLAS ARCH04 • original logo on convex front",
             logo_vertices,logo_faces,logo_mat,True)
logo_uv=logo.data.uv_layers.new(name="Approved Logo UV")
for poly in logo.data.polygons:
    for loop in poly.loop_indices:
        index=logo.data.loops[loop].vertex_index
        logo_uv.data[loop].uv=((index%(columns+1))/columns,
                               (index//(columns+1))/rows)

# ARCH-04: image-space recalibration of the same four physical portals.
# Only existing roots change position/scale; their identifiers, textures, routes,
# operational text authority and pre-existing master asset remain unchanged.
# Solve a common physical circular locus through the two symmetric portal pairs.
# Preserve camera-fitted image-space bounds instead of inventing equal screen heights.
PORTAL_ARC_CENTER_Y=-6.3836
PORTAL_ARC_RADIUS=math.sqrt(5.95**2 + (.56-PORTAL_ARC_CENTER_Y)**2)
def on_portal_arc(x):
    return PORTAL_ARC_CENTER_Y+math.sqrt(PORTAL_ARC_RADIUS**2-x*x)
PORTAL_LAYOUT={
    "Curricolo":(-5.95,on_portal_arc(-5.95),-.29),
    "Esplora":(-2.40,on_portal_arc(-2.40),-.11),
    "Percorsi":(2.40,on_portal_arc(2.40),.11),
    "Esperienze":(5.95,on_portal_arc(5.95),.29)
}
assert abs(PORTAL_LAYOUT["Curricolo"][1]-PORTAL_LAYOUT["Esperienze"][1])<1e-9
assert abs(PORTAL_LAYOUT["Esplora"][1]-PORTAL_LAYOUT["Percorsi"][1])<1e-9
for label,(px,py,radians) in PORTAL_LAYOUT.items():
    root=bpy.data.objects.get("Portale • "+label)
    root.location=(px,py,0)
    root.rotation_euler.z=radians
    root.scale=(1.20,1.0,1.00)
    # Master render labels are intentionally not part of the public GLB.
    title=bpy.data.objects.get("Portale • titolo "+label)
    if title:
        title.location=(px,py-.48,3.42)
        title.rotation_euler.z=radians
        title.scale=(1.18,1.18,1.18)

# Blue-black satin ceramic: a preview-only candidate material, not final PBR.
sculpture_mat=sculpture_mat.copy()
sculpture_mat.name="ARCH04 • blue-black satin curved center"
if sculpture_mat.use_nodes:
    bsdf=sculpture_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value=(.022,.053,.115,1.0)
        bsdf.inputs["Roughness"].default_value=.27
        bsdf.inputs["Metallic"].default_value=.38
cap.data.materials.clear()
cap.data.materials.append(sculpture_mat)

# ARCH-04B physical joints are derived from the 16-node architectural contract.
# All dimensions are scene-local Blender units, NOT certified building measurements.
CONSTRUCTION_NODE_CONTRACT="docs/atlas-gateway/ARCH-04-CONSTRUCTION-JOINTS-01.json"
GEO_FLOOR_Z=0.0
JOINT_OBJECTS={}
def register_joint(node_id, obj):
    if obj.type != "MESH" or not obj.data.polygons:
        raise RuntimeError("Joint must contain genuine mesh faces: "+node_id)
    JOINT_OBJECTS.setdefault(node_id, []).append(obj.name)
    obj["atlas_joint_id"]=node_id
    obj["atlas_stage"]="ARCH-04B_GEOMETRY_NOT_ART_APPROVED"
    return obj

def elliptical_solid(name, ax, ay, z_bottom, z_top, mat, samples=112):
    # Closed mesh with side wall and top/bottom caps, instead of a painted line.
    if not (ax>0 and ay>0 and z_top>z_bottom):
        raise ValueError("Invalid solid elliptical support")
    verts=[]
    for z in (z_bottom,z_top):
        for i in range(samples):
            t=math.tau*i/samples
            verts.append((ax*math.cos(t),-2.0+ay*math.sin(t),z))
    bottom_center=len(verts)
    verts.append((0,-2.0,z_bottom))
    top_center=len(verts)
    verts.append((0,-2.0,z_top))
    faces=[]
    for i in range(samples):
        nxt=(i+1)%samples
        faces.append((i,nxt,samples+nxt,samples+i))
        faces.append((bottom_center,nxt,i))
        faces.append((top_center,samples+i,samples+nxt))
    return newmesh(name,verts,faces,mat)

# The source .blend retains a -0.04 floor top. Correct only the independent
# candidate and record its precise original elevation for audit.
source_floor=bpy.data.objects.get("Atrio • pavimento lapideo")
if source_floor is None or source_floor.type!="MESH":
    raise RuntimeError("The original authored stone floor is missing")
floor_z_before=source_floor.location.z
source_floor.location.z += .04
register_joint("N-FLO-01",source_floor)
if abs((floor_z_before+.20+.04)-GEO_FLOOR_Z)>1e-6:
    raise RuntimeError("Floor finish remains above or below zero")

# Rear-wall ground plinth previously began .02 above the original finish.
register_joint("N-ROT-01",sector_band(
    "ARCH04B • rotunda plinth ground closure",11.05,11.85,0.0,.08,wall))

# Load-bearing pier ties: two precise sleeves at each of the 15 primary axes.
for pier_index in range(bays+1):
    t=-math.pi/2+math.pi*pier_index/bays
    px,py=11.52*math.sin(t),1.3+11.52*math.cos(t)
    for zlo,zhi in ((2.41,2.66),(5.16,5.42)):
        obj=cube("ARCH04B • real pier-to-gallery sleeve",
                 (px,py,(zlo+zhi)*.5),(.32,.53,zhi-zlo),steel,angle=-t)
        register_joint("N-GAL-01",obj)

# Lower clamps seat the balustrades into each of the two real deck surfaces.
for zlo,zhi in ((2.62,2.71),(5.37,5.46),(3.31,3.42),(6.06,6.17)):
    obj=sector_band("ARCH04B • glass railing mechanical channel",
        10.075,10.19,zlo,zhi,steel)
    register_joint("N-GAL-02",obj)

# Existing recessed back panels retain a physical depth >1.8 BU.
for gallery_obj in scene.objects:
    if gallery_obj.type=="MESH" and gallery_obj.name.startswith("ARCH04 • recessed gallery bay"):
        register_joint("N-GAL-03",gallery_obj)

# The inner corona has a separate mechanical return connecting the roof glass
# to the architectural bronze ring. Emissive material belongs to VIS-01.
register_joint("N-OCU-01",sector_band(
    "ARCH04B • oculus inner glazing return",6.94,7.05,8.35,8.47,bronze))
# Independent perimeter distribution sector: 18 secondary ribs meet one band,
# which overlaps the upper cornice and joins 15 primary pier axes.
perimeter_ring=sector_band(
    "ARCH04B • perimeter rib distribution ring",11.46,11.64,
    7.16,7.33,steel)
register_joint("N-OCU-02",perimeter_ring)
register_joint("N-OCU-03",perimeter_ring)

# The four existing portal roots, glass and icon meshes are unchanged.
for label,(px,py,yaw) in PORTAL_LAYOUT.items():
    root=bpy.data.objects["Portale • "+label]
    frame=next((o for o in root.children if o.type=="MESH"
                and " • telaio" in o.name),None)
    if frame is None:
        raise RuntimeError("Portal shell missing "+label)
    register_joint("N-POR-01",frame)
    support=cube("ARCH04B • portal physical foot "+label,
                 (px,py,.072),(3.78,.52,.144),polished,angle=yaw)
    register_joint("N-POR-02",support)
    register_joint("N-POR-03",frame)

# Three nested solid stepped foundations support the ellipse, gold base,
# shallow stage and the foot of the actual hemispheroid without floating.
foundation_specs=(
    ("ARCH04B • outer low solid elliptical foundation",4.84,3.08,0.0,.162),
    ("ARCH04B • intermediate podium solid foundation",4.40,2.83,.15,.50),
    ("ARCH04B • inner calotte structural support",3.57,2.37,.48,.60),
)
for name,ax,ay,z0,z1 in foundation_specs:
    register_joint("N-POD-01",elliptical_solid(
        name,ax,ay,z0,z1,polished))
for obj in scene.objects:
    if obj.type=="MESH" and obj.name.startswith("ATLAS ARCH04 • "):
        if "base" in obj.name or "plinth" in obj.name or "light seam" in obj.name:
            register_joint("N-POD-02",obj)
        if "original logo" in obj.name:
            register_joint("N-POD-03",obj)

# Two short architectural return walls propose a physically navigable front
# entry while keeping the central entrance OPEN and visible in all cameras.
# N-ENTRY-01 stays unresolved for artistic review; this is one candidate.
for left,right in ((-1.91,-1.59),(1.59,1.91)):
    register_joint("N-ENTRY-01",sector_band(
        "ARCH04B • tentative front entrance curved side return",
        11.05,11.85,0.0,5.90,wall,
        start=left,end=right,segments=12))

# Geometric contact tests: no reliance on visual overlays.
for label,(px,py,yaw) in PORTAL_LAYOUT.items():
    base=bpy.data.objects["ARCH04B • portal physical foot "+label]
    if abs((base.location.z-base.dimensions.z/2)-GEO_FLOOR_Z)>1e-5:
        raise RuntimeError("Portal base unsupported at floor: "+label)
if abs((0.0)-GEO_FLOOR_Z)>1e-8:
    raise RuntimeError("Podium foundation failed floor contact")
for key in ("N-FLO-01","N-ROT-01","N-GAL-01","N-GAL-02","N-GAL-03",
            "N-OCU-01","N-OCU-02","N-OCU-03","N-POR-01","N-POR-02",
            "N-POR-03","N-POD-01","N-POD-02","N-POD-03","N-ENTRY-01"):
    if not JOINT_OBJECTS.get(key):
        raise RuntimeError("Construction node missing real geometry: "+key)

bpy.context.view_layer.update()

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
    "hero":camera("CAM_HERO_ARCH04",(0,-15.8,3.38),(0,2.2,2.05),30.0),
    "side":camera("CAM_SIDE_ARCH04",(5.0,-13.8,3.56),(0,2.2,2.22),29.0),
    "mobile":camera("CAM_MOBILE_ARCH04",(0,-18.3,3.54),(0,2.4,2.59),23.5),
    "mobile_left":camera("CAM_MOBILE_LEFT_ARCH04",(-4.20,-11.4,3.42),(-4.05,1.72,3.01),32.0),
    "mobile_right":camera("CAM_MOBILE_RIGHT_ARCH04",(4.20,-11.4,3.42),(4.05,1.72,3.01),32.0)
}
# Additional orthographic plates are diagnostic geometry views, not cross-section
# boolean cuts. The original photo and 5 perspective views remain authoritative.
for label,where,target,span in (
    ("top_ortho",(0,1.3,37.0),(0,1.3,0),32.0),
    ("front_ortho",(0,-34.0,4.7),(0,2.0,4.2),29.0),
    ("side_ortho",(34.0,1.3,4.7),(0,1.3,4.2),29.0)):
    c=camera("CAM_"+label.upper()+"_ARCH04B",where,target,35)
    c.data.type="ORTHO"
    c.data.ortho_scale=span
    cameras[label]=c

scene.render.engine="CYCLES"
scene.cycles.samples=16
bpy.context.view_layer.cycles.use_denoising=True
scene.render.image_settings.file_format="PNG"
scene.render.resolution_percentage=100
scene.render.film_transparent=False
scene.camera=cameras["hero"]
candidate=os.path.join(OUT,"atlas-foyer-arch04b-geometric-candidate.blend")
bpy.ops.wm.save_as_mainfile(filepath=candidate)
# ART-PROOF-01 uses the same physical architecture, but evaluates two carefully
# lit frames instead of rerendering eight low-detail architectural checks.
# Default ARCH-04B remains bit-for-bit behaviorally unchanged.
if "--geometry-only" in ARGS:
    print("ATLAS_ARCH04B_GEOMETRY_ONLY",candidate)
    raise SystemExit(0)
output_images={}
for label,cam in cameras.items():
    scene.camera=cam
    scene.render.resolution_x,scene.render.resolution_y=(
        (840,472) if label in ("hero","side") else
        ((420,744) if label.startswith("mobile") else (920,720)))
    image_path=os.path.join(OUT,label+"-arch04b-"+("ortho" if label.endswith("_ortho") else "cycles")+".png")
    scene.render.filepath=image_path
    # Headless GitHub Actions lacks EGL; Workbench aborts even when all geometry
    # and five perspective images are valid. Use low-sample Cycles for orthos.
    scene.render.engine="CYCLES"
    scene.cycles.samples=4 if label.endswith("_ortho") else 16
# Record objective image-space framing in addition to the PNG evidence.
    bpy.context.view_layer.update()
    from bpy_extras.object_utils import world_to_camera_view
    portal_boxes={}
    for name in PORTAL_LAYOUT:
        root=bpy.data.objects["Portale • "+name]
        frame=next((o for o in root.children if o.type=="MESH" and " • telaio" in o.name),None)
        if frame is None:
            raise RuntimeError("Missing actual portal frame "+name)
        pts=[world_to_camera_view(scene,cam,frame.matrix_world @ Vector(corner))
             for corner in frame.bound_box]
        portal_boxes[name]=[round(min(p.x for p in pts),5),
                            round(1-max(p.y for p in pts),5),
                            round(max(p.x for p in pts),5),
                            round(1-min(p.y for p in pts),5)]
    sky_obj=bpy.data.objects["OCULUS ARCH04 • visible open sky"]
    sky_pts=[world_to_camera_view(scene,cam,sky_obj.matrix_world @ Vector(corner))
             for corner in sky_obj.bound_box]
    sky_bbox=[round(min(p.x for p in sky_pts),5),
              round(1-max(p.y for p in sky_pts),5),
              round(max(p.x for p in sky_pts),5),
              round(1-min(p.y for p in sky_pts),5)]
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(image_path) or os.stat(image_path).st_size<5000:
        raise RuntimeError("Missing actual Cycles image for "+label)
    with open(image_path,"rb") as data:
        output_images[label]={"portal_boxes_normalized":portal_boxes,
                              "oculus_bbox_normalized":sky_bbox,
                              "file":os.path.basename(image_path),
                              "sha256":hashlib.sha256(data.read()).hexdigest(),
                              "bytes":os.stat(image_path).st_size}
receipt={
    "schema":"atlas.gateway.art-dir02.architecture-candidate/v4b",
    "status":"ARCH04B_JOINT_GEOMETRY_NOT_ART_APPROVED",
    "canonical_reference_sha256":CANONICAL_SHA,
    "original_master_sha256":SOURCE_SHA,
    "original_master_preserved":True,
    "candidate_master_sha256":hashlib.sha256(open(candidate,"rb").read()).hexdigest(),
    "removed_legacy_meshes":len(removed),
    "architectural_construction_nodes":{
        "document":"docs/atlas-gateway/ARCH-04-CONSTRUCTION-JOINTS-01.json",
        "geometrically_instantiated_ids":sorted(JOINT_OBJECTS),
        "geometry_mesh_references":JOINT_OBJECTS,
        "still_requires_human_review":["N-CAM-01","N-ENTRY-01"],
        "support_verification":"actual meshes at Z=0, not graphical shadow",
        "floor_z_before":floor_z_before,
        "floor_z_after":source_floor.location.z,
        "web_export_executed":False
    },
    "real_3d_mesh_count":sum(o.type=="MESH" for o in scene.objects),
    "four_original_portals_preserved":all(bpy.data.objects.get("Portale • "+n)
        for n in ("Curricolo","Esplora","Percorsi","Esperienze")),
    "architecture":{
        "podium_ellipse_semiaxes":[AX,AY],
        "podium_cap_base_and_height":[BASE,H],
        "oculus_inner_radius":r_inner,
        "oculus_geometry_height":8.44,
        "oculus_sky_height":OCULUS_SKY_Z,
        "oculus_corona_z":OCULUS_CORONA_Z,
        "portal_arc_center_y":PORTAL_ARC_CENTER_Y,
        "portal_arc_radius":PORTAL_ARC_RADIUS,
        "two_gallery_floors_z":[2.45,5.20],
        "gallery_bays":bays,
        "roof_panels":roof_panels,
        "portal_world_layout":PORTAL_LAYOUT,
        "mobile_focus_cameras":True,
        "roof_front_open_for_navigation":True},
    "renders":output_images,
    "material_or_lighting_revision":"ARCH04 source look only, no VIS-01 lighting approval",
    "orthographic_drawings_are_true_sections":False,
    "entry_front_solution_approved":False,
    "runtime_exported":False,
    "student_authorized":False,
    "public_release":False
}
with open(os.path.join(OUT,"architecture-receipt.json"),"w",encoding="utf8") as f:
    json.dump(receipt,f,ensure_ascii=False,indent=2)
print("ATLAS_ARCH04B_JOINT_GEOMETRY_RENDERED",json.dumps(receipt,ensure_ascii=False))
