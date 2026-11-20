"""AWC-C: deterministic, read-only world composition.

Select bounded observations by goal, resolve prerequisite closure, delegate
parameter proposals to ASD and budgets to ASC. No renderer or tool execution.
"""
import argparse, importlib.util, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def module(path,name):
    spec=importlib.util.spec_from_file_location(name,ROOT/path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
ev=module("scripts/atlas-world-evidence.py","awc_evidence")
asd=module("scripts/scene-director.py","awc_asd_compose")
asc=module("scripts/atlas-scene-compiler-plan.py","awc_asc_compose")
require=ev.require

# Selection rules, not new parameter, material, or rendering authorities.
# A WebGL material goal needs the actual bay and its Blender prerequisites.
GOALS={
    "reference":{"blender":None,"webgl":None},
    "geometry-reduction":{"blender":"library.pages.reduction"},
    "material-fidelity":{"blender":"library.walnut.lightmap","webgl":"library.bay.navigation"},
    "color-fidelity":{"webgl":"library.agx.display"},
    "interactive-preview":{"webgl":"library.bay.navigation"},
}
CONTEXTS={"blender":{"blender-master"},"webgl":{"native-preview","bay-preview"}}
REQUEST_KEYS={"schema","world","target","context","device","goals","changes","expectedSources",
              "expectedStateSha256","reducedMotion","motionOptIn"}

def inputs():
    c,base=ev.load_catalog()
    index=ev.strict_json((ROOT/ev.INDEX).read_bytes())
    evidence=ev.validate(index,c,base)
    registry,master=asd.load_sources(ROOT)
    policy=ev.strict_json((ROOT/"ops/atlas-scene-package/asc01-production-policy.json").read_bytes())
    production=asc.plan(policy,master)
    return c,index,evidence,registry,master,policy,production

def identities(c,index,registry,master,policy):
    return {"catalog":asd.digest(c),"evidenceIndex":asd.digest(index),
            "parameterRegistry":asd.digest(registry),"masterReceipt":asd.digest(master),
            "productionPolicy":asd.digest(policy),"masterSha256":master["file"]["sha256"]}

def request_for(data,target,context,device,goals,changes,*,reduced=True,opt_in=False):
    c,index,_,registry,master,policy,_=data
    baseline={k:v["baseline"] for k,v in asd.specs(registry,master,target).items()}
    return {"schema":"atlas.awc.compose-request/v1","world":"library.reference",
            "target":target,"context":context,"device":device,"goals":goals,"changes":changes,
            "expectedSources":identities(c,index,registry,master,policy),
            "expectedStateSha256":asd.digest(baseline),"reducedMotion":reduced,"motionOptIn":opt_in}

def compose(request,*,archives=None):
    c,index,evidence,registry,master,policy,production=inputs()
    ev.shape(request,REQUEST_KEYS,"composition request shape")
    require(request["schema"]=="atlas.awc.compose-request/v1","request schema")
    require(request["world"]==c["presets"][0]["world"],"world not executable or unknown")
    target=request["target"];context=request["context"];device=request["device"]
    require(type(target) is str and target in CONTEXTS,"unknown target")
    require(type(context) is str and context in CONTEXTS[target],"target/context mismatch")
    require((target=="blender" and device is None) or
            (target=="webgl" and type(device) is str and device in production["profiles"]),"device profile mismatch")
    sources=identities(c,index,registry,master,policy)
    require(request["expectedSources"]==sources,"stale composition sources")
    require(type(request["reducedMotion"]) is bool and type(request["motionOptIn"]) is bool,"explicit accessibility context")
    goals=ev.awc.strings(request["goals"],"goals")
    require(goals,"empty goals")
    require(goals<=set(GOALS),"unknown production goal")
    require(all(target in GOALS[g] for g in goals),"goal unsupported for target")
    ps=asd.specs(registry,master,target)
    baseline={k:v["baseline"] for k,v in ps.items()}
    require(request["expectedStateSha256"]==asd.digest(baseline),"stale baseline")
    changes=request["changes"];require(type(changes) is dict,"changes object")
    require(not changes or context!="bay-preview","bay parameter adapter not qualified")
    parameter_plan=None
    if changes:
        # ASD's native-preview binding is not the separate bay laboratory.
        parameter_plan=asd.make_plan(registry,master,{
            "target":target,"masterSha256":sources["masterSha256"],
            "expectedStateSha256":request["expectedStateSha256"],"changes":changes,
            "reducedMotion":request["reducedMotion"],"motionOptIn":request["motionOptIn"]})
    profiles={p["id"]:p for p in index["profiles"]}
    selected={}
    for g in sorted(goals):
        pid=GOALS[g][target]
        if pid:
            require(pid in profiles and target in profiles[pid]["targets"],"goal profile mismatch")
            selected.setdefault(pid,[]).append(g)
    ordered=[];visited=set();active=set()
    def visit(pid):
        require(pid in profiles and pid not in active,"unresolved/cyclic prerequisite")
        if pid in visited:return
        active.add(pid)
        for dep in sorted(profiles[pid]["dependencies"]):visit(dep)
        active.remove(pid);visited.add(pid);ordered.append(pid)
    for pid in sorted(selected):visit(pid)
    observed=ev.replay(index,archives) if archives is not None else None
    steps=[]
    for pid in ordered:
        p=profiles[pid];facts=p["facts"]
        # Cross-target prerequisites are previous production evidence, never
        # instructions to invoke another renderer.
        steps.append({"id":pid,"entry":p["entry"],"role":"SELECTED" if pid in selected else "PREREQUISITE",
                      "selectedFor":selected.get(pid,[]),"scope":p["scope"],"targets":p["targets"],
                      "crossTarget":target not in p["targets"],"dependsOn":sorted(p["dependencies"]),
                      "mode":"REFERENCE_ONLY","limitations":p["limitations"],
                      "facts":observed[pid] if observed is not None else {k:v[2] for k,v in facts.items()},
                      "provenance":{k:{"receipt":v[0],"pointer":v[1],
                          "revision":index["archives"][index["receipts"][v[0]]["archive"]]["revision"],
                          "receiptSha256":index["receipts"][v[0]]["sha256"]} for k,v in facts.items()}})
    blockers=[]
    if archives is None:blockers.append("ORIGINAL_ARCHIVES_NOT_REPLAYED")
    if any(p["entry"] in evidence["blockedEntries"] for p in steps):
        blockers.append("ARCHITECTURE_OR_MATERIAL_ADAPTER_NOT_QUALIFIED")
    if target=="webgl" and context=="native-preview" and steps:
        blockers.append("BAY_LABORATORY_EVIDENCE_NOT_NATIVE_RUNTIME_BINDING")
    if context=="bay-preview":
        blockers.append("BAY_PARAMETER_ADAPTER_NOT_QUALIFIED")
    if parameter_plan and parameter_plan["dependencies"]:
        blockers.append("ASD_DEPENDENCY_REQUIRED")
    if parameter_plan and target=="blender" and "camera.active" in changes and steps:
        blockers.append("FIXED_VIEW_EVIDENCE_NOT_TRANSFERRED_TO_NEW_CAMERA")
    budget=production["profiles"][device] if target=="webgl" else None
    comparison=None
    if budget and "library.bay.navigation" in visited:
        triangles=profiles["library.bay.navigation"]["facts"]["triangles"][2]
        if observed is not None:triangles=observed["library.bay.navigation"]["triangles"]
        comparison={"scope":"single bay only; not the full library","observedTriangles":triangles,
                    "visibleTrianglesTarget":budget["visibleTrianglesTarget"],
                    "withinTarget":triangles<=budget["visibleTrianglesTarget"],
                    "physicalDeviceQualified":False,"otherMetricsMeasured":False}
        if not comparison["withinTarget"]:blockers.append("OBSERVED_BAY_EXCEEDS_TRIANGLE_TARGET")
    tool_readiness=[]
    for name in policy["tools"]:
        relevant=name=="Blender/Cycles" and any("blender" in p["targets"] for p in steps)
        tool_readiness.append({"tool":name,"observedInSelectedProfiles":relevant,
                               "availability":"NOT_CHECKED","versionLicenseCompatibility":"NOT_QUALIFIED"})
    if target=="webgl":
        tool_readiness.append({"tool":policy["pilot"]["renderer"],
            "observedInSelectedProfiles":any("webgl" in p["targets"] for p in steps),
            "availability":"NOT_CHECKED","versionLicenseCompatibility":"NOT_QUALIFIED"})
    # Not an executable command list. All tool and artistic gates remain ASC's.
    result={"schema":"atlas.awc.composition-plan/v1","mode":"PLAN_ONLY","status":"PLAN_FOR_REVIEW",
            "world":request["world"],"target":target,"context":context,"device":device,
            "goals":sorted(goals),"sources":sources,"archiveReplay":observed is not None,
            "steps":steps,"parameterPlan":parameter_plan,"baseline":baseline,
            "candidate":parameter_plan["candidate"] if parameter_plan else baseline,
            "rollback":baseline,"budget":budget,"geometryComparison":comparison,
            "toolReadiness":tool_readiness,"blockers":sorted(set(blockers)),
            "unmetProductionEvidence":production["unmetEvidence"],
            "protected":registry["protected"],"authority":evidence["authority"],
            "toolExecutionAuthorized":False,"rendererExecutionAuthorized":False,
            "paidServicesAuthorized":False,"readyForExecution":False}
    result["planSha256"]=asd.digest(result)
    return result

def example(name):
    d=inputs()
    if name=="bay":
        return request_for(d,"webgl","bay-preview","mobile",["interactive-preview","material-fidelity","color-fidelity"],{})
    if name=="native":
        return request_for(d,"webgl","native-preview","desktop",["reference"],{"camera.orbit":.11})
    if name=="blender":
        return request_for(d,"blender","blender-master",None,["geometry-reduction","material-fidelity"],{"camera.active":"detail"})
    raise ValueError("unknown example")

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    group=parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--request",type=Path);group.add_argument("--example",choices=("bay","native","blender"))
    group.add_argument("--template",choices=("bay","native","blender"))
    parser.add_argument("--archives",type=Path);parser.add_argument("--report",type=Path)
    args=parser.parse_args()
    if args.template:
        require(args.archives is None,"template does not replay archives")
        result=example(args.template)
    else:
        req=ev.strict_json(args.request.read_bytes()) if args.request else example(args.example)
        result=compose(req,archives=args.archives)
    raw=json.dumps(result,ensure_ascii=False,sort_keys=True,indent=2,allow_nan=False)+"\n"
    if args.report:args.report.write_text(raw)
    print(raw,end="")

if __name__=="__main__":main()
