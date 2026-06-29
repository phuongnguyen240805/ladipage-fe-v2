"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Bot, Plus, Terminal, RefreshCw, Sparkles } from "lucide-react";
import { useAiSeoStore } from "@/features/ai-seo/hooks/useAiSeoStore";
import ConversationHistory from "@/features/ai-seo/components/ConversationHistory";
import AgentChat from "@/features/ai-seo/components/AgentChat";
import ToolExecutionTimeline from "@/features/ai-seo/components/ToolExecutionTimeline";

function AiSeoChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const convoIdParam = searchParams.get("convoId");

  const {
    agents,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    fetchAgents,
    fetchConversations,
    toolCalls,
    activeRun,
    sendMessage,
    messages,
    isStreaming
  } = useAiSeoStore();

  const [selectedAgentId, setSelectedAgentId] = useState("chat-assistant");

  // Fetch agents and conversations on load
  useEffect(() => {
    fetchAgents();
    fetchConversations();
  }, [fetchAgents, fetchConversations]);

  // Synchronize convoId URL param with Zustand active conversation ID
  useEffect(() => {
    if (convoIdParam) {
      if (convoIdParam !== activeConversationId) {
        setActiveConversationId(convoIdParam);
      }
    } else if (activeConversationId) {
      // Update URL if active conversation changes
      router.replace(`/ai-seo/chat?convoId=${activeConversationId}`);
    }
  }, [convoIdParam, activeConversationId, setActiveConversationId, router]);

  // Handler to start a new chat with the selected agent
  const handleCreateNewChat = async (agentId: string) => {
    const convo = await createConversation(agentId);
    if (convo) {
      router.push(`/ai-seo/chat?convoId=${convo.id}`);
    }
  };

  const activeConvo = conversations.find((c) => c.id === activeConversationId);

  // Handle auto-triggering playbook prompts when entering a new conversation
  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (
      promptParam &&
      activeConversationId &&
      activeConvo &&
      messages.length === 0 &&
      !isStreaming
    ) {
      sendMessage(activeConversationId, promptParam, activeConvo.agentId);
      // Clean URL parameters to prevent re-execution on reload
      router.replace(`/ai-seo/chat?convoId=${activeConversationId}`);
    }
  }, [searchParams, activeConversationId, activeConvo, messages.length, isStreaming, sendMessage, router]);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-6 max-w-7xl mx-auto overflow-hidden">
      {/* 1. Left Column: Chat History List */}
      <div className="hidden md:block w-72 shrink-0 h-full">
        <ConversationHistory onNewChat={() => handleCreateNewChat(selectedAgentId)} />
      </div>

      {/* 2. Middle Column: Active Conversation Sandbox */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        {activeConversationId && activeConvo ? (
          <AgentChat
            convoId={activeConversationId}
            agentId={activeConvo.agentId}
          />
        ) : (
          /* Landing/New chat screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-2xl text-center space-y-6 shadow-sm overflow-y-auto">
            <div className="max-w-md space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100/10 flex items-center justify-center text-3xl mx-auto shadow-sm">
                🤖
              </div>
              <h2 className="text-xl font-extrabold text-gray-800 dark:text-white">
                AI SEO Sandbox
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Tạo một phiên hội thoại mới bằng cách chọn một Agent chuyên môn bên dưới để bắt đầu tự động hóa quy trình phân tích và tối ưu hóa SEO.
              </p>
            </div>

            {/* Agent Select Panel */}
            <div className="w-full max-w-lg space-y-3">
              <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block text-left px-1">
                Chọn AI Agent của bạn
              </label>
              <div className="grid grid-cols-2 gap-2 text-left">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2.5 transition ${
                      selectedAgentId === agent.id
                        ? "bg-blue-600 border-blue-700 text-white shadow-sm"
                        : "bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <span className="text-lg">{agent.avatar}</span>
                    <span className="truncate">{agent.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleCreateNewChat(selectedAgentId)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow transition"
            >
              <Plus className="w-4 h-4" />
              Tạo phiên trò chuyện mới
            </button>
          </div>
        )}
      </div>

      {/* 3. Right Column: Tool Execution Timeline */}
      <div className="hidden lg:block w-80 shrink-0 h-full overflow-y-auto bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm scrollbar-thin">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-850 pb-3">
            <span className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
              <Terminal className="w-4.5 h-4.5 text-blue-500" />
              Bảng Điều khiển Chạy (Runs)
            </span>
            {activeRun && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                activeRun.status === "running"
                  ? "bg-blue-50 text-blue-600 border-blue-150 animate-pulse dark:bg-blue-950/20"
                  : activeRun.status === "completed"
                  ? "bg-emerald-50 text-emerald-600 border-emerald-150 dark:bg-emerald-950/20"
                  : "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900"
              }`}>
                {activeRun.status.toUpperCase()}
              </span>
            )}
          </div>
          
          <ToolExecutionTimeline toolCalls={toolCalls} />
        </div>
      </div>
    </div>
  );
}

export default function AiSeoChatPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-500 font-extrabold">
        <RefreshCw className="w-5 h-5 animate-spin text-slate-400 mx-auto mb-2" />
        Đang tải phân hệ hội thoại...
      </div>
    }>
      <AiSeoChatPageContent />
    </Suspense>
  );
}
