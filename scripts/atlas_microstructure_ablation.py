"""P2C3B: bounded microstructure factorial and sampled UV island spacing.

Keep the baked diffuse fixed. Vary only the camera-ray reflection lobe.
This is not a material exporter, a normal bake, or a WebGL qualification.
"""
import hashlib,json,math
from pathlib import Path
import bpy
import numpy as np
from atlas_material_ablation import require,sha,measure,set_input,make,graph

def socket_record(s):
    v=getattr(s,"default_value",None)
    if v is not None and not isinstance(v,(str,int,float,bool)):
        try:v=list(v)
        except TypeError:v=str(v)
    return {"value":v,"links":[{"node":l.from_node.name,"socket":l.from_socket.name} for l in s.links]}

def source_inventory(material):
    t,_,p=graph(material)
    bump=p.inputs["Normal"].links[0].from_node
    require(bump.type=="BUMP" and bump.inputs["Normal"].is_linked,"expected combined normal/bump")
    normal=bump.inputs["Normal"].links[0].from_node
    require(normal.type=="NORMAL_MAP" and normal.space=="TANGENT","expected tangent normal map")
    require(p.inputs["Roughness"].is_linked,"expected roughness texture")
    rough=p.inputs["Roughness"].links[0].from_node
    require(rough.type=="TEX_IMAGE" and rough.image is not None,"expected roughness image")
    imgs=[]
    for n in sorted((n for n in t.nodes if n.type=="TEX_IMAGE"),key=lambda n:n.name):
        im=n.image
        require(im is not None and im.size[0]>0 and im.size[1]>0,"missing image")
        packed=im.packed_file
        imgs.append({"node":n.name,"name":im.name,"size":list(im.size),"colorspace":im.colorspace_settings.name,
                     "packed":packed is not None,"packedSha256":hashlib.sha256(packed.data).hexdigest() if packed else None,
                     "interpolation":n.interpolation,"extension":n.extension,"vector":socket_record(n.inputs["Vector"])})
    return {"images":imgs,"normalMap":{"node":normal.name,"space":normal.space,"uvMap":normal.uv_map,
                     "inputs":{s.name:socket_record(s) for s in normal.inputs}},
            "bump":{"node":bump.name,"invert":bump.invert,"inputs":{s.name:socket_record(s) for s in bump.inputs}},
            "roughness":{"node":rough.name,"default":float(p.inputs["Roughness"].default_value)},
            "nodes":[{"name":n.name,"type":n.type} for n in t.nodes],
            "links":[{"from":l.from_node.name,"out":l.from_socket.name,"to":l.to_node.name,"in":l.to_socket.name} for l in t.links]}

def variant(material,image,uv_name,normal_mode,rough_mode):
    m=make(material,image,uv_name,True)
    try:
        t=m.node_tree
        original=t.nodes.get("Principled BSDF")
        lobes=[n for n in t.nodes if n.type=="BSDF_PRINCIPLED" and n!=original]
        require(len(lobes)==1 and original is not None,"ambiguous reflection lobe")
        spec=lobes[0]
        if normal_mode!="full":
            links=list(spec.inputs["Normal"].links)
            require(len(links)==1 and links[0].from_node.type=="BUMP","expected bump link")
            bump=links[0].from_node
            source=bump.inputs["Normal"].links[0].from_socket
            require(source.node.type=="NORMAL_MAP","expected normal map")
            for link in links:t.links.remove(link)
            if normal_mode=="map":t.links.new(source,spec.inputs["Normal"])
            elif normal_mode!="flat":raise RuntimeError("unknown normal mode")
        if rough_mode=="constant":
            set_input(t,spec,"Roughness",float(original.inputs["Roughness"].default_value))
        else:require(rough_mode=="texture","unknown roughness mode")
        return m
    except Exception:
        bpy.data.materials.remove(m);raise

