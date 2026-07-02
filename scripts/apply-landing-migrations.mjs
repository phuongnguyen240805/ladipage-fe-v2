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

const LANDING_MIGRATION_FILES = [
  "20260621174100_landing_pages.sql",
  "20260622170000_landing_page_security.sql",
  "20260622000000_landing_page_templates.sql",
  "20260630010000_landing_domains_leads.sql",
  "20260701000000_landing_page_tags.sql",
];

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

async function run() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("[migrate] Connected to database");

  const { rows: existing } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('landing_pages','landing_page_templates','landing_domains','landing_leads') ORDER BY tablename`
  );
  console.log("[migrate] Existing landing tables:", existing.map((r) => r.tablename).join(", ") || "(none)");

  for (const file of LANDING_MIGRATION_FILES) {
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
  console.log("[migrate] Landing tables after migration:", after.map((r) => r.tablename).join(", "));
  await client.end();
  console.log("[migrate] Done.");
}

run().catch((err) => {
  console.error("[migrate] Fatal:", err.message || err);
  process.exit(1);
});