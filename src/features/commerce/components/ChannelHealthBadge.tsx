"use client";

import React from "react";

import type { CommerceStoreLink } from "@/features/commerce/types";

export function ChannelHealthBadge({ storeLink }: { storeLink: CommerceStoreLink }) {
  if (storeLink.status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-lime-50 text-[#65a30d] dark:bg-lime-950/40 dark:text-lime-300 border border-lime-200/80 dark:border-lime-900/50">
        <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
        Gian hàng sẵn sàng
      </span>
    );
  }

  if (storeLink.status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        Đang chuẩn bị…
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      Lỗi kết nối
    </span>
  );
}
