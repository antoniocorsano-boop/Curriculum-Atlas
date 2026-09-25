import { AppShell } from "@/components/atlas/app-shell";
import { MaterialBrowser } from "@/components/atlas/material-browser";

export default function MaterialsPage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Materiali didattici pubblicati</span>
          <h1>Le lezioni della tua classe.</h1>
          <p>Scegli classe e disciplina per vedere esclusivamente i materiali resi disponibili lezione per lezione.</p>
        </div>
      </header>
      <MaterialBrowser />
    </AppShell>
  );
}
