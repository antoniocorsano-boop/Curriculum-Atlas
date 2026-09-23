import { AppShell } from "@/components/atlas/app-shell";
import { ResourceCatalog } from "@/components/atlas/resource-catalog";

export default function ResourcesPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Catalogo editoriale Atlas</span>
          <h1>Risorse Atlas</h1>
          <p>Esplora oggetti didattici riusabili con metadati editoriali, accessibilità, diritti e collegamenti curricolari.</p>
        </div>
      </header>
      <ResourceCatalog />
    </AppShell>
  );
}
