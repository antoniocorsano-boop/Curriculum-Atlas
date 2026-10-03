import { PathwayCatalog } from "@/features/pathways/pathway-catalog";
import { loadPublicPathways, type PublicPathwaySource } from "@/features/pathways/load-public-pathways";

const fixture: PublicPathwaySource[] = [
  {
    pathwayId: "demo-authorized",
    title: "Percorso autorizzato",
    version: "1.2.0",
    provenanceRef: "TRAMA-TEST-AUTH",
    publicPath: "/percorsi/demo-authorized",
    runtimeAuthorization: "RUNTIME_AUTHORIZED",
    availability: "ACTIVE",
  },
  {
    pathwayId: "demo-withdrawn",
    title: "Percorso ritirato",
    version: "1.1.0",
    provenanceRef: "TRAMA-TEST-WITHDRAWN",
    publicPath: "/percorsi/demo-withdrawn",
    runtimeAuthorization: "RUNTIME_AUTHORIZED",
    availability: "WITHDRAWN",
  },
  {
    pathwayId: "demo-missing-provenance",
    title: "Senza provenienza",
    version: "1.0.0",
    publicPath: "/percorsi/demo-missing-provenance",
    runtimeAuthorization: "RUNTIME_AUTHORIZED",
    availability: "ACTIVE",
  },
];

export default function PublicPathwayCatalogConformancePage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem" }}>
      <h1>Catalog conformance</h1>
      <PathwayCatalog pathways={loadPublicPathways(fixture)} />
    </main>
  );
}
