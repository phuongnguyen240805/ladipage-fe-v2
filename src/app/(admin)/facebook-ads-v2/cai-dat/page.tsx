"use client";

import React from "react";
import Settings from "@/components/settings/Settings";
import WorkspaceSettings from "@/components/workspace-settings/WorkspaceSettings";

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <WorkspaceSettings />
      <Settings />
    </div>
  );
}
