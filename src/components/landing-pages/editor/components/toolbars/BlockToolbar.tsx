"use client";

import React, { useRef, useState } from "react";
import { EditorBlock } from "../../types";
import {
  ToolbarButton,
  ToolbarDivider,
  ToolbarMenuItem,
  ToolbarShell,
  useClickOutside,
} from "./ToolbarShared";

export interface BlockToolbarActions {
  onDelete: () => void;
  onDuplicate: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  onOpenSettings: () => void;
  onToggleHidden?: () => void;
  onSetLocked?: (locked: boolean) => void;
  onStartResize?: () => void;
  onAlign?: (action: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => void;
  onUngroup?: () => void;
  isHidden?: boolean;
  isLocked?: boolean;
  isGroup?: boolean;
}

interface BlockToolbarProps {
  block: EditorBlock;
  actions: BlockToolbarActions;
  variant?: "block" | "group" | "button" | "html";
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ block, actions, variant = "block" }) => {
  const [alignOpen, setAlignOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const alignRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  useClickOutside(alignOpen, alignRef, () => setAlignOpen(false));
  useClickOutside(moreOpen, moreRef, () => setMoreOpen(false));

  const alignItems: { key: "left" | "centerH" | "right" | "top" | "centerV" | "bottom"; label: string }[] = [
    { key: "left", label: "Căn trái" },
    { key: "centerH", label: "Căn giữa ngang" },
    { key: "right", label: "Căn phải" },
    { key: "top", label: "Căn trên" },
    { key: "centerV", label: "Căn giữa dọc" },
    { key: "bottom", label: "Căn dưới" },
  ];

  return (
    <ToolbarShell>
      <ToolbarButton
        title="Kéo giãn chiều cao"
        onClick={() => actions.onStartResize?.()}
        disabled={!actions.onStartResize}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15M8.25 9 12 5.25 15.75 9" />
        </svg>
      </ToolbarButton>

      {actions.onBringForward && (
        <ToolbarButton title="Lên trên lớp" onClick={() => actions.onBringForward!()}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-4 4m4-4l4 4M4 5h16" />
          </svg>
        </ToolbarButton>
      )}

      {actions.onSendBackward && (
        <ToolbarButton title="Xuống lớp" onClick={() => actions.onSendBackward!()}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0 0l-4-4m4 4l4-4M4 19h16" />
          </svg>
        </ToolbarButton>
      )}

      <ToolbarButton title="Nhân bản" onClick={() => actions.onDuplicate()}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9m9 9H3.375" />
        </svg>
      </ToolbarButton>

      <ToolbarButton title="Xóa" danger onClick={() => actions.onDelete()}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </ToolbarButton>

      <div className="relative" ref={alignRef}>
        <ToolbarButton
          title="Căn lề"
          active={alignOpen}
          onClick={() => setAlignOpen((v) => !v)}
          disabled={!actions.onAlign}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>
        </ToolbarButton>
        {alignOpen && actions.onAlign && (
          <div
            data-editor-popover
            className="absolute bottom-full left-1/2 z-[60] mb-2 min-w-[150px] -translate-x-1/2 overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-0.5 shadow-lg"
          >
            {alignItems.map((item) => (
              <ToolbarMenuItem
                key={item.key}
                label={item.label}
                onClick={() => {
                  actions.onAlign!(item.key);
                  setAlignOpen(false);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {variant === "group" && actions.isGroup && (
        <ToolbarButton
          title="Hủy nhóm (chưa hỗ trợ)"
          onClick={() => actions.onUngroup?.()}
          disabled={!actions.onUngroup}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5Z" />
          </svg>
        </ToolbarButton>
      )}

      <ToolbarDivider />

      <ToolbarButton title="Cài đặt" onClick={() => actions.onOpenSettings()}>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.193c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774a1.125 1.125 0 01.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.11v1.094c0 .55-.398 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.164.398-.143.854.107 1.204l.527.738a1.125 1.125 0 01-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.448-.12l-.774-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </ToolbarButton>

      <ToolbarButton
        title="Hướng dẫn"
        onClick={() => alert("Kéo thả để di chuyển khối. Dùng các nút lớp để sắp xếp thứ tự hiển thị.")}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
      </ToolbarButton>

      <div className="relative" ref={moreRef}>
        <ToolbarButton title="Hành động khác" active={moreOpen} onClick={() => setMoreOpen((v) => !v)}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </ToolbarButton>
        {moreOpen && (
          <div
            data-editor-popover
            className="absolute bottom-full right-0 z-[60] mb-2 min-w-[170px] overflow-hidden rounded-[8px] border border-[#e5e7eb] bg-white py-0.5 shadow-lg"
          >
            <ToolbarMenuItem label="Sao chép" onClick={() => { actions.onDuplicate(); setMoreOpen(false); }} />
            <ToolbarMenuItem label="Lưu ảnh (chưa hỗ trợ)" onClick={() => {}} disabled />
            <ToolbarMenuItem label="Đồng bộ (chưa hỗ trợ)" onClick={() => {}} disabled />
            <ToolbarMenuItem
              label={actions.isHidden ? "Hiện phần tử" : "Ẩn phần tử"}
              disabled={!actions.onToggleHidden}
              onClick={() => { actions.onToggleHidden?.(); setMoreOpen(false); }}
            />
            <ToolbarMenuItem
              label={actions.isLocked ? "Mở khóa" : "Khóa phần tử"}
              disabled={!actions.onSetLocked}
              onClick={() => { actions.onSetLocked?.(!actions.isLocked); setMoreOpen(false); }}
            />
          </div>
        )}
      </div>
    </ToolbarShell>
  );
};