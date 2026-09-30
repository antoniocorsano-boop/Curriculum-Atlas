import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "../../src/app/globals.css";
import "./isolation.css";
import { RelationExplorer } from "../../src/components/atlas/relation-explorer";
import { CurriculumTree } from "../../src/components/atlas/curriculum-tree";

type IsolationTarget = "relation-explorer" | "curriculum-tree";

function resolveTarget(): IsolationTarget {
  const target = new URLSearchParams(window.location.search).get("target");
  return target === "curriculum-tree" ? "curriculum-tree" : "relation-explorer";
}

function IsolationHost() {
  const target = resolveTarget();

  useEffect(() => {
    document.documentElement.dataset.atlasIsolationReady = "true";
    document.documentElement.dataset.atlasIsolationTarget = target;
    return () => {
      delete document.documentElement.dataset.atlasIsolationReady;
      delete document.documentElement.dataset.atlasIsolationTarget;
    };
  }, [target]);

  return (
    <main className="atlas-isolation-shell">
      <div className="atlas-isolation-meta" aria-label="Contesto laboratorio componente">
        <strong>Atlas · evidenza isolata</strong>
        <span>Target: {target}</span>
        <span>Fuori dal runtime pubblico</span>
      </div>
      <section
        className="atlas-isolation-component"
        data-atlas-component={target}
        aria-label={target === "relation-explorer" ? "Relation Explorer isolato" : "Curriculum Tree isolato"}
      >
        {target === "relation-explorer" ? <RelationExplorer /> : <CurriculumTree />}
      </section>
    </main>
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("ATLAS_ISOLATION_ROOT_MISSING");
createRoot(root).render(<IsolationHost />);
