#!/usr/bin/env python3
"""ART-DIR-02 R6A — sky, dark vault and restrained roof structures.
Non-destructive derivative of the actual R5 Blender scene. No portal edits.
"""
import bpy, math, json, sys, hashlib
from pathlib import Path
from mathutils import Vector

argv=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in argv:raise RuntimeError("Missing --out")
OUT=Path(argv[argv.index("--out")+1]).resolve();OUT.mkdir(parents=True,exist_ok=True)
source=Path(bpy.data.filepath)
if source.name!="atlas-art-dir02-gallery-finishings-r5.blend":
    raise RuntimeError("R6A requires archived R5 .blend")
def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as stream:
        for block in iter(lambda:stream.read(1024*1024),b""):h.update(block)
    return h.hexdigest()
scene=bpy.context.scene
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
sky=bpy.data.objects.get("OCULUS ARCH04 • visible open sky")
if not hero or hero.type!="CAMERA" or not sky or sky.type!="MESH":
    raise RuntimeError("R5 HERO or genuine open-sky mesh missing")
names=("Curricolo","Esplora","Percorsi","Esperienze")
def portals():
    return {n:{"location":list(bpy.data.objects["Portale • "+n].location),
               "rotation":list(bpy.data.objects["Portale • "+n].rotation_euler),
               "scale":list(bpy.data.objects["Portale • "+n].scale)} for n in names}
before=portals()
camera_before={"location":list(hero.location),"rotation":list(hero.rotation_euler),"lens":hero.data.lens}

def material(name,base,metal=.05,rough=.65):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*base,1)
    p.inputs["Metallic"].default_value=metal
    p.inputs["Roughness"].default_value=rough
    return m
vault=material("ATLAS R6A • seamless graphite blue ceiling",(.020,.033,.055),.13,.55)
metal=material("ATLAS R6A • dark subdued structural bronze",(.055,.064,.074),.48,.49)
glassdark=material("ATLAS R6A • opaque muted vault canopy",(.025,.044,.069),.08,.48)
changed={"vault_panels":[],"roof_structures_hidden":[],"subdued_mullions":[],"corona":[]}

def apply(ob,mat):
    if ob.type=="MESH":
        ob.data=ob.data.copy()
        ob.data.materials.clear();ob.data.materials.append(mat)

# Roof glass presently reads as bright striped steel. Dark, continuous cladding
# and a selectively suppressed rafter pattern reproduces the image's visual hierarchy.
panels=sorted((o for o in scene.objects if o.name.startswith(
    "ARCH04 • separated skylight roof glass")),key=lambda o:o.name)
if len(panels)<12:raise RuntimeError("Expected authored radial roof glass panels")
for panel in panels:
    apply(panel,glassdark)
    # Reduce visible aperture from r≈6.8 to r≈5.3 Blender units, preserving the
    # existing exterior roof and without changing camera or any portale geometry.
    for vertex in panel.data.vertices:
        x,y=vertex.co.x,vertex.co.y-1.3
        r=math.hypot(x,y)
        if r<8.4 and r>0.0001:
            inward=1.52*max(0.,min(1.,(8.4-r)/(8.4-7.0)))
            nr=max(4.9,r-inward)
            f=nr/r;vertex.co.x*=f;vertex.co.y=1.3+y*f
    changed["vault_panels"].append(panel.name)

rafters=sorted((o for o in scene.objects if o.name.startswith(
    "ARCH04 • discrete roof rafter")),key=lambda o:o.name)
if len(rafters)<12:raise RuntimeError("Missing real roof structure")
for o in rafters:
    o.hide_render=True
    changed["roof_structures_hidden"].append(o.name)
for o in scene.objects:
    if o.name.startswith(("ARCH04B • perimeter rib distribution ring",
                          "ARCH04B • oculus inner glazing return")):
        apply(o,metal)
        o.hide_render=True
        changed["roof_structures_hidden"].append(o.name)

# Sky can be bright while the surrounding vault remains dark, preserving
# the original physically authored procedural cloud texture.
sky_material=sky.active_material
if not sky_material or not sky_material.use_nodes:
    raise RuntimeError("R5 packed procedurally authored sky shader missing")
sky_texture=next((node for node in sky_material.node_tree.nodes
                  if node.bl_idname=="ShaderNodeTexImage" and node.image),None)
if not sky_texture or not sky_texture.image.packed_file:
    raise RuntimeError("Canonical source sky pixels not packed in R5")
sky_emit=bpy.data.materials.new("ATLAS R6A • luminous source sky with original clouds")
sky_emit.use_nodes=True
nn=sky_emit.node_tree.nodes;nn.clear()
output=nn.new("ShaderNodeOutputMaterial")
tex=nn.new("ShaderNodeTexImage");tex.image=sky_texture.image
bright=nn.new("ShaderNodeEmission")
bright.inputs["Strength"].default_value=2.5
sky_emit.node_tree.links.new(tex.outputs["Color"],bright.inputs["Color"])
sky_emit.node_tree.links.new(bright.outputs[0],output.inputs["Surface"])
apply(sky,sky_emit)
old_radius=max(math.hypot(v.co.x,v.co.y-1.3) for v in sky.data.vertices)
factor=.79
for v in sky.data.vertices:
    v.co.x*=factor
    v.co.y=1.3+(v.co.y-1.3)*factor
