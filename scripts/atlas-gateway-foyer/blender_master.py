#!/usr/bin/env python3
"""ATLAS-GATEWAY-01 — generatore Blender del master artistico originale.

Invocazione: blender -b --python blender_master.py -- --out /percorso/cartella
Nessuna texture esterna e nessun dato personale. Le coordinate sono Z-up Blender;
l'esportatore glTF applica la trasformazione di asse richiesta da Three.js.
Non modifica il modello canonico della precedente biblioteca.
"""
import bpy
import math
import json
import os
import sys
import hashlib
from mathutils import Vector

def output_directory():
    args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
    if "--out" not in args or args.index("--out") + 1 >= len(args):
        raise ValueError("Usage: blender --python blender_master.py -- --out OUTPUT_DIR")
    out = os.path.abspath(args[args.index("--out") + 1])
    os.makedirs(out, exist_ok=True)
    return out

OUT = output_directory()
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for datablock in bpy.data.materials:
    if datablock.users == 0:
        bpy.data.materials.remove(datablock)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.film_transparent = False
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
if hasattr(scene.cycles,"use_denoising"):
    scene.cycles.use_denoising = True

def rgba(rgb):
    return ((rgb >> 16 & 255)/255.0, (rgb >> 8 & 255)/255.0,
            (rgb & 255)/255.0, 1.0)

