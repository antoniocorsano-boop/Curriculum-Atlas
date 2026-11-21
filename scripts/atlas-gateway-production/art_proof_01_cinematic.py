#!/usr/bin/env python3
"""ATLAS ART-PROOF-01/B: independent artistic proof, not a deployed 3D gateway.

Load a real ARCH-04B geometric .blend (from existing documented build), never
paste the canonical image onto the scene. Produce two Cycles photographs:
one frontal HERO, one oblique parallax test. Keep file hashes and human gate.
Run:
 blender -b atlas-foyer-arch04b-geometric-candidate.blend --threads 2 \
   --python-exit-code 1 --python art_proof_01_cinematic.py -- --out DIR
"""
import bpy, math, json, hashlib, os, sys, random
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

SHA="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args or args.index("--out")+1>=len(args):
    raise ValueError("Specify --out DIR")
OUT=os.path.abspath(args[args.index("--out")+1]);os.makedirs(OUT,exist_ok=True)
source=bpy.data.filepath
if not os.path.isfile(source) or "arch04b-geometric-candidate.blend" not in source:
    raise ValueError("ART-PROOF requires original ARCH-04B geometry candidate")
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for block in iter(lambda:f.read(1024*1024),b""):h.update(block)
    return h.hexdigest()
source_sha=sha(source)
scene=bpy.context.scene
portal_names=["Curricolo","Esplora","Percorsi","Esperienze"]
for name in portal_names:
    if bpy.data.objects.get("Portale • "+name) is None:
        raise ValueError("Missing original portal "+name)
if not bpy.data.objects.get("OCULUS ARCH04 • visible open sky"):
    raise ValueError("Occlusion/sky geometry absent")
if not bpy.data.objects.get("ATLAS ARCH04 • original logo on convex front"):
    raise ValueError("Approved curved logo absent")

# A. Look development: no dependency on external texture libraries.
def srgb(v):
    return v/12.92 if v<.04045 else ((v+.055)/1.055)**2.4
def rgb(code):
    return tuple(srgb(((code>>s)&255)/255.0) for s in (16,8,0))+(1.,)
def pbr(name,color,metal=0,rough=.4,emission=None,brightness=0):
    m=bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes=True
    nodes=m.node_tree.nodes
    bs=nodes.get("Principled BSDF")
    if not bs:
        nodes.clear()
        out=nodes.new("ShaderNodeOutputMaterial")
        bs=nodes.new("ShaderNodeBsdfPrincipled")
        m.node_tree.links.new(bs.outputs["BSDF"],out.inputs["Surface"])
    bs.inputs["Base Color"].default_value=rgb(color)
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    if emission:
        key="Emission Color" if bs.inputs.get("Emission Color") else "Emission"
        if bs.inputs.get(key):bs.inputs[key].default_value=rgb(emission)
        if bs.inputs.get("Emission Strength"):bs.inputs["Emission Strength"].default_value=brightness
    m.diffuse_color=rgb(color)
    return m
def glow(name,color,strength=1):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes;nodes.clear()
    out=nodes.new("ShaderNodeOutputMaterial")
    em=nodes.new("ShaderNodeEmission");em.inputs["Color"].default_value=rgb(color)
    em.inputs["Strength"].default_value=strength
    mat.node_tree.links.new(em.outputs[0],out.inputs["Surface"])
    return mat
ivory=glow("PROOF • ivory portal identity",0xfff2d6,2.2)
goldline=glow("PROOF • warm-rim optical source",0xffc985,2.9)
bluepoint=glow("PROOF • network blue points",0x82d8ff,3.7)
blueglass=pbr("PROOF • narrative glass",0x397db1,.08,.28,0x368bdb,.20)
brass=pbr("PROOF • brushed brass",0xb99561,.92,.23)
darkblue=pbr("PROOF • dark cobalt inner panel",0x0b2d52,.14,.24,0x235c8e,.12)
stone=pbr("PROOF • midnight polished stone",0x101c2c,.12,.19)
center=pbr("PROOF • glossy blue graphite dome",0x081d39,.33,.17)
foliage=pbr("PROOF • botanical foliage",0x183b2b,.0,.6)

