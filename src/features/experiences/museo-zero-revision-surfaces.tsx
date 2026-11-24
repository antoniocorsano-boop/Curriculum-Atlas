"use client";

import type { ExperienceStageEvidence, ExperienceTransition, ExperienceWorkbenchMode, ExperienceWorldState, ExperienceWorldSignalState } from "./model";
import "./museo-zero-revision-surfaces.css";
import {museoOutcome} from "./museo-zero-investigation";
import { EvidenceRelationMap } from "./evidence-relation-map";

type ReviewTransition = ExperienceTransition & { key: string };

const STATE_LABELS: Record<ExperienceWorldSignalState, string> = {
  OFF: "Spento", READY: "Da verificare", ACTIVE: "Attivo", DELAYED: "In ritardo",
  MISMATCH: "Non collegato", STABLE: "Stabile", MANUAL: "Manuale",
};

export function MuseoZeroRoomResponse({
  world, sceneId, changed,
}: { world?: ExperienceWorldState; sceneId: string; changed: boolean }) {
  if (!["MZ1_FAILED_REHEARSAL", "MZ4_TEST_MAPPING", "MZ6_FINAL_REHEARSAL", "MZ7_QUIET_CLOSE"].includes(sceneId)) return null;
  const outcome = museoOutcome(world);
  const result = outcome === "stable"
    ? "La parete si illumina mentre il visitatore attraversa il nuovo ingresso. Suono e luce seguono la stessa sequenza."
    : outcome === "manual"
      ? "La parete reagisce quando interviene un operatore, ma il sistema non è autonomo."
      : "Il visitatore attraversa la soglia. Il sensore lo rileva, ma la parete rimane spenta e la risposta arriva troppo tardi.";
  return (
    <section className="museo-response" data-testid="museo-risposta-sala" data-outcome={outcome} data-after-choice={changed ? "true" : "false"}
      aria-label="Simulazione visiva del comportamento della Sala Zero">
      <div className="museo-response__caption">
        <span>Dentro Sala Zero</span>
        <strong>{changed ? "La sala dopo la prova" : "La sala prima della prova"}</strong>
      </div>
      <figure className="mz-room-reference">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/media/museo-zero/narrative-v1/sala.webp" alt="Sala Zero, ambiente illustrato di riferimento" loading="lazy"/>
        <figcaption>Sala Zero · immagine di riferimento. Lo schema qui sotto mostra l’esito della prova simulata.</figcaption>
      </figure>
      <div className="museo-response__world" aria-hidden="true">
        <div className="museo-response__path"><span>Nuovo ingresso</span><span className="museo-response__visitor" /></div>
        <div className="museo-response__sensor"><span className="museo-response__sensor-light" /><span>Sensor B</span></div>
        <div className="museo-response__signal" />
        <div className="museo-response__projection"><span className="museo-response__projection-core" /></div>
        <div className="museo-response__rays"><i /><i /><i /></div>
      </div>
      <p className="museo-response__explanation" role="status" aria-live="polite">{result}</p>
      <p className="museo-response__hint">Simulazione visiva: non controlla sensori né impianti reali.</p>
    </section>
  );
}

