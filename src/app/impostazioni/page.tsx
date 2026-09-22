import { AppShell } from "@/components/atlas/app-shell";

export default function Page() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Impostazioni</h1>
          <p>Le preferenze locali di visualizzazione non modificheranno autorità, curricolo o stato editoriale.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Impostazioni</h3>
        <p style={{ color: "var(--text-secondary)" }}>Superficie predisposta; implementazione funzionale in slice successiva.</p>
      </section>
    </AppShell>
  );
}
