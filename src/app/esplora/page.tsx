import { AppShell } from "@/components/atlas/app-shell";
import { ExploreHub } from "@/features/explore/explore-hub";

export default function ExplorePage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Esplora · La prima scoperta</span>
          <h1>Da una domanda può nascere un viaggio.</h1>
          <p>
            Inizia da qualcosa che ti incuriosisce, osserva che cosa accade
            e segui le connessioni con le altre conoscenze.
          </p>
        </div>
      </header>
      <ExploreHub />
    </AppShell>
  );
}
