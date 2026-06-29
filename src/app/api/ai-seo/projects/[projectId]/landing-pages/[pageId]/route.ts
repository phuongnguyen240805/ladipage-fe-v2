import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../mockDb";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const { projectId, pageId } = await props.params;

    if (!supabase) {
      const success = mockDb.unlinkLandingPage(projectId, pageId);
      return NextResponse.json({ success });
    }

    // Delete from Supabase. Foreign keys ON DELETE CASCADE will handle scores and tasks
    const { error } = await supabase
      .from("ai_seo_project_pages")
      .delete()
      .eq("id", pageId);

    if (error) {
      console.warn("Supabase delete project page error, using mockDb:", error);
      const success = mockDb.unlinkLandingPage(projectId, pageId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE landing-page error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 550 });
  }
}
