"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type LocalGrowthAchievement = {
  id: string;
  label: string;
  stage: "BEGINNING_TO_RECOGNISE" | "USES_WITH_SUPPORT" | "USES_INDEPENDENTLY" | "CHOOSES_WHEN_TO_USE" | "TRANSFERS_TO_NEW_SITUATION";
  triggerNodeId: string;
  triggerTransitionId: string;
};

type EarnedAchievement = {
  key: string;
  pathwayId: string;
  pathwayVersion: string;
  achievementId: string;
  label: string;
  stage: LocalGrowthAchievement["stage"];
};

type LocalGrowthRecord = {
  schemaVersion: "atlas.local-growth/v1";
  enabled: boolean;
  earned: EarnedAchievement[];
};

const STORAGE_KEY = "atlas:percorsi:local-growth:v1";
const EMPTY: LocalGrowthRecord = { schemaVersion: "atlas.local-growth/v1", enabled: false, earned: [] };

function readRecord(): LocalGrowthRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as LocalGrowthRecord;
    if (
      parsed.schemaVersion !== "atlas.local-growth/v1" ||
      typeof parsed.enabled !== "boolean" ||
      !Array.isArray(parsed.earned)
    ) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function writeRecord(record: LocalGrowthRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function useLocalPathwayGrowth({
  pathwayId,
  pathwayVersion,
  achievements,
}: {
  pathwayId: string;
  pathwayVersion: string;
  achievements: LocalGrowthAchievement[];
}) {
  const [record, setRecord] = useState<LocalGrowthRecord>(EMPTY);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setRecord(readRecord());
    setReady(true);

    function syncFromOtherTab(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const latest = readRecord();
      setRecord(latest);
      setNotice(
        event.newValue === null
          ? "I progressi locali sono stati cancellati in un’altra scheda."
          : "I traguardi locali sono stati aggiornati da un’altra scheda.",
      );
    }

    window.addEventListener("storage", syncFromOtherTab);
    return () => window.removeEventListener("storage", syncFromOtherTab);
  }, []);

  const enable = useCallback(() => {
    const latest = readRecord();
    const next: LocalGrowthRecord = { ...latest, enabled: true };
    if (!writeRecord(next)) {
      setNotice("Non è stato possibile attivare la crescita locale su questo dispositivo. Puoi continuare senza conservarla.");
      return;
    }
    setRecord(next);
    setNotice("Crescita locale attivata. I traguardi resteranno soltanto su questo dispositivo.");
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecord(EMPTY);
      setNotice("I progressi locali sono stati cancellati da questo dispositivo.");
    } catch {
      setNotice("Non è stato possibile cancellare i progressi locali. Riprova dal dispositivo.");
    }
  }, []);

  const noteOutcome = useCallback((nodeId: string, transitionId: string) => {
    if (!ready) return;

    const matching = achievements.filter(
      (item) => item.triggerNodeId === nodeId && item.triggerTransitionId === transitionId,
    );
    if (!matching.length) return;

    // Re-read before every cross-tab write. An absent/disabled record after reset
    // is authoritative and a stale tab must not recreate it.
    const latest = readRecord();
    if (!latest.enabled) {
      setRecord(latest);
      return;
    }

    const existing = new Set(latest.earned.map((item) => item.key));
    const additions = matching
      .map((item): EarnedAchievement => ({
        key: `${pathwayId}@${pathwayVersion}:${item.id}`,
        pathwayId,
        pathwayVersion,
        achievementId: item.id,
        label: item.label,
        stage: item.stage,
      }))
      .filter((item) => !existing.has(item.key));

    if (!additions.length) {
      setRecord(latest);
      return;
    }

    const next: LocalGrowthRecord = {
      ...latest,
      earned: [...latest.earned, ...additions],
    };
    if (!writeRecord(next)) {
      setNotice("Non è stato possibile salvare il nuovo traguardo. Puoi continuare il percorso senza conservarlo.");
      return;
    }

    setRecord(next);
    setNotice(
      additions.length === 1
        ? "Nuovo traguardo conservato sul dispositivo."
        : "Nuovi traguardi conservati sul dispositivo.",
    );
  }, [achievements, pathwayId, pathwayVersion, ready]);

  const earnedHere = useMemo(
    () => record.earned.filter((item) => item.pathwayId === pathwayId && item.pathwayVersion === pathwayVersion),
    [record.earned, pathwayId, pathwayVersion],
  );

  const exportRecord = useCallback(() => {
    const latest = readRecord();
    setRecord(latest);
    const blob = new Blob([JSON.stringify(latest, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-i-miei-traguardi.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    ready,
    enabled: record.enabled,
    earnedHere,
    totalEarned: record.earned.length,
    notice,
    enable,
    reset,
    noteOutcome,
    exportRecord,
  };
}

const stageLabel: Record<LocalGrowthAchievement["stage"], string> = {
  BEGINNING_TO_RECOGNISE: "Inizia a riconoscere",
  USES_WITH_SUPPORT: "Usa con supporto",
  USES_INDEPENDENTLY: "Usa in autonomia",
  CHOOSES_WHEN_TO_USE: "Sceglie quando usarla",
  TRANSFERS_TO_NEW_SITUATION: "Trasferisce in una nuova situazione",
};

export function LocalGrowthPanel({
  enabled,
  earned,
  totalEarned,
  onEnable,
  onReset,
  onExport,
  notice,
}: {
  enabled: boolean;
  earned: EarnedAchievement[];
  totalEarned: number;
  notice: string;
  onEnable: () => void;
  onReset: () => void;
  onExport: () => void;
}) {
  return (
    <aside className="pathwayGrowth" aria-labelledby="pathway-growth-title">
      <div>
        <p className="pathwayPrototype__eyebrow">Crescita personale · solo locale</p>
        <h2 id="pathway-growth-title">I miei traguardi</h2>
        <p>
          Nessun account e nessuna classifica. Puoi conservare su questo dispositivo soltanto i traguardi didattici che raggiungi.
        </p>
      </div>

      <p role="status" aria-live="polite" aria-atomic="true" className="pathwayGrowth__status">
        {notice || "La crescita locale è facoltativa e resta sotto il tuo controllo."}
      </p>

      {!enabled ? (
        <button type="button" className="pathwayButton" onClick={onEnable}>Conserva i miei traguardi su questo dispositivo</button>
      ) : (
        <>
          <p><strong>{earned.length}</strong> traguardi in questo percorso · <strong>{totalEarned}</strong> complessivi sul dispositivo.</p>
          {earned.length ? (
            <ul className="pathwayGrowth__list">
              {earned.map((item) => (
                <li key={item.key}>
                  <strong>{item.label}</strong>
                  <span>{stageLabel[item.stage]}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>I traguardi compariranno qui dopo una scelta che dimostra la strategia, non per il solo avanzamento nel percorso.</p>
          )}
          <div className="pathwayGrowth__actions">
            <button type="button" className="pathwayButton pathwayButton--secondary" onClick={onExport}>Esporta</button>
            <button type="button" className="pathwayButton pathwayButton--secondary" onClick={onReset}>Cancella i progressi locali</button>
          </div>
        </>
      )}
    </aside>
  );
}
