"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, ArrowLeft, Bot, Sparkles, ArrowRight, Play, Terminal } from "lucide-react";
import { useAiSeoStore } from "@/features/ai-seo/hooks/useAiSeoStore";

export default function AiSeoPlaybooksPage() {
  const router = useRouter();
  const { createConversation } = useAiSeoStore();

  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "Tất cả" },
    { id: "audit", name: "Kiểm toán kỹ thuật" },
    { id: "content", name: "Chiến lược nội dung" },
    { id: "authority", name: "Độ uy tín tên miền" },
    { id: "keywords", name: "Nghiên cứu từ khóa" },
    { id: "competitors", name: "Phân tích đối thủ" },
  ];

  const playbooks = [
    {
      id: "meta-audit",
      name: "Kiểm tra cấu trúc Meta Tags",
      description: "Quét thẻ Title, Meta Description và cấu trúc Heading của trang chủ để tìm lỗi hiển thị trên SERP.",
      category: "audit",
      agentId: "seo-audit",
      agentName: "SEO Audit Agent",
      agentAvatar: "🔍",
      prompt: "Kiểm tra cấu trúc và nội dung các thẻ title, description của domain sau đây và đề xuất cải thiện: https://mywebsite.com",
    },
    {
      id: "technical-health",
      name: "Kiểm tra kỹ thuật crawl & sitemap",
      description: "Phân tích file robots.txt, sơ đồ sitemap.xml và cấu trúc URL để tìm các lỗi ngăn chặn bot tìm kiếm index.",
      category: "audit",
      agentId: "seo-audit",
      agentName: "SEO Audit Agent",
      agentAvatar: "🔍",
      prompt: "Phân tích file robots.txt, sitemap.xml và cấu trúc URL của website để phát hiện lỗi thu thập thông tin.",
    },
    {
      id: "content-plan",
      name: "Kế hoạch nội dung SEO 30 ngày",
      description: "Lên kế hoạch phát triển 12 chủ đề bài viết lớn bao gồm phân bổ từ khóa chính/phụ và lịch xuất bản chi tiết.",
      category: "content",
      agentId: "content-strategy",
      agentName: "Content Strategy Agent",
      agentAvatar: "✍️",
      prompt: "Lập kế hoạch nội dung 30 ngày cho một trang web trong lĩnh vực: Thiết kế Landing Page doanh nghiệp",
    },
    {
      id: "article-outline",
      name: "Tạo dàn ý bài viết chuẩn SEO",
      description: "Thiết lập cấu trúc Heading (H1-H3), phân bổ từ khóa phụ và hướng dẫn CTA tối ưu tỷ lệ chuyển đổi.",
      category: "content",
      agentId: "content-strategy",
      agentName: "Content Strategy Agent",
      agentAvatar: "✍️",
      prompt: "Tạo dàn ý bài viết chuẩn SEO (gồm H1, H2, H3) và danh sách từ khóa phụ cho chủ đề: 'Top 5 công cụ tạo Landing Page SaaS tốt nhất 2026'",
    },
    {
      id: "topic-map",
      name: "Thiết lập Topic Cluster Map",
      description: "Xây dựng sơ đồ trang trụ cột (Pillar) và các bài viết phụ (Cluster) liên kết chéo thông minh nhằm phủ chủ đề.",
      category: "authority",
      agentId: "topical-authority",
      agentName: "Topical Authority Agent",
      agentAvatar: "🕸️",
      prompt: "Xây dựng bản đồ chủ đề (Topical Map) toàn diện để bao phủ hoàn toàn chủ đề: 'Tối ưu hóa Conversion Rate (CRO) cho Landing Page'",
    },
    {
      id: "keyword-discovery",
      name: "Tìm kiếm từ khóa ngách KD thấp",
      description: "Tra cứu hệ thống dữ liệu để tìm ra các từ khóa có Keyword Difficulty cực thấp nhưng có Search Volume ổn định.",
      category: "keywords",
      agentId: "keyword-research",
      agentName: "Keyword Research Agent",
      agentAvatar: "📊",
      prompt: "Tìm kiếm 20 từ khóa ngách có độ khó thấp (KD < 30) và volume cao trong ngành: 'dịch vụ thiết kế ladi page bán hàng'",
    },
    {
      id: "keyword-gap",
      name: "Phân tích khoảng trống Từ khóa đối thủ",
      description: "Spies đối thủ cạnh tranh để tìm các từ khóa họ đang xếp hạng tốt ở trang nhất nhưng website của bạn chưa phủ.",
      category: "competitors",
      agentId: "competitor-analysis",
      agentName: "Competitor Analysis Agent",
      agentAvatar: "⚔️",
      prompt: "Đề xuất chiến lược khai thác các từ khóa mà đối thủ cạnh tranh (competitor-seo.com) đang xếp hạng trang nhất nhưng trang của tôi chưa có.",
    }
  ];

  const handleLaunchPlaybook = async (agentId: string, promptText: string) => {
    // Create new conversation
    const convo = await createConversation(agentId, `Chạy Playbook: ${promptText.slice(0, 30)}...`);
    if (convo) {
      // Direct to chat with the pre-filled prompt submitted!
      // To auto-submit, we can set a short timeout in the chat page or pass a prompt query parameter.
      // We will pass the prompt parameter so the Chat page can immediately trigger sendMessage!
      router.push(`/ai-seo/chat?convoId=${convo.id}&prompt=${encodeURIComponent(promptText)}`);
    }
  };

  const filteredPlaybooks = activeCategory === "all"
    ? playbooks
    : playbooks.filter(p => p.category === activeCategory);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b border-gray-150 dark:border-gray-800 pb-5">
        <Link
          href="/ai-seo"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Agent Hub
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500" />
          Thư viện SEO Playbooks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Các kịch bản tự động hóa quy trình SEO được thiết lập sẵn. Chọn một playbook để thực hiện trực tiếp trên AI Agent tương ứng.
        </p>
      </div>

      {/* Category Pills Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition border ${
              activeCategory === cat.id
                ? "bg-blue-600 border-blue-700 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-950"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlaybooks.map((playbook) => (
          <div
            key={playbook.id}
            className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 hover:border-blue-400/50 dark:hover:border-blue-900/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200 group relative"
          >
            <div className="space-y-3">
              {/* Playbook Header */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 uppercase tracking-wider">
                  {playbook.category}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 dark:text-gray-450">
                  <span>{playbook.agentAvatar}</span>
                  <span>{playbook.agentName}</span>
                </div>
              </div>

              {/* Title and prompt details */}
              <div>
                <h3 className="text-base font-extrabold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {playbook.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
                  {playbook.description}
                </p>
              </div>

              {/* Prompt box */}
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-850 flex items-start gap-2">
                <Terminal className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <p className="text-[11px] font-mono text-gray-600 dark:text-gray-400 line-clamp-2">
                  {playbook.prompt}
                </p>
              </div>
            </div>

            {/* Launch trigger */}
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-end">
              <button
                onClick={() => handleLaunchPlaybook(playbook.agentId, playbook.prompt)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:hover:bg-blue-950/60 transition shadow-sm"
              >
                <Play className="w-3 h-3 fill-current" />
                Chạy Playbook
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
