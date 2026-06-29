"use client";

import { Bell, BellOff, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown({ href = "/education/dashboard/student/notifications" }: { href?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        title="Thông báo"
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute -right-20 mt-4 w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-3 shadow-xl sm:right-0 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">Thông báo</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            title="Đóng"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="py-5 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
            <BellOff className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Chưa có nguồn thông báo</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Dropdown đã sẵn sàng để nối danh sách thông báo theo tài khoản.
          </p>
        </div>

        <Link
          href={href}
          onClick={() => setIsOpen(false)}
          className="block rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Mở trang thông báo
        </Link>
      </Dropdown>
    </div>
  );
}
