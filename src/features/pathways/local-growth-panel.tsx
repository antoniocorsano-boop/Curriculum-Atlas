"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type LocalGrowthAchievement = {
  id: string;
  label: string;
  stage: "BEGINNING_TO_RECOGNISE" | "USES_WITH_SUPPORT" | "USES_INDEPENDENTLY" | "CHOOSES_WHEN_TO_USE" | "TRANSFERS_TO_NEW_SITUATION";
  triggerNodeId: string;
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
    if (parsed.schemaVersion !== "atlas.local-growth/v1" || !Array.isArray(parsed.earned)) return EMPTY;
    return parsed;
  } catch {
    return EMPTY;
  }
}

function writeRecord(record: LocalGrowthRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
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

  useEffect(() => {
    setRecord(readRecord());
    setReady(true);
  }, []);

  const save = useCallback((next: LocalGrowthRecord) => {
    setRecord(next);
    writeRecord(next);
  }, []);

  const enable = useCallback(() => {
    save({ ...record, enabled: true });
  }, [record, save]);

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecord(EMPTY);
  }, []);

  const noteNode = useCallback((nodeId: string) => {
    if (!ready || !record.enabled) return;
    const matching = achievements.filter((item) => item.triggerNodeId === nodeId);
    if (!matching.length) return;

    const existing = new Set(record.earned.map((item) => item.key));
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

    if (additions.length) save({ ...record, earned: [...record.earned, ...additions] });
  }, [achievements, pathwayId, pathwayVersion, ready, record, save]);

  const earnedHere = useMemo(
    () => record.earned.filter((item) => item.pathwayId === pathwayId && item.pathwayVersion === pathwayVersion),
    [record.earned, pathwayId, pathwayVersion],
  );

  const exportRecord = useCallback(() => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "atlas-i-miei-traguardi.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [record]);

  return { ready, enabled: record.enabled, earnedHere, totalEarned: record.earned.length, enable, reset, noteNode, exportRecord };
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
}: {
  enabled: boolean;
  earned: EarnedAchievement[];
  totalEarned: number;
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
            <p>I traguardi compariranno qui mentre eserciti e trasferisci la strategia.</p>
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
