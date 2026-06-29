import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { mockDb } from "../../mockDb";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    if (!supabase) {
      mockDb.deleteConversation(id);
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.warn("Supabase delete error, falling back to mockDb:", error);
      mockDb.deleteConversation(id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("DELETE conversation error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Missing title parameter" }, { status: 400 });
    }

    if (!supabase) {
      const convo = mockDb.renameConversation(id, title);
      return NextResponse.json(convo || { error: "Conversation not found" }, { status: convo ? 200 : 404 });
    }

    const { data, error } = await supabase
      .from("ai_conversations")
      .update({ title, updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.warn("Supabase rename error, falling back to mockDb:", error);
      const convo = mockDb.renameConversation(id, title);
      return NextResponse.json(convo || { error: "Conversation not found" }, { status: convo ? 200 : 404 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("PUT conversation rename error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
