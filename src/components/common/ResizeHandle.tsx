"use client";

import React from "react";

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  isDragging?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onMouseDown,
  onDoubleClick,
  isDragging = false,
}) => {
  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      className="absolute inset-y-0 -right-1.5 z-40 hidden w-3 cursor-col-resize items-center justify-center select-none group/resize lg:flex"
      title="Kéo sang trái/phải để thay đổi độ rộng (Nhấp đúp để đặt lại)"
      role="separator"
      aria-orientation="vertical"
    >
      <div
        className={`h-full transition-colors duration-150 ${
          isDragging
            ? "w-0.5 bg-kedi-yellow dark:bg-kedi-yellow"
            : "w-px bg-transparent group-hover/resize:bg-kedi-yellow dark:group-hover/resize:bg-kedi-yellow"
        }`}
      />
    </div>
  );
};

export default ResizeHandle;
