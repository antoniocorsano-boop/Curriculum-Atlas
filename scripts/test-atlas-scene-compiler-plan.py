"""Contract and negative tests for the read-only ASC-01 preflight."""
import copy
import importlib.util
import json
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("asc", ROOT / "scripts/atlas-scene-compiler-plan.py")
asc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(asc)

class PlanTest(unittest.TestCase):
    def setUp(self):
        self.p = json.loads(asc.POLICY.read_text(encoding="utf-8"))
        self.r = json.loads((ROOT / self.p["pilot"]["receipt"]).read_text(encoding="utf-8"))
    def test_plan_only(self):
        result = asc.plan(self.p, self.r)
        self.assertEqual(result, asc.plan(self.p, self.r))
        self.assertEqual(result["status"], "PLAN_ONLY")
        self.assertFalse(result["masterBytesVerified"])
        self.assertFalse(result["toolsQualified"])
        self.assertFalse(result["artCandidateReviewed"])
        self.assertTrue(all(v is False for v in result["authority"].values()))
        self.assertEqual([v["id"] for v in result["variants"]], ["A","B","C"])
    def test_wrong_master(self):
        self.r["file"]["sha256"] = "0"*64
        with self.assertRaisesRegex(ValueError, "master receipt mismatch"):
            asc.plan(self.p, self.r)
    def test_promotion_rejected(self):
        for key in self.p["authority"]:
            p = copy.deepcopy(self.p)
            p["authority"][key] = True
            with self.assertRaisesRegex(ValueError, "authority"):
                asc.plan(p, self.r)
    def test_inventory_drift(self):
        for row in self.r["collections"]:
            if row["name"] == "02 Campate condivise":
                row["uniqueMeshes"] += 1
        with self.assertRaisesRegex(ValueError, "bay inventory drift"):
            asc.plan(self.p, self.r)
    def test_unqualified_renderer(self):
        self.p["pilot"]["renderer"] = "unqualified"
        with self.assertRaisesRegex(ValueError, "pilot scope"):
            asc.plan(self.p, self.r)
    def test_missing_variant(self):
        self.p["variants"].pop()
        with self.assertRaisesRegex(ValueError, "variant contract"):
            asc.plan(self.p, self.r)

if __name__ == "__main__":
    unittest.main()
