"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  ReactFlow,
  MarkerType,
  Position,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type NodeProps,
} from "@xyflow/react";
import { List, Map, Maximize2 } from "lucide-react";
import { instituteCurriculumFixture } from "@/features/curriculum/fixtures";
import { exploreGraph, type ExploreNode, type ExploreNodeKind } from "@/features/explore/graph";

const stages = ["Tutti", "Infanzia", "Primaria", "Secondaria di primo grado"] as const;

const kindLabel: Record<ExploreNodeKind, string> = {
  institution: "Istituto",
  discipline: "Disciplina",
  stage: "Ordine / annualità",
  objective: "Obiettivo",
  connection: "Raccordo",
};

type AtlasMapNodeData = {
  label: string;
  meta?: string;
  kind: ExploreNodeKind;
};

function AtlasMapNode({ data }: NodeProps) {
  const nodeData = data as AtlasMapNodeData;
  return (
    <div className={"atlas-map-node-inner atlas-map-node-" + nodeData.kind}>
      <Handle type="target" position={Position.Top} className="atlas-hidden-handle" />
      <span className="atlas-map-node-kind">{kindLabel[nodeData.kind]}</span>
      <strong>{nodeData.label}</strong>
      {nodeData.meta ? <small>{nodeData.meta}</small> : null}
      <Handle type="source" position={Position.Bottom} className="atlas-hidden-handle" />
    </div>
  );
}

const nodeTypes = { atlas: AtlasMapNode };

function buildLayout(nodes: ExploreNode[]): Node[] {
  const disciplines = nodes.filter(node => node.kind === "discipline");
  const stagesNodes = nodes.filter(node => node.kind === "stage");
  const objectives = nodes.filter(node => node.kind === "objective");
  const connections = nodes.filter(node => node.kind === "connection");

  const result: Node[] = [];
  const institute = nodes.find(node => node.id === "institute");
  if (institute) {
    result.push({
      id: institute.id,
      position: { x: 420, y: 20 },
      data: { label: institute.label, meta: institute.subtitle, kind: institute.kind },
      type: "atlas",
    });
  }

  disciplines.forEach((node, index) => {
    const x = 40 + index * 270;
    result.push({
      id: node.id,
      position: { x, y: 190 },
      data: { label: node.label, meta: node.subtitle, kind: node.kind },
      type: "atlas",
    });

    const relatedStages = stagesNodes.filter(item => item.disciplineId === node.disciplineId);
    relatedStages.forEach((stageNode, stageIndex) => {
      const sx = x + stageIndex * 175;
      result.push({
        id: stageNode.id,
        position: { x: sx, y: 360 },
        data: { label: stageNode.label, meta: stageNode.subtitle, kind: stageNode.kind },
        type: "atlas",
      });

      const relatedObjectives = objectives.filter(
        objective => objective.disciplineId === node.disciplineId && objective.stage === stageNode.stage
      );
      relatedObjectives.forEach((objective, objectiveIndex) => {
        result.push({
          id: objective.id,
          position: { x: sx + objectiveIndex * 210, y: 535 },
          data: { label: objective.label, meta: objective.subtitle, kind: objective.kind },
          type: "atlas",
        });
      });
    });
  });

  connections.forEach((node, index) => {
    result.push({
      id: node.id,
      position: { x: 80 + (index % 5) * 220, y: 740 + Math.floor(index / 5) * 135 },
      data: { label: node.label, meta: node.subtitle, kind: node.kind },
      type: "atlas",
    });
  });

  return result;
}

function buildEdges(ids: Set<string>): Edge[] {
  return exploreGraph.edges
    .filter(edge => ids.has(edge.source) && ids.has(edge.target))
    .map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 },
      className: "atlas-map-edge atlas-map-edge-" + edge.relation,
      animated: false,
    }));
}

