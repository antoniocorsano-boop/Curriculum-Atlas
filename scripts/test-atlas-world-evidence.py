"""AWC-B contract tests, including deliberate evidence tampering."""
import copy,importlib.util,tempfile,unittest,zipfile,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("awce",ROOT/"scripts/atlas-world-evidence.py")
awce=importlib.util.module_from_spec(spec);spec.loader.exec_module(awce)
class EvidenceTest(unittest.TestCase):
    def setUp(self):
        self.index=awce.strict_json((ROOT/awce.INDEX).read_bytes())
        self.catalog,self.report=awce.load_catalog()
    def reject(self,mutate,pattern):
        q=copy.deepcopy(self.index);mutate(q)
        with self.assertRaisesRegex(ValueError,pattern):awce.validate(q,self.catalog,self.report)
    def test_contract(self):
        r=awce.validate(self.index,self.catalog,self.report)
        self.assertEqual(r["profileCount"],5);self.assertEqual(r["receiptCount"],8)
        self.assertFalse(r["archiveReplay"]);self.assertEqual(r["status"],"INDEX_CONTRACT_VALID")
        self.assertTrue(all(v is False for v in r["authority"].values()))
        self.assertEqual(r["blockedEntries"],["library.architecture","library.materials"])
    def test_master_mismatch(self):
        self.reject(lambda q:q.update(masterSha256="0"*64),"catalog/master identity")
    def test_promote(self):
        self.reject(lambda q:q["authority"].update(publishable=True),"no promotion")
        self.reject(lambda q:q["profiles"][0].update(state="QUALIFIED"),"profile scope")
    def test_unknown_source(self):
        self.reject(lambda q:q["profiles"][0]["facts"]["sourceTriangles"].__setitem__(0,"missing"),"fact source")
    def test_wrong_entry(self):
        self.reject(lambda q:q["profiles"][0].update(entry="library.camera"),"profile identity")
    def test_duplicate_artifact(self):
        self.reject(lambda q:q["archives"]["micro"].update(artifact=q["archives"]["geometry"]["artifact"]),"duplicate artifact")
    def test_cycle(self):
        self.reject(lambda q:q["profiles"][0]["dependencies"].append("library.pages.reduction"),"profile dependency")
    def test_missing_profile(self):
        self.reject(lambda q:q["profiles"].pop(),"profile coverage")
    def test_invalid_hash(self):
        self.reject(lambda q:q["receipts"]["pages"].update(sha256="bad"),"receipt identity")
    def test_missing_archive(self):
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaisesRegex(ValueError,"missing immutable archive"):awce.replay(self.index,d)
    def test_corrupt_archive(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/str(self.index["archives"]["geometry"]["artifact"])
            p.with_suffix(".zip").write_bytes(b"not the pinned ZIP")
            with self.assertRaisesRegex(ValueError,"archive hash"):awce.replay(self.index,d)
    def test_pointer(self):
        self.assertEqual(awce.pointer({"a":[{"b":3}]},"/a/0/b"),3)
        with self.assertRaisesRegex(ValueError,"missing receipt field"):awce.pointer({"a":1},"/b")
        self.assertFalse(awce.same(True,1));self.assertTrue(awce.same(0,0.0))
if __name__=="__main__":unittest.main()
