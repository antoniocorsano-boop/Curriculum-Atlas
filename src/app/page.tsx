import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Library, Waypoints } from "lucide-react";
import { AppShell } from "@/components/atlas/app-shell";

const quick = [
  { href: "/esplora", label: "Esplora", detail: "Mappa relazionale del curricolo", icon: Compass },
  { href: "/curricolo", label: "Curricolo", detail: "Struttura, annualità e obiettivi", icon: BookOpen },
  { href: "/risorse", label: "Risorse", detail: "Contenuti e materiali Atlas", icon: Library },
  { href: "/percorsi", label: "Percorsi", detail: "Itinerari e connessioni didattiche", icon: Waypoints },
];

export default function HomePage() {
  return (
    <AppShell>
      <header className="atlas-page-heading">
        <div>
          <span className="atlas-eyebrow">Atlas · TRAMA</span>
          <h1>Il curricolo, connesso.</h1>
          <p>Esplora relazioni, progressioni e risorse senza perdere la provenienza curricolare.</p>
        </div>
      </header>

      <div className="atlas-home-grid">
        <section className="atlas-hero">
          <span className="atlas-eyebrow">Esplora. Comprendi. Costruisci.</span>
          <h2>Conoscenza che connette nuovi orizzonti.</h2>
          <p>
            Atlas rende visibili le relazioni tra annualità, nuclei, obiettivi, prerequisiti,
            raccordi e risorse. Arena resta la fonte curricolare; Atlas organizza l&apos;esplorazione.
          </p>

          <div className="atlas-feature-grid">
            <article className="atlas-feature">
              <Compass size={22} color="var(--domain-atlas)" aria-hidden="true" />
              <strong>Esplorazione semantica</strong>
              <span>Connessioni leggibili tra discipline, concetti e risorse.</span>
            </article>
            <article className="atlas-feature">
              <Waypoints size={22} color="var(--connection-gold)" aria-hidden="true" />
              <strong>Curricolo vivo</strong>
              <span>Progressioni, prerequisiti e raccordi in una struttura navigabile.</span>
            </article>
            <article className="atlas-feature">
              <Library size={22} color="var(--authority-arena)" aria-hidden="true" />
              <strong>Risorse autorevoli</strong>
              <span>Materiali Atlas collegati a riferimenti curricolari verificabili.</span>
            </article>
          </div>
        </section>

        <aside className="atlas-panel">
          <h3>Esplora Atlas</h3>
          <div className="atlas-quick-list">
            {quick.map(({ href, label, detail, icon: Icon }) => (
              <Link key={href} href={href} className="atlas-quick-link">
                <Icon size={20} aria-hidden="true" />
                <span>
                  <strong>{label}</strong><br />
                  <small>{detail}</small>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
