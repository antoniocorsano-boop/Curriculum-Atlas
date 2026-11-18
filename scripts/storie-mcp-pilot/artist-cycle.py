"""One bounded artist-directed correction through the original Qwen MCP server.
Uses actual B03 master; only page material nodes change. No autonomous model call."""
import asyncio, base64, hashlib, json, math, pathlib, struct, sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

ROOT=pathlib.Path("/work")
SRC="/deps/source/src"
ENV={"PATH":"/usr/bin:/bin","HOME":"/work/home","BLENDER_HOST":"127.0.0.1","BLENDER_PORT":"9876",
     "QWEN_MM_NO_AUTO_INSTALL":"1","QWEN_MM_AUTOLAUNCH":"0","QWEN_MM_NATIVE_MODE":"1",
     "PYTHONPATH":SRC+":"+SRC+"/capabilities/blender","PYTHONDONTWRITEBYTECODE":"1","TMPDIR":"/tmp"}
STATE=r'''
import bpy, hashlib, json, os, struct
def digest(x):
    return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def state():
    s=bpy.context.scene
    geo=[]
    materials=[]
    for o in sorted((x for x in s.objects if x.type=="MESH"),key=lambda x:x.name):
        h=hashlib.sha256()
        for v in o.data.vertices:h.update(struct.pack("<3d",*v.co))
        for f in o.data.polygons:
            h.update(struct.pack("<I",len(f.vertices)))
            for i in f.vertices:h.update(struct.pack("<I",i))
        geo.append([o.name,len(o.data.vertices),len(o.data.polygons),h.hexdigest(),[list(r) for r in o.matrix_world],[m.name for m in o.data.materials]])
        for m in o.data.materials:
            n=m.node_tree.nodes
            bs=n.get("Principled BSDF")
            materials.append([m.name,list(bs.inputs["Base Color"].default_value),bs.inputs["Metallic"].default_value,
                              bs.inputs["Anisotropic"].default_value,
                              [(x.name,x.inputs["To Min"].default_value,x.inputs["To Max"].default_value) for x in n if x.type=="MAP_RANGE"],
                              [(x.name,x.inputs["Strength"].default_value,x.inputs["Distance"].default_value) for x in n if x.type=="BUMP"],
                              [(x.name,list(x.inputs[1].default_value)) for x in n if x.type=="VECT_MATH" and x.operation=="MULTIPLY"]])
    light=[]
    for o in sorted((x for x in s.objects if x.type=="LIGHT"),key=lambda x:x.name):
        light.append([o.name,[list(r) for r in o.matrix_world],o.data.energy,o.data.shape,o.data.size,o.data.size_y,list(o.data.color)])
    c=s.camera
    return {"pid":os.getpid(),"components":len(geo),"triangles":sum(r[2] for r in geo),"geometry":digest(geo),
            "materials":digest(materials),"materialData":materials,"light":digest(light),
            "camera":digest([c.name,[list(r) for r in c.matrix_world],c.data.type,c.data.ortho_scale]),
            "studio":digest([list(s.world.node_tree.nodes.get("Background").inputs[0].default_value),s.world.node_tree.nodes.get("Background").inputs[1].default_value,
                            s.view_settings.view_transform,s.view_settings.exposure,s.cycles.samples,s.render.resolution_x,s.render.resolution_y,s.render.film_transparent])}
print("VF3D_JSON="+json.dumps(state()))
'''
# Single material intervention from visual comparison with RIF-06. Keep geometry, lights and camera fixed.
CORRECT=r'''
import bpy, json
changed=[]
for m in sorted(bpy.data.materials,key=lambda x:x.name):
    if not (m.name.startswith("Storie_") and m.name.rsplit("_",1)[-1].isdigit()):
        continue
    n=m.node_tree.nodes
    bs=n.get("Principled BSDF")
    old=list(bs.inputs["Base Color"].default_value)
    assert bs.inputs["Normal"].is_linked and bs.inputs["Roughness"].is_linked and bs.inputs["Tangent"].is_linked
    bs.inputs["Base Color"].default_value=(old[0]*.94,old[1]*.80,old[2]*.64,1)
    bs.inputs["Metallic"].default_value=.96
    bs.inputs["Anisotropic"].default_value=.44
    grain=bs.inputs["Roughness"].links[0].from_node
    assert grain.type=="MAP_RANGE"
    grain.inputs["To Min"].default_value=.30
    grain.inputs["To Max"].default_value=.43
    bump=bs.inputs["Normal"].links[0].from_node
    assert bump.type=="BUMP"
    bump.inputs["Strength"].default_value=.28
    bump.inputs["Distance"].default_value=.0018
    fine=bump.inputs["Height"].links[0].from_node
    stretch=fine.inputs["Vector"].links[0].from_node
    assert stretch.type=="VECT_MATH" and stretch.operation=="MULTIPLY"
    stretch.inputs[1].default_value=(22,145,180)
    changed.append(m.name)
assert len(changed)==12,changed
print("VF3D_JSON="+json.dumps({"changed":changed}))
'''

