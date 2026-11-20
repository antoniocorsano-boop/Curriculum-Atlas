"""AWC-A: validate a semantic catalog as a projection of ASC and ASD.

Read-only. No renderer, downloads, scene writes, parameter application or promotion.
"""
import hashlib
import importlib.util
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = Path("ops/atlas-scene-package/awc-catalog.json")
SOURCES = {
    "asdRegistry": Path("ops/atlas-scene-director/parameters.json"),
    "ascPolicy": Path("ops/atlas-scene-package/asc01-production-policy.json"),
    "masterReceipt": Path("ops/atlas-scene-package/editable-master-receipt-summary.json"),
    "asdPlanner": Path("scripts/scene-director.py"),
    "ascPlanner": Path("scripts/atlas-scene-compiler-plan.py"),
}
ENTRY_KEYS = {"id", "version", "family", "state", "source", "dependencies",
              "targets", "parameters", "evidence", "licenseStatus"}
ID = re.compile(r"[a-z][a-z0-9]*(?:[.-][a-z][a-z0-9]*)*")
VERSION = re.compile(r"(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)")
FAMILIES = {"world", "camera", "lighting", "interaction", "architecture",
            "materials", "style", "atmosphere", "vegetation", "composition"}
TARGETS = {"blender", "webgl"}

def require(ok, why):
    if not ok:
        raise ValueError(why)

def strict_json(raw):
    def pairs(items):
        out = {}
        for key, value in items:
            require(key not in out, "duplicate JSON key")
            out[key] = value
        return out
    def nonfinite(value):
        raise ValueError("nonfinite JSON: " + value)
    return json.loads(raw, object_pairs_hook=pairs, parse_constant=nonfinite)

def blob_sha(raw):
    # Git's blob identity, not a claim that SHA-1 authenticates a source.
    return hashlib.sha1(b"blob " + str(len(raw)).encode() + b"\0" + raw).hexdigest()

def load_module(path, name):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module

def strings(value, why):
    require(type(value) is list and all(type(x) is str and x for x in value), why)
    require(len(value) == len(set(value)), why + " duplicate")
    return set(value)

