import { AppShell } from "@/components/atlas/app-shell";
import { RelationExplorer } from "@/components/atlas/relation-explorer";

export default function ExplorePage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Esplora · Mappa relazionale</span>
          <h1>Vedi come il curricolo si connette.</h1>
          <p>Passa dalla struttura gerarchica alla rete di relazioni tra discipline, ordini di scuola, obiettivi e raccordi.</p>
        </div>
      </header>
      <RelationExplorer />
    </AppShell>
  );
}
