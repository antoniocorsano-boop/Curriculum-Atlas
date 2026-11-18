"""Pinned C3.2A asset contract. Never accept changed bytes or query live metadata."""
import hashlib, importlib.util, json, pathlib, shutil, sys, tempfile
HERE=pathlib.Path(__file__).resolve().parent
LOCK=HERE/"materials.lock.json"
MANIFEST_SHA="10ff96576c75b974f9a984189a35214a4478b23c43e3731e0d1c7694d2f6dbe1"
spec=importlib.util.spec_from_file_location("acquisition",HERE/"acquire-materials.py")
acq=importlib.util.module_from_spec(spec);spec.loader.exec_module(acq)

def require(condition,message):
    if not condition: raise ValueError(message)

def locked():
    b=LOCK.read_bytes()
    require(hashlib.sha256(b).hexdigest()==MANIFEST_SHA,"lock digest mismatch")
    m=json.loads(b)
    require(m["license"]=="CC0-1.0" and len(m["files"])==7,"lock contract")
    return b,m

def check_bytes(b,item):
    require(len(b)==item["bytes"],"size mismatch: "+item["name"])
    require(hashlib.sha256(b).hexdigest()==item["sha256"],"SHA-256 mismatch: "+item["name"])
    require(hashlib.md5(b).hexdigest()==item["md5"],"MD5 mismatch: "+item["name"])
    require(b.startswith((b"#?RADIANCE",b"#?RGBE")) if item["name"].endswith(".hdr") else b.startswith(b"\xff\xd8"),"format mismatch: "+item["name"])

def verify(out):
    b,m=locked()
    require((out/"manifest.json").read_bytes()==b,"manifest differs from reviewed lock")
    for item in m["files"]:
        p=out/item["name"]
        require(p.is_file() and not p.is_symlink(),"missing or unsafe source: "+item["name"])
        check_bytes(p.read_bytes(),item)
    print("LOCK PASS: seven source files match archived reviewed bytes",flush=True)

def recover(out):
    b,m=locked()
    require(not out.exists() or not any(out.iterdir()),"refuse to overwrite existing bundle")
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=out.parent) as tmp:
        staging=pathlib.Path(tmp)/"verified";staging.mkdir()
        for item in m["files"]:
            data=acq.get(item["url"],item["bytes"]);check_bytes(data,item)
            (staging/item["name"]).write_bytes(data)
        (staging/"manifest.json").write_bytes(b);verify(staging)
        if out.exists():out.rmdir()
        shutil.move(str(staging),str(out))
    print("RECOVERY PASS: direct pinned URLs, no dynamic metadata",flush=True)

def negative(out):
    b,m=locked();verify(out)
    item=m["files"][0];data=(out/item["name"]).read_bytes()
    for bad in (data[:-1],bytes([data[0]^1])+data[1:]):
        try:check_bytes(bad,item)
        except ValueError:pass
        else:raise AssertionError("corrupt asset accepted")
    with tempfile.TemporaryDirectory() as t:
        root=pathlib.Path(t)
        shutil.copytree(out,root/"bundle");copy=root/"bundle"
        (copy/"manifest.json").write_bytes(b+b" ")
        try:verify(copy)
        except ValueError:pass
        else:raise AssertionError("modified manifest accepted")
        (copy/"manifest.json").write_bytes(b);(copy/item["name"]).unlink()
        try:verify(copy)
        except ValueError:pass
        else:raise AssertionError("missing asset accepted")
    print("NEGATIVE PASS: truncated bytes, corrupt bytes, altered manifest, missing file",flush=True)

if __name__=="__main__":
    if len(sys.argv)!=3:raise SystemExit("Usage: locked-materials.py verify|recover|negative OUT")
    {"verify":verify,"recover":recover,"negative":negative}[sys.argv[1]](pathlib.Path(sys.argv[2]))
