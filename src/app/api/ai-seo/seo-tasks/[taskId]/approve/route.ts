import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await props.params;

    if (!supabase) {
      const updated = mockDb.updateSeoTask(taskId, "in_progress");
      return NextResponse.json({ success: true, task: updated });
    }

    const { data: task, error } = await supabase
      .from("seo_tasks")
      .update({ status: "in_progress", updated_at: new Date() })
      .eq("id", taskId)
      .select()
      .single();

    if (error || !task) {
      console.warn("Supabase approve error, falling back to mockDb:", error);
      const updated = mockDb.updateSeoTask(taskId, "in_progress");
      return NextResponse.json({ success: true, task: updated });
    }

    // Write activity log
    await supabase.from("seo_task_activity_logs").insert({
      task_id: taskId,
      action: "APPROVED",
      details: "Đã phê duyệt đề xuất tối ưu hóa"
    });

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    console.error("POST approve task error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
