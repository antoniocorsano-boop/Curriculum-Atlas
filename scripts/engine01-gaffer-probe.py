"""ENGINE-01/P0: isolated Gaffer + Cycles CPU parametric smoke render.
No Atlas assets, no external scenes, no runtime writes, no artistic score.
Run with the pinned Gaffer distribution's python application.
"""
import hashlib
import json
import math
import os
import pathlib
import time
import imath
import IECoreScene
import Gaffer
import GafferScene
import GafferCycles
import GafferImage

out = pathlib.Path(os.environ["ATLAS_ENGINE_EVIDENCE"])
out.mkdir(parents=True, exist_ok=True)
report = {"schema":"atlas.art.engine-probe/v1","status":"PENDING","engine":"Gaffer/Cycles","device":"CPU","world":"synthetic-light-probe","sourceRevision":os.environ["GITHUB_SHA"],"masterModified":False,"runtimeAuthorized":False,"studentAuthorized":False,"publishable":False,"artisticApproval":False,"renders":{}}
def save():
    (out/"report.json").write_text(json.dumps(report, indent=2)+"\n")
def option(node,key,value):
    plug = node["options"][key]
    plug["value"].setValue(value)
    plug["enabled"].setValue(True)
def require(condition, message):
    if not condition:
        raise RuntimeError(message)
save()
try:
    s=Gaffer.ScriptNode()
    s["camera"]=GafferScene.Camera()
    s["camera"]["transform"]["translate"]["z"].setValue(6)
    s["ball"]=GafferScene.Sphere()
    s["ball"]["radius"].setValue(0.8)
    s["backdrop"]=GafferScene.Plane()
    s["backdrop"]["dimensions"].setValue(imath.V2f(8,6))
    s["backdrop"]["transform"]["translate"]["z"].setValue(-1.05)
    s["material"]=GafferCycles.CyclesShader()
    s["material"].loadShader("diffuse_bsdf")
    s["material"]["parameters"]["color"].setValue(imath.Color3f(.55,.37,.19))
    s["wallMaterial"]=GafferCycles.CyclesShader()
    s["wallMaterial"].loadShader("diffuse_bsdf")
    s["wallMaterial"]["parameters"]["color"].setValue(imath.Color3f(.6,.6,.6))
    for name, obj, mat in (("objectSurface","ball","material"),("wallSurface","backdrop","wallMaterial")):
        s[name]=GafferScene.ShaderAssignment()
        s[name]["in"].setInput(s[obj]["out"])
        s[name]["shader"].setInput(s[mat]["out"]["BSDF"])
    s["key"]=GafferCycles.CyclesLight()
    s["key"].loadShader("point_light")
    s["key"]["name"].setValue("key")
    s["key"]["transform"]["translate"].setValue(imath.V3f(-2,2,3))
    s["key"]["parameters"]["size"].setValue(.5)
    s["key"]["parameters"]["color"].setValue(imath.Color3f(1,.8,.6))
    s["key"]["parameters"]["intensity"].setValue(40)
    s["scene"]=GafferScene.Parent()
    s["scene"]["in"].setInput(s["camera"]["out"])
    s["scene"]["parent"].setValue("/")
    for n in ("objectSurface","wallSurface","key"):
        s["scene"]["children"].next().setInput(s[n]["out"])
    s["standard"]=GafferScene.StandardOptions()
    s["standard"]["in"].setInput(s["scene"]["out"])
    option(s["standard"],"render:camera","/camera")
    option(s["standard"],"render:resolution",imath.V2i(256,192))
    s["cycles"]=GafferCycles.CyclesOptions()
    s["cycles"]["in"].setInput(s["standard"]["out"])
    for k,v in (("cycles:device","CPU"),("cycles:session:samples",16),("cycles:session:threads",2),("cycles:integrator:max_bounce",4)):
        option(s["cycles"],k,v)
    s["outputs"]=GafferScene.Outputs()
    s["outputs"]["in"].setInput(s["cycles"]["out"])
    s["outputs"].addOutput("beauty",IECoreScene.Output(str(out/"reference.exr"),"exr","rgba",{}))
    s["render"]=GafferScene.Render()
    s["render"]["in"].setInput(s["outputs"]["out"])
    s["render"]["renderer"].setValue("Cycles")
    s["fileName"].setValue(str(out/"reference.gfr"))
    s.save()
    key=s["key"]["parameters"]["intensity"]
    base=key.getValue()
    def protected():
        scene=s["scene"]["out"]
        return {p:[str(scene.objectHash(p)),str(scene.transformHash(p)),str(scene.attributesHash(p))] for p in ("/camera","/sphere","/plane")}
    # Primitive names are read from the actual scene, not guessed by path.
    names=list(s["scene"]["out"].childNames("/"))
    protected_paths=["/"+str(n) for n in names if str(n)!="key"]
    require(len(protected_paths)==3 and "/key" in ["/"+str(n) for n in names],"scene inventory")
    def protected():
        scene=s["scene"]["out"]
        return {p:[str(scene.objectHash(p)),str(scene.transformHash(p)),str(scene.attributesHash(p))] for p in protected_paths}
    fixed=protected()
    def sample_render(name):
        path=out/(name+".exr")
        s["outputs"]["outputs"][0]["fileName"].setValue(str(path))
        start=time.monotonic()
        with s.context():
            s["render"]["task"].execute()
        require(path.is_file() and path.stat().st_size>0,"missing render "+name)
        reader=GafferImage.ImageReader()
        reader["fileName"].setValue(str(path))
        sampler=GafferImage.ImageSampler()
        sampler["image"].setInput(reader["out"])
        values=[]
        for y in range(16,192,16):
            for x in range(16,256,16):
                sampler["pixel"].setValue(imath.V2f(x+.5,y+.5))
                c=sampler["color"].getValue()
                values.extend([float(c[i]) for i in range(3)])
        require(all(math.isfinite(v) for v in values) and max(values)>0,"nonfinite or black render "+name)
        require(protected()==fixed,"protected scene changed")
        report["renders"][name]={"intensity":key.getValue(),"seconds":round(time.monotonic()-start,3),"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"samples":len(values),"meanLinearRGB":sum(values)/len(values)}
        save()
        return values
    reference=sample_render("reference")
    try:
        key.setValue(base*2)
        observed=s["key"]["out"].attributes("/key")["cycles:light"].outputShader().parameters["intensity"].value
        require(observed==base*2,"light parameter not propagated")
        variant=sample_render("variant")
    finally:
        key.setValue(base)
    restored=sample_render("restored")
    require(key.getValue()==base and protected()==fixed,"rollback state")
    delta=sum(abs(a-b) for a,b in zip(reference,variant))/len(reference)
    rollback=max(abs(a-b) for a,b in zip(reference,restored))
    require(delta>1e-4,"no perceptible sampled light effect")
    require(rollback<1e-5,"sampled image rollback mismatch")
    report.update(status="PASS_SYNTHETIC_ONLY",protectedPaths=protected_paths,meanAbsoluteRGBDelta=delta,maxRollbackSampleDelta=rollback,scope="Sampled EXR RGB rollback; not whole-image equality or Atlas master import.")
    save()
except Exception as e:
    report.update(status="FAIL",error=repr(e))
    save()
    raise
