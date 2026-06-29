"use client";

import React, { useRef } from "react";
import {
  PanelPosition,
  UseDraggablePanelOptions,
  useDraggablePanel,
  DragHandleProps,
} from "../hooks/useDraggablePanel";

export interface DraggablePanelRenderProps {
  dragHandleProps: DragHandleProps;
  resetPosition: () => void;
  isDragging: boolean;
  position: PanelPosition;
}

interface DraggablePanelProps extends Omit<UseDraggablePanelOptions, "panelRef"> {
  className?: string;
  children: (props: DraggablePanelRenderProps) => React.ReactNode;
}

export const DraggablePanel: React.FC<DraggablePanelProps> = ({
  className = "",
  children,
  ...options
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { style, dragHandleProps, resetPosition, isDragging, position } =
    useDraggablePanel({
      ...options,
      panelRef,
    });

  return (
    <div
      ref={panelRef}
      data-panel-id={options.id}
      style={style}
      className={`pointer-events-auto isolate flex flex-col overflow-hidden ${className} ${
        isDragging
          ? "shadow-2xl ring-2 ring-[#5b21b6]/20"
          : ""
      }`}
    >
      {children({ dragHandleProps, resetPosition, isDragging, position })}
    </div>
  );
};