import { createClient } from "@supabase/supabase-js";
import { templateSeedData } from "../src/components/landing-pages/templates/template-seed-data";
import * as fs from "fs";
import * as path from "path";

// 1. Load .env.local manually to process.env
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const index = trimmed.indexOf("=");
      if (index > 0) {
        const key = trimmed.substring(0, index).trim();
        let val = trimmed.substring(index + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
    console.log("[Seed] Successfully loaded .env.local configuration.");
  } else {
    console.warn("[Seed] .env.local file not found. Falling back to system env.");
  }
} catch (e) {
  console.warn("[Seed] Error reading .env.local file:", e);
}

// 2. Resolve Supabase config
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Smart fallback if SUPABASE_URL is a JWT token instead of a URL
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  if (supabaseUrl.startsWith("eyJ")) {
    try {
      const parts = supabaseUrl.split(".");
      if (parts[1]) {
        let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        while (base64.length % 4) {
          base64 += "=";
        }
        const decoded = Buffer.from(parts[1], "base64").toString("utf8");
        const payload = JSON.parse(decoded) as { ref?: string };
        if (payload && payload.ref) {
          supabaseUrl = `https://${payload.ref}.supabase.co`;
        }
      }
    } catch (e) {
      console.warn("[Seed] Failed to parse SUPABASE_URL as JWT:", e);
    }
  }
}

if (!supabaseUrl || !supabaseSecretKey) {
  console.error("[Seed] ERROR: SUPABASE_URL or SUPABASE_SECRET_KEY is missing from environment.");
  process.exit(1);
}

console.log(`[Seed] Initializing Supabase client. URL: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseSecretKey);

async function runSeed() {
  console.log(`[Seed] Starting migration & seed of ${templateSeedData.length} templates...`);

  for (const template of templateSeedData) {
    const sectionsCount = template.editor_data?.sections?.length || 0;
    
    // Construct database payload
    const payload = {
      template_key: template.template_key,
      name: template.name,
      description: template.description,
      category: template.category,
      tags: template.tags,
      thumbnail_url: template.thumbnail_url,
      preview_image_url: template.preview_image_url,
      editor_data: template.editor_data,
      is_published: template.is_published,
      is_featured: template.is_featured,
      price_type: template.price_type,
      views_count: template.views_count,
      downloads_count: template.downloads_count,
      updated_at: new Date().toISOString(),
    };

    try {
      // Upsert into landing_page_templates based on template_key
      const { data, error } = await supabase
        .from("landing_page_templates")
        .upsert(payload, { onConflict: "template_key" })
        .select();

      if (error) {
        console.error(`[Seed] ❌ ERROR seeding template: key='${template.template_key}', name='${template.name}'`);
        console.error(`       Error details:`, error.message);
      } else {
        console.log(`[Seed]  SUCCESS seed template:`);
        console.log(`       - key:             ${template.template_key}`);
        console.log(`       - name:            ${template.name}`);
        console.log(`       - sections.length: ${sectionsCount}`);
        console.log(`       - DB record ID:    ${data?.[0]?.id || "unknown"}`);
      }
    } catch (err: any) {
      console.error(`[Seed] ❌ ERROR exception seeding template '${template.template_key}':`, err.message || err);
    }
  }

  // Clean up obsolete templates
  const seededKeys = templateSeedData.map((t) => t.template_key);
  try {
    const { data: deleted, error: deleteError } = await supabase
      .from("landing_page_templates")
      .delete()
      .not("template_key", "in", `(${seededKeys.join(",")})`);

    if (deleteError) {
      console.error("[Seed] ❌ ERROR deleting obsolete templates from database:", deleteError.message);
    } else {
      console.log(`[Seed]  SUCCESS clean up obsolete templates.`);
    }
  } catch (err: any) {
    console.error("[Seed] ❌ ERROR exception cleaning up obsolete templates:", err.message || err);
  }

  console.log("[Seed] Completed seeding process.");
}

void runSeed();
