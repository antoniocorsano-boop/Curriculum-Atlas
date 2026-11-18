import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { hash } from "node:crypto";
import { GatewayCandidate } from "@/features/atlas-gateway/gateway-candidate";
import { parseNativeManifest } from "@/features/atlas-gateway/native-asset-policy";

export const metadata: Metadata = { title: "Atlas Gateway · Candidata", robots: { index: false, follow: false } };

function getPreparedScene(): string | null {
  const file = process.env.ATLAS_GATEWAY_SCENE_FILE;
  const expected = process.env.ATLAS_GATEWAY_SCENE_SHA256;
  if (!file || !expected || !/^[a-f0-9]{64}$/.test(expected)) return null;
  try {
    const bytes = readFileSync(file);
    if (hash("sha256", bytes, "hex") !== expected) return null;
    const source = bytes.toString("utf8");
    if (source.length > 4000000 || !source.includes("atlas-gateway-local-scene-v1")
      || !source.includes("__ATLAS_PARENT_ORIGIN_JSON__") || !source.includes("__ATLAS_CHANNEL_JSON__")) return null;
    return source;
  } catch {
    return null;
  }
}

function getNativeManifest(scene: string | null) {
  if (!scene?.includes('name="atlas-gateway-native-v1"')) return null;
  if (process.env.ATLAS_GATEWAY_NATIVE_PREVIEW !== "true" || process.env.ATLAS_GITHUB_PAGES === "true" || process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true") return null;
  const file = process.env.ATLAS_GATEWAY_NATIVE_MANIFEST;
  const sha = process.env.ATLAS_GATEWAY_NATIVE_MANIFEST_SHA256;
  if (!file || !sha || !/^[a-f0-9]{64}$/.test(sha)) return null;
  try {
    const bytes = readFileSync(file);
    if (bytes.length > 16384 || hash("sha256", bytes, "hex") !== sha) return null;
    return parseNativeManifest(JSON.parse(bytes.toString("utf8")));
  } catch { return null; }
}

export default function GatewayPage() {
  if (process.env.ATLAS_GATEWAY_PREVIEW !== "true") notFound();
  const scene = getPreparedScene();
  const native = getNativeManifest(scene);
  return <GatewayCandidate preparedScene={scene?.includes('name="atlas-gateway-native-v1"') && !native ? null : scene} nativeManifest={native} />;
}
