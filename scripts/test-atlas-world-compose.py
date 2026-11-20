"""AWC-C regression tests: deterministic closure, ASD delegation and non-execution."""
import copy,importlib.util,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("compose",ROOT/"scripts/atlas-world-compose.py")
awc=importlib.util.module_from_spec(spec);spec.loader.exec_module(awc)

class ComposeTest(unittest.TestCase):
    def reject(self,example,mutate,pattern):
        req=awc.example(example);mutate(req)
        with self.assertRaisesRegex(ValueError,pattern):awc.compose(req)
    def test_bay_closure(self):
        r=awc.compose(awc.example("bay"))
        self.assertEqual([s["id"] for s in r["steps"]],["library.agx.display","library.walnut.microstructure","library.walnut.lightmap","library.bay.navigation"])
        self.assertEqual([s["role"] for s in r["steps"]],["SELECTED","PREREQUISITE","PREREQUISITE","SELECTED"])
        self.assertEqual([s["crossTarget"] for s in r["steps"]],[False,True,True,False])
        self.assertEqual(r["steps"][-1]["selectedFor"],["interactive-preview","material-fidelity"])
        self.assertTrue(all(s["mode"]=="REFERENCE_ONLY" for s in r["steps"]))
        self.assertEqual(r["geometryComparison"]["observedTriangles"],19008)
        self.assertTrue(r["geometryComparison"]["withinTarget"])
        self.assertFalse(r["geometryComparison"]["otherMetricsMeasured"])
        self.assertIn("ARCHITECTURE_OR_MATERIAL_ADAPTER_NOT_QUALIFIED",r["blockers"])
        self.assertIn("BAY_PARAMETER_ADAPTER_NOT_QUALIFIED",r["blockers"])
    def test_deterministic(self):
        q=awc.example("bay");r=awc.compose(q)
        q["goals"].reverse()
        self.assertEqual(r,awc.compose(q))
        h=r.pop("planSha256");self.assertEqual(h,awc.asd.digest(r))
    def test_native_parameter_delegation(self):
        q=awc.example("native");r=awc.compose(q);d=awc.inputs()
        expected=awc.asd.make_plan(d[3],d[4],{
            "target":q["target"],"masterSha256":q["expectedSources"]["masterSha256"],
            "expectedStateSha256":q["expectedStateSha256"],"changes":q["changes"],
            "reducedMotion":q["reducedMotion"],"motionOptIn":q["motionOptIn"]})
        self.assertEqual(r["parameterPlan"],expected)
        self.assertEqual(r["candidate"]["camera.orbit"],.11)
        self.assertEqual(r["rollback"]["camera.orbit"],0)
        self.assertEqual(r["steps"],[])
    def test_blender_camera_dependency(self):
        r=awc.compose(awc.example("blender"))
        self.assertEqual([s["id"] for s in r["steps"]],["library.pages.reduction","library.walnut.microstructure","library.walnut.lightmap"])
        self.assertEqual(r["parameterPlan"]["status"],"DEPENDENCY_REQUIRED")
        self.assertIn("ASD_DEPENDENCY_REQUIRED",r["blockers"])
        self.assertIn("FIXED_VIEW_EVIDENCE_NOT_TRANSFERRED_TO_NEW_CAMERA",r["blockers"])
        self.assertIsNone(r["budget"])
    def test_no_runtime_equivalence(self):
        q=awc.example("native");q["goals"]=["color-fidelity"];q["changes"]={"lighting.exposure":.9}
        r=awc.compose(q)
        self.assertIn("BAY_LABORATORY_EVIDENCE_NOT_NATIVE_RUNTIME_BINDING",r["blockers"])
        self.assertIn("ASD_DEPENDENCY_REQUIRED",r["blockers"])
    def test_reject_unknown_world(self):
        self.reject("bay",lambda q:q.update(world="aurelia"),"world not executable")
    def test_reject_bad_goal(self):
        self.reject("bay",lambda q:q.update(goals=["unknown"]),"unknown production goal")
        self.reject("bay",lambda q:q.update(goals=["geometry-reduction"]),"goal unsupported")
        self.reject("bay",lambda q:q.update(goals=["reference","reference"]),"goals duplicate")
        self.reject("bay",lambda q:q.update(goals=[]),"empty goals")
    def test_reject_context(self):
        self.reject("native",lambda q:q.update(context="blender-master"),"target/context mismatch")
        self.reject("bay",lambda q:q.update(device="unknown"),"device profile mismatch")
        self.reject("blender",lambda q:q.update(device="mobile"),"device profile mismatch")
    def test_reject_stale(self):
        self.reject("native",lambda q:q["expectedSources"].update(evidenceIndex="0"*64),"stale composition sources")
        self.reject("native",lambda q:q.update(expectedStateSha256="0"*64),"stale baseline")
    def test_reject_parameter(self):
        self.reject("bay",lambda q:q.update(changes={"camera.orbit":.1}),"bay parameter adapter")
        self.reject("native",lambda q:q.update(changes={"materials.roughness":.4}),"unknown or protected")
        self.reject("native",lambda q:q.update(changes={"camera.orbit":2}),"out of range")
        self.reject("native",lambda q:q.update(changes={"camera.orbit":0}),"no effective change")
    def test_accessibility(self):
        self.reject("native",lambda q:q.update(changes={"astral.motion":True}),"motion requires explicit opt-in")
        q=awc.example("native");q.update(changes={"astral.motion":True},reducedMotion=False,motionOptIn=True)
        self.assertTrue(awc.compose(q)["candidate"]["astral.motion"])
    def test_no_authority(self):
        self.reject("bay",lambda q:q.update(execute=True),"composition request shape")
        for name in ("bay","native","blender"):
            r=awc.compose(awc.example(name))
            self.assertFalse(r["archiveReplay"])
            self.assertFalse(r["readyForExecution"])
            self.assertFalse(r["rendererExecutionAuthorized"])
            self.assertFalse(r["toolExecutionAuthorized"])
            self.assertFalse(r["paidServicesAuthorized"])
            self.assertTrue(all(v is False for v in r["authority"].values()))
            self.assertTrue(all(t["availability"]=="NOT_CHECKED" and t["versionLicenseCompatibility"]=="NOT_QUALIFIED" for t in r["toolReadiness"]))
            self.assertIn("ORIGINAL_ARCHIVES_NOT_REPLAYED",r["blockers"])
    def test_source_budgets(self):
        r=awc.compose(awc.example("bay"))
        self.assertEqual(r["budget"],awc.inputs()[-1]["profiles"]["mobile"])
        self.assertEqual(r["unmetProductionEvidence"],awc.inputs()[-1]["unmetEvidence"])
    def test_input_unchanged(self):
        q=awc.example("bay");before=copy.deepcopy(q);awc.compose(q);self.assertEqual(q,before)

if __name__=="__main__":unittest.main()
