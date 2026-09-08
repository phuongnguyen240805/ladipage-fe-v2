"use client";

import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

/**
 * Global notifications currently have no real API contract in this frontend.
 * Keep the bell affordance, but never render fixture notifications as if they
 * were live account data. Replace this empty state once a notifications
 * endpoint is available.
 */
export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen((current) => !current);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="dropdown-toggle relative flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-slate-500 outline-none transition-[background-color,color,transform] duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:ring-3 focus-visible:ring-lime-500/15 active:scale-[0.96] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="ladi-popover-enter absolute -right-[240px] mt-3 flex w-[350px] flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900 sm:w-[361px] lg:right-0"
      >
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Thông báo
          </h5>
          <button
            type="button"
            onClick={closeDropdown}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-[background-color,color] duration-150 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Đóng thông báo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-36 flex-col items-center justify-center px-6 py-8 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          </span>
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Chưa có thông báo
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-400 dark:text-slate-500">
            Thông báo mới của tài khoản sẽ xuất hiện tại đây.
          </p>
        </div>
      </Dropdown>
    </div>
  );
}
