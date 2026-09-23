import { AppShell } from "@/components/atlas/app-shell";

export default function ResourcesPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">S3-V2 · Foundation</span>
          <h1>Risorse</h1>
          <p>Catalogo, filtri, metadata di accessibilità e stato editoriale saranno implementati nello slice F3.</p>
        </div>
      </header>
      <section className="atlas-panel">
        <h3>Catalogo Atlas</h3>
        <p style={{ color: "var(--text-secondary)" }}>Nessuna risorsa è adottata automaticamente dal docente.</p>
      </section>
    </AppShell>
  );
}
