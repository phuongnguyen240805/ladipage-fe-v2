#!/usr/bin/env node
/**
 * AI-SEO smoke: authenticated Nest /api/ai-seo/* core endpoints.
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

async function apiCall(name, token, path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const body = await res.json();
  if (body.code !== 200 && body.code !== undefined) {
    throw new Error(`${name}: code=${body.code} ${body.message ?? ""}`);
  }
  if (!res.ok && body.code === undefined) {
    throw new Error(`${name}: HTTP ${res.status}`);
  }
  return body.data ?? body;
}

async function main() {
  const token = await obtainToken();
  console.log("✓ Obtained Nest JWT");

  const projects = await apiCall("GET /ai-seo/projects", token, "/ai-seo/projects");
  if (!Array.isArray(projects)) {
    throw new Error("GET /ai-seo/projects: expected array");
  }
  console.log(`✓ GET /ai-seo/projects (${projects.length} items)`);

  const agents = await apiCall("GET /ai-seo/agents", token, "/ai-seo/agents");
  if (!Array.isArray(agents)) {
    throw new Error("GET /ai-seo/agents: expected array");
  }
  console.log(`✓ GET /ai-seo/agents (${agents.length} items)`);

  const hostname = `smoke-${Date.now()}.example.com`;
  const created = await apiCall("POST /ai-seo/projects", token, "/ai-seo/projects", {
    method: "POST",
    body: JSON.stringify({ hostname, name: `Smoke ${hostname}` }),
  });
  const projectId = created?.id ?? created?.projectId;
  if (!projectId) throw new Error("POST /ai-seo/projects: missing project id");
  console.log(`✓ POST /ai-seo/projects (id=${projectId})`);

  const installation = await apiCall(
    "GET /ai-seo/seo-projects/:id/installation",
    token,
    `/ai-seo/seo-projects/${projectId}/installation`
  );
  if (!installation?.script) {
    throw new Error("GET installation: missing script");
  }
  console.log("✓ GET /ai-seo/seo-projects/:id/installation");

  const tasks = await apiCall(
    "GET /ai-seo/seo-projects/:id/tasks",
    token,
    `/ai-seo/seo-projects/${projectId}/tasks`
  );
  if (!Array.isArray(tasks)) {
    throw new Error("GET tasks: expected array");
  }
  console.log(`✓ GET /ai-seo/seo-projects/:id/tasks (${tasks.length} items)`);

  await apiCall("DELETE /ai-seo/projects/:id", token, `/ai-seo/projects/${projectId}`, {
    method: "DELETE",
  });
  console.log("✓ DELETE /ai-seo/projects/:id");

  console.log("\nAll AI-SEO smoke checks passed");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});