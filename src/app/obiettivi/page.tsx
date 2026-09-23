import { AppShell } from "@/components/atlas/app-shell";

export default function Page() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Obiettivi</h1>
          <p>La vista obiettivi sarà una proiezione navigabile della fonte curricolare Arena, non una copia autorevole.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Obiettivi</h3>
        <p style={{ color: "var(--text-secondary)" }}>Superficie predisposta; implementazione funzionale in slice successiva.</p>
      </section>
    </AppShell>
  );
}
