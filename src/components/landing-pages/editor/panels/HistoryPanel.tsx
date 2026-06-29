"use client";
import React from "react";
import { LandingEditorAction, LandingEditorSnapshot } from "../editor-actions";

interface EditorRevision {
  id: string;
  name: string;
  snapshot: LandingEditorSnapshot;
  createdAt: string;
}

interface HistoryPanelProps {
  actionLog: LandingEditorAction[];
  revisions: EditorRevision[];
  onCreateRevision: () => void;
  onRestoreRevision: (revision: EditorRevision) => void;
  formatActionLabel: (action: LandingEditorAction) => string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  actionLog,
  revisions,
  onCreateRevision,
  onRestoreRevision,
  formatActionLabel,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 bg-white text-gray-800">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3.75 2.25M3.75 12a8.25 8.25 0 111.833 5.197M3.75 18v-4.5h4.5" />
          </svg>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lịch sử thiết kế</h3>
        </div>
        <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded-full">{actionLog.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-purple-100 pb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Các Phiên bản đã lưu</span>
            <button
              onClick={onCreateRevision}
              className="text-[10px] font-extrabold text-purple-600 hover:text-purple-750 transition"
            >
              + Lưu hiện tại
            </button>
          </div>
          {revisions.length === 0 ? (
            <p className="text-[11px] text-gray-500 leading-relaxed py-1">Chưa lưu phiên bản thiết kế nào.</p>
          ) : (
            <div className="space-y-1.5">
              {revisions.slice(0, 10).map((revision) => (
                <div key={revision.id} className="flex items-center justify-between gap-2 rounded-lg bg-white border border-gray-200 p-2 shadow-sm hover:border-purple-300">
                  <div className="min-w-0">
                    <div className="truncate text-[11px] font-bold text-gray-800">{revision.name}</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">
                      {new Date(revision.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <button
                    onClick={() => onRestoreRevision(revision)}
                    className="cursor-pointer flex-shrink-0 text-[10px] font-bold text-purple-600 hover:text-purple-800 px-2 py-1 bg-purple-50 border border-purple-100 rounded hover:bg-purple-100 transition"
                  >
                    Phục hồi
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">Nhật ký chỉnh sửa</div>
          {actionLog.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-400 leading-relaxed text-center bg-gray-50">
              Chưa có thao tác chỉnh sửa nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2">
              {[...actionLog].reverse().map((action, index) => (
                <div key={`${action.timestamp}-${index}`} className="rounded-lg border border-gray-200 bg-white p-2.5 text-xs shadow-sm flex flex-col gap-1 hover:border-gray-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-800 truncate">{formatActionLabel(action)}</span>
                    <span className="text-[9px] text-gray-400 flex-shrink-0">
                      {new Date(action.timestamp).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {"blockId" in action && (
                    <div className="truncate font-mono text-[9px] text-gray-400">{action.blockId}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
