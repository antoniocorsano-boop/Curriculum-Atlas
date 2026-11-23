"use client";

import { useState } from "react";
import { EnergyDiscovery } from "@/features/explore/energy-discovery";
import { RelationExplorer } from "@/components/atlas/relation-explorer";

export function ExploreHub() {
  const [focusRequest, setFocusRequest] = useState(0);

  return (
    <div className="atlas-explore-hub" data-testid="atlas-esplora-percorso-domanda">
      <EnergyDiscovery onExploreConnections={() => setFocusRequest(value => value + 1)} />
      <section id="atlas-mappa-conoscenze" aria-labelledby="atlas-mappa-title" className="atlas-explore-hub-map">
        <header className="atlas-page-heading">
          <div>
            <span className="atlas-eyebrow">Dalla scoperta alla rete delle conoscenze</span>
            <h2 id="atlas-mappa-title">Scopri come si collegano le idee.</h2>
            <p>
              Esplora le discipline e gli argomenti con la mappa oppure con l'elenco.
              Se hai seguito la storia della lampada, puoi trovare i sistemi energetici di Tecnologia.
              I dati del curricolo provengono da Arena e sono ancora in validazione.
            </p>
          </div>
        </header>
        <RelationExplorer focusRequest={focusRequest} />
      </section>
    </div>
  );
}
