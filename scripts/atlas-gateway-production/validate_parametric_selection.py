#!/usr/bin/env python3
"""ATLAS SIM-01 — validate an exported, still-unapproved parametric proposal.

No network, Blender, file writes, or access to student data. This validator
never modifies a qualified .blend or grants publication/merge permission.
"""
import argparse
import json
import math
from pathlib import Path

CANONICAL = "a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
BOUNDS = {
    "outerRadius": (8.1, 13), "upperGallery": (4.95, 6.9),
    "thirdLevelHeight": (1.5, 2.8), "roofHeight": (8.5, 12.4), "vaultCurve": (.15, .95),
    "outerElongation": (1, 1.65), "oculusRadius": (3.7, 6),
    "ellipseRatio": (1, 1.8), "straightness": (0, 1),
    "oculusAngle": (-90, 90), "rimThickness": (.08, .48),
    "shortReveal": (.06, .32), "portalRadius": (4.5, 8.2),
    "portalSpan": (46, 140), "portalOffset": (-2, 2),
    "portalDepth": (-2, 2), "glassHeight": (3.3, 5.4),
    "glassWidth": (.95, 2.2), "portalGlow": (.15, 1),
    "cameraHeight": (1.25, 4.5), "cameraDistance": (13, 28),
    "cameraPitch": (-6, 10), "cameraYaw": (-30, 30),
    "lens": (26, 67),
}

def validate(data):
    if not isinstance(data, dict) or data.get("schema") != "atlas.gateway.parametric-selection/v3":
        raise ValueError("Schema non riconosciuto")
    if data.get("reference", {}).get("sha256") != CANONICAL:
        raise ValueError("Riferimento ART-DIR-02 diverso dal canone")
    if data.get("portal_placement") != "far_side_relative_to_camera":
        raise ValueError("I portali devono essere sul lato opposto della telecamera")
    if data.get("units") != "BU" or data.get("coordinate_system") != "Blender Z up":
        raise ValueError("Coordinate o unità non corrispondenti")
    source = data.get("blender_baseline", {})
    if source.get("arch_and_variant") not in {"A-J3", "A-J4", "B-J3", "B-J4"}:
        raise ValueError("Modello qualificato non identificato")
    if source.get("source_repository_id") != 1376266693 or source.get("source_repository") != "atlas":
        raise ValueError("Identità del repository non verificata")
    if source.get("source_workflow_run") != 45008316673:
        raise ValueError("Provenienza del modello originale non riconosciuta")
    decision = data.get("decision", {})
    if (decision.get("art_approved") is not False
        or decision.get("automatically_merge") is not False
        or decision.get("automatically_publish") is not False
        or decision.get("status") != "proposta_da_qualificare"):
        raise ValueError("La selezione non deve autorizzare approvazione o pubblicazione")
    levels = data.get("architecture_levels", {})
    if (levels.get("count") != 3 or levels.get("ground_floor_z") != 0
        or levels.get("first_gallery_z") != 3.21):
        raise ValueError("Tre livelli architettonici obbligatori: terra e due gallerie")
    p = data.get("parameters", {})
    if set(p) != set(BOUNDS):
        raise ValueError("Parametri incompleti, mancanti o aggiunti: " + str(sorted(set(p) ^ set(BOUNDS))))
    for name, (lo, hi) in BOUNDS.items():
        value = p[name]
        if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value) or not lo <= value <= hi:
            raise ValueError(f"Parametro fuori intervallo: {name}={value}")
    if not math.isclose(levels.get("second_gallery_z", -1), p["upperGallery"], abs_tol=1e-4):
        raise ValueError("Quota seconda galleria incoerente")
    if not math.isclose(levels.get("roof_spring_z", -1), p["upperGallery"] + p["thirdLevelHeight"], abs_tol=1e-4):
        raise ValueError("Imposta copertura incoerente con terzo livello")
    checks = [
        (p["roofHeight"] > p["upperGallery"] + p["thirdLevelHeight"] + 1.0, "La copertura non lascia tre livelli abitabili distinguibili"),
        (p["upperGallery"] > p["glassHeight"] + .20, "Portali troppo alti per la seconda galleria"),
        (p["portalRadius"] <= p["outerRadius"] - .55, "Portali oltre il perimetro"),
        (p["portalRadius"] >= p["oculusRadius"] + .10, "Portali troppo vicini all'oculo"),
        (p["oculusRadius"] + 1.2 <= p["outerRadius"], "Copertura insufficiente intorno all'oculo"),
        (p["oculusRadius"] * p["ellipseRatio"] <= p["outerRadius"] * p["outerElongation"] - 1.1,
         "Asse maggiore oltre l'ingombro della copertura"),
    ]
    # Camera in (sin yaw, -cos yaw); each portal has its panel edges beyond the centre.
    yaw = math.radians(p["cameraYaw"])
    camera_side_x, camera_side_y = math.sin(yaw), -math.cos(yaw)
    for i in range(4):
        angle = math.radians(90 + (i - 1.5) * p["portalSpan"] / 3)
        x = p["portalOffset"] + p["portalRadius"] * math.cos(angle)
        y = p["portalDepth"] + p["portalRadius"] * math.sin(angle)
        tangent_x, tangent_y = -math.sin(angle), math.cos(angle)
        for u in (-p["glassWidth"] / 2, 0, p["glassWidth"] / 2):
            if (x + tangent_x * u) * camera_side_x + (y + tangent_y * u) * camera_side_y >= 0:
                raise ValueError("Uno o piu portali si trovano verso la telecamera")
    for ok, message in checks:
        if not ok:
            raise ValueError(message)
    return p


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("selection", type=Path)
    args = parser.parse_args()
    p = validate(json.loads(args.selection.read_text(encoding="utf-8")))
    print("ATLAS SIM-01 — proposta valida, non approvata")
    print("Inquadratura e configurazione:")
    for key in ("outerRadius", "upperGallery", "roofHeight", "oculusRadius", "ellipseRatio",
                "straightness", "thirdLevelHeight", "portalRadius", "portalSpan", "glassHeight", "cameraPitch"):
        print(f"  {key}: {p[key]}")
    print("Passo successivo: prova Blender su una copia qualificata, controllo topologia e Cycles.")

if __name__ == "__main__":
    main()
