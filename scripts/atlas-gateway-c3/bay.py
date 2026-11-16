"""Atlas C3.1: deterministic library bay study. Run with Blender --background --python-exit-code 1 --python this.py -- OUT."""
import bpy, sys, math, random, json, hashlib
from pathlib import Path
from mathutils import Vector
out = Path(sys.argv[sys.argv.index("--")+1]).resolve()
out.mkdir(parents=True, exist_ok=True)
rng = random.Random(118)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def mat(name, rgb, rough=.5, metallic=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*rgb,1); m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*rgb,1)
    p.inputs["Roughness"].default_value=rough
    p.inputs["Metallic"].default_value=metallic
    return m

stone=mat("Warm limestone",(.61,.49,.34),.72)
wood=mat("Walnut",(.17,.075,.033),.42)
dark=mat("Recessed walnut",(.075,.034,.018),.74)
brass=mat("Brushed brass",(.55,.32,.12),.33,.75)
paper=mat("Paper",(.68,.57,.42),.84)
palette=[mat("Book "+str(i),c,.68) for i,c in enumerate([(.16,.035,.026),(.035,.10,.09),(.07,.10,.17),(.34,.20,.07),(.28,.24,.16),(.11,.067,.04)])]
meshes=[]
def box(name, loc, size, material, bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new("Soft edges","BEVEL");mod.width=bevel;mod.segments=2
        normal=o.modifiers.new("Weighted normals","WEIGHTED_NORMAL")
    meshes.append(o);return o

# Camera faces the recess from negative Y. All book fronts remain behind the canopy lip.
box("Back stone", (0,.47,1.8),(3.7,.28,3.6),stone)
box("Recess", (0,.28,1.74),(3.0,.14,3.12),dark)
for x in (-1.68,1.68):
    box("Stone pier",(x,-.02,1.80),(.32,.66,3.6),stone,.035)
    box("Pier base",(x,-.03,.13),(.44,.78,.26),stone,.025)
    box("Capital",(x,-.03,3.42),(.46,.80,.18),stone,.025)
for x in (-1.43,1.43):
    box("Wood jamb",(x,.06,1.72),(.14,.55,3.1),wood)
box("Opaque canopy",(0,-.19,3.42),(3.20,1.20,.30),stone,.025)
box("Canopy underside",(0,-.20,3.245),(3.04,1.12,.055),wood)
box("Cornice brass",(0,-.79,3.40),(3.20,.018,.025),brass,.004)
for row in range(4):
    z=.26+row*.74
    box("Shelf "+str(row),(0,.035,z),(2.83,.57,.10),wood)
    box("Brass shelf edge",(0,-.26,z),(2.82,.015,.025),brass,.004)
    x=-1.34
    while x<1.24:
        w=rng.uniform(.075,.17);h=rng.uniform(.38,.58);depth=rng.uniform(.18,.28)
        if x+w>1.35: break
        book=box("Book spine",(x+w/2,-.10+depth/2,z+.05+h/2),(w-.006,depth,h),rng.choice(palette),.006)
        box("Page block",(x+w/2,-.088+depth/2,z+.05+h/2),(w*.70,depth*.83,h*.93),paper,.002)
        x+=w+rng.uniform(.009,.022)
box("Plinth",(0,-.06,.08),(3.08,.65,.16),wood,.025)

# Export only the modular architectural asset, not the studio camera/lights/floor.
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.export_scene.gltf(filepath=str(out/"campata.glb"),export_format="GLB",use_selection=True,export_apply=True)
box("Studio floor",(0,-2,-.09),(12,9,.16),stone,.01)
def area(name, loc, target, power, color, size, shape="DISK"):
    data=bpy.data.lights.new(name,"AREA");data.energy=power;data.color=color;data.shape=shape;data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
    return o
area("Diffuse daylight", (1,-3.8,5.2),(0,0,1.4),420,(.90,.95,1),4)
for row in range(4):
    a=area("Concealed warm shelf light "+str(row),(0,-.15,.87+row*.74),(0,.14,.38+row*.74),9,(1,.74,.45),2.55,"RECTANGLE");a.data.size_y=.10
world=bpy.data.worlds.new("Diffuse environment");scene.world=world;world.use_nodes=True
world.node_tree.nodes["Background"].inputs[0].default_value=(.22,.26,.32,1)
world.node_tree.nodes["Background"].inputs[1].default_value=.35
bpy.ops.object.camera_add(location=(4.4,-8.2,2.65))
camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.72))-camera.location).to_track_quat("-Z","Y").to_euler();camera.data.lens=48;scene.camera=camera
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=720;scene.render.resolution_y=840;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG";scene.render.filepath=str(out/"campata.png")
bpy.ops.wm.save_as_mainfile(filepath=str(out/"campata.blend"))
bpy.ops.render.render(write_still=True)
receipt={"blender":bpy.app.version_string,"seed":118,"assetObjects":len(meshes)-1,"lightBake":False,"source":"procedural","studentAuthorized":False,"files":{}}
for name in ("campata.glb","campata.blend","campata.png"):
    p=out/name;receipt["files"][name]={"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
(out/"manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
