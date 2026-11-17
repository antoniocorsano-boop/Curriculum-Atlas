"""A5.4a: source-locked material refinement; unchanged geometry, cameras and navigation."""
import hashlib,sys
from pathlib import Path
base=Path(__file__).resolve().parent
PARENT="library-master-arch.py"
PARENT_BLOB="de6d9bdd6a73528eca1e49d228af61738d2335da"
END='exec(compile(code,__file__,"exec"),globals())'
PHASE="C3.3A5.4a"
def once(code,old,new):
    assert code.count(old)==1,old[:120]
    return code.replace(old,new,1)
def parent_source(verify):
    p=base/PARENT;raw=p.read_bytes()
    assert hashlib.sha1(b"blob "+str(len(raw)).encode()+b"\x00"+raw).hexdigest()==PARENT_BLOB
    wrapper=once(raw.decode(),END,"__captured_source__=code")
    old=sys.argv
    try:
        sys.argv=[str(p),"--verify",old[2]] if verify else [str(p)]
        ns={"__file__":str(p),"__name__":"__atlas_parent__"}
        exec(compile(wrapper,str(p),"exec"),ns)
        return ns["__captured_source__"]
    finally:sys.argv=old

# Scalar values use glTF-compatible Principled inputs; no new images or materials.
SCALARS = """
# A5.4a — calibrated contrast between polished floor, satin metal and matte upholstery.
material_profile={}
def tune(name,values):
    mat=bpy.data.materials[name];p=mat.node_tree.nodes.get("Principled BSDF")
    assert p is not None
    for key,value in values.items():
        assert not p.inputs[key].is_linked,(name,key)
        p.inputs[key].default_value=value
    material_profile[name]={key:float(p.inputs[key].default_value) for key in values}
tune("Polished warm stone",{"Roughness":.23,"Coat Weight":.32,"Coat Roughness":.15})
tune("Atlas blue marble",{"Roughness":.20,"Coat Weight":.24,"Coat Roughness":.16})
tune("Brushed brass",{"Metallic":.88,"Roughness":.34})
tune("Cupola satin gold",{"Metallic":.80,"Roughness":.32})
tune("Reading upholstery linen",{"Roughness":.84})
tune("Portal midnight enamel",{"Roughness":.29,"Metallic":.16})
tune("Portal primary blue enamel",{"Roughness":.27,"Metallic":.16})
"""
# Offline-only microstructure is applied AFTER GLB export. Photographic maps stay intact.
MICRO = """
# Offline Cycles study: subtle meter-scale microstructure, layered over photographic normals.
# No claim of browser parity; procedural microstructure needs separate texture baking.
offline_micro={}
def grain(name,scale,strength,distance,rough_range=None):
    mat=bpy.data.materials[name];t=mat.node_tree;p=t.nodes.get("Principled BSDF")
    geo=t.nodes.new("ShaderNodeNewGeometry");geo.label="A5.4a world position"
    noise=t.nodes.new("ShaderNodeTexNoise");noise.label="A5.4a fine surface"
    noise.inputs["Scale"].default_value=scale;noise.inputs["Detail"].default_value=2.0
    t.links.new(geo.outputs["Position"],noise.inputs["Vector"])
    bump=t.nodes.new("ShaderNodeBump");bump.label="A5.4a micro relief"
    bump.inputs["Strength"].default_value=strength;bump.inputs["Distance"].default_value=distance
    normal=p.inputs["Normal"]
    if normal.is_linked:
        link=normal.links[0];source=link.from_socket;t.links.remove(link);t.links.new(source,bump.inputs["Normal"])
    t.links.new(noise.outputs["Fac"],bump.inputs["Height"]);t.links.new(bump.outputs["Normal"],normal)
    if rough_range is not None:
        r=p.inputs["Roughness"];assert not r.is_linked,name
        ramp=t.nodes.new("ShaderNodeMapRange");ramp.label="A5.4a roughness variation"
        ramp.inputs["To Min"].default_value=rough_range[0];ramp.inputs["To Max"].default_value=rough_range[1]
        t.links.new(noise.outputs["Fac"],ramp.inputs["Value"]);t.links.new(ramp.outputs["Result"],r)
    offline_micro[name]={"scale":scale,"strength":strength,"distance":distance,"roughnessRange":rough_range}
grain("Warm limestone",24,.18,.012)
grain("Polished warm stone",44,.13,.003,(.19,.27))
grain("Atlas blue marble",55,.09,.002,(.17,.23))
grain("Walnut",68,.16,.006)
grain("Recessed walnut",68,.13,.005)
grain("Brushed brass",120,.08,.0015,(.29,.39))
grain("Reading upholstery linen",145,.25,.004,(.76,.92))
# Preserve all established light, camera and placement contracts.
material_study={"phase":"C3.3A5.4a","parent":"C3.3A5.3b","parentBlob":"de6d9bdd6a73528eca1e49d228af61738d2335da","geometryChanged":False,"camerasChanged":False,"lightRigChanged":False,"sourceAssetsChanged":False,"scalarProfiles":material_profile,"offlineMicrostructure":offline_micro,"proceduralMicrostructureExported":False,"bayVariantsExported":False,"browserQualified":False,"artisticApproval":False,"studentAuthorized":False}
(out/"material-study.json").write_text(json.dumps(material_study,indent=2)+"\\n")
"""
# The embedded source strings above must produce a literal newline in the JSON receipt.
if len(sys.argv)>1 and sys.argv[1]=="--verify":
    code=parent_source(True)
    code=once(code,'m["phase"]=="C3.3A5.3b"','m["phase"]=="C3.3A5.4a"')
    code=once(code,'m["floorRoughness"]==.18','m["floorRoughness"]==.23')
    code=once(code,'"phase":"C3.3A5.3b"','"phase":"C3.3A5.4a"')
    code=once(code,'(p/"library-verification.json").write_text', '''study=json.loads((p/"material-study.json").read_text())
assert study["phase"]==m["phase"] and study["parent"]=="C3.3A5.3b" and study["parentBlob"]=="de6d9bdd6a73528eca1e49d228af61738d2335da"
assert "material-study.json" in m["files"] and m["materialRefinement"] is True
assert all(study[k] is False for k in ("geometryChanged","camerasChanged","lightRigChanged","sourceAssetsChanged","proceduralMicrostructureExported","bayVariantsExported","browserQualified","artisticApproval","studentAuthorized"))
assert len(study["scalarProfiles"])==7 and len(study["offlineMicrostructure"])==7
for name,rough in (("Polished warm stone",.23),("Atlas blue marble",.20)):
    mat=next(q for q in d["materials"] if q.get("name")==name)
    assert math.isclose(mat["pbrMetallicRoughness"]["roughnessFactor"],rough,abs_tol=1e-5)
linen=next(q for q in sd["materials"] if q.get("name")=="Reading upholstery linen")
assert math.isclose(linen["pbrMetallicRoughness"]["roughnessFactor"],.84,abs_tol=1e-5)
assert all(.0<q["strength"]<=.3 and .0<q["distance"]<=.012 for q in study["offlineMicrostructure"].values())
receipt.update({"materialRefinement":True,"scalarProfiles":7,"offlineMicrostructureProfiles":7,"proceduralMicrostructureExported":False})
(p/"library-verification.json").write_text''')
    sys.argv=[sys.argv[0],sys.argv[2]]
else:
    code=parent_source(False)
    code=once(code,"# Export architecture separately; repeating bay data is not included in shell payload.",SCALARS+"\n# Export architecture separately; repeating bay data is not included in shell payload.")
    code=once(code,'world=bpy.data.worlds.new("Locked photographic daylight")',MICRO+'\nworld=bpy.data.worlds.new("Locked photographic daylight")')
    code=once(code,'"phase":"C3.3A5.3b"','"phase":"C3.3A5.4a"')
    code=once(code,'"floorRoughness":.18','"floorRoughness":.23,"materialRefinement":True')
    code=once(code,'"arch-refinement.json","arch-detail.png"):','"arch-refinement.json","arch-detail.png","material-study.json"):')
exec(compile(code,__file__,"exec"),globals())
