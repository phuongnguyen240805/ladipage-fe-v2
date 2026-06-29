import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../mockDb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId") || "";

    if (!projectId) {
      return NextResponse.redirect(new URL("/ai-seo?error=missing_project_id", request.url));
    }

    if (!supabase) {
      // Mock db integration update
      const ap = mockDb.aiSeoProjects.find(p => p.id === projectId || p.projectId === projectId);
      if (ap) {
        ap.connectedData.isGscConnected = true;
        ap.connectedData.gscDetails = { property: `sc-domain:${ap.hostname}` };
      }
    } else {
      // Supabase integration update
      const { data: aiProj } = await supabase
        .from("ai_seo_projects")
        .select("id, hostname")
        .or(`id.eq.${projectId},project_id.eq.${projectId}`)
        .single();

      if (aiProj) {
        await supabase
          .from("ai_seo_project_integrations")
          .upsert({
            ai_seo_project_id: aiProj.id,
            is_gsc_connected: true,
            gsc_details: { property: `sc-domain:${aiProj.hostname}` },
            updated_at: new Date().toISOString()
          }, { onConflict: "ai_seo_project_id" });
      }
    }

    return NextResponse.redirect(new URL(`/ai-seo?success=gsc_connected&projectId=${projectId}`, request.url));
  } catch (err: any) {
    console.error("GSC callback error:", err);
    return NextResponse.redirect(new URL("/ai-seo?error=gsc_failed", request.url));
  }
}
