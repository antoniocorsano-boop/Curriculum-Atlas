"""P2C3 finish: inspect the corrected bake and export a matched material package.
No production deployment; source material never edited.
"""
import os,json,hashlib
from pathlib import Path
import bpy
import numpy as np
from atlas_material_ablation import require,sha,graph,measure

def run(out,scene,obj,source,derived,uv,transferred,reference,render,report):
    out=Path(out)
    prior=Path(os.environ["ATLAS_P2C3_PRIOR"])
    old=json.loads((prior/"microstructure.json").read_text())
    a=json.loads((out/"material-ablation.json").read_text())
    require(old["revision"]=="aeeab27f48fc69b75d6fae2be68fa4ae215378db" and old["status"]=="PASS_MICROSTRUCTURE_ABLATION","prior material evidence")
    require(old["masterSha256"]==a["masterSha256"]==report["masterSha256"] and old["target"]==a["target"],"same source")
    require(a["status"]=="PASS_MATERIAL_ABLATION","hybrid render missing")
    old_error=old["cases"]["micro-full-texture"]["mean"]
    new_error=a["material-hybrid-camera"]["mean"]
    # An explicit quality decision, not an automatic promotion.
    decision="CANDIDATE_FOR_VISUAL_REVIEW" if new_error<=old_error*.90 else "REVIEW_REQUIRED_NO_10_PERCENT_GAIN"
    b=json.loads((out/"surface-binding.json").read_text())
    require(b["revision"]==report["revision"] and b["triangles"]==108,"binding")
    require(b["texture"]["sha256"]==sha(out/"binding.rgba32f"),"binding texture")
    primary=derived.uv_layers.get("UVMap")
    require(primary is not None and primary.name!=uv.name,"original material UV")
    derived.calc_loop_triangles()
    transform=obj.matrix_world.to_3x3().inverted().transposed()
    original_uv=[];normals=[]
    for tri in derived.loop_triangles:
        for index in tri.loops:
            original_uv.append(list(primary.data[index].uv))
            normals.append(list((transform@derived.corner_normals[index].vector).normalized()))
    require(len(original_uv)==len(normals)==len(b["positions"]),"corner matching")
    require(np.isfinite(original_uv).all() and np.isfinite(normals).all(),"corner data")
    t,_,p=graph(source.materials[0])
    rough=p.inputs["Roughness"].links[0].from_node
    require(rough.type=="TEX_IMAGE" and rough.image is not None,"roughness")
    # Exact source fingerprint retained; do not publish source image files.
    im=rough.image;packed=im.packed_file
    require(packed is not None and im.colorspace_settings.name=="Non-Color","source roughness encoding")
    digest=hashlib.sha256(packed.data).hexdigest()
    require(digest=="5cb9d78ec685155d2b66a1db01abc61049d00953d783d0c78d829512de9ab0b4","roughness source")
    w,h=im.size
    rgba=np.empty(w*h*4,np.float32);im.pixels.foreach_get(rgba)
    rgba=rgba.reshape(h,w,4)
    require(np.isfinite(rgba).all() and rgba[:,:,:3].min()>=0 and rgba[:,:,:3].max()<=1,"roughness pixels")
    # Preserve decoded RGB rather than guess Blender's color-to-scalar convention.
    rgb=np.rint(rgba[:,:,:3]*255).astype(np.uint8)
    delta=float(np.max(np.abs(rgb.astype(np.float32)/255-rgba[:,:,:3])))
    require(delta<=.5/255+1e-6,"roughness quantization")
    (out/"roughness.rgb8").write_bytes(np.ascontiguousarray(rgb).tobytes())
    package={"schema":"atlas.asc01.material-package/v1","revision":report["revision"],"masterSha256":report["masterSha256"],
             "bindingSha256":sha(out/"surface-binding.json"),"triangles":108,"materialUV":original_uv,"worldNormals":normals,
             "roughness":{"width":int(w),"height":int(h),"sha256":sha(out/"roughness.rgb8"),"sourcePackedSha256":digest,
                          "encoding":"non-color RGB8","rowOrder":"bottom-up","maxQuantizationDelta":delta},
             "normalPolicy":"preserve source normal and bump in master; transport deferred pending close-up review",
             "distributionAuthorized":False}
    (out/"material-package.json").write_text(json.dumps(package,indent=2,allow_nan=False)+"\n")
    result={"schema":"atlas.asc01.material-finish/v1","revision":report["revision"],"masterSha256":report["masterSha256"],
            "priorRevision":old["revision"],"priorMean":old_error,"newMean":new_error,
            "relativeGain":(old_error-new_error)/old_error,"decision":decision,
            "spacing":report["uv"]["productionSpacing"],"bakeSamples":report["bake"]["samples"],
            "packageSha256":sha(out/"material-package.json"),"images":a["imageSha256"],
            "artisticApproval":False,"webglQualified":False,"publishable":False,"status":"PASS_FINISH_PACKAGE"}
    (out/"material-finish.json").write_text(json.dumps(result,indent=2,allow_nan=False)+"\n")
    print("ASC-FINISH",json.dumps(result),flush=True)
