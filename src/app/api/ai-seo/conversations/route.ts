import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../mockDb";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(mockDb.getConversations());
    }

    const { data, error } = await supabase
      .from("ai_conversations")
      .select(`
        *,
        agent:ai_agents(*)
      `)
      .order("updated_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error, falling back to mockDb:", error);
      return NextResponse.json(mockDb.getConversations());
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("GET conversations error:", err);
    return NextResponse.json(mockDb.getConversations());
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, title, userId } = body;

    if (!agentId) {
      return NextResponse.json({ error: "Missing agentId parameter" }, { status: 400 });
    }

    if (!supabase) {
      const convo = mockDb.createConversation(agentId, title, userId);
      // Attach agent info for consistency
      const agentList = [
        { id: "chat-assistant", name: "AI Chat Assistant", role: "Trợ lý SEO đa năng", avatar: "🤖" },
        { id: "seo-audit", name: "SEO Audit Agent", role: "Chuyên gia kiểm toán kỹ thuật", avatar: "🔍" },
        { id: "content-strategy", name: "Content Strategy Agent", role: "Kiến trúc sư nội dung", avatar: "✍️" },
        { id: "topical-authority", name: "Topical Authority Agent", role: "Chuyên gia phủ chủ đề & liên kết", avatar: "🕸️" },
        { id: "keyword-research", name: "Keyword Research Agent", role: "Nhà nghiên cứu từ khóa", avatar: "📊" },
        { id: "competitor-analysis", name: "Competitor Analysis Agent", role: "Chuyên gia phân tích đối thủ", avatar: "⚔️" }
      ];
      const agent = agentList.find(a => a.id === agentId) || agentList[0];
      return NextResponse.json({ ...convo, agent });
    }

    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        agent_id: agentId,
        title: title || "Cuộc hội thoại mới",
        user_id: userId || null
      })
      .select(`
        *,
        agent:ai_agents(*)
      `)
      .single();

    if (error) {
      console.warn("Supabase insert error, falling back to mockDb:", error);
      const convo = mockDb.createConversation(agentId, title, userId);
      return NextResponse.json(convo);
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("POST conversations error:", err);
    // Safe fallback
    try {
      const body = await request.clone().json().catch(() => ({}));
      const convo = mockDb.createConversation(body.agentId || "chat-assistant", body.title, body.userId);
      return NextResponse.json(convo);
    } catch {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
}
