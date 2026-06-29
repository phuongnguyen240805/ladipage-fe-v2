"use client";

import React, { useState } from "react";

// --- Inline SVG Icons equivalent to Tabler Icons ---
function IconApps(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
      <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
    </svg>
  );
}

const workflows = [
  { name: "TikTok Warmup Rotation", description: "Open app, scroll feed, like by keyword, rotate proxy", version: "1.0.4" },
  { name: "Facebook Account Care", description: "Check session, clear cache, post schedule, sync report", version: "2.1.0" },
  { name: "Roblox Gift Campaign", description: "Launch cloud phone, claim code, screenshot proof", version: "0.9.8" }
];

export default function WorkflowStore() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);

  const handleInstall = (name: string) => {
    setInstalling(name);
    setTimeout(() => {
      setInstalling(null);
      setInstalled((prev) => [...prev, name]);
      alert(`Installed workflow: ${name}`);
    }, 1200);
  };

  return (
    <div className="p-4 space-y-4 select-none">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
          <IconApps className="h-5.5 w-5.5 text-sky-500" />
          <h1 className="text-sm font-extrabold">Workflow Store</h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <IconHome className="h-4.5 w-4.5" />
          <span>/</span>
          <span>Automation</span>
          <span>/</span>
          <span className="text-slate-650 dark:text-slate-350">Workflow Store</span>
        </div>
      </div>

      {/* Grid of Workflows exactly like Flowise */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {workflows.map((workflow) => {
          const isInstalled = installed.includes(workflow.name);
          const isInstalling = installing === workflow.name;

          return (
            <div key={workflow.name} className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[200px]">
              <div className="space-y-3.5">
                <IconApps className="h-7 w-7 text-[#0ea5e9]" />
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">{workflow.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{workflow.description}</p>
                <div className="flex items-center gap-1.5">
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase">
                    v{workflow.version}
                  </span>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-500 dark:bg-emerald-950/20 uppercase">
                    Ready to install
                  </span>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => handleInstall(workflow.name)}
                  disabled={isInstalling || isInstalled}
                  className={`w-full py-2 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 leading-none ${
                    isInstalled
                      ? "bg-emerald-500 text-white cursor-default"
                      : isInstalling
                        ? "bg-slate-200 dark:bg-slate-800 text-slate-450"
                        : "bg-amber-500 hover:bg-amber-600 text-white shadow"
                  }`}
                >
                  {isInstalled ? "Installed" : isInstalling ? "Installing..." : "Install workflow"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
