"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import styles from "./atlas-entry.module.css";

/**
 * ATLAS-GATEWAY-HYBRID-ENTRY-01
 * Four true destination links over the fullscreen image stage.
 * The photographic cuts are a preliminary 2.5D visual implementation,
 * not the final ART-DIR-02 approved image and not WebGL 3D meshes.
 */
const portals = [
  { id: "curricolo", label: "Curricolo", detail: "Struttura e obiettivi", href: "/curricolo/", image: "portal-curricolo.png" },
  { id: "esplora", label: "Esplora", detail: "Relazioni e connessioni", href: "/esplora/", image: "portal-esplora.png" },
  { id: "percorsi", label: "Percorsi", detail: "Itinerari formativi", href: "/percorsi/", image: "portal-percorsi.png" },
  { id: "esperienze", label: "Esperienze", detail: "Attività e mondi", href: "/esperienze/", image: "portal-esperienze.png" },
] as const;

function AEmblem({ central = false }: { central?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" className={central ? styles.largeA : styles.smallA}>
      <path d="M9 54 31 10h2l22 44M20 39h24" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="round" />
      <path d="m32 17 6 12-6 5-6-5z" fill="currentColor" opacity=".35" />
    </svg>
  );
}

function onPortalMove(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType !== "mouse") return;
  const rect = event.currentTarget.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, (2 * (event.clientX - rect.left)) / rect.width - 1));
  const y = Math.max(-1, Math.min(1, (2 * (event.clientY - rect.top)) / rect.height - 1));
  event.currentTarget.style.setProperty("--tilt-y", (x * 4).toFixed(2) + "deg");
  event.currentTarget.style.setProperty("--tilt-x", (-y * 3).toFixed(2) + "deg");
}
function resetPortal(event: PointerEvent<HTMLAnchorElement>) {
  event.currentTarget.style.removeProperty("--tilt-x");
  event.currentTarget.style.removeProperty("--tilt-y");
}

export function AtlasEntry() {
  return (
    <main id="atlas-entry-root" className={styles.entry}>
      <h1 className={styles.visuallyHidden}>ATLAS — Mondi della conoscenza</h1>
      <section className={styles.artboard} aria-label="Atrio della conoscenza e accesso alle quattro aree di Atlas">
        <img
          className={styles.plate}
          src="./atlas-gateway-entry/plate-prova.jpg"
          alt=""
          aria-hidden="true"
          width="1672"
          height="941"
          draggable={false}
        />
        <div className={styles.brandScreen} aria-hidden="true" />
        <div className={styles.podiumScreen} aria-hidden="true" />
        <div className={styles.podiumEmblem} aria-hidden="true"><AEmblem central /></div>
        <div className={styles.brand} aria-label="ATLAS, mondi della conoscenza">
          <AEmblem />
          <span className={styles.wordmark}>ATLAS</span>
          <span className={styles.brandDivider} aria-hidden="true" />
          <span className={styles.brandSubtitle}>Mondi della conoscenza</span>
        </div>
        <nav className={styles.portals} aria-label="Scegli una destinazione di Atlas">
          {portals.map((portal) => (
            <Link
              key={portal.id}
              href={portal.href}
              data-portal={portal.id}
              className={styles.portal}
              aria-label={portal.label + " — " + portal.detail}
              onPointerMove={onPortalMove}
              onPointerLeave={resetPortal}
              onPointerCancel={resetPortal}
            >
              <img
                src={"./atlas-gateway-entry/" + portal.image}
                alt=""
                aria-hidden="true"
                draggable={false}
                width="320"
                height="430"
              />
            </Link>
          ))}
        </nav>
        <Link href="/esplora/" className={styles.enter} aria-label="Entra in Atlas: esplora la conoscenza">
          <span>Entra in Atlas</span><span aria-hidden="true" className={styles.arrow}>→</span>
        </Link>
      </section>
    </main>
  );
}
