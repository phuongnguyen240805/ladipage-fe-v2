#!/usr/bin/env node

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";

async function obtainToken() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.SMOKE_TEST_EMAIL ?? "1743369777@qq.com";
  const password = process.env.SMOKE_TEST_PASSWORD ?? "SmokeTest123!";

  const signIn = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: anonKey },
      body: JSON.stringify({ email, password }),
    },
  );
  const session = await signIn.json();
  if (!session.access_token) {
    throw new Error("Supabase sign-in failed.");
  }

  const exchange = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supabaseAccessToken: session.access_token }),
  });
  const body = await exchange.json();
  const token = body.data?.token ?? body.token;
  if (!token) {
    throw new Error(`Nest exchange failed (${exchange.status}).`);
  }
  return { token, supabaseAccessToken: session.access_token };
}

async function apiGet(token, path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => ({}));
  return {
    status: response.status,
    code: body.code,
    data: body.data ?? body,
    message: body.message,
  };
}

async function main() {
  const { token, supabaseAccessToken } = await obtainToken();
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
  );
  const publishedPagesRequest = fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/landing_pages?select=id,status,published_at,publish_version&status=eq.published`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${supabaseAccessToken}`,
        Prefer: "count=exact",
      },
    },
  );
  const [projects, dashboard, publishedPagesResponse] = await Promise.all([
    apiGet(token, "/ai-seo/projects?page=1&pageSize=50"),
    apiGet(
      token,
      "/ai-seo/dashboard/projects?page=1&pageSize=10&status=all&sort=updated_desc",
    ),
    publishedPagesRequest,
  ]);
  const publishedPages = await publishedPagesResponse.json().catch(() => []);
  const publishTimes = Array.isArray(publishedPages)
    ? publishedPages
        .map((page) => page.published_at)
        .filter(Boolean)
        .sort()
    : [];

  console.log(
    JSON.stringify(
      {
        tenantReady: Boolean(payload.tenantId ?? payload.activeTenantId),
        publishedLandingPages: {
          status: publishedPagesResponse.status,
          count: Array.isArray(publishedPages) ? publishedPages.length : null,
          versionedCount: Array.isArray(publishedPages)
            ? publishedPages.filter((page) => Number(page.publish_version) > 0)
                .length
            : null,
          oldestPublishedAt: publishTimes[0] ?? null,
          newestPublishedAt: publishTimes.at(-1) ?? null,
        },
        projects: {
          status: projects.status,
          code: projects.code,
          count: Array.isArray(projects.data) ? projects.data.length : null,
          message: projects.message,
        },
        dashboard: {
          status: dashboard.status,
          code: dashboard.code,
          count: Array.isArray(dashboard.data?.items)
            ? dashboard.data.items.length
            : null,
          total: dashboard.data?.pagination?.totalItems ?? null,
          message: dashboard.message,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
