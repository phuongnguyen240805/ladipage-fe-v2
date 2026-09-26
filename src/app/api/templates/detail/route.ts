import { NextRequest, NextResponse } from "next/server";
import { templateSeedData } from "@/components/landing-pages/templates/template-seed-data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { fetchRemoteTemplateArtifact, readLocalTemplateArtifact } from "../_artifact";
import { isValidTemplateUuid, parseSeedTemplateKey } from "../_utils";

export const runtime = "nodejs";

const TEMPLATE_DETAIL_COLUMNS = [
  "id",
  "template_key",
  "name",
  "description",
  "category",
  "tags",
  "thumbnail_url",
  "preview_image_url",
  "editor_data",
  "is_published",
  "is_featured",
  "price_type",
  "views_count",
  "downloads_count",
  "source_type",
  "source_repo",
  "source_ref",
  "manifest_url",
  "editor_data_url",
  "render_url",
  "artifact_version",
  "content_hash",
  "created_at",
  "updated_at",
].join(", ");

function resolveSeedTemplate(id: string | null, templateKey: string | null) {
  const seedKey = id ? parseSeedTemplateKey(id) : null;
  const key = templateKey?.trim() || seedKey;
  if (!key) return null;
  return templateSeedData.find((item) => item.template_key === key) ?? null;
}

async function loadArtifactEditorData(
  request: NextRequest,
  templateKey: string,
  editorDataUrl: string,
): Promise<unknown | null> {
  const local = await readLocalTemplateArtifact(editorDataUrl);
  if (local) return local;

  const remote = await fetchRemoteTemplateArtifact(request.nextUrl.origin, editorDataUrl);
  if (remote.data) return remote.data;

  if (remote.failures.length > 0) {
    console.error(
      `[api/templates/detail] artifact load failed for ${templateKey}: ${remote.failures.join("; ")}`,
    );
  }
  return null;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const templateKey = request.nextUrl.searchParams.get("template_key");

  if (!id && !templateKey) {
    return NextResponse.json(
      { error: "id or template_key is required." },
      { status: 400 },
    );
  }

  let seed = resolveSeedTemplate(id, templateKey);
  const resolvedKey = templateKey?.trim() || seed?.template_key || (id ? parseSeedTemplateKey(id) : null);

  let databaseRow: Record<string, unknown> | null = null;
  const supabase = getSupabaseAdmin();

  if (supabase) {
    let query = supabase
      .from("landing_page_templates")
      .select(TEMPLATE_DETAIL_COLUMNS)
      .eq("is_published", true);

    if (id && isValidTemplateUuid(id)) {
      query = query.eq("id", id);
    } else if (resolvedKey) {
      query = query.eq("template_key", resolvedKey);
    } else {
      query = query.eq("id", "00000000-0000-0000-0000-000000000000");
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      console.error("[api/templates/detail]", error.message);
    } else if (data) {
      databaseRow = data as unknown as Record<string, unknown>;
    }
  }

  if (!seed && typeof databaseRow?.template_key === "string") {
    seed =
      templateSeedData.find(
        (item) => item.template_key === databaseRow?.template_key,
      ) ?? null;
  }

  if (!seed && !databaseRow) {
    return NextResponse.json({ error: "Template not found." }, { status: 404 });
  }

  let editorData: unknown = databaseRow?.editor_data ?? seed?.editor_data ?? null;
  const artifactEditorDataUrl =
    seed?.editor_data_url ||
    (typeof databaseRow?.editor_data_url === "string"
      ? databaseRow.editor_data_url
      : null);
  const artifactTemplateKey =
    seed?.template_key ||
    (typeof databaseRow?.template_key === "string"
      ? databaseRow.template_key
      : resolvedKey || "unknown-template");

  if (artifactEditorDataUrl) {
    const artifactEditorData = await loadArtifactEditorData(
      request,
      artifactTemplateKey,
      artifactEditorDataUrl,
    );
    if (artifactEditorData) {
      editorData = artifactEditorData;
    }
  }

  const seedMetadata = seed
    ? {
        ...seed,
        editor_data: undefined,
      }
    : {};

  return NextResponse.json({
    ...seedMetadata,
    ...databaseRow,
    id: databaseRow?.id ?? (seed ? `seed-${seed.template_key}` : id),
    editor_data: editorData,
    editor_data_url: seed?.editor_data_url ?? databaseRow?.editor_data_url,
    manifest_url: seed?.manifest_url ?? databaseRow?.manifest_url,
    render_url: seed?.render_url ?? databaseRow?.render_url,
    source_type: seed?.source_type ?? databaseRow?.source_type,
    source_repo: seed?.source_repo ?? databaseRow?.source_repo,
    source_ref: seed?.source_ref ?? databaseRow?.source_ref,
    artifact_version: seed?.artifact_version ?? databaseRow?.artifact_version,
    content_hash: seed?.content_hash ?? databaseRow?.content_hash,
  });
}
