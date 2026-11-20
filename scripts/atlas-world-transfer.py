"""AWC-F: strict second-world adapter; uses AWC/ASD, not a competing composer.

Only a non-canonical 3D technical fixture. The Museo Zero 2-D narrative
and interactive experience remain the source and are never modified.
"""
import argparse,hashlib,importlib.util,json,math,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SPEC=ROOT/"ops/atlas-scene-package/awc-museo-zero-transfer.json"
spec=importlib.util.spec_from_file_location("awc_core",ROOT/"scripts/atlas-world-compose.py")
awc=importlib.util.module_from_spec(spec);spec.loader.exec_module(awc)
need=awc.require
def hashfile(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def read(path):return awc.ev.strict_json(Path(path).read_bytes())
def vec(v,n):
    need(type(v) is list and len(v)==n and all(type(x) in (int,float) and math.isfinite(x) for x in v),"vector")
def make_transfer(definition,source,prior):
    need(type(definition) is dict and set(definition)=={"schema","mode","version","world","scene","status","storySource","reused","sceneSpec","testSequence","authority"},"transfer shape")
    need(definition["schema"]=="atlas.awc.world-transfer/v1" and definition["mode"]=="ISOLATED_LAB_ONLY" and definition["world"]=="museo-zero.transfer" and definition["scene"]=="sala-zero.projection-cue" and definition["status"]=="EXPERIMENT_ONLY","transfer boundary")
    need(type(definition["authority"]) is dict and definition["authority"] and all(x is False for x in definition["authority"].values()),"authority")
    story=definition["storySource"]
    need(story["revision"]=="e1dad70bbe2e05d9ab023c8af18c748adc5e27ed" and story["pr"]==83 and story["blob"]=="64e60499784c6aa2964f08d05eff8d97ee0f76ed","story identity")
    raw=source.read_bytes()
    need(awc.ev.awc.blob_sha(raw)==story["blob"],"story file drift")
    text=raw.decode("utf-8")
    for item in story["places"]+["type Source = \"A\" | \"B\"","sensore","trigger","SINCRONO","RITARDO"]:
        need(item in text,"canonical source marker absent: "+item)
    need(story["places"]==["Sala Zero","Ingresso","Cabina regia","Laboratorio"] and story["simulatedSignals"]==["A","B"] and story["visualAuthority"] is False,"story scope")
    transfer=definition["reused"];previous=transfer["previousEArtifact"]
    need(transfer["parameter"]=="camera.orbit" and transfer["target"]=="webgl" and transfer["unit"]=="rad" and transfer["baseline"]==0 and transfer["variant"]==.12 and transfer["control"]=="orbit-around-z","shared parameter")
    need(previous["id"]==14561219779 and previous["sha256"]=="85ebd1ed25835b2c7724ad9266eb3edc47445e949f0b7645064d8527fcef3548","E identity")
    need(hashfile(prior)==previous["sha256"],"E archive drift")
    with zipfile.ZipFile(prior) as z:
        e=awc.ev.strict_json(z.read("dual-derivation.json"))
    need(e["schema"]=="atlas.awc.dual-derivation/v1" and e["status"]=="PASS_AWC_E_DUAL_DERIVATION" and e["mode"]=="ISOLATED_LAB_ONLY" and e["producerRevision"]==transfer["sourceProducerRevision"],"E qualification missing")
    need(all(e["authority"][k] is False for k in e["authority"]) and e["readyForProduction"] is False and e["publishable"] is False,"E authority")
    catalog,index,evidence,registry,master,policy,production=awc.inputs()
    domain=awc.asd.specs(registry,master,transfer["target"])[transfer["parameter"]]
    for v in (transfer["baseline"],transfer["variant"]):awc.asd.validate_value(domain,v)
    need(domain["baseline"]==transfer["baseline"] and domain["unit"]==transfer["unit"] and registry["mode"]=="PLAN_ONLY","ASD contract")
    scene=definition["sceneSpec"];camera=scene["camera"];world=scene["world"]
    need(type(scene["objects"]) is list and 12<=len(scene["objects"])<=40 and type(scene["materials"]) is dict,"scene inventory")
    need(camera["fov"]==42 and camera["width"]==640 and camera["height"]==480 and camera["distance"]>0 and 0<camera["elevation"]<1,"camera fixture")
    need(camera["near"]>0 and camera["far"]>camera["distance"],"clipping")
    vec(camera["center"],3);vec(world["lightPosition"],3)
    seen=set()
    for o in scene["objects"]:
        need(set(o) in ({"id","material","position","size"},{"id","material","position","size","semantic"}),"object shape")
        need(o["id"] not in seen and type(o["id"]) is str and o["id"],"duplicate object")
        seen.add(o["id"]);need(o["material"] in scene["materials"],"missing material")
        vec(o["position"],3);vec(o["size"],3)
        need(all(x>0 for x in o["size"]),"invalid object extent")
    need(len(seen)==len(scene["objects"]) and {"sensor-A","sensor-B","screen"}<=seen,"required narrative scene objects")
    for m in scene["materials"].values():
        need(type(m) is dict and m["color"].startswith("#") and len(m["color"])==7 and 0<=m["roughness"]<=1,"material shape")
        need(all(k in ("color","roughness","metalness") for k in m),"material authority")
    seq=definition["testSequence"]
    need(seq==[{"id":"reference","orbit":0,"signal":"A"},{"id":"rotated","orbit":.12,"signal":"A"},{"id":"restored","orbit":0,"signal":"A"},{"id":"cue-B","orbit":0,"signal":"B"}],"scenario sequence")
    def eye(orbit):
        t=camera["azimuth"]+orbit;d=camera["distance"];h=camera["elevation"];c=camera["center"]
        return [c[0]+d*math.cos(h)*math.sin(t),c[1]-d*math.cos(h)*math.cos(t),c[2]+d*math.sin(h)]
    frames=[{"id":s["id"],"orbit":s["orbit"],"signal":s["signal"],"eye":eye(s["orbit"]),"target":camera["center"]} for s in seq]
    result={"schema":"atlas.awc.transfer-plan/v1","status":"SCENE_PLAN_READY","mode":"ISOLATED_LAB_ONLY",
            "world":definition["world"],"scene":definition["scene"],
            "sceneSpecSha256":hashfile(SPEC),"storyRevision":story["revision"],"storyBlob":story["blob"],
            "reused":{"parameter":transfer["parameter"],"unit":transfer["unit"],"baseline":transfer["baseline"],
                      "variant":transfer["variant"],"asdRegistrySha256":awc.asd.digest(registry),
                      "adapter":"museo-zero-camera-v1; same typed orbit contract, new scene binding",
                      "libraryEArtifactSha256":previous["sha256"],"libraryCompositionPlanSha256":e["compositionPlanSha256"]},
            "frames":frames,"camera":camera,"worldEnvironment":world,"materials":scene["materials"],
            "objects":scene["objects"],"targetTriangles":len(seen)*12,
            "pedagogicalScope":"simulated sensor A/B; four MZ locales remain in authored 2D experience; 3D Sala Zero technical fixture only",
            "sourceNarrative":story["narrative"],"transferReference":story["transferReference"],
            "authority":definition["authority"],"readyForProduction":False,"studentAuthorized":False,
            "publishable":False,"artisticApproval":False,"deviceQualified":False,"curricoloAuthorityChanged":False}
    result["planSha256"]=awc.asd.digest(result)
    return result

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--story",type=Path,required=True);p.add_argument("--prior",type=Path,required=True)
    p.add_argument("--out",type=Path,required=True)
    args=p.parse_args()
    result=make_transfer(read(SPEC),args.story,args.prior)
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/"transfer-plan.json").write_text(json.dumps(result,sort_keys=True,indent=2,ensure_ascii=False,allow_nan=False)+"\n")
    print("AWC-F TRANSFER PLAN",result["planSha256"],"objects",len(result["objects"]))
if __name__=="__main__":main()
