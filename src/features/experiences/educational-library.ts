import { loadPublicPathways, type PublicPathwaySource } from "../pathways/load-public-pathways";

export const libraryForms = ["Storie", "Laboratori", "Scoperte", "Percorsi"] as const;
export type LibraryForm = typeof libraryForms[number];
export type EducationalSection = { title: string; text: string };
export type EducationalLibraryItem = {
  id: string;
  title: string;
  form: LibraryForm;
  discipline: string;
  audience: string;
  summary: string;
  version: string;
  documentVersion: string;
  sections: readonly EducationalSection[];
  href: string;
};

type LibraryProjection = {
  experienceVersion: string;
  documentVersion: string;
  documentDigest: string;
  publicationId: string;
  authorityRef: string;
  form: LibraryForm;
  discipline: string;
  audience: string;
  summary: string;
  sections: EducationalSection[];
  publicDocumentApproved: true;
};

type DocumentedPathway = PublicPathwaySource & {
  publicationState?: string;
  authorityRef?: string;
  runtimeQualificationTarget?: {
    publicationId?: string;
    contentVersion?: string;
    runtimeExactHead?: string | null;
    surfaceArtifactDigest?: string | null;
    intendedPublicPath?: string;
  };
  educationalProfile?: LibraryProjection;
};

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const sha256 = (value: unknown) => typeof value === "string" && /^(sha256:)?[0-9a-f]{64}$/.test(value);
const sha = (value: unknown) => typeof value === "string" && /^[0-9a-f]{40}$/.test(value);

// A read-only projection: it grants no publication authority. The current governed
// portfolio remains the authority for pathways. Other product families must supply
// their own verified publication adapter before they can enter the public library.
export function loadDocumentedPublicPathways(entries: readonly DocumentedPathway[]): EducationalLibraryItem[] {
  return entries.flatMap(entry => {
    const published = loadPublicPathways([entry])[0];
    const profile = entry.educationalProfile;
    const target = entry.runtimeQualificationTarget;
    if (!published?.launchHref || entry.availability !== "ACTIVE" || entry.publicationState !== "PUBLISHED" ||
        !nonEmpty(entry.authorityRef) || !target || !nonEmpty(target.publicationId) ||
        !sha(target.runtimeExactHead) || !sha256(target.surfaceArtifactDigest) ||
        target.contentVersion !== published.version || target.intendedPublicPath !== published.launchHref ||
        !profile || profile.publicDocumentApproved !== true || profile.authorityRef !== entry.authorityRef ||
        profile.publicationId !== target.publicationId || profile.experienceVersion !== published.version ||
        !nonEmpty(profile.documentVersion) || !sha256(profile.documentDigest) ||
        !libraryForms.includes(profile.form) || !nonEmpty(profile.discipline) ||
        !nonEmpty(profile.audience) || !nonEmpty(profile.summary) ||
        !Array.isArray(profile.sections) || profile.sections.length === 0 ||
        profile.sections.some(section => !section || !nonEmpty(section.title) || !nonEmpty(section.text)) ||
        !/^\/percorsi\/[a-z0-9][a-z0-9-]*\/?$/.test(published.launchHref) ||
        published.launchHref.replace(/\/$/, "") === "/percorsi/lab") return [];
    // Only explicit public fields cross the server/client boundary; never spread a source record.
    return [{
      id: published.pathwayId, title: published.title, form: profile.form,
      discipline: profile.discipline, audience: profile.audience, summary: profile.summary,
      version: published.version, documentVersion: profile.documentVersion,
      sections: profile.sections.map(({title, text}) => ({title, text})),
      href: published.launchHref,
    }];
  });
}
