import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";

    if (!supabase) {
      const job = mockDb.createJob(orgId, projectId, "SEO Site Audit Scan");
      mockDb.simulateProjectScan(projectId, job.id);
      return NextResponse.json({ jobId: job.id, status: job.status });
    }

    // Verify project exists
    const { data: project, error: pError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .single();

    if (pError || !project) {
      console.warn("Project not found in Supabase, falling back to mockDb");
      const job = mockDb.createJob(orgId, projectId, "SEO Site Audit Scan");
      mockDb.simulateProjectScan(projectId, job.id);
      return NextResponse.json({ jobId: job.id, status: job.status });
    }

    // Create a job in Supabase
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        organization_id: orgId,
        project_id: projectId,
        type: "site_audit",
        status: "queued",
        progress: 0,
        message: "Khởi tạo tiến trình quét sitemap..."
      })
      .select()
      .single();

    if (jobError || !job) {
      console.warn("Supabase create job error, using mockDb:", jobError);
      const jobMock = mockDb.createJob(orgId, projectId, "SEO Site Audit Scan");
      mockDb.simulateProjectScan(projectId, jobMock.id);
      return NextResponse.json({ jobId: jobMock.id, status: jobMock.status });
    }

    // Start background simulation asynchronously
    simulateDbJobExecution(job.id, projectId);

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (err: any) {
    console.error("POST scan error:", err);
    // DNS/network failures to Supabase pooler (EAI_AGAIN) → mock so local UI is not blocked
    try {
      const { projectId } = await props.params;
      const orgId = request.headers.get("x-org-id") || "org-1";
      const job = mockDb.createJob(orgId, projectId, "SEO Site Audit Scan");
      mockDb.simulateProjectScan(projectId, job.id);
      return NextResponse.json({ jobId: job.id, status: job.status });
    } catch {
      const message =
        err?.message?.includes("EAI_AGAIN") || err?.message?.includes("getaddrinfo")
          ? "Cannot reach Supabase (DNS). Use NEXT_PUBLIC_AI_SEO_USE_NEST=true with local Nest DB, or fix network/DNS to pooler.supabase.com."
          : err?.message || "Internal Server Error";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}

// Background simulation for Supabase
async function simulateDbJobExecution(jobId: string, projectId: string) {
  try {
    if (!supabase) return;
    
    // 1. Transition to running
    await new Promise(resolve => setTimeout(resolve, 2000));
    await supabase.from("jobs").update({ status: "running", progress: 30, message: "Đang phân tích cấu trúc URL..." }).eq("id", jobId);
    await supabase.from("job_events").insert({ job_id: jobId, event_type: "info", message: "Bắt đầu crawler bot quét robots.txt và sitemap.xml..." });

    // 2. Log progress
    await new Promise(resolve => setTimeout(resolve, 3000));
    await supabase.from("jobs").update({ progress: 65, message: "Đang chấm điểm Technical và Core Web Vitals..." }).eq("id", jobId);
    await supabase.from("job_events").insert({ job_id: jobId, event_type: "info", message: "Đã phân tích 45 trang. Đang đo lường tốc độ tải trang LCP/FID..." });

    // 3. Finalize and update project details
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const { data: aiProj } = await supabase.from("ai_seo_projects").select("id").eq("project_id", projectId).single();
    if (aiProj) {
      await supabase.from("ai_seo_projects").update({
        ready_for_processing: true,
        is_first_processing: false,
        task_status: "completed",
        last_analysis: new Date().toISOString(),
        next_analysis_at: new Date(Date.now() + 7 * 86400000).toISOString(),
        time_saved_total: 15
      }).eq("id", aiProj.id);

      // Upsert score cards
      await supabase.from("ai_seo_project_scores").upsert({
        ai_seo_project_id: aiProj.id,
        healthy_pages: 43,
        total_pages: 45,
        ai_grade_overall: 82,
        technicals_score: 85,
        ux_score: 80,
        authority_score: 75,
        content_score: 88,
        updated_at: new Date().toISOString()
      }, { onConflict: "ai_seo_project_id" });
    }

    await supabase.from("jobs").update({ status: "success", progress: 100, message: "Hoàn tất kiểm toán thành công!" }).eq("id", jobId);
    await supabase.from("job_events").insert({ job_id: jobId, event_type: "info", message: "Quá trình quét kết thúc! Kết quả điểm số đã được đồng bộ lên Dashboard." });

  } catch (e) {
    console.error("Job simulation error:", e);
  }
}
