import { PathwayRuntimeSurface } from "@/features/pathways/pathway-runtime-surface";
import {
  studioAtlasSnapshotToExperience,
  type StudioAtlasPreviewSnapshot,
} from "@/features/pathways/studio-atlas-preview-adapter";
import snapshot from "../../../../../fixtures/studio-atlas-preview/valid/minimal.json";

export const metadata = {
  title: "Studio Atlas · Anteprima Percorso · Atlas",
  robots: { index: false, follow: false },
};

export default function StudioAtlasPreviewLabPage() {
  const typed = snapshot as StudioAtlasPreviewSnapshot;
  const definition = studioAtlasSnapshotToExperience(typed);

  return (
    <PathwayRuntimeSurface
      definition={definition}
      title={typed.title}
      description={typed.description}
      reviewNotice="ANTEPRIMA STUDIO ATLAS · NON AUTORIZZATA AGLI STUDENTI"
    />
  );
}
