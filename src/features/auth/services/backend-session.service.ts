import type { LoginToken } from "@liora/api-types";

interface AccessTokenResponse {
  token: string | null;
}

async function parseError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = (await response.json()) as { message?: string };
    return new Error(body.message || fallback);
  } catch {
    return new Error(fallback);
  }
}

export class BackendSessionService {
  async persistTokenPair(pair: LoginToken): Promise<void> {
    if (!pair.token || !pair.refreshToken) {
      throw new Error("Backend did not return a complete auth token pair");
    }

    const response = await fetch("/api/auth/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pair),
    });

    if (!response.ok) {
      throw await parseError(response, "Failed to persist backend auth session");
    }
  }

  async readAccessToken(): Promise<string | null> {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) return null;
    const body = (await response.json()) as AccessTokenResponse;
    return typeof body.token === "string" && body.token ? body.token : null;
  }

  async refreshAccessToken(): Promise<string> {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
    });

    if (!response.ok) {
      throw await parseError(response, "Session refresh failed");
    }

    const body = (await response.json()) as AccessTokenResponse;
    if (!body.token) {
      throw new Error("Refresh response did not include an access token");
    }
    return body.token;
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
