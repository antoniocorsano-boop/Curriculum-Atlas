"""ASC-01/P0: read-only deterministic planning, not a scene compiler."""
import json
import re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
POLICY = ROOT / "ops/atlas-scene-package/asc01-production-policy.json"

def require(ok, message):
    if not ok:
        raise ValueError(message)

def plan(policy, receipt):
    require(policy.get("schema") == "atlas.asc01.production-policy/v1" and policy.get("status") == "PLAN_ONLY", "policy status")
    pilot = policy["pilot"]
    authority = policy["authority"]
    keys = {"masterWrite", "runtimeWrite", "studentAuthorized", "publishable", "paidServices", "externalRuntimeRequests", "autoPromotion"}
    require(set(authority) == keys and all(v is False for v in authority.values()), "authority")
    require(pilot["renderer"] == "three.js-r128" and pilot["artCandidateIntegrated"] is False, "pilot scope")
    require(receipt.get("schema") == "atlas.asp01.editable-master-evidence/v1", "receipt schema")
    expected = pilot["masterSha256"]
    require(re.fullmatch(r"[0-9a-f]{64}", expected) and receipt["file"]["sha256"] == expected, "master receipt mismatch")
    require(receipt["file"]["name"] == "Atlas-Scene-Master.blend", "master file identity")
    require(receipt["externalLibraries"] == 0 and receipt["externalFonts"] == 0, "external dependencies")
    require(receipt["sourceTransformsPreserved"] is True, "source transforms")
    require(len(receipt["cameraIds"]) == len(set(receipt["cameraIds"])) == 7, "camera inventory")
    bay = [x for x in receipt["collections"] if x["name"] == "02 Campate condivise"]
    require(len(bay) == 1 and (bay[0]["objects"], bay[0]["uniqueMeshes"]) == (495, 25), "bay inventory drift")
    require(policy["variants"] == [{"id":"A","kind":"master-reference"},{"id":"B","kind":"baked-unlit"},{"id":"C","kind":"hybrid-pbr-lightmap"}], "variant contract")
    return {"schema":"atlas.asc01.plan/v1","status":"PLAN_ONLY","pilot":pilot["id"],
            "masterReceiptSha256":expected,"masterBytesVerified":False,"toolsQualified":False,
            "artCandidateReviewed":False,"variants":policy["variants"],"profiles":policy["profiles"],
            "stages":policy["stages"],"unmetEvidence":policy["requiredEvidence"],"authority":authority}

def main():
    policy = json.loads(POLICY.read_text(encoding="utf-8"))
    # Do not resolve paths from untrusted input; this is the existing ASP receipt.
    receipt_path = "ops/atlas-scene-package/editable-master-receipt-summary.json"
    require(policy["pilot"]["receipt"] == receipt_path, "receipt path")
    receipt = json.loads((ROOT / receipt_path).read_text(encoding="utf-8"))
    print(json.dumps(plan(policy, receipt), sort_keys=True, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
