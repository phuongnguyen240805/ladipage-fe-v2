import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../../mockDb";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { projectId, pageId } = await props.params;
    const orgId = request.headers.get("x-org-id") || "org-1";

    if (!supabase) {
      const job = mockDb.createJob(orgId, projectId, "SEO Page Audit Scan");
      mockDb.simulatePageScan(projectId, pageId, job.id);
      return NextResponse.json({ jobId: job.id, status: job.status });
    }

    // Create a job in Supabase
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        organization_id: orgId,
        project_id: projectId,
        type: "page_audit",
        status: "queued",
        progress: 0,
        message: "Khởi tạo tiến trình quét trang con..."
      })
      .select()
      .single();

    if (jobError || !job) {
      console.warn("Supabase create job error, using mockDb:", jobError);
      const jobMock = mockDb.createJob(orgId, projectId, "SEO Page Audit Scan");
      mockDb.simulatePageScan(projectId, pageId, jobMock.id);
      return NextResponse.json({ jobId: jobMock.id, status: jobMock.status });
    }

    // Set page scan status to scanning and link the last scan job ID
    await supabase
      .from("ai_seo_project_pages")
      .update({
        scan_status: "scanning",
        last_scan_job_id: job.id
      })
      .eq("id", pageId);

    // Start background simulation asynchronously
    simulateDbPageScanExecution(job.id, projectId, pageId, orgId);

    return NextResponse.json({ jobId: job.id, status: job.status });
  } catch (err: any) {
    console.error("POST scan page error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function simulateDbPageScanExecution(jobId: string, projectId: string, pageId: string, orgId: string) {
  try {
    if (!supabase) return;
    
    // 1. Transition to running
    await new Promise(resolve => setTimeout(resolve, 1500));
    await supabase.from("jobs").update({ status: "running", progress: 40, message: "Đang kiểm tra thẻ heading và ảnh..." }).eq("id", jobId);
    await supabase.from("job_events").insert({ job_id: jobId, event_type: "info", message: "Đang chấm điểm tối ưu hóa thẻ heading và alt text cho hình ảnh..." });

    // 2. Finalize and update scores
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await supabase.from("ai_seo_project_pages").update({
      scan_status: "completed",
      last_scanned_at: new Date().toISOString()
    }).eq("id", pageId);

    // Upsert scores
    const graderScore = Math.floor(Math.random() * 20) + 75;
    const contentScore = Math.floor(Math.random() * 30) + 65;
    const technicalScore = Math.floor(Math.random() * 20) + 80;
    const uxScore = Math.floor(Math.random() * 20) + 75;
    const authorityScore = Math.floor(Math.random() * 30) + 55;

    await supabase.from("ai_seo_page_scores").upsert({
      organization_id: orgId,
      ai_seo_project_page_id: pageId,
      grader_score: graderScore,
      content_score: contentScore,
      technical_score: technicalScore,
      ux_score: uxScore,
      authority_score: authorityScore,
      updated_at: new Date().toISOString()
    }, { onConflict: "ai_seo_project_page_id" });

    // Clear old page tasks and create 1-2 new tasks
    await supabase.from("ai_seo_page_tasks").delete().eq("ai_seo_project_page_id", pageId);
    await supabase.from("ai_seo_page_tasks").insert({
      organization_id: orgId,
      ai_seo_project_page_id: pageId,
      ai_seo_project_id: projectId,
      title: "Cải thiện mật độ từ khóa chính",
      description: "Mật độ từ khóa chính hiện tại chỉ đạt 0.3%. Khuyên dùng 1% - 1.5% cho tối ưu hóa on-page.",
      category: "content",
      priority: "medium",
      status: "todo",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    await supabase.from("jobs").update({ status: "success", progress: 100, message: "Hoàn tất kiểm toán trang con!" }).eq("id", jobId);
    await supabase.from("job_events").insert({ job_id: jobId, event_type: "info", message: "Quá trình quét trang con kết thúc! Kết quả điểm số đã sẵn sàng." });

  } catch (e) {
    console.error("Page scan job simulation error:", e);
  }
}
