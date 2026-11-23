"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import styles from "./p3b-private-gateway.module.css";

const DESTINATIONS = [
  { id: "curricolo", label: "Curricolo", href: "/curricolo/", detail: "Discipline e conoscenze" },
  { id: "esplora", label: "Esplora", href: "/esplora/", detail: "Relazioni e scoperte" },
  { id: "percorsi", label: "Percorsi", href: "/percorsi/", detail: "Itinerari formativi" },
  { id: "esperienze", label: "Esperienze", href: "/esperienze/", detail: "Attività e mondi" },
] as const;

function freshChannel() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
}

/** P3B is guarded by an environment flag in the SERVER page. */
export function P3BPrivateGateway() {
  const frame = useRef<HTMLIFrameElement>(null);
  const departed = useRef(false);
  const [channel, setChannel] = useState("");
  const [showScene, setShowScene] = useState(true);
  const [notice, setNotice] = useState("Ambiente tridimensionale in preparazione.");

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 319px), (max-height: 299px)");
    if (reduceMotion.matches || narrow.matches) {
      setShowScene(false);
      setNotice("Vista semplificata: scegli direttamente una delle quattro destinazioni.");
    } else {
      setChannel(freshChannel());
    }
  }, []);

  useEffect(() => {
    if (!showScene || !channel) return;
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin
          || event.source !== frame.current?.contentWindow
          || !event.data || typeof event.data !== "object"
          || event.data.type !== "atlas-p3b-private-open"
          || event.data.channel !== channel
          || typeof event.data.id !== "string"
          || departed.current) return;
      const destination = DESTINATIONS.find(item => item.id === event.data.id);
      if (!destination) return;
      departed.current = true;
      flushSync(() => {
        setShowScene(false);
        setNotice("Apertura di " + destination.label + "…");
      });
      if (frame.current !== null) {
        departed.current = false;
        setNotice("Seleziona uno dei quattro collegamenti per proseguire.");
        return;
      }
      window.setTimeout(() => window.location.assign(destination.href), 0);
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [channel, showScene]);

  return (
    <main className={styles.root}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>ATLAS · Anteprima riservata</p>
          <h1>La sala della conoscenza</h1>
          <p>Quattro livelli, oculo circolare, quattro accessi alla biblioteca.</p>
        </div>
        <Link href="/" prefetch={false} className={styles.home}>← Atlas</Link>
      </header>
      <div className={styles.scene}>
        {showScene && channel ? (
          <iframe
            ref={frame}
            title="Atrio Atlas 3D autentico con quattro portali"
            src={"/atlas-p3b-preview/index.html?channel=" + channel}
            sandbox="allow-scripts allow-same-origin"
            allow="fullscreen"
          />
        ) : (
          <div className={styles.fallback} role="status">{notice}</div>
        )}
      </div>
      <nav className={styles.nav} aria-label="Quattro destinazioni effettive di Atlas">
        {DESTINATIONS.map(portal => (
          <Link key={portal.id} href={portal.href} data-p3b-link={portal.id} prefetch={false}>
            <strong>{portal.label}</strong>
            <span>{portal.detail}</span>
          </Link>
        ))}
      </nav>
      <p className={styles.disclosure}>
        Ambiente di collaudo privato. La vista tridimensionale è facoltativa; tutti gli accessi
        funzionano anche senza WebGL. Nessun contenuto è stato pubblicato agli studenti.
      </p>
    </main>
  );
}
