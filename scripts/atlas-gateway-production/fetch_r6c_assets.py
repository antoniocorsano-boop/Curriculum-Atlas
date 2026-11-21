#!/usr/bin/env python3
"""Acquire precisely THREE CC0 models from Poly Haven; official 1k glTF only.
Every byte and dependency is recorded; no silent fabricated fallback.
"""
import hashlib, urllib.request, json, gzip, io, zipfile, sys
from pathlib import Path
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
if "--out" not in args:raise RuntimeError("--out required")
ROOT=Path(args[args.index("--out")+1]).resolve();ROOT.mkdir(parents=True,exist_ok=True)
AGENT="Atlas ART-DIR-02 R6C original CC0 asset qualification/1.0"
def fetch(url,cap=15_000_000):
    if not url.startswith(("https://api.polyhaven.com/","https://dl.polyhaven.org/")):
        raise RuntimeError("Unapproved source host "+url)
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":AGENT}),timeout=85) as r:
        raw=r.read(cap+1)
    if len(raw)>cap:raise RuntimeError("Official resource exceeds source cap "+url)
    return raw
def sha(raw):return hashlib.sha256(raw).hexdigest()
report={"schema":"atlas.art-dir02.r6c-asset-provenance/v1",
        "license":"CC0-1.0","publisher":"Poly Haven",
        "source_license":"https://polyhaven.com/license",
        "assets":{},"no_purchased_sources":True}
for ident in ("pachira_aquatica_01","potted_plant_02","wooden_display_shelves_01"):
    root=ROOT/ident;root.mkdir(parents=True,exist_ok=True)
    api="https://api.polyhaven.com/files/"+ident
    table=json.loads(fetch(api,3_000_000))
    variants=table.get("gltf",{})
    chosen=variants.get("1k",{}).get("gltf")
    if not chosen:raise RuntimeError("No official 1k glTF source "+ident)
    primary=fetch(chosen["url"],15_000_000)
    if chosen.get("md5") and hashlib.md5(primary).hexdigest()!=chosen["md5"]:
        raise RuntimeError("Main file MD5 mismatch "+ident)
    if primary.startswith(b"\x28\xb5\x2f\xfd"):
        import zstandard
        primary=zstandard.ZstdDecompressor().decompress(primary,max_output_size=90_000_000)
    if primary.startswith(b"\x1f\x8b"):primary=gzip.decompress(primary)
    if primary.startswith(b"PK\x03\x04"):
        with zipfile.ZipFile(io.BytesIO(primary)) as z:
            picks=[name for name in z.namelist() if name.lower().endswith(".gltf")]
            if not picks:raise RuntimeError("ZIP has no glTF")
            primary=z.read(picks[0])
    if primary.startswith(b"glTF"):ext="glb"
    elif primary.lstrip().startswith(b"{") and "asset" in json.loads(primary):ext="gltf"
    else:raise RuntimeError("Unexpected glTF main type "+ident)
    target=root/(ident+"."+ext);target.write_bytes(primary)
    dependencies=[]
    for relative,info in chosen.get("include",{}).items():
        p=(root/relative).resolve()
        if not p.is_relative_to(root):raise RuntimeError("Unsafe model dependency path")
        data=fetch(info["url"],12_000_000)
        if info.get("md5") and hashlib.md5(data).hexdigest()!=info["md5"]:
            raise RuntimeError("Dependency hash mismatch: "+relative)
        p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
        dependencies.append({"path":str(p),"sha256":sha(data),"bytes":len(data),
                             "source_url":info["url"],"publisher_md5":info.get("md5")})
    report["assets"][ident]={"file":str(target),"format":ext,"sha256":sha(primary),
       "bytes":len(primary),"publisher_md5":chosen.get("md5"),
       "source_page":"https://polyhaven.com/a/"+ident,
       "source_url":chosen["url"],"license":"CC0-1.0",
       "dependencies":dependencies,"triangles_after_lod":None}
(ROOT/"r6c-source-assets.json").write_text(json.dumps(report,indent=2,ensure_ascii=False))
print("ATLAS_R6C_CC0_FETCHED",json.dumps({i:{"bytes":x["bytes"],"deps":len(x["dependencies"])} for i,x in report["assets"].items()}))
