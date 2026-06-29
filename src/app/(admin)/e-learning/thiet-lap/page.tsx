"use client";

import React, { useState } from "react";
import { Settings, Save, Shield, Bell, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    systemName: "Hệ thống E-Learning",
    allowRegistration: true,
    requireApproval: false,
    sendEmailNotification: true,
    maxStudentsPerCourse: 100,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thiết lập</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cấu hình các cài đặt chung cho phân hệ đào tạo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Box 1: Cài đặt chung */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xxs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Cấu hình chung</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Tên ứng dụng học tập</label>
              <input
                type="text"
                value={settings.systemName}
                onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Số học viên tối đa / khóa học</label>
              <input
                type="number"
                value={settings.maxStudentsPerCourse}
                onChange={(e) => setSettings({ ...settings, maxStudentsPerCourse: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Box 2: Phân quyền & Đăng ký */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xxs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Đăng ký & Phân quyền</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Cho phép tự đăng ký</span>
                <span className="block text-xs text-gray-500">Người học có thể tự tạo tài khoản tham gia.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => setSettings({ ...settings, allowRegistration: e.target.checked })}
                className="w-10 h-5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none checked:bg-blue-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all checked:after:translate-x-5 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">Yêu cầu xét duyệt</span>
                <span className="block text-xs text-gray-500">Xét duyệt thủ công trước khi kích hoạt tài khoản.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => setSettings({ ...settings, requireApproval: e.target.checked })}
                className="w-10 h-5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none checked:bg-blue-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all checked:after:translate-x-5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Box 3: Thông báo */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl shadow-theme-xxs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Thông báo & Email</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">Gửi email thông báo</span>
              <span className="block text-xs text-gray-500">Gửi mail khi có cập nhật bài học mới hoặc hoạt động từ lớp học.</span>
            </div>
            <input
              type="checkbox"
              checked={settings.sendEmailNotification}
              onChange={(e) => setSettings({ ...settings, sendEmailNotification: e.target.checked })}
              className="w-10 h-5 bg-gray-200 dark:bg-gray-800 rounded-full appearance-none checked:bg-blue-600 relative after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all checked:after:translate-x-5 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button & Toast */}
        <div className="flex items-center justify-between">
          <div>
            {success && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                <CheckCircle className="w-4 h-4" />
                Lưu cấu hình thành công!
              </div>
            )}
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
