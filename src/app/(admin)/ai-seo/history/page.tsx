"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, MessageSquare, Trash2, ArrowRight, ArrowLeft, Bot, Calendar, Search } from "lucide-react";
import { useAiSeoStore } from "@/features/ai-seo/hooks/useAiSeoStore";

export default function AiSeoHistoryPage() {
  const router = useRouter();
  const {
    conversations,
    fetchConversations,
    deleteConversation,
    isLoadingConversations
  } = useAiSeoStore();

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) {
      await deleteConversation(id);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.agent?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 dark:border-gray-800 pb-5">
        <div className="space-y-1">
          <Link
            href="/ai-seo"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại Agent Hub
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-500" />
            Lịch sử Hội thoại & Chạy Agent
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Xem lại, quản lý và tiếp tục các cuộc hội thoại tối ưu hóa SEO trong quá khứ.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm lịch sử..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 transition shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-[#1e1e2d] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm">Đang tải lịch sử...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <History className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto" />
            <div className="space-y-1.5">
              <h3 className="font-bold text-gray-800 dark:text-white">
                Không tìm thấy hội thoại nào
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                Chưa có cuộc hội thoại nào phù hợp với từ khóa của bạn hoặc chưa có hội thoại được khởi tạo.
              </p>
            </div>
            <Link
              href="/ai-seo/chat"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Tạo cuộc trò chuyện mới
            </Link>
          </div>
        ) : (
          /* History Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider">
                  <th className="p-4 pl-6">Phiên hội thoại</th>
                  <th className="p-4">AI Agent</th>
                  <th className="p-4">Ngày cập nhật</th>
                  <th className="p-4 text-right pr-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredConversations.map((convo) => (
                  <tr
                    key={convo.id}
                    onClick={() => router.push(`/ai-seo/chat?convoId=${convo.id}`)}
                    className="hover:bg-gray-50/55 dark:hover:bg-gray-900/30 cursor-pointer group transition duration-150"
                  >
                    {/* Title */}
                    <td className="p-4 pl-6 font-semibold text-gray-800 dark:text-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="text-xl shrink-0">
                          {convo.agent?.avatar || "🤖"}
                        </span>
                        <div className="min-w-0 max-w-md">
                          <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {convo.title}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            ID: {convo.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Agent name */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-semibold bg-gray-100 dark:bg-gray-900 px-2.5 py-1 rounded-lg w-fit border border-gray-150 dark:border-gray-850">
                        <Bot className="w-3.5 h-3.5 text-blue-500" />
                        {convo.agent?.name || "General Agent"}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(convo.updatedAt).toLocaleString([], {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={(e) => handleDelete(convo.id, e)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 dark:text-gray-500 dark:hover:text-red-400 transition"
                          title="Xóa cuộc hội thoại"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/ai-seo/chat?convoId=${convo.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-950/70 transition"
                        >
                          Tiếp tục
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
