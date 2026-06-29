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
      const updated = mockDb.toggleAgentStatus(projectId);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    // First find the project record
    const { data: project, error: fetchError } = await supabase
      .from("ai_seo_projects")
      .select("id, is_engaged")
      .or(`id.eq.${projectId},project_id.eq.${projectId}`)
      .single();

    if (fetchError || !project) {
      // Fallback to mockDb
      const updated = mockDb.toggleAgentStatus(projectId);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    const nextVal = !project.is_engaged;

    const { data: updated, error: updateError } = await supabase
      .from("ai_seo_projects")
      .update({ is_engaged: nextVal, updated_at: new Date() })
      .eq("id", project.id)
      .select()
      .single();

    if (updateError) {
      console.warn("Supabase update is_engaged error:", updateError);
      const updatedMock = mockDb.toggleAgentStatus(projectId);
      return NextResponse.json(updatedMock || { error: "Project not found" }, { status: updatedMock ? 200 : 404 });
    }

    return NextResponse.json({
      id: updated.id,
      projectId: updated.project_id,
      isEngaged: updated.is_engaged
    });
  } catch (err: any) {
    console.error("PATCH agent status error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
