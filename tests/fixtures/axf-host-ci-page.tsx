"use client";
import { AtlasPreviewHost, type AtlasPreviewPlacement } from "@/features/experiences/atlas-preview-host";
import minimal from "../../fixtures/studio-atlas-preview/valid/minimal.json";
import orientation from "../../fixtures/studio-atlas-preview/valid/edutwin-orientation.json";

const snapshots = [minimal, orientation, { ...minimal, pathwayId: "denied", title: "SYNTHETIC_DENIED", studentAuthorized: true }];
const placements: Record<string, AtlasPreviewPlacement> = {
  "studio-preview-fixture-studio-pathway-01": { world: "tecnologia", section: "Percorsi" },
  "studio-preview-fixture-edutwin-orientation": { world: "lettura", section: "Percorsi" },
  "studio-preview-denied": { world: "energia", section: "Storie" },
};
export default function AtlasHostFixture() { return <AtlasPreviewHost snapshots={snapshots} placements={placements} artwork={{ landscape: "https://invalid.example/denied.webp", portrait: "data:image/svg+xml,denied", worlds: { energia: "data:image/webp;base64,UklGRjAAAABXRUJQVlA4ICQAAABwAQCdASoCAAIAAUAmJZQCdAFAAAD++/8nWk0k3MYTSR2AAAA=" } }} />; }
