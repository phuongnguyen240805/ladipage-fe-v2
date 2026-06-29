import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useAiSeoStore } from "../hooks/useAiSeoStore";
import PlaybookSelector from "./PlaybookSelector";

interface AgentChatProps {
  convoId: string;
  agentId: string;
}

// A sleek, lightweight markdown-to-React parser to format agent responses without heavy NPM dependencies
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  
  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
      {lines.map((line, idx) => {
        // Headers H3
        if (line.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-gray-900 dark:text-white pt-2 flex items-center gap-1.5 border-b border-gray-100 dark:border-gray-800/60 pb-1 mt-3">
              <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
              {line.substring(4)}
            </h3>
          );
        }
        // Headers H4
        if (line.startsWith("#### ")) {
          return (
            <h4 key={idx} className="text-sm font-bold text-blue-600 dark:text-blue-400 pt-1 mt-2">
              {line.substring(5)}
            </h4>
          );
        }
        // Bullet list
        if (line.startsWith("- ") || line.startsWith("* ")) {
          const formatted = parseInlineFormatting(line.substring(2));
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              <li className="text-gray-700 dark:text-gray-300">{formatted}</li>
            </ul>
          );
        }
        // Number list
        const numMatch = line.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const formatted = parseInlineFormatting(numMatch[2]);
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1">
              <li className="text-gray-700 dark:text-gray-300">{formatted}</li>
            </ol>
          );
        }
        // Tables parsing
        if (line.startsWith("|")) {
          // Ignore separator lines like | --- |
          if (line.includes("---")) return null;
          
          const cells = line.split("|").map(c => c.trim()).filter(c => c !== "");
          return (
            <div key={idx} className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-800 text-xs">
                <tbody>
                  <tr className="bg-gray-50/50 dark:bg-gray-900/30">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="border border-gray-200 dark:border-gray-800 px-3 py-2 font-medium">
                        {parseInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
        // Code Block indicator / line
        if (line.startsWith("```")) return null;

        // Normal paragraph
        if (line.trim() === "") return <div key={idx} className="h-1" />;

        return (
          <p key={idx} className="text-gray-700 dark:text-gray-300">
            {parseInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

// Parse bold (**text**) and code (`code`) tags inside text
function parseInlineFormatting(text: string) {
  // Regex to split by bold (**) and inline code (`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-gray-900 dark:text-white">
          {part.substring(2, part.length - 2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-gray-150 dark:bg-gray-800/80 text-red-500 dark:text-red-400 font-mono text-xs">
          {part.substring(1, part.length - 1)}
        </code>
      );
    }
    return part;
  });
}

export function AgentChat({ convoId, agentId }: AgentChatProps) {
  const {
    messages,
    sendMessage,
    isStreaming,
    isLoadingMessages,
    agents,
    currentStreamText
  } = useAiSeoStore();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find current agent config
  const currentAgent = agents.find((a) => a.id === agentId);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamText]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming) return;

    const messageText = input;
    setInput("");
    await sendMessage(convoId, messageText, agentId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePlaybookSelect = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1a1a26] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Active Conversation Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-xl shadow-sm border border-blue-100/10">
            {currentAgent?.avatar || "🤖"}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white text-sm">
              {currentAgent?.name || "AI Chat Agent"}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {currentAgent?.role || "Trợ lý SEO"}
            </p>
          </div>
        </div>
        {isStreaming && (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 font-semibold bg-blue-50/50 dark:bg-blue-950/20 px-2.5 py-1 rounded-full animate-pulse border border-blue-100/10">
            <Loader2 className="w-3 h-3 animate-spin" />
            Agent Đang Chạy
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {isLoadingMessages ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <span className="text-sm">Đang tải tin nhắn...</span>
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat state: Show playbooks & suggestions */
          <div className="max-w-2xl mx-auto space-y-8 py-10">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-3xl mx-auto border border-blue-100/20 shadow-sm animate-bounce">
                {currentAgent?.avatar || "🤖"}
              </div>
              <h3 className="text-lg font-extrabold text-gray-800 dark:text-white">
                Bắt đầu hội thoại mới với {currentAgent?.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                {currentAgent?.description || "Chọn một Playbook bên dưới hoặc tự viết nội dung câu hỏi để bắt đầu tối ưu."}
              </p>
            </div>

            <PlaybookSelector
              playbooks={currentAgent?.playbooks}
              onSelect={handlePlaybookSelect}
            />
          </div>
        ) : (
          /* Messages Log */
          <div className="space-y-5 max-w-3xl mx-auto">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const isPlaceholder = msg.id === "stream-placeholder";

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 items-start ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100/10 flex items-center justify-center text-base shrink-0 shadow-sm mt-0.5">
                      {currentAgent?.avatar || "🤖"}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${
                      isUser
                        ? "bg-blue-600 border-blue-700 text-white rounded-tr-none dark:bg-blue-600 dark:border-blue-700"
                        : "bg-gray-50 dark:bg-gray-900 border-gray-150 dark:border-gray-850 text-gray-800 dark:text-gray-200 rounded-tl-none"
                    }`}
                  >
                    {isUser ? (
                      <p className="text-sm font-medium whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="relative">
                        <MarkdownRenderer content={msg.content} />
                        {isPlaceholder && isStreaming && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 dark:bg-blue-400 animate-pulse shrink-0 align-middle" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-sm shrink-0 shadow-sm mt-0.5">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Loading/Thinking Indicator */}
            {isStreaming && !currentStreamText && (
              <div className="flex gap-3.5 items-start justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100/10 flex items-center justify-center text-base shrink-0 shadow-sm mt-0.5">
                  {currentAgent?.avatar || "🤖"}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl rounded-tl-none p-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span>Agent đang thực thi các bước tối ưu hóa...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box and Prompt controls */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-3xl mx-auto relative items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            rows={1}
            placeholder={
              isStreaming
                ? "Đang chờ Agent phản hồi..."
                : `Hỏi ${currentAgent?.name || "Agent"}... (Shift + Enter để xuống dòng)`
            }
            className="flex-1 min-h-[44px] max-h-32 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-gray-100 disabled:bg-gray-100 dark:disabled:bg-gray-950 disabled:cursor-not-allowed resize-none transition shadow-inner"
            style={{ height: "auto" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-400 dark:disabled:text-gray-600 transition shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
export default AgentChat;
