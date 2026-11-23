#!/usr/bin/env python3
"""ATLAS P3B: genuine P3A/R2 circular-oculus four-gallery Blender to GLB.
The qualified P3A source remains immutable. Includes a procedural blue-sky
texture encoded in the GLB, 4 real panel hotspots and an actual 3D camera.
No public route, deployment, or permission to merge.
"""
import bpy,hashlib,json,struct,sys
from pathlib import Path
A=sys.argv[sys.argv.index("--")+1:]
def arg(x):
    assert x in A and A.index(x)+1<len(A),x
    return A[A.index(x)+1]
def sha(p):
    h=hashlib.sha256()
    with Path(p).open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):h.update(chunk)
    return h.hexdigest()
src=Path(bpy.data.filepath).resolve()
out=Path(arg("--out")).resolve()
out.mkdir(parents=True,exist_ok=True)
r=json.loads(Path(arg("--parent-receipt")).read_text())
CANON="a132a9e188b6b931d078a6f016450f3e9a03153de665f72a486816035ea830fe"
APPROVED_R4="3e425897ccf6092110d27955b3c25dfe28c6a52046aa0576acaf33b67959e56f"
P3A_SHA="35371d226c289bd348a1137f63bfd14c74ee79389c4c1b53b522759ca0246d30"
if not (r.get("schema")=="atlas.gateway.arch-art-p3a-cycles-result/v1"
 and r.get("source_blender_sha256")=="3527837e0be056002c1dddea9082336001e787da9a6d225eff7704c554a84cec"
 and r.get("source_blender_intact") and r.get("original_objects_intact")
 and r.get("four_orig_portals_verified")==4
 and r.get("gallery_levels_ground_included")==4
 and r.get("roof",{}).get("single_watertight_mesh")
 and r.get("roof",{}).get("nonmanifold_edges")==0
 and abs(r.get("roof",{}).get("radius_bu",0)-6.25)<1e-8
 and r.get("gallery3",{}).get("reading_bays")==12
 and not r.get("art_final_approved") and not r.get("web_product_approved")
 and not r.get("student_publication_approved") and r.get("no_deploy") and r.get("no_merge")
 and src.name==r["files"]["blend"]["name"]
 and r["files"]["blend"]["sha256"]==P3A_SHA
 and sha(src)==P3A_SHA):
    raise RuntimeError("Unqualified P3A/R2 Blender source")
src_hash=sha(src)
scene=bpy.context.scene
# Preserve the true Blender font glyphs before glTF export. Without conversion,
# the Cycles labels disappear because glTF stores polygonal geometry, not FONT.
font_names=[ob.name for ob in scene.objects if ob.type=="FONT" and not ob.hide_render and not ob.hide_get()]
for name in font_names:
    ob=bpy.data.objects[name]
    # glTF has no Blender FONT primitive. Keep the glyph silhouettes but
    # remove Cycles-only bevel, extrusion and excessive curve tessellation.
    # This in-memory edit never saves or overwrites the approved P2B binary.
    ob.data=ob.data.copy()
    ob.data.resolution_u=3
    ob.data.bevel_depth=0.0
    ob.data.bevel_resolution=0
    ob.data.extrude=0.0
    bpy.ops.object.select_all(action="DESELECT")
    ob.select_set(True)
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.convert(target="MESH")
    converted=bpy.data.objects[name]
    if len(converted.data.polygons)>3000:
        modifier=converted.modifiers.new("ATLAS P2C • riduci lettere", "DECIMATE")
        modifier.ratio=min(0.95,3000.0/len(converted.data.polygons))
        bpy.context.view_layer.objects.active=converted
        bpy.ops.object.modifier_apply(modifier=modifier.name)
for ob in scene.objects:ob.select_set(False)
routes={"Curricolo":"/curricolo/","Esplora":"/esplora/",
        "Percorsi":"/percorsi/","Esperienze":"/esperienze/"}
eligible=[]
for ob in scene.objects:
    if ob.hide_render or ob.hide_get():continue
    if ob.type in ("MESH","CAMERA") or (ob.type=="EMPTY" and ob.name.startswith("Portale •")) or (ob.type=="CURVE" and (ob.name.startswith("ATLAS P2A • bordo luminoso") or ob.name.startswith("ATLAS P3A • profilo parapetto") or ob.name.startswith("ATLAS P3A • linea luce"))):
        ob.select_set(True)
        eligible.append(ob)
if len([ob for ob in eligible if ob.type=="MESH"])<70:
    raise RuntimeError("Real atrium geometry absent")
cam=bpy.data.objects.get("ATLAS P3A • CAMERA HERO")
if not cam or not cam.select_get():raise RuntimeError("Selected P3A/R2 HERO camera absent")
roof_ob=bpy.data.objects.get("ATLAS P3A • padiglione unico oculo circolare")
sky_ob=bpy.data.objects.get("ATLAS P3A • cielo fisico circolare")
third=bpy.data.objects.get("ATLAS P3A • third gallery deck")
if any(x is None or not x.select_get() for x in (roof_ob,sky_ob,third)):
    raise RuntimeError("Fourth level, true circular roof or physical sky missing")
