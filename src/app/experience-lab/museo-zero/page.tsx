import type { Metadata } from "next";
import { studioAtlasSnapshotToExperience } from "@/features/pathways/studio-atlas-preview-adapter";
import { museoZeroP3ReviewSnapshot } from "@/features/experiences/museo-zero-p3-review-snapshot";
import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";

export const metadata: Metadata = {
  title: "Museo Zero · Laboratorio di revisione · Atlas",
  robots: { index: false, follow: false },
  description: "Ambiente di verifica professionale di un candidato narrativo non autorizzato all'uso con studenti.",
};

const definition = studioAtlasSnapshotToExperience(museoZeroP3ReviewSnapshot);

export default function MuseoZeroReviewPage() {
  return (
    <div data-testid="museo-zero-p3-review" data-student-authorized="false" data-runtime-authorized="false">
      <div role="note" className="atlas-domain-note">
        <strong>Solo revisione professionale · MUSEO ZERO P3</strong>
        <span>
          Il controllo umano del prodotto è ancora REVISE. Questa riproduzione
          delle sette scene di Studio Atlas serve per correggere e valutare
          l'esperienza; non è approvata per studenti o per la pubblicazione.
        </span>
      </div>
      <PathwayRuntimeSurface
        definition={definition}
        title="Museo Zero · La sala che non torna"
        description="Quattro luoghi, indizi da confrontare e una sala interattiva che non risponde come dovrebbe. Indaga, prova una mappatura simulata e osserva che cosa cambia."
        reviewNotice="Revisione narrativa: REVISE · Solo laboratorio"
      />
    </div>
  );
}
