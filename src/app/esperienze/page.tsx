import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/atlas/app-shell";
import { ExperienceLibrary } from "@/features/atlas-gateway/experience-library";
import { loadPublicPathways, type PublicPathwaySource } from "@/features/pathways/load-public-pathways";
import portfolio from "../../../governance/percorsi-portfolio.json";

export const metadata: Metadata = { title: "Esperienze Atlas · Candidata", robots: { index: false, follow: false } };
export default function ExperiencesPage() {
  if (process.env.ATLAS_GATEWAY_PREVIEW !== "true") notFound();
  const pathways = loadPublicPathways(portfolio.pathways as PublicPathwaySource[]);
  return <AppShell><ExperienceLibrary pathways={pathways} /></AppShell>;
}
