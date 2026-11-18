"""Production-only acquisition. No downloads or external endpoints in student runtime."""
import hashlib,json,pathlib,re,sys,urllib.request,urllib.parse

UA="AtlasGateway-C3-Production/1.0"
ALLOWED={"api.polyhaven.com","dl.polyhaven.org","cdn.polyhaven.com"}
ALIASES={"diff":{"diff","diffuse"},"rough":{"rough","roughness"},"nor_gl":{"nor_gl"},"hdri":{"hdri"}}
SPEC={"walnut_veneer":{"author":"Jenelle van Heerden","keys":["diff","rough","nor_gl"]},"marble_01":{"author":"Rob Tuytel","keys":["diff","rough","nor_gl"]},"kloppenheim_03":{"author":"Greg Zaal","keys":["hdri"]}}

def check_url(url):
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or p.hostname not in ALLOWED or p.username or p.password or p.port not in (None,443):
        raise ValueError("Unapproved source: "+url)
    return p

class SafeRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        check_url(newurl)
        return super().redirect_request(req, fp, code, msg, headers, newurl)

def get(url,limit):
    check_url(url)
    opener=urllib.request.build_opener(SafeRedirect())
    with opener.open(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=60) as res:
        check_url(res.geturl())
        b=res.read(limit+1)
    if len(b)>limit: raise ValueError("Oversized resource: "+url)
    return b

def select_entry(meta,slug,key):
    if not isinstance(meta,dict): raise ValueError(slug+": expected metadata object")
    matches=[k for k in meta if k.casefold() in ALIASES[key]]
    if len(matches)!=1:
        raise ValueError(f"{slug}: map {key}; found {matches}; available {sorted(meta)}")
    actual=matches[0]
    fmt="hdr" if key=="hdri" else "jpg"
    try: entry=meta[actual]["1k"][fmt]
    except (KeyError,TypeError) as e: raise ValueError(f"{slug}/{actual}: missing 1k/{fmt}") from e
    if not isinstance(entry,dict) or not isinstance(entry.get("size"),int) or not 0<entry["size"]<=4*1024*1024:
        raise ValueError(f"{slug}/{actual}: invalid resource size")
    if not isinstance(entry.get("md5"),str) or not re.fullmatch(r"[0-9a-fA-F]{32}",entry["md5"]):
        raise ValueError(f"{slug}/{actual}: invalid MD5")
    if not isinstance(entry.get("url"),str): raise ValueError(f"{slug}/{actual}: missing URL")
    url=check_url(entry["url"])
    filename=pathlib.PurePosixPath(url.path).name
    if not filename.startswith(slug+"_") or not filename.endswith("."+fmt):
        raise ValueError(f"{slug}/{actual}: unexpected filename {filename}")
    return actual,fmt,entry

def selftest():
    # Exact 1K/JPEG metadata entries from run 43882087742, artifact 14233435140.
    captured={
      "Diffuse":{"1k":{"jpg":{"url":"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/walnut_veneer/walnut_veneer_diff_1k.jpg","md5":"70e160b3d44d414728a2fb4194fde2a6","size":496596}}},
      "Rough":{"1k":{"jpg":{"url":"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/walnut_veneer/walnut_veneer_rough_1k.jpg","md5":"bc27156b65a17eb96f3aef9548584a66","size":556628}}},
      "nor_gl":{"1k":{"jpg":{"url":"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/walnut_veneer/walnut_veneer_nor_gl_1k.jpg","md5":"fc0df784c71c1cff9d80d4a6de0b2ab4","size":442897}}}
    }
    for key,expected in (("diff","Diffuse"),("rough","Rough"),("nor_gl","nor_gl")):
        actual,fmt,entry=select_entry(captured,"walnut_veneer",key)
        assert actual==expected and fmt=="jpg" and entry==captured[expected]["1k"]["jpg"]
        assert select_entry({key:captured[expected]},"walnut_veneer",key)[0]==key
    for broken,key in (({"nor_dx":captured["nor_gl"]},"nor_gl"),({**captured,"diff":captured["Diffuse"]},"diff"),({"Rough":{}},"rough"),({"Diffuse":{"1k":{"jpg":{"url":"https://example.org/walnut_veneer_diff.jpg","md5":"0"*32,"size":100}}}},"diff")):
        try: select_entry(broken,"walnut_veneer",key)
        except ValueError: pass
        else: raise AssertionError("Invalid metadata accepted: "+key)
    print("Poly Haven metadata resolver: 10 offline cases PASS",flush=True)

