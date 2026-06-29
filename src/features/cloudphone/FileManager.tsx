"use client";

import React, { useState } from "react";

// --- Inline SVG Icons equivalent to Tabler Icons ---
function IconFolder(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
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

function IconSettings(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0 -2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0 -1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    </svg>
  );
}

function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
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

interface FileItem {
  name: string;
  type: string;
  size: string;
  updated: string;
}

const initialFiles: FileItem[] = [
  { name: "account-import.csv", type: "CSV", size: "24 KB", updated: "Today" },
  { name: "proxy-list.txt", type: "TXT", size: "8 KB", updated: "Yesterday" },
  { name: "workflow-backup.json", type: "JSON", size: "82 KB", updated: "May 25" }
];

export default function FileManager() {
  const [files, setFiles] = useState<FileItem[]>(initialFiles);

  const handleDelete = (name: string) => {
    setFiles(files.filter((f) => f.name !== name));
  };

  return (
    <div className="p-4 space-y-4 select-none">
      {/* Page Header */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
          <IconFolder className="h-5.5 w-5.5 text-amber-500" />
          <h1 className="text-sm font-extrabold">File Manager</h1>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <IconHome className="h-4.5 w-4.5" />
          <span>/</span>
          <span>Automation</span>
          <span>/</span>
          <span className="text-slate-650 dark:text-slate-350">File Manager</span>
        </div>
      </div>

      {/* Grid DataTable exactly like Flowise */}
      <div className="bg-white dark:bg-[#11121b] border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-slate-50 dark:bg-slate-900/40 p-4 border-b border-gray-150 dark:border-gray-800 text-xs font-black text-slate-850 dark:text-white uppercase tracking-wider">
          <div className="col-span-4">File Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Updated</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          {files.map((file) => (
            <div key={file.name} className="grid grid-cols-12 items-center p-4 text-xs font-semibold text-slate-650 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition">
              <div className="col-span-4 font-bold text-slate-800 dark:text-white truncate pr-4">{file.name}</div>
              <div className="col-span-2">
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-black text-slate-500 uppercase">
                  {file.type}
                </span>
              </div>
              <div className="col-span-2 text-slate-500 dark:text-slate-450">{file.size}</div>
              <div className="col-span-2 text-slate-500 dark:text-slate-450">{file.updated}</div>
              <div className="col-span-2 flex items-center justify-center gap-1">
                <button
                  onClick={() => alert(`Settings for ${file.name}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 transition cursor-pointer active:scale-95"
                  title="Settings"
                >
                  <IconSettings className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => alert(`Refreshing ${file.name}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 transition cursor-pointer active:scale-95"
                  title="Refresh"
                >
                  <IconRefresh className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 transition cursor-pointer active:scale-95"
                  title="Delete"
                >
                  <IconTrash className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}

          {files.length === 0 && (
            <div className="p-8 text-center text-slate-450 font-bold">No files yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
