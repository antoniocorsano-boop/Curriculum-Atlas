"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Play, RotateCcw, WifiOff } from "lucide-react";

type AtlasActivityProjectionStep = {
  stepId: string;
  kind: string;
  prompt: string;
};

type AtlasActivityPrototypeProjection = {
  projectionKind: "ATLAS_ACTIVITY_PROJECTION";
  canonicalDomainType: "Activity";
  canonicalModelStatus: "NON_CANONICAL_PROTOTYPE_PROJECTION";
  activityId: string;
  title: string;
  steps: AtlasActivityProjectionStep[];
};

const STORAGE_KEY = "atlas:perche:perche-p3-spiegazione:v1";

function atlasBasePath() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.startsWith("/Curriculum-Atlas/") ? "/Curriculum-Atlas" : "";
}

export function ActivityPrototype() {
  const [activity, setActivity] = useState<AtlasActivityPrototypeProjection | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [note, setNote] = useState("");
  const [started, setStarted] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      setActivity(parsed.activity ?? null);
      setStepIndex(parsed.stepIndex ?? 0);
      setNote(parsed.note ?? "");
      setStarted(Boolean(parsed.started));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const current = useMemo(() => activity?.steps?.[stepIndex] ?? null, [activity, stepIndex]);

  async function loadActivity() {
    const base = atlasBasePath();
    const response = await fetch(base + "/activity-packages/perche-p3.json");
    if (!response.ok) throw new Error("Activity projection unavailable");
    const data = await response.json() as AtlasActivityPrototypeProjection;
    if (
      data.projectionKind !== "ATLAS_ACTIVITY_PROJECTION" ||
      data.canonicalDomainType !== "Activity" ||
      data.canonicalModelStatus !== "NON_CANONICAL_PROTOTYPE_PROJECTION"
    ) {
      throw new Error("Invalid prototype activity projection");
    }
    setActivity(data);
    setStarted(true);
    setStepIndex(0);
    setNote("");
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activity: data, stepIndex: 0, note: "", started: true }));
  }

  function persist(nextIndex = stepIndex, nextNote = note) {
    if (!activity) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      activity,
      stepIndex: nextIndex,
      note: nextNote,
      started
    }));
  }

  async function saveOffline() {
    setOfflineStatus("saving");
    try {
      if (!activity) await loadActivity();
      if (!("serviceWorker" in navigator)) throw new Error("Service worker not supported");
      const base = atlasBasePath();
      const registration = await navigator.serviceWorker.register(base + "/sw-perche.js", { scope: base + "/" });
      await navigator.serviceWorker.ready;
      const worker = registration.active ?? registration.waiting ?? registration.installing;
      if (!worker) throw new Error("Service worker unavailable");

      const result = await new Promise<boolean>((resolve) => {
        const channel = new MessageChannel();
        const timer = window.setTimeout(() => resolve(false), 8000);
        channel.port1.onmessage = (event) => {
          window.clearTimeout(timer);
          resolve(event.data?.ok === true);
        };
        worker.postMessage({
          type: "CACHE_ACTIVITY",
          pageUrl: window.location.href,
          packageUrl: window.location.origin + base + "/activity-packages/perche-p3.json"
        }, [channel.port2]);
      });

      if (!result) throw new Error("Offline cache failed");
      setOfflineStatus("saved");
    } catch {
      setOfflineStatus("error");
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setActivity(null);
    setStepIndex(0);
    setNote("");
    setStarted(false);
    setOfflineStatus("idle");
  }

  if (!started || !activity) {
    return (
      <section className="atlas-why-launch atlas-panel">
        <span className="atlas-eyebrow">Prototipo · Primaria classe quinta</span>
        <h2>Quale spiegazione regge meglio?</h2>
        <p>Un breve laboratorio per confrontare due spiegazioni, cercare l&apos;evidenza che conta e capire quando è necessario cambiare idea.</p>
        <div className="atlas-why-actions">
          <button className="atlas-primary-button" onClick={() => void loadActivity()}>
            <Play size={18} aria-hidden="true" /> Avvia
          </button>
          <button className="atlas-secondary-button" onClick={() => void saveOffline()}>
            <Download size={18} aria-hidden="true" /> Salva sul dispositivo
          </button>
        </div>
        <p className="atlas-why-privacy">Nessun account, nessun dato personale, nessun invio automatico: lo stato resta su questo dispositivo.</p>
      </section>
    );
  }

  return (
    <section className="atlas-why-player" aria-live="polite">
      <p role="status" className="atlas-why-local-status">Le risposte restano salvate localmente su questo dispositivo.</p>
      <div className="atlas-why-progress" aria-label={"Passaggio " + (stepIndex + 1) + " di " + activity.steps.length}>
        {activity.steps.map((step, index) => (
          <span key={step.stepId} data-current={index === stepIndex} data-complete={index < stepIndex} />
        ))}
      </div>

      <article className="atlas-why-stage atlas-panel">
        <div>
          <span className="atlas-eyebrow">{current?.kind ?? "Attività"}</span>
          <h2>{current?.prompt}</h2>
        </div>

        {(current?.kind === "HYPOTHESIS" || current?.kind === "COMPARE" || current?.kind === "REFLECT" || current?.kind === "REOPEN") && (
          <label className="atlas-why-note">
            <span>La tua idea, sul dispositivo</span>
            <textarea
              value={note}
              onChange={(event) => {
                const value = event.target.value;
                setNote(value);
                persist(stepIndex, value);
              }}
              rows={5}
              placeholder="Scrivi con parole tue. Non viene inviato ad Atlas."
            />
          </label>
        )}

        <div className="atlas-why-nav">
          <button
            className="atlas-secondary-button"
            disabled={stepIndex === 0}
            onClick={() => {
              const next = Math.max(0, stepIndex - 1);
              setStepIndex(next);
              persist(next);
            }}
          >
            Indietro
          </button>
          {stepIndex < activity.steps.length - 1 ? (
            <button
              className="atlas-primary-button"
              onClick={() => {
                const next = stepIndex + 1;
                setStepIndex(next);
                persist(next);
              }}
            >
              Continua
            </button>
          ) : (
            <span className="atlas-why-done"><CheckCircle2 size={18} aria-hidden="true" /> Attività completata</span>
          )}
        </div>
      </article>

      <aside className="atlas-why-tools">
        <button className="atlas-secondary-button" onClick={() => void saveOffline()}>
          <WifiOff size={17} aria-hidden="true" />
          {offlineStatus === "saving" ? "Salvataggio…" : offlineStatus === "saved" ? "Disponibile offline" : offlineStatus === "error" ? "Riprova salvataggio" : "Salva sul dispositivo"}
        </button>
        <button className="atlas-text-button" onClick={reset}>
          <RotateCcw size={16} aria-hidden="true" /> Ricomincia
        </button>
      </aside>
    </section>
  );
}