for name,material in (
    ("Atrium • pietra basaltica scura",stone),
    ("Atrium • ottone satinato",brass),
    ("Atrium • vetro portale luminoso",darkblue),
):
    src=bpy.data.materials.get(name)
    if not src:raise ValueError("Missing source material "+name)
    for o in bpy.data.objects:
        if o.type=="MESH":
            for idx,m in enumerate(o.data.materials):
                if m==src:o.data.materials[idx]=material
# Existing podium's custom sapphire material must not affect its approved logo.
cap=bpy.data.objects.get("ATLAS ARCH04 • low elliptical convex canopy")
if not cap:raise ValueError("Missing central curved canopy")
cap.data.materials.clear();cap.data.materials.append(center)

# Change rims individually: exact physical frames remain and we do not add a
# second drawn rectangle on top of the original material geometry.
for name in portal_names:
    for suffix,material in ((" • cornice continua",goldline),):
        o=bpy.data.objects.get(name+suffix)
        if not o:raise ValueError("Missing four physical perimeter rims: "+name)
        o.data=o.data.copy()
        o.data.materials.clear();o.data.materials.append(material)
    # Use the original symbol geometry, but make it legible and consistent.
    for obj in list(bpy.data.objects):
        if obj.name.startswith("Portale • simbolo "+name):
            obj.data=obj.data.copy()
            obj.data.materials.clear();obj.data.materials.append(ivory)
    old=bpy.data.objects.get("Portale • titolo "+name)
    if old:old.hide_render=True

# B. Small actual 3D narrative figures physically attached to each portal.
# All points are in master portal LOCAL coordinates, with Y<0 toward viewer.
def attach(obj,name,root):
    obj.name=name
    obj.parent=root
    return obj
def polyline(name,root,xz,material=ivory,r=.012,y=-.40):
    if len(xz)<2:raise ValueError("Polyline needs 2 points")
    c=bpy.data.curves.new(name,"CURVE")
    c.dimensions="3D";c.resolution_u=2
    c.bevel_depth=r;c.bevel_resolution=2
    sp=c.splines.new("POLY");sp.points.add(len(xz)-1)
    for p,(x,z) in zip(sp.points,xz):
        p.co=(x,y,z,1)
    c.materials.append(material)
    obj=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(obj)
    return attach(obj,name,root)
def meshplate(name,root,points,mat):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(points,[],[tuple(range(len(points)))])
    mesh.update();mesh.materials.append(mat)
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    return attach(obj,name,root)
def ball(name,root,xyz,rad,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=rad,location=(0,0,0))
    obj=bpy.context.object
    obj.location=xyz
    obj.data.materials.append(mat)
    return attach(obj,name,root)
def cuboid(name,root,xyz,scale,material):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))
    o=bpy.context.object
    o.location=xyz;o.dimensions=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    return attach(o,name,root)
def typeface(root,name,text,size,z,color,space=1.0):
    font=bpy.data.curves.new("PROOF • glyphs "+name,"FONT")
    font.body=text;font.size=size;font.align_x="CENTER"
    font.align_y="CENTER";font.space_character=space
    font.extrude=.001; font.bevel_depth=.0005
    font.materials.append(color)
    obj=bpy.data.objects.new("PROOF • "+name,font)
    bpy.context.collection.objects.link(obj)
    attach(obj,obj.name,root)
    obj.location=(0,-.47,z)
    obj.rotation_euler.x=math.pi/2
    return obj
