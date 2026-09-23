import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <section className="atlas-panel" style={{ marginTop: 14 }}>
        <span className="atlas-eyebrow">Prototipo di ricerca</span>
        <h3 style={{ marginTop: 8 }}>Perché? · laboratorio cognitivo</h3>
        <p style={{ color: "var(--text-secondary)" }}>Una attività sperimentale pubblica, senza credenziali, con stato locale e salvataggio sul dispositivo.</p>
        <Link className="atlas-why-prototype-link" href="/attivita/perche">
          Apri il prototipo <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </AppShell>
  );
}
