import type { KeyboardEvent, RefObject } from "react";
import type { Agent } from "../../types";
import ChatModeHint from "./ChatModeHint";

type ChatMode = "chat" | "task" | "announcement" | "report";
type Tr = (ko: string, en: string, ja?: string, zh?: string) => string;

interface ChatComposerProps {
  mode: ChatMode;
  input: string;
  selectedAgent: Agent | null;
  isDirectiveMode: boolean;
  isAnnouncementMode: boolean;
  tr: Tr;
  getAgentName: (agent: Agent | null | undefined) => string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onModeChange: (mode: ChatMode) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function ChatComposer({
  mode,
  input,
  selectedAgent,
  isDirectiveMode,
  isAnnouncementMode,
  tr,
  getAgentName,
  textareaRef,
  onModeChange,
  onInputChange,
  onSend,
  onKeyDown,
}: ChatComposerProps) {
  return (
    <>
      <div className="flex flex-shrink-0 gap-2 border-t border-gray-700/50 px-4 pb-1 pt-3">
        <button
          onClick={() => onModeChange(mode === "task" ? "chat" : "task")}
          disabled={!selectedAgent}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            mode === "task"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          }`}
        >
          <span>📋</span>
          <span>{tr("업무 지시", "Task", "タスク指示", "任务指示")}</span>
        </button>

        <button
          onClick={() => onModeChange(mode === "announcement" ? "chat" : "announcement")}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            mode === "announcement" ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          <span>📢</span>
          <span>{tr("전사 공지", "Announcement", "全体告知", "全员公告")}</span>
        </button>

        <button
          onClick={() => onModeChange(mode === "report" ? "chat" : "report")}
          disabled={!selectedAgent}
          className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
            mode === "report"
              ? "bg-emerald-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
          }`}
        >
          <span>📊</span>
          <span>{tr("보고 요청", "Report", "レポート依頼", "报告请求")}</span>
        </button>
      </div>

      <ChatModeHint mode={mode} isDirectiveMode={isDirectiveMode} tr={tr} />

      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div
          className={`flex items-end gap-2 rounded-2xl border bg-gray-800 transition-colors ${
            isDirectiveMode
              ? "border-red-500/50 focus-within:border-red-400"
              : isAnnouncementMode
                ? "border-yellow-500/50 focus-within:border-yellow-400"
                : mode === "task"
                  ? "border-blue-500/50 focus-within:border-blue-400"
                  : mode === "report"
                    ? "border-emerald-500/50 focus-within:border-emerald-400"
                    : "border-gray-600 focus-within:border-blue-500"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              isAnnouncementMode
                ? tr(
                    "전사 공지 내용을 입력하세요...",
                    "Write an announcement...",
                    "全体告知内容を入力してください...",
                    "请输入公告内容...",
                  )
                : mode === "task"
                  ? tr(
                      "업무 지시 내용을 입력하세요...",
                      "Write a task instruction...",
                      "タスク指示内容を入力してください...",
                      "请输入任务指示内容...",
                    )
                  : mode === "report"
                    ? tr(
                        "보고 요청 내용을 입력하세요...",
                        "Write a report request...",
                        "レポート依頼内容を入力してください...",
                        "请输入报告请求内容...",
                      )
                    : selectedAgent
                      ? tr(
                          `${getAgentName(selectedAgent)}에게 메시지 보내기...`,
                          `Send a message to ${getAgentName(selectedAgent)}...`,
                          `${getAgentName(selectedAgent)}にメッセージを送る...`,
                          `向 ${getAgentName(selectedAgent)} 发送消息...`,
                        )
                      : tr(
                          "메시지를 입력하세요...",
                          "Type a message...",
                          "メッセージを入力してください...",
                          "请输入消息...",
                        )
            }
            rows={1}
            className="min-h-[44px] max-h-32 flex-1 resize-none overflow-y-auto bg-transparent px-4 py-3 text-sm leading-relaxed text-gray-100 placeholder-gray-500 focus:outline-none"
            style={{ scrollbarWidth: "none" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim()}
            className={`mb-2 mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all ${
              input.trim()
                ? isDirectiveMode
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : isAnnouncementMode
                    ? "bg-yellow-500 text-gray-900 hover:bg-yellow-400"
                    : mode === "task"
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : mode === "report"
                        ? "bg-emerald-600 text-white hover:bg-emerald-500"
                        : "bg-blue-600 text-white hover:bg-blue-500"
                : "cursor-not-allowed bg-gray-700 text-gray-600"
            }`}
            aria-label={tr("전송", "Send", "送信", "发送")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="mt-1.5 px-1 text-xs text-gray-600">
          {tr(
            "Enter로 전송, Shift+Enter로 줄바꿈",
            "Press Enter to send, Shift+Enter for a new line",
            "Enterで送信、Shift+Enterで改行",
            "按 Enter 发送，Shift+Enter 换行",
          )}
        </p>
      </div>
    </>
  );
}
