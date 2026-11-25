import type { Metadata } from "next";
import { AppShell } from "@/components/atlas/app-shell";
import { EducationalLibrary } from "@/features/experiences/educational-library-view";
import { museoZeroEducationalProfile as profile } from "@/features/experiences/museo-zero-educational-profile";

export const metadata: Metadata = { title: "Biblioteca educativa · Revisione professionale · Atlas", robots: {index:false, follow:false} };

export default function EducationalLibraryReviewPage() {
  return <AppShell><div data-student-authorized="false" data-runtime-authorized="false" data-testid="educational-library-review">
    <EducationalLibrary reviewOnly items={[{
      id: profile.pathwayId, title: "Museo Zero · La sala che non torna",
      form: "Laboratori", discipline: "Tecnologia", audience: "Secondaria di primo grado",
      summary: "Entra nel gruppo di allestimento di un museo e contribuisci a preparare la sala per l’apertura.",
      version: profile.experienceVersion, documentVersion: profile.documentVersion,
      sections: profile.sections, href: "/experience-lab/museo-zero/",
    }]} />
  </div></AppShell>;
}
