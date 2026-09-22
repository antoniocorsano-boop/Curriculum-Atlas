import { AppShell } from "@/components/atlas/app-shell";

export default function PathwaysPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Percorsi</h1>
          <p>Le sequenze didattiche collegheranno tappe, obiettivi e risorse senza creare un secondo curricolo.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Percorsi collegati</h3>
        <p style={{ color: "var(--text-secondary)" }}>Timeline e relazioni saranno implementate dopo la foundation.</p>
      </section>
    </AppShell>
  );
}