def material(name, color, metallic=0.0, roughness=0.45, emission=None, strength=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = rgba(color)
    m.use_nodes = True
    node = m.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value = rgba(color)
    node.inputs["Metallic"].default_value = metallic
    node.inputs["Roughness"].default_value = roughness
    if emission is not None:
        sockets = node.inputs
        if "Emission Color" in sockets:
            sockets["Emission Color"].default_value = rgba(emission)
        elif "Emission" in sockets:
            sockets["Emission"].default_value = rgba(emission)
        if "Emission Strength" in sockets:
            sockets["Emission Strength"].default_value = strength
    return m

basalt = material("Atrium • pietra basaltica scura", 0x111c2a, .26, .29)
wall = material("Atrium • pareti blu grafite", 0x132337, .26, .58)
recess = material("Atrium • nicchia blu notte", 0x071b32, .14, .54)
steel = material("Atrium • metallo ossidato", 0x274865, .68, .29)
bronze = material("Atrium • ottone satinato", 0xa78b59, .74, .31)
polished = material("Atrium • grafite lucida", 0x0a1b2e, .58, .20)
blue = material("Atrium • vetro portale luminoso", 0x13558d, .34, .20, 0x267ece, .74)
halo = material("Atrium • taglio luce cielo", 0x5899da, .12, .32, 0x5b9ef1, 2.2)
warm = material("Atrium • taglio luce bronzo", 0xd2aa6b, .28, .34, 0xe5b874, 1.5)

def assign(obj, mat, smooth=False):
    obj.data.materials.append(mat)
    if smooth and obj.type == "MESH":
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
    return obj

def cube(name, loc, scale, mat, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    assign(obj, mat)
    if bevel:
        mod = obj.modifiers.new("Raccordo architettonico", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        if hasattr(mod, "affect"):
            mod.affect = "EDGES"
        obj.modifiers.new("Normali ponderate", "WEIGHTED_NORMAL")
    return obj

def cylinder(name, loc, radius, depth, mat, segments=80):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segments, radius=radius,
        depth=depth, location=loc)
    obj=bpy.context.object
    obj.name=name
    assign(obj,mat,smooth=True)
    return obj

def beam(name, p1, p2, width, mat):
    p1=Vector(p1);p2=Vector(p2);vec=p2-p1
    obj=cube(name,(p1+p2)/2,(width,width,vec.length),mat)
    obj.rotation_euler=vec.to_track_quat("Z","Y").to_euler()
    return obj

def ring(name, radius, z, mat, thickness=.055, arc=math.tau):
    # True mesh ring; geometry carries no runtime-specific DOM labels.
    count=max(32,int(72*arc/math.tau))
    verts=[];faces=[]
    for i in range(count+1):
        a = arc*i/count
        x=math.cos(a)*radius
        y=math.sin(a)*radius + 1.3
        for dx,dz in [(-thickness,-thickness),(thickness,-thickness),
                      (thickness,thickness),(-thickness,thickness)]:
            x2=math.cos(a)*(radius+dx)
            y2=math.sin(a)*(radius+dx)+1.3
            verts.append((x2,y2,z+dz))
    for i in range(count):
        for j in range(4):
            a=i*4+j;b=i*4+(j+1)%4
            faces.append((a,b,b+4,a+4))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return assign(obj,mat)

def semicircle_wall():
    # The rear semicircle only: no wall is placed between camera and portals.
    radius=11.55;segments=64
    verts=[]
    for i in range(segments+1):
        a=-math.pi/2+math.pi*i/segments
        x=math.sin(a)*radius
        y=1.3+math.cos(a)*radius
        verts.extend([(x,y,.13),(x,y,6.28)])
    faces=[(2*i,2*i+1,2*i+3,2*i+2) for i in range(segments)]
    mesh=bpy.data.meshes.new("Curvatura muraria");mesh.from_pydata(verts,[],faces);mesh.update()
    wall_obj=bpy.data.objects.new("Atrio • parete di fondo semicircolare",mesh)
    bpy.context.collection.objects.link(wall_obj)
    assign(wall_obj,wall)
    solid=wall_obj.modifiers.new("Spessore parete", "SOLIDIFY")
    solid.thickness=.24
    return wall_obj

def dome():
    # Faceted shell with distinct radial ribs; real volume, not background image.
    sectors=48;rings=9
    vertices=[]
    for j in range(rings+1):
        t=j/rings
        r=11.46*(1-t)+3.55*t
        height=5.9+2.28*math.sin(t*math.pi/2)
        for i in range(sectors):
            a=math.tau*i/sectors
            vertices.append((math.sin(a)*r,1.3+math.cos(a)*r,height))
    faces=[]
    for j in range(rings):
        for i in range(sectors):
            a=j*sectors+i;b=j*sectors+(i+1)%sectors
            faces.append((a,b,b+sectors,a+sectors))
    mesh=bpy.data.meshes.new("Soffitto radiale")
    mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new("Atrio • cupola materica",mesh)
    bpy.context.collection.objects.link(obj)
    assign(obj,wall)
    for i in range(0,sectors,3):
        a=math.tau*i/sectors
        points=[]
        for j in range(rings+1):
            t=j/rings;r=11.48*(1-t)+3.57*t
            z=5.92+2.28*math.sin(t*math.pi/2)
            points.append((math.sin(a)*r,1.3+math.cos(a)*r,z))
        for j in range(len(points)-1):
            beam("Atrio • costolone",points[j],points[j+1],.075,
                 bronze if i%6==0 else steel)
    ring("Atrio • corona esterna",11.45,5.89,bronze,.08)
    ring("Atrio • anello lucernario",3.56,8.18,warm,.09)
    cylinder("Atrio • vetro lucernario",(0,1.3,8.23),3.48,.04,blue,64)

def portal(label,x,y,rotation_deg):
    # Blender portal coordinates mirror the four live links, no routing is embedded in GLB.
    base_y=y
    root=bpy.data.objects.new("Portale • "+label,None)
    bpy.context.collection.objects.link(root)
    root.location=(x,base_y,0)
    root.rotation_euler.z=math.radians(rotation_deg)
    def part(name,at,dim,mat):
        o=cube(label+" • "+name,at,dim,mat,bevel=.04 if mat is bronze else 0)
        o.parent=root
        o.matrix_parent_inverse=root.matrix_world.inverted()
        return o
    # World coordinates are recorded; DOM links and click geometry stay authoritative in Atlas.
    part("zoccolo",(x,base_y, .26),(3.2,.68,.32),polished)
    part("struttura",(x,base_y,2.72),(3.13,.18,5.05),steel)
    part("retro pannello",(x,base_y-.15,2.72),(2.88,.18,4.72),recess)
    part("vetro luminescente",(x,base_y-.27,2.72),(2.7,.06,4.48),blue)
    for side in (-1,1):
        part("bordo laterale",(x+side*1.53,base_y-.31,2.72),(.085,.18,5.0),bronze)
        part("bordo orizzontale",(x,base_y-.31,2.72+side*2.43),(3.15,.18,.085),bronze)
        part("luce verticale",(x+side*1.38,base_y-.35,2.72),(.027,.10,4.56),halo)
    part("corona luminosa",(x,base_y-.34,5.0),(2.77,.09,.08),warm)

# Floors, recessed gallery and structural depth.
cylinder("Atrio • pavimento lapideo",(0,1.3,-.24),11.76,.40,basalt)
cylinder("Atrio • fascia basamento",(0,1.3,-.49),11.81,.16,bronze)
ring("Atrio • cerchio di orientamento",8.6,-.031,bronze,.035)
ring("Atrio • cerchio centrale",3.3,-.025,warm,.045)
semicircle_wall()
for i in range(17):
    a=-math.pi/2+math.pi*i/16
    x=math.sin(a)*11.49;y=1.3+math.cos(a)*11.49
    cube("Atrio • pilastro esterno",(x,y,3.17),(.30,.28,6.25),
         bronze if i%4==0 else steel,bevel=.025)
    if i<16:
        m=a+math.pi/32
        xx=math.sin(m)*11.28;yy=1.3+math.cos(m)*11.28
        cube("Atrio • pannello incassato",(xx,yy,2.75),(1.06,.12,3.6),recess)
        cube("Atrio • profilo balconata",(xx,yy,4.57),(1.07,.17,.09),bronze)
dome()

# Monumental central platform with a flattened dome, directly facing the camera.
cylinder("ATLAS • podio ottagonale",(0,-2.0,.24),3.28,.48,polished,80)
ring("ATLAS • bordo del podio",3.29,.46,bronze,.075)
bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=32,radius=2.94,location=(0,-2.0,.56))
central=bpy.context.object
central.name="ATLAS • volume centrale"
central.scale.z=.54
assign(central,steel,smooth=True)
# Raised metal logotype geometry; no web fonts or external assets.
for value,z,size in [("A",1.3,1.1),("ATLAS",.62,.34)]:
    bpy.ops.object.text_add(location=(0,-5.04,z),rotation=(math.pi/2,0,0))
    obj=bpy.context.object;obj.name="ATLAS • logotipo "+value
    obj.data.body=value;obj.data.align_x="CENTER";obj.data.size=size;obj.data.extrude=.006
    obj.data.materials.append(warm)
    bpy.ops.object.convert(target="MESH")

# Front-facing panels stand at the same locations as the WebGL gateway.
portal("Curricolo",-4.8,1.0,-12)
portal("Esplora",-1.6,2.7,-4)
portal("Percorsi",1.6,2.7,4)
portal("Esperienze",4.8,1.0,12)

# A reference art render, never a substitute for the navigable GLB.
def area(name,loc,target,energy,color,size):
    bpy.ops.object.light_add(type="AREA", location=loc)
    obj=bpy.context.object;obj.name=name
    obj.data.energy=energy;obj.data.color=tuple(rgba(color)[:3])
    obj.data.shape="DISK";obj.data.size=size
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat("-Z","Y").to_euler()

area("Luce • volta blu",(-2,1.3,10),(0,1.3,0),1250,0x5d9fef,8)
area("Luce • riflesso caldo",(4,-4,6),(0,2,2),850,0xffd6a1,6)
area("Luce • riempimento sinistro",(-9,0,5),(0,3,2),550,0x8cbde8,5)
area("Luce • fronte",(0,-8,5),(0,1,2),300,0xffe2bf,9)

bpy.ops.object.camera_add(location=(0,-18,8.1))
camera=bpy.context.object
camera.name="Fotocamera • ingresso Atlas"
camera.rotation_euler=(Vector((0,1.2,3.1))-camera.location).to_track_quat("-Z","Y").to_euler()
camera.data.lens=24
scene.camera=camera
scene.world.use_nodes=True
bg=scene.world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value=rgba(0x091626)
bg.inputs["Strength"].default_value=.4
try:
    scene.view_settings.view_transform="AgX"
except (TypeError,ValueError):
    scene.view_settings.view_transform="Standard"

reference=os.path.join(OUT,"foyer-reference.png")
scene.render.filepath=reference
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT,"atlas-foyer-master.blend"))
bpy.ops.render.render(write_still=True)
# Keep the authored reference lighting in .blend, but do not double the web lights.
glb=os.path.join(OUT,"atlas-foyer-master.glb")
bpy.ops.export_scene.gltf(filepath=glb,export_format="GLB",
                          export_cameras=False,export_lights=False)
def sha(filename):
    with open(filename,"rb") as f:return hashlib.sha256(f.read()).hexdigest()
meshes=[o for o in scene.objects if o.type=="MESH"]
receipt={
    "schema":"atlas.visual-factory.foyer-source/v1",
    "source":"procedural Blender master, original geometry",
    "blender":bpy.app.version_string,
    "meshes":len(meshes),
    "triangles_estimate":sum(sum(max(1,len(p.vertices)-2) for p in o.data.polygons) for o in meshes),
    "material_count":len(bpy.data.materials),
    "has_student_data":False,
    "student_authorized":False,
    "files":{name:{"bytes":os.stat(os.path.join(OUT,name)).st_size,"sha256":sha(os.path.join(OUT,name))}
       for name in ("atlas-foyer-master.blend","atlas-foyer-master.glb","foyer-reference.png")}
}
with open(os.path.join(OUT,"source-receipt.json"),"w",encoding="utf-8") as f:
    json.dump(receipt,f,indent=2,ensure_ascii=False)
print("ATLAS_FOYER_BLENDER_SOURCE",json.dumps(receipt,ensure_ascii=False))
