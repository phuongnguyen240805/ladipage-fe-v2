#!/usr/bin/env node
/**
 * Page-level smoke test: verifies protected pages don't show INVALID_LOGIN (1101)
 * when called with a valid Nest JWT.
 *
 * Usage:
 *   SMOKE_EMAIL=... SMOKE_PASSWORD=... SMOKE_CAPTCHA_ID=... SMOKE_VERIFY_CODE=... node scripts/smoke-pages.mjs
 * Or with existing token:
 *   SMOKE_NEST_TOKEN=eyJ... node scripts/smoke-pages.mjs
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
const INVALID_LOGIN_MSG = "登录无效";

const PAGES = [
  { name: "Tổng quan", path: "/dashboard/summary", method: "GET" },
  { name: "Tổng quan onboarding", path: "/dashboard/onboarding", method: "GET" },
  { name: "Bán hàng", path: "/ecom/orders", method: "GET" },
  { name: "Khách hàng", path: "/crm/customers", method: "GET" },
  { name: "Báo cáo bán hàng", path: "/analytics/reports/sales?from=2026-06-01&to=2026-06-16", method: "GET" },
  { name: "Báo cáo kinh doanh", path: "/analytics/reports/business?from=2026-06-01&to=2026-06-16", method: "GET" },
  { name: "Báo cáo khách hàng", path: "/analytics/reports/customers?from=2026-06-01&to=2026-06-16", method: "GET" },
  { name: "Cài đặt workspace", path: "/settings/workspace", method: "GET" },
  { name: "Cài đặt integrations", path: "/settings/integrations", method: "GET" },
  { name: "Billing usage", path: "/billing/usage", method: "GET" },
  { name: "Billing plans", path: "/plans", method: "GET" },
  { name: "Account profile", path: "/account/profile", method: "GET" },
];

async function loginViaSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email =
    process.env.SMOKE_EMAIL ??
    process.env.SMOKE_TEST_EMAIL ??
    "1743369777@qq.com";
  const password =
    process.env.SMOKE_PASSWORD ??
    process.env.SMOKE_TEST_PASSWORD ??
    "SmokeTest123!";

  if (!supabaseUrl || !anonKey) return null;

  const signIn = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: anonKey,
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const session = await signIn.json();
  if (!session.access_token) return null;

  const exchange = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supabaseAccessToken: session.access_token }),
  });
  const body = await exchange.json();
  return body.data?.token ?? body.token ?? null;
}

async function loginViaLegacy() {
  const email =
    process.env.SMOKE_EMAIL ??
    process.env.SMOKE_TEST_EMAIL ??
    "admin@liora.dev";
  const password =
    process.env.SMOKE_PASSWORD ??
    process.env.SMOKE_TEST_PASSWORD ??
    "a123456";

  let captchaId = process.env.SMOKE_CAPTCHA_ID;
  let verifyCode = process.env.SMOKE_VERIFY_CODE;

  if (!captchaId || !verifyCode) {
    const captchaRes = await fetch(`${API_URL}/auth/captcha/img`);
    const captchaBody = await captchaRes.json();
    captchaId = captchaBody.data?.id;
    if (!captchaId) {
      throw new Error("Cannot fetch captcha — set SMOKE_CAPTCHA_ID + SMOKE_VERIFY_CODE");
    }
    throw new Error(
      "Legacy login requires captcha — set SMOKE_CAPTCHA_ID + SMOKE_VERIFY_CODE or use Supabase (SMOKE_NEST_TOKEN)"
    );
  }

  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, captchaId, verifyCode }),
  });
  const body = await res.json();
  const token = body.data?.token ?? body.token;
  if (body.code !== 200 || !token) {
    throw new Error(`Login failed: ${body.message ?? res.status}`);
  }
  return token;
}

async function login() {
  const supabaseToken = await loginViaSupabase();
  if (supabaseToken) return supabaseToken;
  return loginViaLegacy();
}

async function fetchEndpoint(token, page) {
  const res = await fetch(`${API_URL}${page.path}`, {
    method: page.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

function jwtHasTenantClaims(token) {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    );
    return !!payload.organizationId && payload.tenantId != null;
  } catch {
    return false;
  }
}

async function reissueToken(token) {
  const res = await fetch(`${API_URL}/account/reissue-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const body = await res.json();
  const newToken = body.data?.token ?? body.token;
  if (body.code === 200 && newToken) {
    console.log("✓ Re-issued JWT with workspace claims");
    return newToken;
  }
  return token;
}

async function main() {
  let token = process.env.SMOKE_NEST_TOKEN ?? (await login());
  if (!jwtHasTenantClaims(token)) {
    token = await reissueToken(token);
  }
  const results = [];

  for (const page of PAGES) {
    const { status, body } = await fetchEndpoint(token, page);
    const code = Number(body?.code);
    const message = body?.message ?? "";
    const isInvalidLogin =
      code === 1101 || message.includes(INVALID_LOGIN_MSG);
    const ok = !isInvalidLogin && code === 200;

    results.push({
      name: page.name,
      ok,
      status,
      code,
      message: message.slice(0, 120),
    });

    const icon = ok ? "✓" : "✗";
    console.log(
      `${icon} ${page.name}: HTTP ${status}, code=${code}${message ? ` — ${message.slice(0, 80)}` : ""}`
    );
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log(`\n${passed}/${results.length} passed, ${failed} failed`);

  const invalidLogin = results.filter(
    (r) => r.code === 1101 || r.message?.includes(INVALID_LOGIN_MSG)
  );
  if (invalidLogin.length) {
    console.log("\nTrang/API trả INVALID_LOGIN (1101):");
    for (const r of invalidLogin) console.log(`  - ${r.name}`);
  }

  const otherErrors = results.filter((r) => !r.ok && !invalidLogin.some((i) => i.name === r.name));
  if (otherErrors.length) {
    console.log("\nTrang/API lỗi khác (403/500/...):");
    for (const r of otherErrors) console.log(`  - ${r.name}: code=${r.code} ${r.message}`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});