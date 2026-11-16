"""C3.2B: bake geometric ambient occlusion on a second UV atlas, not full light."""
import bpy,sys,math,json,hashlib,numpy as np
from pathlib import Path
out=Path(sys.argv[sys.argv.index("--")+1]).resolve();out.mkdir(parents=True,exist_ok=True)
source=out.parent/"atlas-c32"/"campata.blend"
bpy.ops.wm.open_mainfile(filepath=str(source))
scene=bpy.context.scene
objects=[o for o in scene.objects if o.type=="MESH" and o.name.startswith("Bay ")]
assert len(objects)==11,len(objects)
bpy.ops.object.select_all(action="DESELECT")
for o in objects:o.select_set(True)
bpy.context.view_layer.objects.active=objects[0]
bpy.ops.object.join()
obj=bpy.context.object;obj.name="Atlas bay AO"
# Exclude studio floor from bake; it is not in the exported asset.
for o in list(scene.objects):
    if o!=obj and o.type=="MESH":bpy.data.objects.remove(o,do_unlink=True)
uvs=obj.data.uv_layers
assert len(uvs)==1,len(uvs)
uv0=uvs[0].name
second=uvs.new(name="AtlasAO",do_init=False);uvs.active_index=1
bpy.ops.object.mode_set(mode="EDIT");bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.003)
bpy.ops.object.mode_set(mode="OBJECT")
# Raster test: strict triangle interiors at pixel centers, excludes shared boundaries.
size=2048
obj.data.calc_loop_triangles()
coords=np.array([tuple(x.uv) for x in second.data],dtype=np.float64)
assert np.isfinite(coords).all() and coords.min()>=-1e-6 and coords.max()<=1.000001
mask=np.zeros((size,size),dtype=np.uint16)
for tri in obj.data.loop_triangles:
    a,b,c=coords[list(tri.loops)]*size
    x0=max(0,int(np.floor(min(a[0],b[0],c[0]))));x1=min(size,int(np.ceil(max(a[0],b[0],c[0]))))
    y0=max(0,int(np.floor(min(a[1],b[1],c[1]))));y1=min(size,int(np.ceil(max(a[1],b[1],c[1]))))
    if x1<=x0 or y1<=y0:continue
    d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1])
    if abs(d)<1e-10:continue
    x,y=np.meshgrid(np.arange(x0,x1)+.5,np.arange(y0,y1)+.5)
    u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d
    v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d
    mask[y0:y1,x0:x1]+=((u>1e-6)&(v>1e-6)&(u+v<1-1e-6)).astype(np.uint16)
covered=int(np.count_nonzero(mask));overlap=int(np.count_nonzero(mask>1))
assert covered>size*size*.10 and overlap==0,(covered,overlap)
img=bpy.data.images.new("Atlas AO 2048",width=size,height=size,alpha=False,float_buffer=False)
img.colorspace_settings.name="Non-Color";img.generated_color=(1,1,1,1)
for material in obj.data.materials:
    nodes=material.node_tree.nodes
    target=nodes.new("ShaderNodeTexImage");target.name="Atlas AO bake target";target.image=img
    for node in nodes:node.select=False
    target.select=True;nodes.active=target
scene.render.engine="CYCLES";scene.cycles.device="CPU";scene.cycles.samples=24
scene.cycles.use_denoising=False
bpy.ops.object.bake(type="AO",uv_layer=second.name,margin=4,use_clear=True)
pixels=np.empty(size*size*4,dtype=np.float32);img.pixels.foreach_get(pixels)
red=pixels.reshape(size,size,4)[:,:,0][mask>0]
assert float(red.max()-red.min())>.10 and float(red.mean())<.99,(float(red.min()),float(red.max()),float(red.mean()))
img.filepath_raw=str(out/"ao.png");img.file_format="PNG";img.save();img.pack()
# Restore first UV for photographic materials. Export both channels explicitly.
uvs.active_index=0;uvs[0].active_render=True
assert uvs[0].name==uv0
bpy.ops.object.select_all(action="DESELECT");obj.select_set(True);bpy.context.view_layer.objects.active=obj
bpy.ops.export_scene.gltf(filepath=str(out/"geometry.glb"),export_format="GLB",use_selection=True,export_texcoords=True,export_draco_mesh_compression_enable=False)
bpy.ops.wm.save_as_mainfile(filepath=str(out/"campata-ao.blend"))
receipt={"sourceBlendSha256":hashlib.sha256(source.read_bytes()).hexdigest(),"resolution":size,"samples":24,"coveredPixels":covered,"overlapPixels":overlap,"aoMin":float(red.min()),"aoMax":float(red.max()),"aoMean":float(red.mean()),"uv0":uv0,"uv1":second.name,"fullLightBake":False,"studentAuthorized":False}
(out/"bake.json").write_text(json.dumps(receipt,indent=2)+"\n")
print(json.dumps(receipt,indent=2))
