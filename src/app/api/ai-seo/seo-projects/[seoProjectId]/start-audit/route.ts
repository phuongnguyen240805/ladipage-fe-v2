import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ seoProjectId: string }> }
) {
  try {
    const { seoProjectId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";

    // 1. Fetch parent project context
    let seoProj;
    if (!supabase) {
      seoProj = mockDb.seoProjects.find(sp => sp.id === seoProjectId);
    } else {
      const { data } = await supabase
        .from("seo_projects")
        .select("*")
        .eq("id", seoProjectId)
        .single();
      seoProj = data || mockDb.seoProjects.find(sp => sp.id === seoProjectId);
    }

    if (!seoProj) {
      return NextResponse.json({ error: "SEO Project not found" }, { status: 404 });
    }

    const projectId = (seoProj as any).projectId || (seoProj as any).project_id;

    // 2. Create Job
    let job;
    if (!supabase) {
      job = mockDb.createJob(orgId, projectId, `Audit quét kỹ thuật: ${seoProj.domain}`);
      // Simulate background execution
      mockDb.simulateJobExecution(job.id, projectId);
    } else {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          organization_id: orgId,
          project_id: projectId,
          name: `Audit quét kỹ thuật: ${seoProj.domain}`,
          status: "queued"
        })
        .select()
        .single();
      
      if (error || !data) {
        console.warn("Supabase insert job failed, falling back to mockDb:", error);
        job = mockDb.createJob(orgId, projectId, `Audit quét kỹ thuật: ${seoProj.domain}`);
        mockDb.simulateJobExecution(job.id, projectId);
      } else {
        job = data;
        // In production, trigger a background task (e.g. trigger BullMQ worker or insert queue job).
        // For development, we trigger the mock simulation in the background too:
        mockDb.simulateJobExecution(job.id, projectId);
      }
    }

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (err: any) {
    console.error("POST start-audit error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
