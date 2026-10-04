import { StudioAtlasPreviewBridge } from "@/features/pathways/studio-atlas-preview-bridge";

export const metadata = {
  title: "Studio Atlas · Anteprima Percorso · Atlas",
  robots: { index: false, follow: false },
};

export default function StudioAtlasPreviewLabPage() {
  return <StudioAtlasPreviewBridge />;
}
