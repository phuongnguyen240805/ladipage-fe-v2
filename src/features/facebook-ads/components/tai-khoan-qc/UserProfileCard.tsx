"use client";

import Image from "next/image";
import React from "react";
import { useAuthStore } from "@/features/auth/stores/auth.store";

function getInitials(name?: string) {
  if (!name) return "FB";

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function UserProfileCard() {
  const profile = useAuthStore((state) => state.profile);
  const uid = useAuthStore((state) => state.uid);
  const displayName = profile?.name || "Chưa đồng bộ Facebook";
  const displayUid = profile?.uid || uid || "-";
  const initials = getInitials(displayName);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 rounded-xl border border-gray-150 bg-gray-50 px-3 py-1.5 select-none dark:border-gray-800 dark:bg-gray-900">
        <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
          {profile?.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={displayName} width={32} height={32} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-lime-50 text-sm font-bold text-lime-600 dark:bg-lime-900/50 dark:text-lime-300">
              {initials}
            </span>
          )}
        </span>
        <div className="flex min-w-0 flex-col text-left">
          <span className="max-w-[150px] truncate text-xs font-bold leading-tight text-gray-800 dark:text-white">
            {displayName}
          </span>
          <span className="max-w-[150px] truncate text-[10px] text-gray-400">UID: {displayUid}</span>
        </div>
      </div>
    </div>
  );
}
