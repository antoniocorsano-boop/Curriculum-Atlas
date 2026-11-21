import type { Metadata } from "next";
import { AtlasEntry } from "@/features/atlas-gateway/atlas-entry";

export const metadata: Metadata = {
  title: "ATLAS · Mondi della conoscenza",
  description: "Ingresso ai mondi della conoscenza: Curricolo, Esplora, Percorsi ed Esperienze.",
};

export default function HomePage() {
  return <AtlasEntry />;
}
