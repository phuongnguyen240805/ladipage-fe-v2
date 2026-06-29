import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { pageId } = await props.params;

    if (!supabase) {
      const tasks = mockDb.getAiSeoPageTasks(pageId);
      return NextResponse.json(tasks);
    }

    const { data, error } = await supabase
      .from("ai_seo_page_tasks")
      .select("*")
      .eq("ai_seo_project_page_id", pageId);

    if (error) {
      console.warn("Supabase query page tasks error, using mockDb:", error);
      const tasks = mockDb.getAiSeoPageTasks(pageId);
      return NextResponse.json(tasks);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET page tasks error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
  }
}
