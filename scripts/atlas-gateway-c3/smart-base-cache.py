"""SP-02: exact-key reuse of verified bay and ambient occlusion, never of a candidate."""
import argparse,hashlib,json,os,platform,shutil,subprocess,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve().parent
FILES={"atlas-c32":("campata.glb","campata.blend","campata.png","manifest.json"),"atlas-c32b":("geometry.glb","ao.png","campata-ao.glb","campata-ao.blend","bake.json","ao-manifest.json")}
DEPS=("bootstrap-blender.sh","preflight.py","bay-textured.py","verify-textured.py","bake-ao.py","embed-ao.py","locked-materials.py","materials.lock.json","acquire-materials.py","smart-base-cache.py")
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def record(p):
    assert p.is_file() and not p.is_symlink(),p
    return {"bytes":p.stat().st_size,"sha256":digest(p)}
def expected():return {f"{folder}/{name}" for folder,names in FILES.items() for name in names}
# v2: the hosted runner image label is provenance, not a productive dependency.
# Keep the pinned Blender distribution (bootstrap bytes), actual preflight versions,
# OS release, architecture, libc and host interpreter in the compatibility identity.
SCHEMA=2
def canonical_key(inputs,toolchain):
    return hashlib.sha256(json.dumps({"schema":SCHEMA,"inputs":inputs,"toolchain":toolchain},sort_keys=True).encode()).hexdigest()
def toolchain_identity(root):
    preflight=json.loads((root/"atlas-c3/preflight.json").read_text())
    assert preflight["glb"]=="PASS" and preflight["cyclesDenoising"]=="PASS" and preflight["denoiser"]=="OPENIMAGEDENOISE"
    version=os.environ["BLENDER_VERSION"]
    assert preflight["blender"].split()[0]==version and preflight["numpy"]
    release=platform.freedesktop_os_release()
    libc=os.confstr("CS_GNU_LIBC_VERSION")
    assert libc and platform.machine() and release["ID"] and release["VERSION_ID"]
    return {"system":platform.system(),"machine":platform.machine(),"runnerOS":os.environ["RUNNER_OS"],"runnerArch":os.environ["RUNNER_ARCH"],"distribution":release["ID"],"distributionVersion":release["VERSION_ID"],"libc":libc,"pythonImplementation":platform.python_implementation(),"pythonVersion":platform.python_version(),"blenderVersion":version,"blenderActual":preflight["blender"],"numpy":preflight["numpy"],"denoiser":preflight["denoiser"]}
def fingerprint_data(root):
    inputs={name:record(HERE/name) for name in DEPS}
    inputs["asset-manifest"]=record(root/"atlas-c32/assets/manifest.json")
    return inputs,toolchain_identity(root)
def fingerprint(root):
    inputs,toolchain=fingerprint_data(root)
    return canonical_key(inputs,toolchain)
def fingerprint_report(root):
    inputs,toolchain=fingerprint_data(root)
    return {"schema":SCHEMA,"key":canonical_key(inputs,toolchain),"inputs":inputs,"toolchain":toolchain,"runnerProvenance":{"ImageOS":os.environ.get("ImageOS","unknown"),"ImageVersion":os.environ.get("ImageVersion","unknown")}}
