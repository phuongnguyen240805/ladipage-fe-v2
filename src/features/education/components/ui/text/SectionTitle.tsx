"use client";
import React from "react";
import { TEXT_STYLES } from "@/features/education/utils/design-system";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Standard section title with consistent styling
 */
const SectionTitle: React.FC<SectionTitleProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <h2 className={TEXT_STYLES.h2}>{title}</h2>
      {subtitle && <p className={`mt-2 ${TEXT_STYLES.sm}`}>{subtitle}</p>}
    </div>
  );
};

export default SectionTitle;
