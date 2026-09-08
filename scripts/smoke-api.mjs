#!/usr/bin/env node
/**
 * Smoke tests for ladipage FE API integration layer.
 * With NEXT_PUBLIC_API_MOCKING=true, run against MSW-backed dev server OR
 * test ResOp contract against live backend on :7002.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";
const MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === "true";

const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`✓ ${name}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push({ name, ok: false, message });
    console.log(`✗ ${name}: ${message}`);
  }
}

await test("GET /health/ready returns 200", async () => {
  const res = await fetch(`${API_URL}/health/ready`);
  if (!res.ok) throw new Error(`status ${res.status}`);
});

await test("ResOp wrapper on health response", async () => {
  const res = await fetch(`${API_URL}/health/ready`);
  const body = await res.json();
  if (typeof body.code !== "number") throw new Error("missing code");
  if (!("data" in body)) throw new Error("missing data");
});

await test("POST /auth/exchange rejects empty token", async () => {
  const res = await fetch(`${API_URL}/auth/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ supabaseAccessToken: "short" }),
  });
  if (res.status === 200) throw new Error("expected validation error");
});

await test("GET /account/profile requires auth (401)", async () => {
  const res = await fetch(`${API_URL}/account/profile`);
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
});

await test("GET /plans is reachable (public or auth)", async () => {
  const res = await fetch(`${API_URL}/plans`);
  if (res.status === 404) throw new Error("endpoint not found — restart backend");
  const body = await res.json();
  if (typeof body.code !== "number") throw new Error("invalid ResOp");
});

await test("GET /dashboard/summary requires tenant auth", async () => {
  const res = await fetch(`${API_URL}/dashboard/summary`);
  if (res.status !== 401 && res.status !== 403) {
    throw new Error(`expected 401/403 without token, got ${res.status}`);
  }
});

if (MOCKING) {
  console.log("\n(Mock mode flag set — start dev server with NEXT_PUBLIC_API_MOCKING=true for browser tests)");
}

const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;
console.log(`\n${passed}/${results.length} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);