"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseResizableSidebarOptions {
  storageKey?: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

export function useResizableSidebar(options: UseResizableSidebarOptions = {}) {
  const {
    storageKey = "ladi_submenu_width",
    defaultWidth = 185,
    minWidth = 180,
    maxWidth = 460,
  } = options;

  const [width, setWidth] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = Number(saved);
          if (!Number.isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
            return parsed;
          }
        }
      } catch {
        // Ignore storage errors
      }
    }
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const widthRef = useRef(width);

  useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const startX = e.clientX;
      const startWidth = widthRef.current;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
        setWidth(newWidth);
        try {
          localStorage.setItem(storageKey, String(newWidth));
        } catch {
          // Ignore storage errors
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.removeProperty("cursor");
        document.body.style.removeProperty("user-select");
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [maxWidth, minWidth, storageKey],
  );

  const resetWidth = useCallback(() => {
    setWidth(defaultWidth);
    try {
      localStorage.setItem(storageKey, String(defaultWidth));
    } catch {
      // Ignore storage errors
    }
  }, [defaultWidth, storageKey]);

  return {
    width,
    isDragging,
    handleMouseDown,
    resetWidth,
  };
}
