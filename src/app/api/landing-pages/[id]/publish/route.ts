import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import {
  publishLandingPageServer,
  unpublishLandingPageServer,
} from "@/features/landing-publish/services/landing-publish.service";
import { getBuilderSessionFromHeader } from "@/features/landing-builder/services/builder-session.server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  assertPageOwnedBy,
  requireLandingPageOwner,
} from "@/app/api/landing-pages/_ownership";
import { fetchBackend } from "@/lib/backend/client.server";
import { extractNestBearerToken } from "@/lib/platform-auth.server";

export const runtime = "nodejs";

const publishBodySchema = z.object({
  draftOverride: z.unknown().optional(),
  preserveHtml: z.boolean().optional(),
  domainId: z.string().uuid().optional(),
  path: z.string().max(512).optional(),
});

const JOB_ID_PATTERN = /^pub_[A-Za-z0-9_-]{16,64}$/;
const DEFAULT_ASYNC_PAYLOAD_LIMIT_BYTES = 750_000;

interface RouteContext {
  params: Promise<{ id: string }>;
}

type AuthorizePublishResult =
  | { error: NextResponse; ownerId?: never; supabase?: never }
  | { ownerId: string; supabase: SupabaseClient; error?: never };

function asyncPublishEnabled(): boolean {
  return process.env.LANDING_ASYNC_PUBLISH_ENABLED === "true";
}

function unwrapBackendData(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as Record<string, unknown>;
  }
  return record;
}

function backendError(raw: unknown, fallback: string): string {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    if (typeof record.message === "string" && record.message.trim()) return record.message;
    const data = record.data;
    if (data && typeof data === "object") {
      const nested = data as Record<string, unknown>;
      if (typeof nested.message === "string" && nested.message.trim()) return nested.message;
    }
  }
  return fallback;
}

async function authorizePublish(
  request: NextRequest,
  pageId: string,
): Promise<AuthorizePublishResult> {
  const auth = await requireLandingPageOwner(request);

  // Prefer platform owner; fall back to builder-session for unauthenticated builder publish.
  let ownerId: string | null = null;
  if (!("error" in auth) && auth.ownerId) {
    ownerId = auth.ownerId;
  } else {
    const session = getBuilderSessionFromHeader(request, pageId);
    if (!session) {
      return {
        error:
          "error" in auth && auth.error
            ? auth.error
            : NextResponse.json({ error: "Unauthorized. Sign in required." }, { status: 401 }),
      };
    }

    const supabaseForOwnership = getSupabaseAdmin();
    if (!supabaseForOwnership) {
      return {
        error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
      };
    }

    const { data: page } = await supabaseForOwnership
      .from("landing_pages")
      .select("id, user_id")
      .eq("id", pageId)
      .maybeSingle();

    const forbidden = assertPageOwnedBy(page, session.userId);
    if (forbidden) {
      return { error: forbidden };
    }

    ownerId = session.userId;
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      error: NextResponse.json({ error: "Supabase server configuration is missing." }, { status: 500 }),
    };
  }

  return { ownerId, supabase };
}

