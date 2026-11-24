import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, Compass, FlaskConical, Sparkles } from "lucide-react";
import { AppShell } from "@/components/atlas/app-shell";
import styles from "./esperienze.module.css";
import { EducationalLibrary } from "@/features/experiences/educational-library-view";
import { loadDocumentedPublicPathways } from "@/features/experiences/educational-library";
import portfolio from "../../../governance/percorsi-portfolio.json";
import type { PublicPathwaySource } from "@/features/pathways/load-public-pathways";

export const metadata: Metadata = {
  title: "Esperienze · Atlas",
  description: "Uno spazio per storie, laboratori e scoperte da vivere, con contenuti accessibili soltanto dopo verifica e autorizzazione.",
};

const forms = [
  {
    title: "Storie",
    description: "Entra in una situazione, osserva e scopri che cosa cambia.",
    icon: BookOpen,
    className: styles.stories,
  },
  {
    title: "Laboratori",
    description: "Metti alla prova un'idea, sperimenta e costruisci qualcosa.",
    icon: FlaskConical,
    className: styles.laboratories,
  },
  {
    title: "Scoperte",
    description: "Segui un indizio e guarda le cose da una nuova prospettiva.",
    icon: Sparkles,
    className: styles.discoveries,
  },
] as const;

export default function ExperiencesPage() {
  const documented = loadDocumentedPublicPathways(portfolio.pathways as PublicPathwaySource[]);
  return (
    <AppShell>
      <div className={styles.page} data-testid="atlas-portale-esperienze">
        <div className={styles.breadcrumb}>
          <Link href="/" aria-label="Torna all'ingresso Atlas">
            <ArrowLeft size={16} aria-hidden="true" /> Tutte le porte
          </Link>
          <span> / Esperienze</span>
        </div>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Atlas · Esperienze</span>
            <h1>Qui le idee diventano <em>avventure.</em></h1>
            <p>
              Immagina di entrare in una storia, risolvere una situazione o fare
              una scoperta. Questo spazio accoglierà esperienze da vivere,
              non soltanto da leggere.
            </p>
          </div>
          <div className={styles.orbitScene} aria-hidden="true">
            <div className={styles.orbitOne} />
            <div className={styles.orbitTwo} />
            <div className={styles.orbitThree} />
            <div className={styles.glow} />
          </div>
        </header>

        <EducationalLibrary items={documented} />

        <section className={styles.forms} aria-labelledby="esperienze-forme">
          <div className={styles.sectionIntro}>
            <span className={styles.eyebrow}>Tre modi di vivere una scoperta</span>
            <h2 id="esperienze-forme">Che cosa troverai qui?</h2>
          </div>
          <div className={styles.formGrid}>
            {forms.map(({ title, description, icon: Icon, className }) => (
              <article className={`${styles.formCard} ${className}`} key={title}>
                <span className={styles.formIcon}><Icon aria-hidden="true" size={26} strokeWidth={1.55} /></span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className={styles.formStatus}>In preparazione</span>
              </article>
            ))}
          </div>
        </section>

        {documented.length === 0 && <section className={styles.emptyState} aria-labelledby="esperienze-disponibilita" data-testid="esperienze-non-disponibili">
          <div>
            <span className={styles.eyebrow}>Prima della partenza</span>
            <h2 id="esperienze-disponibilita">Le prime esperienze sono ancora in preparazione.</h2>
            <p>
              Nessuna esperienza è disponibile per iniziare adesso.
              Prima di aprirne una verifichiamo contenuti, accessibilità e qualità.
              Puoi comunque cominciare a esplorare ciò che Atlas rende già consultabile.
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/esplora" className={styles.primary} data-testid="esperienze-vai-esplora">
              Inizia da Esplora <Compass size={18} aria-hidden="true" />
            </Link>
            <Link href="/materiali" className={styles.secondary} data-testid="esperienze-vai-materiali">
              Cerca materiali <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>}
      </div>
    </AppShell>
  );
}
