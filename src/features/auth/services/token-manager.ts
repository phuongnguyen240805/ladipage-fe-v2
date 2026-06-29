import { FacebookTokenSet } from "../types";

export class TokenManager {
  /**
   * Validate if a string looks like a valid Facebook Access Token
   */
  isValidToken(token: string): boolean {
    return typeof token === "string" && token.startsWith("EAA") && token.length > 50;
  }

  /**
   * Parse token type from prefix (EAAG, EAAB, etc.)
   */
  getTokenType(token: string): keyof FacebookTokenSet | null {
    if (!this.isValidToken(token)) return null;
    const prefix = token.slice(0, 4).toLowerCase();
    if (prefix === "eaag" || prefix === "eaab" || prefix === "eaai" || prefix === "eaah") {
      return prefix as keyof FacebookTokenSet;
    }
    return null;
  }

  /**
   * Parse a cookie string to find token values (if they are stored inside cookies)
   */
  extractTokensFromCookie(cookie: string): FacebookTokenSet {
    const tokens: FacebookTokenSet = {};
    if (!cookie) return tokens;

    // Regex matchers for various Facebook access tokens
    const eaagMatch = cookie.match(/c_user=(\d+)/); // Just an example, normally cookies store c_user
    // If the cookie contains direct EAAG tokens
    const tokenRegexes = {
      eaag: /(EAAG[a-zA-Z0-9]+)/,
      eaab: /(EAAB[a-zA-Z0-9]+)/,
      eaai: /(EAAI[a-zA-Z0-9]+)/,
      eaah: /(EAAH[a-zA-Z0-9]+)/,
    };

    for (const [key, regex] of Object.entries(tokenRegexes)) {
      const match = cookie.match(regex);
      if (match) {
        tokens[key as keyof FacebookTokenSet] = match[1];
      }
    }

    return tokens;
  }

  /**
   * Extract Facebook UID from access token
   * Note: Access tokens for users contain their UID encoded or can be retrieved via Graph API.
   * This is a utility to parse if possible, or fallback to API.
   */
  extractUidFromToken(token: string): string | null {
    if (!this.isValidToken(token)) return null;
    try {
      // Facebook access tokens sometimes contain user ID or app ID, but usually it requires calling graph API /me
      // However, we can extract from token payload if it is parsed
      const parts = token.split("|");
      if (parts.length > 1) {
        // App token format appid|appsecret
        return null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Returns true when the token is past its expiry (optionally within a buffer window).
   */
  isExpired(expiresAt?: number, bufferMs = 0): boolean {
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - bufferMs;
  }

  /**
   * Returns true when the last validation is older than the given TTL.
   */
  shouldRevalidate(lastChecked?: number, ttlMs = 5 * 60 * 1000): boolean {
    if (!lastChecked) return true;
    return Date.now() - lastChecked >= ttlMs;
  }

  /**
   * Merge two token sets, keeping the most complete tokens
   */
  mergeTokenSets(existing: FacebookTokenSet, incoming: FacebookTokenSet): FacebookTokenSet {
    return {
      eaag: incoming.eaag || existing.eaag,
      eaab: incoming.eaab || existing.eaab,
      eaai: incoming.eaai || existing.eaai,
      eaah: incoming.eaah || existing.eaah,
    };
  }
}

export const tokenManager = new TokenManager();
