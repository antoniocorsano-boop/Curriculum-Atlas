import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Compass, Library, Waypoints } from "lucide-react";
import { AppShell } from "@/components/atlas/app-shell";
import styles from "./ingresso.module.css";

const destinations = [
  {
    id: "curricolo",
    href: "/curricolo",
    number: "01",
    title: "Curricolo",
    description: "Scopri la struttura del sapere, dalle discipline agli obiettivi.",
    icon: BookOpen,
  },
  {
    id: "esplora",
    href: "/esplora",
    number: "02",
    title: "Esplora",
    description: "Segui collegamenti, idee e relazioni tra le conoscenze.",
    icon: Compass,
  },
  {
    id: "percorsi",
    href: "/percorsi",
    number: "03",
    title: "Percorsi",
    description: "Scegli itinerari di apprendimento e nuove prospettive.",
    icon: Waypoints,
  },
  {
    id: "materiali",
    href: "/materiali",
    number: "04",
    title: "Materiali",
    description: "Ritrova risorse e lezioni effettivamente disponibili.",
    icon: Library,
  },
] as const;

export default function HomePage() {
  return (
    <AppShell>
      <div className={styles.gateway} data-testid="atlas-ingresso-web">
        <header className={styles.pageHeading}>
          <div>
            <span className={styles.kicker}>ATLAS · TRAMA</span>
            <h1>Il curricolo, connesso.</h1>
            <p>Un ingresso semplice verso le conoscenze, i percorsi e le risorse.</p>
          </div>
          <span className={styles.publicNote}>Accesso libero <span aria-hidden="true">·</span> Nessun account</span>
        </header>

        <section className={styles.hero} aria-labelledby="atlas-ingresso-title">
          <div className={styles.heroContent}>
            <span className={styles.heroOverline}>
              <span className={styles.smallStar} aria-hidden="true">✧</span>
              La conoscenza è un luogo da attraversare
            </span>
            <h2 id="atlas-ingresso-title">
              Entra.<br />
              <em>Lasciati guidare</em><br />
              dalla curiosità.
            </h2>
            <p>
              Ogni disciplina apre una porta. Ogni collegamento suggerisce
              una scoperta. Inizia da ciò che vuoi conoscere.
            </p>
            <div className={styles.heroActions}>
              <Link href="/esplora" className={styles.primaryLink} data-testid="atlas-ingresso-entra">
                Inizia a esplorare <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <Link href="/curricolo" className={styles.secondaryLink}>
                Guarda il curricolo <ArrowRight size={17} aria-hidden="true" />
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
            <p>Questi accessi conducono a sezioni effettivamente presenti in Atlas.</p>
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
          <p>Il curricolo è governato da Arena. Atlas rende navigabili le conoscenze e le risorse disponibili.</p>
        </footer>
      </div>
    </AppShell>
  );
}
