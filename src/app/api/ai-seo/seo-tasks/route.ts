import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../mockDb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

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

    // Map database snake_case properties to frontend camelCase formats
    const mapped = data.map((item) => ({
      id: item.id,
      projectId: item.project_id,
      title: item.title,
      description: item.description,
      importance: item.importance,
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error("GET tasks error:", err);
    return NextResponse.json([]);
  }
}