def island_spacing(mesh,uv,size=512):
    # Union triangles only across shared mesh edges with matching UV corners.
    mesh.calc_loop_triangles()
    tris=list(mesh.loop_triangles);parents=list(range(len(tris)));edges={}
    def root(i):
        while parents[i]!=i:parents[i]=parents[parents[i]];i=parents[i]
        return i
    def union(i,j):
        i,j=root(i),root(j)
        if i!=j:parents[max(i,j)]=min(i,j)
    def corner(loop):
        return (mesh.loops[loop].vertex_index,*[round(float(x),7) for x in uv.data[loop].uv])
    for i,tri in enumerate(tris):
        corners=[corner(l) for l in tri.loops]
        for j in range(3):
            key=tuple(sorted((corners[j],corners[(j+1)%3])))
            if key in edges:union(i,edges[key])
            else:edges[key]=i
    groups={r:i+1 for i,r in enumerate(sorted({root(i) for i in range(len(tris))}))}
    labels=np.zeros((size,size),np.int32);cross=0
    for i,tri in enumerate(tris):
        p=np.array([tuple(uv.data[j].uv) for j in tri.loops],dtype=np.float64)
        v,w=p[1]-p[0],p[2]-p[0];det=v[0]*w[1]-v[1]*w[0]
        require(abs(det)>1e-12,"degenerate triangle")
        lo=np.maximum(0,np.floor(p.min(axis=0)*size).astype(int))
        hi=np.minimum(size-1,np.floor(p.max(axis=0)*size).astype(int))
        xx,yy=np.meshgrid((np.arange(lo[0],hi[0]+1)+.5)/size,(np.arange(lo[1],hi[1]+1)+.5)/size)
        dx,dy=xx-p[0,0],yy-p[0,1]
        a=(dx*w[1]-dy*w[0])/det;b=(v[0]*dy-v[1]*dx)/det
        mask=(a>1e-7)&(b>1e-7)&(a+b<1-1e-7)
        view=labels[lo[1]:hi[1]+1,lo[0]:hi[0]+1];label=groups[root(i)]
        cross+=int(np.count_nonzero(mask&(view!=0)&(view!=label)))
        view[mask]=label
    require(cross==0,"cross-island sampled overlap")
    require(np.count_nonzero(labels)>100,"empty UV diagnostic")
    # A Chebyshev-radius dilation tests a conservative square footprint.
    # Count conflicts between islands after both have been expanded.
    gaps={}
    for radius in (1,2,4,8):
        padded=np.pad(labels,radius)
        merged=np.zeros_like(labels);conflict=np.zeros_like(labels,dtype=bool)
        for y in range(2*radius+1):
            for x in range(2*radius+1):
                shifted=padded[y:y+size,x:x+size]
                conflict|=(merged!=0)&(shifted!=0)&(merged!=shifted)
                mask=(merged==0)&(shifted!=0);merged[mask]=shifted[mask]
        gaps[str(radius)]={"collisionTexels":int(conflict.sum()),"expandedTexels":int(np.count_nonzero(merged))}
    y,x=np.nonzero(labels)
    return {"resolution":size,"triangles":len(tris),"islands":len(groups),
            "occupiedTexels":int(np.count_nonzero(labels)),"crossIslandOverlap":cross,
            "edgeClearanceTexels":int(min(x.min(),y.min(),size-1-x.max(),size-1-y.max())),
            "squareDilation":gaps,"exactPolygonProof":False,"mipBleedQualified":False}

def run(out,source,derived,uv,transferred,reference,render,report,coords,full_stats):
    out=Path(out)
    m=source.materials[0]
    inv=source_inventory(m);spacing=island_spacing(derived,uv)
    result={"schema":"atlas.asc01.microstructure-ablation/v1","revision":report["revision"],
            "masterSha256":report["masterSha256"],"target":report["target"],"geometryTriangles":len(derived.loop_triangles),
            "inventory":inv,"uvSpacing":spacing,"status":"PENDING","cases":{},
            "fixedDiffuse":True,"artisticApproval":False,"webglQualified":False,"publishable":False}
    def write():
        (out/"microstructure.json").write_text(json.dumps(result,indent=2,allow_nan=False)+"\n")
    before=list(derived.materials);clones=[]
    # Six combinations plus repeated full reference to measure render drift.
    configs=[("full","texture"),("map","texture"),("flat","texture"),("full","constant"),
             ("map","constant"),("flat","constant")]
    try:
        for n,r in configs:
            key="micro-"+n+"-"+r
            clone=variant(m,transferred,uv.name,n,r);clones.append(clone)
            derived.materials[0]=clone;bpy.context.view_layer.update()
            pixels=render(key)
            result["cases"][key]=measure(reference,pixels,coords)
            result["cases"][key]["imageSha256"]=report["renders"][key]["sha256"]
            if key=="micro-full-texture":full=pixels.copy()
            result["cases"][key]["differenceFromFull"]=measure(full,pixels,coords)
            write()
        key="micro-full-repeat"
        clone=variant(m,transferred,uv.name,"full","texture");clones.append(clone)
        derived.materials[0]=clone;bpy.context.view_layer.update()
        repeat=render(key)
        result["cases"][key]=measure(reference,repeat,coords)
        result["cases"][key]["imageSha256"]=report["renders"][key]["sha256"]
        result["cases"][key]["differenceFromFull"]=measure(full,repeat,coords)
        noise=result["cases"][key]["differenceFromFull"]["mean"]
        # Do not make causal choices from changes within render noise.
        require(noise<=.001,"repeat drift exceeds predeclared limit")
        baseline=result["cases"]["micro-full-texture"]["mean"]
        require(abs(baseline-full_stats["mean"])<=.001,"full hybrid mismatch")
        threshold=max(.001,3*noise)
        choices={}
        for n,r in configs[1:]:
            key="micro-"+n+"-"+r;case=result["cases"][key]
            delta=case["mean"]-baseline
            choices[key]={"errorIncrease":delta,"materialDifference":case["differenceFromFull"]["mean"],
                          "classification":"WORSE" if delta>threshold else "BETTER" if delta<-threshold else "WITHIN_MARGIN"}
        result.update(status="PASS_MICROSTRUCTURE_ABLATION",repeatNoise=noise,decisionMargin=threshold,
                      comparisons=choices,selection="REVIEW_ONLY_NO_AUTOMATIC_SIMPLIFICATION")
        write();print("ASC-P2C3B",json.dumps(result),flush=True)
    except Exception as e:
        result.update(status="FAIL",error=repr(e));write();raise
    finally:
        for i,m in enumerate(before):derived.materials[i]=m
        for m in clones:bpy.data.materials.remove(m)
        bpy.context.view_layer.update()
