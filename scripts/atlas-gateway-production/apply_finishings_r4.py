#!/usr/bin/env python3
"""ART-DIR-02 FINISHINGS-FIRST / PBR proof on the immutable R2 portal candidate.
Requires proven R2 .blend as source; all existing geometry/cameras remain.
External source assets must be CC0 with verified publisher receipts.
"""
from pathlib import Path
import bpy,hashlib,json,math,os,sys
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def opt(n):
    if n not in args:raise ValueError("Missing "+n)
    return args[args.index(n)+1]
dest=Path(opt("--out")).resolve();dest.mkdir(parents=True,exist_ok=True)
assets=Path(opt("--assets")).resolve()
source=Path(bpy.data.filepath)
if source.name!="atlas-art-proof-01b-portal-reading-r2.blend":
    raise RuntimeError("A separate R2 scene file is the only valid input")
receipt=json.loads((assets/"asset-sources-receipt.json").read_text())
if receipt.get("license")!="CC0-1.0":raise ValueError("Asset license not verified")
for i in ("Onyx013","Metal010"):
    if i not in receipt["materials"]:raise ValueError("Missing approved source candidate "+i)
def sha(f):
    h=hashlib.sha256()
    with open(f,"rb") as stream:
        for chunk in iter(lambda:stream.read(1024*1024),b""):h.update(chunk)
    return h.hexdigest()
scene=bpy.context.scene
def img(asset,kind,color=False):
    info=receipt["materials"][asset]["maps"].get(kind)
    if not info:return None
    path=Path(info["file"])
    if not path.exists() or sha(path)!=info["sha256"]:
        raise RuntimeError("Texture source integrity failed "+asset+" "+kind)
    t=bpy.data.images.load(str(path),check_existing=True)
    t.colorspace_settings.name="sRGB" if color else "Non-Color"
    t.pack()
    return t
def material(name,asset,tint,metal,scale,rough_low,rough_factor,nstrength):
    mat=bpy.data.materials.new(name)
    mat.use_nodes=True
    nodes=mat.node_tree.nodes;links=mat.node_tree.links
    bs=nodes.get("Principled BSDF")
    if not bs:raise RuntimeError("Principled shader missing")
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough_low+.3*rough_factor
    src=nodes.new("ShaderNodeTexCoord")
    mapping=nodes.new("ShaderNodeMapping");mapping.inputs["Scale"].default_value=(*scale,1)[:3]
    links.new(src.outputs["Generated"],mapping.inputs["Vector"])
    color=nodes.new("ShaderNodeTexImage");color.image=img(asset,"Color",True)
    links.new(mapping.outputs["Vector"],color.inputs["Vector"])
    tintnode=nodes.new("ShaderNodeMixRGB");tintnode.blend_type="MULTIPLY"
    tintnode.inputs[0].default_value=.63
    tintnode.inputs[2].default_value=(*tint,1.0)
    links.new(color.outputs["Color"],tintnode.inputs[1])
    links.new(tintnode.outputs["Color"],bs.inputs["Base Color"])
    r=nodes.new("ShaderNodeTexImage");r.image=img(asset,"Roughness")
    links.new(mapping.outputs["Vector"],r.inputs["Vector"])
    adjust=nodes.new("ShaderNodeMapRange");adjust.inputs["From Min"].default_value=0.0
    adjust.inputs["From Max"].default_value=1.0
    adjust.inputs["To Min"].default_value=rough_low
    adjust.inputs["To Max"].default_value=rough_low+rough_factor
    links.new(r.outputs["Color"],adjust.inputs["Value"])
    links.new(adjust.outputs["Result"],bs.inputs["Roughness"])
    nmimg=img(asset,"NormalGL")
    if nmimg:
        tn=nodes.new("ShaderNodeTexImage");tn.image=nmimg
        links.new(mapping.outputs["Vector"],tn.inputs["Vector"])
        nm=nodes.new("ShaderNodeNormalMap");nm.inputs["Strength"].default_value=nstrength
        links.new(tn.outputs["Color"],nm.inputs["Color"])
        links.new(nm.outputs["Normal"],bs.inputs["Normal"])
    return mat
stone=material("ATLAS R4 • Onyx013 blue polished stone CC0","Onyx013",
               (.36,.56,.92),.13,(4.0,4.0,1.0),.13,.35,.22)
bronze=material("ATLAS R4 • Metal010 satin gold CC0","Metal010",
                (.92,.66,.30),.88,(2.8,2.8,1.0),.20,.37,.14)
floor=bpy.data.objects.get("Atrio • pavimento lapideo")
if not floor or floor.type!="MESH":raise RuntimeError("Real floor mesh missing")
floor.data=floor.data.copy()
floor.data.materials.clear();floor.data.materials.append(stone)
targets=[]
for ob in list(scene.objects):
    if ob.type!="MESH" or ob==floor:continue
    if (ob.name.startswith("ATLAS ARCH04 • low outer bronze base") or
        ob.name.startswith("ATLAS ARCH04 • shallow inner plinth") or
        ob.name.startswith("ARCH04 • planter brushed bronze edge") or
        ob.name.startswith("PROOF R2 • fine slot lip") or
        ob.name.startswith("Atrio • profilo balconata")):
        ob.data=ob.data.copy()
        ob.data.materials.clear();ob.data.materials.append(bronze)
        targets.append(ob.name)
