/**
 * Landing editor engine flag.
 * - legacy: VisualEditor (current default)
 * - instatic: Instatic studio via /_cms proxy + Nest landing-cms session
 */
export type LandingEditorMode = "legacy" | "instatic";

export function getLandingEditorMode(): LandingEditorMode {
  const raw = (process.env.NEXT_PUBLIC_LANDING_EDITOR ?? "legacy").toLowerCase().trim();
  return raw === "instatic" ? "instatic" : "legacy";
}

export function isInstaticEditorEnabled(): boolean {
  return getLandingEditorMode() === "instatic";
}

export function isInstaticPublishSourceEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_LANDING_PUBLISH_SOURCE ?? process.env.LANDING_PUBLISH_SOURCE ?? "legacy")
    .toLowerCase()
    .trim();
  return raw === "instatic-artifact" || raw === "instatic";
}
