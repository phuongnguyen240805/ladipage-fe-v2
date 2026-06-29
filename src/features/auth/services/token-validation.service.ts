import { extensionBridge } from "@/features/bridge/services/extension-bridge.service";
import { GRAPH_API_VERSION, TOKEN_VALIDATION_CACHE_TTL_MS } from "../constants";
import { FacebookTokenSet, TokenValidationResult } from "../types";
import { tokenManager } from "./token-manager";

interface CacheEntry {
  result: TokenValidationResult;
  cachedAt: number;
}

interface BridgeValidationResponse {
  isValid?: boolean;
  expiresAt?: number;
  userId?: string;
  scopes?: string[];
}

export class TokenValidationService {
  private cache = new Map<string, CacheEntry>();

  private getCacheKey(token: string, tokenType: keyof FacebookTokenSet): string {
    return `${tokenType}:${token.slice(0, 8)}:${token.length}`;
  }

  async validateViaBridge(token: string): Promise<TokenValidationResult | null> {
    if (typeof window === "undefined") return null;

    try {
      const result = await extensionBridge.invokeWithFallback<BridgeValidationResponse>(
        "facebook:validate-token",
        { token }
      );

      if (result?.isValid === undefined) return null;

      return {
        isValid: !!result.isValid,
        expiresAt: result.expiresAt,
        userId: result.userId,
        scopes: result.scopes,
        source: "bridge",
      };
    } catch {
      return null;
    }
  }

  async validateViaMeEndpoint(token: string): Promise<TokenValidationResult> {
    try {
      const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/me`);
      url.searchParams.set("fields", "id");
      url.searchParams.set("access_token", token);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.error) {
        return {
          isValid: false,
          source: "graph_api",
          error: { code: data.error.code, message: data.error.message },
        };
      }

      return {
        isValid: true,
        userId: data.id,
        source: "graph_api",
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      return {
        isValid: false,
        source: "graph_api",
        error: { code: -1, message },
      };
    }
  }

  async validate(
    token: string,
    tokenType: keyof FacebookTokenSet = "eaag"
  ): Promise<TokenValidationResult> {
    if (!token) {
      return {
        isValid: false,
        source: "format",
        error: { code: -1, message: "Empty token" },
      };
    }

    const cacheKey = this.getCacheKey(token, tokenType);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.cachedAt < TOKEN_VALIDATION_CACHE_TTL_MS) {
      return { ...cached.result, source: "cache" };
    }

    const bridgeResult = await this.validateViaBridge(token);
    if (bridgeResult !== null) {
      this.cache.set(cacheKey, { result: bridgeResult, cachedAt: Date.now() });
      return bridgeResult;
    }

    const graphResult = await this.validateViaMeEndpoint(token);
    if (graphResult.isValid) {
      this.cache.set(cacheKey, { result: graphResult, cachedAt: Date.now() });
      return graphResult;
    }

    if (process.env.NEXT_PUBLIC_AUTH_MOCK === "true" && tokenManager.isValidToken(token)) {
      const mockResult: TokenValidationResult = {
        isValid: true,
        source: "format",
        expiresAt: Date.now() + 3_600_000,
      };
      this.cache.set(cacheKey, { result: mockResult, cachedAt: Date.now() });
      return mockResult;
    }

    return graphResult;
  }

  clearCache(): void {
    this.cache.clear();
  }

  invalidateToken(token: string, tokenType: keyof FacebookTokenSet = "eaag"): void {
    this.cache.delete(this.getCacheKey(token, tokenType));
  }
}

export const tokenValidationService = new TokenValidationService();