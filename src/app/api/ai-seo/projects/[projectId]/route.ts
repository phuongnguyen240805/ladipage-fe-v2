import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../mockDb";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing name parameter" }, { status: 400 });
    }

    if (!supabase) {
      const updated = mockDb.updateProject(projectId, name);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    const { data, error } = await supabase
      .from("projects")
      .update({ name, updated_at: new Date() })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.warn("Supabase patch project error, using mockDb:", error);
      const updated = mockDb.updateProject(projectId, name);
      return NextResponse.json(updated || { error: "Project not found" }, { status: updated ? 200 : 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PATCH project error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;

    if (!supabase) {
      mockDb.deleteProject(projectId);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.warn("Supabase delete project error, using mockDb:", error);
      mockDb.deleteProject(projectId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE project error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
