#!/usr/bin/env python3
"""Validate ASP-01 index and immutable history/release prefixes."""
import json
import pathlib
import re
import subprocess
import sys

root = pathlib.Path(__file__).resolve().parents[1]
folder = root / "ops/atlas-scene-package"
hex64 = re.compile(r"[a-f0-9]{64}")
hex40 = re.compile(r"[a-f0-9]{40}")

def require(condition, reason):
    if not condition:
        raise ValueError(reason)

def history_rows(raw):
    return [json.loads(line) for line in raw.splitlines() if line.strip()]

registry = json.loads((folder / "registry.json").read_text())
history_raw = (folder / "history.jsonl").read_text()
history = history_rows(history_raw)
require(registry["schema"] == "trama.atlas.scene-package-registry/v1", "schema")
require(registry["standard"] == "ASP-01", "standard")
require(registry["publishable"] is False and registry["studentAuthorized"] is False, "publication boundary")
releases = registry["releases"]
require(bool(releases), "no releases")
versions = set()
artifacts = set()
for release in releases:
    version = release["version"]
    require(version not in versions, "duplicate package version")
    versions.add(version)
    require(hex64.fullmatch(release["sha256"]) and release["bytes"] > 0, "package identity")
    require(hex40.fullmatch(release["sourceCommit"]), "source commit")
    require(hex64.fullmatch(release["archivedHistorySha256"]) and hex64.fullmatch(release["catalogSha256"]), "catalog identity")
    require(0 < release["historyCount"] <= len(history), "history count")
    archive_ids = set()
    for asset in release["archives"]:
        require(asset["id"] not in archive_ids and asset["bytes"] > 0 and hex64.fullmatch(asset["sha256"]), "archive identity")
        archive_ids.add(asset["id"])
    artifacts.update(archive_ids)
    runtime_ids = set()
    for asset in release["runtimeAssets"]:
        require(asset["id"] not in runtime_ids and asset["artifact"] in archive_ids and asset["bytes"] > 0 and hex64.fullmatch(asset["sha256"]), "runtime identity")
        member = pathlib.PurePosixPath(asset["member"])
        require(not member.is_absolute() and ".." not in member.parts, "unsafe member path")
        runtime_ids.add(asset["id"])
    require(runtime_ids == {"shell","scenography","cupola","portals","bays","stars","sky","ambient"}, "runtime set")
ids = set()
for seq, row in enumerate(history, 1):
    require(row["sequence"] == seq and row["id"] == f"ASP-H{seq:03d}", "history sequence")
    require(row["kind"] in {"decision","incident","evidence","proposal","correction"}, "history kind")
    require(bool(row["summary"]) and bool(row["phase"]) and bool(row["status"]), "history substance")
    require(re.fullmatch(r"\d{4}-\d{2}-\d{2}", row["recordedOn"]), "recording date")
    require(row["commit"] is None or hex40.fullmatch(row["commit"]), "commit reference")
    require(set(row["artifacts"]) <= artifacts, "missing archived evidence")
    if "supersedes" in row:
        require(row["supersedes"] in ids, "superseded ID must precede correction")
    # The first fifteen records are a retrospective snapshot. Never fabricate
    # missing decision fields to retrofit historical records.
    if seq > 15:
        for key in ("context", "decision", "rationale"):
            require(isinstance(row.get(key), str) and bool(row[key].strip()), "missing decision field: " + key)
        for key in ("alternatives", "constraints", "remaining"):
            require(isinstance(row.get(key), list) and all(isinstance(v,str) and v.strip() for v in row[key]), "invalid decision list: " + key)
        require(bool(row["alternatives"]) and bool(row["constraints"]), "alternatives and constraints required")
        require(isinstance(row.get("evidence"),list) and bool(row["evidence"]), "missing evidence")
        for evidence in row["evidence"]:
            require(evidence.get("outcome") and (evidence.get("url","").startswith("https://github.com/") or (isinstance(evidence.get("artifact"),int) and hex64.fullmatch(evidence.get("sha256","")) and evidence.get("bytes",0)>0)), "unverifiable evidence reference")
        if row["status"] in {"completed","qualified","closed"}:
            require(not row["remaining"], "cannot close a phase with outstanding required checks")
            require(any(e["outcome"]=="PASS" for e in row["evidence"]), "closure requires observed PASS evidence")
            criteria=row.get("acceptanceCriteria")
            require(isinstance(criteria,list) and bool(criteria) and all(c.get("criterion") and c.get("result")=="PASS" and c.get("evidence") in range(len(row["evidence"])) and row["evidence"][c["evidence"]]["outcome"]=="PASS" for c in criteria), "closure requires evidence-bound acceptance criteria")
    ids.add(row["id"])

if len(sys.argv) == 2:
    base = sys.argv[1]
    require(hex40.fullmatch(base), "base commit")
    def old_file(path):
        spec = f"{base}:{path}"
        # Verify the base exists; absence of a file is acceptable only for initial introduction.
        subprocess.run(["git", "cat-file", "-e", base + "^{commit}"], cwd=root, check=True)
        res = subprocess.run(["git","show",spec], cwd=root, capture_output=True, text=True)
        return res.stdout if res.returncode == 0 else None
    old_history = old_file("ops/atlas-scene-package/history.jsonl")
    old_registry = old_file("ops/atlas-scene-package/registry.json")
    if old_history is not None:
        require(history_raw.startswith(old_history), "history was rewritten or truncated")
    if old_registry is not None:
        old_releases = json.loads(old_registry)["releases"]
        require(releases[:len(old_releases)] == old_releases, "previous package receipt changed")
print(f"ASP-01 PASS: {len(history)} history entries, {len(releases)} versions, {len(artifacts)} archived sources")
