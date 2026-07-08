import { readFileSync } from "node:fs";
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
  console.error("[migrate-ai] Missing DATABASE_URL or SUPABASE_DB_URL");
  process.exit(1);
}

let pg;
try {
  pg = require("pg");
} catch {
  try {
    pg = createRequire(resolve(process.cwd(), "../liora-monorepo/package.json"))("pg");
  } catch {
    console.error("[migrate-ai] pg package not found. Run: pnpm add -D pg");
    process.exit(1);
  }
}

const MIGRATION_FILE = "20260707120000_landing_ai_source_html.sql";
const { Client } = pg;

async function run() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("[migrate-ai] Connected to database");

  const sql = readFileSync(
    join(resolve(process.cwd(), "supabase/migrations"), MIGRATION_FILE),
    "utf8",
  );

  console.log(`[migrate-ai] Applying ${MIGRATION_FILE}...`);
  await client.query(sql);
  await client.query(`NOTIFY pgrst, 'reload schema'`);

  const { rows } = await client.query(
    `SELECT column_name, data_type
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'landing_pages'
       AND column_name IN ('ai_source_html', 'generation_meta')
     ORDER BY column_name`,
  );

  console.log(
    "[migrate-ai] Columns:",
    rows.map((r) => `${r.column_name}(${r.data_type})`).join(", "),
  );

  if (rows.length < 2) {
    throw new Error("ai_source_html or generation_meta still missing on landing_pages");
  }

  await client.end();
  console.log("[migrate-ai] Done.");
}

run().catch((err) => {
  console.error("[migrate-ai] Fatal:", err.message || err);
  process.exit(1);
});