def render_code(label,view):
    loc={"obliqua":(2.9,-5.7,4.3),"frontale":(0,-6,2.4)}[view]
    assert label in ("baseline","candidate")
    return r'''
import bpy, hashlib, json, pathlib
from mathutils import Vector
s=bpy.context.scene
c=s.camera
old=c.matrix_world.copy()
oldpath=s.render.filepath
try:
    c.location=LOC
    c.rotation_euler=(Vector((0,0,.22))-c.location).to_track_quat("-Z","Y").to_euler()
    bpy.context.view_layer.update()
    matrix=[list(r) for r in c.matrix_world]
    s.render.filepath=PATH
    assert s.render.engine=="CYCLES" and s.cycles.device=="CPU"
    assert s.render.resolution_x==1024 and s.render.resolution_y==1024 and s.cycles.samples==48
    bpy.ops.render.render(write_still=True)
    b=pathlib.Path(PATH).read_bytes()
    print("VF3D_JSON="+json.dumps({"name":NAME,"sha256":hashlib.sha256(b).hexdigest(),"bytes":len(b),"camera":matrix}))
finally:
    c.matrix_world=old
    s.render.filepath=oldpath
    bpy.context.view_layer.update()
'''.replace("LOC",repr(loc)).replace("PATH",repr("/work/"+label+"-"+view+".png")).replace("NAME",repr(label+"-"+view+".png"))

def verify_png(p):
    raw=p.read_bytes()
    assert raw[:8]==b"\x89PNG\r\n\x1a\n"
    assert struct.unpack(">II",raw[16:24])==(1024,1024) and raw[25]==6
    return {"sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw)}

async def run():
    params=StdioServerParameters(command=sys.executable,args=["-m","qwen_mm_plugins_blender"],env=ENV)
    async with stdio_client(params) as (read,write):
        async with ClientSession(read,write) as session:
            init=await session.initialize()
            tools=await session.list_tools()
            names={x.name for x in tools.tools}
            assert len(names)==22 and {"execute_blender_code","get_scene_info","get_viewport_screenshot"}<=names
            async def call(name,args):
                r=await session.call_tool(name,args)
                assert not r.isError,r
                return r.content
            async def execute(code):
                blocks=await call("execute_blender_code",{"code":code})
                assert len(blocks)==1 and blocks[0].type=="text",blocks
                s=blocks[0].text
                assert s.startswith("Code executed successfully:"),s
                line=[x for x in s.removeprefix("Code executed successfully:").strip().splitlines() if x.startswith("VF3D_JSON=")]
                assert len(line)==1,s
                return json.loads(line[0].split("=",1)[1])
            async def screenshot(name):
                b=await call("get_viewport_screenshot",{"max_size":512})
                assert len(b)==1 and b[0].type=="image" and b[0].mimeType=="image/png",b
                raw=base64.b64decode(b[0].data,validate=True)
                assert raw[:8]==b"\x89PNG\r\n\x1a\n" and max(struct.unpack(">II",raw[16:24]))<=512
                (ROOT/name).write_bytes(raw)
                return {"sha256":hashlib.sha256(raw).hexdigest(),"bytes":len(raw)}
            before=await execute(STATE)
            assert before["components"]==15 and before["triangles"]==105568
            images={}
            viewportBefore=await screenshot("viewport-before.png")
            for view in ("obliqua","frontale"):
                r=await execute(render_code("baseline",view))
                assert verify_png(ROOT/r["name"])=={"sha256":r["sha256"],"bytes":r["bytes"]}
                images[r["name"]]=r
            change=await execute(CORRECT)
            after=await execute(STATE)
            assert all(before[k]==after[k] for k in ("pid","components","triangles","geometry","light","studio"))
            assert before["materials"]!=after["materials"]
            viewportAfter=await screenshot("viewport-after.png")
            for view in ("obliqua","frontale"):
                r=await execute(render_code("candidate",view))
                assert verify_png(ROOT/r["name"])=={"sha256":r["sha256"],"bytes":r["bytes"]}
                images[r["name"]]=r
                b=images["baseline-"+view+".png"]
                assert b["sha256"]!=r["sha256"] and b["camera"]==r["camera"]
            final=await execute(STATE)
            assert all(after[k]==final[k] for k in ("pid","geometry","materials","light","studio"))
            saved=await execute(r'''
import bpy,json,pathlib,hashlib
bpy.context.scene.render.filepath="//storie-render.png"
bpy.ops.wm.save_as_mainfile(filepath="/work/storie-B03-mcp-C1.blend")
p=pathlib.Path("/work/storie-B03-mcp-C1.blend")
print("VF3D_JSON="+json.dumps({"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"bytes":p.stat().st_size}))
''')
            p=ROOT/"storie-B03-mcp-C1.blend"
            assert saved=={"sha256":hashlib.sha256(p.read_bytes()).hexdigest(),"bytes":p.stat().st_size}
            evidence={"status":"ARTIST_DIRECTED_CANDIDATE_REVIEW_REQUIRED","cycle":1,"maxCycles":2,
              "protocolVersion":init.protocolVersion,"toolCount":len(names),"sameBlenderProcess":True,
              "masterSha256":"b3f343002bb84612672620d139be5b23e4a6dfc39c654367796146950847677f",
              "referenceSha256":"949d7fa1e5a0c2d4a276cb19c427932ebf00ae3b215f5b3890b2be196f05822b",
              "referenceInspectedOutsideRunner":True,"referenceBytesInRunner":False,
              "before":before,"after":after,"changedMaterials":change["changed"],"images":images,
              "viewportBefore":viewportBefore,"viewportAfter":viewportAfter,"candidate":saved,
              "autonomousAgentQualified":False,"artisticApproval":False,"publicationAuthorized":False}
            (ROOT/"artistic-evidence.json").write_text(json.dumps(evidence,indent=2))
            print(json.dumps({"status":evidence["status"],"changedMaterials":len(change["changed"]),"images":list(images)},indent=2))

asyncio.run(asyncio.wait_for(run(),timeout=300))