if len(targets)<7:raise RuntimeError("Too few metal finish targets: "+str(len(targets)))
# A real Poly Haven Blender model is linked into the *render* as a collection
# instance. It is not replicated with simple spheres and its source is preserved.
model=receipt["model"]
plant_instances=[]
if model.get("status")=="ACQUIRED_CC0":
    blendfile=Path(model["file"])
    if not blendfile.is_file() or sha(blendfile)!=model["sha256"]:
        raise RuntimeError("Plant source checksum mismatch")
    with bpy.data.libraries.load(str(blendfile),link=False) as (src,dst):
        picks=[c for c in src.collections if "plant" in c.lower()]
        dst.collections=picks[:1] if picks else src.collections[:1]
    collection=next((v for v in dst.collections if v is not None),None)
    if collection is None or not any(o.type=="MESH" for o in collection.all_objects):
        raise RuntimeError("Real planted model collection is empty")
    # Architectural planters already exist; no new pedestal or plinth.
    planters=[o for o in scene.objects if o.name.startswith("ARCH04 • raised botanical planter")]
    if len(planters)!=2:raise RuntimeError("Expected two preserved architectural planters")
    for j,planter in enumerate(sorted(planters,key=lambda ob:ob.location.x)):
        ins=bpy.data.objects.new("ATLAS R4 • real CC0 potted plant "+str(j+1),None)
        scene.collection.objects.link(ins)
        ins.instance_type="COLLECTION";ins.instance_collection=collection
        ins.location=(planter.location.x,planter.location.y,.89)
        ins.scale=(3.3,3.3,3.3)
        ins.rotation_euler.z=(.22 if j==0 else -.18)
        plant_instances.append(ins.name)
    for ob in scene.objects:
        if ob.name.startswith("ARCH04 • botanical main stem") or ob.name.startswith("ARCH04 • restrained botanical foliage"):
            ob.hide_render=True
# Technical invariant: no geometry or location of architectural portals modified.
portals={}
for n in ("Curricolo","Esplora","Percorsi","Esperienze"):
    o=bpy.data.objects.get("Portale • "+n)
    if not o:raise RuntimeError("Architectural portal lost")
    portals[n]={"location":list(o.location),"rotation":list(o.rotation_euler),"scale":list(o.scale)}
# Leave all lights as in R2 so observed differences come from materials and props.
scene.render.engine="CYCLES"
scene.render.film_transparent=False
bpy.context.view_layer.cycles.use_denoising=True
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
bpy.ops.file.pack_all()
candidate=dest/"atlas-art-dir02-finishings-r4-candidate.blend"
hero=bpy.data.objects.get("CAM_HERO_ARCH04")
oblique=bpy.data.objects.get("CAM_ART_PROOF_OBLIQUE_3D")
if not hero or not oblique:raise RuntimeError("R2 cameras absent")
scene.camera=hero
bpy.ops.wm.save_as_mainfile(filepath=str(candidate))
result={"schema":"atlas.gateway.art-dir02.finishings-first-r4/v1",
 "status":"REAL_PBR_MATERIALS_PROOF__HUMAN_ART_REVIEW_REQUIRED",
 "canonical_image_sha256":"a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe",
 "source_r2_sha256":sha(source),"candidate_blend_sha256":sha(candidate),
 "materials":["Onyx013","Metal010"],"material_targets":targets,
 "floor_object":floor.name,"plant_source":model.get("source_page"),
 "plant_source_status":model.get("status"),"plant_instances":plant_instances,
 "portals_unmodified":portals,"no_publication":True,"art_approved":False,
 "source_asset_receipt":receipt,"renders":{}}
# HERO is kept exactly on the R2 camera, to make the before/after honest.
for name,camera,wx,hy,samples in [
   ("hero",hero,1152,648,22),
   ("oblique",oblique,896,504,16)]:
    scene.camera=camera
    scene.render.resolution_x=wx;scene.render.resolution_y=hy
    scene.cycles.samples=samples
    output=dest/("atlas-finishings-r4-"+name+".png")
    scene.render.filepath=str(output)
    bpy.ops.render.render(write_still=True)
    if not output.is_file() or output.stat().st_size<12000:raise RuntimeError("Missing real render "+name)
    result["renders"][name]={"file":output.name,"sha256":sha(output),
                               "bytes":output.stat().st_size,"resolution":[wx,hy]}
(dest/"atlas-finishings-r4-receipt.json").write_text(json.dumps(result,indent=2,ensure_ascii=False))
print("ATLAS_FINISHINGS_R4_PROOF_COMPLETE",json.dumps({"materials":result["materials"],
"metal_objects":len(targets),"plants":len(plant_instances),"renders":list(result["renders"])}))
