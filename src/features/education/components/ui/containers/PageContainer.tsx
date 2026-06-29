"use client";
import React from "react";
import { CARD_STYLES, TEXT_STYLES } from "@/features/education/utils/design-system";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard page container with consistent padding and max-width
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}
    >
      {children}
    </div>
  );
};

export default PageContainer;
