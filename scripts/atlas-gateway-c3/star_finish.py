"""SP-07.3: glTF-native finish palette, actual COLOR_0 and three-primitive validation."""
import hashlib,json,struct
from pathlib import Path
from star_sculpture import face_roles
ATTR="Atlas finish"
IDS=("storie","laboratori","scoperte","percorsi")
FAMILY={"storie":"warm","scoperte":"warm","laboratori":"cool","percorsi":"cool"}
SCALARS={"warm":{"emission":.08,"roughness":.34,"metallic":.64},"cool":{"emission":.10,"roughness":.32,"metallic":.38}}
EMISSION={"warm":(.22,.12,.035),"cool":(.045,.11,.22)}
# One neutral metal/enamel material per family; distinct per-face linear RGB values.
COMPONENTS={"storie":(.64,.64,1.18,1.18,.82),"laboratori":(.70,.70,.70,1.06,1.13,1.02),"scoperte":(1.0,.86,1.0,.86,1.28),"percorsi":(.74,.85,.96,1.08,1.16)}
def face_colors(sid,base):
    assert len(base)==3 and all(0<=x<=1 for x in base)
    out=[]
    for component,role,j in face_roles(sid):
        factor=COMPONENTS[sid][component]
        # Directional contrast supports the actual recessed rims and crests;
        # pair adjacent rim triangles so that triangulation does not become decoration.
        if role=="rim":
            f=(.76,.86,.92,.83)[(j//2)%4]
        elif role=="crest":
            if sid=="storie":f=(1.06,1.03,.97,.94)[j%4]
            elif sid=="laboratori":f=1.02 if component>=3 else .93
            elif sid=="scoperte":f=(1.19,1.02,.87,.96)[j%4]
            else:f=(1.09,.99,.93,1.02)[j%4]
        else:f={"back":.72,"band0":1.23,"band1":.83,"band2":1.07}[role]
        out.append(tuple(round(min(.98,max(.002,x*factor*f)),6) for x in base)+(1.,))
    return out
def make_material(material,family):
    q=SCALARS[family]
    m=material("Knowledge finish "+family,(1.,1.,1.),q["roughness"],q["metallic"],q["emission"])
    tree=m.node_tree;bs=tree.nodes.get("Principled BSDF")
    bs.inputs["Emission Color"].default_value=(*EMISSION[family],1.)
    node=tree.nodes.new("ShaderNodeVertexColor");node.layer_name=ATTR;node.label="Exportable sculptural finish"
    tree.links.new(node.outputs["Color"],bs.inputs["Base Color"])
    return m
def apply(obj,sid,q):
    assert all(q[k]==v for k,v in SCALARS[FAMILY[sid]].items())
    data=obj.data;colors=face_colors(sid,q["color"]);assert len(colors)==len(data.polygons)
    layer=data.color_attributes.get(ATTR)
    if layer is None:layer=data.color_attributes.new(name=ATTR,type="FLOAT_COLOR",domain="CORNER")
    assert layer.domain=="CORNER" and layer.data_type=="FLOAT_COLOR"
    for p,color in zip(data.polygons,colors):
        for i in p.loop_indices:layer.data[i].color=color
    data.update()
def check(obj,sid,q):
    m=obj.data.materials[0];bs=m.node_tree.nodes.get("Principled BSDF")
    links=bs.inputs["Base Color"].links
    assert len(links)==1 and links[0].from_node.type=="VERTEX_COLOR" and links[0].from_node.layer_name==ATTR
    assert all(abs(float(bs.inputs[k].default_value)-q[name])<1e-5 for k,name in (("Emission Strength","emission"),("Roughness","roughness"),("Metallic","metallic")))
    assert all(abs(a-b)<1e-5 for a,b in zip(bs.inputs["Emission Color"].default_value,(*EMISSION[FAMILY[sid]],1.)))
    layer=obj.data.color_attributes[ATTR]
    colors=face_colors(sid,q["color"]);assert len(colors)==len(obj.data.polygons)
    assert all(all(abs(x-y)<1e-5 for x,y in zip(layer.data[i].color,c)) for p,c in zip(obj.data.polygons,colors) for i in p.loop_indices)
    return True
def verify_module(path,selected):
    raw=Path(path).read_bytes()
    assert struct.unpack_from("<4sII",raw)==(b"glTF",2,len(raw)) and len(raw)<=1024*1024
    n,t=struct.unpack_from("<I4s",raw,12);assert t==b"JSON"
    g=json.loads(raw[20:20+n]);off=20+n
    bn,bt=struct.unpack_from("<I4s",raw,off);assert bt==b"BIN\x00" and off+8+bn==len(raw)
    blob=raw[off+8:]
    assert not g.get("extensionsRequired") and not g.get("images") and not g.get("textures")
    assert all("uri" not in b for b in g["buffers"])
    prim=[p for m in g["meshes"] for p in m["primitives"]]
    assert len(prim)==3 and len({p["material"] for p in prim})==3
    total=sum(g["accessors"][p["attributes"]["POSITION"]]["count"] for p in prim);assert total<=18000
    found={}
    for p in prim:
        mat=g["materials"][p["material"]];name=mat["name"]
        if name=="Knowledge star satin orbit":
            assert "COLOR_0" not in p["attributes"];found["orbit"]={"vertices":g["accessors"][p["attributes"]["POSITION"]]["count"]}
            continue
        family=name.removeprefix("Knowledge finish ");assert family in SCALARS and family not in found
        a=g["accessors"][p["attributes"]["COLOR_0"]];v=g["bufferViews"][a["bufferView"]]
        assert a["type"] in ("VEC3","VEC4") and a["count"]==g["accessors"][p["attributes"]["POSITION"]]["count"]
        fmt,size,den={5126:("f",4,1),5121:("B",1,255),5123:("H",2,65535)}[a["componentType"]]
        assert fmt=="f" or a.get("normalized") is True
        k=int(a["type"][-1]);stride=v.get("byteStride",k*size);start=v.get("byteOffset",0)+a.get("byteOffset",0)
        values=[tuple(x/den for x in struct.unpack_from("<"+fmt*k,blob,start+i*stride)[:3]) for i in range(a["count"])]
        assert all(0<=x<=1 for row in values for x in row)
        expected={c[:3] for sid in IDS if FAMILY[sid]==family for c in face_colors(sid,selected[sid]["color"])}
        # Linear color accessor values must include every authored face palette.
        tol=.008 if fmt=="B" else .0002
        assert all(any(max(abs(x-y) for x,y in zip(c,row))<=tol for row in values) for c in expected),(family,"missing authored palette")
        assert all(any(max(abs(x-y) for x,y in zip(c,row))<=tol for c in expected) for row in values),(family,"unexpected color")
        pbr=mat["pbrMetallicRoughness"];q=SCALARS[family]
        assert abs(pbr.get("metallicFactor",1)-q["metallic"])<1e-5 and abs(pbr.get("roughnessFactor",1)-q["roughness"])<1e-5
        assert all(abs(x-1)<1e-5 for x in pbr.get("baseColorFactor",[1,1,1,1]))
        found[family]={"vertices":a["count"],"paletteColors":len(expected),"colorAccessor":a["componentType"]}
    assert set(found)=={"warm","cool","orbit"}
    return {"status":"PASS","sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw),"primitives":3,"vertices":total,"groups":found,"externalResources":0,"qualified":False,"browserQualified":False}
def export_proposal(path,objects,cores,shared,selected,merge_group):
    import bpy
    # Export a temporary isolated copy of the exact selected scene module.
    copies=[];merged=[]
    try:
        byname={o.name:sid for sid,o in cores.items()}
        for o in objects:
            clone=o.copy();clone.data=o.data.copy();bpy.context.scene.collection.objects.link(clone)
            clone.name="SP073 temporary "+o.name
            if o.name in byname:clone.data.materials[0]=shared[FAMILY[byname[o.name]]]
            copies.append(clone)
        merged=merge_group(copies,"SP073 proposal")
        assert len(merged)==3
        bpy.ops.object.select_all(action="DESELECT")
        for o in merged:o.select_set(True)
        bpy.context.view_layer.objects.active=merged[0]
        bpy.ops.export_scene.gltf(filepath=str(path),export_format="GLB",use_selection=True,export_texcoords=False,export_vertex_color="MATERIAL",export_all_vertex_colors=False,export_draco_mesh_compression_enable=False)
        return verify_module(path,selected)
    finally:
        for o in list(bpy.context.scene.objects):
            if o.name.startswith(("SP073 temporary ","SP073 proposal ")):
                d=o.data;bpy.data.objects.remove(o,do_unlink=True)
                if d.users==0:bpy.data.meshes.remove(d)
        bpy.context.view_layer.update()
