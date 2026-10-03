export type RuntimeAuthorization = "RUNTIME_AUTHORIZED" | "NOT_RUNTIME_AUTHORIZED";
export type PathwayAvailability = "ACTIVE" | "WITHDRAWN";

export type PublicPathwaySource = {
  pathwayId?: string;
  title?: string;
  version?: string;
  provenanceRef?: string;
  publicPath?: string;
  runtimeAuthorization?: RuntimeAuthorization;
  availability?: PathwayAvailability;
};

export type PublicPathwaySummary = {
  pathwayId: string;
  title: string;
  version: string;
  provenanceRef: string;
  availability: PathwayAvailability;
  launchHref: string | null;
};

function validPublicPath(value: unknown): value is string {
  return typeof value === "string"
    && value.startsWith("/percorsi/")
    && !value.includes("/lab/")
    && !value.includes("..")
    && !value.includes("?")
    && !value.includes("#");
}

export function loadPublicPathways(entries: readonly PublicPathwaySource[]): PublicPathwaySummary[] {
  return entries.flatMap((entry) => {
    if (entry.runtimeAuthorization !== "RUNTIME_AUTHORIZED") return [];
    if (!entry.pathwayId || !entry.title || !entry.version || !entry.provenanceRef) return [];

    const availability: PathwayAvailability = entry.availability === "WITHDRAWN" ? "WITHDRAWN" : "ACTIVE";
    if (availability === "ACTIVE" && !validPublicPath(entry.publicPath)) return [];

    return [{
      pathwayId: entry.pathwayId,
      title: entry.title,
      version: entry.version,
      provenanceRef: entry.provenanceRef,
      availability,
      launchHref: availability === "ACTIVE" && validPublicPath(entry.publicPath) ? entry.publicPath : null,
    }];
  });
}
