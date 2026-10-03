import { AppShell } from "@/components/atlas/app-shell";
import { PathwayCatalog } from "@/features/pathways/pathway-catalog";
import { loadPublicPathways, type PublicPathwaySource } from "@/features/pathways/load-public-pathways";
import portfolio from "../../../governance/percorsi-portfolio.json";

export default function PathwaysPage() {
  const pathways = loadPublicPathways(portfolio.pathways as PublicPathwaySource[]);
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Atlas · Percorsi</span>
          <h1>Percorsi</h1>
          <p>Esperienze trasversali pubblicate solo dopo qualificazione e autorizzazione runtime esplicita.</p>
        </div>
      </header>
      <PathwayCatalog pathways={pathways} />
    </AppShell>
  );
}
