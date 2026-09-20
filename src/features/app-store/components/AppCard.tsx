import React from "react";
import { App3DIcon } from "@/components/navigation/App3DIcon";
import type { AppItem } from "../types";
import { app3dIconByCatalogName } from "../utils/app-3d-icon";

interface AppCardProps {
  app: AppItem;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onOpen: (id: string) => void;
  onDetails: (id: string) => void;
}

export default function AppCard({ app, onInstall, onUninstall, onOpen, onDetails }: AppCardProps) {
  const isInstalled = app.status === "INSTALLED";
  const isUpcoming = app.upcoming === true || app.category === "upcoming";

  return (
    <div className="bg-white dark:bg-[#11121e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-theme-xs flex flex-col justify-between hover:shadow-theme-md transition-all duration-200 relative group">
      {/* Pin Icon on Top Right */}
      {app.isPinned && (
        <span className="absolute top-4 right-4 text-orange-500 text-sm cursor-help" title="Ứng dụng đã ghim">
          <svg className="w-4 h-4 fill-current rotate-45" viewBox="0 0 20 20">
            <path d="M12.9 2.1c-.2-.2-.5-.3-.8-.3-.3 0-.6.1-.8.3L9.6 3.8 6.4.6C6-.2 4.8-.2 4 .6l-.3.3c-.8.8-.8 2 0 2.8l3.2 3.2-1.7 1.7c-.5-.2-1.1-.1-1.5.3L2 10.6c-.4.4-.4 1.1 0 1.5l1.6 1.6-3 3c-.4.4-.4 1.1 0 1.5.2.2.5.3.8.3s.6-.1.8-.3l3-3 1.6 1.6c.2.2.5.3.8.3.3 0 .6-.1.8-.3l1.8-1.8c.4-.4.5-1 .3-1.5l1.7-1.7 3.2 3.2c.4.4 1 .4 1.4 0l.3-.3c.8-.8.8-2 0-2.8l-3.2-3.2 1.7-1.7c.2.2.5.3.8.3.3 0 .6-.1.8-.3.4-.4.4-1.1 0-1.5z" />
          </svg>
        </span>
      )}

      {/* Top Section */}
      <div>
        <div className="flex items-start gap-4.5 mb-3.5 text-left">
          <App3DIcon name={app3dIconByCatalogName[app.iconName]} className="h-12 w-12 shrink-0" />
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-snug truncate">
              {app.name}
            </h4>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`ladi-status-badge inline-flex items-center px-2 py-0.5 rounded-md ${
                isInstalled 
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-150 dark:border-green-900/30" 
                  : "bg-brand-50 text-kedi-navy dark:bg-kedi-yellow/10 dark:text-kedi-yellow border border-kedi-yellow/30 dark:border-kedi-yellow/30"
              }`}>
                {isInstalled ? "Đã cài đặt" : app.price}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Description */}
        <p className="text-xs text-gray-400 dark:text-gray-400 text-left line-clamp-3 mb-5 min-h-[54px] leading-relaxed">
          {app.description}
        </p>
      </div>

      {/* Bottom Section - Action Buttons */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-1 select-none">
        {/* Left Stats/Tags */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
          {app.downloads ? (
            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>{app.downloads}</span>
            </div>
          ) : app.tags && app.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {app.tags.map((tag, i) => (
                <span key={i} className="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-[9px] italic opacity-60">Marketing</span>
          )}
        </div>

        {/* Right Buttons */}
        <div className="flex items-center justify-end gap-1.5 flex-shrink-0 flex-wrap">
          <button 
            type="button"
            onClick={() => onDetails(app.id)}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
          >
            Chi tiết
          </button>

          {isInstalled ? (
            <>
              <button
                type="button"
                onClick={() => onOpen(app.id)}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Mở app
              </button>
              <button
                type="button"
                onClick={() => onUninstall(app.id)}
                className="px-3 py-1.5 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-950/35 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Gỡ
              </button>
            </>
          ) : isUpcoming ? (
            <span className="px-3 py-1.5 text-xs font-bold text-gray-400 dark:text-gray-500">
              Sắp ra mắt
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onInstall(app.id)}
              className="px-3 py-1.5 bg-kedi-yellow hover:bg-kedi-yellow text-kedi-navy text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
            >
              + Cài đặt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
