import copy,importlib.util,json,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("asi",ROOT/"scripts/scene-intelligence.py")
asi=importlib.util.module_from_spec(spec);spec.loader.exec_module(asi)
class EvidenceTest(unittest.TestCase):
    def setUp(self):
        self.h=(ROOT/"ops/atlas-scene-package/history.jsonl").read_bytes()
        self.r=json.loads((ROOT/"ops/atlas-scene-intelligence/rules.json").read_text())
        raw=(ROOT/"ops/atlas-scene-package/editable-master-receipt-summary.json").read_bytes()
        self.m=json.loads(raw);self.mh=asi.digest(raw)
    def run_projection(self,h=None,r=None,m=None,tags=()):
        return asi.project(self.h if h is None else h,self.r if r is None else r,self.m if m is None else m,self.mh,"a"*40,tags)
    def test_real_history(self):
        d=self.run_projection()
        self.assertEqual(len(d["findings"]),6)
        self.assertEqual(d["blocked"],[])
        self.assertFalse(d["runtimeAuthorized"])
        self.assertFalse(d["modelTraining"])
        self.assertEqual(d["liveObservationStatus"],"UNAVAILABLE")
        self.assertEqual(len(d["masterObservation"]["collections"]),10)
        self.assertTrue(any(x["negativeKnowledge"] for x in d["findings"]))
    def test_query(self):
        d=self.run_projection(tags=["repeated-meshes"])
        self.assertEqual([x["id"] for x in d["findings"]],["ASI-K001"])
        self.assertFalse(d["findings"][0]["nextCandidateAction"]["authorized"])
    def test_changed_source_blocks(self):
        rows=list(asi.read_history(self.h).values())
        rows[7]["commit"]="b"*40
        h=("\n".join(json.dumps(x) for x in rows)+"\n").encode()
        d=self.run_projection(h=h,tags=["repeated-meshes"])
        self.assertEqual(d["findings"],[])
        self.assertEqual(d["blocked"][0]["issues"],["source-changed:ASP-H008"])
    def test_supersession_blocks(self):
        rows=list(asi.read_history(self.h).values());n=len(rows)+1
        rows.append({"id":f"ASP-H{n:03d}","sequence":n,"supersedes":"ASP-H008"})
        h=("\n".join(json.dumps(x) for x in rows)+"\n").encode()
        d=self.run_projection(h=h,tags=["repeated-meshes"])
        self.assertEqual(d["findings"],[])
        self.assertEqual(d["blocked"][0]["issues"],["superseded:ASP-H008"])
    def test_missing_source_blocks(self):
        r=copy.deepcopy(self.r);r["rules"][0]["sources"][0][0]="ASP-H999"
        self.assertEqual(self.run_projection(r=r,tags=["repeated-meshes"])["findings"],[])
    def test_no_authority_promotion(self):
        m=copy.deepcopy(self.m);m["studentAuthorized"]=True
        with self.assertRaises(ValueError):self.run_projection(m=m)
    def test_no_duplicate_ids(self):
        r=copy.deepcopy(self.r);r["rules"].append(r["rules"][0])
        with self.assertRaises(ValueError):self.run_projection(r=r)
if __name__=="__main__":unittest.main()
