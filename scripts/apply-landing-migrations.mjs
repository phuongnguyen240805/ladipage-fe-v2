import { readFileSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(process.cwd(), ".env"));
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), "../liora-monorepo/.env"));

const databaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!databaseUrl) {
  console.error(
    "[migrate] Missing DATABASE_URL. Add postgres connection string to .env or liora-monorepo/.env"
  );
  process.exit(1);
}

/** Ordered landing-related migrations (filename sort). */
const LANDING_MIGRATION_FILES = [
  "20260621174100_landing_pages.sql",
  "20260622170000_landing_page_security.sql",
  "20260622000000_landing_page_templates.sql",
  "20260630010000_landing_domains_leads.sql",
  "20260701000000_landing_page_tags.sql",
  "20260707120000_landing_ai_source_html.sql",
  "20260708120000_landing_data_isolation.sql",
  "20260709120000_landing_publish_layer.sql",
  "20260709130000_landing_domain_routes.sql",
];

const NEW_MIGRATIONS = new Set([
  "20260709120000_landing_publish_layer.sql",
  "20260709130000_landing_domain_routes.sql",
]);

const BASELINE_IF_LANDING_PAGES_EXISTS = LANDING_MIGRATION_FILES.filter(
  (file) => !NEW_MIGRATIONS.has(file)
);

let pg;
try {
  pg = require("pg");
} catch {
  try {
    pg = createRequire(resolve(process.cwd(), "../liora-monorepo/package.json"))("pg");
  } catch {
    console.error("[migrate] pg package not found. Run: pnpm add -D pg");
    process.exit(1);
  }
}

const { Client } = pg;
const migrationsDir = resolve(process.cwd(), "supabase/migrations");

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._landing_migrations_applied (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedSet(client) {
  const { rows } = await client.query(
    `SELECT filename FROM public._landing_migrations_applied`
  );
  return new Set(rows.map((row) => row.filename));
}

async function markApplied(client, filename) {
  await client.query(
    `INSERT INTO public._landing_migrations_applied (filename) VALUES ($1)
     ON CONFLICT (filename) DO NOTHING`,
    [filename]
  );
}

async function seedBaselineIfNeeded(client, appliedSet) {
  if (appliedSet.size > 0) return;

  const { rows } = await client.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'landing_pages' LIMIT 1`
  );
  if (!rows.length) return;

  console.log(
    "[migrate] Existing landing_pages detected — marking baseline migrations as applied"
  );

  for (const file of BASELINE_IF_LANDING_PAGES_EXISTS) {
    await markApplied(client, file);
    appliedSet.add(file);
    console.log(`[migrate] SKIP (baseline) ${file}`);
  }
}

async function run() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("[migrate] Connected to database");

  await ensureMigrationTable(client);
  const appliedSet = await getAppliedSet(client);
  await seedBaselineIfNeeded(client, appliedSet);

  const { rows: existing } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'landing%' ORDER BY tablename`
  );
  console.log(
    "[migrate] Existing landing tables:",
    existing.map((r) => r.tablename).join(", ") || "(none)"
  );

  let appliedCount = 0;
  let skippedCount = 0;

  for (const file of LANDING_MIGRATION_FILES) {
    if (appliedSet.has(file)) {
      console.log(`[migrate] SKIP (already applied) ${file}`);
      skippedCount += 1;
      continue;
    }

    const filePath = join(migrationsDir, file);
    let sql;
    try {
      sql = readFileSync(filePath, "utf8");
    } catch (err) {
      console.error(`[migrate] Missing migration file: ${file}`);
      throw err;
    }

    console.log(`[migrate] Applying ${file}...`);
    try {
      await client.query(sql);
      await markApplied(client, file);
      appliedSet.add(file);
      appliedCount += 1;
      console.log(`[migrate] OK ${file}`);
    } catch (err) {
      console.error(`[migrate] FAILED ${file}:`, err.message);
      throw err;
    }
  }

  const roles = ["service_role", "authenticated", "anon"];
  for (const role of roles) {
    await client.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
    await client.query(`GRANT ALL ON ALL TABLES IN SCHEMA public TO ${role}`);
    await client.query(`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ${role}`);
  }
  await client.query(`NOTIFY pgrst, 'reload schema'`);

  const { rows: after } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'landing%' ORDER BY tablename`
  );
  console.log(
    "[migrate] Landing tables after migration:",
    after.map((r) => r.tablename).join(", ")
  );

  const { rows: publishColumns } = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'landing_pages'
       AND column_name IN ('published_meta', 'render_engine', 'publish_version')
     ORDER BY column_name`
  );
  console.log(
    "[migrate] landing_pages publish columns:",
    publishColumns.map((r) => r.column_name).join(", ") || "(pending)"
  );

  const { rows: routeTable } = await client.query(
    `SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'landing_domain_routes' LIMIT 1`
  );
  console.log(
    "[migrate] landing_domain_routes:",
    routeTable.length ? "exists" : "missing"
  );

  await client.end();
  console.log(
    `[migrate] Done. applied=${appliedCount} skipped=${skippedCount} total=${LANDING_MIGRATION_FILES.length}`
  );
}

run().catch((err) => {
  console.error("[migrate] Fatal:", err.message || err);
  process.exit(1);
});