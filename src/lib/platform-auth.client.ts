export interface PlatformAuthTokenOptions {
  preferNest?: boolean;
}

/**
 * Platform REST authentication is owned by the same-origin BFF. Browser code
 * deliberately has no access to the Nest bearer token.
 *
 * This compatibility helper remains because several feature modules already
 * depend on it. Returning null prevents new code from accidentally rebuilding
 * a browser bearer-token path while allowing callers to migrate incrementally.
 */
export async function getPlatformAuthToken(
  _options: PlatformAuthTokenOptions = {},
): Promise<null> {
  return null;
}

/**
 * Same-origin BFF requests only need ordinary content negotiation headers.
 * Credentials are supplied server-side from HttpOnly cookies.
 */
export async function getPlatformAuthHeaders(
  _options: PlatformAuthTokenOptions = {},
): Promise<Record<string, string>> {
  return { "Content-Type": "application/json" };
}
