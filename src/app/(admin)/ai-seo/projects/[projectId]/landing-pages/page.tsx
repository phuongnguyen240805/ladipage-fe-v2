"use client";

import React from "react";
import { useParams } from "next/navigation";
import SeoAutomationShell from "@/features/ai-seo/components/SeoAutomationShell";
import AiSeoLandingPagesPanel from "@/features/ai-seo/components/landing-pages/AiSeoLandingPagesPanel";

export default function ProjectLandingPagesPage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "";

  return (
    <SeoAutomationShell>
      {/* Spacer matching layout */}
      <div className="h-16 bg-slate-950"></div>
      
      {/* Overlapping Rounded Container */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 -mt-8 relative z-10 pb-16">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xl">
          <AiSeoLandingPagesPanel projectId={projectId} />
        </div>
      </div>
    </SeoAutomationShell>
  );
}
