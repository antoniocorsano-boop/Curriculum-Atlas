import type { Metadata } from "next";
import { studioAtlasSnapshotToExperience } from "@/features/pathways/studio-atlas-preview-adapter";
import { museoZeroP3ReviewSnapshot } from "@/features/experiences/museo-zero-p3-review-snapshot";
import { MuseoZeroEducationalInfo } from "@/features/experiences/museo-zero-educational-info";
import { MuseoZeroReviewSurface } from "@/features/experiences/museo-zero-review-surface";

export const metadata: Metadata = {
  title: "Museo Zero · Laboratorio di revisione · Atlas",
  robots: { index: false, follow: false },
  description: "Ambiente di verifica professionale di un candidato narrativo non autorizzato all'uso con studenti.",
};

const definition = studioAtlasSnapshotToExperience(museoZeroP3ReviewSnapshot);

export default function MuseoZeroReviewPage() {
  return (
    <div data-testid="museo-zero-p3-review" data-student-authorized="false" data-runtime-authorized="false">
      <aside
        role="note"
        data-testid="museo-review-notice"
        style={{
          display: "block",
          visibility: "visible",
          padding: "16px 20px",
          margin: "0 0 16px",
          border: "2px solid #ab8251",
          borderRadius: "12px",
          background: "#fff4df",
          color: "#332718",
        }}
      >
        <strong style={{ display: "block", fontSize: "15px", marginBottom: "6px" }}>
          Solo revisione professionale · MUSEO ZERO P3
        </strong>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: 1.6 }}>
          Il controllo umano del prodotto è ancora REVISE. Questa riproduzione
          delle sette scene di Studio Atlas serve per correggere e valutare
          l&apos;esperienza; non è approvata per studenti o per la pubblicazione.
        </p>
      </aside>
      <MuseoZeroReviewSurface
        definition={definition}
        title="Museo Zero · La sala che non torna"
        description="Quattro luoghi, indizi da confrontare e una sala interattiva che non risponde come dovrebbe. Indaga, prova una mappatura simulata e osserva che cosa cambia."
        reviewNotice="Revisione narrativa: REVISE · Solo laboratorio"
        educationalInfo={<MuseoZeroEducationalInfo key="museo-zero-educational-info" snapshot={{
          pathwayId: museoZeroP3ReviewSnapshot.pathwayId,
          snapshotId: museoZeroP3ReviewSnapshot.snapshotId,
          packageDigest: museoZeroP3ReviewSnapshot.packageDigest,
          version: museoZeroP3ReviewSnapshot.version,
        }} />}
      />
    </div>
  );
}
