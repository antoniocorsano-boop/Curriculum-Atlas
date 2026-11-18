"""A5.4c: source-locked atmospheric and lighting study; architecture preserved."""
import hashlib,sys
from pathlib import Path
base=Path(__file__).resolve().parent
PARENT="library-master-vegetation-study.py"
PARENT_BLOB="3445c231ad9075b1651fa2a2ae986b28dd0a0a84"
END='exec(compile(code,'+'__file__,"exec"),globals())'
def once(code,old,new):
    assert code.count(old)==1,old[:140]
    return code.replace(old,new,1)
def between(code,start,end,replacement):
    assert code.count(start)==1 and code.count(end)==1
    a=code.index(start);b=code.index(end,a)
    return code[:a]+replacement+"\n"+code[b:]
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

SKY="""
# A5.4c: elongated cloud bands and fine cloud edges, with a single directional solar glow.
# Work in spherical coordinates to preserve seamless equirectangular wrapping.
n=.52*noise3(sx*5.5,sy*10.5,sz*7.0,118)+.27*noise3(sx*13,sy*24,sz*18,311)+.14*noise3(sx*30,sy*46,sz*35,721)+.07*noise3(sx*65,sy*85,sz*60,991)
band=np.clip((n-.45)/.23,0,1)
band=band*band*(3-2*band)
coverage=band*np.clip(zup/.16,0,1)*np.clip((1-zup)/.24,.28,1)
t=np.power(zup,.58)
low=np.array([.72,.80,.84],dtype=np.float32);high=np.array([.23,.40,.58],dtype=np.float32)
blue=low[None,None,:]*(1-t[:,:,None])+high[None,None,:]*t[:,:,None]
solar_dot=np.clip(sx*cos(solar_elevation)*cos(solar_rotation)+sy*cos(solar_elevation)*sin(solar_rotation)+sz*sin(solar_elevation),0,1)
glow=np.power(solar_dot,12)*np.clip(zup/.15,0,1)
blue+=glow[:,:,None]*np.array([.13,.075,.018],dtype=np.float32)
# Bright cloud edge, shaded core; no painted sun disc or photographic ground.
cloudshade=np.clip(.69+.20*band+.13*glow,.68,1.02)
white=cloudshade[:,:,None]*np.array([1.0,.985,.955],dtype=np.float32)
rgb=np.clip(blue*(1-coverage[:,:,None])+white*coverage[:,:,None],0,1.25)
"""
# The GLB uses the revised landscape palette. A separate offline shading pass adds
# metric-scale color variation and depth, deliberately NOT represented as exported textures.
LAND="""
# A5.4c: distance-dependent atmospheric color and softly irregular fields.
# Offline Cycles only; no geometry, fog volume, extra texture or network resource.
terrain_profiles=[]
for i,mat in enumerate(hillm):
    t=mat.node_tree;p=t.nodes.get("Principled BSDF");nodes=t.nodes;links=t.links
    color=tuple(p.inputs["Base Color"].default_value)
    geo=nodes.new("ShaderNodeNewGeometry")
    noise=nodes.new("ShaderNodeTexNoise");noise.inputs["Scale"].default_value=.18
    noise.inputs["Detail"].default_value=2.0;links.new(geo.outputs["Position"],noise.inputs["Vector"])
    tones=nodes.new("ShaderNodeValToRGB");tones.color_ramp.elements[0].position=.18;tones.color_ramp.elements[1].position=.82
    tones.color_ramp.elements[0].color=tuple(c*.72 for c in color[:3])+(1,)
    tones.color_ramp.elements[1].color=tuple(min(1,c*1.24) for c in color[:3])+(1,)
    links.new(noise.outputs["Fac"],tones.inputs["Fac"])
    sep=nodes.new("ShaderNodeSeparateXYZ");links.new(geo.outputs["Position"],sep.inputs[0])
    dist=nodes.new("ShaderNodeMapRange");dist.inputs["From Min"].default_value=31;dist.inputs["From Max"].default_value=140
    dist.inputs["To Min"].default_value=0;dist.inputs["To Max"].default_value=.67
    links.new(sep.outputs["Y"],dist.inputs["Value"])
    blend=nodes.new("ShaderNodeMixRGB");blend.inputs[2].default_value=(.40,.48,.50,1)
    links.new(dist.outputs["Result"],blend.inputs[0]);links.new(tones.outputs["Color"],blend.inputs[1])
    links.new(blend.outputs["Color"],p.inputs["Base Color"])
    terrain_profiles.append({"material":mat.name,"noiseScale":.18,"distanceRange":[31,140],"maxHazeMix":.67})
"""
RECEIPT="""
# Verify actual light objects and record the new study, separate from predecessor receipts.
shelf_lights=[o for o in scene.objects if o.type=="LIGHT" and o.name.startswith("Warm shelf wash")]
crown_lights=[o for o in scene.objects if o.type=="LIGHT" and o.name.startswith("Indirect upper crown wash")]
shelf_watts=[float(o.data.energy) for o in shelf_lights];crown_watts=[float(o.data.energy) for o in crown_lights]
assert len(shelf_watts)==36 and len(crown_watts)==8 and len(set(shelf_watts))>=3 and len(set(crown_watts))>=3
assert sum(o.type=="LIGHT" and o.data.type=="SUN" for o in scene.objects)==1
atmosphere_study={"phase":"C3.3A5.4c","parent":"C3.3A5.4b","parentBlob":"3445c231ad9075b1651fa2a2ae986b28dd0a0a84","architectureChanged":False,"camerasChanged":False,"vegetationRetained":True,"materialStudyRetained":True,"lightRigChanged":True,"terrainGeometryChanged":False,"terrainProfiles":terrain_profiles,"offlineTerrainShadingExported":False,"arenaMaterial":"Arena patinated bronze","arenaInscriptionCount":1,"arenaGeometryChanged":False,"shelfWatts":shelf_watts,"crownWatts":crown_watts,"cameraSkyStrength":.93,"ambientStrength":.27,"sunEnergy":1.85,"sunAngleDeg":3.2,"skyPanoramaSha256":lighting_receipt["skyPanoramaSha256"],"browserQualified":False,"artisticApproval":False,"studentAuthorized":False}
(out/"atmosphere-study.json").write_text(json.dumps(atmosphere_study,indent=2)+"\\n")
"""
if len(sys.argv)>1 and sys.argv[1]=="--verify":
    code=parent_source(True)
    code=once(code,'m["phase"]=="C3.3A5.4b"','m["phase"]=="C3.3A5.4c"')
    code=once(code,'"phase":"C3.3A5.4b"','"phase":"C3.3A5.4c"')
    code=once(code,'vegetation["phase"]==m["phase"]','vegetation["phase"]=="C3.3A5.4b"')
    code=once(code,'ls["sunEnergy"]==2.2','ls["sunEnergy"]==1.85')
    code=once(code,'(p/"library-verification.json").write_text', '''atmosphere=json.loads((p/"atmosphere-study.json").read_text())
assert atmosphere["phase"]==m["phase"] and atmosphere["parent"]=="C3.3A5.4b" and atmosphere["parentBlob"]=="3445c231ad9075b1651fa2a2ae986b28dd0a0a84"
assert "atmosphere-study.json" in m["files"] and m["atmosphereRefinement"] is True
assert all(atmosphere[k] is False for k in ("architectureChanged","camerasChanged","terrainGeometryChanged","offlineTerrainShadingExported","arenaGeometryChanged","browserQualified","artisticApproval","studentAuthorized"))
assert atmosphere["vegetationRetained"] and atmosphere["materialStudyRetained"] and atmosphere["lightRigChanged"]
assert atmosphere["arenaInscriptionCount"]==1 and atmosphere["arenaMaterial"]=="Arena patinated bronze"
assert any(q.get("name")=="Arena patinated bronze" for q in d["materials"])
assert sum(q.get("name")=="Shell Arena patinated bronze" for q in d["nodes"])==1
assert len(atmosphere["terrainProfiles"])==3 and all(q["maxHazeMix"]==.67 for q in atmosphere["terrainProfiles"])
assert atmosphere["skyPanoramaSha256"]==ls["skyPanoramaSha256"]
assert ls["ambientStrength"]==.27 and ls["cameraSkyStrength"]==.93 and ls["sunAngleDeg"]==3.2
assert len(atmosphere["shelfWatts"])==36 and len(set(atmosphere["shelfWatts"]))>=3 and len(atmosphere["crownWatts"])==8 and len(set(atmosphere["crownWatts"]))>=3
receipt.update({"atmosphereRefinement":True,"terrainProfiles":3,"shelfLightCount":36,"crownLightCount":8,"arenaMaterial":"Arena patinated bronze","offlineTerrainShadingExported":False})
(p/"library-verification.json").write_text''')
    sys.argv=[sys.argv[0],sys.argv[2]]
