import { AppShell } from "@/components/atlas/app-shell";

export default function ExplorePage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Esplora</h1>
          <p>La mappa relazionale verrà implementata nello slice F2, sopra questa shell governata.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Mappa relazionale del curricolo</h3>
        <p style={{ color: "var(--text-secondary)" }}>
          RelationCanvas, filtri semantici, pannello contestuale ed equivalente elenco sono il prossimo incremento dedicato.
        </p>
      </section>
    </AppShell>
  );
}