new_radius=max(math.hypot(v.co.x,v.co.y-1.3) for v in sky.data.vertices)
if not 5.1<new_radius<5.8:raise RuntimeError("Sky aperture shrink out of range")

# The ring is bronze but only the very fine luminous accent should remain.
for o in scene.objects:
    if o.name.startswith("ARCH04 • monumental oculus corona"):
        apply(o,metal)
        for v in o.data.vertices:
            v.co.x*=factor;v.co.y=1.3+(v.co.y-1.3)*factor
        changed["corona"].append(o.name)
if not changed["corona"]:raise RuntimeError("Oculus metal crown missing")

# Only four of the original 12 genuine radial mullions remain against bright
# sky. They are matte dark; do not make them thicker or add external steel.
mullions=sorted((o for o in scene.objects if o.name.startswith(
    "OCULUS ARCH04 • delicate radial mullion")),key=lambda o:o.name)
if len(mullions)!=12:raise RuntimeError("Expected precisely 12 authored sky mullions")
for idx,o in enumerate(mullions):
    if idx%3:
        o.hide_render=True
        changed["roof_structures_hidden"].append(o.name)
    else:
        apply(o,metal)
        for v in o.data.vertices:
            v.co.x*=factor;v.co.y=1.3+(v.co.y-1.3)*factor
        changed["subdued_mullions"].append(o.name)

# One soft cool skylight; no new theatrical laser beams.
source_light=bpy.data.objects.get("PROOF • broad cool skylight")
if source_light and source_light.type=="LIGHT":
    source_light.data.energy*=1.12
fog=bpy.data.materials.get("PROOF • participating atmospheric shaft")
if fog and fog.use_nodes:
    volume=next((node for node in fog.node_tree.nodes
                 if node.bl_idname=="ShaderNodeVolumePrincipled"),None)
    if volume:volume.inputs["Density"].default_value=.009

assert before==portals(), "Portal roots changed"
assert list(hero.location)==camera_before["location"]
assert list(hero.rotation_euler)==camera_before["rotation"]
assert hero.data.lens==camera_before["lens"]
if bpy.data.objects.get("OCULUS ARCH04 • visible open sky") is not sky:
    raise RuntimeError("Sky image replaced rather than improved")
bpy.context.view_layer.update()
bpy.ops.file.pack_all()
blend=OUT/"atlas-r6a-sky-vault.blend"
scene.camera=hero
bpy.ops.wm.save_as_mainfile(filepath=str(blend))
receipt={"schema":"atlas.art-dir02.r6a-sky-vault/v1",
         "state":"CANDIDATE_TECHNICALLY_VERIFIED__ART_REVIEW_REQUIRED",
         "base_r5_sha256":sha(source),"blend_sha256":sha(blend),
         "camera_unchanged":camera_before,"portal_transforms_unchanged":before,
         "sky_radius_before_bu":old_radius,"sky_radius_after_bu":new_radius,
         "original_cloud_texture_packed":True,"changed_objects":changed,
         "no_publication":True,"human_approved":False,"renders":{}}
# Hero unchanged in camera, resolution and exposure; second view directly
# documents skylight structure and sky appearance.
detail=bpy.data.objects.new("CAM_ATLAS_R6A_SKYLIGHT_DETAIL",
    bpy.data.cameras.new("CAM_ATLAS_R6A_SKYLIGHT_DETAIL"))
scene.collection.objects.link(detail)
detail.location=(0,-10.4,5.5)
detail.rotation_euler=(Vector((0,1.3,8.3))-detail.location).to_track_quat("-Z","Y").to_euler()
detail.data.lens=29
scene.render.engine="CYCLES";scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.context.view_layer.cycles.use_denoising=True
for label,cam,w,h,samples in (
    ("hero",hero,1152,648,28),("oculus",detail,832,468,20)):
    scene.camera=cam;scene.render.resolution_x=w;scene.render.resolution_y=h
    scene.cycles.samples=samples
    image=OUT/("atlas-r6a-"+label+".png")
    scene.render.filepath=str(image)
    bpy.ops.render.render(write_still=True)
    if not image.is_file() or image.stat().st_size<10000:
        raise RuntimeError("No real Cycles render "+label)
    receipt["renders"][label]={"file":image.name,"bytes":image.stat().st_size,
                                "sha256":sha(image),"size":[w,h]}
(OUT/"atlas-r6a-receipt.json").write_text(json.dumps(receipt,indent=2,ensure_ascii=False))
print("ATLAS_R6A_COMPLETE",json.dumps({"roof_panels":len(panels),
 "rafters_hidden":len(rafters),"sky_radius":new_radius,
 "visible_sky_mullions":len(changed["subdued_mullions"])}))
