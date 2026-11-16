"""Fail closed unless the actual bundled exporter AND denoised Cycles render work."""
import bpy, numpy, sys, os, json, struct, tempfile
from pathlib import Path
out=Path(sys.argv[sys.argv.index("--")+1]).resolve()
assert bpy.app.version_string==os.environ["BLENDER_VERSION"], bpy.app.version_string
bpy.ops.wm.read_factory_settings(use_empty=False)
with tempfile.TemporaryDirectory() as d:
    p=Path(d)/"preflight.glb"
    bpy.ops.export_scene.gltf(filepath=str(p),export_format="GLB",export_draco_mesh_compression_enable=False)
    b=p.read_bytes()
    assert struct.unpack_from("<4sII",b)==(b"glTF",2,len(b))
    s=bpy.context.scene
    s.render.engine="CYCLES"
    s.cycles.device="CPU"
    s.cycles.samples=4
    s.cycles.use_denoising=True
    s.cycles.denoiser="OPENIMAGEDENOISE"
    s.render.resolution_x=64
    s.render.resolution_y=64
    s.render.resolution_percentage=100
    s.render.image_settings.file_format="PNG"
    s.render.filepath=str(Path(d)/"preflight.png")
    bpy.ops.render.render(write_still=True)
    image=Path(s.render.filepath).read_bytes()
    assert image.startswith(b"\x89PNG\r\n\x1a\n")
    assert struct.unpack_from(">II",image,16)==(64,64)
    (out/"preflight.json").write_text(json.dumps({"blender":bpy.app.version_string,"numpy":numpy.__version__,"glb":"PASS","cyclesDenoising":"PASS","denoiser":"OPENIMAGEDENOISE"},indent=2)+"\n")
print("GLB and Cycles denoising preflight PASS")
