#!/usr/bin/env node
/**
 * Profile + Báo cáo smoke: account profile + analytics report endpoints.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";

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
    }
  );
  const session = await signIn.json();
  if (!session.access_token) {
    throw new Error(`Supabase signIn failed: ${session.error?.message}`);
  }

  const exchange = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supabaseAccessToken: session.access_token }),
  });
  const body = await exchange.json();
  const token = body.data?.token ?? body.token;
  if (!token) throw new Error(`Exchange failed: ${body.message}`);
  return token;
}

function isoRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 13);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

async function getOk(name, token, path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (body.code !== 200) {
    throw new Error(`${name}: code=${body.code} ${body.message ?? ""}`);
  }
  console.log(`✓ ${name}`);
}

async function main() {
  const token = await obtainToken();
  console.log("✓ Obtained Nest JWT");

  await getOk("GET /account/profile", token, "/account/profile");

  const { from, to } = isoRange();
  const q = `from=${from}&to=${to}`;
  await getOk("GET /analytics/reports/sales", token, `/analytics/reports/sales?${q}`);
  await getOk("GET /analytics/reports/business", token, `/analytics/reports/business?${q}`);
  await getOk("GET /analytics/reports/customers", token, `/analytics/reports/customers?${q}`);
  await getOk("GET /analytics/reports/jobs", token, `/analytics/reports/jobs?${q}`);
  await getOk("GET /analytics/reports/automation", token, `/analytics/reports/automation?${q}`);

  console.log("\nAll profile + analytics smoke checks passed");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});