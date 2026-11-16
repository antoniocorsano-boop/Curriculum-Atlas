"""SP-02: exact-key reuse of verified bay and ambient occlusion, never of a candidate."""
import argparse,hashlib,json,os,shutil,subprocess,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
FILES={"atlas-c32":("campata.glb","campata.blend","campata.png","manifest.json"),"atlas-c32b":("geometry.glb","ao.png","campata-ao.glb","campata-ao.blend","bake.json","ao-manifest.json")}
DEPS=("bootstrap-blender.sh","preflight.py","bay-textured.py","verify-textured.py","bake-ao.py","embed-ao.py","locked-materials.py","materials.lock.json","acquire-materials.py","smart-base-cache.py")
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def record(p):
    assert p.is_file() and not p.is_symlink(),p
    return {"bytes":p.stat().st_size,"sha256":digest(p)}
def expected():return {f"{folder}/{name}" for folder,names in FILES.items() for name in names}
def fingerprint(root):
    inputs={name:record(HERE/name) for name in DEPS}
    inputs["asset-manifest"]=record(root/"atlas-c32/assets/manifest.json")
    return hashlib.sha256(json.dumps({"schema":1,"inputs":inputs,"runner":{k:os.environ.get(k,"unknown") for k in ("RUNNER_OS","RUNNER_ARCH","ImageOS","ImageVersion","BLENDER_VERSION")}},sort_keys=True).encode()).hexdigest()
def inspect(root,base):
    subprocess.run([sys.executable,str(HERE/"verify-textured.py"),str(root/"atlas-c32")],check=True)
    ao=base/"atlas-c32b";m=json.loads((ao/"ao-manifest.json").read_text());b=json.loads((ao/"bake.json").read_text())
    assert m["status"]=="PASS" and m["studentAuthorized"] is False and m["fullLightBake"] is False
    assert set(m["files"])=={"ao.png","campata-ao.glb","campata-ao.blend","bake.json"}
    for n,r in m["files"].items():assert record(ao/n)==r,n
    assert b["sourceBlendSha256"]==digest(root/"atlas-c32/campata.blend")
    # Independently rerun the original embedding/GLB/UV contract without changing cached bytes.
    with tempfile.TemporaryDirectory() as tmp:
        q=Path(tmp)
        for n in ("geometry.glb","ao.png","campata-ao.blend","bake.json"):shutil.copy2(ao/n,q/n)
        subprocess.run([sys.executable,str(HERE/"embed-ao.py"),str(q)],check=True)
        assert digest(q/"campata-ao.glb")==digest(ao/"campata-ao.glb")
        assert json.loads((q/"ao-manifest.json").read_text())==m
def validate_cache(cache,key):
    receipt=json.loads((cache/"cache-manifest.json").read_text())
    assert receipt["schema"]==1 and receipt["key"]==key
    assert set(receipt["files"])==expected()
    for n,r in receipt["files"].items():assert record(cache/n)==r,n
    assert {p.relative_to(cache).as_posix() for p in cache.rglob("*") if p.is_file()}==expected()|{"cache-manifest.json"}
def main():
    ap=argparse.ArgumentParser();ap.add_argument("mode",choices=["key","restore","save"]);ap.add_argument("root",type=Path);args=ap.parse_args();root=args.root;cache=root/"atlas-smart-base";key=fingerprint(root)
    if args.mode=="key":
        print(key)
        if os.environ.get("GITHUB_OUTPUT"):
            with open(os.environ["GITHUB_OUTPUT"],"a") as f:f.write(f"key=atlas-smart-base-v1-{key}\n")
        return
    if args.mode=="restore":
        validate_cache(cache,key)
        for n in sorted(expected()):
            q=root/n;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists(),q;shutil.copy2(cache/n,q)
        inspect(root,root)
    else:
        inspect(root,root)
        assert not cache.exists(),cache
        for n in sorted(expected()):
            q=cache/n;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/n,q)
        (cache/"cache-manifest.json").write_text(json.dumps({"schema":1,"key":key,"files":{n:record(cache/n) for n in sorted(expected())}},indent=2)+"\n")
        validate_cache(cache,key)
    print(json.dumps({"status":"PASS","mode":args.mode,"dependencyKey":key,"verifiedFiles":len(expected()),"candidateReused":False}))
if __name__=="__main__":main()