def main(out):
    selftest()
    out.mkdir(parents=True,exist_ok=True)
    receipt={"provider":"Poly Haven","license":"CC0-1.0","licenseUrl":"https://polyhaven.com/license","credit":"Powered by Poly Haven","files":[]}
    planned=[]
    # Validate all three responses and every requested map before downloading images.
    for slug,config in SPEC.items():
        data=get("https://api.polyhaven.com/files/"+slug,2*1024*1024)
        (out/(slug+"-metadata.json")).write_bytes(data)
        meta=json.loads(data)
        for key in config["keys"]:
            actual,fmt,entry=select_entry(meta,slug,key)
            name=slug+".hdr" if key=="hdri" else slug+"_"+key+".jpg"
            planned.append((slug,config,key,actual,fmt,entry,name))
            print(f"Resolved {slug}/{key} -> {actual}/1k/{fmt} ({entry['size']} bytes)",flush=True)
    assert len(planned)==7
    assert sum(item[5]["size"] for item in planned)<=12*1024*1024
    (out/"acquisition-plan.json").write_text(json.dumps([{"asset":s,"semanticMap":k,"providerMap":a,"format":f,"file":n,"expected":e} for s,c,k,a,f,e,n in planned],indent=2)+"\n")
    for slug,config,key,actual,fmt,entry,name in planned:
        b=get(entry["url"],entry["size"])
        assert len(b)==entry["size"] and hashlib.md5(b).hexdigest()==entry["md5"].lower(),name
        assert (b.startswith(b"\xff\xd8") if fmt=="jpg" else b.startswith((b"#?RADIANCE",b"#?RGBE"))),name
        (out/name).write_bytes(b)
        receipt["files"].append({"name":name,"asset":slug,"author":config["author"],"source":"https://polyhaven.com/a/"+slug,"semanticMap":key,"providerMap":actual,"url":entry["url"],"resolution":"1k","bytes":len(b),"md5":entry["md5"],"sha256":hashlib.sha256(b).hexdigest()})
    assert len(receipt["files"])==7
    (out/"manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
    print("Powered by Poly Haven — seven local resources verified",flush=True)

def verify_local(out):
    """Verify the complete provisional source bundle without network access."""
    receipt=json.loads((out/"manifest.json").read_text())
    assert receipt["provider"]=="Poly Haven" and receipt["license"]=="CC0-1.0" and receipt["licenseUrl"]=="https://polyhaven.com/license"
    expected={}
    for slug,config in SPEC.items():
        meta=json.loads((out/(slug+"-metadata.json")).read_text())
        for key in config["keys"]:
            actual,fmt,entry=select_entry(meta,slug,key)
            name=slug+".hdr" if key=="hdri" else slug+"_"+key+".jpg"
            expected[name]=(slug,config,key,actual,fmt,entry)
    files=receipt["files"]
    assert len(files)==7 and {i["name"] for i in files}==set(expected)
    assert sum(i["bytes"] for i in files)<=12*1024*1024
    for item in files:
        name=item["name"];slug,config,key,actual,fmt,entry=expected[name]
        assert (item["asset"],item["author"],item["semanticMap"],item["providerMap"],item["url"],item["resolution"])==(slug,config["author"],key,actual,entry["url"],"1k"),name
        path=out/name
        assert path.is_file() and not path.is_symlink(),name
        assert path.stat().st_size==entry["size"]==item["bytes"],name
        b=path.read_bytes()
        assert hashlib.md5(b).hexdigest()==entry["md5"].lower()==item["md5"].lower(),name
        assert hashlib.sha256(b).hexdigest()==item["sha256"],name
        assert (b.startswith(b"\xff\xd8") if fmt=="jpg" else b.startswith((b"#?RADIANCE",b"#?RGBE"))),name
    print("Local source bundle: seven verified resources; no network",flush=True)

if __name__=="__main__":
    if sys.argv[1:]==["--selftest"]: selftest()
    elif len(sys.argv)==3 and sys.argv[1]=="--verify": verify_local(pathlib.Path(sys.argv[2]))
    elif len(sys.argv)==2: main(pathlib.Path(sys.argv[1]))
    else: raise SystemExit("Usage: acquire-materials.py OUT | --selftest | --verify OUT")
