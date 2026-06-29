import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../../mockDb";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ seoProjectId: string }> }
) {
  try {
    const { seoProjectId } = await props.params;

    if (!supabase) {
      mockDb.updateInstallationStatus(seoProjectId, "checking");
      
      // Simulate verification delay
      setTimeout(() => {
        mockDb.updateInstallationStatus(seoProjectId, "installed");
      }, 1500);

      return NextResponse.json({ status: "checking" });
    }

    // 1. Transition status to checking
    const { error: checkError } = await supabase!.from("seo_project_installations")
      .update({ status: "checking" })
      .eq("seo_project_id", seoProjectId);

    if (checkError) {
      throw new Error(`Failed to update status to checking: ${checkError.message}`);
    }

    // 2. Perform check (simulated async check in development)
    setTimeout(async () => {
      try {
        await supabase!
          .from("seo_project_installations")
          .update({ status: "installed" })
          .eq("seo_project_id", seoProjectId);
      } catch (err) {
        console.error("Async installation update failed:", err);
      }
    }, 1500);

    return NextResponse.json({ status: "checking" });
  } catch (err: any) {
    console.error("POST check installation error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
