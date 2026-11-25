#!/usr/bin/env python3
"""Generate visual evidence for ART-DIR-02. Advisory metrics never approve art."""
import os,sys,json
from pathlib import Path
from PIL import Image, ImageChops, ImageEnhance, ImageStat, ImageOps

if len(sys.argv)!=4:
    raise SystemExit("usage: compare-render.py REFERENCE RENDER_DIR OUTPUT_DIR")
reference=Path(sys.argv[1]);render=Path(sys.argv[2]);out=Path(sys.argv[3])
out.mkdir(parents=True,exist_ok=True)
required={k:render/(k+"-cycles.png") for k in ("hero","side","mobile")}
if not reference.is_file() or any(not p.is_file() for p in required.values()):
    raise RuntimeError("Reference or one of the three actual Blender camera renders is missing")
def framed(p,w,h):
    with Image.open(p) as im:
        return ImageOps.fit(im.convert("RGB"),(w,h),method=Image.Resampling.LANCZOS)
w,h=640,360
target=framed(reference,w,h)
hero=framed(required["hero"],w,h)
mobile=framed(required["mobile"],270,450)
side=framed(required["side"],w,h)
difference=ImageEnhance.Contrast(ImageChops.difference(target,hero)).enhance(2.5)
sheet=Image.new("RGB",(w*3, max(h,450)+44),(15,25,38))
sheet.paste(target,(0,44));sheet.paste(hero,(w,44));sheet.paste(difference,(w*2,44))
# In the file name, distinguish comparison from an inferred verdict.
sheet.save(out/"reference-vs-blender.png")
other=Image.new("RGB",(w+270,494),(15,25,38))
other.paste(side,(0,44));other.paste(mobile,(w,44))
other.save(out/"side-and-mobile.png")
# Mean pixel differences describe a diagnostic, not perceived similarity.
rgb_diff=ImageStat.Stat(ImageChops.difference(target,hero)).mean
lum_ref=ImageStat.Stat(target.convert("L")).mean[0]
lum_hero=ImageStat.Stat(hero.convert("L")).mean[0]
report={"schema":"atlas.art-dir-02.visual-review/v1",
 "status":"HUMAN_ART_REVIEW_REQUIRED",
 "reference":reference.name,
 "renders":{k:{"file":str(p),"bytes":p.stat().st_size} for k,p in required.items()},
 "diagnostic_only":{"mean_abs_difference_rgb":[round(x,2) for x in rgb_diff],
  "reference_mean_luminance":round(lum_ref,2),
  "render_mean_luminance":round(lum_hero,2)},
 "artisticApproval":False,
 "note":"Pixel and luminance diagnostics are not measures of architectural credibility. An expert must compare architecture, camera, light, materials, portal identity and side-view parallax.",
 "studentAuthorized":False,"publicRelease":False}
(out/"visual-review.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
print("ATLAS_ART_VISUAL_EVIDENCE",json.dumps(report,ensure_ascii=False))
