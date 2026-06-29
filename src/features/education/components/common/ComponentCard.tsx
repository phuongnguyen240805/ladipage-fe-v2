import React from "react";
import { mergeCardClasses } from "@/features/education/utils/design-system";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
  interactive?: boolean;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  interactive = false,
}) => {
  return (
    <div className={mergeCardClasses(interactive, className)}>
      {/* Card Header */}
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white/90 leading-normal leading-tight leading-snug">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-base font-medium text-slate-600 dark:text-slate-400 leading-relaxed leading-relaxed">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;