export function RelationExplorer() {
  const [view, setView] = useState<"map" | "list">("map");
  const [depth, setDepth] = useState<"overview" | "detail">("overview");
  const [stage, setStage] = useState<(typeof stages)[number]>("Tutti");
  const [disciplineId, setDisciplineId] = useState("tutte");
  const [selectedId, setSelectedId] = useState("institute");

  const visibleGraph = useMemo(() => {
    const primary = exploreGraph.nodes.filter(node => {
      if (node.kind === "institution") return true;
      if (node.kind === "discipline") {
        return disciplineId === "tutte" || node.disciplineId === disciplineId;
      }
      if (node.kind === "stage") {
        if (depth !== "detail") return false;
        const disciplineMatches = disciplineId === "tutte" || node.disciplineId === disciplineId;
        const stageMatches = stage === "Tutti" || node.stage === stage;
        return disciplineMatches && stageMatches;
      }
      if (node.kind === "objective") {
        if (depth !== "detail") return false;
        const disciplineMatches = disciplineId === "tutte" || node.disciplineId === disciplineId;
        const stageMatches = stage === "Tutti" || node.stage === stage;
        return disciplineMatches && stageMatches;
      }
      return false;
    });

    const primaryIds = new Set(primary.map(node => node.id));
    const connectedRelationIds = depth === "detail" ? new Set(
      exploreGraph.edges
        .filter(edge => edge.relation === "connects" && primaryIds.has(edge.source))
        .map(edge => edge.target)
    ) : new Set<string>();
    const relationNodes = exploreGraph.nodes.filter(
      node => node.kind === "connection" && connectedRelationIds.has(node.id)
    );
    const nodes = [...primary, ...relationNodes];
    const ids = new Set(nodes.map(node => node.id));

    return { nodes, ids };
  }, [depth, disciplineId, stage]);

  const mapNodes = useMemo(() => buildLayout(visibleGraph.nodes), [visibleGraph.nodes]);
  const mapEdges = useMemo(() => buildEdges(visibleGraph.ids), [visibleGraph.ids]);
  const selected = visibleGraph.nodes.find(node => node.id === selectedId) ?? visibleGraph.nodes[0];

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedId(node.id);
  };

  return (
    <div className="atlas-explore">
      <section className="atlas-explore-toolbar" aria-label="Controlli Esplora">
        <div className="atlas-explore-filters">
          <label>
            <span>Livello</span>
            <select value={depth} onChange={event => setDepth(event.target.value as "overview" | "detail")}>
              <option value="overview">Panoramica</option>
              <option value="detail">Obiettivi e raccordi</option>
            </select>
          </label>
          <label>
            <span>Ordine di scuola</span>
            <select value={stage} onChange={event => {
              setStage(event.target.value as (typeof stages)[number]);
              if (event.target.value !== "Tutti") setDepth("detail");
            }}>
              {stages.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Disciplina</span>
            <select value={disciplineId} onChange={event => {
              setDisciplineId(event.target.value);
              if (event.target.value !== "tutte") setDepth("detail");
            }}>
              <option value="tutte">Tutte le discipline</option>
              {instituteCurriculumFixture.disciplines.map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="atlas-view-switch" aria-label="Modalità di visualizzazione">
          <button type="button" aria-pressed={view === "map"} onClick={() => setView("map")}>
            <Map size={16} aria-hidden="true" /> Mappa
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            <List size={16} aria-hidden="true" /> Elenco
          </button>
        </div>
      </section>

      <div className="atlas-explore-layout">
        <section className="atlas-explore-surface" aria-label="Mappa relazionale del curricolo">
          {view === "map" ? (
            <div className="atlas-relation-canvas">
              <ReactFlow
                nodes={mapNodes}
                edges={mapEdges}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={() => setSelectedId("institute")}
                fitView
                fitViewOptions={{ padding: 0.18 }}
                minZoom={0.35}
                maxZoom={1.7}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable
                proOptions={{ hideAttribution: true }}
                aria-label="Mappa relazionale interattiva del curricolo"
              >
                <Background gap={26} size={1} />
                <MiniMap pannable zoomable aria-label="Mini mappa" />
                <Controls showInteractive={false} />
              </ReactFlow>
            </div>
          ) : (
            <EquivalentOutline
              nodes={visibleGraph.nodes}
              selectedId={selected?.id}
              onSelect={setSelectedId}
            />
          )}
        </section>

        <aside className="atlas-explore-context" aria-label="Dettaglio nodo selezionato">
          {selected ? (
            <>
              <div className="atlas-context-kind">{kindLabel[selected.kind]}</div>
              <h2>{selected.label}</h2>
              {selected.subtitle ? <p>{selected.subtitle}</p> : null}
              <dl>
                <div><dt>Tipo</dt><dd>{kindLabel[selected.kind]}</dd></div>
                {selected.stage ? <div><dt>Ordine</dt><dd>{selected.stage}</dd></div> : null}
              </dl>
              {selected.objectiveId ? (
                <Link className="atlas-context-link" href={"/obiettivi/" + selected.objectiveId}>
                  Apri l’obiettivo <Maximize2 size={15} aria-hidden="true" />
                </Link>
              ) : null}
              <div className="atlas-context-note">
                Dati dimostrativi F2 derivati dalle fixture governate. Arena resta la fonte curricolare prevista.
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function EquivalentOutline({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: ExploreNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const groups: ExploreNodeKind[] = ["institution", "discipline", "stage", "objective", "connection"];

  return (
    <div className="atlas-equivalent-outline">
      {groups.map(kind => {
        const items = nodes.filter(node => node.kind === kind);
        if (!items.length) return null;

        return (
          <section key={kind}>
            <h2>{kindLabel[kind]}</h2>
            <div className="atlas-outline-list">
              {items.map(node => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelect(node.id)}
                  aria-current={selectedId === node.id ? "true" : undefined}
                >
                  <span>
                    <strong>{node.label}</strong>
                    {node.subtitle ? <small>{node.subtitle}</small> : null}
                  </span>
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
