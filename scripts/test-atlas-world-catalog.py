"""AWC-A contract tests; no Blender or browser execution."""
import copy
import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("awc", ROOT / "scripts/atlas-world-catalog.py")
awc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(awc)

class CatalogTest(unittest.TestCase):
    def setUp(self):
        self.catalog = awc.strict_json((ROOT / awc.CATALOG).read_bytes())
        self.sources = {k:(ROOT / p).read_bytes() for k,p in awc.SOURCES.items()}

    def reject(self, mutate, reason):
        c = copy.deepcopy(self.catalog)
        mutate(c)
        with self.assertRaisesRegex(ValueError, reason):
            awc.validate(c, self.sources)

    def test_reference_only(self):
        r = awc.validate(self.catalog, self.sources)
        self.assertEqual(r, awc.validate(self.catalog, self.sources))
        self.assertEqual(r["projectedParameters"], 11)
        self.assertEqual(r["entryCount"], 6)
        self.assertEqual(r["blockedEntries"], ["library.architecture","library.materials"])
        self.assertFalse(r["rendererExecution"])
        self.assertFalse(r["masterBytesVerified"])
        self.assertFalse(r["artisticApproval"])
        self.assertFalse(r["toolsQualified"])
        self.assertTrue(all(v is False for v in r["authority"].values()))

    def test_stale_source(self):
        self.reject(lambda c:c["sources"].update(asdRegistry="0"*40), "source drift")

    def test_duplicate_id(self):
        self.reject(lambda c:c["entries"].append(copy.deepcopy(c["entries"][0])), "entry identity")

    def test_unknown_parameter(self):
        self.reject(lambda c:c["entries"][1]["parameters"].append("architecture.scale"), "unresolved parameter")

    def test_missing_parameter(self):
        self.reject(lambda c:c["entries"][1]["parameters"].remove("camera.orbit"), "projection incomplete")

    def test_wrong_target(self):
        self.reject(lambda c:c["entries"][2]["targets"].append("blender"), "unresolved parameter or target")

    def test_duplicate_ownership(self):
        self.reject(lambda c:c["entries"][2]["parameters"].append("camera.orbit"), "duplicate parameter ownership")

    def test_cycle(self):
        self.reject(lambda c:c["entries"][0]["dependencies"].append("library.camera"), "dependency cycle")

    def test_unresolved_dependency(self):
        self.reject(lambda c:c["entries"][1]["dependencies"].append("missing"), "unresolved dependency")

    def test_blocked_dependency(self):
        self.reject(lambda c:c["entries"][1]["dependencies"].append("library.architecture"), "blocked dependency")

    def test_blocked_capability(self):
        self.reject(lambda c:c["entries"][4]["targets"].append("blender"), "blocked entry exposes capability")

    def test_blocked_preset(self):
        self.reject(lambda c:c["presets"][0]["entries"].append("library.materials"), "preset blocked entry")

    def test_preset_closure(self):
        self.reject(lambda c:c["entries"][2]["dependencies"].append("library.camera") or c["presets"][0]["entries"].remove("library.camera"), "preset dependency closure")

    def test_no_promotion(self):
        self.reject(lambda c:c["entries"][1].update(state="QUALIFIED"), "entry state")
        self.reject(lambda c:c.update(mode="EXECUTE"), "catalog version or boundary")
        self.reject(lambda c:c["concepts"][0].update(state="CANDIDATE"), "concept boundary")
        self.reject(lambda c:c["entries"][1].update(licenseStatus="APPROVED"), "license not established")

    def test_no_extra_authority(self):
        self.reject(lambda c:c.update(publishable=True), "catalog shape")

    def test_strict_json(self):
        for bad in ('{"a":1,"a":2}', '{"a":NaN}', '{"a":Infinity}'):
            with self.assertRaises(ValueError):
                awc.strict_json(bad)

if __name__ == "__main__":
    unittest.main()
