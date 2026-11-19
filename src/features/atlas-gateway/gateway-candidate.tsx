"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PORTALS, readSceneMessage, resolvePortal } from "./gateway-policy";
import { nativeRequest, verifiedNativeBytes, type NativeManifest } from "./native-asset-policy";
import "./gateway.css";

export function GatewayCandidate({ preparedScene, nativeManifest = null }: { preparedScene: string | null; nativeManifest?: NativeManifest | null }) {
  const router = useRouter();
  const iframe = useRef<HTMLIFrameElement>(null);
  const nativeDeparting = useRef(false);
  const [scene, setScene] = useState<{ html: string; channel: string } | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [show3D, setShow3D] = useState(true);

  // NAV-STAB-01: separate the opaque WebGL frame lifetime from the
  // top-level document transition. Use one path for portals, direct links
  // and Home. The caller supplies only a canonical policy-owned destination.
  const navigateNative = useCallback((href: string) => {
    if (nativeDeparting.current) return;
    nativeDeparting.current = true;
    // Commit React-owned removal now, not concurrently with location.assign.
    // Effect cleanup aborts pending transfers and invalidates the channel.
    // Never force GPU disposal or a context-loss handshake on the click path.
    flushSync(() => {
      setShow3D(false);
      setScene(null);
      setReady(false);
      setNotice("Apertura dell’ambiente Atlas…");
    });
    if (iframe.current !== null) {
      nativeDeparting.current = false;
      setNotice("Usa gli accessi della sala per proseguire.");
      return;
    }
    console.info("ATLAS_NATIVE_FRAME_DETACHED");
    // A separate browser task after committed DOM removal; no fixed delay,
    // no GPU fence, no external URL, no RSC transition.
    window.setTimeout(() => {
      console.info("ATLAS_NATIVE_DOCUMENT_NAV_START");
      window.location.assign(href);
    }, 0);
  }, []);

  // If the browser restores a departed document from BFCache, recreate the
  // scene/channel rather than reuse a quiesced iframe or departure state.
  useEffect(() => {
    if (!nativeManifest) return;
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted && nativeDeparting.current) window.location.reload();
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, [nativeManifest]);

  useEffect(() => {
    if (!preparedScene || !show3D) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const constrained = window.matchMedia("(max-width: 319px), (max-height: 299px)");
    const enforceViewport = () => {
      if (reduced.matches || constrained.matches) {
        setShow3D(false);
        setNotice(reduced.matches
          ? "Vista semplificata attiva per rispettare la preferenza di movimento ridotto."
          : "Vista semplificata: lo spazio disponibile è insufficiente per usare la sala 3D in sicurezza.");
        return false;
      }
      return true;
    };
    if (!enforceViewport()) return;
    reduced.addEventListener("change", enforceViewport);
    constrained.addEventListener("change", enforceViewport);
    const channel = Array.from(window.crypto.getRandomValues(new Uint8Array(24)), x => x.toString(16).padStart(2, "0")).join("");
    const html = preparedScene
      .replace("__ATLAS_PARENT_ORIGIN_JSON__", JSON.stringify(window.location.origin))
      .replace("__ATLAS_CHANNEL_JSON__", JSON.stringify(channel));
    setReady(false);
    setScene({ html, channel });
    return () => {
      reduced.removeEventListener("change", enforceViewport);
      constrained.removeEventListener("change", enforceViewport);
      setScene(null);
    };
  }, [preparedScene, show3D]);

  useEffect(() => {
    if (!scene) return;
    const assetController = new AbortController();
    // Each verified asset is requested at most once per ephemeral scene.
    // A failure closes the whole scene; retrying a scene creates a new channel.
    const requested = new Set<string>();
    let nativeReady = false;
    const timer = window.setTimeout(() => {
      assetController.abort();
      setShow3D(false);
      setNotice("La scena 3D non risponde. Gli accessi restano disponibili.");
    }, nativeManifest ? 60000 : 20000);
    const receive = (event: MessageEvent) => {
      if (event.source !== iframe.current?.contentWindow || event.origin !== "null") return;
      if (nativeManifest) {
        const asset = nativeRequest(event.data, scene.channel, nativeManifest);
        if (asset) {
          if (requested.has(asset.id)) return;
          requested.add(asset.id);
          const target = iframe.current?.contentWindow;
          void verifiedNativeBytes(asset, assetController.signal).then(bytes => {
            if (assetController.signal.aborted || !target || target !== iframe.current?.contentWindow) return;
            // Opaque sandbox has no usable target origin. Source window and
            // channel were checked above; these are non-personal art assets.
            target.postMessage({type:"atlas-native-asset",channel:scene.channel,id:asset.id,bytes},"*",[bytes]);
          }).catch(() => {
            if (assetController.signal.aborted) return;
            window.clearTimeout(timer);
            assetController.abort();
            setShow3D(false);
            setNotice("Risorsa della sala 3D non disponibile o non integra. Usa gli accessi della sala.");
          });
          return;
        }
      }
      const message = readSceneMessage(event.data, scene.channel);
      if (!message) return;
      if (message.type === "atlas-3d-ready") {
        window.clearTimeout(timer);
        nativeReady = true;
        setReady(true);
      } else if (message.type === "atlas-3d-error") {
        window.clearTimeout(timer);
        assetController.abort();
        setShow3D(false);
        setNotice("Motore 3D non disponibile. Usa gli accessi della sala.");
      } else if ("id" in message) {
        const portal = resolvePortal(message.id);
        if (portal?.href) {
          if (nativeManifest) {
            if (!nativeReady || nativeDeparting.current) return;
            window.clearTimeout(timer);
            assetController.abort();
            console.info("ATLAS_NATIVE_NAV_ACCEPT " + portal.id);
            // Only a canonical policy path can reach this point.
            navigateNative(portal.href + "/");
          } else router.push(portal.href);
        } else if (portal?.id === "studio") setNotice("Studio Atlas: accesso professionale non ancora abilitato.");
      }
    };
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timer);
      assetController.abort();
      window.removeEventListener("message", receive);
    };
  }, [scene, router, nativeManifest, navigateNative]);

  const immersive = Boolean(preparedScene && show3D);
  const nativeImmersive = Boolean(nativeManifest && immersive);
  return (
    <main className={`atlas-gateway-shell${immersive ? " atlas-gateway-immersive" : ""}`}>
      <header className="atlas-gateway-header"><div className="atlas-gateway-heading"><span>ATLAS · Biblioteca della conoscenza</span><h1>Conoscere. Comprendere. Immaginare.</h1>
        <p>Tre ambienti, un unico accesso.</p></div><div className="atlas-gateway-header-actions">{nativeImmersive ? <Link href="/" prefetch={false} aria-label="Torna alla pagina iniziale attuale" onClick={event => {
        if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          navigateNative("/");
        }
      }}>← Home Atlas</Link> : <Link href="/" aria-label="Torna alla pagina iniziale attuale">← Home Atlas</Link>}
      {preparedScene && <button className="atlas-gateway-toggle" type="button" onClick={() => {
        setNotice("");
        setShow3D(value => !value);
      }}>{show3D ? "Vista semplificata" : "Attiva la sala 3D"}</button>}</div></header>
      <p className="atlas-gateway-notice" role="status" aria-live="polite">{notice || (!preparedScene
        ? "Vista semplificata: il pacchetto locale del motore 3D non è ancora disponibile."
        : show3D && !ready ? "Preparazione della sala 3D…" : "")}</p>
      {immersive && <div className="atlas-gateway-stage">{scene && <iframe ref={iframe} title="Biblioteca Atlas tridimensionale" className="atlas-gateway-frame"
        sandbox="allow-scripts" referrerPolicy="no-referrer" srcDoc={scene.html} />}</div>}
      <nav className="atlas-gateway-portals" aria-label="Accedi agli ambienti Atlas">
        {PORTALS.map(portal => immersive ? (
          portal.href ? (nativeImmersive ? <Link key={portal.id} className="atlas-gateway-direct" data-portal={portal.id} href={portal.href + "/"} prefetch={false} onClick={event => {
            if (event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
              event.preventDefault();
              navigateNative(portal.href + "/");
            }
          }}>{portal.label}<span aria-hidden="true">→</span></Link> : <Link key={portal.id} className="atlas-gateway-direct" data-portal={portal.id} href={portal.href}>{portal.label}<span aria-hidden="true">→</span></Link>) :
            <button key={portal.id} type="button" className="atlas-gateway-direct" data-portal={portal.id} onClick={() => setNotice("Studio Atlas: accesso professionale non ancora abilitato.")}>{portal.label}<span aria-hidden="true">ⓘ</span></button>
        ) : <div className="atlas-gateway-portal" key={portal.id}>
          <strong>{portal.label}</strong><span className="atlas-gateway-portal-description">{portal.description}</span>
          {portal.href ? <Link href={portal.href}>Entra →</Link> :
            <button type="button" onClick={() => setNotice("Studio Atlas: accesso professionale non ancora abilitato.")}>Informazioni sull’accesso</button>}
        </div>)}
      </nav>
    </main>
  );
}
