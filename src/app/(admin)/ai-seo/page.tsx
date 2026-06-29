"use client";

import React from "react";
import SeoAutomationShell from "@/features/ai-seo/components/SeoAutomationShell";
import SeoAutomationPage from "@/features/ai-seo/components/SeoAutomationPage";

export default function AiSeoDashboardPage() {
  return (
    <SeoAutomationShell>
      <SeoAutomationPage />
    </SeoAutomationShell>
  );
}