def validate(catalog, raw_sources, *, root=ROOT):
    require(type(catalog) is dict and set(catalog) ==
            {"schema", "version", "mode", "sources", "entries", "presets", "concepts"},
            "catalog shape")
    require(catalog["schema"] == "atlas.awc.catalog/v1" and catalog["mode"] == "PLAN_ONLY"
            and type(catalog["version"]) is str and VERSION.fullmatch(catalog["version"]),
            "catalog version or boundary")
    require(set(catalog["sources"]) == set(raw_sources) == set(SOURCES), "source set")
    for key, raw in raw_sources.items():
        require(type(raw) is bytes and catalog["sources"][key] == blob_sha(raw),
                "source drift: " + key)
        require(raw == (root / SOURCES[key]).read_bytes(), "source differs from checked-out file")
    registry, policy, receipt = (strict_json(raw_sources[k]) for k in
                                  ("asdRegistry", "ascPolicy", "masterReceipt"))
    # Reuse the authoritative validators instead of duplicating domains or budgets.
    asd = load_module(root / SOURCES["asdPlanner"], "awc_asd")
    asc = load_module(root / SOURCES["ascPlanner"], "awc_asc")
    base_plan = asc.plan(policy, receipt)
    domains = {target: asd.specs(registry, receipt, target) for target in sorted(TARGETS)}
    require(base_plan["masterReceiptSha256"] == registry["masterSha256"], "master mismatch")
    require(type(catalog["entries"]) is list and catalog["entries"], "entries")
    entries = {}
    projected = set()
    for entry in catalog["entries"]:
        require(type(entry) is dict and set(entry) == ENTRY_KEYS, "entry shape")
        eid = entry["id"]
        require(type(eid) is str and ID.fullmatch(eid) and eid not in entries, "entry identity")
        require(type(entry["version"]) is str and VERSION.fullmatch(entry["version"]), "entry version")
        require(entry["family"] in FAMILIES, "entry family")
        require(entry["state"] in {"REFERENCE_ONLY", "CANDIDATE", "BLOCKED"}, "entry state")
        require(entry["source"] in {"asdRegistry", "masterReceipt"}, "entry source")
        require(entry["licenseStatus"] == "INTERNAL_REVIEW_REQUIRED", "license not established")
        targets = strings(entry["targets"], "targets")
        params = strings(entry["parameters"], "parameters")
        strings(entry["dependencies"], "dependencies")
        require(strings(entry["evidence"], "evidence"), "missing evidence pointers")
        require(targets <= TARGETS, "target not supported")
        if entry["state"] == "BLOCKED":
            require(not targets and not params, "blocked entry exposes capability")
        elif entry["state"] == "REFERENCE_ONLY":
            require(not params and entry["source"] == "masterReceipt", "reference exposes parameters")
        else:
            require(targets and params and entry["source"] == "asdRegistry", "candidate source or domain")
        if params:
            bindings = {(t,p) for t in targets for p in params if p in domains[t]}
            require({p for _,p in bindings} == params and {t for t,_ in bindings} == targets,
                    "unresolved parameter or target")
            require(not (bindings & projected), "duplicate parameter ownership")
            projected |= bindings
        entries[eid] = entry
    require(projected == {(t,p) for t, specs in domains.items() for p in specs}, "registry projection incomplete")
    visiting, done = set(), set()
    def visit(eid):
        require(eid in entries, "unresolved dependency")
        require(eid not in visiting, "dependency cycle")
        if eid in done:
            return
        visiting.add(eid)
        for dep in entries[eid]["dependencies"]:
            visit(dep)
            require(entries[dep]["state"] != "BLOCKED" or entries[eid]["state"] == "BLOCKED",
                    "blocked dependency")
        visiting.remove(eid)
        done.add(eid)
    for eid in entries:
        visit(eid)
    require(type(catalog["presets"]) is list and len(catalog["presets"]) == 1, "pilot preset scope")
    p = catalog["presets"][0]
    require(type(p) is dict and set(p) == {"id","version","state","world","entries","intent"}, "preset shape")
    require(p["id"] == p["world"] == "library.reference" and p["state"] == "REFERENCE_ONLY"
            and type(p["version"]) is str and VERSION.fullmatch(p["version"]), "preset boundary")
    require(type(p["intent"]) is str and p["intent"], "preset intent")
    selected = strings(p["entries"], "preset entries")
    require(p["world"] in selected and selected <= set(entries), "preset reference")
    require(entries[p["world"]]["family"] == "world", "preset world")
    for eid in selected:
        require(entries[eid]["state"] != "BLOCKED", "preset blocked entry")
        require(set(entries[eid]["dependencies"]) <= selected, "preset dependency closure")
    require(type(catalog["concepts"]) is list and len(catalog["concepts"]) == 1, "concept scope")
    concept = catalog["concepts"][0]
    require(type(concept) is dict and set(concept) ==
            {"id","state","world","style","lighting","atmosphere","outputs","seed","notes"}, "concept shape")
    require(concept["id"] == "aurelia" and concept["state"] == "CONCEPT_ONLY", "concept boundary")
    require(all(type(concept[k]) is str and concept[k] for k in
                ("world","style","lighting","atmosphere","notes")), "concept labels")
    require(strings(concept["outputs"], "concept outputs") == {"artistic","interactive"}
            and type(concept["seed"]) is int, "concept output or seed")
    return {"schema": "atlas.awc.catalog-report/v1", "mode": "PLAN_ONLY",
            "status": "CONTRACT_VALID", "catalogVersion": catalog["version"],
            "masterReceiptSha256": base_plan["masterReceiptSha256"],
            "masterBytesVerified": False, "entryCount": len(entries),
            "projectedParameters": len(projected), "blockedEntries": sorted(
                e for e in entries if entries[e]["state"] == "BLOCKED"),
            "preset": p["id"], "concept": concept["id"], "authority": base_plan["authority"],
            "rendererExecution": False, "artisticApproval": False,
            "toolsQualified": False, "unmetEvidence": base_plan["unmetEvidence"]}

def main():
    catalog = strict_json((ROOT / CATALOG).read_bytes())
    raw_sources = {k: (ROOT / p).read_bytes() for k,p in SOURCES.items()}
    print(json.dumps(validate(catalog, raw_sources), indent=2, sort_keys=True))

if __name__ == "__main__":
    main()
