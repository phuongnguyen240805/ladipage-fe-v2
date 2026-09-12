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
      className="hidden lg:flex absolute top-0 -right-1.5 bottom-0 w-3 z-30 cursor-col-resize items-center justify-center select-none group/resize"
      title="Kéo sang trái/phải để thay đổi độ rộng (Nhấp đúp để đặt lại)"
      role="separator"
      aria-orientation="vertical"
    >
      <div
        className={`h-full transition-colors duration-150 ${
          isDragging
            ? "w-0.5 bg-lime-500 dark:bg-lime-400"
            : "w-px bg-transparent group-hover/resize:bg-lime-500 dark:group-hover/resize:bg-lime-400"
        }`}
      />
    </div>
  );
};

export default ResizeHandle;
