#!/usr/bin/env python3
"""ART-DIR-02 R6B: glass-first railings, deep blue columns, subdued gallery,
and four real non-emissive perspective floor seams on the R5 master.
"""
import bpy, json, math, hashlib, sys
from pathlib import Path
from mathutils import Vector
argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in argv:raise ValueError("Missing --out")
OUT=Path(argv[argv.index("--out")+1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
SOURCE=Path(bpy.data.filepath)
if SOURCE.name!="atlas-art-dir02-gallery-finishings-r5.blend":
    raise RuntimeError("This layer must derive from archived R5, not a new scene")
def sha(p):
    h=hashlib.sha256()
    with open(p,"rb") as f:
        for part in iter(lambda:f.read(1024*1024),b""):h.update(part)
    return h.hexdigest()
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
if hero is None or hero.type!="CAMERA":raise RuntimeError("R5 camera missing")
root_names=("Curricolo","Esplora","Percorsi","Esperienze")
def roots():
    return {n:{"loc":list(bpy.data.objects["Portale • "+n].location),
               "rot":list(bpy.data.objects["Portale • "+n].rotation_euler),
               "scale":list(bpy.data.objects["Portale • "+n].scale)}
            for n in root_names}
before=roots()
hero_before=(list(hero.location),list(hero.rotation_euler),hero.data.lens)
def principled(name,base,metal,rough,transmission=0.):
    m=bpy.data.materials.new(name);m.use_nodes=True
    node=m.node_tree.nodes.get("Principled BSDF")
    node.inputs["Base Color"].default_value=(*base,1)
    node.inputs["Metallic"].default_value=metal
    node.inputs["Roughness"].default_value=rough
    if transmission:
        field=node.inputs.get("Transmission Weight") or node.inputs.get("Transmission")
        if field:field.default_value=transmission
        else:raise RuntimeError("Blender has no transmission shader input")
    return m
glass=principled("ATLAS R6B • transparent smoked gallery glass",
                 (.055,.12,.19),.025,.16,.68)
thinmetal=principled("ATLAS R6B • nearly black balcony frame",
                     (.045,.062,.077),.63,.42)
column=principled("ATLAS R6B • deep-blue shaded stone columns",
                   (.028,.046,.073),.13,.52)
fascia=principled("ATLAS R6B • blue-black continuous gallery fascia",
                   (.032,.044,.068),.16,.47)
floorline=principled("ATLAS R6B • satin bronze natural stone joint",
                      (.22,.17,.115),.65,.34)
floorlineblue=principled("ATLAS R6B • cool reflected joint",
                         (.09,.16,.22),.24,.30)

changed={"glass_railings":[],"dark_columns":[],"dark_balcony_frames":[],
         "gallery_facings":[],"floor_seams":[]}
def reassign(o,m):
    if o.type!="MESH":return False
    o.data=o.data.copy();o.data.materials.clear()
    o.data.materials.append(m)
    return True
for o in list(scene.objects):
    n=o.name
    if n.startswith("ARCH04 • genuine glass balustrade"):
        if reassign(o,glass):changed["glass_railings"].append(n)
    elif n.startswith(("ARCH04 • full-depth structural pier",
                       "ARCH04 • structural vertical side pier",
                       "ARCH04B • real pier-to-gallery sleeve")):
        if reassign(o,column):changed["dark_columns"].append(n)
    elif n.startswith(("ARCH04 • discrete inner baluster",
                       "ARCH04B • glass railing mechanical channel",
                       "ARCH04 • first gallery handrail",
                       "ARCH04 • second gallery handrail",
                       "ARCH04 • gallery recessed soffit edge")):
        if reassign(o,thinmetal):changed["dark_balcony_frames"].append(n)
    elif n.startswith(("ARCH04 • first gallery deck",
                       "ARCH04 • upper gallery deck",
                       "ARCH04 • upper cornice")):
        if reassign(o,fascia):changed["gallery_facings"].append(n)
if (len(changed["glass_railings"])<14 or len(changed["dark_columns"])<20
    or len(changed["gallery_facings"])<3):
    raise RuntimeError("R5 gallery naming changed; never silently succeed")

# Floor bands in the reference are mostly joins and reflected light,
# NOT rows of bright LED strips. These thin real curves are non-emissive.
floor=bpy.data.objects.get("Atrio • pavimento lapideo")
if floor is None or floor.type!="MESH":raise RuntimeError("Real lapideous floor missing")
# On this source the finished floor top lies at about z=-0.04.
z=-.030
# Two groups of perspective-directed joints; all are away from the entrance
# CTA's central foreground area and inside the authored circular stone floor.
paths=[
    ((-4.65,1.35),(-7.25,-6.55),floorline),
    ((-6.00,1.05),(-8.20,-5.00),floorlineblue),
    ((4.65,1.35),(7.25,-6.55),floorline),
    ((6.00,1.05),(8.20,-5.00),floorlineblue),
]
for k,(a,b,mat) in enumerate(paths):
    data=bpy.data.curves.new("ATLAS R6B • architectural floor joint data "+str(k),"CURVE")
    data.dimensions="3D";data.resolution_u=2
    data.bevel_depth=.007 if k%2 else .009
    data.resolution_u=1;data.bevel_resolution=1
    spline=data.splines.new("POLY");spline.points.add(1)
    for point,(x,y) in zip(spline.points,(a,b)):
        point.co=(x,y,z,1)
    obj=bpy.data.objects.new("ATLAS R6B • physical floor seam "+str(k),data)
    scene.collection.objects.link(obj)
    data.materials.append(mat)
    changed["floor_seams"].append(obj.name)
# Avoid repetitive bright metal that turns the architecture into an industrial
# structure: balcony glass is dominant, trim near black and stone columns quiet.
if before!=roots():raise RuntimeError("Portal transforms unexpectedly altered")
if (list(hero.location),list(hero.rotation_euler),hero.data.lens)!=hero_before:
    raise RuntimeError("Baseline HERO camera modified")
if len(changed["floor_seams"])!=4:raise RuntimeError("Floor evidence incomplete")
bpy.ops.file.pack_all()
scene.camera=hero
candidate=OUT/"atlas-r6b-gallery-materials.blend"
bpy.ops.wm.save_as_mainfile(filepath=str(candidate))
receipt={"schema":"atlas.art-dir02.r6b-gallery-floor/v1",
         "state":"CANDIDATE__HUMAN_ART_REVIEW_REQUIRED",
         "source_r5_sha256":sha(SOURCE),"blend_sha256":sha(candidate),
         "changed_objects":changed,
         "glass_transmission":.68,"floor_seams_emission":0,
         "portals_untouched":before,"hero_camera_unchanged":True,
         "no_publication":True,"human_approved":False,"renders":{}}
# Render image + detail with the inherited physically based lighting.
review_cam=bpy.data.objects.new("CAM_ATLAS_R6B_GALLERY",
                                bpy.data.cameras.new("CAM_ATLAS_R6B_GALLERY"))
scene.collection.objects.link(review_cam)
review_cam.location=(6.0,-10.6,4.2)
review_cam.rotation_euler=(Vector((8.0,6.5,3.7))-review_cam.location).to_track_quat("-Z","Y").to_euler()
review_cam.data.lens=36
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,samples in (
    ("hero",hero,1152,648,28),
    ("glass_gallery",review_cam,832,468,18)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    img=OUT/("atlas-r6b-"+label+".png")
    scene.render.filepath=str(img)
    bpy.ops.render.render(write_still=True)
    if not img.exists() or img.stat().st_size<10000:
        raise RuntimeError("No real Cycles render "+label)
    receipt["renders"][label]={"file":img.name,"sha256":sha(img),
                               "bytes":img.stat().st_size,"size_px":[w,h]}
(OUT/"atlas-r6b-receipt.json").write_text(json.dumps(receipt,ensure_ascii=False,indent=2))
print("ATLAS_R6B_COMPLETE",json.dumps({k:len(v) for k,v in changed.items()}))
