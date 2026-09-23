import { AppShell } from "@/components/atlas/app-shell";
import { CurriculumTree } from "@/components/atlas/curriculum-tree";
import { ProvenancePanel } from "@/components/atlas/provenance-panel";

export default function CurriculumPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Curricolo</span>
          <h1>Struttura e progressione</h1>
          <p>Esplora annualità, nuclei e obiettivi mantenendo sempre visibile la provenienza curricolare.</p>
        </div>
      </header>

      <div className="atlas-curriculum-layout">
        <section className="atlas-panel">
          <CurriculumTree />
        </section>
        <div className="atlas-curriculum-rail">
          <ProvenancePanel label="Dati dimostrativi governati per S3-V2/F1" version="fixture S3-V2/F1" />
          <section className="atlas-panel atlas-progression-panel">
            <h3>Progressione</h3>
            <ol>
              <li><strong>Prima</strong><span>osservare e riconoscere</span></li>
              <li><strong>Seconda</strong><span>analizzare sistemi e processi</span></li>
              <li><strong>Terza</strong><span>valutare e progettare</span></li>
            </ol>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
