#!/usr/bin/env python3
"""Validate the ARCH-04 / VIS-01 Blender scene contract without pretending to build art.

Usage (repository root):
    python3 scripts/atlas-gateway-production/validate_blender_execution_spec_01.py
    python3 scripts/atlas-gateway-production/validate_blender_execution_spec_01.py path/to/scene.json
No network, no Blender installation, no repo or publication changes.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
DEFAULT = REPO / "docs/atlas-gateway/ATLAS-BLENDER-EXECUTION-SPEC-01.json"
EXPECTED_PORTALS = {
    "Curricolo": ("Struttura e obiettivi", "outer"),
    "Esplora": ("Relazioni e connessioni", "inner"),
    "Percorsi": ("Itinerari formativi", "inner"),
    "Esperienze": ("Attività e mondi", "outer"),
}
SCHEMA = "atlas.gateway.blender.execution-contract/v1"
CANON_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"


def insist(test: bool, message: str) -> None:
    if not test:
        raise ValueError(message)


def unique_ids(records: list[dict], category: str) -> set[str]:
    ids = [x.get("id") for x in records]
    insist(all(isinstance(x, str) and x for x in ids), f"{category}: invalid ID")
    insist(len(ids) == len(set(ids)), f"{category}: duplicate ID")
    return set(ids)


def check_range(values: object, name: str) -> None:
    insist(isinstance(values, list) and len(values) == 2, f"{name}: expected [min,max]")
    a, b = values
    insist(all(isinstance(x, (int, float)) for x in (a, b)), f"{name}: nonnumeric")
    insist(0 <= a <= b <= 1, f"{name}: expected normalized 0..1")


def validate(path: Path) -> dict:
    doc = json.loads(path.read_text(encoding="utf-8"))
    insist(doc["schema"] == SCHEMA, "schema mismatch")
    insist("NOT_RENDERED" in doc["state"], "do not label this spec as rendered")
    insist(doc["reference"]["sha256"] == CANON_SHA, "canonical sha drift")
    insist(doc["reference"]["px"] == [1536, 864], "canonical dimensions drift")
    insist(doc["export_policy"]["release"] is False, "release must be disabled")
    materials, lights, objects, portals, cameras = (
        doc["materials"], doc["lights"], doc["objects"], doc["portals"], doc["cameras"]
    )
    insist(len(materials) >= 12, "insufficient material library")
    insist(len(lights) >= 10, "insufficient light roles")
    insist(len(objects) >= 18, "insufficient object modules")
    insist(len(cameras) == 5, "five camera views required")
    insist(len(portals) == 4, "exactly four portals required")
    mids = unique_ids(materials, "materials")
    lids = unique_ids(lights, "lights")
    oids = unique_ids(objects, "objects")
    unique_ids(portals, "portals")
    unique_ids(cameras, "cameras")
    for m in materials:
        insist(bool(re.fullmatch(r"#[0-9A-Fa-f]{6}", m["base_hex"])), f"invalid color {m['id']}")
        check_range(m["metallic"], f"metallic {m['id']}")
        check_range(m["roughness"], f"roughness {m['id']}")
        if "transmission_candidate" in m:
            check_range(m["transmission_candidate"], f"transmission {m['id']}")
    for obj in objects:
        insist(obj["material_ids"] and set(obj["material_ids"]) <= mids, f"material reference {obj['id']}")
        insist(set(obj["light_ids"]) <= lids, f"light reference {obj['id']}")
        insist(obj["collection"].startswith("COL_"), f"collection naming {obj['id']}")
        insist(obj["status"] == "SPECIFIED_NOT_BUILT_OR_APPROVED", f"unapproved scope {obj['id']}")
    for p in portals:
        insist(p["name"] in EXPECTED_PORTALS, f"unexpected portal {p['name']}")
        subtitle, group = EXPECTED_PORTALS[p["name"]]
        insist(p["subtitle"] == subtitle and p["position_pair"] == group, f"portal text/pair drift {p['name']}")
        insist(p["graphics_layers"] == ["icon", "title", "subtitle", "illustration"], f"missing graphics {p['name']}")
        insist(len(p["source_bbox_px"]) == 4, f"missing landmarks {p['name']}")
        x0, y0, x1, y1 = p["source_bbox_px"]
        insist(0 <= x0 < x1 <= 1536 and 0 <= y0 < y1 <= 864, f"bad bounds {p['name']}")
    insist("OBJ_PORTAL_FRAMES_4" in oids and "OBJ_PORTAL_GRAPHICS_4" in oids, "portal structure missing")
    insist("OBJ_OCULUS_RING" in oids and "OBJ_PODIUM_RINGS" in oids, "light rings missing")
    return {
        "result": "VALID_SPECIFICATION__NOT_RENDERED__NOT_APPROVED",
        "objects": len(objects),
        "materials": len(materials),
        "light_roles": len(lights),
        "portals": len(portals),
        "cameras": len(cameras),
        "canonical_sha256": CANON_SHA,
    }


if __name__ == "__main__":
    input_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    print(json.dumps(validate(input_path), indent=2, ensure_ascii=False))
