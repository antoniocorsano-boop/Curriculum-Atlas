"""P2C3-A: controlled material ablation in the real library (Cycles only).

Compare original, camera-only baked diffuse, and a bounded hybrid retaining
the original dielectric specular response. Never edit original materials.
"""
import hashlib,json,os
from pathlib import Path
import bpy
import numpy as np

def require(ok,msg):
    if not ok:raise RuntimeError(msg)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def prop(node,name):
    s=node.inputs.get(name)
    require(s is not None,"missing Principled socket "+name)
    v=s.default_value
    return {"linked":s.is_linked,"value":float(v) if isinstance(v,(int,float)) else list(v),
            "sources":[{"node":l.from_node.name,"type":l.from_node.type,"socket":l.from_socket.name} for l in s.links]}
def zero(node,name):
    s=node.inputs.get(name)
    require(s is not None and not s.is_linked and abs(float(s.default_value))<1e-8,"unsupported material component "+name)
def graph(material):
    t=material.node_tree
    outputs=[n for n in t.nodes if n.type=="OUTPUT_MATERIAL" and n.is_active_output and n.target in ("ALL","CYCLES")]
    require(len(outputs)==1,"ambiguous active output")
    o=outputs[0];s=o.inputs["Surface"]
    require(len(s.links)==1 and s.links[0].from_node.type=="BSDF_PRINCIPLED","unsupported shader topology")
    require(not o.inputs["Volume"].is_linked and not o.inputs["Displacement"].is_linked,"unsupported volume/displacement")
    p=s.links[0].from_node
    for k in ("Metallic","Transmission Weight","Subsurface Weight","Sheen Weight","Emission Strength"):zero(p,k)
    alpha=p.inputs["Alpha"]
    require(not alpha.is_linked and float(alpha.default_value)==1,"opaque dielectric only")
    return t,o,p
def copy_inputs(t,old,new):
    for src in old.inputs:
        dst=new.inputs.get(src.name)
        if dst is None or not hasattr(src,"default_value") or not hasattr(dst,"default_value"):continue
        v=src.default_value
        dst.default_value=tuple(v) if hasattr(v,"__len__") and not isinstance(v,str) else v
        for link in src.links:t.links.new(link.from_socket,dst)
def set_input(t,node,name,value):
    s=node.inputs[name]
    for link in list(s.links):t.links.remove(link)
    s.default_value=value
def make(material,image,uv_name,hybrid):
    clone=material.copy()
    clone.name="ASC P2C3 "+("hybrid " if hybrid else "diffuse ")+material.name
    try:
        t,o,p=graph(clone)
        uv=t.nodes.new("ShaderNodeUVMap");uv.uv_map=uv_name
        tex=t.nodes.new("ShaderNodeTexImage");tex.image=image;tex.extension="EXTEND";tex.interpolation="Linear"
        em=t.nodes.new("ShaderNodeEmission");em.inputs["Strength"].default_value=1
        t.links.new(uv.outputs["UV"],tex.inputs["Vector"]);t.links.new(tex.outputs["Color"],em.inputs["Color"])
        candidate=em.outputs[0]
        if hybrid:
            spec=t.nodes.new("ShaderNodeBsdfPrincipled")
            spec.distribution=p.distribution
            copy_inputs(t,p,spec)
            set_input(t,spec,"Base Color",(0,0,0,1))
            set_input(t,spec,"Emission Color",(0,0,0,1));set_input(t,spec,"Emission Strength",0)
            # Only the black dielectric's remaining reflection lobe is added.
            # This is an approximation, not a claim of exact BSDF decomposition.
            add=t.nodes.new("ShaderNodeAddShader")
            t.links.new(em.outputs[0],add.inputs[0]);t.links.new(spec.outputs[0],add.inputs[1])
            candidate=add.outputs[0]
        lp=t.nodes.new("ShaderNodeLightPath");mix=t.nodes.new("ShaderNodeMixShader")
        t.links.new(lp.outputs["Is Camera Ray"],mix.inputs[0])
        t.links.new(p.outputs[0],mix.inputs[1]);t.links.new(candidate,mix.inputs[2])
        t.links.new(mix.outputs[0],o.inputs["Surface"])
        return clone
    except Exception:
        bpy.data.materials.remove(clone);raise
