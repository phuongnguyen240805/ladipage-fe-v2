"use client";

import React, { useState } from "react";

const workspaceItems = [
  "Thông tin workspace",
  "Thành viên & phân quyền",
  "Thông báo hệ thống",
  "Nhật ký hoạt động",
];

const notificationToggles = [
  { id: "system-error", label: "Thông báo lỗi hệ thống", enabled: true },
  { id: "activity", label: "Thông báo hoạt động", enabled: true },
  { id: "email", label: "Nhận thông báo qua email", enabled: true },
  { id: "browser", label: "Thông báo trên trình duyệt", enabled: false },
];

export default function WorkspaceSettings() {
  const [toggles, setToggles] = useState(notificationToggles);

  return (
    <div className="flex w-full flex-col gap-5 text-gray-800 dark:text-gray-200">
      <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-[#11121e] md:p-8">
        <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 dark:border-gray-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Không gian làm việc
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Thiết lập team, quyền truy cập và thông báo cho workspace.
            </p>
          </div>
          <button
            type="button"
            className="h-10 rounded-lg bg-lime-500 px-4 text-sm font-bold text-white transition hover:bg-lime-600"
          >
            Lưu thay đổi
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {workspaceItems.map((item) => (
            <button
              key={item}
              type="button"
              className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {item}
              <span className="text-gray-300">›</span>
            </button>
          ))}
        </div>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Thông báo workspace</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bật tắt các kênh thông báo liên quan đến workspace.
            </p>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {toggles.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setToggles((current) =>
                      current.map((toggle) =>
                        toggle.id === item.id
                          ? { ...toggle, enabled: !toggle.enabled }
                          : toggle
                      )
                    )
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    item.enabled ? "bg-lime-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      item.enabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}