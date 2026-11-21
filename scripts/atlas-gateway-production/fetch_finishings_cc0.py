#!/usr/bin/env python3
"""Atlas ART-DIR-02 finishing proof: obtain a small CC0 resource set from original publishers.
Only documented official hostnames; receipts contain source URL, checksums, licenses.
No end-user service, API key, paid subscription or publication is required.
"""
import hashlib, io, gzip, json, os, re, sys, urllib.request, zipfile
from pathlib import Path

A= sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else None
if not A: raise ValueError("--out required")
root=Path(A).resolve();root.mkdir(parents=True,exist_ok=True)
USER_AGENT="Atlas-Art-DIR-02-Production/1.0 (educational CC0 proof)"
def get(url,maxbytes=20_000_000):
    allowed=("https://ambientcg.com/", "https://ambientCG.com/",
             "https://api.polyhaven.com/", "https://dl.polyhaven.org/",
             "https://acg-storage.ams3.cdn.digitaloceanspaces.com/",
             "https://ambientcg.com")
    if not url.startswith(allowed):raise ValueError("Unapproved asset download host: "+url)
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT})
    with urllib.request.urlopen(req,timeout=70) as r:
        data=r.read(maxbytes+1)
        if len(data)>maxbytes:raise RuntimeError("Asset too large: "+url)
        return data
def checksum(raw):return hashlib.sha256(raw).hexdigest()
manifest={"schema":"atlas.art-dir-02.finishings-cc0-assets/v1",
  "status":"ACQUIRED_NOT_ARTISTICALLY_APPROVED",
  "sources":[],"materials":{},"model":{"status":"NOT_REQUESTED"},
  "license":"CC0-1.0","no_publication":True}
for ident in ["Onyx013","Metal010"]:
    url="https://ambientcg.com/get?file="+ident+"_1K-JPG.zip"
    raw=get(url,12_000_000)
    source=root/(ident+"_1K-JPG.zip");source.write_bytes(raw)
    out=root/ident;out.mkdir(exist_ok=True)
    with zipfile.ZipFile(source) as z:
        if z.testzip() is not None:raise ValueError("Corrupt ambientCG archive "+ident)
        maps={}
        for entry in z.infolist():
            if entry.is_dir():continue
            name=Path(entry.filename).name
            if not name.lower().endswith((".jpg",".jpeg",".png")):continue
            tag=None
            for kind in ("Color","Roughness","NormalGL","Metalness","AmbientOcclusion"):
                if re.search(r"[_-]"+kind+r"(?=[_.-])",name,re.IGNORECASE):
                    tag=kind;break
            if tag:
                img=z.read(entry)
                if len(img)>6_000_000:continue
                dest=out/name;dest.write_bytes(img)
                maps[tag]={"file":str(dest),"sha256":checksum(img),"bytes":len(img)}
        if not maps.get("Color") or not maps.get("Roughness"):
            raise ValueError("ambientCG 1K material missing color/roughness: "+ident+" "+str(z.namelist()[:30]))
    manifest["materials"][ident]={"maps":maps,"archive_sha256":checksum(raw),
      "source_page":"https://ambientcg.com/view?id="+ident,
      "source_download":url,"license_url":"https://docs.ambientcg.com/license/",
      "size_bytes":len(raw)}
    manifest["sources"].append({"id":ident,"publisher":"ambientCG",
      "archive_sha256":checksum(raw),"license":"CC0-1.0","bytes":len(raw)})
# Prefer a professionally authored Blender plant, with per-file polyhaven integrity.
# If the publisher's small variant is unavailable, this is reported as NOT_IMPORTABLE,
# never replaced with a home-made fake and never counted as a success.
model={"asset_id":"potted_plant_04","source_page":"https://polyhaven.com/a/potted_plant_04",
       "api_url":"https://api.polyhaven.com/files/potted_plant_04",
       "license":"CC0-1.0","license_url":"https://polyhaven.com/about-contact"}
try:
    table=json.loads(get(model["api_url"],3_000_000))
    chosen=None
    chosen_format=None
    for fmt in ("gltf","blend"):
        variants=table.get(fmt,{})
        for resolution in ("1k","2k"):
            item=variants.get(resolution,{}).get(fmt)
            if item and int(item.get("size",99_999_999))<=10_000_000:
                chosen=item
                chosen_format=fmt
                model["resolution"]=resolution
                break
        if chosen:break
    if not chosen:raise RuntimeError("No lightweight published glTF/Blender plant variant")
    raw=get(chosen["url"],12_000_000)
    archive_md5=hashlib.md5(raw).hexdigest()
    if chosen.get("md5") and archive_md5!=chosen["md5"]:
        raise RuntimeError("Publisher source checksum mismatch")
    if raw.startswith(b"\x28\xb5\x2f\xfd"):
        import zstandard
        raw=zstandard.ZstdDecompressor().decompress(raw,max_output_size=48_000_000)
    if raw.startswith(b"\x1f\x8b"):
        raw=gzip.decompress(raw)
    if raw.startswith(b"PK\x03\x04"):
        with zipfile.ZipFile(io.BytesIO(raw)) as pack:
            suffix=".gltf" if chosen_format=="gltf" else ".blend"
            matches=[n for n in pack.namelist() if n.lower().endswith(suffix)]
            if not matches:raise RuntimeError("Publisher ZIP missing "+suffix)
            raw=pack.read(matches[0])
    if chosen_format=="gltf":
        if raw.startswith(b"glTF"):ext=".glb"
        elif raw.lstrip().startswith(b"{") and "asset" in json.loads(raw):
            ext=".gltf"
        else:raise RuntimeError("Unsupported glTF file header "+raw[:18].hex())
    else:
        if not raw.startswith(b"BLENDER"):
            raise RuntimeError("Unsupported Blender file header "+raw[:18].hex())
        ext=".blend"
    folder=root/"potted_plant_04"
    folder.mkdir(exist_ok=True)
    filename=folder/("potted_plant_04"+ext)
    filename.write_bytes(raw)
    dependencies=[]
    for rel,info in chosen.get("include",{}).items():
        dest=(folder/rel).resolve()
        if not dest.is_relative_to(folder):raise RuntimeError("Invalid dependency path")
        data=get(info["url"],6_000_000)
        if info.get("md5") and hashlib.md5(data).hexdigest()!=info["md5"]:
            raise RuntimeError("Plant dependency checksum mismatch: "+rel)
        dest.parent.mkdir(exist_ok=True,parents=True);dest.write_bytes(data)
        dependencies.append({"file":str(dest),"sha256":checksum(data),"bytes":len(data)})
    model.update(status="ACQUIRED_CC0",format=chosen_format,file=str(filename),
                 sha256=checksum(raw),bytes=len(raw),dependencies=dependencies,
                 source_url=chosen["url"],publisher_md5=chosen.get("md5"))
except Exception as e:
    model["status"]="NOT_IMPORTABLE";model["reason"]=str(e)[:250]
manifest["model"]=model
(root/"asset-sources-receipt.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
if len(manifest["materials"])!=2:raise RuntimeError("Missing mandatory material set")
print("ATLAS_CC0_MATERIALS_ACQUIRED",json.dumps({"material_ids":list(manifest["materials"]),"plant":model["status"]}))
