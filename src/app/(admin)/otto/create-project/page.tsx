"use client";

import React, { Suspense } from "react";
import CreateProjectWizard from "@/features/ai-seo/components/projects/CreateProjectWizard";
import { ContentSkeleton } from "@/components/ui/skeleton/ContentSkeleton";

function OttoCreateProjectPageContent() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
          AI SEO Setup Wizard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tạo dự án tự động hóa tối ưu SEO và liên kết mã nguồn của bạn.
        </p>
      </div>
      <CreateProjectWizard />
    </div>
  );
}

export default function OttoCreateProjectPage() {
  return (
    <Suspense fallback={<ContentSkeleton variant="form" label="Đang tải trình hướng dẫn thiết lập OTTO" className="p-6" />}>
      <OttoCreateProjectPageContent />
    </Suspense>
  );
}
