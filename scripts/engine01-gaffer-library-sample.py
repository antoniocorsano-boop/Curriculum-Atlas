"""ENGINE-01 P1A: read the actual USD sample, verify inventory, render reversible light variants.
Material proxies are intentionally diffuse source colors, not equivalent to Blender shaders.
"""
import hashlib,json,math,os,pathlib,time
import imath,IECore,IECoreScene,Gaffer,GafferScene,GafferCycles,GafferImage
out=pathlib.Path(os.environ["ATLAS_ENGINE_SAMPLE"])
manifest=json.loads((out/"sample.json").read_text())
def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def write(report):(out/"gaffer-report.json").write_text(json.dumps(report,indent=2,allow_nan=False)+"\n")
report={"schema":"atlas.engine01.sample-probe/v1","status":"PENDING","sourceRevision":os.environ["ATLAS_EXACT_HEAD"],"masterSha256":manifest["masterSha256"],"masterModified":False,"studentAuthorized":False,"publishable":False,"artisticApproval":False,"renders":{},"scope":"Geometry/camera and reversible light probe; diffuse proxies, not a faithful material transfer or cinematic approval."}
write(report)
try:
    require(manifest["status"]=="EXPORTED" and manifest["sourceRevision"]==report["sourceRevision"],"sample receipt")
    require(sha(out/"atlas-sample.usdc")==manifest["usdSha256"],"USD integrity")
    s=Gaffer.ScriptNode();s["reader"]=GafferScene.SceneReader();s["reader"]["fileName"].setValue(str(out/"atlas-sample.usdc"))
    scene=s["reader"]["out"]
    def walk(p="/"):
        for n in scene.childNames(p):
            q=p.rstrip("/")+"/"+str(n)
            yield q,scene.object(q)
            yield from walk(q)
    entries=list(walk())
    meshes={p:o for p,o in entries if isinstance(o,IECoreScene.MeshPrimitive)}
    cameras={p:o for p,o in entries if isinstance(o,IECoreScene.Camera)}
    report["importedPaths"]=list(meshes)+list(cameras);write(report)
    require(len(cameras)==1,"camera inventory")
    cp,cam=next(iter(cameras.items()))
    require("AtlasCamera" in cp,"source camera identity")
    require(len(meshes)==len(manifest["objects"]),"mesh inventory count")
    mapped={}
    previous=scene
    for i,row in enumerate(manifest["objects"]):
        matches=[p for p in meshes if row["alias"] in p.split("/") or row["alias"]+"_mesh" in p.split("/")]
        require(len(matches)==1,"mesh mapping "+row["alias"])
        path=matches[0];obj=meshes[path]
        require(path not in mapped,"duplicate path")
        require(len(obj.verticesPerFace)==row["faces"],"face count mismatch "+row["alias"])
        require(len(obj["P"].data)==row["vertices"],"vertex count mismatch "+row["alias"])
        bound=scene.bound(path);m=scene.fullTransform(path)
        points=[imath.V3f(x,y,z)*m for x in (bound.min().x,bound.max().x) for y in (bound.min().y,bound.max().y) for z in (bound.min().z,bound.max().z)]
        # Exact world-space geometry extents use the actual mesh points rather than
        # transformed AABB corners (rotated local boxes may overestimate).
        pts=[v*m for v in obj["P"].data]
        ext=sorted(max(v[j] for v in pts)-min(v[j] for v in pts) for j in range(3))
        require(all(abs(a-b)<max(.002,abs(b)*.002) for a,b in zip(ext,row["worldExtent"])),"scale/bounds mismatch "+row["alias"])
        mapped[path]={"source":row["name"],"faces":row["faces"],"vertices":row["vertices"],"extent":ext,"materialProxy":row["material"]}
        key="shader"+str(i);f="filter"+str(i);a="assign"+str(i)
        s[key]=GafferCycles.CyclesShader();s[key].loadShader("diffuse_bsdf");s[key]["parameters"]["color"].setValue(imath.Color3f(*row["material"]["rgb"]))
        s[f]=GafferScene.PathFilter();s[f]["paths"].setValue(IECore.StringVectorData([path]))
        s[a]=GafferScene.ShaderAssignment();s[a]["in"].setInput(previous);s[a]["filter"].setInput(s[f]["out"]);s[a]["shader"].setInput(s[key]["out"]["BSDF"]);previous=s[a]["out"]
    report["mapping"]=mapped;report["camera"]={"path":cp,"focalLength":cam.getFocalLength(),"sourceLens":manifest["camera"]["lens"]};write(report)
    cm=scene.fullTransform(cp)
    s["lights"]=GafferScene.Parent();s["lights"]["in"].setInput(previous);s["lights"]["parent"].setValue("/")
    for name,loc,color,intensity,size in (("key",(-3,5,-5),(1,.82,.60),1300,2.5),("fill",(4,2,-4),(.76,.86,1),900,3.0)):
        s[name]=GafferCycles.CyclesLight();s[name].loadShader("point_light");s[name]["name"].setValue(name)
        s[name]["transform"]["translate"].setValue(imath.V3f(*loc)*cm)
        s[name]["parameters"]["color"].setValue(imath.Color3f(*color));s[name]["parameters"]["intensity"].setValue(intensity);s[name]["parameters"]["size"].setValue(size)
        s["lights"]["children"].next().setInput(s[name]["out"])
    def option(node,k,v):
        node["options"][k]["value"].setValue(v);node["options"][k]["enabled"].setValue(True)
    s["standard"]=GafferScene.StandardOptions();s["standard"]["in"].setInput(s["lights"]["out"])
    option(s["standard"],"render:camera",cp);option(s["standard"],"render:resolution",imath.V2i(*manifest["resolution"]))
    s["cycles"]=GafferCycles.CyclesOptions();s["cycles"]["in"].setInput(s["standard"]["out"])
    for k,v in (("cycles:device","CPU"),("cycles:session:samples",16),("cycles:session:threads",2),("cycles:integrator:max_bounce",4)):option(s["cycles"],k,v)
    s["outputs"]=GafferScene.Outputs();s["outputs"]["in"].setInput(s["cycles"]["out"]);s["outputs"].addOutput("beauty",IECoreScene.Output(str(out/"gaffer-baseline.exr"),"exr","rgba",{}))
    s["render"]=GafferScene.Render();s["render"]["in"].setInput(s["outputs"]["out"]);s["render"]["renderer"].setValue("Cycles")
    s["fileName"].setValue(str(out/"gaffer-sample.gfr"));s.save()
    def protected():
        sc=s["lights"]["out"]
        return {p:[str(sc.objectHash(p)),str(sc.transformHash(p)),str(sc.attributesHash(p))] for p in list(mapped)+[cp]}
    fixed=protected()
    key=s["key"]["parameters"]["intensity"];fill=s["fill"]["parameters"]["intensity"];base=(key.getValue(),fill.getValue())
    def render(name):
        path=out/(name+".exr");s["outputs"]["outputs"][0]["fileName"].setValue(str(path))
        t=time.monotonic()
        with s.context():s["render"]["task"].execute()
        require(path.is_file() and path.stat().st_size>0,"missing render")
        reader=GafferImage.ImageReader();reader["fileName"].setValue(str(path));sampler=GafferImage.ImageSampler();sampler["image"].setInput(reader["out"])
        values=[]
        for y in range(12,300,12):
            for x in range(12,480,12):
                sampler["pixel"].setValue(imath.V2f(x+.5,y+.5));c=sampler["color"].getValue();values.extend(float(c[i]) for i in range(3))
        require(all(math.isfinite(v) for v in values) and max(values)>0,"black/nonfinite render")
        require(protected()==fixed,"protected geometry/camera/material changed")
        report["renders"][name]={"sha256":sha(path),"seconds":round(time.monotonic()-t,3),"meanLinearRGB":sum(values)/len(values),"key":key.getValue(),"fill":fill.getValue()};write(report)
        return values
    a=render("gaffer-baseline")
    try:
        key.setValue(base[0]*1.45);fill.setValue(base[1]*.45)
        b=render("gaffer-light-01")
    finally:key.setValue(base[0]);fill.setValue(base[1])
    c=render("gaffer-restored")
    delta=sum(abs(x-y) for x,y in zip(a,b))/len(a);rollback=max(abs(x-y) for x,y in zip(a,c))
    require(delta>1e-5 and rollback<1e-5,"effect/rollback")
    require(sha(out/"atlas-sample.usdc")==manifest["usdSha256"],"USD mutated")
    report.update(status="PASS_SAMPLE_GEOMETRY_PROXY_ONLY",meanAbsoluteRGBDelta=delta,maxRollbackSampleDelta=rollback,meshCount=len(mapped),materialFidelityQualified=False,artisticApproval=False)
    write(report);print("ENGINE01_P1_GAFFER",report["status"],len(mapped),flush=True)
except Exception as e:
    report.update(status="FAIL",error=repr(e));write(report);raise
