import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "node:fs";
import { GatewayCandidate } from "@/features/atlas-gateway/gateway-candidate";

export const metadata: Metadata = { title: "Atlas Gateway · Candidata", robots: { index: false, follow: false } };

function getPreparedScene(): string | null {
  const file = process.env.ATLAS_GATEWAY_SCENE_FILE;
  if (!file) return null;
  try {
    const source = readFileSync(file, "utf8");
    if (source.length > 4000000 || !source.includes("atlas-gateway-local-scene-v1")
      || !source.includes("__ATLAS_PARENT_ORIGIN_JSON__") || !source.includes("__ATLAS_CHANNEL_JSON__")) return null;
    return source;
  } catch {
    return null;
  }
}

export default function GatewayPage() {
  if (process.env.ATLAS_GATEWAY_PREVIEW !== "true") notFound();
  return <GatewayCandidate preparedScene={getPreparedScene()} />;
}
