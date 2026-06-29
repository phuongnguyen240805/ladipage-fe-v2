'use client';

import React, { useState } from 'react';
import { ShieldCheck, Key, Menu, Users, RefreshCw } from 'lucide-react';
import { RolesTab } from '@/features/education/components/rbac/roles-tab';
import { PermissionsTab } from '@/features/education/components/rbac/permissions-tab';
import { MenusTab } from '@/features/education/components/rbac/menus-tab';
import { UsersTab } from '@/features/education/components/rbac/users-tab';

type TabId = 'roles' | 'permissions' | 'menus' | 'users';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const TABS: TabConfig[] = [
  { id: 'roles',       label: 'Vai trò',         icon: <ShieldCheck size={16} />, description: 'Quản lý các vai trò trong hệ thống' },
  { id: 'permissions', label: 'Quyền hạn',        icon: <Key size={16} />,         description: 'Quản lý quyền truy cập và API endpoints' },
  { id: 'menus',       label: 'Menu',             icon: <Menu size={16} />,        description: 'Cấu hình menu điều hướng theo quyền' },
  { id: 'users',       label: 'Quản lý User',     icon: <Users size={16} />,       description: 'Quản lý người dùng và gán vai trò' },
];

export default function RBACPage() {
  const [activeTab, setActiveTab] = useState<TabId>('roles');
  const [refreshKey, setRefreshKey] = useState(0);
  const [usersSearchPayload, setUsersSearchPayload] = useState<string>('');

  const activeConfig = TABS.find(t => t.id === activeTab)!;

  const handleNavigateToUsers = (roleCode: string) => {
    setUsersSearchPayload(`role:${roleCode}`);
    setActiveTab('users');
  };

  return (
    <div className="space-y-5 max-w-[1240px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản trị Phân quyền (RBAC)</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11.5">
            {activeConfig.description}
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1.5 bg-gray-100 dark:bg-gray-800/60 rounded-2xl w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-900/50'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-emerald-600' : ''}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={`${activeTab}-${refreshKey}`}>
        {activeTab === 'roles'       && <RolesTab onNavigateToUsers={handleNavigateToUsers} />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'menus'       && <MenusTab />}
        {activeTab === 'users'       && <UsersTab initialSearch={usersSearchPayload} />}
      </div>
    </div>
  );
}
