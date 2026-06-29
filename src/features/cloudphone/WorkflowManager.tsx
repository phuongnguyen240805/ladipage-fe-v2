"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// --- Inline SVG Icons equivalent to Tabler Icons ---
function IconPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconTrash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconAdjustmentsHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="14" cy="6" r="2" />
      <path d="M4 6l8 0" />
      <path d="M16 6l4 0" />
      <circle cx="8" cy="12" r="2" />
      <path d="M4 12l2 0" />
      <path d="M10 12l10 0" />
      <circle cx="17" cy="18" r="2" />
      <path d="M4 18l11 0" />
      <path d="M19 18l1 0" />
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

interface Workflow {
  id: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  version: string;
}

const initialWorkflows: Workflow[] = [
  { id: "new-app", name: "New App", description: "sd", updatedAt: "in less than a minute - 25/05/2026", createdAt: "25/05/2026", version: "v1.0.0" },
  { id: "tiktok-warmup", name: "TikTok Warmup", description: "Open app, scroll feed, like by keyword", updatedAt: "25/05/2026", createdAt: "25/05/2026", version: "v1.0.1" }
];

export default function WorkflowManager() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>(initialWorkflows);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "New App", version: "1.0.0", description: "" });

  const addWorkflow = () => {
    const id = draft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `workflow-${Date.now()}`;
    setWorkflows([
      {
        id,
        name: draft.name,
        description: draft.description,
        updatedAt: "in less than a minute - 25/05/2026",
        createdAt: "25/05/2026",
        version: `v${draft.version}`
      },
      ...workflows
    ]);
    setOpen(false);
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(workflows.filter((w) => w.id !== id));
  };

  return (
    <div className="p-4 space-y-4 select-none">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
          <IconAdjustmentsHorizontal className="h-5.5 w-5.5 text-purple-500" />
          <h1 className="text-sm font-extrabold">Workflow Manager</h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <IconHome className="h-4.5 w-4.5" />
          <span>/</span>
          <span>Automation</span>
          <span>/</span>
          <span className="text-slate-650 dark:text-slate-350">Workflow Manager</span>
        </div>
      </div>

      {/* Add Workflow Action */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 px-4.5 py-2.5 text-xs font-extrabold text-white shadow transition cursor-pointer active:scale-95"
      >
        <IconPlus className="h-4.5 w-4.5" />
        <span>Add Workflow</span>
      </button>

      {/* Grid-based DataTable exactly like Flowise */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-gray-150 dark:border-gray-800 text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
          <div className="col-span-1">No</div>
          <div className="col-span-4">Name & Description</div>
          <div className="col-span-2">Updated At</div>
          <div className="col-span-2">Created At</div>
          <div className="col-span-1">Version</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {workflows.map((w, index) => (
            <div key={w.id} className="grid grid-cols-12 items-center p-4 text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
              <div className="col-span-1 font-bold text-slate-400">{index + 1}</div>
              <div className="col-span-4 pr-4">
                <div className="font-extrabold text-slate-800 dark:text-white">{w.name}</div>
                <div className="text-slate-400 dark:text-slate-500 mt-0.5 truncate">{w.description || "No description"}</div>
              </div>
              <div className="col-span-2 text-slate-500 dark:text-slate-450">{w.updatedAt}</div>
              <div className="col-span-2 text-slate-500 dark:text-slate-450">{w.createdAt}</div>
              <div className="col-span-1">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[9px] font-black text-slate-500">
                  {w.version}
                </span>
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => router.push(`/cloudphone/workflow-builder/${w.id}`)}
                    className="rounded-xl bg-amber-500 text-white hover:bg-amber-600 px-3 py-2 text-[10px] font-black leading-none cursor-pointer transition active:scale-95"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => deleteWorkflow(w.id)}
                    className="flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-gray-250 dark:border-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 text-slate-500 transition cursor-pointer active:scale-95"
                  >
                    <IconTrash className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {workflows.length === 0 && (
            <div className="p-8 text-center text-slate-450 font-bold">No workflows yet</div>
          )}
        </div>
      </div>

      {/* Add New Workflow Dialog */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#11121b] border border-gray-200 dark:border-gray-800/80 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-sm font-extrabold text-slate-800 dark:text-white">Add New Workflow</h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition text-slate-500 cursor-pointer"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">App name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Version</label>
                  <input
                    type="text"
                    value={draft.version}
                    onChange={(e) => setDraft({ ...draft, version: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-gray-200 dark:border-gray-800 dark:hover:bg-slate-800 hover:bg-slate-100 px-4.5 py-2.5 text-xs font-extrabold text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={addWorkflow}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-xs font-extrabold text-white shadow transition cursor-pointer active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
