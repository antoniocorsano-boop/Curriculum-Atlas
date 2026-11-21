#!/usr/bin/env python3
"""ART-DIR-02: render a professionally authored Blender scene, never fabricate one.

blender --background --factory-startup --threads 2 --python render-master.py \
    -- --master visual-factory/atlas-gateway/source/atlas-foyer-master.blend \
       --out evidence/atlas-art-02/render
"""
import bpy
import sys
import os
import json
import hashlib
from pathlib import Path

args = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def value(flag):
    if flag not in args or args.index(flag)+1>=len(args):
        raise RuntimeError("Missing argument "+flag)
    return args[args.index(flag)+1]
master=Path(value("--master")).resolve()
out=Path(value("--out")).resolve()
out.mkdir(parents=True,exist_ok=True)
if not master.is_file(): raise RuntimeError("Missing authored ART-DIR-02 master "+str(master))
bpy.ops.wm.open_mainfile(filepath=str(master))
scene=bpy.context.scene
cameras={"hero":"CAM_HERO","side":"CAM_SIDE","mobile":"CAM_MOBILE"}
for label,name in cameras.items():
    obj=bpy.data.objects.get(name)
    if obj is None or obj.type!="CAMERA":
        raise RuntimeError("ART_DIR_02_MISSING_CAMERA "+name)
if not any(o.type=="MESH" for o in scene.objects):
    raise RuntimeError("No actual architecture")
missing_external=[]
for img in bpy.data.images:
    if img.source=="FILE" and img.packed_file is None and img.filepath:
        try: exists=os.path.exists(bpy.path.abspath(img.filepath))
        except Exception: exists=False
        if not exists: missing_external.append(img.name)
if missing_external:
    raise RuntimeError("Missing un-packed source textures: "+", ".join(missing_external))
scene.render.engine="CYCLES"
scene.cycles.samples=32
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.film_transparent=False
report={"schema":"atlas.art-dir-02.blender-render/v1",
        "blender":bpy.app.version_string,
        "master_sha256":hashlib.sha256(master.read_bytes()).hexdigest(),
        "cameras":{},"meshes":sum(o.type=="MESH" for o in scene.objects),
        "materials":len(bpy.data.materials),
        "publicRelease":False,"studentAuthorized":False}
for label,name in cameras.items():
    scene.camera=bpy.data.objects[name]
    w,h=(960,540) if label!="mobile" else (390,844)
    scene.render.resolution_x=w
    scene.render.resolution_y=h
    target=out/(label+"-cycles.png")
    scene.render.filepath=str(target)
    bpy.ops.render.render(write_still=True)
    if not target.is_file() or target.stat().st_size<15000:
        raise RuntimeError("ART_DIR_02_RENDER_MISSING "+label)
    report["cameras"][label]={"name":name,"resolution":[w,h],
        "bytes":target.stat().st_size,
        "sha256":hashlib.sha256(target.read_bytes()).hexdigest()}
exported=out/"foyer-authoring.glb"
scene.camera=bpy.data.objects["CAM_HERO"]
bpy.ops.export_scene.gltf(filepath=str(exported),export_format="GLB",
    export_cameras=False,export_lights=False)
if not exported.is_file() or exported.stat().st_size<1024:
    raise RuntimeError("GLB export is missing")
report["glb"]={"bytes":exported.stat().st_size,
    "sha256":hashlib.sha256(exported.read_bytes()).hexdigest()}
(out/"blender-receipt.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
print("ATLAS_ART_DIR_02_RENDERED",json.dumps(report,ensure_ascii=False))