async function queueAsyncPublish(input: {
  request: NextRequest;
  pageId: string;
  payload: z.infer<typeof publishBodySchema>;
  serializedPayload: string;
  nestToken: string;
}): Promise<NextResponse> {
  const headers = new Headers(input.request.headers);
  headers.set("content-type", "application/json");
  headers.set(
    "idempotency-key",
    input.request.headers.get("idempotency-key")?.trim() || `publish-${randomUUID()}`,
  );

  // request.json() above consumed the original body. Rebuild a server request so
  // the shared BFF client can still own header allowlisting and bearer injection.
  const backendRequest = new NextRequest(input.request.url, {
    method: "POST",
    headers,
    body: input.serializedPayload,
  });
  const upstream = await fetchBackend(
    backendRequest,
    `publish/landing-pages/${encodeURIComponent(input.pageId)}/jobs`,
    {
      method: "POST",
      accessToken: input.nestToken,
      timeoutMs: 30_000,
      search: "",
    },
  );
  const raw: unknown = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: backendError(raw, "Failed to queue publish job.") },
      { status: upstream.status, headers: { "Cache-Control": "no-store" } },
    );
  }

  const job = unwrapBackendData(raw);
  if (!job?.jobId) {
    return NextResponse.json(
      { error: "Publish queue returned an invalid job response." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
  return NextResponse.json(job, {
    status: 202,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await authorizePublish(request, pageId);
  if ("error" in auth) return auth.error;

  const parsed = publishBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid publish payload." }, { status: 400 });
  }

  try {
    const nestToken = extractNestBearerToken(request);
    const serializedPayload = JSON.stringify(parsed.data);
    const configuredLimit = Number(
      process.env.LANDING_ASYNC_PUBLISH_MAX_PAYLOAD_BYTES ??
        DEFAULT_ASYNC_PAYLOAD_LIMIT_BYTES,
    );
    const asyncPayloadLimit = Number.isFinite(configuredLimit)
      ? Math.max(64_000, Math.min(configuredLimit, 900_000))
      : DEFAULT_ASYNC_PAYLOAD_LIMIT_BYTES;
    const asyncPayloadEligible =
      Buffer.byteLength(serializedPayload, "utf8") <= asyncPayloadLimit;

    if (asyncPublishEnabled() && nestToken && asyncPayloadEligible) {
      return queueAsyncPublish({
        request,
        pageId,
        payload: parsed.data,
        serializedPayload,
        nestToken,
      });
    }
    if (asyncPublishEnabled() && nestToken && !asyncPayloadEligible) {
      console.warn(
        `[publish] page=${pageId}: payload exceeds async safety budget; using synchronous fallback`,
      );
    }

    // Builder-session publish has no Nest workspace identity, and feature-flag-off
    // deployments intentionally keep the existing synchronous fallback.
    if (!nestToken) {
      console.warn(
        `[publish] page=${pageId}: no Nest JWT — using synchronous publish fallback`,
      );
    }
    const result = await publishLandingPageServer({
      supabase: auth.supabase,
      pageId,
      ownerId: auth.ownerId,
      body: parsed.data,
      authHeader: nestToken ? `Bearer ${nestToken}` : null,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Publish failed.";
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await authorizePublish(request, pageId);
  if ("error" in auth) return auth.error;

  const jobId = request.nextUrl.searchParams.get("jobId")?.trim() ?? "";
  if (!JOB_ID_PATTERN.test(jobId)) {
    return NextResponse.json({ error: "Invalid publish job id." }, { status: 400 });
  }
  const nestToken = extractNestBearerToken(request);
  if (!nestToken) {
    return NextResponse.json({ error: "Publish session expired." }, { status: 401 });
  }

  try {
    const upstream = await fetchBackend(
      request,
      `publish/jobs/${encodeURIComponent(jobId)}`,
      {
        method: "GET",
        accessToken: nestToken,
        search: "",
        timeoutMs: 15_000,
      },
    );
    const raw: unknown = await upstream.json().catch(() => null);
    if (!upstream.ok) {
      return NextResponse.json(
        { error: backendError(raw, "Failed to read publish job.") },
        { status: upstream.status, headers: { "Cache-Control": "no-store" } },
      );
    }
    const job = unwrapBackendData(raw);
    if (!job || job.pageId !== pageId) {
      return NextResponse.json({ error: "Publish job not found." }, { status: 404 });
    }
    return NextResponse.json(job, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      { error: timedOut ? "Publish status request timed out." : "Publish backend unavailable." },
      { status: timedOut ? 504 : 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id: pageId } = await context.params;
  const auth = await authorizePublish(request, pageId);
  if ("error" in auth) return auth.error;

  try {
    const result = await unpublishLandingPageServer({
      supabase: auth.supabase,
      pageId,
      ownerId: auth.ownerId,
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Unpublish failed.";
    return NextResponse.json({ error: message }, { status });
  }
}
