"""Production-only acquisition. No downloads or external endpoints in student runtime."""
import hashlib,json,pathlib,sys,urllib.request,urllib.parse
out=pathlib.Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
ua="AtlasGateway-C3-Production/1.0"
allowed={"api.polyhaven.com","dl.polyhaven.org","cdn.polyhaven.com"}
def get(url,limit):
    parsed=urllib.parse.urlparse(url)
    assert parsed.scheme=="https" and parsed.hostname in allowed,url
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":ua}),timeout=60) as res:
        final=urllib.parse.urlparse(res.geturl())
        assert final.scheme=="https" and final.hostname in allowed,res.geturl()
        b=res.read(limit+1)
    assert len(b)<=limit,(url,len(b))
    return b
spec={"walnut_veneer":{"author":"Jenelle van Heerden","keys":["diff","rough","nor_gl"]},"marble_01":{"author":"Rob Tuytel","keys":["diff","rough","nor_gl"]},"kloppenheim_03":{"author":"Greg Zaal","keys":["hdri"]}}
receipt={"provider":"Poly Haven","license":"CC0-1.0","licenseUrl":"https://polyhaven.com/license","credit":"Powered by Poly Haven","files":[]}
for slug,config in spec.items():
    data=get("https://api.polyhaven.com/files/"+slug,2*1024*1024)
    (out/(slug+"-metadata.json")).write_bytes(data)
    meta=json.loads(data)
    for key in config["keys"]:
        fmt="hdr" if key=="hdri" else "jpg"
        entry=meta[key]["1k"][fmt]
        name=slug+".hdr" if key=="hdri" else slug+"_"+key+".jpg"
        assert 0<entry["size"]<=4*1024*1024
        b=get(entry["url"],entry["size"])
        assert len(b)==entry["size"] and hashlib.md5(b).hexdigest()==entry["md5"],name
        assert b.startswith(b"\xff\xd8") if fmt=="jpg" else b.startswith((b"#?RADIANCE",b"#?RGBE")),name
        (out/name).write_bytes(b)
        receipt["files"].append({"name":name,"asset":slug,"author":config["author"],"source":"https://polyhaven.com/a/"+slug,"url":entry["url"],"resolution":"1k","bytes":len(b),"md5":entry["md5"],"sha256":hashlib.sha256(b).hexdigest()})
assert len(receipt["files"])==7
assert sum(f["bytes"] for f in receipt["files"])<=12*1024*1024
(out/"manifest.json").write_text(json.dumps(receipt,indent=2)+"\n")
print("Powered by Poly Haven — seven local resources verified")
