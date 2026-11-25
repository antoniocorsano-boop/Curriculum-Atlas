import type { Metadata } from "next";
import { AppShell } from "@/components/atlas/app-shell";
import { ExperienceLibrary } from "@/features/atlas-gateway/experience-library";
import { loadPublicPathways, type PublicPathwaySource } from "@/features/pathways/load-public-pathways";
import portfolio from "../../../governance/percorsi-portfolio.json";

export const metadata: Metadata = { title: "Esperienze Atlas", robots: { index: false, follow: false } };
export default function ExperiencesPage() {
  const preview = process.env.ATLAS_GATEWAY_PREVIEW === "true";
  // The public catalog is always reachable, but neither mode grants authorization.
  const pathways = loadPublicPathways(portfolio.pathways as PublicPathwaySource[])
    .filter(p => p.availability === "ACTIVE");
  return <AppShell><ExperienceLibrary pathways={pathways} preview={preview} /></AppShell>;
}
