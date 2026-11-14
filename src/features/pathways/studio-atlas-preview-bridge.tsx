"use client";

import { useEffect, useState } from "react";
import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import {
  studioAtlasSnapshotToExperience,
  type StudioAtlasPreviewSnapshot,
} from "@/features/pathways/studio-atlas-preview-adapter";

import {verifyPreviewIllustrations,verifyDecodedIllustrations,type VerifiedSceneIllustration} from "./edutwin-preview-media";

const SNAPSHOT_TYPE = "STUDIO_ATLAS_PREVIEW_SNAPSHOT";
const ACK_TYPE = "STUDIO_ATLAS_PREVIEW_ACK";

type PreviewState =
  | { status: "WAITING" }
  | { status: "READY"; snapshot: StudioAtlasPreviewSnapshot; illustrations: ReadonlyMap<string,VerifiedSceneIllustration> }
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

    let active = true;
    let checking = false;
    let accepted: {snapshotId:string;packageDigest:string;mediaDigest?:string;serialized:string}|undefined;
    let rejected = false;
    async function onMessage(event: MessageEvent) {
      if (event.origin !== studioOrigin) return;
      if (!isSnapshotMessage(event.data, channel!)) return;

      const snapshot=event.data.snapshot;
      const mediaDigest=snapshot.edutwinMedia?.mediaDigest;
      if(!active||rejected||checking)return;
      function acknowledge(){
        opener.postMessage({type:ACK_TYPE,channel,snapshotId:snapshot.snapshotId},studioOrigin!);
      }
      if(accepted){
        // A retry of the exact accepted candidate receives another ACK, without remounting.
        if(accepted.snapshotId===snapshot.snapshotId&&accepted.packageDigest===snapshot.packageDigest&&accepted.mediaDigest===mediaDigest){
          try{
            // Compare the entire received snapshot including actual original bytes.
            // A sender-provided digest string alone cannot establish retry equality.
            if(JSON.stringify(snapshot)===accepted.serialized)acknowledge();
          }catch{/* Malformed retry: no ACK and no replacement of accepted preview. */}
        }
        return;
      }
      checking=true;
      try {
        // Validate the scene graph and actual bounded media bytes before mounting or ACK.
        studioAtlasSnapshotToExperience(snapshot);
        const illustrations=await verifyPreviewIllustrations(snapshot);
        await verifyDecodedIllustrations(illustrations);
        if(!active)return;
        accepted={snapshotId:snapshot.snapshotId,packageDigest:snapshot.packageDigest,mediaDigest,serialized:JSON.stringify(snapshot)};
        setState({status:"READY",snapshot,illustrations});
        acknowledge();
      } catch {
        if(!active)return;
        rejected=true;
        setState({
          status: "ERROR",
          message: "Lo snapshot ricevuto non soddisfa il contratto di anteprima.",
        });
      } finally { checking=false; }
    }

    window.addEventListener("message", onMessage);

    // Cross-origin WindowProxy identity is not used as an authority signal.
    // The preview is bound by: non-null opener, exact configured Studio
    // origin, a 192-bit random channel, and snapshot validation.
    //
    // Atlas does not send a separate READY message. Studio Atlas retries the
    // exact immutable snapshot for a bounded window until this bridge validates
    // it and returns ACK. This removes a redundant handshake leg and avoids
    // navigation/hydration races.
    return () => {
      active=false;
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
      verifiedIllustrations={state.illustrations}
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
