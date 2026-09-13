import type { BackendSessionSnapshot } from "@/lib/backend/session-types";

async function parseError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

async function readSnapshot(response: Response): Promise<BackendSessionSnapshot> {
  const body = (await response.json()) as BackendSessionSnapshot;
  return {
    authenticated: body.authenticated === true,
    expiresAt: typeof body.expiresAt === "number" ? body.expiresAt : null,
    tenant: body.tenant && typeof body.tenant === "object" ? body.tenant : {},
  };
}

const REFRESH_RACE_RECHECK_MS = 250;

export class BackendSessionService {
  async readSession(): Promise<BackendSessionSnapshot> {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) {
      return { authenticated: false, expiresAt: null, tenant: {} };
    }
    return readSnapshot(response);
  }

  async refreshSession(): Promise<BackendSessionSnapshot> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (response.ok) return readSnapshot(response);

    if (response.status === 401) {
      // Refresh tokens are single-use. Another tab may have won the rotation;
      // re-check the shared HttpOnly cookie before declaring the session dead.
      await new Promise((resolve) => setTimeout(resolve, REFRESH_RACE_RECHECK_MS));
      const concurrent = await this.readSession();
      if (concurrent.authenticated) return concurrent;
    }

    throw await parseError(response, "Session refresh failed");
  }

  async reissueSession(): Promise<BackendSessionSnapshot> {
    const response = await fetch("/api/auth/reissue", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) {
      throw await parseError(response, "Session reissue failed");
    }
    return readSnapshot(response);
  }

  async bridgeLegacyAccessToken(token: string): Promise<BackendSessionSnapshot> {
    const response = await fetch("/api/auth/bridge", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw await parseError(response, "Extension session bridge failed");
    }
    return readSnapshot(response);
  }

  async clearSession(): Promise<void> {
    const response = await fetch("/api/auth/session", {
      method: "DELETE",
      credentials: "same-origin",
      keepalive: true,
    });
    if (!response.ok) {
      throw await parseError(response, "Failed to clear backend auth session");
    }
  }
}

export const backendSessionService = new BackendSessionService();