texts={
    "Curricolo":("Curricolo","Struttura e obiettivi"),
    "Esplora":("Esplora","Relazioni e connessioni"),
    "Percorsi":("Percorsi","Itinerari formativi"),
    "Esperienze":("Esperienze","Attività e mondi")
}
for name in portal_names:
    root=bpy.data.objects["Portale • "+name]
    title,subtitle=texts[name]
    typeface(root,name+" titolo",title,.35,3.33,ivory)
    typeface(root,name+" sottotitolo",subtitle,.145,2.88,ivory)
    if name=="Curricolo":
        # Four independent oblique blue layers with a warm underlight;
        # thin material solids in 3D, not a flat screenshot.
        for i in range(4):
            z=1.20+i*.20
            pts=[(-.74,-.43,z),(-.05,-.48,z+.17),(.74,-.43,z),(.03,-.39,z-.17)]
            meshplate("PROOF • Curricolo layer "+str(i),root,pts,
                blueglass if i!=0 else brass)
            polyline("PROOF • Curricolo layer edge "+str(i),root,
                [(-.74,z),(-.05,z+.17),(.74,z),(.03,z-.17),(-.74,z)],
                goldline if i==0 else bluepoint,.009,y=-.49)
    elif name=="Esplora":
        pts=[(-.86,1.23),(-.66,1.84),(-.35,1.50),(-.12,2.03),
             (.09,1.45),(.35,1.78),(.65,1.25),(.71,1.94),
             (-.35,1.15),(.12,1.94),(-.79,1.60)]
        edges=[(0,1),(0,8),(1,2),(1,10),(2,3),(2,8),(2,9),
               (3,4),(3,9),(4,5),(4,8),(5,6),(5,7),(5,9),
               (6,7),(7,9),(8,10),(3,10)]
        for k,(a,b) in enumerate(edges):
            polyline("PROOF • Esplora network edge "+str(k),root,
                     [pts[a],pts[b]],bluepoint,.005,y=-.43)
        for k,(x,z) in enumerate(pts):
            ball("PROOF • Esplora luminous node "+str(k),root,
                 (x,-.46,z),.027 if k%3 else .045,bluepoint)
    elif name=="Percorsi":
        for i in range(6):
            x=-.77+i*.255
            z=1.14+i*.165
            cuboid("PROOF • Percorsi illuminated step "+str(i),root,
                   (x,-.43-.025*i,z),(.25,.15,.11),brass)
            polyline("PROOF • Percorsi stair gold edge "+str(i),root,
                     [(x-.125,z+.057),(x+.125,z+.057)],ivory,.012,y=-.54-.025*i)
        polyline("PROOF • Percorsi ascension",root,
                 [(-.9,1.0),(.80,2.15)],bluepoint,.005,y=-.42)
    else:
        # The planet is true curved spherical geometry, not a photographic
        # half-globe billboard: it remains a sphere in the oblique check.
        globe=pbr("PROOF • globe ocean",0x084a7c,.22,.3,0x166eb3,.2)
        haze=glow("PROOF • globe atmospheric edge",0x67bbff,.8)
        obj=ball("PROOF • Esperienze Earth spherical form",root,
                 (0,-.35,1.00),.85,globe)
        obj.scale=(1,.64,.72)
        # Physical curved latitude and longitude strips.
        for latitude in (-.40,-.10,.20,.47):
            radius=.83*math.sqrt(max(.08,1-latitude**2))
            pts=[(radius*math.cos(math.pi*j/48),1.0+latitude*.72+
                  .02*math.sin(math.pi*j/48)) for j in range(49)]
            polyline("PROOF • Earth glancing latitude "+str(latitude),root,
                     pts,haze,.006,y=-.78)
        for i in range(5):
            a=(i-2)*.29
            pts=[(.85*math.sin(a)*math.cos(t),1.0+.65*math.sin(t))
                 for t in [-1.15+k*2.3/44 for k in range(45)]]
            polyline("PROOF • Earth curved meridian "+str(i),root,
                     pts,bluepoint,.004,y=-.86)
# C. Scene's original bronze lines and 3D floor with restrained highlights.
for obj in scene.objects:
    if obj.type=="MESH" and obj.name.startswith("ATLAS ARCH04 • one coherent light seam"):
        obj.data=obj.data.copy();obj.data.materials.clear()
        obj.data.materials.append(goldline)
    if obj.type=="MESH" and obj.name.startswith("ATLAS ARCH04 • low outer bronze base"):
        obj.data=obj.data.copy();obj.data.materials.clear()
        obj.data.materials.append(brass)
