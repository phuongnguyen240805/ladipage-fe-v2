import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../../mockDb";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ seoProjectId: string }> }
) {
  try {
    const { seoProjectId } = await props.params;

    if (!supabase) {
      const details = mockDb.getSeoProjectDetails(seoProjectId);
      if (details && details.installation) {
        return NextResponse.json(details.installation);
      }
      return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    }

    const { data: installation, error } = await supabase
      .from("seo_project_installations")
      .select("*")
      .eq("seo_project_id", seoProjectId)
      .single();

    if (error || !installation) {
      const details = mockDb.getSeoProjectDetails(seoProjectId);
      if (details && details.installation) {
        return NextResponse.json(details.installation);
      }
      return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    }

    return NextResponse.json(installation);
  } catch (err: any) {
    console.error("GET installation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
