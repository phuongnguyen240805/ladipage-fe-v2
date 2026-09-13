#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(cwd, relativePath), "utf8");
}

function mustNotContain(relativePath, pattern, message) {
  const source = read(relativePath);
  if (pattern.test(source)) failures.push(`${relativePath}: ${message}`);
}

function mustContain(relativePath, pattern, message) {
  const source = read(relativePath);
  if (!pattern.test(source)) failures.push(`${relativePath}: ${message}`);
}

for (const provider of ["QueryProvider", "AuthProvider", "SidebarProvider"]) {
  mustNotContain(
    "src/app/layout.tsx",
    new RegExp(`\\b${provider}\\b`),
    `${provider} must stay out of the root layout`,
  );
}

mustNotContain(
  "src/lib/api-client.ts",
  /NEXT_PUBLIC_API_URL|Authorization\s*=|headers\.Authorization|Bearer\s+\$\{/,
  "browser API client must not know the Nest URL or attach a bearer token",
);
mustContain(
  "src/lib/api-client.ts",
  /baseURL:\s*["']\/api\/backend["']/,
  "authenticated browser client must use the same-origin BFF",
);
mustContain(
  "src/lib/backend/client.server.ts",
  /headers\.set\(["']x-request-id["']/,
  "BFF must create a server-owned request id",
);
mustContain(
  "src/lib/backend/client.server.ts",
  /headers\.set\(["']traceparent["']/,
  "BFF must start a server-owned trace context",
);
mustNotContain(
  "middleware.ts",
  /new URL\(["']\/api\/auth\/refresh["']/,
  "middleware must not perform state-changing refresh via navigation GET",
);
mustNotContain(
  "src/app/api/auth/session/route.ts",
  /\{\s*token\s*[,}]/,
  "session bootstrap must not serialize the Nest access token",
);
mustNotContain(
  "src/app/api/auth/refresh/route.ts",
  /export\s+async\s+function\s+GET|export\s+const\s+GET/,
  "refresh must remain POST-only",
);
mustContain(
  "src/app/api/backend/[...path]/route.ts",
  /path\.startsWith\(["']auth\//,
  "generic BFF must explicitly deny auth endpoints",
);
mustNotContain(
  "src/features/customer-care/realtime/customer-care-socket.ts",
  /nestToken|NEXT_PUBLIC_API_URL/,
  "Customer Care socket must not use the platform session JWT or REST API URL",
);
mustContain(
  "src/features/customer-care/realtime/customer-care-socket.ts",
  /realtime-ticket/,
  "Customer Care socket must obtain a scoped realtime ticket",
);
mustContain(
  "next.config.ts",
  /Content-Security-Policy-Report-Only/,
  "CSP must remain Report-Only until violations have been remediated",
);

const store = read("src/features/auth/stores/auth.store.ts");
const partialize = store.slice(store.indexOf("partialize:"), store.indexOf("merge:"));
if (/nestToken|nestTokenExp/.test(partialize)) {
  failures.push("src/features/auth/stores/auth.store.ts: persisted platform state must not contain Nest tokens");
}

if (failures.length) {
  console.error("Phase 0-3 guard failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Phase 0-3 guard passed.");
