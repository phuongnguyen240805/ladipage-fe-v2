"use client";

import React from "react";
import { CloudPhoneDashboardProps } from "./dashboard/types";
import StoreView from "./dashboard/StoreView";
import DevicesFarmView from "./dashboard/DevicesFarmView";
import SyncView from "./dashboard/SyncView";

export default function CloudPhoneDashboard({ view }: CloudPhoneDashboardProps) {
  return (
    <div className="min-h-full bg-[#f8fafc] p-5 text-slate-800 dark:bg-[#0c0d14] dark:text-slate-200 md:p-6">
      {view === "store" && <StoreView />}
      {view === "devices" && <DevicesFarmView />}
      {view === "sync" && <SyncView />}
    </div>
  );
}