def measure(ref,candidate,coords):
    d=np.abs(ref[:,:,:3]-candidate[:,:,:3])
    a=d[coords[:,1],coords[:,0],:]
    return {"samples":len(coords),"mean":float(a.mean()),"p95":float(np.percentile(a,95)),
            "max":float(a.max()),"frameMean":float(d.mean())}
def run(out,scene,obj,source,derived,uv,transferred,reference,render,report):
    out=Path(out)
    oracle_path=Path(os.environ["ATLAS_P2C3_ORACLE"])
    oracle=json.loads(oracle_path.read_text())
    require(oracle["revision"]=="2cde18aa558edbcf612de535491daa53049bb6cc" and oracle["masterSha256"]==report["masterSha256"],"oracle identity")
    require(oracle["counts"]["target"]==1068,"qualified sample count")
    require(report["target"]["object"]=="Library bay 04-0-Bay Recessed walnut" and report["target"]["view"]=="context","target identity")
    coords=np.array([(s["x"],s["y"]) for s in oracle["samples"] if s["stable"] and s["kind"]=="target"],dtype=int)
    require(len(coords)==1068 and reference.shape[:2]==(480,640),"sample coordinates")
    mats=list(source.materials)
    require(len(mats)==1 and mats[0].name=="Recessed walnut","single known material")
    t,o,p=graph(mats[0])
    names=("Base Color","Roughness","Normal","Specular IOR Level","IOR","Coat Weight","Coat Roughness")
    inventory={k:prop(p,k) for k in names}
    source_nodes=[{"name":n.name,"type":n.type} for n in t.nodes]
    # Restore the source's original active UV for material evaluation. The
    # baked image always samples its dedicated UV layer by explicit name.
    primary=next((x.name for x in source.uv_layers if x.active_render),None)
    if primary:
        derived.uv_layers[primary].active_render=True
        derived.uv_layers.active=derived.uv_layers[primary]
    clones=[];before=list(derived.materials)
    result={"schema":"atlas.asc01.material-ablation/v1","revision":report["revision"],"status":"PENDING",
            "masterSha256":report["masterSha256"],"oracleSha256":sha(oracle_path),"target":report["target"],
            "sourceMaterial":{"name":mats[0].name,"nodes":source_nodes,"inputs":inventory,"originalRenderUV":primary},
            "geometryTriangles":len(derived.loop_triangles),"specularApproximation":"black dielectric lobe plus baked diffuse; camera rays only",
            "artisticApproval":False,"webglQualified":False,"publishable":False}
    def write():
        (out/"material-ablation.json").write_text(json.dumps(result,indent=2,allow_nan=False)+"\n")
    try:
        derived.materials[0]=mats[0];bpy.context.view_layer.update()
        control=render("material-control")
        control_stats=measure(reference,control,coords)
        result["control"]=control_stats;write()
        require(control_stats["frameMean"]<=.0002 and control_stats["mean"]<=.001,"derived mesh/original shader control drift")
        for hybrid,name in ((False,"material-diffuse-camera"),(True,"material-hybrid-camera")):
            m=make(mats[0],transferred,uv.name,hybrid);clones.append(m)
            derived.materials[0]=m;bpy.context.view_layer.update()
            a=render(name)
            result[name]=measure(reference,a,coords);write()
        d=result["material-diffuse-camera"]["mean"];h=result["material-hybrid-camera"]["mean"]
        result["improvementFraction"]=(d-h)/d if d>1e-12 else 0
        result["decision"]="CANDIDATE_FOR_VISUAL_REVIEW" if d>1e-12 and h<d*.95 else "NO_DEMONSTRATED_IMPROVEMENT"
        result["status"]="PASS_MATERIAL_ABLATION"
        result["normalLinked"]=inventory["Normal"]["linked"]
        result["roughnessLinked"]=inventory["Roughness"]["linked"]
        result["imageSha256"]={n:report["renders"][n]["sha256"] for n in ("material-control","material-diffuse-camera","material-hybrid-camera")}
        write()
        print("ASC-P2C3A",json.dumps(result),flush=True)
    except Exception as e:
        result.update(status="FAIL",error=repr(e));write();raise
    finally:
        for i,m in enumerate(before):derived.materials[i]=m
        for m in clones:bpy.data.materials.remove(m)
        bpy.context.view_layer.update()
