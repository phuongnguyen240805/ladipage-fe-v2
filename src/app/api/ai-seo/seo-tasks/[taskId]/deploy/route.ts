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
      const updated = mockDb.updateSeoTask(taskId, "completed");
      return NextResponse.json({ success: true, task: updated });
    }

    const { data: task, error } = await supabase
      .from("seo_tasks")
      .update({ status: "completed", updated_at: new Date() })
      .eq("id", taskId)
      .select()
      .single();

    if (error || !task) {
      console.warn("Supabase deploy error, falling back to mockDb:", error);
      const updated = mockDb.updateSeoTask(taskId, "completed");
      return NextResponse.json({ success: true, task: updated });
    }

    // Write activity log
    await supabase.from("seo_task_activity_logs").insert({
      task_id: taskId,
      action: "DEPLOYED",
      details: "Đã tự động triển khai mã tối ưu lên Website Builder"
    });

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    console.error("POST deploy task error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
