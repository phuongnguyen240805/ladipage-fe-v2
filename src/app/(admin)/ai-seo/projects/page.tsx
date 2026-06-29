"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProjectList from "@/features/ai-seo/components/projects/ProjectList";

export default function SeoProjectsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1 border-b border-gray-150 dark:border-gray-800 pb-5">
        <Link
          href="/ai-seo"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Quản lý dự án SEO
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Tạo và cấu hình các mục tiêu giám sát từ khóa, sitemap, và đề xuất tối ưu hóa cho website của bạn.
        </p>
      </div>

      {/* Main Project List */}
      <ProjectList />
    </div>
  );
}
