#!/usr/bin/env python3
"""ARCH-04 architectural design: validate source, geometry and four SVG plans.

This validates the DESIGN DELIVERABLE, not artistic approval, structural safety,
real-world building compliance, browser performance or Blender mesh topology.
"""
from __future__ import annotations
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DESIGN = ROOT / "docs/atlas-gateway/ARCH-04-ARCHITECTURAL-GEOMETRY-PROJECT-01.json"
LANDMARKS = ROOT / "docs/atlas-gateway/ART-DIR-02-CANONICAL-LANDMARKS.json"
SEQUENCE = ROOT / "docs/atlas-gateway/ATLAS-GATEWAY-LOCKED-DELIVERY-SEQUENCE-01.md"
CANONICAL_SHA = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"

def close(a, b, tol=1e-6):
    return abs(a - b) <= tol

def check(cond, message):
    if not cond:
        raise AssertionError(message)

def validate():
    d = json.loads(DESIGN.read_text(encoding="utf-8"))
    ref = json.loads(LANDMARKS.read_text(encoding="utf-8"))
    check(d["schema"] == "atlas.gateway.architectural-geometry-project/v1", "schema")
    check(d["status"].endswith("NOT_CONSTRUCTION_OR_ARTISTIC_APPROVAL"), "nonapproval")
    check(d["canonical"]["sha256"] == CANONICAL_SHA, "canon sha")
    check(ref["source"]["sha256"] == CANONICAL_SHA, "landmark sha")
    check(ref["source"]["width"] == 1536 and ref["source"]["height"] == 864, "source dimensions")
    g=d["geometry"]
    check(g["rotunda"]["floor"]["radius"] > g["oculus"]["roof_inner_r"], "roof aperture vs floor")
    check(g["rotunda"]["floor"]["radius"] >= g["oculus"]["roof_outer_r"], "roof footprint")
    check(g["galleries"]["number_of_bays"] == 14, "gallery bays")
    check(g["galleries"]["number_of_pier_axes"] == 15, "gallery piers")
    check(close(g["galleries"]["angular_pitch_deg"]*14,180), "angular pitch")
    decks=g["galleries"]["decks"]
    check(len(decks) == 2 and decks[0]["z_top"] < decks[1]["z_bottom"], "two real decks")
    for deck in decks:
        check(deck["z_bottom"] < deck["z_top"], "deck thickness")
        check(deck["r_inner"] < deck["r_outer"], "deck radial depth")
        check(deck["glass"]["z"][0] < deck["glass"]["z"][1], "glass height")
    o=g["oculus"]
    check(o["roof_inner_r"] < o["roof_outer_r"], "oculus radius")
    check(o["roof_panels_rear"] == 18 and o["metal_radial_ribs"] == 18, "secondary roof grid")
    check(o["sky_disc_z"] > o["roof_z_inner"], "cielo must clear structural ring")
    check(close(o["roof_z_inner"], 8.44) and close(o["roof_z_outer"], 7.27), "meridian end heights")
    check(o["corona_r"][0] < o["corona_r"][1] and o["corona_z"][0] < o["corona_z"][1], "corona thickness")
    p=g["portals"]
    R=p["arc_radius"]
    cy=p["arc_center_xy"][1]
    instances=p["instances"]
    check(len(instances)==4, "exactly four portals")
    check([x["id"] for x in instances]==["Curricolo","Esplora","Percorsi","Esperienze"],"portal order")
    xyd={}
    for x in instances:
        a,b,z=x["center_bu"]
        check(close(z,0), "portal root altitude")
        check(abs(a*a+(b-cy)**2-R*R)<1e-3, "portal circular locus "+x["id"])
        check(close(x["effective_frame_bu"]["width"],3.792,1e-4), "portal master width")
        check(close(x["effective_frame_bu"]["height"],5.04,1e-4), "portal master height")
        xyd[x["id"]]=(a,b)
    check(close(xyd["Curricolo"][0],-xyd["Esperienze"][0]),"outer mirrored")
    check(close(xyd["Curricolo"][1],xyd["Esperienze"][1]),"outer paired depth")
    check(close(xyd["Esplora"][0],-xyd["Percorsi"][0]),"inner mirrored")
    check(close(xyd["Esplora"][1],xyd["Percorsi"][1]),"inner paired depth")
    pod=g["podium"]
    check(close(pod["top_z"],pod["base_z"]+pod["height"]),"podium height")
    check(len(pod["rings"]) == 3, "three ring profiles")
    check(pod["rings"][0]["ax"] > pod["rings"][1]["ax"] > pod["rings"][2]["ax"],"ring nesting")
    check(g["floor"]["top_z"] < p["instances"][0]["pedestal_local_bu"]["z_center"], "floor support detail pending")
    cam=g["cameras"]
    for name in ("hero","side","mobile_overview","mobile_left","mobile_right"):
        check(name in cam and cam[name]["lens_mm"]>0, "camera "+name)
    drawing_ids=set()
    for sheet in d["drawings"]:
        drawing_ids.add(sheet["id"])
        check(sheet["current_status"]=="DRAWN_VECTOR_EDITABLE__NOT_ART_APPROVED", "drawing status")
        name=ROOT / sheet["file_path"]
        check(name.is_file(), "drawing missing: "+str(name))
        svg=ET.parse(name).getroot()
        check(svg.tag.endswith("svg"), "not an SVG: "+str(name))
        check(svg.get("viewBox"),"no SVG viewBox")
        check(len(list(svg.iter()))>15,"drawing too empty")
    check(drawing_ids=={"PL-01","SE-01","SE-02","PR-01"},"drawing set")
    stages=d["production_sequence"]
    check([x["id"] for x in stages]==["P1","P2","P3","P4","P5"],"stage order")
    check("BLOCKED" in stages[2]["status"] and "BLOCKED" in stages[3]["status"],"unlock without approval")
    check("ARCH-04" in SEQUENCE.read_text(encoding="utf-8"), "missing canonical sequence")
    check(any(x["id"]=="GEO-08" and "HUMAN" in x["status"] for x in d["gates"]), "no human gate")
    return {
        "result":"ARCH04_ARCHITECTURAL_DESIGN_VALID__NOT_ART_APPROVED",
        "geometry_components":len(g),
        "drawing_sheets":len(d["drawings"]),
        "portals":len(instances),
        "primary_bays":g["galleries"]["number_of_bays"],
        "oculus_roof_panels":o["roof_panels_rear"],
        "gates":len(d["gates"]),
        "source_sha256":CANONICAL_SHA
    }

if __name__=="__main__":
    try:
        print(json.dumps(validate(),indent=2,ensure_ascii=False))
    except Exception as exc:
        print(f"ARCH04_SPEC_INVALID: {exc}",file=sys.stderr)
        sys.exit(1)
