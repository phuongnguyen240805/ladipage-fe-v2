"use client";

import React, { useState } from "react";

const settingSections = [
  {
    title: "Tài khoản",
    description: "Quản lý thông tin đăng nhập, bảo mật và phiên làm việc.",
    items: ["Hồ sơ cá nhân", "Đổi mật khẩu", "Xác thực 2 lớp", "Thiết bị đã đăng nhập"],
  },
  {
    title: "Không gian làm việc",
    description: "Thiết lập team, quyền truy cập và thông báo cho workspace.",
    items: ["Thông tin workspace", "Thành viên & phân quyền", "Thông báo hệ thống", "Nhật ký hoạt động"],
  },
  {
    title: "Thanh toán",
    description: "Theo dõi gói dịch vụ, hóa đơn và hạn mức sử dụng.",
    items: ["Gói hiện tại", "Phương thức thanh toán", "Lịch sử hóa đơn", "Giới hạn tài nguyên"],
  },
];

const toggles = [
  { id: "email", label: "Nhận thông báo qua email", enabled: true },
  { id: "browser", label: "Thông báo trên trình duyệt", enabled: true },
  { id: "security", label: "Cảnh báo bảo mật", enabled: true },
  { id: "marketing", label: "Tin tức và ưu đãi", enabled: false },
];

export default function SettingsPage() {
  const [switches, setSwitches] = useState(toggles);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Thiết lập tài khoản, workspace, thanh toán và thông báo.
          </p>
        </div>
        <button className="h-10 rounded-lg bg-lime-500 px-4 text-sm font-bold text-white transition hover:bg-lime-600">
          Lưu thay đổi
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {settingSections.map((section) => (
          <section key={section.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-bold text-gray-900 dark:text-white">{section.title}</h2>
            <p className="mt-1 min-h-[40px] text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
            <div className="mt-5 space-y-2">
              {section.items.map((item) => (
                <button
                  key={item}
                  className="flex h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {item}
                  <span className="text-gray-300">›</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 dark:border-gray-800">
          <h2 className="font-bold text-gray-900 dark:text-white">Thông báo</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Bật tắt các kênh thông báo thường dùng.</p>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {switches.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-4">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
              <button
                type="button"
                onClick={() =>
                  setSwitches((current) =>
                    current.map((toggle) => (toggle.id === item.id ? { ...toggle, enabled: !toggle.enabled } : toggle)),
                  )
                }
                className={`relative h-6 w-11 rounded-full transition ${item.enabled ? "bg-lime-500" : "bg-gray-300 dark:bg-gray-700"}`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${item.enabled ? "left-6" : "left-1"}`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
