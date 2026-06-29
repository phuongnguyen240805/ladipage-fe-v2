"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import CreateProjectWizard from "@/features/ai-seo/components/projects/CreateProjectWizard";

function CreateSeoProjectPageContent() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/ai-seo"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Dashboard AI SEO
        </Link>
      </div>

      {/* Main wizard container */}
      <CreateProjectWizard />
    </div>
  );
}

export default function CreateSeoProjectPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs text-slate-500 font-extrabold flex flex-col items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mb-2" />
        Đang tải Trình hướng dẫn thiết lập...
      </div>
    }>
      <CreateSeoProjectPageContent />
    </Suspense>
  );
}
