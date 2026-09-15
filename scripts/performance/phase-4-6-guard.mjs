#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(cwd, relativePath), "utf8");
}

function mustContain(relativePath, pattern, message) {
  if (!pattern.test(read(relativePath))) failures.push(`${relativePath}: ${message}`);
}

function mustNotContain(relativePath, pattern, message) {
  if (pattern.test(read(relativePath))) failures.push(`${relativePath}: ${message}`);
}

const editorStorage = read(
  "src/components/landing-pages/editor/core/editor-supabase-storage.ts",
);
const directLandingWrite = /\.from\(["']landing_pages["']\)[\s\S]{0,320}?\.(?:insert|upsert|update|delete)\(/g;
const directVersionWrite = /\.from\(["']landing_page_versions["']\)[\s\S]{0,320}?\.(?:insert|upsert|update|delete)\(/g;
if (directLandingWrite.test(editorStorage)) {
  failures.push(
    "editor-supabase-storage.ts: browser code must not write landing_pages directly",
  );
}
if (directVersionWrite.test(editorStorage)) {
  failures.push(
    "editor-supabase-storage.ts: browser code must not write landing_page_versions directly",
  );
}

mustContain(
  "src/providers/QueryProvider.tsx",
  /syncQueryCacheScope\(scope\)/,
  "authenticated QueryClient cache must be invalidated when tenant/user scope changes",
);
mustContain(
  "src/lib/query-client.ts",
  /appQueryClient\.clear\(\)/,
  "query cache scope switch must clear cached authenticated data",
);
mustContain(
  "src/app/api/landing-pages/[id]/versions/route.ts",
  /requireLandingPageOwner/,
  "landing page version collection route must enforce server-side ownership",
);
mustContain(
  "src/app/api/landing-pages/[id]/versions/route.ts",
  /\.eq\(["']user_id["'],\s*auth\.ownerId\)/,
  "landing page ownership lookup must be scoped in the database query",
);
mustContain(
  "src/app/api/landing-pages/[id]/versions/route.ts",
  /\.limit\(30\)/,
  "landing page version history must have a bounded read limit",
);
mustContain(
  "src/app/api/landing-pages/[id]/versions/[versionId]/route.ts",
  /\.eq\(["']user_id["'],\s*auth\.ownerId\)/,
  "single version read must be owner-scoped",
);

const landingPageRoute = read("src/app/(admin)/landing-pages/page.tsx");
const heavyPackages = [
  "pixi.js",
  "xlsx",
  "@fullcalendar/",
  "tsparticles",
  "socket.io-client",
  "@stripe/",
];
for (const dependency of heavyPackages) {
  if (landingPageRoute.includes(`from \"${dependency}`) || landingPageRoute.includes(`from '${dependency}`)) {
    failures.push(
      `src/app/(admin)/landing-pages/page.tsx: heavy unrelated package must not be a direct initial-route import (${dependency})`,
    );
  }
}

mustNotContain(
  "src/components/landing-pages/editor/core/editor-supabase-storage.ts",
  /Authorization["']?\s*[:=]|Bearer\s+\$\{/,
  "landing editor browser storage must not rebuild a bearer-token path",
);

if (failures.length) {
  console.error("Phase 4-6 frontend guard failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("Phase 4-6 frontend guard passed.");