else:
    code=parent_source(False)
    code=once(code,'hillm=[material("Landscape "+str(i),c,.93) for i,c in enumerate([(.28,.35,.18),(.20,.30,.23),(.32,.40,.42)])]','hillm=[material("Landscape "+str(i),c,.93) for i,c in enumerate([(.24,.30,.14),(.17,.24,.16),(.32,.40,.43)])]')
    code=once(code,'for t in (0.0,):\n    text("ARENA crown","ARENA",(9.19*sin(t),9.19*cos(t),11.04),.72,brass,(pi/2,0,-t))','arena_bronze=material("Arena patinated bronze",(.12,.075,.035),.43,.62)\nfor t in (0.0,):\n    text("ARENA crown","ARENA",(9.19*sin(t),9.19*cos(t),11.04),.72,arena_bronze,(pi/2,0,-t))')
    code=once(code,'area("Warm shelf wash",local(0,-.60,2.50),local(0,.02,1.25),70,(1,.79,.56),1.40)','area("Warm shelf wash",local(0,-.60,2.50),local(0,.02,1.25),[46,61,75][(i+level*2)%3],(1,.84,.68),1.65)')
    code=once(code,'world=bpy.data.worlds.new("Locked photographic daylight")',LAND+'\nworld=bpy.data.worlds.new("Locked photographic daylight")')
    code=once(code,'light.inputs["Strength"].default_value=.22','light.inputs["Strength"].default_value=.27')
    code=between(code,"# Wispy high clouds plus separated rounded cloud banks, faded at the horizon.","rgba=np.ones((sh,sw,4)",SKY)
    code=once(code,'visible.inputs["Strength"].default_value=.80','visible.inputs["Strength"].default_value=.93')
    code=once(code,'sun_data.energy=2.2;sun_data.angle=math.radians(1.4);sun_data.color=(1.0,.87,.70)','sun_data.energy=1.85;sun_data.angle=math.radians(3.2);sun_data.color=(1.0,.91,.79)')
    code=once(code,'area("Cool diffuse skylight",(0,-1,12.8),(0,0,0),1050,(.78,.89,1),8.0)','area("Cool diffuse skylight",(0,-1,12.8),(0,0,0),870,(.85,.93,1),9.0)')
    code=once(code,'area("Warm frontal fill",(0,-7,5),(0,5,3),95,(1,.91,.82),5)','area("Warm frontal fill",(0,-7,5),(0,5,3),120,(1,.93,.86),6)')
    code=once(code,'(9.5*sin(t),9.5*cos(t),11.0),75,(1,.77,.51),1.1)','(9.5*sin(t),9.5*cos(t),11.0),[48,56,68,54,44,54,68,56][i],(1,.85,.66),1.5)')
    code=once(code,'scene.view_settings.look="AgX - Medium High Contrast"','scene.view_settings.look="AgX - Medium High Contrast"')
    for old,new in [('"ambientStrength":.22','"ambientStrength":.27'),('"cameraSkyStrength":.80','"cameraSkyStrength":.93'),('"sunEnergy":2.2','"sunEnergy":1.85'),('"sunAngleDeg":1.4','"sunAngleDeg":3.2'),('"skyFillWatts":1050','"skyFillWatts":870'),('"frontalFillWatts":95','"frontalFillWatts":120'),('"crownWashWatts":75','"crownWashWatts":[48,56,68,54,44,54,68,56]'),('"shelfWashWatts":70','"shelfWashWatts":[46,61,75]')]:
        code=once(code,old,new)
    code=once(code,'scene.render.engine="CYCLES";scene.cycles.device="CPU"',RECEIPT+'\nscene.render.engine="CYCLES";scene.cycles.device="CPU"')
    code=once(code,'receipt={"phase":"C3.3A5.4b"','receipt={"phase":"C3.3A5.4c","atmosphereRefinement":True')
    code=once(code,'"material-study.json","vegetation-study.json"):','"material-study.json","vegetation-study.json","atmosphere-study.json"):')
exec(compile(code,__file__,"exec"),globals())
