import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;

    if (!supabase) {
      const updated = mockDb.toggleFavoriteProject(projectId);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    // Attempt to toggle is_favorite in ai_seo_projects
    // First find the project record
    const { data: project, error: fetchError } = await supabase
      .from("ai_seo_projects")
      .select("id, is_favorite")
      .or(`id.eq.${projectId},project_id.eq.${projectId}`)
      .single();

    if (fetchError || !project) {
      // Fallback to mockDb
      const updated = mockDb.toggleFavoriteProject(projectId);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    const nextVal = !project.is_favorite;

    const { data: updated, error: updateError } = await supabase
      .from("ai_seo_projects")
      .update({ is_favorite: nextVal, updated_at: new Date() })
      .eq("id", project.id)
      .select()
      .single();

    if (updateError) {
      console.warn("Supabase update is_favorite error:", updateError);
      const updatedMock = mockDb.toggleFavoriteProject(projectId);
      return NextResponse.json(updatedMock || { error: "Project not found" }, { status: updatedMock ? 200 : 404 });
    }

    return NextResponse.json({
      id: updated.id,
      projectId: updated.project_id,
      isFavorite: updated.is_favorite
    });
  } catch (err: any) {
    console.error("PATCH favorite error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
