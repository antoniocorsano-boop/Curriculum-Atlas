import { AppShell } from "@/components/atlas/app-shell";

export default function CurriculumPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Curricolo</h1>
          <p>Albero curricolare, progressione e provenance Arena saranno implementati nello slice F1.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Struttura curricolare</h3>
        <p style={{ color: "var(--text-secondary)" }}>La foundation non duplica né inventa dati curricolari.</p>
      </section>
    </AppShell>
  );
}
