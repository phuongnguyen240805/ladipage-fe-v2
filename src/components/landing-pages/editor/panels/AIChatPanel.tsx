"use client";
import React from "react";
import { EditorBlock } from "../types";

interface AIChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AIChatPanelProps {
  chatHistory: AIChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<AIChatMessage[]>>;
  selectedBlock: EditorBlock | null;
  chatInput: string;
  setChatInput: (v: string) => void;
  isAiTyping: boolean;
  handleSendChatMessage: (text: string) => void;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  chatHistory,
  setChatHistory,
  selectedBlock,
  chatInput,
  setChatInput,
  isAiTyping,
  handleSendChatMessage,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center p-6 select-none">
            <div className="w-14 h-14 border border-dashed border-purple-300 rounded-2xl flex items-center justify-center mb-4 text-purple-600 bg-purple-50">
              <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m0 0l-1.5-1.5M12 4.5l1.5-1.5" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-800">Trợ lý Thiết kế AI</p>
            <p className="text-xs text-gray-500 mt-2 max-w-[220px] leading-relaxed font-medium">
              Chọn một khối trên Canvas hoặc nhập yêu cầu chỉnh sửa giao diện ở dưới!
            </p>
          </div>
        ) : (
          /* Chat message history */
          <div className="space-y-4">
            {selectedBlock && (
              <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-lg text-[10px] text-purple-700 flex items-center gap-1.5 select-none shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                Đang chọn chỉnh sửa: <span className="font-bold">{selectedBlock.label || selectedBlock.type}</span>
              </div>
            )}
            
            {chatHistory.map((msg, i) => {
              const isUser = msg.sender === "user";
              return (
                <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-purple-600 text-white rounded-tr-none"
                      : "bg-gray-50 text-gray-800 border border-gray-200 rounded-tl-none"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-center gap-1 text-gray-400 text-xs pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (chatInput.trim()) {
              handleSendChatMessage(chatInput);
              setChatInput("");
            }
          }}
          className="relative flex items-center rounded-lg border border-gray-250 bg-white px-3 py-2 focus-within:border-purple-500 transition-all shadow-sm"
        >
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={selectedBlock ? `Yêu cầu sửa block này...` : `Hỏi AI chỉnh sửa giao diện...`}
            rows={1}
            className="flex-1 bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none no-scrollbar py-1 pr-6 font-medium"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (chatInput.trim()) {
                  handleSendChatMessage(chatInput);
                  setChatInput("");
                }
              }
            }}
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="cursor-pointer absolute right-2 text-purple-600 hover:text-purple-700 transition-all disabled:opacity-30"
          >
            <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

      {/* Quick AI action icon floating at right bottom of history */}
      <div className="absolute right-4 bottom-16 select-none cursor-pointer group">
        <div className="w-9 h-9 rounded-full border border-purple-200 bg-white flex items-center justify-center shadow-lg hover:border-purple-500 transition-all">
          <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.657-5.657-2.829 2.829M9.172 14.828l-2.829 2.829m11.314 0-2.829-2.829M9.172 9.172 6.343 6.343" />
          </svg>
        </div>
      </div>
    </div>
  );
};
