import React, { useState } from "react";
import { Conversation } from "../types";
import { MessageSquare, Trash2, Edit2, Check, X, Search, Plus } from "lucide-react";
import { useAiSeoStore } from "../hooks/useAiSeoStore";

interface ConversationHistoryProps {
  onNewChat?: () => void;
}

export function ConversationHistory({ onNewChat }: ConversationHistoryProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    deleteConversation,
    renameConversation,
    isLoadingConversations
  } = useAiSeoStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) {
      await deleteConversation(id);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header and New Chat Trigger */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            Lịch sử Hội thoại
          </h2>
          {onNewChat && (
            <button
              onClick={onNewChat}
              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-950/70 dark:text-blue-400 transition"
              title="Tạo cuộc hội thoại mới"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-700 dark:text-gray-300 transition"
          />
        </div>
      </div>

      {/* History Items List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {isLoadingConversations && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
            <span className="text-xs">Đang tải lịch sử...</span>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400 dark:text-gray-600">
            Không có cuộc hội thoại nào
          </div>
        ) : (
          filteredConversations.map((convo) => {
            const isActive = activeConversationId === convo.id;
            const isEditing = editingId === convo.id;

            return (
              <div
                key={convo.id}
                onClick={() => !isEditing && setActiveConversationId(convo.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left cursor-pointer transition group border ${
                  isActive
                    ? "bg-blue-50/70 border-blue-100 dark:bg-blue-950/20 dark:border-blue-950/40 text-blue-700 dark:text-blue-400"
                    : "border-transparent hover:bg-gray-50 dark:hover:bg-gray-900/60 text-gray-700 dark:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-lg shrink-0">
                    {convo.agent?.avatar || "🤖"}
                  </span>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5 text-sm focus:outline-none text-gray-800 dark:text-white"
                      autoFocus
                    />
                  ) : (
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">
                        {convo.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                        {convo.agent?.name || "AI Agent"} • {new Date(convo.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2 shrink-0">
                  {isEditing ? (
                    <>
                      <button
                        onClick={(e) => handleSaveRename(convo.id, e)}
                        className="p-1 rounded text-green-600 hover:bg-green-50 dark:hover:bg-green-950/40 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleCancelRename}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={(e) => handleStartRename(convo.id, convo.title, e)}
                        className="p-1 rounded hover:bg-gray-200/80 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                        title="Đổi tên"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(convo.id, e)}
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Xóa hội thoại"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
export default ConversationHistory;
