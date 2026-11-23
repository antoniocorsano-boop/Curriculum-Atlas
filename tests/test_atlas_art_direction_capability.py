"""Negative and positive qualification of the governed art-direction adapter.

Run without Blender or network access:
  python3 -m unittest discover -s tests -p 'test_atlas_art_direction_capability.py' -v
"""
from __future__ import annotations
import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/atlas-gateway-production/atlas_art_direction_capability.py"
SPEC = ROOT / "docs/atlas-gateway/ATLAS-P3B-R3-ARTSPEC-01.json"

loader = importlib.util.spec_from_file_location("atlas_art_direction_capability", SCRIPT)
module = importlib.util.module_from_spec(loader)
loader.loader.exec_module(module)


class ArtDirectionContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.valid = json.loads(SPEC.read_text(encoding="utf-8"))

    def check_invalid(self, mutator):
        value = copy.deepcopy(self.valid)
        mutator(value)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "candidate.json"
            path.write_text(json.dumps(value), encoding="utf-8")
            with self.assertRaises((ValueError, KeyError, TypeError)):
                module.validate_spec(path)

    def test_valid_spec(self):
        value = module.validate_spec(SPEC)
        self.assertEqual(value["specId"], "ATLAS-P3B-R3-ARTSPEC-01")
        self.assertFalse(value["safety"]["publishAuthorized"])
        self.assertFalse(value["acceptance"]["humanArtApproval"])

    def test_reject_wrong_source_sha(self):
        self.check_invalid(lambda d: d["source"].update({"sha256": "0" * 64}))

    def test_reject_publication_authority(self):
        self.check_invalid(lambda d: d["safety"].update({"publishAuthorized": True}))

    def test_reject_merge_authority(self):
        self.check_invalid(lambda d: d["safety"].update({"mergeAuthorized": True}))

    def test_reject_non_derivative(self):
        self.check_invalid(lambda d: d["safety"].update({"derivativeOnly": False}))

    def test_reject_personal_student_data(self):
        self.check_invalid(lambda d: d["safety"].update({"studentData": True}))

    def test_reject_bad_roughness(self):
        self.check_invalid(lambda d: d["materials"][0].update({"roughness": 1.4}))

    def test_reject_material_id_collision(self):
        self.check_invalid(lambda d: d["materials"][1].update({"id": d["materials"][0]["id"]}))

    def test_reject_premature_human_art_approval(self):
        self.check_invalid(lambda d: d["acceptance"].update({"humanArtApproval": True}))

    def test_reject_wrong_camera(self):
        self.check_invalid(lambda d: d["cameras"].update({"masterName": "UNKNOWN"}))

    def test_reject_wrong_oculus(self):
        self.check_invalid(lambda d: d["acceptance"].update({"oculusRadiusBU": 7.0}))

    def test_reject_wrong_schema(self):
        self.check_invalid(lambda d: d.update({"schemaVersion": "experimental/v9"}))

    def test_reject_missing_material(self):
        self.check_invalid(lambda d: d.update({"materials": d["materials"][:2]}))

    def test_reject_nonfinite_pbr(self):
        self.check_invalid(lambda d: d["materials"][0].update({"metallic": float("nan")}))

    def test_parent_receipt_guard(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "receipt.json"
            path.write_text(json.dumps({"schema": "atlas.gateway.arch-art-p3a-cycles-result/v1",
                                        "roof": {"radius_bu": 6.25, "nonmanifold_edges": 0}}))
            with self.assertRaises(ValueError):
                module.validate_parent_receipt(path, self.valid)


if __name__ == "__main__":
    unittest.main()
