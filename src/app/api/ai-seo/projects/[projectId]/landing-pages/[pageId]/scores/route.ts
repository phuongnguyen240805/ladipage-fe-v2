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
      const scores = mockDb.getAiSeoPageScores(pageId);
      return NextResponse.json(scores);
    }

    const { data, error } = await supabase
      .from("ai_seo_page_scores")
      .select("*")
      .eq("ai_seo_project_page_id", pageId)
      .maybeSingle();

    if (error) {
      console.warn("Supabase query page scores error, using mockDb:", error);
      const scores = mockDb.getAiSeoPageScores(pageId);
      return NextResponse.json(scores);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET page scores error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
  }
}
