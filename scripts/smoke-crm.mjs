#!/usr/bin/env node
/**
 * WAVE 1c — Khách hàng smoke: authenticated CRM list endpoints.
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

async function getPaginated(name, token, path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (body.code !== 200) {
    throw new Error(`${name}: code=${body.code} ${body.message ?? ""}`);
  }
  if (!Array.isArray(body.data?.items)) {
    throw new Error(`${name}: missing data.items array`);
  }
  console.log(`✓ ${name} (${body.data.items.length} items)`);
}

async function main() {
  const token = await obtainToken();
  console.log("✓ Obtained Nest JWT");

  await getPaginated("GET /crm/customers", token, "/crm/customers?pageSize=5");
  await getPaginated(
    "GET /crm/customers?search=test",
    token,
    "/crm/customers?search=test&pageSize=5"
  );
  await getPaginated("GET /crm/segments", token, "/crm/segments?pageSize=5");
  await getPaginated("GET /crm/tags", token, "/crm/tags?pageSize=5");
  await getPaginated(
    "GET /crm/custom-fields",
    token,
    "/crm/custom-fields?targetType=person&pageSize=5"
  );
  await getPaginated("GET /crm/companies", token, "/crm/companies?pageSize=5");
  await getPaginated("GET /crm/error-logs", token, "/crm/error-logs?pageSize=5");

  console.log("\nAll CRM smoke checks passed");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});