import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const INTERNAL_PUBLISH_SIGNATURE_HEADER = "x-liora-publish-signature";
export const INTERNAL_PUBLISH_TIMESTAMP_HEADER = "x-liora-publish-timestamp";
export const INTERNAL_PUBLISH_MAX_SKEW_MS = 5 * 60_000;

export function internalPublishSecret(): string | null {
  const secret = process.env.LANDING_PUBLISH_EXECUTOR_SECRET?.trim();
  return secret && secret.length >= 32 ? secret : null;
}

export function createInternalPublishSignature(
  secret: string,
  timestamp: string,
  body: string,
): string {
  return createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex");
}

export function verifyInternalPublishSignature(input: {
  secret: string;
  timestamp: string | null | undefined;
  signature: string | null | undefined;
  body: string;
  now?: number;
}): boolean {
  const timestampMs = Number(input.timestamp);
  if (!input.timestamp || !input.signature || !Number.isFinite(timestampMs)) return false;
  if (Math.abs((input.now ?? Date.now()) - timestampMs) > INTERNAL_PUBLISH_MAX_SKEW_MS) {
    return false;
  }

  const expected = createInternalPublishSignature(
    input.secret,
    input.timestamp,
    input.body,
  );
  if (expected.length !== input.signature.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(input.signature, "utf8"),
    );
  } catch {
    return false;
  }
}
