import type { LandingPageRenderer } from "../ports/landing-page-renderer.port";

export class PuckRenderer implements LandingPageRenderer {
  readonly engine = "puck" as const;

  canHandle(): boolean {
    return false;
  }

  async render(): Promise<never> {
    throw new Error("Puck renderer not enabled");
  }
}

export const puckRenderer = new PuckRenderer();