"""SP-01: select a conservative production mode and exactly one active candidate."""
import argparse,json,os,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
DIR="scripts/atlas-gateway-c3/"
CONFIG=DIR+"smart-production.json"
HISTORICAL={"library-composition","master-architecture","master-materials","master-scenography","master-lighting","master-portals","refine-portals","refine-environment","refine-cupola","refine-arch"}
def validate(data):
    assert data["schemaVersion"]==1 and type(data["previewEnabled"]) is bool
    a=data["active"]
    assert re.fullmatch(r"C3\.3A[0-9][A-Za-z0-9.]*",a["phase"])
    assert re.fullmatch(r"library-master-[a-z0-9-]+\.py",a["script"])
    assert re.fullmatch(r"atlas-[a-z0-9-]+",a["artifact"])
    assert a["historicalJob"] is None or a["historicalJob"] in HISTORICAL
    assert not data["previewEnabled"] or a["script"]=="library-master-arch.py"
    return a
def choose(requested,changes,active,event,preview_enabled=False):
    if requested=="fast":
        if event!="workflow_dispatch" or not preview_enabled or active["script"]!="library-master-arch.py":raise ValueError("FAST requires explicit dispatch and supported preview adapter")
        return "fast","explicit non-qualifying artistic preview"
    if requested=="full":return "full","explicit full request"
    if event=="workflow_dispatch":return "qualify","explicit current-candidate qualification"
    if changes is None:return "full","change range unavailable"
    allowed={DIR+active["script"],CONFIG}
    relevant=[p for p in changes if p.startswith(DIR) or p.startswith(".github/workflows/") or p=="package.json" or p=="pnpm-lock.yaml"]
    shared=[p for p in relevant if p not in allowed]
    if shared:return "full","shared or historical dependency changed"
    return "qualify","current candidate only"
def changed(before,head):
    if not re.fullmatch(r"[0-9a-f]{40}",before or "") or not re.fullmatch(r"[0-9a-f]{40}",head or "") or before=="0"*40:return None
    try:
        raw=subprocess.check_output(["git","-C",str(ROOT),"diff","--name-only","--no-renames","-z",before,head],stderr=subprocess.DEVNULL)
        return [x.decode("utf-8") for x in raw.split(b"\x00") if x]
    except (subprocess.CalledProcessError,UnicodeError):return None
def selftest():
    a={"script":"library-master-arch.py"}
    for requested,paths,event,want in [
        ("qualify",[DIR+a["script"]],"pull_request","qualify"),
        ("qualify",[CONFIG,DIR+a["script"]],"pull_request","qualify"),
        ("qualify",[DIR+"library-master-cupola.py"],"pull_request","full"),
        ("qualify",[DIR+"materials.lock.json"],"pull_request","full"),
        ("qualify",[".github/workflows/atlas-gateway-c3-bay.yml"],"pull_request","full"),
        ("qualify",None,"pull_request","full"),
        ("full",[],"workflow_dispatch","full"),
        ("qualify",None,"workflow_dispatch","qualify"),
        ("qualify",["package.json"],"pull_request","full"),
        ("qualify",["docs/atlas-gateway/AG-04C3-FILIERA-3D.md"],"pull_request","qualify"),
    ]:
        assert choose(requested,paths,a,event)[0]==want,(requested,paths,event)
    print("SP-01 selection: 10/10 PASS")
    assert choose("fast",None,a,"workflow_dispatch",True)[0]=="fast"
    for candidate,event,enabled in [(a,"pull_request",True),(a,"workflow_dispatch",False),({"script":"library-master-cupola.py"},"workflow_dispatch",True)]:
        try:choose("fast",None,candidate,event,enabled)
        except ValueError:pass
        else:raise AssertionError("invalid FAST accepted")
    assert choose("qualify",[DIR+a["script"]],a,"pull_request",True)[0]=="qualify"
    assert choose("qualify",[DIR+"smart-preview.py"],a,"pull_request",True)[0]=="full"
    print("SP-03 mode isolation: 6/6 PASS")
def main():
    ap=argparse.ArgumentParser();ap.add_argument("--selftest",action="store_true");ap.add_argument("--requested",choices=["qualify","full","fast"],default="qualify");ap.add_argument("--event",default="pull_request");ap.add_argument("--before",default="");ap.add_argument("--head",default="");args=ap.parse_args()
    if args.selftest:selftest();return
    config=json.loads((ROOT/CONFIG).read_text());a=validate(config)
    script=ROOT/DIR/a["script"];assert script.is_file() and not script.is_symlink()
    mode,reason=choose(args.requested,changed(args.before,args.head),a,args.event,config["previewEnabled"])
    result={"mode":mode,"phase":a["phase"],"script":a["script"],"artifact":a["artifact"],"historical_job":a["historicalJob"] or "none","reason":reason,"preview_enabled":str(config["previewEnabled"]).lower()}
    print(json.dumps(result,indent=2))
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"],"a") as f:
            for k,v in result.items():f.write(f"{k}={v}\n")
if __name__=="__main__":main()
