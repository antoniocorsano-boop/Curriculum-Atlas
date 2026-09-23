import { ShieldCheck } from "lucide-react";

export function ProvenancePanel({ label, version }: { label: string; version: string }) {
  return (
    <aside className="atlas-provenance" aria-label="Provenienza curricolare">
      <div className="atlas-provenance-icon"><ShieldCheck size={18} aria-hidden="true" /></div>
      <div>
        <strong>Provenienza curricolare</strong>
        <p>{label}</p>
        <small>Versione: {version}</small>
      </div>
    </aside>
  );
}