export function MuseoZeroReviewWorkbench({
  mode, sceneId, evidence, connections, connectionOrigin, transitions, pendingKey,
  onReorder, onJoin, onChoose,
}: {
  mode: ExperienceWorkbenchMode;
  sceneId: string;
  evidence: ExperienceStageEvidence[];
  connections: Array<{ from: string; to: string }>;
  connectionOrigin: string | null;
  transitions: ReviewTransition[];
  pendingKey: string | null;
  onReorder: (id: string, direction: -1 | 1) => void;
  onJoin: (id: string) => void;
  onChoose: (choice: ReviewTransition) => void;
}) {
  const names = new Map(evidence.map(item => [item.id, item.label]));
  const visibleConnections = connections.filter(pair => names.has(pair.from) && names.has(pair.to));
  if (mode === "COMPARE" && sceneId === "MZ5_COMPARE_RECOVERY") {
    const constraints = [
      { key: "accessibility", label: "Nuovo ingresso accessibile" },
      { key: "reliability", label: "Affidabilità nel tempo" },
      { key: "workload", label: "Lavoro necessario" },
    ];
    return (
      <div className="museo-bench" data-testid="museo-confronto">
        <p className="museo-bench__intro">Ora la domanda cambia: non basta eliminare il ritardo. Quale soluzione rispetta anche gli altri vincoli? Confronta le conseguenze degli interventi e formula una raccomandazione.</p>
        <div className="museo-bench__table-wrap">
          <table className="museo-bench__table">
            <caption>Confronto delle soluzioni sulla base delle conseguenze simulate</caption>
            <thead><tr><th scope="col">Soluzione</th>{constraints.map(c => <th scope="col" key={c.key}>{c.label}</th>)}<th scope="col">Decisione</th></tr></thead>
            <tbody>{transitions.map(transition => (
              <tr key={transition.key} data-selected={pendingKey === transition.key ? "true" : "false"}>
                <th scope="row">{transition.label ?? transition.key}</th>
                {constraints.map(constraint => {
                  const signal = transition.worldAfter?.signals.find(item => item.id === constraint.key);
                  return <td key={constraint.key} data-state={signal?.state.toLowerCase()}>
                    <strong>{signal ? STATE_LABELS[signal.state] : "Non specificato"}</strong>
                    {signal?.detail && <span>{signal.detail}</span>}
                  </td>;
                })}
                <td><button type="button" aria-pressed={pendingKey === transition.key} onClick={() => onChoose(transition)}>
                  {pendingKey === transition.key ? "Scelta registrata" : "Prova questa soluzione"}
                </button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="museo-bench__note">Gli esiti derivano dalle conseguenze delle scelte già scritte in Studio Atlas; non sono voti né punteggi.</p>
      </div>
    );
  }

  return (
    <div className="museo-bench" data-testid={mode === "TIMELINE" ? "museo-cronologia" : mode === "CONNECTIONS" ? "museo-relazioni" : "museo-indizi"}>
      {mode === "TIMELINE" && <p className="museo-bench__intro">Disponi gli indizi in una sequenza: usa le frecce per cambiare l&apos;ordine. La cronologia chiarisce quando si sono verificati i cambiamenti, ma potrebbe non bastare a spiegarne la causa.</p>}
      {mode === "CONNECTIONS" && <p className="museo-bench__intro">Scegli un indizio e poi un secondo per costruire un collegamento. Il modello è tuo: sperimenta relazioni tra percorso, sensore e regia.</p>}
      {mode === "COMPARE" && <p className="museo-bench__intro">Confronta le prove raccolte. Alcuni cambiamenti possono essere reali senza aver provocato il ritardo.</p>}
      {mode === "CONNECTIONS" && <EvidenceRelationMap evidence={evidence} connections={visibleConnections} origin={connectionOrigin} onSelect={onJoin} />}
      <div className="museo-bench__evidence" role="list">
        {evidence.map((item, index) => (
          <div className="museo-bench__item" role="listitem" key={item.id}>
            <span className="museo-bench__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div className="museo-bench__item-text"><strong>{item.label}</strong><small>{item.detail}</small></div>
            {mode === "TIMELINE" && <div className="museo-bench__buttons">
              <button type="button" disabled={index === 0} onClick={() => onReorder(item.id, -1)} aria-label={"Sposta prima: " + item.label}>↑</button>
              <button type="button" disabled={index === evidence.length - 1} onClick={() => onReorder(item.id, 1)} aria-label={"Sposta dopo: " + item.label}>↓</button>
            </div>}
            {mode === "CONNECTIONS" && <button type="button" className="museo-bench__join"
              aria-pressed={connectionOrigin === item.id} onClick={() => onJoin(item.id)}>
              {connectionOrigin === item.id ? "Scegli un secondo indizio" : "Collega"}
            </button>}
          </div>
        ))}
      </div>
      {mode === "CONNECTIONS" && <div className="museo-bench__connections" aria-live="polite">
        <h3>Le relazioni che stai costruendo</h3>
        {visibleConnections.length ? visibleConnections.map((pair, i) =>
          <p key={pair.from + pair.to + i}>{names.get(pair.from)} <span aria-hidden="true">→</span> {names.get(pair.to)}</p>
        ) : <p>Non hai ancora collegato due indizi.</p>}
      </div>}
    </div>
  );
}
