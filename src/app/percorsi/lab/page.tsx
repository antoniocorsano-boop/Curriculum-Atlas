import Link from "next/link";
import library from "../../../../governance/percorsi-student-library.json";
import "./library.css";

export const metadata = {
  title: "Percorsi · Libreria in revisione · Atlas",
  robots: { index: false, follow: false },
};

const pathwayHref: Record<string, string> = {
  "pw-missing-information-01": "/percorsi/lab/pw-missing-information-01",
  "pw-constraints-tradeoffs-01": "/percorsi/lab/pw-constraints-tradeoffs-01",
};

const stateLabel: Record<string, string> = {
  PRODUCT_RECOVERY_REFERENCE: "Ricostruzione di prodotto",
  SCREENPLAY_REQUIRED: "Sceneggiatura da completare",
  PRODUCT_AUTHORED_CANDIDATE: "Sceneggiatura implementata · in revisione",
};

export default function PercorsiLabLibraryPage() {
  return (
    <main className="pathwayLibrary">
      <header className="pathwayLibrary__intro">
        <p className="pathwayLibrary__eyebrow">Atlas · Percorsi · anteprima di prodotto</p>
        <h1>Una libreria per esercitare strategie che servono in situazioni diverse</h1>
        <p>
          I Percorsi non sono quiz né corsi fissi. Ogni esperienza parte da una situazione, rende visibili le conseguenze delle scelte,
          permette di rivedere la strategia e la prova di nuovo in un contesto diverso.
        </p>
        <p className="pathwayLibrary__privacy">
          I traguardi personali, quando attivati, restano soltanto sul dispositivo. Nessun account, classifica o profilo remoto.
        </p>
      </header>

      <p className="pathwayLibrary__privacy"><strong>Territori candidati.</strong> I sei raggruppamenti sono una mappa provvisoria di navigazione e progettazione, non una tassonomia approvata dello studente.</p>

      <nav className="pathwayLibrary__territories" aria-label="Territori candidati di progettazione">
        {library.territories.map((territory, index) => {
          const pathways = library.pathways.filter((item) => item.candidateTerritories.includes(territory.id));
          return (
            <section className="pathwayLibrary__territory" key={territory.id} aria-labelledby={`territory-${territory.id}`}>
              <div className="pathwayLibrary__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</div>
              <div className="pathwayLibrary__territoryBody">
                <h2 id={`territory-${territory.id}`}>{territory.label}</h2>
                <p>{territory.purpose}</p>
                {pathways.length > 0 ? (
                  <ul className="pathwayLibrary__pathways">
                    {pathways.map((pathway) => (
                      <li key={pathway.pathwayId}>
                        <Link href={pathwayHref[pathway.pathwayId] ?? "#"}>
                          <span>{pathway.title}</span>
                          <small>{stateLabel[pathway.productState] ?? pathway.productState}</small>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pathwayLibrary__empty">Territorio definito · nuovi Percorsi da progettare con il workflow governato.</p>
                )}
              </div>
            </section>
          );
        })}
      </nav>

      <footer className="pathwayLibrary__footer">
        <strong>Stato:</strong> anteprima di progettazione. Nessun Percorso è autorizzato all’uso pubblico con studenti.
      </footer>
    </main>
  );
}
