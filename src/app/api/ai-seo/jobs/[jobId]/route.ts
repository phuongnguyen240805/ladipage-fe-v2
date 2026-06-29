import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await props.params;

    if (!supabase) {
      const job = mockDb.getJob(jobId);
      return NextResponse.json(job || { error: "Job not found" }, { status: job ? 200 : 404 });
    }

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (error) {
      console.warn("Supabase fetch job error, using mockDb:", error);
      const job = mockDb.getJob(jobId);
      return NextResponse.json(job || { error: "Job not found" }, { status: job ? 200 : 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET job error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
