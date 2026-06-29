import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await props.params;

    if (!supabase) {
      return NextResponse.json(mockDb.getJobEvents(jobId));
    }

    const { data, error } = await supabase
      .from("job_events")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Supabase fetch job events error, using mockDb:", error);
      return NextResponse.json(mockDb.getJobEvents(jobId));
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET job events error:", err);
    return NextResponse.json([]);
  }
}
