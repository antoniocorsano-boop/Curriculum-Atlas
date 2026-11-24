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

export type DocumentedPathway = PublicPathwaySource & {
  // Existing Q9 receipt, not an authorization issued by this index.
  runtimeQualificationReceipt?: unknown;
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

const bindingKeys = ["runtimeExactHead", "pathwayId", "contentVersion", "publicationId"] as const;
const gateNames = ["Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8"] as const;
const reviewerClasses = ["AUTOMATED","HUMAN_ACCESSIBILITY","INDEPENDENT","FINAL_AUTHORITY"];
type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : null;
const dateTime = (value: unknown) => typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && !Number.isNaN(Date.parse(value));

function hasMatchingQualification(entry: DocumentedPathway): boolean {
  const receipt = record(entry.runtimeQualificationReceipt);
  const candidate = record(receipt?.candidate);
  const decision = record(receipt?.decision);
  const gates = record(receipt?.gates);
  const target = entry.runtimeQualificationTarget;
  if (!receipt || receipt.schemaVersion !== "percorsi-g2-runtime-qualification/v1" ||
      !candidate || !decision || !gates || !target ||
      candidate.publicationState !== "QUALIFIED" || candidate.qualificationContractVersion !== "v1" ||
      candidate.authorityRef !== entry.authorityRef ||
      candidate.pathwayId !== entry.pathwayId || candidate.contentVersion !== entry.version ||
      candidate.runtimeExactHead !== target.runtimeExactHead || candidate.publicationId !== target.publicationId ||
      decision.status !== "RUNTIME_AUTHORIZED" || !nonEmpty(decision.authorityRef) ||
      !dateTime(decision.decidedAt)) return false;
  return gateNames.every(name => {
    const gate = record(gates[name]);
    const binding = record(gate?.candidateBinding);
    const evidence = gate?.evidenceRefs;
    return Boolean(gate && binding && gate.status === "PASS" &&
      typeof gate.reviewerClass === "string" && reviewerClasses.includes(gate.reviewerClass) &&
      dateTime(gate.checkedAt) && Array.isArray(evidence) && evidence.length > 0 &&
      evidence.every(nonEmpty) && new Set(evidence).size === evidence.length &&
      bindingKeys.every(key => binding[key] === candidate[key]));
  });
}

const nonEmpty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const sha256 = (value: unknown) => typeof value === "string" && /^(sha256:)?[0-9a-f]{64}$/.test(value);
const sha = (value: unknown) => typeof value === "string" && /^[0-9a-f]{40}$/.test(value);

// A read-only projection: it grants no publication authority. The current governed
// portfolio remains the authority for pathways. Other product families must supply
// their own verified publication adapter before they can enter the public library.
export function loadDocumentedPublicPathways(entries: readonly DocumentedPathway[]): EducationalLibraryItem[] {
  return entries.flatMap(entry => {
    // Ambiguous identities are excluded, not silently resolved by ordering.
    if (!entry || entries.filter(other => other?.pathwayId === entry.pathwayId).length !== 1) return [];
    const published = loadPublicPathways([entry])[0];
    const profile = entry.educationalProfile;
    const target = entry.runtimeQualificationTarget;
    if (!published?.launchHref || entry.availability !== "ACTIVE" || entry.publicationState !== "PUBLISHED" ||
        !nonEmpty(entry.authorityRef) || !target || !hasMatchingQualification(entry) || !nonEmpty(target.publicationId) ||
        !sha(target.runtimeExactHead) || !sha256(target.surfaceArtifactDigest) ||
        target.contentVersion !== published.version || target.intendedPublicPath !== published.launchHref ||
        !profile || profile.publicDocumentApproved !== true || profile.authorityRef !== entry.authorityRef ||
        profile.publicationId !== target.publicationId || profile.experienceVersion !== published.version ||
        !nonEmpty(profile.documentVersion) || !sha256(profile.documentDigest) ||
        !libraryForms.includes(profile.form) || !nonEmpty(profile.discipline) ||
        !nonEmpty(profile.audience) || !nonEmpty(profile.summary) ||
        !Array.isArray(profile.sections) || profile.sections.length === 0 ||
        profile.sections.some(section => !section || !nonEmpty(section.title) || !nonEmpty(section.text)) ||
        new Set(profile.sections.map(section => section.title)).size !== profile.sections.length ||
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
