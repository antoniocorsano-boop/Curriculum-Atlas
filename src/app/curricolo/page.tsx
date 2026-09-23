import { AppShell } from "@/components/atlas/app-shell";
import { CurriculumTree } from "@/components/atlas/curriculum-tree";
import { ProvenancePanel } from "@/components/atlas/provenance-panel";

export default function CurriculumPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Curricolo verticale di istituto</span>
          <h1>Il curricolo dell’istituto</h1>
          <p>Esplora aree, discipline, ordini di scuola, annualità, nuclei e obiettivi in una struttura verticale unica.</p>
        </div>
      </header>

      <div className="atlas-curriculum-layout">
        <section className="atlas-panel">
          <CurriculumTree />
        </section>
        <div className="atlas-curriculum-rail">
          <ProvenancePanel label="Fixture di istituto per S3-V2/F1 · fonte reale non ancora collegata" version="fixture S3-V2/F1" />
          <section className="atlas-panel atlas-progression-panel">
            <h3>Ordini di scuola</h3>
            <ol>
              <li><strong>Infanzia</strong><span>campi di esperienza</span></li>
              <li><strong>Primaria</strong><span>sviluppo dei fondamenti disciplinari</span></li>
              <li><strong>Secondaria I</strong><span>discipline, raccordi e progressione</span></li>
            </ol>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
