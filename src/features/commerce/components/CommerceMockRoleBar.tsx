"use client";

import React from "react";

import { useCommerceAccess } from "@/features/commerce/hooks/useCommerceAccess";
import type { CommerceMockRole } from "@/features/commerce/types";

const ROLES: { id: CommerceMockRole; label: string }[] = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "editor", label: "Editor" },
  { id: "viewer", label: "Viewer" },
];

/** Dev bar — chuyển role mock để xem RBAC (M0). */
export function CommerceMockRoleBar() {
  const { role, setRole, permissions, monetizeEnabled, useApi } =
    useCommerceAccess();

  if (useApi) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 mb-4">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Mock role
      </span>
      <div className="flex flex-wrap gap-1">
        {ROLES.map((r) => {
          const active = role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition ${
                active
                  ? "bg-[#e5ecff] text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[220px]">
        {permissions.length} quyền · monetize={String(monetizeEnabled)}
      </span>
    </div>
  );
}
