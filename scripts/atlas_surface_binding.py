"""Capture a matched bake/UV/camera package in the same Blender process.

Called only inside the isolated P2C1 experiment, after transfer validation.
Coordinates stay in Blender world space; matrices are row-major OpenGL clip
matrices. No scene edits or saves here.
"""
import hashlib
import json
from pathlib import Path
import bpy
import numpy as np

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def require(ok, why):
    if not ok:
        raise RuntimeError(why)

def matrix(m):
    return [[float(x) for x in row] for row in m]

def capture(out, scene, obj, mesh, uv, transferred, report):
    out = Path(out)
    bpy.context.view_layer.update()
    mesh.calc_loop_triangles()
    camera = scene.camera
    require(camera.data.type == "PERSP", "unsupported camera")
    w, h = scene.render.resolution_x, scene.render.resolution_y
    require(scene.render.resolution_percentage == 100 and not scene.render.use_border,
            "camera resolution/border")
    world = obj.matrix_world.copy()
    positions, texcoords = [], []
    for tri in mesh.loop_triangles:
        for loop in tri.loops:
            positions.append(list(world @ mesh.vertices[mesh.loops[loop].vertex_index].co))
            texcoords.append(list(uv.data[loop].uv))
    p = np.array(positions, dtype="<f4")
    u = np.array(texcoords, dtype="<f4")
    require(len(p) == len(u) == 3 * report["uv"]["triangles"] and len(p) > 0,
            "triangle/corner inventory")
    require(np.isfinite(p).all() and np.isfinite(u).all() and u.min() >= 0 and u.max() <= 1,
            "invalid coordinates")
    view = camera.matrix_world.inverted()
    projection = camera.calc_matrix_camera(
        bpy.context.evaluated_depsgraph_get(), x=w, y=h,
        scale_x=scene.render.pixel_aspect_x, scale_y=scene.render.pixel_aspect_y)
    require(np.isfinite(np.array(matrix(projection))).all(), "camera projection")
    tw, th = transferred.size
    raw = np.empty(tw * th * 4, dtype=np.float32)
    transferred.pixels.foreach_get(raw)
    raw = raw.reshape(th, tw, 4)
    require(np.isfinite(raw).all() and np.all(raw[:,:,3] == 1), "opaque linear transfer")
    tex = out / "binding.rgba32f"
    tex.write_bytes(np.ascontiguousarray(raw, dtype="<f4").tobytes())
    exr = out / "diffuse-linear.exr"
    require(sha(exr) == report["transfer"]["sha256"], "matched EXR hash")
    binding = {
        "schema":"atlas.asc01.surface-binding/v1",
        "revision":report["revision"],"masterSha256":report["masterSha256"],
        "target":report["target"],"uvLayer":uv.name,"triangles":len(p)//3,
        "positions":p.tolist(),"uv":u.tolist(),
        "camera":{"name":camera.name,"world":matrix(camera.matrix_world),
                  "view":matrix(view),"projection":matrix(projection),
                  "width":w,"height":h},
        "texture":{"width":int(tw),"height":int(th),"sha256":sha(tex),
                   "sourceExrSha256":sha(exr),"encoding":"linear Rec.709",
                   "rowOrder":"bottom-up"},
        "scope":"isolated target, no other scene occluders",
        "originalP2C1UvProven":False,
    }
    (out/"surface-binding.json").write_text(json.dumps(binding, indent=2, allow_nan=False)+"\n")
