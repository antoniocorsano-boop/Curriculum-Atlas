"""Atlas C3.2A: textured modular bay. Derived from qualified C3.1, separate experiment."""
import bpy, sys, math, random, json, hashlib, numpy
from pathlib import Path
from mathutils import Vector
out = Path(sys.argv[sys.argv.index("--")+1]).resolve()
out.mkdir(parents=True, exist_ok=True)
rng = random.Random(118)
assets = out / "assets"
asset_receipt=json.loads((assets/"manifest.json").read_text())
for item in asset_receipt["files"]:
    assert hashlib.sha256((assets/item["name"]).read_bytes()).hexdigest()==item["sha256"],item["name"]
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
def pbr(material, slug, tint=None, normal_strength=.4):
    tree=material.node_tree; nodes=tree.nodes; links=tree.links
    p=nodes.get("Principled BSDF")
    for key in ("diff","rough","nor_gl"):
        node=nodes.new("ShaderNodeTexImage")
        node.image=bpy.data.images.load(str(assets/(slug+"_"+key+".jpg")),check_existing=True)
        node.image.colorspace_settings.name="sRGB" if key=="diff" else "Non-Color"
        node.image.pack()
        if key=="diff":
            if tint:
                mix=nodes.new("ShaderNodeMixRGB");mix.blend_type="MULTIPLY";mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*tint,1)
                links.new(node.outputs["Color"],mix.inputs[1]);links.new(mix.outputs[0],p.inputs["Base Color"])
            else: links.new(node.outputs["Color"],p.inputs["Base Color"])
        elif key=="rough": links.new(node.outputs["Color"],p.inputs["Roughness"])
        else:
            normal=nodes.new("ShaderNodeNormalMap");normal.inputs["Strength"].default_value=normal_strength
            links.new(node.outputs["Color"],normal.inputs["Color"]);links.new(normal.outputs["Normal"],p.inputs["Normal"])
pbr(stone,"marble_01",normal_strength=.20)
pbr(wood,"walnut_veneer",normal_strength=.35)
# Recess receives the same photographic grain; keep it darker with its own material.
pbr(dark,"walnut_veneer",normal_strength=.35)
meshes=[]
def box(name, loc, size, material, bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
    o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(material)
    # Meter-based UVs per planar face, before joining objects. No overlapping bake claim.
    if material in (stone,wood,dark):
        scale=1.5 if material==stone else 1.8
        uv=o.data.uv_layers.active
        if uv is None: uv=o.data.uv_layers.new(name="UVMap")
        for poly in o.data.polygons:
            axis=max(range(3),key=lambda i:abs(poly.normal[i]))
            axes=((1,2),(0,2),(0,1))[axis]
            for li in poly.loop_indices:
                co=o.data.vertices[o.data.loops[li].vertex_index].co
                uv.data[li].uv=(co[axes[0]]/scale+.5,co[axes[1]]/scale+.5)
    if bevel:
        mod=o.modifiers.new("Soft edges","BEVEL");mod.width=bevel;mod.segments=2
        # Blender 4.0 requires Auto Smooth for weighted normals. Keep bevel-only
        # geometry on versions that no longer expose this mesh property.
        if hasattr(o.data, "use_auto_smooth"):
            o.data.use_auto_smooth=True
            o.data.auto_smooth_angle=math.radians(60)
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

# Reduce independent draw submissions by applying modifiers and joining by material.
original_count=len(meshes)
groups={}
for o in meshes: groups.setdefault(o.data.materials[0].name,[]).append(o)
merged=[]
for name, group in groups.items():
    for o in group:
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True);bpy.context.view_layer.objects.active=o
        for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.ops.object.select_all(action="DESELECT")
    for o in group:o.select_set(True)
    bpy.context.view_layer.objects.active=group[0]
    if len(group)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name="Bay "+name;merged.append(o)
meshes=merged
assert len(meshes)<=12,len(meshes)
# Export only the modular architectural asset, not the studio camera/lights/floor.
bpy.ops.object.select_all(action="DESELECT")
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.export_scene.gltf(filepath=str(out/"campata.glb"),export_format="GLB",use_selection=True,export_apply=True,export_draco_mesh_compression_enable=False)
box("Studio floor",(0,-2,-.09),(12,9,.16),stone,.01)
def area(name, loc, target, power, color, size, shape="DISK"):
    data=bpy.data.lights.new(name,"AREA");data.energy=power;data.color=color;data.shape=shape;data.size=size
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat("-Z","Y").to_euler()
    return o
area("Diffuse daylight", (1,-3.8,5.2),(0,0,1.4),420,(.90,.95,1),4)
for row in range(4):
    a=area("Concealed warm shelf light "+str(row),(0,-.15,.87+row*.74),(0,.14,.38+row*.74),9,(1,.74,.45),2.55,"RECTANGLE");a.data.size_y=.10
world=bpy.data.worlds.new("Diffuse environment");scene.world=world;world.use_nodes=True
env=world.node_tree.nodes.new("ShaderNodeTexEnvironment")
env.image=bpy.data.images.load(str(assets/"kloppenheim_03.hdr"));env.image.pack()
world.node_tree.links.new(env.outputs["Color"],world.node_tree.nodes["Background"].inputs[0])
world.node_tree.nodes["Background"].inputs[1].default_value=.28
bpy.ops.object.camera_add(location=(4.4,-8.2,2.65))
camera=bpy.context.object;camera.rotation_euler=(Vector((0,0,1.72))-camera.location).to_track_quat("-Z","Y").to_euler();camera.data.lens=48;scene.camera=camera
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=24;scene.cycles.use_denoising=True;scene.cycles.denoiser="OPENIMAGEDENOISE"
scene.render.resolution_x=720;scene.render.resolution_y=840;scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG";scene.render.filepath=str(out/"campata.png")
bpy.ops.wm.save_as_mainfile(filepath=str(out/"campata.blend"))
bpy.ops.render.render(write_still=True)
receipt={"blender":bpy.app.version_string,"numpy":numpy.__version__,"seed":118,"assetObjects":len(meshes)-1,"lightBake":False,"denoiser":"OPENIMAGEDENOISE","source":"Poly Haven CC0 + procedural geometry","originalObjects":original_count,"assetManifestSha256":hashlib.sha256((assets/"manifest.json").read_bytes()).hexdigest(),"studentAuthorized":False,"files":{}}
for name in ("campata.glb","campata.blend","campata.png"):
    p=out/name;receipt["files"][name]={"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()}
(out/"manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
