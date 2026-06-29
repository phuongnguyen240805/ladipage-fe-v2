import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await props.params;

    if (!supabase) {
      return NextResponse.json(mockDb.getToolCallsForRun(runId));
    }

    const { data, error } = await supabase
      .from("ai_tool_calls")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetch tool calls error, using mockDb:", error);
      return NextResponse.json(mockDb.getToolCallsForRun(runId));
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET tool calls error:", err);
    try {
      const { runId } = await props.params;
      return NextResponse.json(mockDb.getToolCallsForRun(runId));
    } catch {
      return NextResponse.json([]);
    }
  }
}
