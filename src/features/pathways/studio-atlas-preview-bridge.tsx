"use client";

import { useEffect, useState } from "react";
import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import {
  studioAtlasSnapshotToExperience,
  type StudioAtlasPreviewSnapshot,
} from "@/features/pathways/studio-atlas-preview-adapter";

const READY_TYPE = "STUDIO_ATLAS_PREVIEW_READY";
const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";
const ACK_TYPE = "STUDIO_ATLAS_PREVIEW_ACK";
const READY_RETRY_MS = 300;
const READY_RETRY_LIMIT = 30;

type PreviewState =
  | { status: "WAITING" }
  | { status: "READY"; snapshot: StudioAtlasPreviewSnapshot }
  | { status: "ERROR"; message: string };

export function StudioAtlasPreviewBridge() {
  const [state, setState] = useState<PreviewState>({ status: "WAITING" });

  useEffect(() => {
    const channel = new URLSearchParams(window.location.search).get("channel");
    const opener = window.opener;
    const studioOrigin = configuredStudioOrigin();

    if (!channel) {
      setState({ status: "ERROR", message: "Riferimento anteprima mancante." });
      return;
    }
    if (!opener) {
      setState({
        status: "ERROR",
        message: "Apri questa anteprima direttamente da Studio Atlas.",
      });
      return;
    }
    if (!studioOrigin) {
      setState({
        status: "ERROR",
        message: "Origine Studio Atlas non configurata per questa build.",
      });
      return;
    }

    let accepted = false;
    let readyAttempts = 0;

    function sendReady() {
      if (accepted || readyAttempts >= READY_RETRY_LIMIT) return;
      readyAttempts += 1;
      opener.postMessage(
        {
          type: READY_TYPE,
          channel,
        },
        studioOrigin,
      );
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== studioOrigin) return;
      if (!isSnapshotMessage(event.data, channel!)) return;

      try {
        // Validation happens before any learner runtime is mounted.
        studioAtlasSnapshotToExperience(event.data.snapshot);
        accepted = true;
        window.clearInterval(readyInterval);
        setState({ status: "READY", snapshot: event.data.snapshot });

        opener.postMessage(
          {
            type: ACK_TYPE,
            channel,
            snapshotId: event.data.snapshot.snapshotId,
          },
          studioOrigin,
        );
      } catch {
        setState({
          status: "ERROR",
          message: "Lo snapshot ricevuto non soddisfa il contratto di anteprima.",
        });
      }
    }

    window.addEventListener("message", onMessage);

    // Cross-origin WindowProxy identity is not used as an authority signal.
    // The preview is already bound by: non-null opener, exact configured
    // Studio origin, a 192-bit random channel, and snapshot validation.
    // READY is intentionally retried for a bounded window. Cross-origin
    // navigation and hydration may reorder a single message even when both
    // applications are healthy.
    sendReady();
    const readyInterval = window.setInterval(sendReady, READY_RETRY_MS);

    return () => {
      window.clearInterval(readyInterval);
      window.removeEventListener("message", onMessage);
    };
  }, []);

  if (state.status === "ERROR") {
    return (
      <main className="pathwayPrototype">
        <header className="pathwayPrototype__header">
          <div>
            <p className="pathwayPrototype__eyebrow">Atlas · Anteprima Studio</p>
            <h1>Anteprima non disponibile</h1>
            <p>{state.message}</p>
          </div>
          <div className="pathwayPrototype__status">
            <strong>NON AUTORIZZATA AGLI STUDENTI</strong>
            <span>Nessun contenuto è stato pubblicato.</span>
          </div>
        </header>
      </main>
    );
  }

  if (state.status === "WAITING") {
    return (
      <main className="pathwayPrototype">
        <header className="pathwayPrototype__header">
          <div>
            <p className="pathwayPrototype__eyebrow">Atlas · Anteprima Studio</p>
            <h1>Preparazione anteprima…</h1>
            <p>Attendo lo snapshot esatto da Studio Atlas.</p>
          </div>
          <div className="pathwayPrototype__status">
            <strong>ANTEPRIMA PRIVATA</strong>
            <span>Nessun account, telemetria o pubblicazione studente.</span>
          </div>
        </header>
      </main>
    );
  }

  const definition = studioAtlasSnapshotToExperience(state.snapshot);

  return (
    <PathwayRuntimeSurface
      definition={definition}
      title={state.snapshot.title}
      description={state.snapshot.description}
      reviewNotice="ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI"
    />
  );
}

function configuredStudioOrigin() {
  const raw = process.env.NEXT_PUBLIC_STUDIO_ATLAS_ORIGIN?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function isSnapshotMessage(
  value: unknown,
  channel: string,
): value is {
  type: typeof SNAPSHOT_TYPE;
  channel: string;
  snapshot: StudioAtlasPreviewSnapshot;
} {
  if (!value || typeof value !== "object") return false;
  const message = value as {
    type?: unknown;
    channel?: unknown;
    snapshot?: unknown;
  };
  return (
    message.type === SNAPSHOT_TYPE &&
    message.channel === channel &&
    Boolean(message.snapshot)
  );
}