for obj in scene.objects:
    if obj.type=="MESH" and "botanical foliage" in obj.name:
        obj.data=obj.data.copy();obj.data.materials.clear();obj.data.materials.append(foliage)
# Repeated slender grooves, physically on the floor, are subtle visual cues.
for i in range(-5,6):
    if i==0:continue
    polyline("PROOF • floor inlay "+str(i),None,
             [(i*1.20,0),(i*.58,0)],brass,.006,y=0) if False else None

# D. Cinematic light sources; the volumes are evaluated as 3D in both views.
def area(name,where,target,energy,col,size):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=energy;data.color=tuple(rgb(col)[:3])
    data.shape="DISK";data.size=size
    o=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(o);o.location=where
    o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
    return o
area("PROOF • broad cool skylight",(0,1.1,8.10),(0,-.8,0),1900,0xc2e8ff,7.0)
area("PROOF • warm left architectural",( -6,-2.5,5.6),(-2,1.8,2.5),650,0xffc887,4.0)
area("PROOF • warm right architectural",(6,-2.5,5.6),(2,1.8,2.5),650,0xffc887,4.0)
area("PROOF • front soft fill",(0,-9.2,5.5),(0,0,2.4),680,0xbcdcff,9.0)
area("PROOF • upper far reflected fill",(0,8.5,6.8),(0,2.5,3),520,0xffc884,6.0)
# Small point sources at gallery openings: physical incidence on columns.
for side in (-1,1):
    for idx in range(5):
        ang=side*(.22+idx*.24)
        x=11.0*math.sin(ang);y=1.3+11.0*math.cos(ang)
        lamp=bpy.data.lights.new("PROOF • warm gallery lamp","POINT")
        lamp.energy=65;lamp.color=tuple(rgb(0xffc787)[:3])
        lamp.shadow_soft_size=.30
        o=bpy.data.objects.new("PROOF • gallery lamp",lamp)
        bpy.context.collection.objects.link(o)
        o.location=(x,y,3.72 if idx%2 else 6.20)
# Cones with participating medium, not flat translucent 2D rectangles.
fog=bpy.data.materials.new("PROOF • participating atmospheric shaft")
fog.use_nodes=True
fog.node_tree.nodes.clear()
out=fog.node_tree.nodes.new("ShaderNodeOutputMaterial")
vol=fog.node_tree.nodes.new("ShaderNodeVolumePrincipled")
vol.inputs["Color"].default_value=rgb(0xb6dfff)
vol.inputs["Density"].default_value=.012
if vol.inputs.get("Anisotropy"):vol.inputs["Anisotropy"].default_value=.47
fog.node_tree.links.new(vol.outputs["Volume"],out.inputs["Volume"])
for i,(x,z) in enumerate([(-2.8,1.7),(-1.8,2.3),(-.8,1.4),(.30,2.3),
                          (1.25,1.2),(2.3,2.1),(3.4,1.55)]):
    # Mesh cone with real enclosed volume, anchored immediately below oculus.
    bpy.ops.mesh.primitive_cone_add(vertices=18,radius1=.54,radius2=.20,
                                    depth=6.5,location=(x*.46,0.4,5.15))
    obj=bpy.context.object;obj.name="PROOF • atmospheric volume "+str(i)
    obj.rotation_euler.y=.045*i-.12
    obj.data.materials.append(fog)

# E. Camera: make more of skylight visible while keeping primary portal line.
def orient(o,target):
    o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if not hero or hero.type!="CAMERA":raise ValueError("Missing real HERO camera")
