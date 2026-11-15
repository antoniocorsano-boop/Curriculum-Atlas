"use client";
import { AtlasPreviewHost, type AtlasPreviewPlacement, type AtlasStandalonePreview } from "@/features/experiences/atlas-preview-host";
import minimal from "../../fixtures/studio-atlas-preview/valid/minimal.json";
import orientation from "../../fixtures/studio-atlas-preview/valid/edutwin-orientation.json";

const snapshots = [minimal, orientation, { ...minimal, pathwayId: "denied", title: "SYNTHETIC_DENIED", studentAuthorized: true }];
const placements: Record<string, AtlasPreviewPlacement> = {
  "studio-preview-fixture-studio-pathway-01": { world: "tecnologia", section: "Percorsi" },
  "studio-preview-fixture-edutwin-orientation": { world: "lettura", section: "Percorsi" },
  "studio-preview-denied": { world: "energia", section: "Storie" },
};
const discovery: AtlasStandalonePreview = {id:"standalone-preview-synthetic-discovery",title:"Scoperta sintetica",description:"Fixture tecnica per la ricerca e il ritorno",version:"0.0.1-test",sha256:"a".repeat(64),world:"energia",section:"Scoperte",availability:"ACTIVE",studentAuthorized:false,runtimeAuthorized:false,render:()=> <article><h1>Vista autonoma sintetica</h1><p>Solo prova del raccordo.</p></article>};
const standalone: AtlasStandalonePreview[] = [discovery,
  {...discovery,id:"standalone-preview-denied",title:"DENIED_DISCOVERY",studentAuthorized:true} as unknown as AtlasStandalonePreview,
  {...discovery,id:"standalone-preview-withdrawn",title:"WITHDRAWN_DISCOVERY",availability:"WITHDRAWN"} as unknown as AtlasStandalonePreview,
  {...discovery,id:"standalone-preview-bad-hash",title:"BAD_HASH_DISCOVERY",sha256:"not-a-digest"},
  {...discovery,id:"standalone-preview-duplicate",title:"DUPLICATE_DISCOVERY"},
  {...discovery,id:"standalone-preview-duplicate",title:"DUPLICATE_DISCOVERY_2"}
];
export default function AtlasHostFixture() { return <AtlasPreviewHost snapshots={snapshots} placements={placements} standalone={standalone} artwork={{ landscape: "https://invalid.example/denied.webp", portrait: "data:image/svg+xml,denied", worlds: { energia: "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAABwAQCdASoCAAIAAUAmJZQCdAFAAAD++/8nWk0k3MYTSR2AAAA=" } }} />; }
