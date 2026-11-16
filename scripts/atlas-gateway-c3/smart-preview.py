"""SP-03: preview adapter for source-locked masters. Never emits qualification PASS."""
import ast,json,re,sys
from pathlib import Path
BASE=Path(__file__).resolve().parent
CONFIG=json.loads((BASE/"smart-production.json").read_text())
ACTIVE=CONFIG["active"]
VIEWS=CONFIG["previewViews"]
assert CONFIG["previewEnabled"] is True and len(VIEWS)==2 and len(set(VIEWS))==2
assert all(re.fullmatch(r"[a-z0-9-]+",v) for v in VIEWS)
assert re.fullmatch(r"library-master-[a-z0-9-]+\.py",ACTIVE["script"])
MASTER=BASE/ACTIVE["script"]
SAMPLES=16
def one(code,old,new):
    assert code.count(old)==1,old
    return code.replace(old,new,1)
def line_matching(code,regex):
    lines=[line for line in code.splitlines() if re.fullmatch(regex,line)]
    assert len(lines)==1,(regex,len(lines))
    return lines[0]
def render_transform(code):
    line=line_matching(code,r"views=\[.*\]")
    all_views=ast.literal_eval(line.split("=",1)[1])
    assert len({v[0] for v in all_views})==len(all_views)
    by_name={v[0]:v for v in all_views}
    selected=[(n,by_name[n][1]//2,by_name[n][2]//2,*by_name[n][3:]) for n in VIEWS]
    code=one(code,line,"views="+repr(selected))
    sample=re.findall(r"scene\.cycles\.samples=(\d+)",code);assert len(sample)==1 and int(sample[0])>=SAMPLES
    code=one(code,"scene.cycles.samples="+sample[0],"scene.cycles.samples="+str(SAMPLES))
    line=line_matching(code,r'for name in \("library\.blend",.*\):')
    names=ast.literal_eval(line[len("for name in "):-1])
    old_renders={v[0]+".png" for v in all_views}
    assert old_renders<=set(names)
    keep=tuple(n for n in names if n not in old_renders or n in {v+".png" for v in VIEWS})
    code=one(code,line,"for name in "+repr(keep)+":")
    phase='"phase":'+json.dumps(ACTIVE["phase"])
    return one(code,phase,phase+',"productionMode":"FAST","previewOnly":True,"previewSamples":16')
def verify_transform(code):
    line=line_matching(code,r"for name,dimensions in \(.*\):")
    sizes=ast.literal_eval(line[len("for name,dimensions in "):-1])
    by_name=dict(sizes);assert len(by_name)==len(sizes)
    chosen=tuple((n+".png",tuple(x//2 for x in by_name[n+".png"])) for n in VIEWS)
    code=one(code,line,"for name,dimensions in "+repr(chosen)+":")
    code=one(code,'and len(b)>30000,name','and len(b)>5000,name')
    code=one(code,'m=json.loads((p/"library-manifest.json").read_text())','m=json.loads((p/"library-manifest.json").read_text())\nassert m["productionMode"]=="FAST" and m["previewOnly"] is True and m["previewSamples"]==16\nassert all((n in m["files"])==(n in '+repr(tuple(n for n,_ in chosen))+') for n in '+repr(tuple(by_name))+')')
    code=one(code,'"status":"PASS"','"status":"PREVIEW_PASS","previewOnly":True,"productionMode":"FAST","previewSamples":16')
    code=one(code,'"renders":'+str(len(sizes)),'"renders":2')
    return one(code,'(p/"library-verification.json").write_text','(p/"preview-verification.json").write_text')
def selftest():
    wrapper=MASTER.read_text()
    tree=ast.parse(wrapper)
    edits=[ast.literal_eval(n.iter) for n in ast.walk(tree) if isinstance(n,ast.For) and isinstance(n.iter,ast.List)]
    assert len(edits)==1
    src=(BASE/"library-refined.py").read_text()
    for old,new in edits[0]:src=one(src,old,new)
    verify=[ast.literal_eval(n.value) for n in ast.walk(tree) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=="code" for t in n.targets) and isinstance(n.value,ast.Constant) and isinstance(n.value.value,str)]
    assert len(verify)==1
    gen=render_transform(src);check=verify_transform(verify[0])
    compile(gen,"preview-generator","exec");compile(check,"preview-verifier","exec")
    assert '"status":"PREVIEW_PASS"' in check and '"status":"PASS"' not in check
    assert 'preview-verification.json' in check and 'library-verification.json' not in check
    assert 'scene.cycles.samples=16' in gen and 'scene.cycles.samples=48' in src
    assert 'archOpeningPreserved' in check and 'cupolaBytes' in check
    print("SP-03 source transformation PASS (no Blender execution)")
def main():
    if sys.argv[1:]==["--selftest"]:selftest();return
    verify=len(sys.argv)>1 and sys.argv[1]=="--verify"
    source=MASTER.read_text()
    source=one(source,'exec(compile(code,__file__,"exec"),globals())','code=preview_transform(code)\nexec(compile(code,__file__,"exec"),globals())')
    namespace={"__file__":str(MASTER),"__name__":"__main__","preview_transform":verify_transform if verify else render_transform}
    exec(compile(source,str(MASTER),"exec"),namespace)
if __name__=="__main__":main()
