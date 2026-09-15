import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { publishLandingPageServer } from "@/features/landing-publish/services/landing-publish.service";
import {
  internalPublishSecret,
  INTERNAL_PUBLISH_SIGNATURE_HEADER,
  INTERNAL_PUBLISH_TIMESTAMP_HEADER,
  verifyInternalPublishSignature,
} from "@/features/landing-publish/services/internal-publish-signature.server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INTERNAL_BODY_BYTES = 12 * 1024 * 1024;

const publishPayloadSchema = z.object({
  draftOverride: z.unknown().optional(),
  preserveHtml: z.boolean().optional(),
  domainId: z.string().uuid().optional(),
  path: z.string().max(512).optional(),
});

const executorBodySchema = z.object({
  jobId: z.string().regex(/^pub_[A-Za-z0-9_-]{16,64}$/),
  jobSequence: z.number().int().positive(),
  pageId: z.string().min(1).max(64),
  tenantId: z.number().int().positive(),
  organizationId: z.string().uuid().nullable(),
  userId: z.number().int().positive(),
  ownerId: z.string().uuid(),
  payload: publishPayloadSchema,
  instaticHtml: z.string().max(10 * 1024 * 1024).nullable().optional(),
});

function errorResponse(error: unknown): NextResponse {
  const status = (error as { status?: number }).status ?? 500;
  const code = (error as { code?: string }).code ?? "PUBLISH_EXECUTION_FAILED";
  const message = error instanceof Error ? error.message : "Publish execution failed.";
  return NextResponse.json(
    { error: message, code },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

/**
 * Worker-only publish executor. It intentionally accepts no browser session and
 * authenticates the exact raw body with a shared HMAC secret.
 */
export async function POST(request: NextRequest) {
  const secret = internalPublishSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Internal publish authentication is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, "utf8") > MAX_INTERNAL_BODY_BYTES) {
    return NextResponse.json(
      { error: "Publish executor payload is too large" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const validSignature = verifyInternalPublishSignature({
    secret,
    timestamp: request.headers.get(INTERNAL_PUBLISH_TIMESTAMP_HEADER),
    signature: request.headers.get(INTERNAL_PUBLISH_SIGNATURE_HEADER),
    body: rawBody,
  });
  if (!validSignature) {
    return NextResponse.json(
      { error: "Invalid internal publish signature" },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  let raw: unknown;
  try {
    raw = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
  const parsed = executorBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid publish executor payload", code: "INVALID_PUBLISH_PAYLOAD" },
      { status: 422, headers: { "Cache-Control": "no-store" } },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase server configuration is missing" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const result = await publishLandingPageServer({
      supabase,
      pageId: parsed.data.pageId,
      ownerId: parsed.data.ownerId,
      body: parsed.data.payload,
      publishJobId: parsed.data.jobId,
      publishJobSequence: parsed.data.jobSequence,
      internalContext: {
        tenantId: parsed.data.tenantId,
        organizationId: parsed.data.organizationId,
      },
      instaticHtml: parsed.data.instaticHtml ?? null,
    });
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
