#!/usr/bin/env node
/**
 * Verifies post-login session stability: token remains valid across
 * profile + business API calls (simulates redirect + page load).
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

async function getOk(name, token, path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  const ok = body.code === 200;
  console.log(`${ok ? "✓" : "✗"} ${name}: code=${body.code}`);
  if (!ok) throw new Error(body.message ?? `HTTP ${res.status}`);
}

async function main() {
  const token = await obtainToken();
  console.log("✓ Obtained Nest JWT");

  await getOk("Profile (post-login)", token, "/account/profile");
  await getOk("Profile (after redirect sim)", token, "/account/profile");
  await getOk("Dashboard summary", token, "/dashboard/summary");

  const reissueRes = await fetch(`${API_URL}/account/reissue-token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const reissueBody = await reissueRes.json();
  const newToken = reissueBody.data?.token;
  if (reissueBody.code !== 200 || !newToken) {
    throw new Error(`Reissue failed: ${reissueBody.message}`);
  }
  console.log("✓ Reissue returned new token");

  await getOk("Profile with reissued token", newToken, "/account/profile");

  const payload = JSON.parse(
    Buffer.from(newToken.split(".")[1], "base64url").toString("utf8")
  );
  const ttl = payload.exp - payload.iat;
  if (ttl < 3600) {
    throw new Error(`JWT TTL too short: ${ttl}s (expected >= 3600)`);
  }
  console.log(`✓ JWT TTL OK (${ttl}s)`);
  console.log("\nAll login session checks passed");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});