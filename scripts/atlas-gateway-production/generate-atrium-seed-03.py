#!/usr/bin/env python3
"""ATLAS SEED-03: compositore incrementale della copertura con ingresso aperto.

Genera un vero GLB tramite il generatore SEED-01 versionato nello stesso repository.
Non sostituisce il PNG ART-DIR-02 e non attesta approvazione artistica.

Uso: python generate-atrium-seed-03.py BLUEPRINT03.json OUT_DIR
"""
import hashlib
import importlib.util
import json
import math
import sys
from pathlib import Path


def baseline():
    script = Path(__file__).resolve().parent / "generate-atrium-seed.py"
    if not script.is_file():
        raise FileNotFoundError(f"Generatore base non presente: {script}")
    spec = importlib.util.spec_from_file_location("atlas_atrium_seed_base", script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def patch_geometry(m):
    base_ring = m.ring

    def back_gallery(scene, name, radius, thickness, z, depth, color,
                     a0=-math.pi, a1=math.pi):
        if name.startswith("GALLERY_"):
            a0, a1 = -math.pi * 0.72, math.pi * 0.72
        return base_ring(scene, name, radius, thickness, z, depth, color, a0, a1)

    def back_roof(scene, name, r_inner, r_outer, z_inner, z_outer,
                  thickness, color, segments=160, steps=24,
                  a0=-math.pi / 8, a1=9 * math.pi / 8):
        """Settor posteriore a doppia superficie con frontale realmente aperto."""
        vertices = []
        for j in range(steps + 1):
            t = j / steps
            r = r_inner + (r_outer - r_inner) * t
            z = z_inner + (z_outer - z_inner) * (math.sin(t * math.pi / 2) ** 0.75)
            for i in range(segments + 1):
                a = a0 + (a1 - a0) * i / segments
                vertices.extend([[r * math.cos(a), r * math.sin(a), z],
                                 [r * math.cos(a), r * math.sin(a), z - thickness]])
        faces = []
        n = segments + 1
        for j in range(steps):
            for i in range(segments):
                k = 2 * (j * n + i)
                kn = k + 2
                k2 = 2 * ((j + 1) * n + i)
                k2n = k2 + 2
                faces.extend([[k, k2, kn], [kn, k2, k2n],
                              [k + 1, kn + 1, k2 + 1], [kn + 1, k2n + 1, k2 + 1]])
        for i in range(segments):
            ni = i + 1
            for j in (0, steps):
                k = 2 * (j * n + i)
                nn = 2 * (j * n + ni)
                faces.extend([[k, nn, k + 1], [nn, nn + 1, k + 1]])
        for j in range(steps):
            for i in (0, segments):
                k = 2 * (j * n + i)
                k2 = 2 * ((j + 1) * n + i)
                faces.extend([[k, k + 1, k2], [k + 1, k2 + 1, k2]])
        mesh = m.trimesh.Trimesh(vertices=vertices, faces=faces, process=True)
        return m.save_obj(scene, mesh, "ROOF_VAULT_REAR_SECTOR", color)

    m.ring = back_gallery
    m.roof_annulus = back_roof


def main():
    if len(sys.argv) != 3:
        raise SystemExit("Uso: python generate-atrium-seed-03.py BLUEPRINT03.json OUT_DIR")
    blueprint, output = Path(sys.argv[1]).resolve(), Path(sys.argv[2]).resolve()
    data = json.loads(blueprint.read_text(encoding="utf-8"))
    assert data["id"] == "ATLAS-ATRIUM-BLUEPRINT-03-EXPERIMENTAL"
    assert data["roof_gallery_design"]["mode"] == "rear_arcs_open_front_entry"
    assert [p["name"] for p in data["portals"]] == [
        "Curricolo", "Esplora", "Percorsi", "Esperienze"
    ]
    m = baseline()
    patch_geometry(m)
    evidence, scene = m.build(data, blueprint, output)
    old = output / "ATLAS-ATRIUM-3D-SEED-01.glb"
    glb = output / "ATLAS-ATRIUM-3D-SEED-03.glb"
    old.rename(glb)
    evidence["artifact"] = glb.name
    evidence["schema"] = "atlas.atrium.3d.seed-evidence/v3"
    evidence["created_from"] = blueprint.name
    evidence["design_rule"] = "REAR_SECTOR_ROOF_OPEN_ENTRY_NON_360_ENCLOSURE"
    evidence["structural_checks"]["front_arrival_opening"] = True
    evidence["structural_checks"]["rear_sector_roof_real_mesh"] = True
    evidence["caution"] = (
        "True 3D GLB with rear-sector architectural open entrance. "
        "No ART-DIR-02 approval, no Blender/Cycles qualification."
    )
    evidence["sha256"] = hashlib.sha256(glb.read_bytes()).hexdigest()
    (output / "ATLAS-ATRIUM-3D-SEED-03-evidence.json").write_text(
        json.dumps(evidence, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (output / "ATLAS-ATRIUM-3D-SEED-01-evidence.json").unlink(missing_ok=True)
    assert evidence["roundtrip"]["valid"]
    assert evidence["triangles"] == 62652
    print("SEED-03", glb, evidence["sha256"])


if __name__ == "__main__":
    main()
