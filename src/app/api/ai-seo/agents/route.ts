import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

const FALLBACK_AGENTS = [
  {
    id: "chat-assistant",
    name: "AI Chat Assistant",
    role: "Trợ lý SEO đa năng",
    description: "Hỗ trợ giải đáp các câu hỏi về SEO, phân tích sơ bộ và tư vấn chiến lược nội dung, kỹ thuật tổng quan.",
    avatar: "🤖",
    playbooks: [
      { id: "seo-intro", name: "Giải thích chuẩn SEO", prompt: "Hãy giải thích thế nào là cấu trúc website chuẩn SEO và các bước tối ưu hóa ban đầu." },
      { id: "seo-check-list", name: "Checklist tối ưu SEO Onpage", prompt: "Cung cấp cho tôi một checklist chi tiết 15 điểm tối ưu SEO Onpage cho bài đăng mới." }
    ]
  },
  {
    id: "seo-audit",
    name: "SEO Audit Agent",
    role: "Chuyên gia kiểm toán kỹ thuật website",
    description: "Phân tích cấu trúc website, thẻ meta, sơ đồ trang web, tốc độ tải trang và các lỗi kỹ thuật chuẩn SEO.",
    avatar: "🔍",
    playbooks: [
      { id: "meta-audit", name: "Kiểm tra Meta Tags", prompt: "Kiểm tra cấu trúc và nội dung các thẻ title, description của domain sau đây và đề xuất cải thiện: " },
      { id: "technical-health", name: "Kiểm tra kỹ thuật website", prompt: "Phân tích file robots.txt, sitemap.xml và cấu trúc URL của website để phát hiện lỗi thu thập thông tin." }
    ]
  },
  {
    id: "content-strategy",
    name: "Content Strategy Agent",
    role: "Kiến trúc sư nội dung",
    description: "Lập kế hoạch phát triển nội dung, tối ưu hóa outline bài viết, phân bổ từ khóa tự nhiên và gia tăng tỷ lệ chuyển đổi.",
    avatar: "✍️",
    playbooks: [
      { id: "content-plan", name: "Kế hoạch nội dung 30 ngày", prompt: "Lập kế hoạch nội dung 30 ngày cho một trang web trong lĩnh vực: " },
      { id: "article-outline", name: "Dàn ý bài viết chuẩn SEO", prompt: "Tạo dàn ý bài viết chuẩn SEO (gồm H1, H2, H3) và danh sách từ khóa phụ cho chủ đề: " }
    ]
  },
  {
    id: "topical-authority",
    name: "Topical Authority Agent",
    role: "Chuyên gia phủ chủ đề & liên kết",
    description: "Xây dựng bản đồ chủ đề (Topic Map), cấu trúc Silo, liên kết nội bộ thông minh và gia tăng độ uy tín tên miền (Authority) trên Google.",
    avatar: "🕸️",
    playbooks: [
      { id: "topic-map", name: "Thiết lập Topic Map", prompt: "Xây dựng bản đồ chủ đề (Topical Map) toàn diện để bao phủ hoàn toàn chủ đề: " },
      { id: "silo-structure", name: "Cấu trúc Silo liên kết", prompt: "Thiết kế cấu trúc liên kết nội bộ Silo cho cụm chủ đề cốt lõi."}
    ]
  },
  {
    id: "keyword-research",
    name: "Keyword Research Agent",
    role: "Nhà nghiên cứu từ khóa",
    description: "Tìm kiếm từ khóa tiềm năng, phân tích khối lượng tìm kiếm (volume), độ khó từ khóa (KD) và ý định tìm kiếm (search intent).",
    avatar: "📊",
    playbooks: [
      { id: "keyword-discovery", name: "Tìm kiếm từ khóa ngách", prompt: "Tìm kiếm 20 từ khóa ngách có độ khó thấp (KD < 30) và volume cao trong ngành: " },
      { id: "intent-mapping", name: "Phân loại Search Intent", prompt: "Phân loại ý định tìm kiếm (Informational, Transactional, Navigational) cho danh sách từ khóa sau: " }
    ]
  },
  {
    id: "competitor-analysis",
    name: "Competitor Analysis Agent",
    role: "Chuyên gia phân tích đối thủ",
    description: "Phân tích backlink, từ khóa xếp hạng cao, chiến lược SEO của đối thủ cạnh tranh và tìm kiếm khoảng trống cơ hội (gap-analysis).",
    avatar: "⚔️",
    playbooks: [
      { id: "backlink-gap", name: "Phân tích khoảng trống Backlink", prompt: "Làm thế nào để phân tích khoảng trống backlink giữa website của tôi và 3 đối thủ lớn nhất?" },
      { id: "keyword-gap", name: "Phân tích khoảng trống Từ khóa", prompt: "Đề xuất chiến lược khai thác các từ khóa mà đối thủ đang xếp hạng trang nhất nhưng trang của tôi chưa có." }
    ]
  }
];

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(FALLBACK_AGENTS);
    }
    const { data, error } = await supabase
      .from("ai_agents")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Using fallback agents due to DB error or empty table:", error);
      return NextResponse.json(FALLBACK_AGENTS);
    }
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Agents fetch error:", err);
    return NextResponse.json(FALLBACK_AGENTS);
  }
}