def fingerprint_selftest():
    inputs={"script":{"bytes":1,"sha256":"a"*64},"asset-manifest":{"bytes":1,"sha256":"b"*64}}
    tc={"system":"Linux","machine":"x86_64","runnerOS":"Linux","runnerArch":"X64","distribution":"ubuntu","distributionVersion":"24.04","libc":"glibc 2.39","pythonImplementation":"CPython","pythonVersion":"3.12.3","blenderVersion":"4.2.23","blenderActual":"4.2.23 LTS","numpy":"1.24.3","denoiser":"OPENIMAGEDENOISE"}
    key=canonical_key(inputs,tc)
    old=os.environ.get("ImageVersion")
    try:
        os.environ["ImageVersion"]="20261111.370.1"
        first=canonical_key(inputs,tc)
        os.environ["ImageVersion"]="20261111.127.1"
        assert first==canonical_key(inputs,tc)==key
    finally:
        if old is None:os.environ.pop("ImageVersion",None)
        else:os.environ["ImageVersion"]=old
    assert canonical_key(dict(reversed(list(inputs.items()))),dict(reversed(list(tc.items()))))==key
    for field in tc:
        assert canonical_key(inputs,{**tc,field:tc[field]+"-changed"})!=key,field
    for name in inputs:
        assert canonical_key({**inputs,name:{"bytes":1,"sha256":"c"*64}},tc)!=key,name
    print("SP-02 fingerprint v2: 17/17 PASS (image label invariant; ordering; 13 toolchain fields; 2 byte dependencies)")
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
    assert receipt["schema"]==SCHEMA and receipt["key"]==key
    assert set(receipt["files"])==expected()
    for n,r in receipt["files"].items():assert record(cache/n)==r,n
    assert {p.relative_to(cache).as_posix() for p in cache.rglob("*") if p.is_file()}==expected()|{"cache-manifest.json"}
def selftest():
    with tempfile.TemporaryDirectory() as tmp:
        cache=Path(tmp);key="a"*64
        for n in sorted(expected()):
            p=cache/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(n.encode())
        (cache/"cache-manifest.json").write_text(json.dumps({"schema":SCHEMA,"key":key,"files":{n:record(cache/n) for n in sorted(expected())}}))
        validate_cache(cache,key)
        def rejects(fn):
            try:fn()
            except (AssertionError,FileNotFoundError,ValueError):return
            raise AssertionError("negative cache test unexpectedly accepted")
        rejects(lambda:validate_cache(cache,"b"*64))
        target=cache/"atlas-c32/campata.blend";original=target.read_bytes()
        target.write_bytes(b"corrupted");rejects(lambda:validate_cache(cache,key));target.write_bytes(original)
        target.unlink();rejects(lambda:validate_cache(cache,key));target.write_bytes(original)
        extra=cache/"unexpected.txt";extra.write_text("extra");rejects(lambda:validate_cache(cache,key));extra.unlink()
        validate_cache(cache,key)
        print("SP-02 cache integrity: 6/6 PASS (synthetic bytes; real Blender validation separate)")
def main():
    if sys.argv[1:]==["--selftest"]:selftest();fingerprint_selftest();return
    ap=argparse.ArgumentParser();ap.add_argument("mode",choices=["key","restore","save","verify"]);ap.add_argument("root",type=Path);args=ap.parse_args();root=args.root;cache=root/"atlas-smart-base";key=fingerprint(root)
    if args.mode=="key":
        report=fingerprint_report(root)
        assert report["key"]==key
        (root/"atlas-c3/base-fingerprint.json").write_text(json.dumps(report,indent=2,sort_keys=True)+"\n")
        print(json.dumps(report,sort_keys=True))
        if os.environ.get("GITHUB_OUTPUT"):
            with open(os.environ["GITHUB_OUTPUT"],"a") as f:f.write(f"key=atlas-smart-base-v2-{key}\n")
        return
    if args.mode=="verify":
        inspect(root,root)
    elif args.mode=="restore":
        validate_cache(cache,key)
        for n in sorted(expected()):
            q=root/n;q.parent.mkdir(parents=True,exist_ok=True);assert not q.exists(),q;shutil.copy2(cache/n,q)
        inspect(root,root)
    else:
        inspect(root,root)
        assert not cache.exists(),cache
        for n in sorted(expected()):
            q=cache/n;q.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(root/n,q)
        (cache/"cache-manifest.json").write_text(json.dumps({"schema":SCHEMA,"key":key,"files":{n:record(cache/n) for n in sorted(expected())}},indent=2)+"\n")
        validate_cache(cache,key)
    print(json.dumps({"status":"PASS","mode":args.mode,"dependencyKey":key,"verifiedFiles":len(expected()),"candidateReused":False}))
if __name__=="__main__":main()
