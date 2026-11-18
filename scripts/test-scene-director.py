import copy,importlib.util,pathlib,unittest
ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("asd",ROOT/"scripts/scene-director.py")
asd=importlib.util.module_from_spec(spec);spec.loader.exec_module(asd)
class TestDirector(unittest.TestCase):
    def setUp(self): self.c,self.m=asd.load_sources(ROOT)
    def plan(self,target,changes,reduced=True,opt_in=False):
        return asd.make_plan(self.c,self.m,asd.request_for(self.c,self.m,target,changes,reduced,opt_in))
    def test_webgl_range_and_rollback(self):
        p=self.plan("webgl",{"camera.orbit":.30,"camera.distance":.88})
        self.assertEqual(p["status"],"CANDIDATE")
        self.assertEqual(p["candidate"]["camera.orbit"],.30)
        self.assertEqual(p["rollback"]["camera.orbit"],0)
        self.assertEqual(asd.digest(p["rollback"]),p["baselineSha256"])
        self.assertFalse(p["rendererWriteAuthorized"])
        self.assertEqual(p,self.plan("webgl",{"camera.distance":.88,"camera.orbit":.30}))
    def test_lighting_dependency(self):
        p=self.plan("webgl",{"lighting.exposure":.90})
        self.assertEqual(p["status"],"DEPENDENCY_REQUIRED")
        self.assertIn("Compare actual images against P1",p["checks"])
    def test_blender_camera_dependency(self):
        p=self.plan("blender",{"camera.active":"vertical"})
        self.assertEqual(p["status"],"DEPENDENCY_REQUIRED")
        self.assertIn("Reproject ALS-01",p["dependencies"][0])
        q=self.plan("blender",{"camera.active":"vertical","astral.visible":False})
        self.assertEqual(q["status"],"CANDIDATE")
    def test_motion_opt_in(self):
        for reduced,opt in [(True,True),(False,False),(True,False)]:
            with self.assertRaises(ValueError):self.plan("webgl",{"astral.motion":True},reduced,opt)
        self.assertTrue(self.plan("webgl",{"astral.motion":True},False,True)["candidate"]["astral.motion"])
    def test_out_of_range_and_types(self):
        for v in [1.31,True,float("nan"),float("inf"),"0.2"]:
            with self.assertRaises(ValueError):self.plan("webgl",{"camera.tilt":v})
    def test_protected_and_wrong_target(self):
        for k in ["materials.profile","navigation.href","security.csp","camera.active","geometry.scale","als.optics","__proto__"]:
            with self.assertRaises(ValueError):self.plan("webgl",{k:1})
    def test_stale_master_and_state(self):
        r=asd.request_for(self.c,self.m,"webgl",{"camera.orbit":.1})
        for key in ["masterSha256","expectedStateSha256"]:
            bad=dict(r);bad[key]="0"*64
            with self.assertRaises(ValueError):asd.make_plan(self.c,self.m,bad)
    def test_camera_inventory_drift(self):
        m=copy.deepcopy(self.m);m["cameraIds"].pop()
        with self.assertRaises(ValueError):asd.request_for(self.c,m,"blender",{"camera.active":"vertical"})
    def test_no_authority(self):
        r=asd.request_for(self.c,self.m,"webgl",{"camera.orbit":.1})
        r["publishable"]=True
        with self.assertRaises(ValueError):asd.make_plan(self.c,self.m,r)
    def test_noop(self):
        with self.assertRaises(ValueError):self.plan("webgl",{"camera.orbit":0})
if __name__=="__main__":unittest.main()