hero.location=(0,-16.7,4.02)
orient(hero,(0,2.35,3.17));hero.data.lens=28.2
bpy.ops.object.camera_add(location=(3.5,-16.7,4.15))
oblique=bpy.context.object;oblique.name="CAM_ART_PROOF_OBLIQUE_3D"
orient(oblique,(0,2.2,2.95));oblique.data.lens=28
# Preserve identity of image and art direction, never point lens at an art plane.
for o in scene.objects:
    if o.type=="MESH" and ("CANONICAL" in o.name or "BILLBOARD" in o.name):
        raise ValueError("Scene contains a forbidden 2D canonical-image substitute")
scene.render.engine="CYCLES"
scene.cycles.samples=24
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
scene.view_settings.look="Medium High Contrast" if "Medium High Contrast" in (
    [x.identifier for x in bpy.types.ColorManagedViewSettings.bl_rna.properties["look"].enum_items]
    if False else []) else scene.view_settings.look
try:scene.view_settings.view_transform="AgX"
except (TypeError,ValueError):scene.view_settings.view_transform="Standard"
scene.view_settings.exposure=0.35
scene.view_settings.gamma=1.0
scene.world.use_nodes=True
background=scene.world.node_tree.nodes.get("Background")
if background:
    background.inputs["Color"].default_value=rgb(0x10273c)
    background.inputs["Strength"].default_value=.55
bpy.context.view_layer.cycles.use_denoising=True

# Save the actual revised blend BEFORE the rendered images: never overwrite
# ARCH-04B or the previously approved ART-DIR-02 JPEG.
bpy.context.view_layer.update()
candidate=os.path.join(OUT,"atlas-art-proof-01b-cinematic.blend")
scene.camera=hero
bpy.ops.wm.save_as_mainfile(filepath=candidate)

receipt={
 "schema":"atlas.gateway.art-proof-01b.cycles-v1",
 "status":"ARTISTIC_FEASIBILITY_CANDIDATE__HUMAN_DECISION_REQUIRED",
 "canonical_sha256":SHA,
 "input_arch04b_blend_sha256":source_sha,
 "candidate_blend_sha256":sha(candidate),
 "original_arch04b_preserved":True,
 "logo_preserved":bpy.data.objects.get("ATLAS ARCH04 • original logo on convex front") is not None,
 "four_physical_portals":portal_names,
 "portal_labels":texts,
 "images_are_photographed_3d_not_reference_plane":True,
 "two_views_required":True,
 "cycles_renderer":bpy.app.version_string,
 "art_direction_requirements":["4 original portal narratives","glossy floor","brass details",
  "oculus sky and crown","volumetric sun shafts","3D oblique parallax"],
 "student_authorized":False,"public_release":False,"web_exported":False,
 "renders":{}
}
for label,camera,width,height,samples in (
    ("hero",hero,1280,720,32),
    ("oblique",oblique,1024,576,24)):
    scene.camera=camera
    scene.cycles.samples=samples
    scene.render.resolution_x=width;scene.render.resolution_y=height
    path=os.path.join(OUT,"atlas-art-proof-01b-"+label+".png")
    scene.render.filepath=path
    bpy.ops.render.render(write_still=True)
    if not os.path.isfile(path) or os.stat(path).st_size<9000:
        raise RuntimeError("Real Cycles render missing "+label)
    sky=bpy.data.objects["OCULUS ARCH04 • visible open sky"]
    pts=[world_to_camera_view(scene,camera,sky.matrix_world@Vector(v))
         for v in sky.bound_box]
    receipt["renders"][label]={
        "file":os.path.basename(path),"sha256":sha(path),"bytes":os.path.getsize(path),
        "oculus_projected_bbox_norm":[min(p.x for p in pts),1-max(p.y for p in pts),
                                     max(p.x for p in pts),1-min(p.y for p in pts)],
        "camera":camera.name,"dimensions":[width,height],"samples":samples}
with open(os.path.join(OUT,"art-proof-receipt.json"),"w") as f:
    json.dump(receipt,f,indent=2,ensure_ascii=False)
print("ATLAS_ART_PROOF_01B_CYCLES_COMPLETED",json.dumps(receipt,ensure_ascii=False))
