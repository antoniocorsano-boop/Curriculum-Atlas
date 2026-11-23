import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { P3BPrivateGateway } from "@/features/atlas-gateway/p3b-private-gateway";

export const metadata: Metadata = {
  title: "Atlas · Atrio P3B · Prova privata",
  robots: { index: false, follow: false },
};

/**
 * P3B is an isolated, opt-in product laboratory, not a student-facing route.
 * A staged WebGL folder must exist ONLY in a local preview build.
 * Never reveal the original private asset or trigger a public deployment.
 */
export default function P3BPreviewPage() {
  if (process.env.ATLAS_P3B_PRIVATE_PREVIEW !== "true"
      || process.env.ATLAS_GITHUB_PAGES === "true"
      || process.env.ATLAS_PREVIEW_ROOT_SCOPED === "true") notFound();
  return <P3BPrivateGateway />;
}
