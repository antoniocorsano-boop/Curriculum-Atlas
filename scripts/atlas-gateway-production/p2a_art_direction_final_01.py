#!/usr/bin/env python3
"""ATLAS P2A — revisione unica della composizione A con Blender e Cycles.

Origine: master autentico A della PR P2; B/C non modificati.
Oggetti fisici, materiali procedurali e illuminazione: niente immagine piana.
Nessuna approvazione artistica automatica, esportazione studenti o distribuzione.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view

ARGS=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def arg(name):
    i=ARGS.index(name) if name in ARGS else -1
    if i<0 or i+1>=len(ARGS): raise RuntimeError("Missing "+name)
    return ARGS[i+1]
def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for c in iter(lambda:f.read(1<<20),b""):h.update(c)
    return h.hexdigest()
src=Path(bpy.data.filepath).resolve()
out=Path(arg("--out")).resolve()
out.mkdir(parents=True,exist_ok=True)
parent=json.loads(Path(arg("--parent-receipt")).read_text(encoding="utf-8"))
A=parent["profiles"]["A"]
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
assert (parent["schema"]=="atlas.artdir02.p2-compositions-01/v1"
        and parent["original_art_reference_sha256"]==CANON
        and src.name==A["files"]["blend"]["name"]
        and digest(src)==A["files"]["blend"]["sha256"]
        and not parent["art_approved"] and not parent["web_approved"]
        and parent["no_merge"] and parent["no_deploy"]), "Unqualified P2A source"
src_sha=digest(src)
scene=bpy.context.scene
def obj(name,kind=None):
    q=bpy.data.objects.get(name)
    if q is None or (kind and q.type!=kind):raise RuntimeError("Missing "+name)
    return q
def projected(pane,cam):
    p=Vector(tuple(sum(q[i] for q in pane.bound_box)/8. for i in range(3)))
    return world_to_camera_view(scene,cam,pane.matrix_world@p)
def mesh_material(name,base,metal=0.,rough=.33):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*base,1.)
    m.use_nodes=True
    bs=m.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*base,1.)
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    return m
def emission(name,color,strength):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    nodes=m.node_tree.nodes
    nodes.clear()
    p=nodes.new("ShaderNodeOutputMaterial")
    e=nodes.new("ShaderNodeEmission")
    e.inputs["Color"].default_value=(*color,1.)
    e.inputs["Strength"].default_value=strength
    m.node_tree.links.new(e.outputs[0],p.inputs["Surface"])
    return m
def assign(q,mat):
    q.data=q.data.copy()
    q.data.materials.clear()
    q.data.materials.append(mat)
def rect_rounded(name,parent,mat,front=0.015):
    # Marco reale in tre dimensioni, ancorato al mesh originale del vetro.
    coords=[list(p) for p in parent.bound_box]
    lo=[min(p[i] for p in coords) for i in range(3)]
    hi=[max(p[i] for p in coords) for i in range(3)]
    hor=0 if hi[0]-lo[0] >= hi[1]-lo[1] else 1
    depth=1-hor
    w=hi[hor]-lo[hor]
    h=hi[2]-lo[2]
    if w<.3 or h<.5:raise RuntimeError("Portal glass geometry not rectangular")
    r=min(w*.10,h*.10)
    fixed=lo[depth]-front
    a,b=lo[hor],hi[hor]
    z0,z1=lo[2],hi[2]
    pts=[(a,z0),(b,z0),(b,z1-r)]
    for k in range(1,7):
        t=(math.pi/2)*(k/6)
        pts.append((b-r+r*math.cos(t),z1-r+r*math.sin(t)))
    pts.append((a+r,z1))
    for k in range(1,7):
        t=(math.pi/2)+(math.pi/2)*(k/6)
        pts.append((a+r+r*math.cos(t),z1-r+r*math.sin(t)))
    pts.append((a,z0+r))
    cu=bpy.data.curves.new(name,"CURVE")
    cu.dimensions="3D"
    cu.resolution_u=16
    cu.bevel_depth=.042
    cu.resolution_u=8
    cu.bevel_resolution=3
    sp=cu.splines.new("POLY")
    sp.points.add(len(pts)-1)
    for p,(x,z) in zip(sp.points,pts):
        xyz=[0.,0.,z]
        xyz[hor]=x
        xyz[depth]=fixed
        p.co=(*xyz,1.)
    sp.use_cyclic_u=True
    q=bpy.data.objects.new(name,cu)
    scene.collection.objects.link(q)
    q.parent=parent
    cu.materials.append(mat)
    return q
def area(name,pos,target,energy,size,color):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=energy
    data.shape="DISK"
    data.size=size
    data.color=color
    q=bpy.data.objects.new(name,data)
    scene.collection.objects.link(q)
    q.location=Vector(pos)
    look=Vector(target)-q.location
    q.rotation_euler=look.to_track_quat("-Z","Y").to_euler()
    return q

cam=obj("CAM_HERO_ARCH04","CAMERA")
roof=obj("ATLAS P1F • padiglione lungo copertura monolitica","MESH")
sky=obj("ATLAS P1F • cielo unico del padiglione","MESH")
rim=obj("ATLAS P1F • unico bordino lucernario","MESH")
first=obj("ARCH04 • first gallery deck","MESH")
upper=obj("ARCH04 • upper gallery deck","MESH")
floor=obj("Atrio • pavimento lapideo","MESH")
names=("Curricolo","Esplora","Percorsi","Esperienze")
roots=[obj("Portale • "+n) for n in names]
panes=[obj(n+" • vetro cobalto","MESH") for n in names]
bases=[obj("ATLAS R6D • sole luminous metal base "+n) for n in names]
centre=sky.matrix_world @ sky.data.vertices[0].co
camxy=cam.matrix_world.translation
forward=Vector((centre.x-camxy.x,centre.y-camxy.y))
forward.normalize()
side=Vector((-forward.y,forward.x))
heading=math.atan2(side.y,side.x)
old=[root.matrix_world.copy() for root in roots]
oldpane_bottom=[min((pane.matrix_world@v.co).z for v in pane.data.vertices) for pane in panes]
radius=8.20
screen_targets=(.205,.365,.635,.795)
portal_positions=[]
for n,root,pane,base,target,original,bottom in zip(
    names,roots,panes,bases,screen_targets,old,oldpane_bottom
):
    sign=1. if target<.5 else -1.
    oldpos=original.translation.copy()
    def place(deg):
        theta=math.radians(sign*deg)
        root.location.x=centre.x-radius*math.cos(theta)*forward.x+radius*math.sin(theta)*side.x
        root.location.y=centre.y-radius*math.cos(theta)*forward.y+radius*math.sin(theta)*side.y
        # The semantic front face (titles/icons) must point toward the viewer.
        # P2A/R3 exposed mirrored back-facing labels, so turn the real panel.
        root.rotation_euler.z=heading-math.radians(sign*deg*.20)+math.pi
        bpy.context.view_layer.update()
        return projected(pane,cam).x
    lo,hi=5.,79.
    xlo,xhi=place(lo),place(hi)
    if not (min(xlo,xhi)-.035 <= target <= max(xlo,xhi)+.035):
        raise RuntimeError("Desired glass separation out of arc bounds: "+n+" "+str((xlo,xhi,target)))
    for _ in range(25):
        middle=(lo+hi)/2.
        x=place(middle)
        if (x<target)==(xhi<xlo):hi=middle
        else:lo=middle
    screen_x=place((lo+hi)/2.)
    # Slightly taller transparent glass, same glass foot/floor contact.
    root.scale.z*=1.10
    bpy.context.view_layer.update()
    dz=bottom-min((pane.matrix_world@v.co).z for v in pane.data.vertices)
    root.location.z+=dz
    bpy.context.view_layer.update()
    newpos=root.matrix_world.translation.copy()
    change=(root.matrix_world @ original.inverted())
    # A parented base already follows a moving portal; do not transform twice.
    ancestor=base.parent
    attached=False
    while ancestor is not None:
        if ancestor==root:
            attached=True
            break
        ancestor=ancestor.parent
    if not attached:
        base.matrix_world=change@base.matrix_world
    q=projected(pane,cam)
    portal_positions.append({"name":n,"angle_abs_deg":(lo+hi)/2.,
           "screen_target":target,"screen_x":q.x,"screen_y":q.y,
           "camera_side":(newpos.xy-centre.xy).dot(forward)<0,
           "old_xyz":list(oldpos),"new_xyz":list(newpos)})
# Geometric and ordered: central open visual corridor is a measurable constraint.
if any(abs(r["screen_x"]-r["screen_target"])>.03 or not r["camera_side"] for r in portal_positions):
    raise RuntimeError("Portals not spaced on real camera-side arc")
if not all(portal_positions[i]["screen_x"]<portal_positions[i+1]["screen_x"]
           for i in range(3)):
    raise RuntimeError("Portal order reversed or overlapping")
if portal_positions[2]["screen_x"]-portal_positions[1]["screen_x"]<.22:
    raise RuntimeError("Atlas central podium not afforded visual space")

glass=bpy.data.materials.new("ATLAS P2A • vetro azzurro realmente traslucido")
glass.diffuse_color=(.10,.32,.55,.32)
glass.use_nodes=True
nodes=glass.node_tree.nodes
nodes.clear()
output=nodes.new("ShaderNodeOutputMaterial")
transparent=nodes.new("ShaderNodeBsdfTransparent")
transparent.inputs["Color"].default_value=(.78,.90,1.,1.)
film=nodes.new("ShaderNodeBsdfPrincipled")
film.inputs["Base Color"].default_value=(.035,.13,.29,1.)
film.inputs["Roughness"].default_value=.13
film.inputs["Metallic"].default_value=.12
mix=nodes.new("ShaderNodeMixShader")
mix.inputs[0].default_value=.64
links=glass.node_tree.links
links.new(film.outputs["BSDF"],mix.inputs[1])
links.new(transparent.outputs[0],mix.inputs[2])
links.new(mix.outputs[0],output.inputs["Surface"])
gold=emission("ATLAS P2A • filamento ottone illuminato",(.95,.58,.25),2.2)
trim=mesh_material("ATLAS P2A • bronzo scuro",(.12,.085,.065),.62,.28)
frame_names=[]
disabled_backings=[]
portal_inventory={}
for n,root,pane,base in zip(names,roots,panes,bases):
    entries=[]
    for child in root.children_recursive:
        if child.type=="MESH":
            entries.append({"name":child.name,
                "dimensions_bu":[round(float(x),3) for x in child.dimensions],
                "materials":[m.name for m in child.data.materials if m is not None],
                "hidden_original":bool(child.hide_render)})
    portal_inventory[n]=entries
    print("ATLAS_P2A_PORTAL_OBJECT_INVENTORY",n,json.dumps(entries,ensure_ascii=False),flush=True)
    assign(pane,glass)
    frame_names.append(rect_rounded("ATLAS P2A • bordo luminoso "+n,pane,gold).name)
    # Historical rear plates AND the nontransparent thick legacy frame
    # must disappear; a thin, genuine emissive 3D perimeter replaces them.
    for child in root.children_recursive:
        if child.type=="MESH" and any(w in child.name.lower() for w in ("retro","telaio")):
            child.hide_render=True
            disabled_backings.append(child.name)
    if base.type=="MESH":
        assign(base,trim)
if len([x for x in disabled_backings if "retro" in x.lower()])!=4:
    raise RuntimeError("Expected four historical opaque backings: "+str(disabled_backings))

# Renderable physically recessed slots: subtract a cutter from the original
# floor mesh; verify face topology changes, rather than placing a fake texture.
floor.data=floor.data.copy()
original_face_count=len(floor.data.polygons)
zfloor=max((floor.matrix_world@Vector(v)).z for v in floor.bound_box)
cuts=[]
for n,root,pane in zip(names,roots,panes):
    loc=root.matrix_world.translation.copy()
    bpy.ops.mesh.primitive_cube_add(size=1.,location=(loc.x,loc.y,zfloor-.10))
    cutter=bpy.context.object
    cutter.name="ATLAS P2A • utensile feritoia "+n
    cutter.rotation_euler.z=root.rotation_euler.z
    cutter.dimensions=(2.28,.30,.75)
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    modifier=floor.modifiers.new("ATLAS P2A • taglio autentico "+n,"BOOLEAN")
    modifier.operation="DIFFERENCE"
    modifier.solver="EXACT"
    modifier.object=cutter
    bpy.context.view_layer.objects.active=floor
    floor.select_set(True)
    try:
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    finally:
        floor.select_set(False)
    cuts.append(cutter.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
floor_modified=len(floor.data.polygons)!=original_face_count
if not floor_modified:
    raise RuntimeError("Floor slots did not change actual floor topology")
# Dark, recessed physical channel, bounded by a delicate luminous fillet.
for n,pane in zip(names,panes):
    lo=[min(q[i] for q in pane.bound_box) for i in range(3)]
    hi=[max(q[i] for q in pane.bound_box) for i in range(3)]
    # A very low bronze lip keeps the window's origin legible on floor.
    p=pane.matrix_world.translation
    bpy.ops.mesh.primitive_cube_add(size=1.,location=(p.x,p.y,zfloor-.20))
    q=bpy.context.object
    q.name="ATLAS P2A • recesso fisico "+n
    q.dimensions=(2.10,.22,.30)
    q.rotation_euler.z=roots[names.index(n)].rotation_euler.z
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    assign(q,trim)

# Gallery horizontal masses become subdued graphite, retaining 3 real levels.
graphite=mesh_material("ATLAS P2A • gallerie grafite satinata",(.078,.12,.18),.32,.32)
galley_materials=[]
portal_members={p.name for root in roots for p in root.children_recursive}
for o in list(scene.objects):
    if o.type!="MESH" or o in (roof,sky,rim,floor) or o.name in portal_members:
        continue
    key=o.name.lower()
    if not any(w in key for w in ("gallery","curved slab","railing","handrail","cornice")):
        continue
    if any(w in key for w in ("glass","vetro","plant","lamp","pot","recess")):
        continue
    material=trim if any(w in key for w in ("railing","handrail","cornice")) else graphite
    assign(o,material)
    galley_materials.append(o.name)
if first.name not in galley_materials or upper.name not in galley_materials:
    raise RuntimeError("Gallery levels were not rebalanced")
# Skylight rim and light beams are three-dimensional, not an image overlay.
assign(rim,gold)
top=max((roof.matrix_world@Vector(v)).z for v in roof.bound_box)
light_names=[]
light_names.append(area("ATLAS P2A • luce zenitale principale",
  (centre.x,centre.y,top-.25),(0.,-.6,0.),1900.,7.5,(.66,.84,1.)).name)
light_names.append(area("ATLAS P2A • diffuse interior from skylight",
  (centre.x,centre.y-.6,8.5),(centre.x,centre.y-2.,.7),2300.,9.0,(.72,.88,1.)).name)
light_names.append(area("ATLAS P2A • riempimento caldo podio",
  (centre.x,centre.y-5.,5.8),(0.,0.,.7),720.,5.8,(1.,.72,.49)).name)
for idx,(x,y) in enumerate(((-5.,-3.0),(5.,-3.0))):
    light_names.append(area("ATLAS P2A • riflesso laterale "+str(idx),
      (x,y,5.6),(x*.65,0.,1.4),380.,3.0,(.45,.73,1.)).name)

scene.render.engine="CYCLES"
scene.cycles.samples=56
# Shift the whole optical composition upward to preserve a foreground floor
# margin, while measuring the shift on the actual Cycles HERO camera.
v0=projected(panes[1],cam).y
original_shift=cam.data.shift_y
cam.data.shift_y=original_shift+.02
bpy.context.view_layer.update()
v1=projected(panes[1],cam).y
slope=(v1-v0)/.02
if abs(slope)<.1:
    raise RuntimeError("Camera vertical optical shift is underdetermined")
cam.data.shift_y=original_shift + .11/slope
bpy.context.view_layer.update()
v2=projected(panes[1],cam).y
if not (.24<=v2<=.34):
    raise RuntimeError("Camera optical recentering outside safe portal range "+str(v2))
scene.render.resolution_x=1280
scene.render.resolution_y=720
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
scene.camera=cam
bpy.context.view_layer.update()
for n,pane in zip(names,panes):
    b=[world_to_camera_view(scene,cam,pane.matrix_world@Vector(v))
       for v in pane.bound_box]
    if min(x.x for x in b)<.03 or max(x.x for x in b)>.97:
        raise RuntimeError("Portal cut by camera: "+n)
image_path=out/"atlas-p2-A-monumentale-final-candidate-HERO.png"
scene.render.filepath=str(image_path)
bpy.ops.render.render(write_still=True)
if not image_path.is_file() or image_path.stat().st_size<25000:
    raise RuntimeError("Real Cycles render not produced")
model_path=out/"atlas-p2-A-monumentale-final-candidate.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(model_path),compress=True)
if not model_path.is_file() or model_path.stat().st_size<100000:
    raise RuntimeError("Editable Blender scene not preserved")
if digest(src)!=src_sha:raise RuntimeError("Qualified original overwritten")
report={
 "schema":"atlas.artdir02.p2a-art-direction-01/v1",
 "canonical_art_sha256":CANON,
 "parent_schema":parent["schema"],
 "parent_p2_A_blend_sha256":src_sha,
 "parent_preserved":True,
 "selected_candidate":"A Monumentale",
 "alternative_B_C_preserved":True,
 "portal_targets":portal_positions,
 "camera_vertical_recenter":{"from_shift_y":original_shift,
     "to_shift_y":cam.data.shift_y,"esplora_y_before":v0,"esplora_y_after":v2},
 "portal_front_facing_hero":True,
 "portal_frames":frame_names,
 "disabled_opaque_backings":disabled_backings,
 "portal_original_mesh_inventory":portal_inventory,
 "rebalance_gallery_objects":galley_materials,
 "portal_glass_node_material":glass.name,
 "floor_mesh":floor.name,
 "floor_faces_before":original_face_count,
 "floor_faces_after":len(floor.data.polygons),
 "floor_real_boolean":floor_modified,
 "light_objects":light_names,
 "three_levels_preserved":all(not x.hide_render for x in (first,upper)),
 "original_skylight_mesh_preserved":len(roof.data.polygons)>200,
 "art_approved":False,
 "web_approved":False,
 "no_merge":True,
 "no_deploy":True,
 "files":{
   "blend":{"name":model_path.name,"bytes":model_path.stat().st_size,"sha256":digest(model_path)},
   "png":{"name":image_path.name,"bytes":image_path.stat().st_size,"sha256":digest(image_path)}
 },
 "limitations":[
  "A is the only produced refinement; human comparison with ART-DIR-02 remains required.",
  "Rendering is Cycles, not yet a complete interactive optimized web GLB.",
  "Real device performance and final institutional approval are separate gates."
 ]
}
receipt=out/"atlas-p2a-art-direction-receipt.json"
receipt.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
print("ATLAS_P2A_REAL_ART_DIRECTION_PRODUCED",
      json.dumps({"model_sha":report["files"]["blend"]["sha256"],
      "render_sha":report["files"]["png"]["sha256"],
      "portals":portal_positions,"floor_real_boolean":floor_modified}),flush=True)
