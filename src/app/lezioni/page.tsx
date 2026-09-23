import { AppShell } from "@/components/atlas/app-shell";

export default function Page() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Lezioni</h1>
          <p>Le proposte didattiche pubblicabili saranno collegate agli obiettivi senza introdurre dati personali.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Lezioni</h3>
        <p style={{ color: "var(--text-secondary)" }}>Superficie predisposta; implementazione funzionale in slice successiva.</p>
      </section>
    </AppShell>
  );
}
