import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Sparkles, Waypoints } from "lucide-react";
import { AppShell } from "@/components/atlas/app-shell";
import styles from "./ingresso.module.css";

const destinations = [
  {
    id: "esplora",
    href: "/esplora",
    number: "01",
    title: "Esplora",
    description: "Una domanda, un'idea, qualcosa che ti incuriosisce: scopri dove ti porta.",
    icon: Compass,
  },
  {
    id: "esperienze",
    href: "/esperienze",
    number: "02",
    title: "Esperienze",
    description: "Un luogo per storie, laboratori e scoperte da vivere. Le attività arriveranno dopo la verifica.",
    icon: Sparkles,
  },
  {
    id: "percorsi",
    href: "/percorsi",
    number: "03",
    title: "Percorsi",
    description: "Segui un itinerario, affronta una sfida, trova nuove possibilità.",
    icon: Waypoints,
  },
  {
    id: "curricolo",
    href: "/curricolo",
    number: "04",
    title: "Curricolo",
    description: "Trova discipline, argomenti e collegamenti per approfondire.",
    icon: BookOpen,
  },
] as const;

export default function HomePage() {
  return (
    <AppShell>
      <div className={styles.gateway} data-testid="atlas-ingresso-web">
        <header className={styles.pageHeading}>
          <div>
            <span className={styles.kicker}>ATLAS · TRAMA</span>
            <h1>Che cosa vuoi scoprire oggi?</h1>
            <p>Parti da una curiosità. Il resto del viaggio si costruisce passo dopo passo.</p>
          </div>
          <span className={styles.publicNote}>Accesso libero <span aria-hidden="true">·</span> Nessun account</span>
        </header>

        <section className={styles.hero} aria-labelledby="atlas-ingresso-title">
          <div className={styles.heroContent}>
            <span className={styles.heroOverline}>
              <span className={styles.smallStar} aria-hidden="true">✧</span>
              Quattro porte, infinite domande
            </span>
            <h2 id="atlas-ingresso-title">
              Ogni scoperta<br />
              <em>comincia da una</em><br />
              domanda.
            </h2>
            <p>
              Esplora quello che ti incuriosisce, scegli un percorso oppure
              trova un argomento da approfondire. Senza dover sapere già da dove iniziare.
            </p>
            <div className={styles.heroActions}>
              <Link href="/esplora" className={styles.primaryLink} data-testid="atlas-ingresso-entra">
                Inizia a esplorare <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <Link href="/curricolo" className={styles.secondaryLink}>
                Consulta il curricolo <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Decorative architecture: native CSS, not a downloaded image or a 3D viewer. */}
          <div className={styles.architecture} aria-hidden="true">
            <div className={styles.atmosphere} />
            <div className={styles.oculusOuter}>
              <div className={styles.oculusInner} />
            </div>
            <div className={styles.galleryUpper} />
            <div className={styles.galleryMiddle} />
            <div className={styles.galleryLower} />
            <div className={styles.horizon} />
            <div className={styles.portalLights}>
              <span /><span /><span /><span />
            </div>
            <div className={styles.floor} />
            <span className={styles.sceneLabel}>UN MONDO DI CONNESSIONI</span>
          </div>
          <span className={styles.heroIndex} aria-hidden="true">ATLAS — 01 / 04</span>
        </section>

        <section className={styles.destinations} aria-labelledby="atlas-destinazioni">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>QUATTRO MODI PER COMINCIARE</span>
              <h2 id="atlas-destinazioni">Scegli la tua porta.</h2>
            </div>
            <p>Ogni porta conduce a una sezione vera; le attività ancora in preparazione sono dichiarate.</p>
          </div>
          <nav aria-label="Quattro accessi principali di Atlas" className={styles.cards}>
            {destinations.map(({ id, href, number, title, description, icon: Icon }) => (
              <Link
                className={styles.card}
                href={href}
                key={id}
                data-testid={`atlas-accesso-${id}`}
                data-destination={id}
              >
                <span className={styles.cardTop}>
                  <span className={styles.cardIcon}><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span>
                  <span className={styles.cardNumber}>{number}</span>
                </span>
                <strong>{title}</strong>
                <span className={styles.cardDescription}>{description}</span>
                <span className={styles.cardBottom}>Apri la sezione <ArrowUpRight size={17} aria-hidden="true" /></span>
              </Link>
            ))}
          </nav>
        </section>

        <footer className={styles.gatewayFooter}>
          <span>ATLAS <span aria-hidden="true">·</span> Esplora, collega, approfondisci.</span>
          <p>Per cercare una lezione o una risorsa, visita anche <Link href="/materiali">Materiali</Link> e <Link href="/risorse">Risorse</Link>.</p>
        </footer>
      </div>
    </AppShell>
  );
}
