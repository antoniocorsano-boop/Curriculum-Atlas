export type PortalId = "curricolo" | "esperienze" | "studio";
export const PORTALS = [
  { id: "curricolo", label: "Curricolo Atlas", description: "Comprendi discipline e collegamenti.", href: "/curricolo" },
  { id: "esperienze", label: "Esperienze Atlas", description: "Esplora storie, laboratori, scoperte e percorsi.", href: "/esperienze" },
  { id: "studio", label: "Studio Atlas", description: "Ambiente professionale di produzione e qualificazione.", href: null },
] as const;
export function resolvePortal(id: unknown) {
  return PORTALS.find(portal => portal.id === id) ?? null;
}
export function safePathwayHref(href: unknown): href is string {
  return typeof href === "string" && /^\/percorsi\/(?!lab\/?$)[a-z0-9][a-z0-9-]*\/?$/.test(href);
}
export function readSceneMessage(data: unknown, channel: string) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const message = data as Record<string, unknown>;
  if (message.channel !== channel) return null;
  if (message.type === "atlas-3d-ready" || message.type === "atlas-3d-error") return { type: message.type };
  if (message.type === "atlas-open") {
    const portal = resolvePortal(message.id);
    return portal ? { type: "atlas-open" as const, id: portal.id } : null;
  }
  return null;
}
