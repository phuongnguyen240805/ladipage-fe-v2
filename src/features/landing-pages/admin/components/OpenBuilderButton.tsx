"use client";

import { useState } from "react";
import { openLandingBuilder } from "@/features/landing-builder/sdk/open-builder";

interface OpenBuilderButtonProps {
  pageId: string;
  children?: React.ReactNode;
  className?: string;
}

export function OpenBuilderButton({
  pageId,
  children = "Chỉnh sửa",
  className,
}: OpenBuilderButtonProps) {
  const [isOpening, setIsOpening] = useState(false);

  return (
    <button
      type="button"
      disabled={isOpening}
      onClick={async () => {
        setIsOpening(true);
        try {
          await openLandingBuilder({ pageId, mode: "new-tab" });
        } catch (error) {
          console.error("Failed to open landing builder:", error);
          alert(error instanceof Error ? error.message : "Không thể mở builder.");
        } finally {
          setIsOpening(false);
        }
      }}
      className={className}
    >
      {isOpening ? "Đang mở..." : children}
    </button>
  );
}
