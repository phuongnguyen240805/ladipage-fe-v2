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

    // Fetch parent project context
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
      return NextResponse.json([]);
    }

    const projectId = (seoProj as any).projectId || (seoProj as any).project_id;

    if (!supabase) {
      return NextResponse.json(mockDb.getSeoTasks(projectId));
    }

    const { data, error } = await supabase
      .from("seo_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch tasks error, using mockDb:", error);
      return NextResponse.json(mockDb.getSeoTasks(projectId));
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET tasks error:", err);
    return NextResponse.json([]);
  }
}
