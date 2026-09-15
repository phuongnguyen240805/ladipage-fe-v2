#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const mustContain = (file, re, message) => {
  if (!re.test(read(file))) failures.push(`${file}: ${message}`);
};
const mustNotContain = (file, re, message) => {
  if (re.test(read(file))) failures.push(`${file}: ${message}`);
};

mustContain(
  "src/app/api/landing-pages/[id]/publish/route.ts",
  /LANDING_ASYNC_PUBLISH_ENABLED/,
  "async publish must remain feature-flagged for safe rollout",
);
mustContain(
  "src/app/api/landing-pages/[id]/publish/route.ts",
  /Idempotency-Key|idempotency-key/,
  "publish BFF must forward an idempotency key",
);
mustContain(
  "src/features/landing-publish/services/landing-publish.service.ts",
  /last_publish_job_id/,
  "executor must use a durable publish-job marker",
);
mustContain(
  "src/features/landing-publish/services/landing-publish.service.ts",
  /PUBLISH_SUPERSEDED/,
  "concurrent stale publishes must be detected instead of blindly overwriting",
);
mustContain(
  "src/features/landing-publish/services/landing-publish.service.ts",
  /last_publish_job_sequence/,
  "async publish must fence stale retries with a monotonic job sequence",
);
mustContain(
  "src/features/landing-publish/services/landing-publish.service.ts",
  /fenceSupersededEdgePublish/,
  "edge activation must repair out-of-order publish completion",
);
mustContain(
  "src/app/api/internal/publish/execute/route.ts",
  /verifyInternalPublishSignature/,
  "worker executor must authenticate the raw request with HMAC",
);
mustNotContain(
  "src/app/api/internal/publish/execute/route.ts",
  /Authorization|extractNestBearerToken|localStorage/,
  "internal executor must not depend on a persisted/browser bearer token",
);
mustContain(
  "cloudflare/landing-edge-worker.ts",
  /landing\/\$\{pageId\}\/\$\{version\}\/index\.html/,
  "edge artifacts must be immutable and version-addressed",
);
mustContain(
  "cloudflare/landing-edge-worker.ts",
  /buildCanonicalRouteKvKey/,
  "public routes must resolve through a mutable KV pointer",
);
mustContain(
  "cloudflare/landing-edge-worker.ts",
  /LANDING_EDGE_FALLBACK_ENABLED/,
  "edge migration must retain an origin fallback switch",
);
mustContain(
  "supabase/migrations/20260914160000_landing_async_publish_idempotency.sql",
  /last_publish_job_id/,
  "async publish idempotency migration is required",
);
mustContain(
  "src/features/landing-publish/api/publish.api.ts",
  /status === "published"/,
  "browser compatibility API must await the async job without UI changes",
);

if (failures.length) {
  console.error("Phase 7-8 frontend guard failed:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("Phase 7-8 frontend guard passed.");
