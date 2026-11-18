"""ART-100: candidate world-scoped intent plans; never writes a renderer."""
import hashlib, json, math, re, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/"ops/atlas-scene-director"
def require(ok,msg):
    if not ok: raise ValueError(msg)
def digest(x):
    return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":"),allow_nan=False).encode()).hexdigest()
def load():
    c=json.loads((DIR/"art-parameters.json").read_text())
    p1=json.loads((DIR/"parameters.json").read_text())
    require(c["schema"]=="atlas.asd.world-art-catalog/v1" and c["status"]=="CANDIDATE_PLAN_ONLY" and c["authority"]=="ASD-01","catalog authority")
    require(sum(x["weight"] for x in c["rubric"])==100,"rubric")
    require(len({p["id"] for p in c["parameters"]})==len(c["parameters"]),"duplicate")
    require(all(v is False for k,v in c["invariants"].items() if k!="zeroCost") and c["invariants"]["zeroCost"] is True,"invariants")
    old={(p["target"],p["id"]):p for p in p1["parameters"]}
    for p in c["parameters"]:
        require(p["availability"] in ("P1_REFERENCE","DESIGN_INTENT","ADAPTER_REQUIRED"),"availability")
        if p["availability"]=="P1_REFERENCE":
            q=old[(p["p1"]["target"],p["p1"]["id"])]
            require(all(p.get(k)==q.get(k) for k in ("type","min","max","unit","values")),"P1 binding drift")
    return c,{p["id"]:p for p in c["parameters"]}
def validate(p,v):
    if p["type"]=="number": require(type(v) in (int,float) and math.isfinite(v) and p["min"]<=v<=p["max"],"range "+p["id"])
    elif p["type"]=="enum": require(type(v) is str and v in p["values"],"enum "+p["id"])
    elif p["type"]=="boolean": require(type(v) is bool,"boolean "+p["id"])
    else: raise ValueError("unknown type")
def plan(profile,request):
    c,params=load()
    require(type(profile) is dict and set(profile)=={"worldId","sceneId","representation","sourceSha","values"},"profile fields")
    for k in ("worldId","sceneId"):
        require(type(profile[k]) is str and re.fullmatch(r"[a-zA-Z0-9_-]{1,80}",profile[k]),"identity")
    require(profile["representation"] in ("2d","3d","hybrid"),"representation")
    require(type(profile["sourceSha"]) is str and re.fullmatch(r"[0-9a-f]{40}",profile["sourceSha"]),"source revision")
    require(type(profile["values"]) is dict and bool(profile["values"]),"values")
    for k,v in profile["values"].items():
        require(k in params,"unknown property");validate(params[k],v)
        require(not (params[k]["availability"]=="P1_REFERENCE" and profile["representation"]=="2d"),"WebGL reference not a 2D capability")
    require(type(request) is dict and set(request)=={"expectedProfileSha256","changes"},"request fields")
    require(request["expectedProfileSha256"]==digest(profile),"stale or foreign world")
    changes=request["changes"];require(type(changes) is dict and bool(changes),"changes")
    candidate=dict(profile["values"])
    for k,v in changes.items():
        require(k in candidate,"undeclared capability "+k)
        require(params[k]["family"]!="world","educational state requires separate authorized action contract")
        validate(params[k],v)
        require(not (k in ("astral.motion","ui.motion","ui.audio") and v is True),"explicit accessibility/consent adapter required")
        candidate[k]=v
    require(candidate!=profile["values"],"no change")
    return {"schema":"atlas.asd.world-art-plan/v1","mode":"PLAN_ONLY","worldId":profile["worldId"],
            "sceneId":profile["sceneId"],"representation":profile["representation"],"sourceSha":profile["sourceSha"],
            "catalogSha256":digest(c),"baselineSha256":digest(profile),"candidateSha256":digest(dict(profile,values=candidate)),
            "changes":[{"id":k,"before":profile["values"][k],"after":v,"unit":params[k]["unit"],"availability":params[k]["availability"]}
                       for k,v in sorted(changes.items()) if profile["values"][k]!=v],
            "candidate":candidate,"rollback":dict(profile["values"]),"rendererWriteAuthorized":False,
            "artisticApproval":False,"runtimeAuthorized":False,"studentAuthorized":False,"publishable":False}
def fixture(world,rep,values):
    return {"worldId":world,"sceneId":"test-scene","representation":rep,"sourceSha":"a"*40,"values":values}
class ContractTests(unittest.TestCase):
    def setUp(self):
        self.a=fixture("library-test","3d",{"identity.warmth":.4,"lighting.exposure":.82,"astral.motion":False,"world.state":"entry"})
        self.b=fixture("museum-test","2d",{"identity.warmth":.2,"ui.integration":"illustrated","ui.motion":False})
    def request(self,p,changes): return {"expectedProfileSha256":digest(p),"changes":changes}
    def test_catalog(self): self.assertEqual(len(load()[1]),49)
    def test_two_worlds_same_grammar(self):
        for p in (self.a,self.b):
            q=self.request(p,{"identity.warmth":.7});r=plan(p,q)
            self.assertEqual(r,plan(p,q));self.assertEqual(r["rollback"],p["values"])
            self.assertEqual(r["candidate"]["identity.warmth"],.7)
            self.assertEqual(r["worldId"],p["worldId"]);self.assertFalse(r["rendererWriteAuthorized"])
    def test_cross_world_rejected(self):
        with self.assertRaises(ValueError): plan(self.b,self.request(self.a,{"identity.warmth":.7}))
    def test_undeclared(self):
        with self.assertRaises(ValueError): plan(self.b,self.request(self.b,{"lighting.exposure":.9}))
    def test_no_2d_webgl(self):
        p=fixture("museum-test","2d",{"lighting.exposure":.82})
        with self.assertRaises(ValueError): plan(p,self.request(p,{"lighting.exposure":.9}))
    def test_range_and_type(self):
        for v in (-1,1.1,True,"0.7"):
            with self.assertRaises(ValueError): plan(self.a,self.request(self.a,{"identity.warmth":v}))
    def test_pedagogy_protected(self):
        with self.assertRaises(ValueError): plan(self.a,self.request(self.a,{"world.state":"decision"}))
    def test_motion_protected(self):
        with self.assertRaises(ValueError): plan(self.a,self.request(self.a,{"astral.motion":True}))
    def test_no_authority_escalation(self):
        with self.assertRaises(ValueError): plan(self.a,dict(self.request(self.a,{"identity.warmth":.7}),publishable=True))
    def test_p1_reference_plan_only(self):
        r=plan(self.a,self.request(self.a,{"lighting.exposure":.9}))
        self.assertEqual(r["changes"][0]["availability"],"P1_REFERENCE");self.assertFalse(r["rendererWriteAuthorized"])
    def test_no_effect(self):
        with self.assertRaises(ValueError): plan(self.a,self.request(self.a,{"identity.warmth":.4}))
if __name__=="__main__": unittest.main()
