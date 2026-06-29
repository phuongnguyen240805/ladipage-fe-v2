/**
 * Suppresses hard redirect + clearAllAuth during login/bootstrap API calls.
 * Prevents null token when profile/reissue returns 1101 while session is still valid.
 */
let suppressSessionRedirectDepth = 0;

export function isSessionRedirectSuppressed(): boolean {
  return suppressSessionRedirectDepth > 0;
}

export async function withSuppressedSessionRedirect<T>(
  fn: () => Promise<T>
): Promise<T> {
  suppressSessionRedirectDepth += 1;
  try {
    return await fn();
  } finally {
    suppressSessionRedirectDepth -= 1;
  }
}