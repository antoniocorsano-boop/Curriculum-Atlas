"use client";

import { useEffect, useState } from "react";
import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import {
  studioAtlasSnapshotToExperience,
  type StudioAtlasPreviewSnapshot,
} from "@/features/pathways/studio-atlas-preview-adapter";

const READY_TYPE = "STUDIO_ATLAS_PREVIEW_READY";
const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";
const ACCEPTED_TYPE = "STUDIO_ATLAS_PREVIEW_ACCEPTED";

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

    function onMessage(event: MessageEvent) {
      if (event.origin !== studioOrigin) return;
      if (event.source !== opener) return;
      if (!isSnapshotMessage(event.data, channel!)) return;

      try {
        // Validation happens before any learner runtime is mounted.
        studioAtlasSnapshotToExperience(event.data.snapshot);
        setState({ status: "READY", snapshot: event.data.snapshot });
        opener!.postMessage(
          {
            type: ACCEPTED_TYPE,
            channel,
            snapshotId: event.data.snapshot.snapshotId,
          },
          studioOrigin!,
        );
      } catch {
        setState({
          status: "ERROR",
          message: "Lo snapshot ricevuto non soddisfa il contratto di anteprima.",
        });
      }
    }

    window.addEventListener("message", onMessage);

    opener.postMessage(
      {
        type: READY_TYPE,
        channel,
      },
      studioOrigin,
    );

    return () => window.removeEventListener("message", onMessage);
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
