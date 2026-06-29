import React, { useState } from "react";
import { ToolCall } from "../types";
import { Play, CheckCircle2, AlertCircle, Terminal, ChevronDown, ChevronUp } from "lucide-react";

interface ToolExecutionTimelineProps {
  toolCalls?: ToolCall[];
}

export function ToolExecutionTimeline({ toolCalls = [] }: ToolExecutionTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (toolCalls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 rounded-2xl">
        <Terminal className="w-8 h-8 text-gray-300 dark:text-gray-700 mb-2" />
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          Chưa có hoạt động Agent nào
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-[200px]">
          Gửi tin nhắn cho Agent để bắt đầu theo dõi hoạt động của các công cụ.
        </span>
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 px-1">
        <Terminal className="w-3.5 h-3.5" />
        Hoạt động Công cụ (Tool Calls)
      </h3>
      <div className="relative border-l border-gray-200 dark:border-gray-800 pl-4 ml-3.5 space-y-5">
        {toolCalls.map((tc, index) => {
          const isCalling = tc.status === "calling";
          const isCompleted = tc.status === "completed";
          const isFailed = tc.status === "failed";
          const isExpanded = expandedId === tc.id;

          return (
            <div key={tc.id} className="relative group">
              {/* Status Indicator Icon */}
              <div
                className={`absolute -left-7.5 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border bg-white dark:bg-gray-900 transition-all ${
                  isCalling
                    ? "border-blue-500 text-blue-500 animate-pulse ring-4 ring-blue-500/15"
                    : isCompleted
                    ? "border-emerald-500 text-emerald-500 dark:text-emerald-400"
                    : "border-rose-500 text-rose-500"
                }`}
              >
                {isCalling && (
                  <Play className="w-3 h-3 animate-spin fill-blue-500" />
                )}
                {isCompleted && <CheckCircle2 className="w-4 h-4 fill-emerald-500/10" />}
                {isFailed && <AlertCircle className="w-4 h-4 fill-rose-500/10" />}
              </div>

              {/* Step Info */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleExpand(tc.id)}
                  className="flex items-center justify-between text-left w-full group/btn hover:opacity-90 transition"
                >
                  <div>
                    <span className="font-mono text-sm font-bold text-gray-800 dark:text-gray-200 block group-hover/btn:text-blue-500 dark:group-hover/btn:text-blue-400 transition-colors">
                      {tc.toolName}()
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {isCalling && "Đang xử lý..."}
                      {isCompleted && "Đã hoàn thành"}
                      {isFailed && `Lỗi: ${tc.error || "Không rõ nguyên nhân"}`}
                    </span>
                  </div>
                  <div className="text-gray-400 dark:text-gray-600 pl-2">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Input / Output Params */}
                {isExpanded && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 text-xs font-mono space-y-2 overflow-x-auto max-w-full">
                    {/* Inputs */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                        Input Arguments
                      </span>
                      <pre className="text-gray-700 dark:text-gray-300 p-1.5 rounded bg-gray-100/50 dark:bg-black/20 overflow-x-auto">
                        {JSON.stringify(tc.input, null, 2)}
                      </pre>
                    </div>
                    {/* Outputs */}
                    {isCompleted && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                          Output Results
                        </span>
                        <pre className="text-emerald-700 dark:text-emerald-400 p-1.5 rounded bg-emerald-50/30 dark:bg-emerald-950/10 overflow-x-auto border border-emerald-100/30 dark:border-emerald-900/10">
                          {JSON.stringify(tc.output, null, 2)}
                        </pre>
                      </div>
                    )}
                    {/* Errors */}
                    {isFailed && tc.error && (
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider block mb-1">
                          Error Details
                        </span>
                        <pre className="text-rose-600 dark:text-rose-400 p-1.5 rounded bg-rose-50/50 dark:bg-rose-950/15 overflow-x-auto border border-rose-100/40 dark:border-rose-900/10">
                          {tc.error}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default ToolExecutionTimeline;
