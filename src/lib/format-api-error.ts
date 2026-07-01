export function formatApiErrorBody(result: unknown, fallback: string): string {
  if (!result || typeof result !== "object") return fallback;

  const record = result as Record<string, unknown>;
  const error = record.error;

  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const nested = error as Record<string, unknown>;
    if (typeof nested.error === "string" && nested.error.trim()) return nested.error;
    if (typeof nested.message === "string" && nested.message.trim()) return nested.message;
  }

  if (typeof record.message === "string" && record.message.trim()) return record.message;

  return fallback;
}