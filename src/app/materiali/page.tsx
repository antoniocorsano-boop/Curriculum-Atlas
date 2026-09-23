import { AppShell } from "@/components/atlas/app-shell";
import { MaterialBrowser } from "@/components/atlas/material-browser";

export default function MaterialsPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Materiali didattici</span>
          <h1>Le tue lezioni, in ordine.</h1>
          <p>Scegli la classe e la disciplina per vedere i materiali pubblicati, organizzati lezione per lezione.</p>
        </div>
      </header>
      <MaterialBrowser />
    </AppShell>
  );
}
