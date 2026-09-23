import { AppShell } from "@/components/atlas/app-shell";

export default function Page() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Raccordi</h1>
          <p>I raccordi interdisciplinari saranno esplorabili come relazioni controllate con equivalente testuale.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Raccordi</h3>
        <p style={{ color: "var(--text-secondary)" }}>Superficie predisposta; implementazione funzionale in slice successiva.</p>
      </section>
    </AppShell>
  );
}