for name,path in routes.items():
    root=bpy.data.objects.get("Portale • "+name)
    pane=bpy.data.objects.get(name+" • vetro cobalto")
    if not root or not pane or not root.select_get() or not pane.select_get():
        raise RuntimeError("Portal geometry not visible: "+name)
    for target in (root,pane):
        target["atlas_portal_id"]=name.lower()
        target["atlas_route"]=path
    pane["atlas_hit_target"]=True
# Convert Cycles mixing into glTF-native PBR in the in-memory derivative only.
def mat(name,color,metal,rough,alpha=1.,emission=None):
    material=bpy.data.materials.new("ATLAS P3B • "+name)
    material.use_nodes=True
    bs=material.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,alpha)
    bs.inputs["Metallic"].default_value=metal
    bs.inputs["Roughness"].default_value=rough
    bs.inputs["Alpha"].default_value=alpha
    if alpha<1.:material.surface_render_method="BLENDED"
    if emission:
        bs.inputs["Emission Color"].default_value=(*emission,1.)
        bs.inputs["Emission Strength"].default_value=1.7
    return material
glass=mat("vetro traslucido",(.05,.18,.32),.06,.12,.34)
roof=mat("copertura pietra perla",(.39,.40,.43),.12,.54)
sky=mat("cielo zenitale procedurale",(.34,.60,.83),.0,.96)
letters=mat("tipografia tridimensionale",(.80,.91,.98),.0,.43,1.,(.68,.78,.94))
gallery=mat("gallerie blu",(.08,.12,.18),.26,.39)
filament=mat("filamento caldo",(.34,.21,.10),.38,.25,1.,(.92,.55,.25))
stone=mat("pavimento",(.10,.16,.24),.15,.23)
mat_glass_railing=mat("vetro traslucido balaustre",(.23,.45,.66),.03,.17,.28)
# Bake a deterministic naturalistic sky into a local image to transfer the
# real P3A sky disc to WebGL (Cycles procedural nodes are not glTF portable).
import math
SIZE=512
im=bpy.data.images.new("ATLAS P3B • cielo locale",width=SIZE,height=SIZE,alpha=True)
pixels=[0.0]*(SIZE*SIZE*4)
def smooth(a,b,x):
    t=max(0.,min(1.,(x-a)/(b-a)))
    return t*t*(3.-2.*t)
for y in range(SIZE):
    yy=y/(SIZE-1)
    for x in range(SIZE):
        xx=x/(SIZE-1)
        # Multi-scale deterministic continuous cloud strata, no external data.
        v=(.36*math.sin(xx*16.3+yy*4.9+1.7)
          +.25*math.sin(yy*24.7-xx*8.3)
          +.18*math.sin((xx+yy)*39.8+xx*4.0)
          +.11*math.sin(xx*75.1-yy*41.7))
        cloud=smooth(.06,.58,v)
        haze=.10+.12*max(0.,1.-2.*yy)
        white=min(.88,cloud*.83+haze)
        blue=(.11+.34*yy,.33+.29*yy,.64+.25*yy)
        color=[blue[i]*(1-white)+(.95,.97,1.)[i]*white for i in range(3)]
        offset=(y*SIZE+x)*4
        pixels[offset:offset+4]=color+[1.]
im.pixels.foreach_set(pixels)
im.file_format="PNG"
sky_image_path=out/"atlas-p3b-cielo-texture.png"
im.filepath_raw=str(sky_image_path)
im.save()
# UVs follow the circular 3D skylight, not the photographic camera frame.
uv=sky_ob.data.uv_layers.active or sky_ob.data.uv_layers.new(name="ATLAS_P3B_SKY_UV")
from mathutils import Vector
centre=sky_ob.matrix_world@sky_ob.data.vertices[0].co
for poly in sky_ob.data.polygons:
    for loop_index in poly.loop_indices:
        vertex=sky_ob.data.vertices[sky_ob.data.loops[loop_index].vertex_index]
        pos=sky_ob.matrix_world@vertex.co
        uv.data[loop_index].uv=(.5+(pos.x-centre.x)/12.5,.5+(pos.y-centre.y)/12.5)
tree=sky.node_tree
bs=tree.nodes.get("Principled BSDF")
tex=tree.nodes.new("ShaderNodeTexImage")
tex.image=im
tree.links.new(tex.outputs["Color"],bs.inputs["Base Color"])
if "Emission Color" in bs.inputs:
    tree.links.new(tex.outputs["Color"],bs.inputs["Emission Color"])
    bs.inputs["Emission Strength"].default_value=.58

