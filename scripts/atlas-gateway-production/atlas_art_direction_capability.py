#!/usr/bin/env python3
"""CAP-ART-DIRECTION-01 Atlas adapter: validate and apply a locked art specification.

Runs in two modes:
  python3 atlas_art_direction_capability.py --spec X --validate-only
  blender -b MASTER.blend --python atlas_art_direction_capability.py -- --spec X --source-receipt R --out DIR

Only a derived .blend, local PNGs and evidence receipt may be written.
This adapter never exports a public GLB, changes a repository file, or deploys.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import struct
import sys
from pathlib import Path


SCHEMA = "visual.art-direction.spec/v1"
SOURCE_SHA = "35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30"
PORTALS = ("Curricolo", "Esplora", "Percorsi", "Esperienze")


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def validate_spec(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    required = ("schemaVersion", "capabilityId", "specId", "product", "source",
                "safety", "materials", "lighting", "sky", "cameras", "render", "acceptance")
    if not isinstance(data, dict) or any(k not in data for k in required):
        raise ValueError("ARTSPEC_MISSING_REQUIRED_FIELDS")
    if data["schemaVersion"] != SCHEMA or data["capabilityId"] != "visual.art-direction.propose":
        raise ValueError("ARTSPEC_SCHEMA_OR_CAPABILITY")
    if data["product"] != "ATLAS" or not isinstance(data["specId"], str) or len(data["specId"]) < 8:
        raise ValueError("ARTSPEC_PRODUCT_OR_ID")
    source, safety = data["source"], data["safety"]
    if (source.get("sha256") != SOURCE_SHA
            or source.get("artifactName") != "atlas-p3a-four-level-circular-oculus-editable.blend"
            or source.get("immutable") is not True):
        raise ValueError("ARTSPEC_UNQUALIFIED_SOURCE")
    if safety != {"derivativeOnly": True, "studentData": False, "publishAuthorized": False,
                  "mergeAuthorized": False, "paidServices": False}:
        raise ValueError("ARTSPEC_AUTHORITY_BOUNDARY")
    groups = data["materials"]
    if not isinstance(groups, list) or len(groups) < 5:
        raise ValueError("ARTSPEC_MATERIAL_COUNT")
    identifiers = set()
    for group in groups:
        if not all(k in group for k in ("id", "selectors", "baseColor", "metallic",
                                       "roughness", "alpha", "transmission", "purpose")):
            raise ValueError("ARTSPEC_MATERIAL_FIELDS")
        if (not isinstance(group["id"], str) or group["id"] in identifiers
                or not group["selectors"] or not all(isinstance(x, str) and len(x) > 2
                    for x in group["selectors"])):
            raise ValueError("ARTSPEC_MATERIAL_SELECTORS")
        identifiers.add(group["id"])
        color = group["baseColor"]
        if (not isinstance(color, list) or len(color) != 3
                or any(not isinstance(v, (int, float)) or isinstance(v, bool)
                       or not math.isfinite(v) or not 0 <= v <= 1 for v in color)):
            raise ValueError("ARTSPEC_COLOR_RANGE")
        for k in ("metallic", "roughness", "alpha", "transmission"):
            v = group[k]
            if not isinstance(v, (int, float)) or isinstance(v, bool) or not math.isfinite(v) or not 0 <= v <= 1:
                raise ValueError("ARTSPEC_PBR_RANGE_" + k)
    lighting = data["lighting"]
    if lighting.get("mode") != "blender_area_three_point":
        raise ValueError("ARTSPEC_LIGHTING_MODE")
    for k in ("keyPower", "fillPower", "warmPower"):
        v = lighting.get(k)
        if not isinstance(v, (int, float)) or not math.isfinite(v) or not 0 <= v <= 5000:
            raise ValueError("ARTSPEC_LIGHT_POWER_" + k)
    for k in ("keySize", "fillSize", "warmSize"):
        v = lighting.get(k)
        if not isinstance(v, (int, float)) or not math.isfinite(v) or not 0.1 <= v <= 40:
            raise ValueError("ARTSPEC_LIGHT_SIZE_" + k)
    sky = data["sky"]
    if sky.get("model") != "NISHITA" or not -2 <= sky.get("sunElevationDegrees", -99) <= 90:
        raise ValueError("ARTSPEC_SKY")
    if not 1 <= sky.get("turbidity", -1) <= 10 or not 0 <= sky.get("worldStrength", -1) <= 3:
        raise ValueError("ARTSPEC_ATMOSPHERE_RANGE")
    cams = data["cameras"]
    if cams.get("masterName") != "ATLAS P3A • CAMERA HERO":
        raise ValueError("ARTSPEC_CANONICAL_CAMERA")
    for label in ("desktop", "phone"):
        camera = cams[label]
        for k in ("width", "height"):
            if not isinstance(camera.get(k), int) or not 240 <= camera[k] <= 4096:
                raise ValueError("ARTSPEC_CAMERA_RESOLUTION")
        if not 0.65 <= camera.get("lensMultiplier", -1) <= 1.2:
            raise ValueError("ARTSPEC_CAMERA_LENS")
        if not -0.25 <= camera.get("shiftY", 999) <= 0.25:
            raise ValueError("ARTSPEC_CAMERA_SHIFT")
    render = data["render"]
    if render.get("engine") != "CYCLES" or not isinstance(render.get("samples"), int) or not 4 <= render["samples"] <= 128:
        raise ValueError("ARTSPEC_RENDER_ENGINE")
    a = data["acceptance"]
    if a != {"fourPortals": 4, "galleryLevels": 4,
             "oculusRadiusBU": 6.25, "humanArtApproval": False}:
        raise ValueError("ARTSPEC_HUMAN_GATE")
    return data


def validate_parent_receipt(path: Path, spec: dict) -> dict:
    receipt = json.loads(path.read_text(encoding="utf-8"))
    if (receipt.get("schema") != "atlas.gateway.arch-art-p3a-cycles-result/v1"
            or receipt.get("files", {}).get("blend", {}).get("sha256") != spec["source"]["sha256"]
            or receipt.get("gallery_levels_ground_included") != 4
            or receipt.get("four_orig_portals_verified") != 4
            or receipt.get("roof", {}).get("radius_bu") != 6.25
            or receipt.get("roof", {}).get("nonmanifold_edges") != 0
            or receipt.get("art_final_approved") is not False
            or receipt.get("student_publication_approved") is not False
            or receipt.get("no_merge") is not True or receipt.get("no_deploy") is not True):
        raise ValueError("ARTSPEC_SOURCE_RECEIPT_MISMATCH")
    return receipt


def apply_spec(spec: dict, receipt_path: Path, out_dir: Path, spec_path: Path):
    import bpy
    from mathutils import Vector

    src = Path(bpy.data.filepath).resolve()
    if src.name != spec["source"]["artifactName"] or sha256(src) != spec["source"]["sha256"]:
        raise RuntimeError("ARTSPEC_SOURCE_BINARY_MISMATCH")
    validate_parent_receipt(receipt_path, spec)
    out_dir = out_dir.resolve()
    if out_dir == src.parent or src in out_dir.parents:
        raise RuntimeError("ARTSPEC_UNSAFE_OUTPUT_DIRECTORY")
    out_dir.mkdir(parents=True, exist_ok=True)
    for output in ("atlas-p3b-r3-art-direction.blend",
                   "atlas-p3b-r3-desktop-cycles.png", "atlas-p3b-r3-phone-cycles.png"):
        if (out_dir / output).exists():
            raise RuntimeError("ARTSPEC_OUTPUT_EXISTS_NO_OVERWRITE: " + output)

    scene = bpy.context.scene
    original_src_digest = sha256(src)

    def geometry_digest():
        """Stable mesh topology and vertex coordinates; materials are excluded."""
        h = hashlib.sha256()
        for obj in sorted((o for o in bpy.data.objects if o.type == "MESH"), key=lambda o: o.name):
            h.update(obj.name.encode("utf-8"))
            h.update(struct.pack("<II", len(obj.data.vertices), len(obj.data.polygons)))
            for vert in obj.data.vertices:
                h.update(struct.pack("<ddd", *tuple(vert.co)))
            for poly in obj.data.polygons:
                h.update(struct.pack("<I", len(poly.vertices)))
                for idx in poly.vertices:
                    h.update(struct.pack("<I", idx))
        return h.hexdigest()

    geometry_before = geometry_digest()
    protected = {
        "ATLAS P3A • padiglione unico oculo circolare",
        "ATLAS P3A • cielo fisico circolare",
        "ATLAS P3A • third gallery deck",
    }
    for name in protected:
        if bpy.data.objects.get(name) is None:
            raise RuntimeError("ARTSPEC_MISSING_PROTECTED_MESH: " + name)
    camera = bpy.data.objects.get(spec["cameras"]["masterName"])
    if camera is None or camera.type != "CAMERA":
        raise RuntimeError("ARTSPEC_MISSING_MASTER_CAMERA")
    for name in PORTALS:
        if (bpy.data.objects.get("Portale • " + name) is None or
                bpy.data.objects.get(name + " • vetro cobalto") is None):
            raise RuntimeError("ARTSPEC_MISSING_PORTAL_" + name)

    matched = {}
    for group in spec["materials"]:
        mat = bpy.data.materials.new("ATLAS ARTSPEC R3 • " + group["id"])
        mat.use_nodes = True
        bs = mat.node_tree.nodes.get("Principled BSDF")
        if bs is None:
            raise RuntimeError("ARTSPEC_PRINCIPLED_NODE_MISSING")
        bs.inputs["Base Color"].default_value = (*group["baseColor"], 1.0)
        for input_name, spec_key in (("Metallic", "metallic"), ("Roughness", "roughness"),
                                      ("Alpha", "alpha")):
            bs.inputs[input_name].default_value = group[spec_key]
        transmit = bs.inputs.get("Transmission Weight") or bs.inputs.get("Transmission")
        if transmit:
            transmit.default_value = group["transmission"]
        if group["alpha"] < 1:
            if hasattr(mat, "surface_render_method"):
                mat.surface_render_method = "BLENDED"
            elif hasattr(mat, "blend_method"):
                mat.blend_method = "BLEND"
        names = []
        for obj in scene.objects:
            if obj.type != "MESH" or obj.hide_render:
                continue
            if any(selector.casefold() in obj.name.casefold() for selector in group["selectors"]):
                # No geometry or transform changes. A copy avoids touching shared datablocks.
                if any(obj.name in previous for previous in matched.values()):
                    raise RuntimeError("ARTSPEC_MATERIAL_SELECTOR_OVERLAP_" + obj.name)
                obj.data = obj.data.copy()
                obj.data.materials.clear()
                obj.data.materials.append(mat)
                names.append(obj.name)
        if not names:
            raise RuntimeError("ARTSPEC_MATERIAL_SELECTOR_EMPTY_" + group["id"])
        matched[group["id"]] = names
    if len(matched["portal-clear-blue-glass"]) != 4:
        raise RuntimeError("ARTSPEC_PORTAL_GLASS_COUNT")

    # Physically modelled sky in Blender; the source skylight disc is retained
    # geometrically, but made invisible only in this render derivative so that
    # Cycles can see the Nishita sky. glTF texture transfer is a later gate.
    sky_disc = bpy.data.objects["ATLAS P3A • cielo fisico circolare"]
    sky_disc.hide_render = True
    world = scene.world.copy() if scene.world else bpy.data.worlds.new("ATLAS ARTSPEC R3 World")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes.clear()
    nodes, links = world.node_tree.nodes, world.node_tree.links
    sky_node = nodes.new("ShaderNodeTexSky")
    sky_node.sky_type = "NISHITA"
    sky_node.sun_elevation = math.radians(spec["sky"]["sunElevationDegrees"])
    sky_node.turbidity = spec["sky"]["turbidity"]
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = spec["sky"]["worldStrength"]
    output = nodes.new("ShaderNodeOutputWorld")
    links.new(sky_node.outputs["Color"], bg.inputs["Color"])
    links.new(bg.outputs["Background"], output.inputs["Surface"])

    # Defined studio rig relative to the approved camera (not random placement).
    source_rot = camera.matrix_world.to_quaternion()
    anchor = camera.matrix_world.translation
    lamps = [
        ("key", (-5.0, 6.0, -4.0), spec["lighting"]["keyPower"], spec["lighting"]["keySize"],
         (1.0, 0.87, 0.73)),
        ("fill", (4.0, 4.0, -3.0), spec["lighting"]["fillPower"], spec["lighting"]["fillSize"],
         (0.74, 0.86, 1.0)),
        ("warm", (0.0, 2.0, -6.0), spec["lighting"]["warmPower"], spec["lighting"]["warmSize"],
         (1.0, 0.65, 0.40)),
    ]
    light_receipt = []
    target = Vector((0, 0, 3.0))
    for label, local_pos, energy, size, color in lamps:
        lamp_data = bpy.data.lights.new("ARTSPEC R3 " + label, type="AREA")
        lamp_data.energy = energy
        lamp_data.shape = "DISK"
        lamp_data.size = size
        lamp_data.color = color
        obj = bpy.data.objects.new("ATLAS ARTSPEC R3 • " + label, lamp_data)
        scene.collection.objects.link(obj)
        obj.location = anchor + source_rot @ Vector(local_pos)
        obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()
        light_receipt.append({"id": label, "energy": energy, "size": size,
                              "position": [round(v, 5) for v in obj.location]})

    phone_cam = camera.copy()
    phone_cam.data = camera.data.copy()
    phone_cam.name = "ATLAS ARTSPEC R3 • CAMERA PHONE"
    scene.collection.objects.link(phone_cam)
    phone_cam.data.lens *= spec["cameras"]["phone"]["lensMultiplier"]
    phone_cam.data.shift_y = spec["cameras"]["phone"]["shiftY"]

    geometry_after = geometry_digest()
    if geometry_before != geometry_after:
        raise RuntimeError("ARTSPEC_GEOMETRY_MODIFIED")
    if sha256(src) != original_src_digest:
        raise RuntimeError("ARTSPEC_SOURCE_CHANGED")

    scene.render.engine = "CYCLES"
    scene.cycles.samples = spec["render"]["samples"]
    if hasattr(scene.view_layers[0], "cycles") and hasattr(scene.view_layers[0].cycles, "use_denoising"):
        scene.view_layers[0].cycles.use_denoising = spec["render"]["denoise"]
    scene.render.image_settings.file_format = "PNG"
    scene.render.resolution_percentage = 100
    images = []
    for label, active_camera in (("desktop", camera), ("phone", phone_cam)):
        frame = spec["cameras"][label]
        scene.camera = active_camera
        scene.render.resolution_x = frame["width"]
        scene.render.resolution_y = frame["height"]
        scene.render.filepath = str(out_dir / ("atlas-p3b-r3-" + label + "-cycles.png"))
        bpy.ops.render.render(write_still=True)
        result_path = Path(scene.render.filepath)
        if not result_path.is_file() or result_path.stat().st_size < 3000:
            raise RuntimeError("ARTSPEC_RENDER_ABSENT_" + label)
        images.append({"view": label, "camera": active_camera.name,
                       "width": frame["width"], "height": frame["height"],
                       "sha256": sha256(result_path), "bytes": result_path.stat().st_size})

    scene.camera = camera
    derivative = out_dir / "atlas-p3b-r3-art-direction.blend"
    bpy.ops.wm.save_as_mainfile(filepath=str(derivative), compress=True)
    if not derivative.is_file() or sha256(src) != original_src_digest:
        raise RuntimeError("ARTSPEC_SOURCE_PROVENANCE_LOST")

    out_receipt = {
        "schema": "atlas.art-direction.application-receipt/v1",
        "capabilityId": spec["capabilityId"],
        "specId": spec["specId"],
        "specSha256": sha256(spec_path),
        "source": {"name": src.name, "sha256": original_src_digest, "unchanged": True},
        "derivative": {"name": derivative.name, "sha256": sha256(derivative),
                       "bytes": derivative.stat().st_size},
        "geometry": {"sha256Before": geometry_before, "sha256After": geometry_after,
                     "unchanged": True, "galleryLevels": 4, "circularOculusRadiusBU": 6.25},
        "portals": list(PORTALS),
        "materials": [{"id": k, "matchedNames": v, "count": len(v)} for k, v in matched.items()],
        "lighting": light_receipt,
        "sky": {"model": "NISHITA", "sourcePhysicalDiscPresent": True,
                "sourceDiscHiddenInDerivativeRenderOnly": True,
                "webTextureExportQualified": False},
        "renders": images,
        "humanArtApproved": False,
        "webTranslationQualified": False,
        "devicePhysicalQualified": False,
        "mergeApproved": False,
        "publishApproved": False,
        "nextGate": "HUMAN_VISUAL_REVIEW_ON_EXACT_DERIVATIVE",
    }
    (out_dir / "atlas-p3b-r3-art-direction-receipt.json").write_text(
        json.dumps(out_receipt, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("ATLAS_ART_DIRECTION_DERIVATIVE_APPLIED_UNAPPROVED", json.dumps({
        "spec": spec["specId"], "geometryUnchanged": True,
        "materials": {k: len(v) for k, v in matched.items()},
        "renderCount": len(images), "masterSha256": original_src_digest
    }), flush=True)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else sys.argv[1:]
    parser = argparse.ArgumentParser()
    parser.add_argument("--spec", required=True, type=Path)
    parser.add_argument("--source-receipt", type=Path)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--validate-only", action="store_true")
    args = parser.parse_args(argv)
    spec = validate_spec(args.spec)
    if args.validate_only:
        print("ATLAS_ART_DIRECTION_SPEC_VALID", spec["specId"])
        return
    if args.source_receipt is None or args.out is None:
        parser.error("Application requires --source-receipt and --out.")
    apply_spec(spec, args.source_receipt, args.out, args.spec.resolve())


if __name__ == "__main__":
    main()
