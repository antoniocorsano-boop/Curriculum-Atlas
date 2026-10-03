import type { PublicPathwaySummary } from "./load-public-pathways";
import "./pathway-catalog.css";

export function PathwayCatalog({ pathways }: { pathways: PublicPathwaySummary[] }) {
  if (pathways.length === 0) {
    return (
      <section className="pathwayCatalog pathwayCatalog--empty" aria-live="polite">
        <h2>Nessun percorso è ancora autorizzato per l’uso pubblico</h2>
        <p>I percorsi in progettazione o qualificazione restano fuori dalla superficie studente finché non esiste un’autorizzazione runtime esplicita.</p>
      </section>
    );
  }

  return (
    <section className="pathwayCatalog" aria-label="Percorsi disponibili">
      {pathways.map((pathway) => (
        <article className="pathwayCatalog__item" key={pathway.pathwayId}>
          <div>
            <p className="pathwayCatalog__meta">v{pathway.version} · {pathway.provenanceRef}</p>
            <h2>
              {pathway.launchHref
                ? <a href={pathway.launchHref}>{pathway.title}</a>
                : pathway.title}
            </h2>
          </div>
          {pathway.availability === "WITHDRAWN" && <strong>Non disponibile</strong>}
        </article>
      ))}
    </section>
  );
}
