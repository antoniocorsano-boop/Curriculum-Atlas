"""SP-03: isolated, explicitly non-qualifying previews of the source-locked active scene."""
import argparse, ast, hashlib, json, struct, sys, tempfile, time
from pathlib import Path

HERE=Path(__file__).resolve().parent
SUPPORTED=("library-master-arch.py","library-master-material-study.py")
VIEWS={"atrium":(600,375),"vertical":(320,480)}
SAMPLES=12
END='exec(compile(code,__file__,"exec"),globals())'

def sha(data):return hashlib.sha256(data).hexdigest()

def once(code,old,new):
    if code.count(old)!=1:raise ValueError("preview anchor changed: "+old[:100])
    return code.replace(old,new,1)

def resolve(candidate):
    assert candidate.name in SUPPORTED and candidate.parent==HERE and candidate.is_file() and not candidate.is_symlink()
    raw=candidate.read_text()
    # Execute only the trusted wrapper's existing source-lock/replacement logic.
    # The final exec of the reconstructed Blender generator is replaced by capture.
    wrapper=once(raw,END,'__preview_effective_source__=code')
    namespace={"__file__":str(candidate),"__name__":"__atlas_preview_source__"}
    old=sys.argv
    try:
        sys.argv=[str(candidate)]
        exec(compile(wrapper,str(candidate),"exec"),namespace)
    finally:sys.argv=old
    return namespace["__preview_effective_source__"]

def transform(code):
    # Fail closed on any changed production anchor. Do not edit the source on disk.
    code=once(code,"scene.cycles.samples=48","scene.cycles.samples=12")
    code=once(code,'for i,(name,w,h,pos,target,lens) in enumerate(views):',
        'views=[v for v in views if v[0] in ("atrium","vertical")]\nassert [v[0] for v in views]==["atrium","vertical"]\nfor i,(name,w,h,pos,target,lens) in enumerate(views):')
    code=once(code,"scene.render.resolution_percentage=100","scene.render.resolution_percentage=50")
    code=once(code,'    if i==0:bpy.ops.wm.save_as_mainfile(filepath=str(out/"library.blend"))\n',"")
    # Exactly four top-level GLB exports in this candidate. Preview never exports them.
    lines=code.splitlines(keepends=True);tree=ast.parse(code);exports=[]
    for node in tree.body:
        if isinstance(node,ast.Expr) and isinstance(node.value,ast.Call) and ast.unparse(node.value.func)=="bpy.ops.export_scene.gltf":
            assert node.lineno==node.end_lineno
            exports.append(node.lineno)
    assert len(exports)==4
    for n in exports:lines[n-1]="pass  # preview: no GLB export\n"
    code="".join(lines)
    # Stop before the qualification receipt; only images will leave scratch.
    assert code.count("\nreceipt={")==1
    code=code.split("\nreceipt={",1)[0]+"\n"
    ast.parse(code)
    assert "library-manifest.json" not in code and "save_as_mainfile" not in code and "export_scene.gltf" not in code
    return code

def image_record(p):
    b=p.read_bytes()
    assert len(b)>1000 and b.startswith(b"\x89PNG\r\n\x1a\n") and b[12:16]==b"IHDR"
    return {"bytes":len(b),"sha256":sha(b),"dimensions":list(struct.unpack_from(">II",b,16))}

def identity(candidate):
    source=resolve(candidate)
    return {"candidate":candidate.name,"candidateSha256":sha(candidate.read_bytes()),"effectiveSourceSha256":sha(source.encode()),"previewSourceSha256":sha(transform(source).encode())}

def verify(out,candidate):
    assert set(p.name for p in out.iterdir())=={"preview-receipt.json",*(n+".png" for n in VIEWS)}
    receipt=json.loads((out/"preview-receipt.json").read_text())
    assert receipt["status"]=="PREVIEW_ONLY" and receipt["qualified"] is False and receipt["studentAuthorized"] is False and receipt["publishable"] is False
    assert receipt["identity"]==identity(candidate) and receipt["samples"]==SAMPLES and receipt["resolutionPercent"]==50
    assert receipt["engine"]=="CYCLES" and receipt["seconds"]>0 and set(receipt["files"])==set(VIEWS)
    for n,dims in VIEWS.items():
        p=out/(n+".png");assert p.is_file() and not p.is_symlink()
        r=image_record(p);assert r==receipt["files"][n] and r["dimensions"]==list(dims)
    print("SP-03 preview evidence verified; NOT QUALIFIED",flush=True)

def produce(out,candidate):
    assert out.parent.is_dir() and not out.exists()
    started=time.monotonic()
    source=resolve(candidate);preview=transform(source)
    with tempfile.TemporaryDirectory(prefix="atlas-fast-scratch-",dir=out.parent) as scratch:
        old=sys.argv
        try:
            sys.argv=[str(candidate),"--",scratch]
            exec(compile(preview,str(candidate),"exec"),{"__file__":str(candidate),"__name__":"__atlas_preview_scene__"})
        finally:sys.argv=old
        scratch=Path(scratch)
        assert not list(scratch.glob("*.glb")) and not list(scratch.glob("*.blend")) and not (scratch/"library-manifest.json").exists()
        out.mkdir()
        files={}
        for n,dims in VIEWS.items():
            p=out/(n+".png");p.write_bytes((scratch/p.name).read_bytes())
            files[n]=image_record(p);assert files[n]["dimensions"]==list(dims)
        receipt={"status":"PREVIEW_ONLY","qualified":False,"studentAuthorized":False,"publishable":False,"identity":identity(candidate),"samples":SAMPLES,"resolutionPercent":50,"engine":"CYCLES","seconds":time.monotonic()-started,"files":files}
        (out/"preview-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n")
    verify(out,candidate)

def selftest():
    for name in SUPPORTED:
        candidate=HERE/name;source=resolve(candidate);preview=transform(source)
        compile(preview,str(candidate),"exec")
        if name=="library-master-material-study.py":assert "A5.4a micro relief" in preview and "material-study.json" in preview
    assert "scene.cycles.samples=12" in preview and "scene.render.resolution_percentage=50" in preview
    assert '["atrium","vertical"]' in preview
    assert 'receipt={' not in preview.split("\n")[-1] and "library-manifest.json" not in preview
    for altered in (source.replace("scene.cycles.samples=48","scene.cycles.samples=49"),source.replace("scene.render.resolution_percentage=100","scene.render.resolution_percentage=90")):
        try:transform(altered)
        except ValueError:pass
        else:raise AssertionError("changed anchor accepted")
    print("SP-03 source adapter checks PASS (actual render separate)",flush=True)

def main():
    args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else sys.argv[1:]
    if args==["--selftest"]:selftest();return
    p=argparse.ArgumentParser();p.add_argument("mode",choices=["produce","verify"]);p.add_argument("out",type=Path);p.add_argument("candidate",choices=SUPPORTED);a=p.parse_args(args)
    {"produce":produce,"verify":verify}[a.mode](a.out.resolve(),HERE/a.candidate)

if __name__=="__main__":main()
