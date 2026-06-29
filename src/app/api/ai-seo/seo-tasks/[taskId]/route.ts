import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../mockDb";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await props.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Missing status parameter" }, { status: 400 });
    }

    if (!supabase) {
      const updated = mockDb.updateSeoTask(taskId, status);
      return NextResponse.json(updated || { error: "Task not found" }, { status: updated ? 200 : 404 });
    }

    const { data, error } = await supabase
      .from("seo_tasks")
      .update({ status, updated_at: new Date() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.warn("Supabase patch task error, using mockDb:", error);
      const updated = mockDb.updateSeoTask(taskId, status);
      return NextResponse.json(updated || { error: "Task not found" }, { status: updated ? 200 : 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PATCH task status error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
