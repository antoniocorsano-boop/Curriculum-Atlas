"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PORTALS, readSceneMessage, resolvePortal } from "./gateway-policy";
import "./gateway.css";

export function GatewayCandidate({ preparedScene }: { preparedScene: string | null }) {
  const router = useRouter();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [scene, setScene] = useState<{ html: string; channel: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [show3D, setShow3D] = useState(true);

  useEffect(() => {
    if (!preparedScene || !show3D) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShow3D(false);
      setNotice("Vista semplificata attiva per rispettare la preferenza di movimento ridotto.");
      return;
    }
    const channel = Array.from(window.crypto.getRandomValues(new Uint8Array(24)), x => x.toString(16).padStart(2, "0")).join("");
    const html = preparedScene
      .replace("__ATLAS_PARENT_ORIGIN_JSON__", JSON.stringify(window.location.origin))
      .replace("__ATLAS_CHANNEL_JSON__", JSON.stringify(channel));
    setReady(false);
    setScene({ html, channel });
    return () => setScene(null);
  }, [preparedScene, show3D]);

  useEffect(() => {
    if (!scene) return;
    const timer = window.setTimeout(() => {
      setShow3D(false);
      setNotice("La scena 3D non risponde. Gli accessi restano disponibili.");
    }, 10000);
    const receive = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || event.origin !== "null") return;
      const message = readSceneMessage(event.data, scene.channel);
      if (!message) return;
      if (message.type === "atlas-3d-ready") {
        window.clearTimeout(timer);
        setReady(true);
      } else if (message.type === "atlas-3d-error") {
        window.clearTimeout(timer);
        setShow3D(false);
        setNotice("Motore 3D non disponibile. Usa gli accessi della sala.");
      } else if ("id" in message) {
        const portal = resolvePortal(message.id);
        if (portal?.href) router.push(portal.href);
        else if (portal?.id === "studio") setNotice("Studio Atlas: accesso professionale non ancora abilitato.");
      }
    };
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("message", receive);
    };
  }, [scene, router]);

  return (
    <main className="atlas-gateway-shell">
      <header><span>ATLAS · Biblioteca della conoscenza</span><h1>Conoscere. Comprendere. Immaginare.</h1>
        <p>Tre ambienti, un unico accesso.</p><Link href="/">← Torna alla pagina iniziale attuale</Link></header>
      {preparedScene && <button className="atlas-gateway-toggle" type="button" onClick={() => {
        setNotice("");
        setShow3D(value => !value);
      }}>{show3D ? "Usa la vista semplificata" : "Attiva la sala 3D"}</button>}
      <p role="status" aria-live="polite">{notice || (!preparedScene
        ? "Vista semplificata: il pacchetto locale del motore 3D non è ancora disponibile."
        : show3D && !ready ? "Preparazione della sala 3D…" : "")}</p>
      {show3D && scene && <iframe ref={iframe} title="Biblioteca Atlas tridimensionale" className="atlas-gateway-frame"
        sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={scene.html} />}
      <nav className="atlas-gateway-portals" aria-label="Accedi agli ambienti Atlas">
        {PORTALS.map(portal => <div className="atlas-gateway-portal" key={portal.id}>
          <strong>{portal.label}</strong><span>{portal.description}</span>
          {portal.href ? <Link href={portal.href}>Entra →</Link> :
            <button type="button" onClick={() => setNotice("Studio Atlas: accesso professionale non ancora abilitato.")}>Informazioni sull’accesso</button>}
        </div>)}
      </nav>
    </main>
  );
}