for ob in eligible:
    if ob.type not in ("MESH","CURVE"):continue
    key=ob.name.lower()
    chosen=None
    if ob.name in [name+" • vetro cobalto" for name in routes]:chosen=glass
    elif key.startswith("atlas p3a • parapetto vetro"):chosen=mat_glass_railing
    elif ob.name in font_names:chosen=letters
    elif key.startswith("atlas p2a • bordo luminoso") or key.startswith("atlas p3a • vera cornice oculo") or key.startswith("atlas p3a • linea luce"):chosen=filament
    elif "pavimento lapideo" in key:chosen=stone
    elif "cielo fisico circolare" in key:chosen=sky
    elif "padiglione unico oculo circolare" in key:chosen=roof
    elif "gallery" in key or "galleria" in key:chosen=gallery
    if chosen is not None:
        ob.data=ob.data.copy()
        ob.data.materials.clear()
        ob.data.materials.append(chosen)
scene.camera=cam
bpy.context.view_layer.objects.active=cam
bpy.context.view_layer.update()
glb=out/"atlas-p3b-atrio-4-livelli-oculo-circolare.glb"
bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",
    use_selection=True,export_cameras=True,export_lights=False,
    export_extras=True,export_normals=True,export_texcoords=True,
    export_materials="EXPORT",export_apply=False,export_yup=True)
raw=glb.read_bytes()
magic,version,length=struct.unpack_from("<III",raw)
if magic!=0x46546C67 or version!=2 or length!=len(raw):
    raise RuntimeError("Invalid exported GLB")
n,typ=struct.unpack_from("<II",raw,12)
if typ!=0x4E4F534A:raise RuntimeError("GLB JSON missing")
payload=json.loads(raw[20:20+n].decode("utf8").rstrip(" \x00"))
nodes=payload["nodes"]
portals={}
for name,route in routes.items():
    items=[x for x in nodes if x.get("extras",{}).get("atlas_portal_id")==name.lower()]
    hit=[x for x in items if x.get("extras",{}).get("atlas_hit_target")]
    if not items or not hit or "mesh" not in hit[0] or hit[0]["extras"].get("atlas_route")!=route:
        raise RuntimeError("GLB lacks hit geometry: "+name)
    portals[name.lower()]={"path":route,"hit_node":hit[0]["name"]}
if not any("camera" in x for x in nodes):
    raise RuntimeError("Exported 3D camera not found")
triangles=0
for mesh in payload.get("meshes",[]):
    for prim in mesh.get("primitives",[]):
        if prim.get("mode",4)!=4:continue
        a=prim.get("indices")
        if a is not None:triangles+=payload["accessors"][a]["count"]//3
        elif "POSITION" in prim.get("attributes",{}):
            triangles+=payload["accessors"][prim["attributes"]["POSITION"]]["count"]//3
if triangles<1500:raise RuntimeError("Atrium unexpectedly empty")
if triangles>120000:raise RuntimeError("Mobile candidate exceeds 120k triangle budget: "+str(triangles))
required=("third_gallery_deck","padiglione_unico_oculo_circolare",
          "cielo_fisico_circolare")
for name in required:
    if not any(name in n.get("name","").lower().replace(" ","_") for n in nodes):
        raise RuntimeError("Real P3A geometry missing from exported GLB: "+name)
actual_railing=sum("ATLAS_P3A" in n.get("name","").replace(" ","_") and "parapetto_vetro" in n.get("name","").replace(" ","_").lower() for n in nodes)
if actual_railing<28:raise RuntimeError("Third-floor glass balustrade lost in GLB: "+str(actual_railing))
if sha(src)!=src_hash:raise RuntimeError("Qualified P3A/R2 original changed")
report={"schema":"atlas.gateway.p3b-four-gallery-webgl/v1",
    "art_reference_sha256":CANON,"historical_architecture_sha256":APPROVED_R4,
    "selected_architecture":"P3A/R2 four levels, circular oculus",
    "input_p3a_r2_sha256":src_hash,"input_binary_unchanged":True,
    "gallery_levels_including_ground":4,
    "circular_oculus_radius_bu":6.25,
    "third_gallery_railing_nodes":actual_railing,
    "selected_original_objects":len(eligible),"original_font_meshes":len(font_names),"glb_nodes":len(nodes),
    "glb_meshes":len(payload.get("meshes",[])),"glb_triangles":triangles,
    "glb_cameras":len(payload.get("cameras",[])),
    "glb_materials":len(payload.get("materials",[])),
    "glb_textures":len(payload.get("textures",[])),"portals":portals,
    "file":{"name":glb.name,"bytes":len(raw),"sha256":sha(glb)},
    "sky_texture":{"name":sky_image_path.name,"bytes":sky_image_path.stat().st_size,"sha256":sha(sky_image_path)},
    "art_final_approved":False,"web_product_approved":False,
    "student_publication_approved":False,"no_merge":True,"no_deploy":True,
    "limits":["PBR approximates Cycles and requires visual WebGL review",
              "Four existing application routes are not authorizations for content",
              "Device FPS, RAM and touch interaction not yet tested"]}
(out/"atlas-p3b-webgl-receipt.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
print("ATLAS_P3B_4_LEVELS_CIRCULAR_OCULUS_GLTF_PASS",json.dumps({"triangles":triangles,"bytes":len(raw),"portals":portals,"third_glass":actual_railing}),flush=True)
