"use client";

import { useMemo } from "react";
import { Background, Controls, MarkerType, ReactFlow, Position, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ExperienceStageEvidence } from "./model";

type Props = {
  evidence: ExperienceStageEvidence[];
  connections: Array<{ from: string; to: string }>;
  origin: string | null;
  onSelect: (id: string) => void;
};

// React Flow is the visualization layer only. The parent session remains the
// sole authority for evidence, selection, relations and invalidation.
export function EvidenceRelationMap({ evidence, connections, origin, onSelect }: Props) {
  const nodes = useMemo<Node[]>(() => evidence.map((item, i) => ({
    id: item.id,
    data: { label: item.label },
    position: { x: (i % 2) * 196, y: Math.floor(i / 2) * 105 },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    draggable: false,
    connectable: false,
    selectable: false,
    style: { width: 172, minHeight: 54, whiteSpace: "normal", overflowWrap: "anywhere",
      border: origin === item.id ? "3px solid #a06418" : "1px solid #52746a",
      background: origin === item.id ? "#fff0cd" : "#ffffff" },
  })), [evidence, origin]);
  const edges = useMemo<Edge[]>(() => {
    const ids = new Set(evidence.map(item => item.id));
    return connections.filter(pair => ids.has(pair.from) && ids.has(pair.to)).map(pair => ({
      id: JSON.stringify([pair.from, pair.to]), source: pair.from, target: pair.to,
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "#286c59", strokeWidth: 2 },
      animated: false, selectable: false,
    }));
  }, [evidence, connections]);
  if (!nodes.length) return null;
  return <section className="mz-relation-map" data-testid="mz-relation-map"
    data-node-count={nodes.length} data-edge-count={edges.length} aria-label="Mappa visuale delle relazioni">
    <p>Seleziona due indizi sulla mappa, oppure usa i pulsanti Collega nell'elenco sottostante.</p>
    <div className="mz-relation-map__canvas">
      <ReactFlow key={JSON.stringify(evidence.map(item => item.id))} nodes={nodes} edges={edges}
        onNodeClick={(_, node) => onSelect(node.id)}
        nodesDraggable={false} nodesConnectable={false} nodesFocusable={false}
        edgesFocusable={false} elementsSelectable={false} deleteKeyCode={null}
        zoomOnScroll={false} preventScrolling={false} fitView fitViewOptions={{ padding: 0.18 }}>
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  </section>;
}
